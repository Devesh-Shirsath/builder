import { actions, currentPage, useStore } from '../store'
import { REGISTRY } from '../registry'
import type { SectionType } from '../types'
import { Ph_ } from '../ui/Phosphor'
import { ILLUSTRATIONS } from '../ui/illustrations'
import { SECTION_DND } from '../canvas/dnd'

/**
 * v2's section library. Every type can be clicked to drop in at the end, or
 * dragged onto the canvas to land between two sections.
 */
export function SectionLibrary({ at }: { at: number }) {
  const page = useStore(currentPage)

  const insert = (type: SectionType) => {
    actions.insertSection(type, at)
    actions.closeLibrary()
  }

  return (
    <>
      <div className="panel-head drill-head">
        <button className="head-icon" onClick={() => actions.closeLibrary()} title="Back" aria-label="Back">
          <Ph_ name="ArrowLeft" size={16} />
        </button>
        <nav className="drill-crumbs">
          <button className="drill-crumb" onClick={() => actions.closeLibrary()}>{page.name}</button>
          <span className="drill-crumb-sep">/</span>
          <span className="drill-crumb last">Sections</span>
        </nav>
      </div>
      <div className="panel-scroll level-content">
        <div className="lib">
          <p className="hint lib-hint">Drag a section onto the canvas, or click to add it to the end.</p>
          <div className="lib-grid">
            {page.insertable.map((type) => {
              const def = REGISTRY[type]
              const art = ILLUSTRATIONS[type]
              return (
                <button
                  key={type}
                  className="lib-card"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(SECTION_DND, type)
                    e.dataTransfer.effectAllowed = 'copy'
                  }}
                  onClick={() => insert(type)}
                  title={def.description}
                >
                  {art && <span className="lib-art" dangerouslySetInnerHTML={{ __html: art }} />}
                  <span className="lib-name">{def.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
