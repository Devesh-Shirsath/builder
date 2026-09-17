import { useEffect } from 'react'

/**
 * The typefaces the admin can pick for the published portal. Two roles:
 *   primary   — headings and display text (--font-primary)
 *   secondary — body copy and interface text (--font-secondary)
 * Code stays monospaced regardless, so neither role touches it.
 */

export type FontKind = 'Sans serif' | 'Display' | 'Serif' | 'System'

export interface FontDef {
  family: string
  kind: FontKind
  /** System stacks need no network request. */
  google: boolean
}

export const FONTS: FontDef[] = [
  { family: 'Inter', kind: 'Sans serif', google: true },
  { family: 'Geist', kind: 'Sans serif', google: true },
  { family: 'DM Sans', kind: 'Sans serif', google: true },
  { family: 'Manrope', kind: 'Sans serif', google: true },
  { family: 'Plus Jakarta Sans', kind: 'Sans serif', google: true },
  { family: 'IBM Plex Sans', kind: 'Sans serif', google: true },
  { family: 'Work Sans', kind: 'Sans serif', google: true },
  { family: 'Figtree', kind: 'Sans serif', google: true },
  { family: 'Space Grotesk', kind: 'Display', google: true },
  { family: 'Sora', kind: 'Display', google: true },
  { family: 'Outfit', kind: 'Display', google: true },
  { family: 'Poppins', kind: 'Display', google: true },
  { family: 'Fraunces', kind: 'Serif', google: true },
  { family: 'Playfair Display', kind: 'Serif', google: true },
  { family: 'Lora', kind: 'Serif', google: true },
  { family: 'Source Serif 4', kind: 'Serif', google: true },
  { family: 'System UI', kind: 'System', google: false },
]

export const FONT_KINDS: FontKind[] = ['Sans serif', 'Display', 'Serif', 'System']

export const DEFAULT_FONT = 'Inter'

const SANS = 'ui-sans-serif, system-ui, -apple-system, sans-serif'
const SERIF = 'ui-serif, Georgia, serif'

/** A CSS font-family value with a fallback that matches the face's genre. */
export function fontStack(family: string = DEFAULT_FONT): string {
  const def = FONTS.find((f) => f.family === family)
  if (!def || !def.google) return SANS
  return `"${family}", ${def.kind === 'Serif' ? SERIF : SANS}`
}

// index.html already requests Inter.
const requested = new Set<string>(['Inter'])

export function loadFont(family: string) {
  const def = FONTS.find((f) => f.family === family)
  if (!def?.google || requested.has(family)) return
  requested.add(family)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  // One request per family: a weight one family lacks fails the whole css2 call.
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`
  document.head.appendChild(link)
}

export function useFonts(families: string[]) {
  const key = families.join('|')
  useEffect(() => {
    key.split('|').forEach(loadFont)
  }, [key])
}
