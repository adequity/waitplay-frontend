/**
 * Isometric cube grid utilities using axial coordinates (q, r).
 * Center (0, 0) = user's own room.
 *
 * Each "cell" is an isometric cube (diamond silhouette).
 * size = half the cube's on-screen height.
 * Cube dimensions: width = 7/4 × size, height = 2 × size (7:8 aspect).
 *
 * GAP_FACTOR spaces cells apart so rectangular images don't overlap.
 * 2.0 = edges touching, >2.0 = visible gap between rooms.
 */

/** Spacing multiplier: 2.0 = edges touch, 2.15 = ~7% gap */
export const GAP_FACTOR = 1.3

export interface HexPosition {
  q: number
  r: number
}

export interface PixelPosition {
  x: number
  y: number
}

/**
 * Axial (q, r) → pixel with spacing for non-overlapping rectangular images.
 * The isometric diamond layout is preserved but with gaps between rooms.
 */
export function hexToPixel(q: number, r: number, size: number): PixelPosition {
  const cubeHalfW = (7 / 8) * size
  const x = GAP_FACTOR * cubeHalfW * (q - r)
  const y = GAP_FACTOR * size * (q + r)
  return { x, y }
}

/** Bounding box of all positions + center for viewport sizing */
export function hexBoundingBox(positions: HexPosition[], size: number) {
  const allPositions = [{ q: 0, r: 0 }, ...positions]
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity

  const cubeHalfW = (7 / 8) * size

  for (const pos of allPositions) {
    const pixel = hexToPixel(pos.q, pos.r, size)
    minX = Math.min(minX, pixel.x - cubeHalfW)
    maxX = Math.max(maxX, pixel.x + cubeHalfW)
    minY = Math.min(minY, pixel.y - size)
    maxY = Math.max(maxY, pixel.y + size)
  }

  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
}
