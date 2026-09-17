import type { Doc, SectionType } from './types'
import { createSection } from './registry'
import { defaultDoc } from './store'

/**
 * Starting points offered on the v2 start screen. A template is a theme plus
 * an ordered home page; every other page keeps its starter content, so the
 * admin can explore the rest of the portal straight away.
 */
export interface TemplateDef {
  id: string
  name: string
  /** Two words, generic — what the picker shows. */
  short: string
  tagline: string
  description: string
  accent: string
  chrome: Doc['theme']['chrome']
  fontPrimary: string
  fontSecondary: string
  /** Home page, in order: [section type, layout]. */
  sections: [SectionType, string][]
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'developer-portal',
    short: 'Full portal',
    name: 'Developer portal',
    tagline: 'Everything, in the recommended order',
    description: 'The full launch page: hero, awards, APIs, onboarding, solutions, resources and FAQ.',
    accent: '#4f46e5',
    chrome: 'subtle',
    fontPrimary: 'Inter',
    fontSecondary: 'Inter',
    sections: [
      ['hero', 'split'], ['awards', 'spotlight'], ['featuredApis', 'grid'],
      ['marketplace', 'list'], ['gettingStarted', 'cards'], ['solution', 'sidebar'],
      ['whyChooseUs', 'illustrated'], ['contact', 'cta-form'], ['resources', 'bento'],
      ['partners', 'row'], ['references', 'split-banner'], ['faq', 'numbered'],
    ],
  },
  {
    id: 'api-marketplace',
    short: 'API catalogue',
    name: 'API marketplace',
    tagline: 'Lead with the catalogue',
    description: 'For teams selling APIs: the product up front, then categories, a live try-out and pricing-style FAQs.',
    accent: '#0d9488',
    chrome: 'subtle',
    fontPrimary: 'Space Grotesk',
    fontSecondary: 'IBM Plex Sans',
    sections: [
      ['hero', 'centered'], ['featuredApis', 'tabs'], ['marketplace', 'carousel'],
      ['solution', 'sidebar'], ['references', 'showcase'], ['faq', 'numbered'],
    ],
  },
  {
    id: 'partner-launch',
    short: 'Partner launch',
    name: 'Partner launch',
    tagline: 'Built to win partners',
    description: 'Trust first: recognition, reasons to build with you, the onboarding path and a direct enquiry form.',
    accent: '#b91c1c',
    chrome: 'solid',
    fontPrimary: 'Fraunces',
    fontSecondary: 'Inter',
    sections: [
      ['hero', 'split'], ['awards', 'cards'], ['whyChooseUs', 'bento'],
      ['gettingStarted', 'split'], ['partners', 'row'], ['contact', 'cta-form'],
    ],
  },
  {
    id: 'docs-first',
    short: 'Docs first',
    name: 'Docs first',
    tagline: 'Quiet, technical, fast to read',
    description: 'A restrained page for documentation-led products: product shot, steps, capabilities and answers.',
    accent: '#0f172a',
    chrome: 'neutral',
    fontPrimary: 'Geist',
    fontSecondary: 'Geist',
    sections: [
      ['hero', 'centered'], ['gettingStarted', 'grid'], ['marketplace', 'list'],
      ['resources', 'bento'], ['partners', 'row'], ['faq', 'numbered'],
    ],
  },
]

function withHome(body: ReturnType<typeof createSection>[], theme: Partial<Doc['theme']>): Doc {
  const doc = defaultDoc()
  return {
    ...doc,
    theme: { ...doc.theme, ...theme },
    pages: { ...doc.pages, home: { ...doc.pages.home, body } },
  }
}

export function docFromTemplate(t: TemplateDef): Doc {
  return withHome(
    t.sections.map(([type, variant]) => createSection(type, variant)),
    { accent: t.accent, chrome: t.chrome, fontPrimary: t.fontPrimary, fontSecondary: t.fontSecondary },
  )
}

/** An empty home page — nav and footer only, waiting for dropped sections. */
export function blankDoc(): Doc {
  return withHome([], {})
}
