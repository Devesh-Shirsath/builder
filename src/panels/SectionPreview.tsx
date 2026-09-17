import { memo, useLayoutEffect, useRef, useState } from 'react'
import { REGISTRY } from '../registry'
import { paletteTokens } from '../theme/palette'
import { fontStack } from '../theme/fonts'
import { useStore } from '../store'
import type { Section, SectionType, Surface } from '../types'
import { SectionProvider } from '../canvas/Bits'
import { SectionBody } from '../sections/render'

/** The width the section is laid out at before it's scaled into the thumbnail. */
const VIRTUAL_WIDTH = 1280
const WIDTHS = { compact: 960, default: 1120, wide: 1280 }

/**
 * A live, scaled-down render of one section layout — the real component, not a
 * wireframe — so the thumbnail carries the brand colour, chrome treatment,
 * appearance, radius and fonts exactly as the canvas will.
 */
export const SectionPreview = memo(function SectionPreview({
  type,
  variant,
  props,
  surface,
  maxHeight = 200,
  theme: override,
}: {
  type: SectionType
  variant: string
  props?: Record<string, any>
  surface?: Surface
  maxHeight?: number
  /** Preview a theme the document isn't using yet — a template card. */
  theme?: { accent: string; chrome: 'subtle' | 'solid' | 'neutral'; fontPrimary?: string; fontSecondary?: string }
}) {
  const docTheme = useStore((s) => s.doc.theme)
  const theme = override ? { ...docTheme, ...override } : docTheme
  const box = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const measure = () =>
      setSize({ w: box.current?.clientWidth ?? 0, h: inner.current?.offsetHeight ?? 0 })
    measure()
    const ro = new ResizeObserver(measure)
    if (box.current) ro.observe(box.current)
    if (inner.current) ro.observe(inner.current)
    return () => ro.disconnect()
  }, [])

  const def = REGISTRY[type]
  const v = def.variants.find((x) => x.id === variant)
  const section: Section = {
    id: `preview-${type}-${variant}`,
    type,
    variant,
    surface: surface ?? v?.surface ?? def.defaultSurface,
    props: props ?? def.defaults(),
  }

  // A template card carries its own palette; otherwise the preview inherits
  // the document's, which is already on `.app-root`.
  const tokens = override
    ? {
        ...(paletteTokens(theme.accent, theme.appearance) as Record<string, string>),
        '--font-primary': fontStack(theme.fontPrimary),
        '--font-secondary': fontStack(theme.fontSecondary),
      }
    : undefined

  const scale = size.w ? size.w / VIRTUAL_WIDTH : 0
  const full = size.h * scale
  const clipped = full > maxHeight

  return (
    <div
      ref={box}
      className={`sp ${clipped ? 'clipped' : ''}`}
      style={{ height: scale ? Math.min(full, maxHeight) : maxHeight * 0.6 }}
      aria-hidden="true"
    >
      <div
        ref={inner}
        className="site sp-site"
        data-appearance={theme.appearance}
        data-chrome={theme.chrome}
        style={{
          ...tokens,
          width: VIRTUAL_WIDTH,
          transform: `scale(${scale})`,
          visibility: scale ? 'visible' : 'hidden',
          '--radius': `${theme.radius}px`,
          '--maxw': `${WIDTHS[theme.width]}px`,
          '--fs': String(theme.fontScale),
        } as React.CSSProperties}
      >
        <section className={`surface surf-${section.surface} ${type === 'nav' || type === 'footer' ? 'chrome-surface' : ''}`}>
          <SectionProvider value={{ id: section.id, props: section.props, editing: false }}>
            <SectionBody section={section} />
          </SectionProvider>
        </section>
      </div>
    </div>
  )
})
