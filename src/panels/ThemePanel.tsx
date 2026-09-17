import { useEffect, useMemo, useState } from 'react'
import { actions, useStore } from '../store'
import type { Appearance, Chrome } from '../types'
import { buildPalette, hexIsValid } from '../theme/palette'
import { Ph_ } from '../ui/Phosphor'

const CHROME_COPY: Record<Chrome, { name: string; desc: string }> = {
  subtle: { name: 'Subtle', desc: 'Chrome uses accent, a near-white with brand tint.' },
  solid: { name: 'Solid', desc: 'Accent at full strength. Buttons invert to stay visible.' },
  neutral: { name: 'Neutral', desc: 'Only buttons, links, and icons remain branded.' },
}

const CHROME_ORDER: Chrome[] = ['subtle', 'solid', 'neutral']

/* Building a palette runs the full Radix fit, and this panel needs three on
   every mount (one per chrome preview). Reopening the panel with the same
   colour shouldn't pay for that again. */
const paletteCache = new Map<string, ReturnType<typeof buildPalette>>()
function cachedPalette(appearance: Appearance, accent: string) {
  const key = `${appearance}:${accent.toLowerCase()}`
  let p = paletteCache.get(key)
  if (!p) {
    // Dragging the colour picker produces a stream of one-off colours.
    if (paletteCache.size > 48) paletteCache.clear()
    p = buildPalette(appearance, { accent })
    paletteCache.set(key, p)
  }
  return p
}

/** A miniature portal window in the chrome treatment, from the real generated scales. */
function ChromePreview({
  accent,
  appearance,
  chrome,
}: {
  accent: string
  appearance: Appearance
  chrome: Chrome
}) {
  const p = useMemo(() => cachedPalette(appearance, accent), [accent, appearance])
  const bar =
    chrome === 'solid' ? p.accentScale[8]
    : chrome === 'neutral' ? p.grayScale[1]
    : p.accentScale[1]
  const pill = chrome === 'solid' ? p.accentContrast : p.accentScale[8]
  const onBar = chrome === 'solid' ? `color-mix(in oklab, ${p.accentContrast} 55%, transparent)` : p.grayScale[6]

  return (
    <span className="cp" aria-hidden="true">
      <span className="cp-win" style={{ background: p.background }}>
        <span className="cp-bar" style={{ background: bar }}>
          <span className="cp-dash" style={{ background: onBar, width: 4 }} />
          <span className="cp-dash" style={{ background: onBar }} />
          <span className="cp-dash" style={{ background: onBar }} />
          <span className="cp-pill" style={{ background: pill }} />
        </span>
        <span className="cp-body">
          <span className="cp-side" style={{ background: bar }}>
            {[0, 1, 2, 3].map((i) => <span key={i} className="cp-line" style={{ background: onBar }} />)}
          </span>
          <span className="cp-main">
            <span className="cp-line" style={{ background: p.grayScale[7], width: '70%', height: 3 }} />
            {[0, 1, 2].map((i) => <span key={i} className="cp-line" style={{ background: p.grayScale[4] }} />)}
          </span>
        </span>
      </span>
    </span>
  )
}

export function ThemePanel() {
  const theme = useStore((s) => s.doc.theme)
  const [hex, setHex] = useState(theme.accent)

  useEffect(() => setHex(theme.accent), [theme.accent])

  const commitHex = (raw: string) => {
    const v = raw.trim().startsWith('#') ? raw.trim() : `#${raw.trim()}`
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) && hexIsValid(v)) {
      actions.setTheme({ accent: v })
    }
  }

  return (
    <div className="sect">
      <div className="field-ui">
        <label htmlFor="brand-hex">Brand colour</label>
        <div className="field-row">
          <div className="input-area">
            <Ph_ name="Palette" size={16} />
            <input
              id="brand-hex"
              value={hex}
              spellCheck={false}
              onChange={(e) => {
                setHex(e.target.value)
                commitHex(e.target.value)
              }}
              onBlur={() => setHex(theme.accent)}
            />
          </div>
          <span className="color-swatch" style={{ background: theme.accent }} title="Pick a colour">
            <input
              type="color"
              value={theme.accent}
              aria-label="Pick a brand colour"
              onChange={(e) => actions.setTheme({ accent: e.target.value })}
            />
          </span>
        </div>
      </div>

      <div className="field-ui">
        <label>Appearance</label>
        <div className="seg seg-fill">
          {(['light', 'dark'] as Appearance[]).map((a) => (
            <button
              key={a}
              className={theme.appearance === a ? 'on' : ''}
              onClick={() => actions.setTheme({ appearance: a })}
            >
              {a[0].toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="field-ui">
        <label>Theme</label>
        <div className="mode-list">
          {CHROME_ORDER.map((c) => (
            <button
              key={c}
              className={`mode ${theme.chrome === c ? 'on' : ''}`}
              onClick={() => actions.setTheme({ chrome: c })}
            >
              <ChromePreview accent={theme.accent} appearance={theme.appearance} chrome={c} />
              <span className="mode-text">
                <span className="mode-name">{CHROME_COPY[c].name}</span>
                <span className="mode-desc">{CHROME_COPY[c].desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="field-ui">
        <div className="row-between">
          <label>Corner radius</label>
          <span className="hint">{theme.radius}px</span>
        </div>
        <input
          className="slider"
          type="range"
          min={0}
          max={24}
          value={theme.radius}
          onChange={(e) => actions.setTheme({ radius: Number(e.target.value) })}
        />
      </div>
    </div>
  )
}
