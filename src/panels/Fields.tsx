import { useEffect, useMemo, useRef, useState } from 'react'
import type { Field } from '../types'
import { actions, getAt, useStore } from '../store'
import type { Section } from '../types'
import { Icon } from '../ui/Icon'
import { ICON_SUGGESTIONS, PHOSPHOR_NAMES, Ph_ } from '../ui/Phosphor'

/** Sections live under nav, footer, or any page body — look in all three. */
function findSection(s: any, id: string): Section | undefined {
  if (s.doc.nav.id === id) return s.doc.nav
  if (s.doc.footer.id === id) return s.doc.footer
  for (const pid of s.doc.pageOrder) {
    const hit = s.doc.pages[pid].body.find((x: Section) => x.id === id)
    if (hit) return hit
  }
  return undefined
}

/* ------------------------------------------------------------ wrappers */

/**
 * Wraps one control so that selecting the matching element on the canvas
 * scrolls this field into view, flashes it and focuses it.
 */
function FieldShell({
  sectionId,
  path,
  label,
  children,
  autofocusable = true,
}: {
  sectionId?: string
  path?: string
  label?: string
  children: React.ReactNode
  autofocusable?: boolean
}) {
  const active = useStore((s) => (
    path ? s.selection?.sectionId === sectionId && s.selection?.path === path : false
  ))
  const inspectN = useStore((s) => (
    path && s.inspect?.id === sectionId && s.inspect?.path === path ? s.inspect?.n ?? 0 : 0
  ))
  const ref = useRef<HTMLDivElement>(null)

  /**
   * The mirror of canvas -> panel: touching a control here selects the element
   * it drives, so the canvas outlines it and scrolls it into view. A reveal
   * request is emitted every time, including when the field is already active.
   */
  const selectOnTouch = () => {
    if (!sectionId || !path) return
    // Destination fields are configuration for a visible control rather than
    // visible nodes of their own. Keep the destination input selected while
    // revealing the related button/link on the canvas.
    const targetPath = path.replace(/(?:Href|Link|Url)$/i, '') || path
    actions.revealElement(sectionId, path, targetPath)
  }

  useEffect(() => {
    if (!active || !ref.current) return
    const frame = window.requestAnimationFrame(() => {
      const field = ref.current
      if (!field) return
      // Focus without the browser's own nearest-edge scroll, otherwise it
      // cancels the centered inspector motion below.
      const editingOnCanvas = (document.activeElement as HTMLElement | null)?.isContentEditable
      if (autofocusable && !editingOnCanvas) {
        const el = field.querySelector('input, textarea') as HTMLInputElement | null
        if (el && el.type !== 'file' && el.type !== 'color') {
          el.focus({ preventScroll: true })
          el.select?.()
        }
      }

      const scroller = field.closest<HTMLElement>('.panel-scroll')
      if (scroller) {
        const fieldRect = field.getBoundingClientRect()
        const scrollerRect = scroller.getBoundingClientRect()
        const centered = scroller.scrollTop
          + fieldRect.top - scrollerRect.top
          - (scroller.clientHeight - fieldRect.height) / 2
        scroller.scrollTo({ top: Math.max(0, centered), behavior: 'smooth' })
      } else {
        field.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [active, autofocusable, inspectN])

  return (
    <div
      className={`field-ui ${active ? 'flash' : ''}`}
      ref={ref}
      data-path={path}
      onFocusCapture={selectOnTouch}
      onPointerDown={selectOnTouch}
    >
      {label && <label>{label}</label>}
      {children}
    </div>
  )
}

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`switch ${on ? 'on' : ''}`}
      onClick={onToggle}
    >
      <span />
    </button>
  )
}

/* ------------------------------------------------------------- controls */

function TextControl({
  sectionId, path, label, multiline, placeholder,
}: { sectionId: string; path: string; label: string; multiline?: boolean; placeholder?: string }) {
  const value = useStore((s) => String(getAt(findSection(s, sectionId)?.props ?? {}, path) ?? ''))
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <FieldShell sectionId={sectionId} path={path} label={label}>
      <Tag
        className="control"
        value={value}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
        onChange={(e: any) => actions.setProp(sectionId, path, e.target.value)}
      />
    </FieldShell>
  )
}

/**
 * A plain switch, or — when it governs other fields — the head of a card that
 * holds them, so it's obvious which inputs the switch turns on and off.
 */
function ToggleControl({
  sectionId, field, path, prefix,
}: { sectionId: string; field: Extract<Field, { kind: 'toggle' }>; path: string; prefix: string }) {
  const value = useStore((s) => Boolean(getAt(findSection(s, sectionId)?.props ?? {}, path)))
  const flip = () => actions.setProp(sectionId, path, !value)

  if (!field.children?.length) {
    return (
      <FieldShell sectionId={sectionId} path={path} autofocusable={false}>
        <div className="ftoggle">
          <span className="ftoggle-label">{field.label}</span>
          <Switch on={value} onToggle={flip} label={field.label} />
        </div>
      </FieldShell>
    )
  }

  return (
    <div
      className={`fgroup ${value ? 'on' : 'off'}`}
      data-path={path}
    >
      <div
        className="fgroup-head"
        onPointerDown={() => actions.revealElement(sectionId, path)}
      >
        <span className="fgroup-title">{field.label}</span>
        <Switch on={value} onToggle={flip} label={field.label} />
      </div>
      {value && (
        <div className="fgroup-body">
          <FieldList sectionId={sectionId} fields={field.children} prefix={prefix} />
        </div>
      )}
    </div>
  )
}

/** Fields that belong together — a button's label and its link. */
function GroupControl({
  sectionId, field, prefix,
}: { sectionId: string; field: Extract<Field, { kind: 'group' }>; prefix: string }) {
  const first = firstFieldPath(field.children, prefix)
  return (
    <div className="fgroup on">
      <div
        className="fgroup-head"
        onPointerDown={() => first && actions.revealElement(sectionId, first)}
      >
        <span className="fgroup-title">{field.label}</span>
      </div>
      <div className="fgroup-body">
        <FieldList sectionId={sectionId} fields={field.children} prefix={prefix} />
      </div>
    </div>
  )
}

/** First concrete path represented by a group heading. */
function firstFieldPath(fields: Field[], prefix = ''): string | undefined {
  for (const field of fields) {
    if (field.kind === 'divider') continue
    if (field.kind === 'group') {
      const nested = firstFieldPath(field.children, prefix)
      if (nested) return nested
      continue
    }
    return prefix + field.path
  }
  return undefined
}

function IconControl({
  sectionId, path, label,
}: { sectionId: string; path: string; label: string }) {
  const value = useStore((s) => String(getAt(findSection(s, sectionId)?.props ?? {}, path) ?? ''))
  const [query, setQuery] = useState('')

  // Phosphor ships ~1500 icons; render the whole set only as far as a search
  // narrows it, otherwise a curated starting shelf.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ICON_SUGGESTIONS
    return PHOSPHOR_NAMES.filter((n) => n.toLowerCase().includes(q)).slice(0, 120)
  }, [query])

  return (
    <FieldShell sectionId={sectionId} path={path} label={label} autofocusable={false}>
      <div className="icon-field">
        <div className="input-area">
          <Ph_ name="MagnifyingGlass" size={14} />
          <input
            placeholder={`Search ${PHOSPHOR_NAMES.length} icons`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="icon-current-preview" title={value}><Ph_ name={value} size={16} /></span>
        </div>
        <div className="icon-grid">
          {results.map((name) => (
            <button
              key={name}
              title={name}
              className={`icon-cell ${value === name ? 'on' : ''}`}
              onClick={() => actions.setProp(sectionId, path, name)}
            >
              <Ph_ name={name} size={16} />
            </button>
          ))}
        </div>
        {query && results.length === 0 && <div className="hint">No icon matches “{query}”.</div>}
      </div>
    </FieldShell>
  )
}

function ImageControl({
  sectionId, path, label,
}: { sectionId: string; path: string; label: string }) {
  const value = useStore((s) => String(getAt(findSection(s, sectionId)?.props ?? {}, path) ?? ''))
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')

  const onFile = (file?: File) => {
    if (!file) return
    setName(file.name)
    const reader = new FileReader()
    reader.onload = () => actions.setProp(sectionId, path, String(reader.result))
    reader.readAsDataURL(file)
  }

  return (
    <FieldShell sectionId={sectionId} path={path} label={label} autofocusable={false}>
      <div className="img-row">
        <span
          className="img-thumb"
          style={value ? { backgroundImage: `url("${value.replace(/"/g, '\\"')}")` } : undefined}
        >
          {!value && <Ph_ name="Image" size={16} />}
        </span>
        <span className="img-meta">
          <b>{value ? name || 'Uploaded image' : 'No image'}</b>
          <span>PNG, JPG or SVG</span>
        </span>
        <button className="btn-ui outline" onClick={() => fileRef.current?.click()}>
          {value ? 'Replace' : 'Upload'}
        </button>
        {value && (
          <button
            className="btn-ui icon"
            title="Remove image"
            onClick={() => {
              setName('')
              actions.setProp(sectionId, path, '')
            }}
          >
            <Ph_ name="Trash" size={14} />
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            onFile(e.target.files?.[0] ?? undefined)
            e.target.value = ''
          }}
        />
      </div>
    </FieldShell>
  )
}

function SelectControl({
  sectionId, path, label, options,
}: { sectionId: string; path: string; label: string; options: { value: string; label: string }[] }) {
  const value = useStore((s) => String(getAt(findSection(s, sectionId)?.props ?? {}, path) ?? ''))
  return (
    <FieldShell sectionId={sectionId} path={path} label={label} autofocusable={false}>
      <select className="control" value={value} onChange={(e) => actions.setProp(sectionId, path, e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FieldShell>
  )
}

/* ------------------------------------------------------------- the list */

type Drag = { from: number | null; over: number | null }

function ListControl({
  sectionId, field, path,
}: { sectionId: string; field: Extract<Field, { kind: 'list' }>; path: string }) {
  const items = useStore((s) => (getAt(findSection(s, sectionId)?.props ?? {}, path) as any[]) ?? [])
  const selPath = useStore((s) => s.selection?.path)
  const inspectN = useStore((s) => (
    s.inspect?.id === sectionId && s.inspect?.path.startsWith(`${path}[`) ? s.inspect?.n ?? 0 : 0
  ))
  const [open, setOpen] = useState<number | null>(null)
  const [menu, setMenu] = useState(false)
  // Rows only become draggable while the handle is held, so text inside an
  // open row can still be selected with the mouse.
  const [armed, setArmed] = useState<number | null>(null)
  const [drag, setDrag] = useState<Drag>({ from: null, over: null })

  // If the user clicked an element on the canvas that lives inside one of
  // these rows, open that row so the field is actually reachable.
  useEffect(() => {
    if (!selPath || !selPath.startsWith(`${path}[`)) return
    const m = selPath.slice(path.length).match(/^\[(\d+)\]/)
    if (m) setOpen(Number(m[1]))
  }, [selPath, path, inspectN])

  const atMax = field.max !== undefined && items.length >= field.max
  const endDrag = () => {
    setDrag({ from: null, over: null })
    setArmed(null)
  }

  return (
    <div className="field-ui">
      <div
        className="row-between"
        onClick={() => {
          const first = items.length ? `${path}[0].${field.itemTitle}` : undefined
          actions.revealElement(sectionId, first)
        }}
      >
        <label>{field.label}</label>
        <span className="hint">{items.length}</span>
      </div>

      <div className="list">
        {items.map((item, i) => {
          const isOpen = open === i
          const title = String(item?.[field.itemTitle] ?? '') || `Item ${i + 1}`
          const dropping = drag.from !== null && drag.over === i && drag.from !== i
          const cls = [
            'list-item',
            drag.from === i ? 'dragging' : '',
            dropping ? (drag.from! < i ? 'drop-after' : 'drop-before') : '',
          ].filter(Boolean).join(' ')
          return (
            <div
              className={cls}
              key={i}
              draggable={armed === i}
              onDragStart={(e) => {
                e.stopPropagation()
                e.dataTransfer.effectAllowed = 'move'
                setDrag({ from: i, over: i })
              }}
              onDragOver={(e) => {
                if (drag.from === null) return
                e.preventDefault()
                e.stopPropagation()
                if (drag.over !== i) setDrag((d) => ({ ...d, over: i }))
              }}
              onDrop={(e) => {
                if (drag.from === null) return
                e.preventDefault()
                e.stopPropagation()
                if (drag.from !== i) {
                  actions.reorderListItem(sectionId, path, drag.from, i)
                  setOpen((o) => (o === drag.from ? i : o))
                }
                endDrag()
              }}
              onDragEnd={endDrag}
            >
              <div
                className="list-head"
                onClick={() => {
                  actions.revealElement(sectionId, `${path}[${i}].${field.itemTitle}`)
                  setOpen(isOpen ? null : i)
                }}
              >
                <span
                  className="list-handle"
                  title="Drag to reorder"
                  onMouseDown={() => setArmed(i)}
                  onMouseUp={() => setArmed(null)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Ph_ name="DotsSixVertical" size={14} weight="bold" />
                </span>
                <span className="list-head-title">{title}</span>
                <div className="list-tools" onClick={(e) => e.stopPropagation()}>
                  <button title="Duplicate" onClick={() => actions.duplicateListItem(sectionId, path, i)}>
                    <Icon name="copy" size={12} />
                  </button>
                  <button title="Remove" onClick={() => actions.removeListItem(sectionId, path, i)}>
                    <Icon name="trash" size={12} />
                  </button>
                  <button title={isOpen ? 'Collapse' : 'Expand'} onClick={() => setOpen(isOpen ? null : i)}>
                    <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={13} />
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="list-body">
                  <FieldList sectionId={sectionId} fields={field.itemFields} prefix={`${path}[${i}].`} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lists with premade options (auth providers, form fields) open a
          menu instead of dropping in a blank row. */}
      {field.presets?.length ? (
        <div className="preset-menu-wrap">
          <button
            className="add-btn"
            disabled={atMax}
            style={atMax ? { opacity: 0.4, cursor: 'default' } : undefined}
            onClick={() => setMenu((v) => !v)}
          >
            <Icon name="plus" size={13} /> {field.addLabel ?? 'Add item'}
            <Icon name={menu ? 'chevronUp' : 'chevronDown'} size={12} />
          </button>
          {menu && !atMax && (
            <div className="preset-menu">
              {field.presets.map((preset) => (
                <button
                  key={preset.label}
                  className="preset-row"
                  onClick={() => {
                    actions.addListItem(sectionId, path, preset.make())
                    setOpen(items.length)
                    setMenu(false)
                    actions.revealElement(sectionId, `${path}[${items.length}].${field.itemTitle}`)
                  }}
                >
                  <span className="preset-row-label">{preset.label}</span>
                  {preset.hint && <span className="preset-row-hint">{preset.hint}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          className="add-btn"
          disabled={atMax}
          style={atMax ? { opacity: 0.4, cursor: 'default' } : undefined}
          onClick={() => {
            if (atMax) return
            actions.addListItem(sectionId, path, field.template())
            setOpen(items.length)
            actions.revealElement(sectionId, `${path}[${items.length}].${field.itemTitle}`)
          }}
        >
          <Icon name="plus" size={13} /> {field.addLabel ?? 'Add item'}
        </button>
      )}
    </div>
  )
}

/* --------------------------------------------------------------- entry */

export function FieldList({
  sectionId,
  fields,
  prefix = '',
}: {
  sectionId: string
  fields: Field[]
  prefix?: string
}) {
  return (
    <>
      {fields.map((f, i) => {
        if (f.kind === 'divider') {
          return <div key={i} className="field-subhead">{f.label}</div>
        }
        if (f.kind === 'group') {
          return <GroupControl key={`group-${i}`} sectionId={sectionId} field={f} prefix={prefix} />
        }
        const path = prefix + f.path
        switch (f.kind) {
          case 'text':
            return <TextControl key={path} sectionId={sectionId} path={path} label={f.label} multiline={f.multiline} placeholder={f.placeholder} />
          case 'toggle':
            return <ToggleControl key={path} sectionId={sectionId} field={f} path={path} prefix={prefix} />
          case 'icon':
            return <IconControl key={path} sectionId={sectionId} path={path} label={f.label} />
          case 'image':
            return <ImageControl key={path} sectionId={sectionId} path={path} label={f.label} />
          case 'select':
            return <SelectControl key={path} sectionId={sectionId} path={path} label={f.label} options={f.options} />
          case 'list':
            return <ListControl key={path} sectionId={sectionId} field={f} path={path} />
          default:
            return null
        }
      })}
    </>
  )
}
