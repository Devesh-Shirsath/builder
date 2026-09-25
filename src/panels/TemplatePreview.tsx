import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { SectionProvider } from '../canvas/Bits'
import { SectionBody } from '../sections/render'
import { docFromTemplate, type TemplateDef } from '../templates'
import { fontStack } from '../theme/fonts'
import { paletteTokens } from '../theme/palette'
import type { Section } from '../types'

const VIRTUAL_WIDTH = 1280
const WIDTHS = { compact: 960, default: 1120, wide: 1280 }
const INERT: any = { inert: '' }

/** A complete, live portal page scaled into the template chooser. */
export function TemplatePreview({ template }: { template: TemplateDef }) {
  const doc = useMemo(() => docFromTemplate(template), [template])
  const page = doc.pages.home
  const box = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const measure = () => setSize({
      width: box.current?.clientWidth ?? 0,
      height: inner.current?.offsetHeight ?? 0,
    })
    measure()
    const observer = new ResizeObserver(measure)
    if (box.current) observer.observe(box.current)
    if (inner.current) observer.observe(inner.current)
    return () => observer.disconnect()
  }, [template.id])

  const scale = size.width ? size.width / VIRTUAL_WIDTH : 0
  const tokens = {
    ...(paletteTokens(doc.theme.accent, doc.theme.appearance) as Record<string, string>),
    '--font-primary': fontStack(doc.theme.fontPrimary),
    '--font-secondary': fontStack(doc.theme.fontSecondary),
    '--radius': `${doc.theme.radius}px`,
    '--maxw': `${WIDTHS[doc.theme.width]}px`,
    '--fs': String(doc.theme.fontScale),
  }

  const renderSection = (section: Section, pinned = false) => (
    <section
      key={section.id}
      className={`surface surf-${section.surface} ${pinned ? 'chrome-surface' : ''}`}
    >
      <SectionProvider value={{ id: section.id, props: section.props, editing: false, interactive: false }}>
        <SectionBody section={section} />
      </SectionProvider>
    </section>
  )

  return (
    <div
      ref={box}
      className="template-page-preview"
      style={{ height: scale ? size.height * scale : 420 }}
      aria-hidden="true"
      {...INERT}
    >
      <div
        ref={inner}
        className="site template-page-site"
        data-appearance={doc.theme.appearance}
        data-chrome={doc.theme.chrome}
        style={{
          ...tokens,
          width: VIRTUAL_WIDTH,
          transform: `scale(${scale})`,
          visibility: scale ? 'visible' : 'hidden',
        } as React.CSSProperties}
      >
        {!doc.nav.hidden && renderSection(doc.nav, true)}
        {page.body.map((section) => renderSection(section))}
        {!doc.footer.hidden && renderSection(doc.footer, true)}
      </div>
    </div>
  )
}
