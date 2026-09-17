import * as Ph from '@phosphor-icons/react'
import { PHOSPHOR_NAMES } from './phosphorNames'

export { PHOSPHOR_NAMES }

type PhComponent = React.ComponentType<{
  size?: number | string
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
  color?: string
  className?: string
  style?: React.CSSProperties
}>

const registry = Ph as unknown as Record<string, PhComponent>

export const DEFAULT_ICON = 'Sparkle'

export function hasIcon(name: string) {
  return typeof registry[name] === 'function'
}

/**
 * Renders a Phosphor icon by name. Names come from the picker, so an unknown
 * one (an old document, a typo) must degrade rather than crash the canvas.
 */
export function Ph_({
  name,
  size = 20,
  weight = 'regular',
  className,
  style,
}: {
  name?: string
  size?: number
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
  className?: string
  style?: React.CSSProperties
}) {
  const Cmp = registry[name ?? ''] ?? registry[DEFAULT_ICON]
  if (!Cmp) return null
  return <Cmp size={size} weight={weight} className={className} style={style} />
}

/** A handful of starting points shown before the user searches. */
export const ICON_SUGGESTIONS = [
  'Sparkle', 'Lightning', 'ShieldCheck', 'PuzzlePiece', 'ChartLineUp', 'UsersThree',
  'Globe', 'Lock', 'Clock', 'Star', 'Heart', 'CheckCircle', 'ArrowRight', 'Play',
  'Stack', 'Layout', 'GridFour', 'Image', 'Quotes', 'Tag', 'Question', 'Envelope',
  'ChatCircle', 'MapPin', 'PencilSimple', 'Code', 'Terminal', 'Database', 'Cloud',
  'Cube', 'Plugs', 'Key', 'Books', 'BookOpen', 'FileCode', 'Rocket', 'Gauge',
  'TreeStructure', 'Webhooks', 'GitBranch',
].filter(hasIcon)
