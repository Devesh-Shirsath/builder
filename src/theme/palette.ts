import Color from 'colorjs.io'
import { gray, mauve, slate, sage, olive, sand } from '@radix-ui/colors'
import { generateRadixColors } from './generate-radix-colors'

/**
 * Ported from the dvsh `radix-brand-prototype` branch (lib/palette.ts).
 *
 * One difference from the source: that project emits a `:root` stylesheet,
 * because the whole document is the themed thing. Here the themed thing is the
 * canvas *inside* the builder, so we emit a flat token map that gets applied to
 * the `.site` element as inline custom properties. The builder chrome keeps its
 * own `--ui-*` namespace and is never touched.
 */

export type Appearance = 'light' | 'dark'

export type GrayFamily = 'gray' | 'mauve' | 'slate' | 'sage' | 'olive' | 'sand'

/** Step 9 of each Radix gray family — the seed we hand to the generator. */
const GRAY_SEEDS: Record<GrayFamily, string> = {
  gray: gray.gray9,
  mauve: mauve.mauve9,
  slate: slate.slate9,
  sage: sage.sage9,
  olive: olive.olive9,
  sand: sand.sand9,
}

/**
 * Radix pairs every accent with a *tinted* gray, so the neutral chrome carries a
 * hint of the brand hue rather than being flat #888. We reproduce that pairing
 * from Radix Themes, resolved by hue since our accent is an arbitrary hex:
 *
 *   reds / purples / pinks -> mauve      blues / cyans     -> slate
 *   greens / teals         -> sage       grass / lime      -> olive
 *   yellows / oranges      -> sand       (unsaturated)     -> gray
 *
 * This is what makes the navbar shift warm for an orange brand and cool for a
 * blue one, without ever looking tinted-by-accident.
 */
export function grayFamilyForAccent(accent: string): GrayFamily {
  // colorjs types coords as nullable; achromatic colors yield NaN (or null) hue.
  const [h, s] = new Color(accent).to('hsl').coords as (number | null)[]
  if (h == null || s == null || Number.isNaN(h) || Number.isNaN(s) || s < 25) return 'gray'
  const hue = ((h % 360) + 360) % 360
  if (hue < 20) return 'mauve'
  if (hue < 65) return 'sand'
  if (hue < 110) return 'olive'
  if (hue < 190) return 'sage'
  if (hue < 240) return 'slate'
  return 'mauve'
}

function graySeedFromAccent(accent: string): string {
  return GRAY_SEEDS[grayFamilyForAccent(accent)]
}

export interface PaletteInput {
  accent: string
  /** Page background. Defaults to white / near-black. */
  background?: string
  /** Override the auto-derived tinted gray. */
  gray?: string
}

export type GeneratedPalette = ReturnType<typeof generateRadixColors>

export function buildPalette(appearance: Appearance, input: PaletteInput): GeneratedPalette {
  const background = input.background ?? (appearance === 'light' ? '#ffffff' : '#111110')
  return generateRadixColors({
    appearance,
    accent: input.accent,
    gray: input.gray ?? graySeedFromAccent(input.accent),
    background,
  })
}

export type Tokens = Record<string, string>

function writeScale(out: Tokens, name: string, scale: string[], alpha: string[]) {
  scale.forEach((v, i) => {
    out[`--${name}-${i + 1}`] = v
  })
  alpha.forEach((v, i) => {
    out[`--${name}-a${i + 1}`] = v
  })
}

/**
 * Layer 1 — primitives, for the appearance currently on screen.
 *
 * The dark scales come along unconditionally, exactly as in the source: some
 * surfaces are dark in BOTH appearances (the code panel, the dark nav
 * treatment) and read from them so they stay hue-matched to the brand.
 * `--dark-accent-contrast` is included so a brand button on one of those
 * surfaces still gets an APCA-correct label.
 */
export function paletteTokens(accent: string, appearance: Appearance): Tokens {
  const active = buildPalette(appearance, { accent })
  const dark = appearance === 'dark' ? active : buildPalette('dark', { accent })

  const out: Tokens = {}
  writeScale(out, 'accent', active.accentScale, active.accentScaleAlpha)
  writeScale(out, 'gray', active.grayScale, active.grayScaleAlpha)
  out['--accent-contrast'] = active.accentContrast
  out['--accent-surface'] = active.accentSurface
  out['--gray-surface'] = active.graySurface
  out['--color-background'] = active.background

  dark.grayScale.forEach((v, i) => {
    out[`--dark-gray-${i + 1}`] = v
  })
  dark.accentScale.forEach((v, i) => {
    out[`--dark-accent-${i + 1}`] = v
  })
  out['--dark-accent-contrast'] = dark.accentContrast

  return out
}

/**
 * APCA lightness contrast, the metric Radix itself uses to decide whether text
 * on step 9 should be white or near-black. Reported in the UI so the choice is
 * visible rather than magic.
 */
export function apca(foreground: string, background: string): number {
  return Math.abs(new Color(foreground).contrastAPCA(new Color(background)))
}

export function hexIsValid(value: string): boolean {
  try {
    new Color(value)
    return true
  } catch {
    return false
  }
}
