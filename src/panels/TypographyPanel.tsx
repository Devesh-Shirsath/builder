import { useCallback, useRef, useState } from 'react'
import { actions, useStore } from '../store'
import { DEFAULT_FONT, FONTS, FONT_KINDS, fontStack, useFonts } from '../theme/fonts'
import { Ph_ } from '../ui/Phosphor'
import { useDismiss } from '../ui/useDismiss'

const ALL_FAMILIES = FONTS.map((f) => f.family)

const PAIRINGS = [
  { name: 'Classic', primary: 'Inter', secondary: 'Inter' },
  { name: 'Editorial', primary: 'Fraunces', secondary: 'Inter' },
  { name: 'Technical', primary: 'Space Grotesk', secondary: 'IBM Plex Sans' },
  { name: 'Friendly', primary: 'Plus Jakarta Sans', secondary: 'DM Sans' },
]

/** Where each role lands on the published portal. Keep in step with canvas.css. */
const USAGE = {
  primary: [
    'Hero and page titles',
    'Section headings',
    'Feature, pricing and card titles',
    'FAQ questions',
    'Stat figures and large quotes',
    'Logo wordmark in the nav',
  ],
  secondary: [
    'Lead and body paragraphs',
    'Navigation and footer links',
    'Buttons',
    'Form labels, inputs and sign-in',
    'Eyebrows, tags and captions',
  ],
}

function FontSelect({
  label,
  help,
  value,
  onChange,
}: {
  label: string
  help: string
  value: string
  onChange: (family: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, ref, close)
  // Load the whole shelf only once someone opens the menu.
  useFonts(open ? ALL_FAMILIES : [value])

  const def = FONTS.find((f) => f.family === value)

  return (
    <div className="field-ui">
      <label>{label}</label>
      <div className="font-select" ref={ref}>
        <button
          type="button"
          className={`input-area font-trigger ${open ? 'open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <Ph_ name="TextAa" size={16} />
          <span className="font-trigger-name" style={{ fontFamily: fontStack(value) }}>{value}</span>
          <span className="font-trigger-kind">{def?.kind}</span>
          <Ph_ name="CaretDown" size={14} />
        </button>

        {open && (
          <div className="font-menu" role="listbox" aria-label={label}>
            {FONT_KINDS.map((kind) => (
              <div key={kind}>
                <div className="font-menu-label">{kind}</div>
                {FONTS.filter((f) => f.kind === kind).map((f) => (
                  <button
                    key={f.family}
                    type="button"
                    role="option"
                    aria-selected={f.family === value}
                    className={`font-option ${f.family === value ? 'on' : ''}`}
                    onClick={() => {
                      onChange(f.family)
                      setOpen(false)
                    }}
                  >
                    <span className="font-option-aa" style={{ fontFamily: fontStack(f.family) }}>Aa</span>
                    <span className="font-option-name" style={{ fontFamily: fontStack(f.family) }}>{f.family}</span>
                    {f.family === value && <Ph_ name="Check" size={14} className="font-option-check" />}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="hint">{help}</div>
    </div>
  )
}

function UsageGroup({ role, family, items }: { role: 'Primary' | 'Secondary'; family: string; items: string[] }) {
  return (
    <div className="tp-usage-group">
      <div className="tp-usage-head">
        <span className={`tp-badge ${role === 'Primary' ? 'is-primary' : ''}`}>{role}</span>
        <span className="tp-usage-font" style={{ fontFamily: fontStack(family) }}>{family}</span>
      </div>
      <ul className="tp-usage-list">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}

export function TypographyPanel() {
  const theme = useStore((s) => s.doc.theme)
  const primary = theme.fontPrimary ?? DEFAULT_FONT
  const secondary = theme.fontSecondary ?? DEFAULT_FONT

  useFonts([primary, secondary, ...PAIRINGS.map((p) => p.primary), ...PAIRINGS.map((p) => p.secondary)])

  return (
    <div className="sect">
      <div className="tp-specimen">
        <span className="tp-kicker">Preview</span>
        <div className="tp-head" style={{ fontFamily: fontStack(primary) }}>
          Build on an API developers trust
        </div>
        <p className="tp-body" style={{ fontFamily: fontStack(secondary) }}>
          Headings carry the voice of your portal. The body face keeps long guides
          and reference pages calm and easy to read.
        </p>
      </div>

      <FontSelect
        label="Primary font"
        value={primary}
        onChange={(f) => actions.setTheme({ fontPrimary: f })}
        help="Headings and display text — titles, card headings, big numbers."
      />
      <FontSelect
        label="Secondary font"
        value={secondary}
        onChange={(f) => actions.setTheme({ fontSecondary: f })}
        help="Body and interface text — paragraphs, links, buttons, forms."
      />

      <div className="field-ui">
        <label>Suggested pairings</label>
        <div className="tp-pairs">
          {PAIRINGS.map((p) => {
            const on = p.primary === primary && p.secondary === secondary
            return (
              <button
                key={p.name}
                type="button"
                className={`tp-pair ${on ? 'on' : ''}`}
                onClick={() => actions.setTheme({ fontPrimary: p.primary, fontSecondary: p.secondary })}
              >
                <span className="tp-pair-aa" style={{ fontFamily: fontStack(p.primary) }}>Aa</span>
                <span className="tp-pair-name">{p.name}</span>
                <span className="tp-pair-fonts">
                  {p.primary === p.secondary ? p.primary : `${p.primary} + ${p.secondary}`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="field-ui">
        <label>Where your fonts appear</label>
        <div className="tp-usage">
          <UsageGroup role="Primary" family={primary} items={USAGE.primary} />
          <UsageGroup role="Secondary" family={secondary} items={USAGE.secondary} />
        </div>
        <div className="hint">
          Applies to every page of the published portal. Code samples and endpoint
          paths stay monospaced, and the builder's own interface doesn't change.
        </div>
      </div>
    </div>
  )
}
