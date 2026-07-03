import type { CardStats } from './cardStats'

export interface CardRenderData {
  displayName: string
  handle: string
  stats: CardStats
}

const WIDTH = 360
const HEIGHT = 460

type Tier = 'bronze' | 'silver' | 'gold' | 'toty' | 'icon' | 'toty-icon'

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

const TIER_COLORS: Record<Tier, [string, string]> = {
  bronze: ['#c98a4b', '#7a4a24'],
  silver: ['#e8e8e8', '#9a9a9a'],
  gold: ['#f4d160', '#b8860b'],
  toty: ['#2b2b2b', '#000000'],
  icon: ['#f5f0e6', '#d9c9a3'],
  'toty-icon': ['#1a1a2e', '#000000'],
}

const TIER_TEXT: Record<Tier, string> = {
  bronze: '#2e1a0d',
  silver: '#26282b',
  gold: '#4a3400',
  toty: '#f4d160',
  icon: '#6b4f2a',
  'toty-icon': '#ffffff',
}

const TIER_ACCENT: Record<Tier, string> = {
  bronze: TIER_TEXT.bronze,
  silver: TIER_TEXT.silver,
  gold: TIER_TEXT.gold,
  toty: '#f4d160',
  icon: '#8a6a35',
  'toty-icon': '#f4d160',
}

const TIER_BORDER: Record<Tier, string> = {
  bronze: 'rgba(255, 255, 255, 0.55)',
  silver: 'rgba(255, 255, 255, 0.55)',
  gold: 'rgba(255, 255, 255, 0.55)',
  toty: 'rgba(244, 209, 96, 0.8)',
  icon: 'rgba(180, 140, 70, 0.6)',
  'toty-icon': 'rgba(244, 209, 96, 0.9)',
}

const TIER_LABEL: Record<Tier, string> = {
  bronze: '',
  silver: '',
  gold: '',
  toty: 'TEAM OF THE YEAR',
  icon: 'ICON',
  'toty-icon': 'TOTY ICON',
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
 * The card silhouette FIFA/EAFC ultimate team cards are known for: a scalloped
 * double-peak top tapering to a point at the bottom. Original geometry, not
 * traced from any EA asset.
 */
function traceShieldPath(ctx: CanvasRenderingContext2D): void {
  const w = WIDTH
  const h = HEIGHT

  ctx.beginPath()
  ctx.moveTo(w * 0.05, h * 0.14)
  ctx.quadraticCurveTo(w * 0.05, h * 0.02, w * 0.28, h * 0.02)
  ctx.quadraticCurveTo(w * 0.42, h * 0.02, w * 0.5, h * 0.045)
  ctx.quadraticCurveTo(w * 0.58, h * 0.02, w * 0.72, h * 0.02)
  ctx.quadraticCurveTo(w * 0.95, h * 0.02, w * 0.95, h * 0.14)
  ctx.quadraticCurveTo(w, h * 0.4, w * 0.96, h * 0.68)
  ctx.quadraticCurveTo(w * 0.93, h * 0.82, w * 0.68, h * 0.94)
  ctx.quadraticCurveTo(w * 0.58, h * 0.99, w * 0.5, h)
  ctx.quadraticCurveTo(w * 0.42, h * 0.99, w * 0.32, h * 0.94)
  ctx.quadraticCurveTo(w * 0.07, h * 0.82, w * 0.04, h * 0.68)
  ctx.quadraticCurveTo(0, h * 0.4, w * 0.05, h * 0.14)
  ctx.closePath()
}

function drawBackground(ctx: CanvasRenderingContext2D, tier: Tier): void {
  traceShieldPath(ctx)
  const [from, to] = TIER_COLORS[tier]
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  gradient.addColorStop(0, from)
  gradient.addColorStop(1, to)
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.save()
  ctx.clip()
  ctx.strokeStyle = TIER_BORDER[tier]
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.restore()
}

function drawHeader(ctx: CanvasRenderingContext2D, stats: CardStats, tier: Tier): void {
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = TIER_ACCENT[tier]
  ctx.font = 'bold 52px system-ui, sans-serif'
  ctx.fillText(String(stats.ovr), WIDTH * 0.09, HEIGHT * 0.17)

  ctx.fillStyle = TIER_TEXT[tier]
  ctx.font = 'bold 20px system-ui, sans-serif'
  ctx.fillText(languageCode(stats.position), WIDTH * 0.09, HEIGHT * 0.21)

  const label = TIER_LABEL[tier]
  if (label) {
    ctx.textAlign = 'center'
    ctx.font = 'bold 11px system-ui, sans-serif'
    ctx.fillStyle = TIER_ACCENT[tier]
    ctx.fillText(label, WIDTH / 2, HEIGHT * 0.085)
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

  octx.globalCompositeOperation = 'destination-in'
  const gradient = octx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.3,
    size / 2,
    size / 2,
    size * 0.5,
  )
  gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  octx.fillStyle = gradient
  octx.fillRect(0, 0, size, size)

  return off
}

function drawAvatar(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null): void {
  if (!image) return

  const cx = WIDTH / 2
  const cy = HEIGHT * 0.38
  const size = WIDTH * 0.62

  const faded = buildFadedAvatar(image, size)
  ctx.drawImage(faded, cx - size / 2, cy - size / 2, size, size)
}

function drawName(ctx: CanvasRenderingContext2D, name: string, handle: string, textColor: string): void {
  ctx.textAlign = 'center'
  ctx.fillStyle = textColor
  ctx.font = 'bold 24px system-ui, sans-serif'
  ctx.fillText(name.slice(0, 22), WIDTH / 2, HEIGHT * 0.63)

  ctx.font = '15px system-ui, sans-serif'
  ctx.globalAlpha = 0.75
  ctx.fillText(`@${handle}`, WIDTH / 2, HEIGHT * 0.665)
  ctx.globalAlpha = 1
}

function drawStats(ctx: CanvasRenderingContext2D, stats: CardStats, textColor: string): void {
  const entries: Array<[string, number]> = [
    ['PAC', stats.pac],
    ['SHO', stats.sho],
    ['PAS', stats.pas],
    ['DRI', stats.dri],
    ['DEF', stats.def],
    ['PHY', stats.phy],
  ]

  const inset = WIDTH * 0.1
  const columnWidth = (WIDTH - inset * 2) / entries.length
  const valueY = HEIGHT * 0.72
  const labelY = valueY + 20

  entries.forEach(([label, value], index) => {
    const x = inset + columnWidth * index + columnWidth / 2

    ctx.textAlign = 'center'
    ctx.fillStyle = textColor
    ctx.font = 'bold 18px system-ui, sans-serif'
    ctx.fillText(String(value), x, valueY)

    ctx.font = '11px system-ui, sans-serif'
    ctx.globalAlpha = 0.75
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
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const tier = tierFor(data.stats)
  const textColor = TIER_TEXT[tier]

  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  drawBackground(ctx, tier)

  ctx.save()
  traceShieldPath(ctx)
  ctx.clip()
  drawHeader(ctx, data.stats, tier)
  drawAvatar(ctx, avatarImage)
  drawName(ctx, data.displayName, data.handle, textColor)
  drawStats(ctx, data.stats, textColor)
  ctx.restore()
}

export const CARD_WIDTH = WIDTH
export const CARD_HEIGHT = HEIGHT
