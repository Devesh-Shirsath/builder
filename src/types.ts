import type { Appearance } from './theme/palette'

export type { Appearance }

/**
 * How the chrome — the portal rail, tree sidebar and the published site's
 * nav/footer — uses the brand. Each treatment only re-points role tokens, so
 * no component rule is duplicated.
 */
export type Chrome = 'subtle' | 'solid' | 'neutral'

export type Surface = 'page' | 'muted' | 'brand' | 'inverted'

export type SectionType =
  // site chrome
  | 'nav' | 'footer'
  // home — one per row of the Figma layout catalogue
  | 'hero' | 'awards' | 'featuredApis' | 'marketplace' | 'gettingStarted' | 'solution'
  | 'whyChooseUs' | 'contact' | 'resources' | 'partners' | 'references' | 'faq'
  // other portal pages
  | 'cta' | 'auth' | 'signupForm' | 'docsIndex' | 'apiReference' | 'recipes'

export interface Section {
  id: string
  type: SectionType
  variant: string
  surface: Surface
  props: Record<string, any>
  /** Site chrome can be switched off without losing what's in it. */
  hidden?: boolean
}

export type PageId = 'home' | 'auth' | 'signup' | 'contact' | 'guides' | 'reference' | 'recipes'

export interface Page {
  id: PageId
  name: string
  /** Auth and the sign-up form stand alone — no site nav or footer around them. */
  hasChrome: boolean
  /** Section types the user may add to this page. Empty means "the page is fixed". */
  insertable: SectionType[]
  body: Section[]
}

export interface Theme {
  /** The one colour the admin picks. Everything else is derived from it. */
  accent: string
  appearance: Appearance
  chrome: Chrome
  radius: number
  fontScale: number
  width: 'compact' | 'default' | 'wide'
  /** Headings and display text. Optional so documents saved before it load. */
  fontPrimary?: string
  /** Body and interface text. */
  fontSecondary?: string
}

export interface Doc {
  theme: Theme
  /** Shared across every page that opts into chrome. */
  nav: Section
  footer: Section
  pages: Record<PageId, Page>
  pageOrder: PageId[]
}

/** What is currently selected on the canvas. `path` is the field inside the section. */
export interface Selection {
  sectionId: string
  path?: string
}

/* --------------------------------------------------------------- fields */

export type Field = (
  | { kind: 'text'; path: string; label: string; multiline?: boolean; placeholder?: string }
  | { kind: 'image'; path: string; label: string }
  | { kind: 'icon'; path: string; label: string }
  | { kind: 'select'; path: string; label: string; options: { value: string; label: string }[] }
  /** `children` are the fields this switch turns on; they render inside it. */
  | { kind: 'toggle'; path: string; label: string; children?: Field[] }
  /** Fields that read as one thing, e.g. a button's label and its link. */
  | { kind: 'group'; label: string; children: Field[] }
  | { kind: 'divider'; label?: string }
  | {
      kind: 'list'
      path: string
      label: string
      itemTitle: string        // path *inside* an item used as its row label
      itemFields: Field[]
      template: () => any
      max?: number
      addLabel?: string
      /** Offer a menu of ready-made items instead of one blank template. */
      presets?: { label: string; hint?: string; make: () => any }[]
    }
) & {
  /** Only show this control for the listed section layouts. */
  variants?: string[]
}

export interface VariantDef {
  id: string
  label: string
  /** The background the layout was designed on; applied when switching to it. */
  surface?: Surface
}

export interface SectionDef {
  type: SectionType
  label: string
  description: string
  icon: string
  variants: VariantDef[]
  defaultSurface: Surface
  fields: Field[]
  defaults: () => Record<string, any>
}
