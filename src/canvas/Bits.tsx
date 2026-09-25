import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { actions, getAt, useStore } from '../store'
import { Ph_ } from '../ui/Phosphor'

/* Every section renders inside this so the little editable primitives
   below know which section + props they belong to. */
interface SectionCtxValue {
  id: string
  props: Record<string, any>
  editing: boolean
  /** False for a thumbnail rendered inside another clickable element — a
      layout card, a template preview. These never get real interactive
      children (a <button>, a click handler), since nesting interactive
      content is invalid HTML and breaks the outer element's own click.
      Defaults to true so ordinary canvas rendering is unaffected. */
  interactive?: boolean
}
const SectionCtx = createContext<SectionCtxValue>({ id: '', props: {}, editing: false, interactive: true })
export const SectionProvider = SectionCtx.Provider
export const useSection = () => useContext(SectionCtx)

function useSelected(path: string) {
  const { id } = useSection()
  return useStore((s) => s.selection?.sectionId === id && s.selection?.path === path)
}

/**
 * Bring a selected element into view. This is what makes selection work in
 * both directions: clicking a field in the panel outlines its element here and
 * scrolls to it, exactly as clicking here focuses the field there.
 * `block: 'nearest'` is a no-op when the element is already visible, so a
 * canvas-originated click never jumps the page.
 */
function useRevealOnSelect(selected: boolean, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!selected) return
    ref.current?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [selected, ref])
}

/* -------------------------------------------------------------- text */

type EdProps = {
  path: string
  as?: any
  className?: string
  multiline?: boolean
  style?: React.CSSProperties
}

/**
 * A run of text on the canvas.
 *  - click        -> selects it and focuses the matching field in the inspector
 *  - click again  -> edits it in place
 *  - Esc / blur   -> commits
 * The DOM text is written imperatively so React never fights contenteditable.
 */
export function Ed({ path, as: Tag = 'span', className = '', multiline = false, style }: EdProps) {
  const { id, props, editing, interactive = true } = useSection()
  const selected = useSelected(path)
  const value = String(getAt(props, path) ?? '')
  const ref = useRef<HTMLElement | null>(null)
  const [live, setLive] = useState(false)
  useRevealOnSelect(selected, ref)
  // A non-interactive thumbnail can't render a real <button> — it would nest
  // inside the card that's already clickable. Everything else (h1, p, div…)
  // is unaffected, since only <button> is invalid as descendant content.
  const RenderTag = !interactive && Tag === 'button' ? 'span' : Tag

  useEffect(() => {
    const el = ref.current
    if (el && !live && el.textContent !== value) el.textContent = value
  }, [value, live])

  useEffect(() => {
    if (!editing && live) setLive(false)
  }, [editing, live])

  // The element only becomes focusable once React has committed
  // contentEditable="true", so grabbing focus has to wait for that commit —
  // doing it inside the click handler is too early and silently no-ops.
  useEffect(() => {
    if (!live) return
    const el = ref.current
    if (!el) return
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, [live])

  const startInline = () => {
    // The inspector auto-focuses its matching input on selection; hand focus
    // over deliberately so the two editors never fight for the keystrokes.
    ;(document.activeElement as HTMLElement | null)?.blur()
    setLive(true)
  }

  const commit = () => {
    const el = ref.current
    if (!el || !live) return
    const next = (el.textContent ?? '').replace(/ /g, ' ')
    setLive(false)
    if (next !== value) actions.setProp(id, path, next)
  }

  if (!editing) {
    return (
      <RenderTag className={className} style={style}>
        {value}
      </RenderTag>
    )
  }

  return (
    <RenderTag
      ref={ref as any}
      data-editor-path={path}
      className={`editable ${className} ${selected ? 'sel' : ''}`}
      style={{ whiteSpace: multiline ? 'pre-wrap' : undefined, ...style }}
      contentEditable={live}
      suppressContentEditableWarning
      spellCheck={live}
      onMouseDown={(e: React.MouseEvent) => {
        if (live) return
        // Suppressing the default keeps the caret out of text that isn't in
        // edit mode yet — but we still have to blur whatever *is* being
        // edited, or its change never commits.
        const active = document.activeElement as HTMLElement | null
        if (active?.isContentEditable) active.blur()
        e.preventDefault()
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation()
        if (!live) actions.select({ sectionId: id, path })
      }}
      onDoubleClick={(e: React.MouseEvent) => {
        e.stopPropagation()
        if (!live) startInline()
      }}
      onBlur={commit}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (!live) return
        e.stopPropagation()
        if (e.key === 'Escape') {
          if (ref.current) ref.current.textContent = value
          setLive(false)
          ;(ref.current as HTMLElement | null)?.blur()
        }
        if (e.key === 'Enter' && !multiline) {
          e.preventDefault()
          ;(ref.current as HTMLElement | null)?.blur()
        }
      }}
    />
  )
}

/* ------------------------------------------------------------ pickable */

/** Any non-text element that should open its field in the inspector on click. */
export function Pick({
  path,
  as: Tag = 'div',
  className = '',
  children,
  style,
  ...rest
}: {
  path: string
  as?: any
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
  [k: string]: any
}) {
  const { id, editing } = useSection()
  const selected = useSelected(path)
  const ref = useRef<HTMLElement | null>(null)
  useRevealOnSelect(selected, ref)
  if (!editing) {
    return (
      <Tag className={className} style={style} {...rest}>
        {children}
      </Tag>
    )
  }
  return (
    <Tag
      ref={ref as any}
      data-editor-path={path}
      className={`pickable ${className} ${selected ? 'sel' : ''}`}
      style={style}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        actions.select({ sectionId: id, path })
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/* --------------------------------------------------------------- image */

export function Img({
  path,
  className = '',
  label = 'Image',
}: {
  path: string
  className?: string
  label?: string
}) {
  const { props } = useSection()
  const src = getAt(props, path) as string | undefined
  return (
    <Pick path={path} className={`media ${className}`}>
      {src ? (
        <img src={src} alt="" />
      ) : (
        <div className="media-ph">
          <Ph_ name="Image" size={22} />
          <span>{label}</span>
        </div>
      )}
    </Pick>
  )
}

export function Avatar({ path, name = '' }: { path: string; name?: string }) {
  const { props } = useSection()
  const src = getAt(props, path) as string | undefined
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <Pick path={path} className="avatar">
      {src ? <img src={src} alt="" /> : <span>{initials || '—'}</span>}
    </Pick>
  )
}

/* ---------------------------------------------------------------- icon */

export function Ico({
  path,
  size = 18,
  className = '',
  wrapper,
  weight = 'regular',
}: {
  path: string
  size?: number
  className?: string
  wrapper?: string
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
}) {
  const { props } = useSection()
  const name = getAt(props, path) as string | undefined
  return (
    <Pick path={path} className={wrapper ?? className}>
      <Ph_ name={name} size={size} weight={weight} />
    </Pick>
  )
}

/* -------------------------------------------------------------- button */

export function Btn({
  path,
  kind = 'primary',
  size,
}: {
  path: string
  kind?: 'primary' | 'ghost' | 'link'
  size?: 'sm'
}) {
  const cls = ['btn', `btn-${kind}`, size === 'sm' ? 'btn-sm' : ''].filter(Boolean).join(' ')
  return <Ed path={path} as="button" className={cls} />
}
