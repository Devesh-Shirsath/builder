import { useEffect, useMemo, useRef, useState } from 'react'
import { actions, currentPage, useStore } from '../store'
import type { Section, SectionType } from '../types'
import { REGISTRY } from '../registry'
import { SectionBody } from '../sections/render'
import { SectionProvider } from './Bits'
import { Icon } from '../ui/Icon'
import { Ph_ } from '../ui/Phosphor'
import { SECTION_DND } from './dnd'

const WIDTHS = { compact: 960, default: 1120, wide: 1280 }

/* ------------------------------------------------------- section shell */

function SectionTag({
  section,
  pinned,
  index,
  count,
}: {
  section: Section
  pinned: boolean
  index: number
  count: number
}) {
  const def = REGISTRY[section.type]
  const variant = def.variants.find((v) => v.id === section.variant)
  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <div className={`sec-tag ${pinned ? 'inside' : ''}`} onClick={stop}>
      <span className="sec-tag-name">
        <Ph_ name={def.icon} size={12} weight="fill" />
        {def.label}
        <span style={{ opacity: 0.72, fontWeight: 500 }}> · {variant?.label ?? section.variant}</span>
      </span>
      {!pinned && (
        <>
          <span className="sep" />
          <button title="Move up" disabled={index === 0} onClick={() => actions.moveSection(section.id, -1)}>
            <Icon name="chevronUp" size={14} />
          </button>
          <button title="Move down" disabled={index === count - 1} onClick={() => actions.moveSection(section.id, 1)}>
            <Icon name="chevronDown" size={14} />
          </button>
          <button title="Duplicate" onClick={() => actions.duplicateSection(section.id)}>
            <Icon name="copy" size={13} />
          </button>
          <button title="Delete" onClick={() => actions.removeSection(section.id)}>
            <Icon name="trash" size={13} />
          </button>
        </>
      )}
    </div>
  )
}

function SectionShell({
  section,
  pinned = false,
  index = 0,
  count = 0,
}: {
  section: Section
  pinned?: boolean
  index?: number
  count?: number
}) {
  const editing = useStore((s) => !s.preview)
  const selected = useStore((s) => s.selection?.sectionId === section.id)
  const hovered = useStore((s) => s.hovered === section.id)
  const reveal = useStore((s) => (s.reveal?.id === section.id ? s.reveal : null))
  const ref = useRef<HTMLElement>(null)

  // Inspector clicks resolve to a rendered primitive by its prop path. Fields
  // with no visual node (for example a button URL) fall back to a sibling that
  // shares the same object path, then to the section itself.
  const [landed, setLanded] = useState(false)
  useEffect(() => {
    if (!reveal || !ref.current) return
    let flashTimer: number | undefined
    let targetTimer: number | undefined
    const frame = window.requestAnimationFrame(() => {
      const root = ref.current
      if (!root) return

      if (reveal.path) {
        const candidates = Array.from(root.querySelectorAll<HTMLElement>('[data-editor-path]'))
        const exact = candidates.find((node) => node.dataset.editorPath === reveal.path)
        const parentPath = reveal.path.replace(/\.[^.]+$/, '')
        // Some schemas keep a visible label and its nonvisual destination as
        // flat siblings (`cta` + `ctaHref`, `link` + `linkUrl`). In those
        // cases, reveal the visible control the destination belongs to.
        const semanticPath = reveal.path.replace(/(?:Href|Link|Url)$/i, '')
        const related = candidates.find((node) => {
          const candidatePath = node.dataset.editorPath ?? ''
          return (semanticPath && candidatePath === semanticPath)
            || (parentPath && (candidatePath.startsWith(`${parentPath}.`) || candidatePath.startsWith(`${parentPath}[`)))
        })
        const target = exact ?? related
        const scroller = root.closest<HTMLElement>('.frame')
        if (target && scroller) {
          const targetRect = target.getBoundingClientRect()
          const scrollerRect = scroller.getBoundingClientRect()
          const centered = scroller.scrollTop
            + targetRect.top - scrollerRect.top
            - (scroller.clientHeight - targetRect.height) / 2
          scroller.scrollTo({ top: Math.max(0, centered), behavior: 'smooth' })
          target.classList.add('reveal-target')
          targetTimer = window.setTimeout(() => target.classList.remove('reveal-target'), 900)
        } else {
          root.scrollIntoView({ block: 'start', behavior: 'smooth' })
        }
        return
      }

      root.scrollIntoView({ block: 'start', behavior: 'smooth' })
      setLanded(true)
      flashTimer = window.setTimeout(() => setLanded(false), 900)
    })
    return () => {
      window.cancelAnimationFrame(frame)
      if (flashTimer) window.clearTimeout(flashTimer)
      if (targetTimer) window.clearTimeout(targetTimer)
    }
  }, [reveal?.n])

  return (
    <section
      ref={ref}
      data-reveal-path={reveal?.path}
      className={[
        'sec-shell',
        'surface',
        `surf-${section.surface}`,
        // Only the shared nav/footer follow the chrome treatment. A body
        // section on the same tinted surface must not turn solid with them.
        pinned ? 'chrome-surface' : '',
        selected ? 'sel' : '',
        hovered && !selected ? 'hov' : '',
        landed ? 'landed' : '',
      ].filter(Boolean).join(' ')}
      onMouseEnter={() => editing && actions.hover(section.id)}
      onMouseLeave={() => editing && actions.hover(null)}
      onClick={(e) => {
        if (!editing) return
        e.stopPropagation()
        actions.select({ sectionId: section.id })
      }}
    >
      {editing && selected && (
        <SectionTag section={section} pinned={pinned} index={index} count={count} />
      )}
      <SectionProvider value={{ id: section.id, props: section.props, editing }}>
        <SectionBody section={section} />
      </SectionProvider>
    </section>
  )
}

/* ------------------------------------------------------------ inserter */

function Inserter({
  index,
  onAdd,
  dropAt,
  setDropAt,
}: {
  index: number
  onAdd: (i: number) => void
  dropAt: number | null
  setDropAt: (i: number | null) => void
}) {
  return (
    <div
      className={`inserter ${dropAt === index ? 'is-drop' : ''}`}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(SECTION_DND)) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
        if (dropAt !== index) setDropAt(index)
      }}
      onDragLeave={() => setDropAt(null)}
      onDrop={(e) => {
        const type = e.dataTransfer.getData(SECTION_DND) as SectionType
        if (!type) return
        e.preventDefault()
        actions.insertSection(type, index)
        setDropAt(null)
      }}
    >
      <div className="inserter-hit">
        <div className="inserter-line" />
        <button
          className="inserter-btn"
          onClick={(e) => {
            e.stopPropagation()
            onAdd(index)
          }}
        >
          <Icon name="plus" size={13} />
          Add section
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- canvas */

export function Canvas({ onAdd }: { onAdd: (index: number) => void }) {
  const doc = useStore((s) => s.doc)
  const page = useStore(currentPage)
  const device = useStore((s) => s.device)
  const preview = useStore((s) => s.preview)
  const version = useStore((s) => s.version)
  const canInsert = page.insertable.length > 0
  const [dropAt, setDropAt] = useState<number | null>(null)

  // The generated palette is applied once at the app root, so the canvas only
  // sets its own local knobs and inherits layer 1.
  const style = useMemo(
    () =>
      ({
        '--radius': `${doc.theme.radius}px`,
        '--maxw': `${WIDTHS[doc.theme.width]}px`,
        '--fs': String(doc.theme.fontScale),
      }) as React.CSSProperties,
    [doc.theme.radius, doc.theme.width, doc.theme.fontScale],
  )

  return (
    <div
      className={`canvas-wrap device-${device} ${preview ? 'preview' : ''}`}
      onClick={() => actions.select(null)}
    >
      <div className={`frame ${device}`}>
        <div
          className={`site ${preview ? '' : 'editing-on'}`}
          data-appearance={doc.theme.appearance}
          data-chrome={doc.theme.chrome}
          style={style}
        >
          {/* Auth and the sign-up form are standalone screens with no site chrome. */}
          {page.hasChrome && !doc.nav.hidden && <SectionShell section={doc.nav} pinned />}

          {page.body.length === 0 && !preview && canInsert && (
            <div
              className={`canvas-empty ${dropAt === 0 ? 'is-drop' : ''}`}
              onDragOver={(e) => {
                if (!e.dataTransfer.types.includes(SECTION_DND)) return
                e.preventDefault()
                setDropAt(0)
              }}
              onDragLeave={() => setDropAt(null)}
              onDrop={(e) => {
                const type = e.dataTransfer.getData(SECTION_DND) as SectionType
                if (!type) return
                e.preventDefault()
                actions.insertSection(type, 0)
                setDropAt(null)
              }}
            >
              <Ph_ name="Stack" size={26} />
              <p>{version === 'v2' ? 'Drag a section here from the library' : 'This page has no sections yet'}</p>
              <button className="inserter-btn" style={{ opacity: 1, transform: 'none' }} onClick={(e) => { e.stopPropagation(); onAdd(0) }}>
                <Icon name="plus" size={13} /> {version === 'v2' ? 'Browse sections' : 'Add your first section'}
              </button>
            </div>
          )}

          {page.body.map((section, i) => (
            <div key={section.id}>
              {!preview && canInsert && <Inserter index={i} onAdd={onAdd} dropAt={dropAt} setDropAt={setDropAt} />}
              <SectionShell section={section} index={i} count={page.body.length} />
            </div>
          ))}

          {!preview && canInsert && page.body.length > 0 && (
            <Inserter index={page.body.length} onAdd={onAdd} dropAt={dropAt} setDropAt={setDropAt} />
          )}

          {page.hasChrome && !doc.footer.hidden && <SectionShell section={doc.footer} pinned />}
        </div>
      </div>
    </div>
  )
}
