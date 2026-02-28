import { ISO_CONFIG } from './RoomConfig'

const { tileWidth, tileHeight } = ISO_CONFIG

export function gridToIso(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: (gridX - gridY) * (tileWidth / 2),
    y: (gridX + gridY) * (tileHeight / 2),
  }
}

export function isoToGrid(screenX: number, screenY: number): { gridX: number; gridY: number } {
  return {
    gridX: (screenX / (tileWidth / 2) + screenY / (tileHeight / 2)) / 2,
    gridY: (screenY / (tileHeight / 2) - screenX / (tileWidth / 2)) / 2,
  }
}

export function getDepthValue(gridX: number, gridY: number): number {
  return gridX + gridY
}

export function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

export function darkenColor(color: number, factor: number): number {
  const r = Math.floor(((color >> 16) & 0xff) * (1 - factor))
  const g = Math.floor(((color >> 8) & 0xff) * (1 - factor))
  const b = Math.floor((color & 0xff) * (1 - factor))
  return (r << 16) | (g << 8) | b
}

export function drawIsoDiamond(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: number,
  strokeColor: number,
  alpha: number = 1
): void {
  graphics.fillStyle(fillColor, alpha)
  graphics.lineStyle(1, strokeColor, alpha * 0.5)
  graphics.beginPath()
  graphics.moveTo(x, y - height / 2)
  graphics.lineTo(x + width / 2, y)
  graphics.lineTo(x, y + height / 2)
  graphics.lineTo(x - width / 2, y)
  graphics.closePath()
  graphics.fillPath()
  graphics.strokePath()
}

export function drawIsoBox(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  widthPx: number,
  depthPx: number,
  heightPx: number,
  baseColor: number,
  alpha: number = 1
): void {
  const halfW = widthPx / 2
  const halfD = depthPx / 2

  const topColor = baseColor
  const leftColor = darkenColor(baseColor, 0.2)
  const rightColor = darkenColor(baseColor, 0.35)

  // Top face
  graphics.fillStyle(topColor, alpha)
  graphics.beginPath()
  graphics.moveTo(x, y - heightPx - halfD)
  graphics.lineTo(x + halfW, y - heightPx)
  graphics.lineTo(x, y - heightPx + halfD)
  graphics.lineTo(x - halfW, y - heightPx)
  graphics.closePath()
  graphics.fillPath()

  // Left face
  graphics.fillStyle(leftColor, alpha)
  graphics.beginPath()
  graphics.moveTo(x - halfW, y - heightPx)
  graphics.lineTo(x, y - heightPx + halfD)
  graphics.lineTo(x, y + halfD)
  graphics.lineTo(x - halfW, y)
  graphics.closePath()
  graphics.fillPath()

  // Right face
  graphics.fillStyle(rightColor, alpha)
  graphics.beginPath()
  graphics.moveTo(x + halfW, y - heightPx)
  graphics.lineTo(x, y - heightPx + halfD)
  graphics.lineTo(x, y + halfD)
  graphics.lineTo(x + halfW, y)
  graphics.closePath()
  graphics.fillPath()
}
