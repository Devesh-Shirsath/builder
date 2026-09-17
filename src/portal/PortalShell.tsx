import { useState } from 'react'
import { actions, useStore } from '../store'
import { Ph_ } from '../ui/Phosphor'
import { RAIL, TREE } from './referenceData'
import { ReferenceDoc } from './ReferenceDoc'

/* ---------------------------------------------------------------- rail */

function IconRail() {
  const railId = useStore((s) => s.railId)
  return (
    <nav className="p-rail" aria-label="Portal sections">
      {RAIL.map((item) => (
        <button
          key={item.id}
          className="p-rail-item"
          aria-current={railId === item.id ? 'page' : undefined}
          onClick={() => actions.setRail(item.id)}
          title={item.label}
        >
          <Ph_ name={item.icon} size={19} weight={railId === item.id ? 'fill' : 'regular'} />
          <span className="p-rail-label">{item.label}</span>
        </button>
      ))}
      <span className="p-rail-spacer" />
      <span className="p-rail-avatar">A</span>
    </nav>
  )
}

/* ------------------------------------------------------------ the tree */

/** The square panel icon in the tree header — collapses the portal nav. */
function NavToggle() {
  const navOpen = useStore((s) => s.navOpen)
  return (
    <button
      className="p-icon-btn"
      onClick={() => actions.toggleNav()}
      title={navOpen ? 'Collapse navigation' : 'Show navigation'}
      aria-pressed={!navOpen}
    >
      <Ph_ name="SidebarSimple" size={16} />
    </button>
  )
}

function TreeSidebar() {
  const endpointId = useStore((s) => s.endpointId)
  // The leading groups in the Figma are collapsible rows; the later ones are
  // headed sections that stay open.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  return (
    <aside className="p-tree" aria-label="API reference">
      <div className="p-tree-head">
        <span className="p-tree-title">References</span>
        <button className="p-icon-btn" title="Search"><Ph_ name="MagnifyingGlass" size={15} /></button>
        <button className="p-icon-btn" title="Sort"><Ph_ name="ArrowsDownUp" size={15} /></button>
        <button className="p-icon-btn" title="Add"><Ph_ name="Plus" size={15} /></button>
        <NavToggle />
      </div>

      <div className="p-tree-scroll">
        {TREE.map((group, gi) => {
          const isOpen = !collapsed[group.title]
          return (
            <div key={group.title}>
              {gi > 0 && <div className="p-tree-divider" />}
              <button
                className="p-tree-group"
                style={{ width: '100%' }}
                onClick={() => setCollapsed((c) => ({ ...c, [group.title]: isOpen }))}
              >
                <Ph_ name="Stack" size={14} />
                <span className="p-tree-label">{group.title}</span>
                <span className="p-tree-caret" data-open={isOpen}>
                  <Ph_ name="CaretRight" size={12} />
                </span>
              </button>

              {isOpen &&
                group.items.map((item) => (
                  <button
                    key={item.id}
                    className="p-tree-leaf"
                    aria-current={endpointId === item.id ? 'page' : undefined}
                    onClick={() => actions.setEndpoint(item.id)}
                  >
                    <span className="p-tree-leaf-icon">
                      <Ph_ name="Article" size={14} />
                    </span>
                    <span className="p-tree-label">{item.label}</span>
                    {item.method && (
                      <span className={`method m-${item.method.toLowerCase()}`}>{item.method}</span>
                    )}
                  </button>
                ))}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

/* --------------------------------------------------------- the shell */

export function PortalShell({ children }: { children?: React.ReactNode }) {
  const theme = useStore((s) => s.doc.theme)
  const appMode = useStore((s) => s.appMode)
  const navOpen = useStore((s) => s.navOpen)
  const railId = useStore((s) => s.railId)
  const builder = appMode === 'builder'
  // While customising, the rail is the only navigation worth keeping — the
  // docs tree has nothing to say about the page being edited.
  const cols = !navOpen ? 'content' : builder ? 'rail-content' : 'rail-tree-content'

  return (
    <div
      className="portal"
      data-chrome={theme.chrome}
      data-appearance={theme.appearance}
      data-mode={builder ? 'builder' : 'portal'}
    >
      {/* The builder owns the full height of the card, so the portal's top bar
          steps out of the way; its nav toggle moves into the builder toolbar. */}
      {!builder && (
        <header className="p-topbar">
          {!navOpen && (
            <button className="p-icon-btn" onClick={() => actions.toggleNav()} title="Show navigation">
              <Ph_ name="SidebarSimple" size={16} />
            </button>
          )}
          <span className="p-brand">
            <span className="p-brand-mark"><Ph_ name="Sparkle" size={12} weight="fill" /></span>
            Northwind
          </span>
          <span className="p-topbar-spacer" />
          <button className="p-icon-btn" title="Search"><Ph_ name="MagnifyingGlass" size={16} /></button>
          <button className="p-icon-btn" title="Versions"><Ph_ name="GitBranch" size={16} /></button>
          <button className="p-icon-btn" title="Comments"><Ph_ name="ChatCircle" size={16} /></button>
          <button className="p-icon-btn" title="Notifications"><Ph_ name="Bell" size={16} /></button>
          <button className="p-topbar-cta">
            <Ph_ name="ArrowSquareOut" size={13} /> View Docs
            <Ph_ name="CaretDown" size={11} />
          </button>
        </header>
      )}

      <div className="p-body" data-cols={cols} data-mode={builder ? 'builder' : 'portal'}>
        {navOpen && <IconRail />}
        {navOpen && !builder && <TreeSidebar />}

        <div className={`p-content ${builder ? 'is-builder' : ''}`}>
          {builder ? (
            children
          ) : (
            <>
              <div className="p-cardbar">
                <button className="p-chip-btn">
                  <Ph_ name="CircleDashed" size={14} /> Version 2
                  <Ph_ name="List" size={13} />
                </button>
                <span className="p-cardbar-spacer" />
                <div className="p-seg" role="group" aria-label="Mode">
                  <button aria-pressed={false} onClick={() => actions.openBuilder()}>Editor</button>
                  <button aria-pressed>Preview</button>
                </div>
                <span className="p-cardbar-spacer" />
                <span className="p-saving">Saving Changes…</span>
                <button className="p-publish">
                  Publish Changes <Ph_ name="CaretDown" size={11} />
                </button>
              </div>

              {railId === 'references' ? (
                <ReferenceDoc />
              ) : (
                <div className="p-scroll">
                  <div style={{ padding: '64px 34px', maxWidth: 620 }}>
                    <h1 style={{ fontSize: 26, margin: 0, color: 'var(--text-hi)' }}>
                      {RAIL.find((r) => r.id === railId)?.label}
                    </h1>
                    <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--text-default)' }}>
                      This screen isn’t built yet. The reference page is the one matched to the
                      design so far — pick <strong>References</strong> in the rail to see it, or{' '}
                      <strong>Customise</strong> to open the builder.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
