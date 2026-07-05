import type { CardStats } from './cardStats'

export type Tier = 'bronze' | 'silver' | 'gold' | 'toty' | 'icon' | 'toty-icon'

export interface CardRenderData {
  displayName: string
  handle: string
  stats: CardStats
  /** When set, overrides the stats-derived tier (founder mode). */
  forcedTier?: Tier
}

/** Selectable card faces, in ladder order — used by founder mode's dropdown. */
export const TIER_OPTIONS: ReadonlyArray<{ value: Tier; label: string }> = [
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'toty', label: 'TOTY' },
  { value: 'icon', label: 'Icon' },
  { value: 'toty-icon', label: 'TOTY Icon' },
]

const WIDTH = 360
const HEIGHT = 500
// Render at 2x for crisp text/edges on retina and in the downloaded PNG.
const SCALE = 2

// The shield is inset from the canvas edge, leaving a margin for the tier
// glow (a colored drop-shadow) to bleed into without being clipped.
const MARGIN_X = WIDTH * 0.05
const MARGIN_Y = HEIGHT * 0.05
const CARD_W = WIDTH - MARGIN_X * 2
const CARD_H = HEIGHT - MARGIN_Y * 2

/** Maps a fraction of the card's own width (0-1) to an absolute canvas x. */
function cardX(fx: number): number {
  return MARGIN_X + fx * CARD_W
}

/** Maps a fraction of the card's own height (0-1) to an absolute canvas y. */
function cardY(fy: number): number {
  return MARGIN_Y + fy * CARD_H
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const n = parseInt(full, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/**
 * Gold caps at 89. Above that, which special tier a card gets depends on *why*
 * it rated so highly: TOTY rewards a huge recent-activity spike (PAC), Icon
 * rewards a long, storied account history (PHY), and TOTY Icon is both at once.
 */
function tierFor(stats: CardStats): Tier {
  const { ovr, pac, phy } = stats
  if (ovr >= 95 && pac >= 90 && phy >= 90) return 'toty-icon'
  if (ovr >= 90 && phy >= 90) return 'icon'
  if (ovr >= 90 && pac >= 90) return 'toty'
  if (ovr >= 75) return 'gold'
  if (ovr >= 65) return 'silver'
  return 'bronze'
}

interface TierStyle {
  /** Three-stop gradient: outer, bright mid-band, outer. */
  gradient: [string, string, string]
  text: string
  accent: string
  /** Bright + dark ray tint for the sunburst. */
  ray: [string, string]
  frameOuter: string
  frameInner: string
  divider: string
  label: string
  /** Ambient drop-shadow color cast outside the card, tinted to the tier. */
  glow: string
}

const TIER_STYLES: Record<Tier, TierStyle> = {
  bronze: {
    gradient: ['#8a5522', '#d99a5c', '#7a4a24'],
    text: '#2e1a0d',
    accent: '#3a2210',
    ray: ['rgba(255, 220, 170, 0.30)', 'rgba(60, 30, 10, 0.10)'],
    frameOuter: '#e6b380',
    frameInner: '#5e3617',
    divider: 'rgba(46, 26, 13, 0.4)',
    label: '',
    glow: 'rgba(190, 120, 60, 0.55)',
  },
  silver: {
    gradient: ['#9a9a9a', '#eceff1', '#8f9296'],
    text: '#26282b',
    accent: '#1c1e21',
    ray: ['rgba(255, 255, 255, 0.35)', 'rgba(40, 42, 46, 0.10)'],
    frameOuter: '#f4f6f8',
    frameInner: '#7a7d82',
    divider: 'rgba(38, 40, 43, 0.35)',
    label: '',
    glow: 'rgba(170, 188, 210, 0.55)',
  },
  gold: {
    gradient: ['#b8860b', '#f7e08a', '#c8920c'],
    text: '#4a3400',
    accent: '#2f2100',
    ray: ['rgba(255, 248, 205, 0.40)', 'rgba(90, 60, 0, 0.10)'],
    frameOuter: '#fff2b8',
    frameInner: '#a5780a',
    divider: 'rgba(74, 52, 0, 0.4)',
    label: '',
    glow: 'rgba(225, 185, 80, 0.6)',
  },
  toty: {
    gradient: ['#0a1838', '#2c4f9e', '#08122b'],
    text: '#ffffff',
    accent: '#f5d874',
    ray: ['rgba(120, 170, 255, 0.28)', 'rgba(4, 10, 30, 0.30)'],
    frameOuter: '#f4d160',
    frameInner: '#8a6a20',
    divider: 'rgba(255, 255, 255, 0.5)',
    label: 'TEAM OF THE YEAR',
    glow: 'rgba(90, 140, 255, 0.6)',
  },
  icon: {
    gradient: ['#d9c9a3', '#faf6ec', '#cbb98f'],
    text: '#6b4f2a',
    accent: '#7a5a2e',
    ray: ['rgba(255, 255, 255, 0.45)', 'rgba(120, 90, 45, 0.10)'],
    frameOuter: '#f3e7cb',
    frameInner: '#b89b64',
    divider: 'rgba(107, 79, 42, 0.4)',
    label: 'ICON',
    glow: 'rgba(243, 213, 128, 0.55)',
  },
  'toty-icon': {
    gradient: ['#14285a', '#4a6fc0', '#0e1c40'],
    text: '#ffffff',
    accent: '#ffffff',
    ray: ['rgba(210, 226, 255, 0.36)', 'rgba(8, 18, 46, 0.30)'],
    frameOuter: '#f2f5ff',
    frameInner: '#aab8dc',
    divider: 'rgba(255, 255, 255, 0.6)',
    label: 'TOTY ICON',
    glow: 'rgba(140, 170, 255, 0.6)',
  },
}

interface LanguageBadge {
  color: string
  textColor: string
  glyph: string
  /** 'triangle' draws a simplified brand mark instead of the glyph text. */
  shape?: 'triangle'
}

/**
 * Brand-colored badges for the most common GitHub `language` values. Marks are
 * simplified, original renderings (solid color + glyph/shape) in the same spirit
 * as devicon/shields.io badges — not traced from any official logo artwork.
 */
const LANGUAGE_BADGES: Record<string, LanguageBadge> = {
  TypeScript: { color: '#3178c6', textColor: '#ffffff', glyph: 'TS' },
  JavaScript: { color: '#f7df1e', textColor: '#1a1a1a', glyph: 'JS' },
  Vue: { color: '#42b883', textColor: '#ffffff', glyph: '', shape: 'triangle' },
  Python: { color: '#3776ab', textColor: '#ffd43b', glyph: 'PY' },
  Rust: { color: '#dea584', textColor: '#1a1a1a', glyph: 'RS' },
  Go: { color: '#00add8', textColor: '#ffffff', glyph: 'GO' },
  Java: { color: '#e76f00', textColor: '#ffffff', glyph: 'JV' },
  Ruby: { color: '#cc342d', textColor: '#ffffff', glyph: 'RB' },
  PHP: { color: '#787cb5', textColor: '#ffffff', glyph: 'PHP' },
  Swift: { color: '#f05138', textColor: '#ffffff', glyph: 'SW' },
  Kotlin: { color: '#7f52ff', textColor: '#ffffff', glyph: 'KT' },
  'C++': { color: '#00599c', textColor: '#ffffff', glyph: 'C++' },
  'C#': { color: '#178600', textColor: '#ffffff', glyph: 'C#' },
  Shell: { color: '#4eaa25', textColor: '#ffffff', glyph: 'SH' },
  HTML: { color: '#e34c26', textColor: '#ffffff', glyph: 'HTML' },
  CSS: { color: '#264de4', textColor: '#ffffff', glyph: 'CSS' },
}

function badgeFor(language: string): LanguageBadge {
  return LANGUAGE_BADGES[language] ?? { color: '#6e7681', textColor: '#ffffff', glyph: language.slice(0, 2).toUpperCase() }
}

function drawBadge(ctx: CanvasRenderingContext2D, language: string, x: number, y: number, size: number): void {
  const radius = size * 0.22
  const badge = badgeFor(language)

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + size, y, x + size, y + size, radius)
  ctx.arcTo(x + size, y + size, x, y + size, radius)
  ctx.arcTo(x, y + size, x, y, radius)
  ctx.arcTo(x, y, x + size, y, radius)
  ctx.closePath()
  ctx.fillStyle = badge.color
  ctx.fill()

  if (badge.shape === 'triangle') {
    const cx = x + size / 2
    ctx.beginPath()
    ctx.moveTo(cx, y + size * 0.24)
    ctx.lineTo(x + size * 0.76, y + size * 0.76)
    ctx.lineTo(x + size * 0.24, y + size * 0.76)
    ctx.closePath()
    ctx.fillStyle = badge.textColor
    ctx.fill()
  } else {
    ctx.fillStyle = badge.textColor
    ctx.font = `800 ${size * 0.32}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(badge.glyph, x + size / 2, y + size / 2 + size * 0.02)
  }
  ctx.restore()
}

/**
 * Top-right badge stack for the account's top 1-2 GitHub languages. Two badges
 * are drawn smaller and stacked vertically, right-aligned with the single-badge case.
 */
function drawLanguageBadges(ctx: CanvasRenderingContext2D, languages: string[]): void {
  const count = Math.min(languages.length, 2)
  const size = count === 1 ? CARD_W * 0.16 : CARD_W * 0.125
  const gap = CARD_H * 0.02
  const x = cardX(0.94) - size
  const startY = cardY(0.045)

  for (let i = 0; i < count; i++) {
    drawBadge(ctx, languages[i], x, startY + i * (size + gap), size)
  }
}

/**
 * The card silhouette of an EAFC card: a gently domed top that rises to a soft
 * central peak with rounded shoulders, near-vertical sides, and a flat bottom
 * edge with rounded corners. Original geometry, not traced from any EA asset.
 */
function traceShieldPath(ctx: CanvasRenderingContext2D, pad = 0): void {
  const L = MARGIN_X + pad
  const T = MARGIN_Y + pad
  const w = CARD_W - pad * 2
  const h = CARD_H - pad * 2
  const X = (fx: number): number => L + fx * w
  const Y = (fy: number): number => T + fy * h

  ctx.beginPath()
  ctx.moveTo(X(0.05), Y(0.11)) // top of left side
  ctx.lineTo(X(0.05), Y(0.86)) // left side down
  ctx.quadraticCurveTo(X(0.05), Y(0.95), X(0.16), Y(0.95)) // bottom-left corner
  ctx.lineTo(X(0.84), Y(0.95)) // flat bottom edge
  ctx.quadraticCurveTo(X(0.95), Y(0.95), X(0.95), Y(0.86)) // bottom-right corner
  ctx.lineTo(X(0.95), Y(0.11)) // right side up
  ctx.quadraticCurveTo(X(0.95), Y(0.035), X(0.74), Y(0.035)) // top-right corner
  ctx.quadraticCurveTo(X(0.58), Y(0.035), X(0.5), Y(0.008)) // up to soft central peak
  ctx.quadraticCurveTo(X(0.42), Y(0.035), X(0.26), Y(0.035)) // down to left shoulder
  ctx.quadraticCurveTo(X(0.05), Y(0.035), X(0.05), Y(0.11)) // top-left corner
  ctx.closePath()
}

/**
 * A soft, tier-tinted halo behind the card. Filling the shield with a shadow
 * enabled — then painting the crisp background directly over it — leaves only
 * the blurred overflow visible outside the card's own edge.
 */
function drawGlow(ctx: CanvasRenderingContext2D, style: TierStyle): void {
  ctx.save()
  ctx.shadowColor = style.glow
  ctx.shadowBlur = WIDTH * 0.055
  ctx.shadowOffsetY = HEIGHT * 0.012
  traceShieldPath(ctx)
  ctx.fillStyle = style.glow
  ctx.fill()
  ctx.restore()
}

function drawBackground(ctx: CanvasRenderingContext2D, style: TierStyle): void {
  traceShieldPath(ctx)
  const [a, b, c] = style.gradient
  const gradient = ctx.createLinearGradient(cardX(0), cardY(0), cardX(0.4), cardY(1))
  gradient.addColorStop(0, a)
  gradient.addColorStop(0.5, b)
  gradient.addColorStop(1, c)
  ctx.fillStyle = gradient
  ctx.fill()
}

/**
 * Alternating light/dark wedge rays fanning out from behind the player's head —
 * the signature texture of a FIFA gold card.
 */
function drawSunburst(ctx: CanvasRenderingContext2D, style: TierStyle): void {
  const originX = cardX(0.5)
  const originY = cardY(0.28)
  const rays = 44
  const reach = CARD_H * 1.3
  const [bright, dark] = style.ray

  ctx.save()
  ctx.translate(originX, originY)
  for (let i = 0; i < rays; i++) {
    const angle = (Math.PI * 2 * i) / rays
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, reach, angle, angle + (Math.PI * 2) / rays)
    ctx.closePath()
    ctx.fillStyle = i % 2 === 0 ? bright : dark
    ctx.fill()
  }
  ctx.restore()
}

function drawFrame(ctx: CanvasRenderingContext2D, style: TierStyle): void {
  ctx.save()
  traceShieldPath(ctx, 3)
  ctx.strokeStyle = style.frameInner
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  ctx.save()
  traceShieldPath(ctx)
  ctx.strokeStyle = style.frameOuter
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.restore()
}

function drawHeader(ctx: CanvasRenderingContext2D, stats: CardStats, style: TierStyle): void {
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = style.accent
  ctx.font = '800 54px system-ui, sans-serif'
  ctx.fillText(String(stats.ovr), cardX(0.1), cardY(0.16))

  ctx.fillStyle = style.text
  ctx.font = 'bold 20px system-ui, sans-serif'
  ctx.fillText(stats.position, cardX(0.1), cardY(0.2))

  // thin rule under the position, mirroring the real card's OVR block
  ctx.strokeStyle = style.divider
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cardX(0.1), cardY(0.215))
  ctx.lineTo(cardX(0.22), cardY(0.215))
  ctx.stroke()

  if (style.label) {
    ctx.textAlign = 'center'
    ctx.font = 'bold 11px system-ui, sans-serif'
    ctx.fillStyle = style.accent
    ctx.fillText(style.label, cardX(0.5), cardY(0.12))
  }
}

/** Blends the photo into the card: fades alpha at the edges, then tints what remains toward the tier's own color. */
function buildFadedAvatar(image: HTMLImageElement, size: number, tintColor: string): HTMLCanvasElement {
  const off = document.createElement('canvas')
  off.width = size
  off.height = size
  const octx = off.getContext('2d')
  if (!octx) return off

  const scale = Math.max(size / image.width, size / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  octx.drawImage(image, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight)

  // Fade the edges (especially the bottom) so the portrait melts into the card.
  octx.globalCompositeOperation = 'destination-in'
  const fade = octx.createRadialGradient(size / 2, size * 0.42, size * 0.28, size / 2, size * 0.42, size * 0.52)
  fade.addColorStop(0, 'rgba(0, 0, 0, 1)')
  fade.addColorStop(0.85, 'rgba(0, 0, 0, 0.9)')
  fade.addColorStop(1, 'rgba(0, 0, 0, 0)')
  octx.fillStyle = fade
  octx.fillRect(0, 0, size, size)

  // Tint the fading edge toward the card's own color, so it blends chromatically
  // rather than just revealing whatever is behind it.
  octx.globalCompositeOperation = 'source-atop'
  const tint = octx.createRadialGradient(size / 2, size * 0.42, size * 0.3, size / 2, size * 0.42, size * 0.52)
  tint.addColorStop(0, 'rgba(0, 0, 0, 0)')
  tint.addColorStop(1, tintColor)
  octx.fillStyle = tint
  octx.fillRect(0, 0, size, size)

  return off
}

function drawAvatar(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null, style: TierStyle): void {
  if (!image) return

  const centerX = cardX(0.5)
  const centerY = cardY(0.36)
  const size = CARD_W * 0.66
  const tint = hexToRgba(style.gradient[1], 0.5)

  const faded = buildFadedAvatar(image, size * SCALE, tint)
  ctx.drawImage(faded, centerX - size / 2, centerY - size / 2, size, size)
}

function drawName(ctx: CanvasRenderingContext2D, name: string, handle: string, style: TierStyle): void {
  const nameY = cardY(0.6)
  const centerX = cardX(0.5)

  ctx.textAlign = 'center'
  ctx.fillStyle = style.text
  ctx.font = '800 26px system-ui, sans-serif'
  ctx.fillText(name.slice(0, 20).toUpperCase(), centerX, nameY)

  ctx.font = '14px system-ui, sans-serif'
  ctx.globalAlpha = 0.7
  ctx.fillText(`@${handle}`, centerX, nameY + 20)
  ctx.globalAlpha = 1

  // divider line under the name, tapered toward the edges
  const dividerY = nameY + 34
  const half = CARD_W * 0.36
  const grad = ctx.createLinearGradient(centerX - half, 0, centerX + half, 0)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(0.5, style.divider)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.strokeStyle = grad
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(centerX - half, dividerY)
  ctx.lineTo(centerX + half, dividerY)
  ctx.stroke()
}

function drawStats(ctx: CanvasRenderingContext2D, stats: CardStats, style: TierStyle): void {
  const entries: Array<[string, number]> = [
    ['PAC', stats.pac],
    ['SHO', stats.sho],
    ['PAS', stats.pas],
    ['DRI', stats.dri],
    ['DEF', stats.def],
    ['PHY', stats.phy],
  ]

  const insetFrac = 0.11
  const colFracWidth = (1 - insetFrac * 2) / entries.length
  const valueY = cardY(0.715)
  const labelY = valueY + 19

  entries.forEach(([label, value], index) => {
    const x = cardX(insetFrac + colFracWidth * index + colFracWidth / 2)

    ctx.textAlign = 'center'
    ctx.fillStyle = style.text
    ctx.font = '800 21px system-ui, sans-serif'
    ctx.fillText(String(value), x, valueY)

    ctx.font = 'bold 11px system-ui, sans-serif'
    ctx.globalAlpha = 0.7
    ctx.fillText(label, x, labelY)
    ctx.globalAlpha = 1
  })
}

export async function loadAvatarImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })
}

export function drawPlayerCard(canvas: HTMLCanvasElement, data: CardRenderData, avatarImage: HTMLImageElement | null): void {
  canvas.width = WIDTH * SCALE
  canvas.height = HEIGHT * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(SCALE, SCALE)

  const style = TIER_STYLES[data.forcedTier ?? tierFor(data.stats)]

  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  drawGlow(ctx, style)
  drawBackground(ctx, style)

  ctx.save()
  traceShieldPath(ctx)
  ctx.clip()
  drawSunburst(ctx, style)
  drawAvatar(ctx, avatarImage, style)
  drawHeader(ctx, data.stats, style)
  drawLanguageBadges(ctx, data.stats.languages)
  drawName(ctx, data.displayName, data.handle, style)
  drawStats(ctx, data.stats, style)
  ctx.restore()

  drawFrame(ctx, style)
}

export const CARD_WIDTH = WIDTH
export const CARD_HEIGHT = HEIGHT
