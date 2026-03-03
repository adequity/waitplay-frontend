/**
 * Hex grid utilities using axial coordinates (q, r) with flat-top hexagons.
 * Center (0, 0) = user's own room.
 */

export interface HexPosition {
  q: number
  r: number
}

export interface PixelPosition {
  x: number
  y: number
}

/** Flat-top hex: axial to pixel */
export function hexToPixel(q: number, r: number, size: number): PixelPosition {
  const x = size * (3 / 2) * q
  const y = size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r)
  return { x, y }
}

/** Bounding box of hex positions + center for viewport sizing */
export function hexBoundingBox(positions: HexPosition[], size: number) {
  const allPositions = [{ q: 0, r: 0 }, ...positions]
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity

  for (const pos of allPositions) {
    const pixel = hexToPixel(pos.q, pos.r, size)
    minX = Math.min(minX, pixel.x - size)
    maxX = Math.max(maxX, pixel.x + size)
    minY = Math.min(minY, pixel.y - size * Math.sqrt(3) / 2)
    maxY = Math.max(maxY, pixel.y + size * Math.sqrt(3) / 2)
  }

  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
}
