import { useState } from 'react'
import { actions } from '../store'
import { TEMPLATES, blankDoc, docFromTemplate } from '../templates'
import { Ph_ } from '../ui/Phosphor'
import { SectionPreview } from './SectionPreview'
import { TemplatePreview } from './TemplatePreview'

const BLANK = 'blank'
type Approach = 'full' | 'split'
type FullView = 'gallery' | 'preview'

/**
 * v2's first run, shown over the builder the first time Customise is opened.
 * The cards are the preview and a generic name — everything else about a
 * template is visible the moment it's applied.
 */
export function StartScreen() {
  const [choice, setChoice] = useState<string>(TEMPLATES[0].id)
  const [approach, setApproach] = useState<Approach>('full')
  const [fullView, setFullView] = useState<FullView>('gallery')
  const template = TEMPLATES.find((t) => t.id === choice)

  const go = () => actions.startWith(template ? docFromTemplate(template) : blankDoc())

  const chooseForFullPreview = (id: string) => {
    setChoice(id)
    if (id !== BLANK) setFullView('preview')
  }

  const approachSwitch = (
    <div className="start-approach-switch" role="tablist" aria-label="Template preview approach">
      <button
        role="tab"
        aria-selected={approach === 'full'}
        className={approach === 'full' ? 'on' : ''}
        onClick={() => {
          setApproach('full')
          setFullView('gallery')
        }}
      >
        <Ph_ name="ArrowsOut" size={14} /> Full preview
      </button>
      <button
        role="tab"
        aria-selected={approach === 'split'}
        className={approach === 'split' ? 'on' : ''}
        onClick={() => setApproach('split')}
      >
        <Ph_ name="SidebarSimple" size={14} /> Split view
      </button>
    </div>
  )

  const gallery = (
    <div className="start-grid">
      {TEMPLATES.map((t) => {
        const on = choice === t.id
        const [type, variant] = t.sections[0]
        return (
          <button
            key={t.id}
            className={`start-card ${on ? 'on' : ''}`}
            onClick={() => chooseForFullPreview(t.id)}
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
        onClick={() => chooseForFullPreview(BLANK)}
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
  )

  const previewHeader = template && (
    <div className="start-preview-head">
      <div>
        <div className="start-preview-title">{template.name}</div>
        <div className="start-preview-tagline">{template.tagline}</div>
        <p>{template.description}</p>
      </div>
      <div className="start-preview-meta">
        <span style={{ background: template.accent }} />
        {template.sections.length} sections
      </div>
    </div>
  )

  return (
    <div className="overlay start-overlay">
      <div className={`modal start-modal ${(approach === 'split' || fullView === 'preview') ? 'is-wide' : ''}`}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Start your portal</div>
            <div className="hint" style={{ marginTop: 2 }}>
              Pick a template to customise, or start from a blank canvas and drag sections in.
            </div>
          </div>
          {approachSwitch}
        </div>

        {approach === 'full' ? (
          <div className={`modal-body ${fullView === 'preview' ? 'start-full-preview' : ''}`}>
            {fullView === 'gallery' ? gallery : template && (
              <>
                <div className="start-detail-bar">
                  <button className="btn-ui outline" onClick={() => setFullView('gallery')}>
                    <Ph_ name="ArrowLeft" size={15} /> Back to templates
                  </button>
                  {previewHeader}
                </div>
                <div className="template-preview-scroll">
                  <TemplatePreview template={template} />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="modal-body start-split">
            <aside className="start-template-list" aria-label="Templates">
              {TEMPLATES.map((t) => {
                const [type, variant] = t.sections[0]
                return (
                  <button
                    key={t.id}
                    className={`start-template-row ${choice === t.id ? 'on' : ''}`}
                    onClick={() => setChoice(t.id)}
                    aria-pressed={choice === t.id}
                  >
                    <span className="start-template-thumb">
                      <SectionPreview
                        type={type}
                        variant={variant}
                        maxHeight={72}
                        theme={{ accent: t.accent, chrome: t.chrome, fontPrimary: t.fontPrimary, fontSecondary: t.fontSecondary }}
                      />
                    </span>
                    <span><b>{t.short}</b><small>{t.tagline}</small></span>
                    {choice === t.id && <Ph_ name="CheckCircle" size={16} weight="fill" />}
                  </button>
                )
              })}
              <button
                className={`start-template-row blank ${choice === BLANK ? 'on' : ''}`}
                onClick={() => setChoice(BLANK)}
                aria-pressed={choice === BLANK}
              >
                <span className="start-template-blank"><Ph_ name="Plus" size={18} /></span>
                <span><b>Blank canvas</b><small>Start from scratch</small></span>
                {choice === BLANK && <Ph_ name="CheckCircle" size={16} weight="fill" />}
              </button>
            </aside>
            <div className="start-split-main">
              {template ? (
                <>
                  {previewHeader}
                  <div className="template-preview-scroll">
                    <TemplatePreview template={template} />
                  </div>
                </>
              ) : (
                <div className="start-blank-preview">
                  <span className="start-blank-mark"><Ph_ name="Plus" size={22} /></span>
                  <b>Blank canvas</b>
                  <span>Start with navigation and footer, then drag in the sections you need.</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="modal-foot">
          {approach === 'full' && fullView === 'gallery' && template && (
            <button className="btn-ui outline" onClick={() => setFullView('preview')}>
              <Ph_ name="Eye" size={15} /> Preview selected
            </button>
          )}
          <button className="btn-ui primary start-go" onClick={go}>
            {template ? 'Use this template' : 'Start from blank'}
            <Ph_ name="ArrowRight" size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
