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
  },
}

const LANGUAGE_CODES: Record<string, string> = {
  TypeScript: 'TS',
  JavaScript: 'JS',
  Python: 'PY',
  Rust: 'RS',
  Go: 'GO',
  Java: 'JV',
  Ruby: 'RB',
  PHP: 'PHP',
  Swift: 'SW',
  Kotlin: 'KT',
  'C++': 'C++',
  'C#': 'C#',
  Shell: 'SH',
  'Full Stack': 'DEV',
}

function languageCode(language: string): string {
  return LANGUAGE_CODES[language] ?? language.slice(0, 3).toUpperCase()
}

/**
 * The card silhouette of an EAFC card: a gently domed top that rises to a soft
 * central peak with rounded shoulders, near-vertical sides, and a flat bottom
 * edge with rounded corners. Original geometry, not traced from any EA asset.
 */
function traceShieldPath(ctx: CanvasRenderingContext2D, pad = 0): void {
  const L = pad
  const T = pad
  const w = WIDTH - pad * 2
  const h = HEIGHT - pad * 2
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

function drawBackground(ctx: CanvasRenderingContext2D, style: TierStyle): void {
  traceShieldPath(ctx)
  const [a, b, c] = style.gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH * 0.4, HEIGHT)
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
  const cx = WIDTH / 2
  const cy = HEIGHT * 0.28
  const rays = 44
  const reach = HEIGHT * 1.1
  const [bright, dark] = style.ray

  ctx.save()
  ctx.translate(cx, cy)
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
  ctx.fillText(String(stats.ovr), WIDTH * 0.1, HEIGHT * 0.16)

  ctx.fillStyle = style.text
  ctx.font = 'bold 20px system-ui, sans-serif'
  ctx.fillText(languageCode(stats.position), WIDTH * 0.1, HEIGHT * 0.2)

  // thin rule under the position, mirroring the real card's OVR block
  ctx.strokeStyle = style.divider
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(WIDTH * 0.1, HEIGHT * 0.215)
  ctx.lineTo(WIDTH * 0.22, HEIGHT * 0.215)
  ctx.stroke()

  if (style.label) {
    ctx.textAlign = 'center'
    ctx.font = 'bold 11px system-ui, sans-serif'
    ctx.fillStyle = style.accent
    ctx.fillText(style.label, WIDTH / 2, HEIGHT * 0.12)
  }
}

function buildFadedAvatar(image: HTMLImageElement, size: number): HTMLCanvasElement {
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
  const gradient = octx.createRadialGradient(
    size / 2,
    size * 0.42,
    size * 0.28,
    size / 2,
    size * 0.42,
    size * 0.52,
  )
  gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
  gradient.addColorStop(0.85, 'rgba(0, 0, 0, 0.9)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  octx.fillStyle = gradient
  octx.fillRect(0, 0, size, size)

  return off
}

function drawAvatar(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null): void {
  if (!image) return

  const cx = WIDTH / 2
  const cy = HEIGHT * 0.36
  const size = WIDTH * 0.66

  const faded = buildFadedAvatar(image, size * SCALE)
  ctx.drawImage(faded, cx - size / 2, cy - size / 2, size, size)
}

function drawName(ctx: CanvasRenderingContext2D, name: string, handle: string, style: TierStyle): void {
  const nameY = HEIGHT * 0.6

  ctx.textAlign = 'center'
  ctx.fillStyle = style.text
  ctx.font = '800 26px system-ui, sans-serif'
  ctx.fillText(name.slice(0, 20).toUpperCase(), WIDTH / 2, nameY)

  ctx.font = '14px system-ui, sans-serif'
  ctx.globalAlpha = 0.7
  ctx.fillText(`@${handle}`, WIDTH / 2, nameY + 20)
  ctx.globalAlpha = 1

  // divider line under the name, tapered toward the edges
  const dividerY = nameY + 34
  const half = WIDTH * 0.36
  const grad = ctx.createLinearGradient(WIDTH / 2 - half, 0, WIDTH / 2 + half, 0)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(0.5, style.divider)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.strokeStyle = grad
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(WIDTH / 2 - half, dividerY)
  ctx.lineTo(WIDTH / 2 + half, dividerY)
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

  const inset = WIDTH * 0.11
  const columnWidth = (WIDTH - inset * 2) / entries.length
  const valueY = HEIGHT * 0.715
  const labelY = valueY + 19

  entries.forEach(([label, value], index) => {
    const x = inset + columnWidth * index + columnWidth / 2

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
  drawBackground(ctx, style)

  ctx.save()
  traceShieldPath(ctx)
  ctx.clip()
  drawSunburst(ctx, style)
  drawAvatar(ctx, avatarImage)
  drawHeader(ctx, data.stats, style)
  drawName(ctx, data.displayName, data.handle, style)
  drawStats(ctx, data.stats, style)
  ctx.restore()

  drawFrame(ctx, style)
}

export const CARD_WIDTH = WIDTH
export const CARD_HEIGHT = HEIGHT
