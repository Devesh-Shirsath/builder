import { useEffect } from 'react'
import { REGISTRY } from '../registry'
import { actions, currentPage, useStore } from '../store'
import type { SectionType } from '../types'
import { Icon } from '../ui/Icon'
import { Ph_ } from '../ui/Phosphor'
import { ILLUSTRATIONS } from '../ui/illustrations'

export function AddSection({ index, onClose }: { index: number; onClose: () => void }) {
  const page = useStore(currentPage)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const insert = (type: SectionType) => {
    actions.insertSection(type, index)
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Add a section</div>
            <div className="hint" style={{ marginTop: 2 }}>
              Inserting into {page.name} at position {index + 1}. Every layout is available in
              the panel once it’s in.
            </div>
          </div>
          <button className="btn-ui icon" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="type-grid">
            {page.insertable.map((type) => {
              const def = REGISTRY[type]
              const art = ILLUSTRATIONS[type]
              const n = def.variants.length
              return (
                <button className="type-card" key={type} onClick={() => insert(type)}>
                  {/* Inlined rather than an <img>: CSS custom properties do not
                      cross into <img>, and these follow the brand accent. */}
                  {art && <span className="type-art" dangerouslySetInnerHTML={{ __html: art }} />}
                  <span className="type-card-head">
                    <span className="type-card-icon">
                      <Ph_ name={def.icon} size={14} />
                    </span>
                    <span className="type-card-name">{def.label}</span>
                    <span className="type-card-count">{n} {n === 1 ? 'layout' : 'layouts'}</span>
                  </span>
                  <span className="type-card-desc">{def.description}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
