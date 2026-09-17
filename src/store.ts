import { useSyncExternalStore } from 'react'
import type { Doc, Page, PageId, Section, Selection, SectionType, Surface } from './types'
import { REGISTRY, createSection, uid } from './registry'
import { HOME_TYPES } from './registry.portal'

/* --------------------------------------------------------- path helpers */

/** Parse `items[2].title` into ['items', 2, 'title']. */
export function parsePath(path: string): (string | number)[] {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .map((k) => (/^\d+$/.test(k) ? Number(k) : k))
}

export function getAt(obj: any, path: string): any {
  return parsePath(path).reduce((acc, k) => (acc == null ? acc : acc[k as any]), obj)
}

/** Immutable set. Clones only the nodes along the path. */
export function setAt<T>(obj: T, path: string, value: any): T {
  const keys = parsePath(path)
  if (!keys.length) return value
  const clone = (node: any, i: number): any => {
    const key = keys[i]
    const base = Array.isArray(node) ? [...node] : { ...(node ?? {}) }
    base[key as any] = i === keys.length - 1 ? value : clone(node?.[key as any], i + 1)
    return base
  }
  return clone(obj, 0)
}

/* ---------------------------------------------------------- the default */

/**
 * Two iterations of the builder live side by side so they can be compared:
 *   v1  the section catalogue — every page starts filled in
 *   v2  onboarding — pick a template or start from a blank canvas
 * Each keeps its own document, so switching between them loses no work.
 */
export type BuilderVersion = 'v1' | 'v2'

// v5: the home catalogue was rebuilt from the Figma layouts; older documents
// reference section types that no longer exist.
const LEGACY_DOC_KEY = 'site-builder:doc:v5'
const docKey = (v: BuilderVersion) => `${LEGACY_DOC_KEY}:${v}`
const startedKey = (v: BuilderVersion) => `site-builder:started:${v}`
const VERSION_KEY = 'site-builder:version'

function page(
  id: PageId,
  name: string,
  hasChrome: boolean,
  insertable: SectionType[],
  body: Section[],
): Page {
  return { id, name, hasChrome, insertable, body }
}

export function defaultDoc(): Doc {
  const pages: Record<PageId, Page> = {
    home: page('home', 'Home', true, HOME_TYPES, [
      createSection('hero', 'split'),
      createSection('awards', 'spotlight'),
      createSection('featuredApis', 'grid'),
      createSection('marketplace', 'list'),
      createSection('gettingStarted', 'cards'),
      createSection('solution', 'sidebar'),
      createSection('whyChooseUs', 'illustrated'),
      createSection('contact', 'cta-form'),
      createSection('resources', 'bento'),
      createSection('partners', 'row'),
      createSection('references', 'split-banner'),
      createSection('faq', 'numbered'),
    ]),
    auth: page('auth', 'Sign in', false, [], [createSection('auth', 'split-right')]),
    signup: page('signup', 'Sign-up form', false, [], [createSection('signupForm', 'card')]),
    guides: page('guides', 'Guides', true, ['docsIndex', 'cta', 'faq'], [
      createSection('docsIndex', 'cards'),
      createSection('cta', 'centered'),
    ]),
    reference: page('reference', 'API reference', true, ['apiReference', 'cta'], [
      createSection('apiReference', 'sidebar'),
    ]),
    recipes: page('recipes', 'Product recipes', true, ['recipes', 'cta', 'faq'], [
      createSection('recipes', 'featured'),
      createSection('cta', 'centered'),
    ]),
    contact: page('contact', 'Contact us', true, ['contact', 'faq', 'partners', 'references', 'resources'], [
      createSection('contact', 'cta-form'),
      createSection('faq', 'numbered'),
    ]),
  }

  return {
    theme: {
      accent: '#4f46e5',
      appearance: 'light',
      chrome: 'subtle',
      radius: 8,
      fontScale: 1,
      width: 'default',
      fontPrimary: 'Inter',
      fontSecondary: 'Inter',
    },
    nav: createSection('nav'),
    footer: createSection('footer', 'columns'),
    pages,
    pageOrder: ['home', 'auth', 'signup', 'guides', 'reference', 'recipes', 'contact'],
  }
}

/* ------------------------------------------------------------ the store */

interface State {
  doc: Doc
  /**
   * 'portal' is the developer portal an admin browses; 'builder' is the
   * customise surface, reached from the Customise tab in the rail. Entering
   * the builder collapses the portal nav — the square icon brings it back.
   */
  appMode: 'portal' | 'builder'
  /** The portal's rail + tree sidebar. Collapsed by default in the builder. */
  navOpen: boolean
  /** Which rail entry is active in portal mode. */
  railId: string
  /** Which endpoint the reference page is showing. */
  endpointId: string
  pageId: PageId
  /** Which level the left panel is showing. Section drill-down is driven by
      `selection`; 'theme' and 'typography' are the branches that aren't sections. */
  panel: 'root' | 'theme' | 'typography'
  /** Which iteration of the builder is running. */
  version: BuilderVersion
  /** v2 only: false until a template or a blank canvas has been chosen. */
  started: boolean
  /** v2 only: the open section library, and where a click would insert. */
  library: { at: number } | null
  selection: Selection | null
  /** Which tab of the left panel is showing: the current page, or the global
      theme & typography settings that apply to every page. */
  sidebarTab: 'page' | 'styles'
  /** A request to scroll the canvas to a section. `n` changes on every request,
      so picking the same row twice still scrolls back to it. */
  reveal: { id: string; n: number } | null
  hovered: string | null
  device: 'desktop' | 'tablet' | 'mobile'
  preview: boolean
  past: Doc[]
  future: Doc[]
}

const initialVersion = loadVersion()

let state: State = {
  version: initialVersion,
  started: isStarted(initialVersion),
  library: null,
  doc: load(initialVersion) ?? defaultDoc(),
  appMode: 'portal',
  navOpen: true,
  railId: 'references',
  endpointId: 'cancel-payment',
  pageId: 'home',
  panel: 'root',
  selection: null,
  sidebarTab: 'page',
  reveal: null,
  hovered: null,
  device: 'desktop',
  preview: false,
  past: [],
  future: [],
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => sel(state),
    () => sel(state),
  )
}

export const getState = () => state

function loadVersion(): BuilderVersion {
  try {
    return localStorage.getItem(VERSION_KEY) === 'v2' ? 'v2' : 'v1'
  } catch {
    return 'v1'
  }
}

/** v1 is always "started"; it has no start screen. */
function isStarted(v: BuilderVersion): boolean {
  if (v === 'v1') return true
  try {
    return localStorage.getItem(startedKey(v)) === '1'
  } catch {
    return false
  }
}

function load(version: BuilderVersion): Doc | null {
  try {
    // v1 inherits the document saved before the versions existed.
    const raw = localStorage.getItem(docKey(version))
      ?? (version === 'v1' ? localStorage.getItem(LEGACY_DOC_KEY) : null)
    if (!raw) return null
    const doc = JSON.parse(raw) as Doc
    if (!doc?.pages || !doc?.pageOrder || !doc?.theme?.accent) return null
    return doc
  } catch {
    return null
  }
}

let saveTimer: number | undefined
function persist(doc: Doc) {
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(docKey(state.version), JSON.stringify(doc))
    } catch {
      /* quota or private mode — the prototype just keeps going */
    }
  }, 250)
}

/** Mutate the doc, pushing the previous version onto the undo stack. */
function commit(next: Doc, { merge = false } = {}) {
  const prev = state.doc
  if (next === prev) return
  // `merge` collapses rapid typing into a single undo entry.
  const past = merge && state.past.length ? state.past : [...state.past, prev].slice(-60)
  state = { ...state, doc: next, past, future: [] }
  persist(next)
  emit()
}

function patch(p: Partial<State>) {
  state = { ...state, ...p }
  emit()
}

/* -------------------------------------------------------------- lookups */

export const currentPage = (s: State = state): Page => s.doc.pages[s.pageId]

/** Sections reachable from the page currently on screen. */
export function visibleSections(s: State = state): Section[] {
  const p = currentPage(s)
  return p.hasChrome ? [s.doc.nav, ...p.body, s.doc.footer] : [...p.body]
}

export function findSection(id: string, s: State = state): Section | undefined {
  if (s.doc.nav.id === id) return s.doc.nav
  if (s.doc.footer.id === id) return s.doc.footer
  for (const pid of s.doc.pageOrder) {
    const hit = s.doc.pages[pid].body.find((x) => x.id === id)
    if (hit) return hit
  }
  return undefined
}

function replaceSection(doc: Doc, id: string, fn: (s: Section) => Section): Doc {
  if (doc.nav.id === id) return { ...doc, nav: fn(doc.nav) }
  if (doc.footer.id === id) return { ...doc, footer: fn(doc.footer) }
  const pages = { ...doc.pages }
  let touched = false
  for (const pid of doc.pageOrder) {
    const p = pages[pid]
    if (p.body.some((s) => s.id === id)) {
      pages[pid] = { ...p, body: p.body.map((s) => (s.id === id ? fn(s) : s)) }
      touched = true
      break
    }
  }
  return touched ? { ...doc, pages } : doc
}

function withBody(doc: Doc, pageId: PageId, fn: (body: Section[]) => Section[]): Doc {
  const p = doc.pages[pageId]
  return { ...doc, pages: { ...doc.pages, [pageId]: { ...p, body: fn(p.body) } } }
}

/* -------------------------------------------------------------- actions */

let lastEditKey = ''
let lastEditAt = 0

export const actions = {
  openBuilder() {
    // The portal nav collapses on entry, as specified — the builder gets the
    // full width and the square icon restores the nav. The panel always opens
    // at its root level rather than resuming a drill-down from last time.
    patch({
      appMode: 'builder',
      railId: 'customise',
      navOpen: false,
      panel: 'root',
      selection: null,
    })
  },
  openPortal(railId = 'references') {
    patch({ appMode: 'portal', railId, navOpen: true })
  },
  setRail(railId: string) {
    if (railId === 'customise') {
      actions.openBuilder()
      return
    }
    patch({ appMode: 'portal', railId, navOpen: true })
  },
  toggleNav() {
    patch({ navOpen: !state.navOpen })
  },
  setEndpoint(endpointId: string) {
    patch({ endpointId })
  },
  setPage(pageId: PageId) {
    patch({ pageId, selection: null, hovered: null, panel: 'root' })
  },
  select(sel: Selection | null) {
    // Picking something on the canvas always brings its fields into view,
    // even from the theme & typography tab.
    patch(sel ? { selection: sel, panel: 'root', sidebarTab: 'page' } : { selection: null, panel: 'root' })
  },
  setSidebarTab(sidebarTab: State['sidebarTab']) {
    patch({ sidebarTab })
  },

  openLibrary(at: number) {
    patch({ library: { at }, selection: null })
  },
  closeLibrary() {
    patch({ library: null })
  },

  /** Switch iteration. Each version keeps its own document and start state. */
  setVersion(version: BuilderVersion) {
    if (version === state.version) return
    try {
      localStorage.setItem(VERSION_KEY, version)
    } catch {
      /* private mode — the switch still applies for this session */
    }
    state = {
      ...state,
      version,
      started: isStarted(version),
      doc: load(version) ?? defaultDoc(),
      past: [],
      future: [],
      pageId: 'home',
      panel: 'root',
      sidebarTab: 'page',
      selection: null,
      reveal: null,
      preview: false,
    }
    emit()
  },

  /** Leave the v2 start screen with the chosen document. */
  startWith(doc: Doc) {
    try {
      localStorage.setItem(startedKey(state.version), '1')
    } catch {
      /* ignore */
    }
    state = {
      ...state,
      doc,
      started: true,
      past: [],
      future: [],
      pageId: 'home',
      panel: 'root',
      sidebarTab: 'page',
      selection: null,
      reveal: null,
    }
    persist(doc)
    emit()
  },

  /** Back to the start screen, keeping the current document until a choice is made. */
  restart() {
    try {
      localStorage.removeItem(startedKey(state.version))
    } catch {
      /* ignore */
    }
    patch({ started: false, selection: null, preview: false })
  },
  /** Select a section from the layer list and bring it into view on the canvas.
      Canvas clicks use `select` instead — the element is already on screen. */
  revealSection(id: string) {
    patch({ selection: { sectionId: id }, panel: 'root', sidebarTab: 'page', reveal: { id, n: Date.now() } })
  },
  openTheme() {
    patch({ panel: 'theme', selection: null })
  },
  openTypography() {
    patch({ panel: 'typography', selection: null })
  },
  /** Back out of whatever the panel drilled into. */
  panelBack() {
    patch({ panel: 'root', selection: null, library: null })
  },
  hover(id: string | null) {
    if (state.hovered !== id) patch({ hovered: id })
  },
  setDevice(device: State['device']) {
    patch({ device })
  },
  setPreview(preview: boolean) {
    patch({ preview, selection: preview ? null : state.selection })
  },

  setTheme(partial: Partial<Doc['theme']>) {
    const key = `theme:${Object.keys(partial).join(',')}`
    const merge = key === lastEditKey && Date.now() - lastEditAt < 700
    lastEditKey = key
    lastEditAt = Date.now()
    commit({ ...state.doc, theme: { ...state.doc.theme, ...partial } }, { merge })
  },

  /** Edit one field inside a section. Rapid edits to the same field merge. */
  setProp(sectionId: string, path: string, value: any) {
    const key = `${sectionId}:${path}`
    const merge = key === lastEditKey && Date.now() - lastEditAt < 700
    lastEditKey = key
    lastEditAt = Date.now()
    commit(
      replaceSection(state.doc, sectionId, (s) => ({ ...s, props: setAt(s.props, path, value) })),
      { merge },
    )
  },

  setVariant(sectionId: string, variant: string) {
    lastEditKey = ''
    // A layout designed on a particular background brings it along.
    commit(
      replaceSection(state.doc, sectionId, (s) => {
        const v = REGISTRY[s.type].variants.find((x) => x.id === variant)
        return { ...s, variant, surface: v?.surface ?? s.surface }
      }),
    )
  },

  setSurface(sectionId: string, surface: Surface) {
    lastEditKey = ''
    commit(replaceSection(state.doc, sectionId, (s) => ({ ...s, surface })))
  },

  /** Show or hide the shared header or footer. Undoable, like any other edit. */
  setSectionHidden(sectionId: string, hidden: boolean) {
    lastEditKey = ''
    commit(replaceSection(state.doc, sectionId, (s) => ({ ...s, hidden })))
  },

  addListItem(sectionId: string, path: string, item: any) {
    lastEditKey = ''
    const section = findSection(sectionId)
    if (!section) return
    const list = (getAt(section.props, path) as any[]) ?? []
    setRaw(sectionId, path, [...list, item])
  },

  removeListItem(sectionId: string, path: string, index: number) {
    lastEditKey = ''
    const section = findSection(sectionId)
    if (!section) return
    const list = (getAt(section.props, path) as any[]) ?? []
    setRaw(sectionId, path, list.filter((_, i) => i !== index))
  },

  moveListItem(sectionId: string, path: string, index: number, dir: -1 | 1) {
    lastEditKey = ''
    const section = findSection(sectionId)
    if (!section) return
    const list = [...((getAt(section.props, path) as any[]) ?? [])]
    const target = index + dir
    if (target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    setRaw(sectionId, path, list)
  },

  /** Drag-and-drop in a list: move one item to another index. */
  reorderListItem(sectionId: string, path: string, from: number, to: number) {
    lastEditKey = ''
    const section = findSection(sectionId)
    if (!section) return
    const list = [...((getAt(section.props, path) as any[]) ?? [])]
    if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return
    const [item] = list.splice(from, 1)
    list.splice(to, 0, item)
    setRaw(sectionId, path, list)
  },

  duplicateListItem(sectionId: string, path: string, index: number) {
    lastEditKey = ''
    const section = findSection(sectionId)
    if (!section) return
    const list = [...((getAt(section.props, path) as any[]) ?? [])]
    list.splice(index + 1, 0, JSON.parse(JSON.stringify(list[index])))
    setRaw(sectionId, path, list)
  },

  insertSection(type: SectionType, index: number, variant?: string) {
    lastEditKey = ''
    const section = createSection(type, variant)
    commit(
      withBody(state.doc, state.pageId, (body) => {
        const next = [...body]
        next.splice(Math.max(0, Math.min(index, next.length)), 0, section)
        return next
      }),
    )
    patch({
      selection: { sectionId: section.id },
      library: null,
      reveal: { id: section.id, n: Date.now() },
    })
    return section.id
  },

  removeSection(id: string) {
    lastEditKey = ''
    commit(withBody(state.doc, state.pageId, (body) => body.filter((s) => s.id !== id)))
    if (state.selection?.sectionId === id) patch({ selection: null })
  },

  duplicateSection(id: string) {
    lastEditKey = ''
    const body = currentPage().body
    const index = body.findIndex((s) => s.id === id)
    if (index < 0) return
    const copy: Section = JSON.parse(JSON.stringify(body[index]))
    copy.id = uid()
    commit(
      withBody(state.doc, state.pageId, (b) => {
        const next = [...b]
        next.splice(index + 1, 0, copy)
        return next
      }),
    )
    patch({ selection: { sectionId: copy.id }, reveal: { id: copy.id, n: Date.now() } })
  },

  moveSection(id: string, dir: -1 | 1) {
    lastEditKey = ''
    commit(
      withBody(state.doc, state.pageId, (b) => {
        const next = [...b]
        const i = next.findIndex((s) => s.id === id)
        const j = i + dir
        if (i < 0 || j < 0 || j >= next.length) return b
        ;[next[i], next[j]] = [next[j], next[i]]
        return next
      }),
    )
    patch({ reveal: { id, n: Date.now() } })
  },

  reorderSection(id: string, toIndex: number) {
    lastEditKey = ''
    commit(
      withBody(state.doc, state.pageId, (b) => {
        const next = [...b]
        const from = next.findIndex((s) => s.id === id)
        if (from < 0) return b
        const [item] = next.splice(from, 1)
        next.splice(Math.max(0, Math.min(toIndex, next.length)), 0, item)
        return next
      }),
    )
    // Follow the section to its new home, so a drop in the list is visible on
    // the canvas too.
    patch({ reveal: { id, n: Date.now() } })
  },

  resetSectionContent(id: string) {
    lastEditKey = ''
    commit(replaceSection(state.doc, id, (s) => ({ ...s, props: REGISTRY[s.type].defaults() })))
  },

  undo() {
    if (!state.past.length) return
    const past = [...state.past]
    const prev = past.pop()!
    state = { ...state, doc: prev, past, future: [state.doc, ...state.future].slice(0, 60) }
    persist(prev)
    lastEditKey = ''
    emit()
  },

  redo() {
    if (!state.future.length) return
    const [next, ...future] = state.future
    state = { ...state, doc: next, past: [...state.past, state.doc], future }
    persist(next)
    lastEditKey = ''
    emit()
  },

  replaceDoc(doc: Doc) {
    lastEditKey = ''
    commit(doc)
    patch({ selection: null, panel: 'root', pageId: doc.pageOrder[0] ?? 'home' })
  },

  resetAll() {
    lastEditKey = ''
    commit(defaultDoc())
    patch({ selection: null, panel: 'root', pageId: 'home' })
  },
}

/** Internal: set without the typing-merge heuristic. */
function setRaw(sectionId: string, path: string, value: any) {
  commit(replaceSection(state.doc, sectionId, (s) => ({ ...s, props: setAt(s.props, path, value) })))
}
