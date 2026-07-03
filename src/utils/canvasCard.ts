import type { CardStats } from './cardStats'

export interface CardRenderData {
  displayName: string
  handle: string
  stats: CardStats
}

const WIDTH = 420
const HEIGHT = 620

function drawBackground(ctx: CanvasRenderingContext2D, ovr: number): void {
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  if (ovr >= 90) {
    gradient.addColorStop(0, '#f4d160')
    gradient.addColorStop(1, '#b8860b')
  } else if (ovr >= 75) {
    gradient.addColorStop(0, '#e8e8e8')
    gradient.addColorStop(1, '#9a9a9a')
  } else {
    gradient.addColorStop(0, '#c98a4b')
    gradient.addColorStop(1, '#7a4a24')
  }
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.lineWidth = 6
  ctx.strokeRect(3, 3, WIDTH - 6, HEIGHT - 6)
}

function drawHeader(ctx: CanvasRenderingContext2D, stats: CardStats): void {
  ctx.fillStyle = '#1a1a1a'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  ctx.font = 'bold 64px system-ui, sans-serif'
  ctx.fillText(String(stats.ovr), 28, 90)

  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillText(stats.position.slice(0, 12).toUpperCase(), 28, 118)
}

function drawAvatar(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null): void {
  const cx = WIDTH / 2
  const cy = 230
  const radius = 100

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.fill()
  ctx.clip()

  if (image) {
    ctx.drawImage(image, cx - radius, cy - radius, radius * 2, radius * 2)
  }
  ctx.restore()

  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.lineWidth = 4
  ctx.stroke()
}

function drawName(ctx: CanvasRenderingContext2D, name: string, handle: string): void {
  ctx.textAlign = 'center'
  ctx.fillStyle = '#1a1a1a'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillText(name.slice(0, 22), WIDTH / 2, 365)

  ctx.font = '18px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(26, 26, 26, 0.7)'
  ctx.fillText(`@${handle}`, WIDTH / 2, 392)
}

function drawStats(ctx: CanvasRenderingContext2D, stats: CardStats): void {
  const entries: Array<[string, number]> = [
    ['PAC', stats.pac],
    ['SHO', stats.sho],
    ['PAS', stats.pas],
    ['DRI', stats.dri],
    ['DEF', stats.def],
    ['PHY', stats.phy],
  ]

  const startY = 430
  const rowHeight = 30

  entries.forEach(([label, value], index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    const x = col === 0 ? 90 : WIDTH / 2 + 30
    const y = startY + row * rowHeight

    ctx.textAlign = 'right'
    ctx.font = 'bold 20px system-ui, sans-serif'
    ctx.fillStyle = '#1a1a1a'
    ctx.fillText(String(value), x, y)

    ctx.textAlign = 'left'
    ctx.font = '16px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(26, 26, 26, 0.75)'
    ctx.fillText(label, x + 12, y)
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

  drawBackground(ctx, data.stats.ovr)
  drawHeader(ctx, data.stats)
  drawAvatar(ctx, avatarImage)
  drawName(ctx, data.displayName, data.handle)
  drawStats(ctx, data.stats)
}

export const CARD_WIDTH = WIDTH
export const CARD_HEIGHT = HEIGHT
