import { useCallback, useEffect, useRef, useState } from 'react'
import { actions, currentPage, useStore } from '../store'
import { REGISTRY } from '../registry'
import type { PageId, Section } from '../types'
import { Ph_ } from '../ui/Phosphor'
import { useDismiss } from '../ui/useDismiss'
import { SectionEditor } from './SectionEditor'
import { SectionLibrary } from './SectionLibrary'
import { ThemePanel } from './ThemePanel'
import { TypographyPanel } from './TypographyPanel'

/* ------------------------------------------------------ the switcher */

const PAGE_ICONS: Record<PageId, string> = {
  home: 'House',
  auth: 'SignIn',
  signup: 'ListChecks',
  guides: 'BookOpen',
  reference: 'Code',
  recipes: 'CookingPot',
  contact: 'Envelope',
}

/**
 * A compound segmented control, per the Figma. The selected segment expands to
 * show its label; the other collapses to its icon. Page carries the page menu:
 * the first click on it switches tabs, a click while it's already selected
 * opens the dropdown.
 */
function PanelSwitch() {
  const doc = useStore((s) => s.doc)
  const pageId = useStore((s) => s.pageId)
  const tab = useStore((s) => s.sidebarTab)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, ref, close)

  const page = doc.pages[pageId]

  const onPage = () => {
    if (tab !== 'page') {
      setOpen(false)
      actions.setSidebarTab('page')
    } else {
      setOpen((v) => !v)
    }
  }

  const onStyles = () => {
    setOpen(false)
    actions.setSidebarTab('styles')
  }

  return (
    <div className="page-switcher" ref={ref}>
      <div className={`pswitch tab-${tab}`} role="tablist" aria-label="Sidebar">
        <button
          role="tab"
          aria-selected={tab === 'page'}
          aria-haspopup="menu"
          aria-expanded={tab === 'page' && open}
          className={`pswitch-seg ${tab === 'page' ? 'on' : ''} ${open ? 'open' : ''}`}
          onClick={onPage}
          title={tab === 'page' ? 'Switch page' : `Page · ${page.name}`}
        >
          <span className="pswitch-icon"><Ph_ name={PAGE_ICONS[pageId]} size={20} /></span>
          <span className="pswitch-text">
            <span className="pswitch-label">Page</span>
            <span className="pswitch-value">{page.name}</span>
          </span>
          <Ph_ name="CaretDown" size={16} className="pswitch-caret" />
        </button>
        <button
          role="tab"
          aria-selected={tab === 'styles'}
          className={`pswitch-seg ${tab === 'styles' ? 'on' : ''}`}
          onClick={onStyles}
          title="Themes & Typography"
        >
          <span className="pswitch-icon"><Ph_ name="Palette" size={20} /></span>
          <span className="pswitch-text">
            <span className="pswitch-label">Themes &amp; Typography</span>
            <span className="pswitch-value">Appearance</span>
          </span>
        </button>
      </div>

      {open && tab === 'page' && (
        <div className="page-menu" role="menu">
          {doc.pageOrder.map((id) => {
            const p = doc.pages[id]
            return (
              <button
                key={id}
                role="menuitem"
                className={`page-item ${id === pageId ? 'on' : ''}`}
                onClick={() => {
                  actions.setPage(id)
                  setOpen(false)
                }}
              >
                <Ph_ name={PAGE_ICONS[id]} size={16} />
                <span className="page-item-name">{p.name}</span>
                <span className="page-item-meta">
                  {p.body.length} {p.body.length === 1 ? 'section' : 'sections'}
                </span>
                {id === pageId && <Ph_ name="Check" size={14} className="page-item-check" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- level one */

type DragState = { id: string | null; over: string | null; edge: 'top' | 'bottom' }

function dropIndex(body: Section[], dragId: string, overId: string, edge: 'top' | 'bottom'): number {
  const from = body.findIndex((s) => s.id === dragId)
  let to = body.findIndex((s) => s.id === overId)
  if (edge === 'bottom') to += 1
  if (from < to) to -= 1
  return Math.max(0, to)
}

function LayerRow({
  section,
  pinned,
  index,
  body,
  dragState,
  setDragState,
}: {
  section: Section
  pinned?: boolean
  index?: number
  body?: Section[]
  dragState?: DragState
  setDragState?: (s: DragState) => void
}) {
  const selected = useStore((s) => s.selection?.sectionId === section.id)
  const def = REGISTRY[section.type]

  const dragging = dragState?.id === section.id
  const over = dragState?.over === section.id
  const cls = [
    'layer',
    selected ? 'sel' : '',
    section.hidden ? 'is-off' : '',
    dragging ? 'dragging' : '',
    over && dragState?.edge === 'top' ? 'drag-over-top' : '',
    over && dragState?.edge === 'bottom' ? 'drag-over-bottom' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cls}
      role="button"
      tabIndex={0}
      draggable={!pinned && !!setDragState}
      onDragStart={() => setDragState?.({ id: section.id, over: null, edge: 'top' })}
      onDragEnd={() => setDragState?.({ id: null, over: null, edge: 'top' })}
      onDragOver={(e) => {
        if (pinned || !dragState?.id || dragState.id === section.id) return
        e.preventDefault()
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const edge = e.clientY - r.top < r.height / 2 ? 'top' : 'bottom'
        if (dragState.over !== section.id || dragState.edge !== edge) {
          setDragState?.({ ...dragState, over: section.id, edge })
        }
      }}
      onDrop={(e) => {
        e.preventDefault()
        if (pinned || !dragState?.id || !body) return
        actions.reorderSection(dragState.id, dropIndex(body, dragState.id, section.id, dragState.edge))
        setDragState?.({ id: null, over: null, edge: 'top' })
      }}
      onClick={() => actions.revealSection(section.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) actions.revealSection(section.id)
      }}
      onMouseEnter={() => actions.hover(section.id)}
      onMouseLeave={() => actions.hover(null)}
    >
      {/* Header and footer can't be reordered, so their first slot shows or
          hides them instead. */}
      {pinned ? (
        <button
          className="layer-eye"
          title={`${section.hidden ? 'Show' : 'Hide'} ${def.label}`}
          aria-label={`${section.hidden ? 'Show' : 'Hide'} ${def.label}`}
          onClick={(e) => {
            e.stopPropagation()
            actions.setSectionHidden(section.id, !section.hidden)
          }}
        >
          <Ph_ name={section.hidden ? 'EyeSlash' : 'Eye'} size={14} />
        </button>
      ) : (
        <span className="layer-handle" title="Drag to reorder">
          <Ph_ name="DotsSixVertical" size={14} weight="bold" />
        </span>
      )}
      {/* Its own group so the icon-to-label gap can stay generous while the
          leading control (drag handle / eye) sits close on the outside. */}
      <span className="layer-body">
        <span className="layer-icon"><Ph_ name={def.icon} size={16} /></span>
        <span className="layer-title">{def.label}</span>
      </span>
      {!pinned && (
        <button
          className="layer-delete"
          title="Delete section"
          onClick={(e) => {
            e.stopPropagation()
            actions.removeSection(section.id)
          }}
        >
          <Ph_ name="Trash" size={14} />
        </button>
      )}
      <Ph_ name="CaretRight" size={12} className="layer-chevron" />
    </div>
  )
}

function RootLevel({ onAdd }: { onAdd: (index: number) => void }) {
  const doc = useStore((s) => s.doc)
  const page = useStore(currentPage)
  const [dragState, setDragState] = useState<DragState>({ id: null, over: null, edge: 'top' })
  const canInsert = page.insertable.length > 0
  const empty = page.body.length === 0

  return (
    <div className="panel-scroll">
      <div className="panel-list">
        {page.hasChrome && (
          <>
            <div className="group-label">Header</div>
            <LayerRow section={doc.nav} pinned />
          </>
        )}

        <div className="group-label">
          {page.name}
          {!empty && <span className="group-count">{page.body.length}</span>}
          {canInsert && !empty && (
            <button
              className="group-add"
              title="Add section"
              aria-label="Add section"
              onClick={() => onAdd(page.body.length)}
            >
              <Ph_ name="Plus" size={14} />
            </button>
          )}
        </div>
        {/* An empty page puts the add action where the sections will go,
            rather than only at the foot of the panel. */}
        {empty && canInsert && (
          <div className="list-empty">
            <span className="list-empty-icon"><Ph_ name="Stack" size={18} /></span>
            <span className="list-empty-title">No sections yet</span>
            <span className="list-empty-sub">Add a section to start building this page.</span>
            <button className="btn-ui primary panel-add" onClick={() => onAdd(0)}>
              <Ph_ name="Plus" size={16} /> Add section
            </button>
          </div>
        )}
        {empty && !canInsert && (
          <div className="hint" style={{ padding: '4px 12px 8px' }}>This page has no sections.</div>
        )}
        {page.body.map((s, i) => (
          <LayerRow
            key={s.id}
            section={s}
            index={i}
            body={page.body}
            dragState={dragState}
            setDragState={setDragState}
          />
        ))}

        {page.hasChrome && (
          <>
            <div className="group-label">Footer</div>
            <LayerRow section={doc.footer} pinned />
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ level two */

function DrillHeader({ parent, title, onBack }: { parent: string; title: string; onBack: () => void }) {
  return (
    <div className="panel-head drill-head">
      <button className="head-icon" onClick={onBack} title="Back" aria-label="Back">
        <Ph_ name="ArrowLeft" size={16} />
      </button>
      <nav className="drill-crumbs" aria-label="Breadcrumb">
        <button className="drill-crumb" onClick={onBack}>{parent}</button>
        <span className="drill-crumb-sep">/</span>
        <span className="drill-crumb last">{title}</span>
      </nav>
    </div>
  )
}

function ChildLevel({ sectionId }: { sectionId: string }) {
  const doc = useStore((s) => s.doc)
  const page = useStore(currentPage)
  // During the slide-out the section may already be gone (deleted, or the
  // page changed) — the level then just animates away empty.
  const section = [doc.nav, doc.footer, ...page.body].find((s) => s.id === sectionId)
  const pinned = !!section && (section.id === doc.nav.id || section.id === doc.footer.id)

  return (
    <>
      <DrillHeader
        parent={page.name}
        title={section ? REGISTRY[section.type].label : ''}
        onBack={() => actions.panelBack()}
      />
      <div className="panel-scroll level-content" key={sectionId}>
        {section && <SectionEditor section={section} pinned={pinned} />}
      </div>
    </>
  )
}

/**
 * A page with sections: the section list, and a nested editor that slides in
 * over it. The list stays mounted (so its scroll position survives a round
 * trip) and parallaxes left; the nested level keeps rendering the section it
 * last showed, so it has content to slide out with.
 */
function SectionsPane({ onAdd }: { onAdd: (index: number) => void }) {
  const doc = useStore((s) => s.doc)
  const page = useStore(currentPage)
  const selection = useStore((s) => s.selection)
  const library = useStore((s) => s.library)

  const selectedId =
    selection && [doc.nav, doc.footer, ...page.body].some((s) => s.id === selection.sectionId)
      ? selection.sectionId
      : null
  const drilled = selectedId !== null || library !== null

  const [lastChild, setLastChild] = useState<string | null>(null)
  useEffect(() => {
    if (selectedId) setLastChild(selectedId)
  }, [selectedId])
  const childId = selectedId ?? lastChild

  // Mount the nested content first and start the slide a frame later, so an
  // expensive editor renders off-screen instead of eating the transition.
  // Closing needs no content work, so it's immediate.
  const [slid, setSlid] = useState(drilled)
  useEffect(() => {
    if (!drilled) {
      setSlid(false)
      return
    }
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setSlid(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [drilled])
  const open = drilled && slid

  return (
    <div className="panel-stack">
      <div className={`panel-level level-root ${open ? 'is-covered' : ''}`} aria-hidden={drilled}>
        <RootLevel onAdd={onAdd} />
        {/* While the page is empty, the button lives in the list instead. */}
        {page.insertable.length > 0 && page.body.length > 0 && (
          <div className="panel-foot">
            <button className="btn-ui primary panel-add" onClick={() => onAdd(page.body.length)}>
              <Ph_ name="Plus" size={16} /> Add section
            </button>
          </div>
        )}
      </div>

      <div className={`panel-level level-child ${open ? 'is-open' : ''}`} aria-hidden={!drilled}>
        {library
          ? <SectionLibrary at={library.at} />
          : childId && <ChildLevel sectionId={childId} />}
      </div>
    </div>
  )
}

/** A fixed, single-section page (sign in, sign-up form): its fields, straight away. */
function FormPane({ section }: { section: Section }) {
  return (
    <div className="panel-scroll level-content" key={section.id}>
      <SectionEditor section={section} pinned />
    </div>
  )
}

/** Global settings — they apply to every page, so they live beside the page, not in it. */
function StylesPane() {
  return (
    <div className="panel-scroll styles-pane">
      <ThemePanel />
      <TypographyPanel />
    </div>
  )
}

/* ------------------------------------------------------------ the panel */

export function LeftPanel({ onAdd }: { onAdd: (index: number) => void }) {
  const page = useStore(currentPage)
  const tab = useStore((s) => s.sidebarTab)

  // Sign in and the sign-up form are one fixed section with no site chrome —
  // a list with a single row and a drill-down would just be an extra click.
  const formSection = !page.hasChrome && page.insertable.length === 0 && page.body.length === 1
    ? page.body[0]
    : null

  return (
    <aside className="panel">
      <PanelSwitch />

      <div className="panel-tabs">
        <div className={`panel-tab tab-page ${tab === 'page' ? 'is-active' : ''}`} aria-hidden={tab !== 'page'}>
          {formSection ? <FormPane section={formSection} /> : <SectionsPane onAdd={onAdd} />}
        </div>
        <div className={`panel-tab tab-styles ${tab === 'styles' ? 'is-active' : ''}`} aria-hidden={tab !== 'styles'}>
          <StylesPane />
        </div>
      </div>
    </aside>
  )
}
