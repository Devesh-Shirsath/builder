import { useState } from 'react'
import { actions } from '../store'
import { TEMPLATES, blankDoc, docFromTemplate } from '../templates'
import { Ph_ } from '../ui/Phosphor'
import { SectionPreview } from './SectionPreview'

const BLANK = 'blank'

/**
 * v2's first run, shown over the builder the first time Customise is opened.
 * The cards are the preview and a generic name — everything else about a
 * template is visible the moment it's applied.
 */
export function StartScreen() {
  const [choice, setChoice] = useState<string>(TEMPLATES[0].id)
  const template = TEMPLATES.find((t) => t.id === choice)

  const go = () => actions.startWith(template ? docFromTemplate(template) : blankDoc())

  return (
    <div className="overlay start-overlay">
      <div className="modal start-modal">
        <div className="modal-head">
          <div>
            <div className="modal-title">Start your portal</div>
            <div className="hint" style={{ marginTop: 2 }}>
              Pick a template to customise, or start from a blank canvas and drag sections in.
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div className="start-grid">
            {TEMPLATES.map((t) => {
              const on = choice === t.id
              const [type, variant] = t.sections[0]
              return (
                <button
                  key={t.id}
                  className={`start-card ${on ? 'on' : ''}`}
                  onClick={() => setChoice(t.id)}
                  aria-pressed={on}
                >
                  <span className="start-art">
                    <SectionPreview
                      type={type}
                      variant={variant}
                      maxHeight={150}
                      theme={{ accent: t.accent, chrome: t.chrome, fontPrimary: t.fontPrimary, fontSecondary: t.fontSecondary }}
                    />
                  </span>
                  <span className="start-name">
                    {t.short}
                    {on && <Ph_ name="CheckCircle" size={16} weight="fill" className="start-check" />}
                  </span>
                </button>
              )
            })}

            <button
              className={`start-card ${choice === BLANK ? 'on' : ''}`}
              onClick={() => setChoice(BLANK)}
              aria-pressed={choice === BLANK}
            >
              <span className="start-art start-blank-art">
                <span className="start-blank-mark"><Ph_ name="Plus" size={22} /></span>
              </span>
              <span className="start-name">
                Blank canvas
                {choice === BLANK && <Ph_ name="CheckCircle" size={16} weight="fill" className="start-check" />}
              </span>
            </button>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn-ui primary start-go" onClick={go}>
            {template ? 'Use this template' : 'Start from blank'}
            <Ph_ name="ArrowRight" size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
