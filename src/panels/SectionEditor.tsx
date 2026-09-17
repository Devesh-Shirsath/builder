import { useMemo } from 'react'
import { actions, useStore } from '../store'
import { REGISTRY } from '../registry'
import type { Field, Section, Surface } from '../types'
import type { GeneratedPalette as Palette } from '../theme/palette'
import { buildPalette } from '../theme/palette'
import { Icon } from '../ui/Icon'
import { Ph_ } from '../ui/Phosphor'
import { FieldList } from './Fields'
import { SectionPreview } from './SectionPreview'

/** `swatch` picks the colour to show from the generated palette. */
const SURFACES: { id: Surface; label: string; swatch: (p: Palette, dark: Palette) => string }[] = [
  { id: 'page', label: 'Page', swatch: (p) => p.background },
  { id: 'muted', label: 'Tinted', swatch: (p) => p.accentScale[1] },
  { id: 'brand', label: 'Brand', swatch: (p) => p.accentScale[8] },
  { id: 'inverted', label: 'Dark', swatch: (_p, dark) => dark.grayScale[1] },
]

function SurfacePicker({ sectionId, current }: { sectionId: string; current: Surface }) {
  const theme = useStore((s) => s.doc.theme)
  const palette = useMemo(
    () => buildPalette(theme.appearance, { accent: theme.accent }),
    [theme.accent, theme.appearance],
  )
  const darkPalette = useMemo(
    () => (theme.appearance === 'dark' ? palette : buildPalette('dark', { accent: theme.accent })),
    [theme.appearance, theme.accent, palette],
  )
  return (
    <div className="surface-grid">
      {SURFACES.map((s) => (
        <button
          key={s.id}
          className={`surf-swatch ${current === s.id ? 'on' : ''}`}
          onClick={() => actions.setSurface(sectionId, s.id)}
        >
          <span className="surf-chip" style={{ background: s.swatch(palette, darkPalette) }} />
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  )
}

/** Each divider in a schema starts a new titled panel section. */
function splitSections(fields: Field[]) {
  const out: { title: string; fields: Field[] }[] = [{ title: 'Content', fields: [] }]
  for (const f of fields) {
    if (f.kind === 'divider') out.push({ title: f.label ?? '', fields: [] })
    else out[out.length - 1].fields.push(f)
  }
  return out.filter((s) => s.fields.length)
}

/** Level two of the left panel: everything about one section. */
export function SectionEditor({ section, pinned }: { section: Section; pinned: boolean }) {
  const def = REGISTRY[section.type]
  const count = def.variants.length
  const groups = useMemo(() => splitSections(def.fields), [def])

  return (
    <>
      {count > 1 && (
        <div className="sect">
          <div className="sect-label">
            Layout
            <span className="sect-meta">{count} layouts</span>
          </div>
          <div className="variant-list">
            {def.variants.map((v) => {
              const on = section.variant === v.id
              return (
                <button
                  key={v.id}
                  className={`variant ${on ? 'on' : ''}`}
                  onClick={() => actions.setVariant(section.id, v.id)}
                  aria-pressed={on}
                  title={v.label}
                >
                  <SectionPreview
                    type={section.type}
                    variant={v.id}
                    props={section.props}
                    surface={on ? section.surface : v.surface ?? section.surface}
                    maxHeight={96}
                  />
                  {on && <Ph_ name="CheckCircle" size={16} weight="fill" className="variant-check" />}
                  <span className="variant-name">{v.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="sect">
        <div className="sect-label">Background</div>
        <SurfacePicker sectionId={section.id} current={section.surface} />
      </div>

      {groups.map((g) => (
        <div className="sect" key={g.title}>
          <div className="sect-label">{g.title}</div>
          <FieldList sectionId={section.id} fields={g.fields} />
        </div>
      ))}

      {!pinned && (
        <div className="sect">
          <button className="btn-ui outline danger" style={{ width: '100%' }} onClick={() => actions.removeSection(section.id)}>
            <Icon name="trash" size={13} /> Delete section
          </button>
        </div>
      )}
    </>
  )
}
