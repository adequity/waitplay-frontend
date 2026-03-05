/**
 * Isometric cube grid utilities using axial coordinates (q, r).
 * Center (0, 0) = user's own room.
 *
 * Each "cell" is an isometric cube (diamond silhouette).
 * size = half the cube's on-screen height.
 * Cube dimensions: width = 7/4 × size, height = 2 × size (7:8 aspect).
 *
 * GAP_FACTOR_X / GAP_FACTOR_Y space cells apart independently.
 */

/** Spacing multipliers for X (horizontal) and Y (vertical) axes */
export let GAP_FACTOR_X = 1.5
export let GAP_FACTOR_Y = 1.5

/** Set both gap factors at once (legacy single-value API) */
export function setGapFactor(value: number) {
  GAP_FACTOR_X = value
  GAP_FACTOR_Y = value
}

/** Set X and Y gap factors independently */
export function setGapFactorXY(x: number, y: number) {
  GAP_FACTOR_X = x
  GAP_FACTOR_Y = y
}

export interface HexPosition {
  q: number
  r: number
}

export interface PixelPosition {
  x: number
  y: number
}

/**
 * Axial (q, r) → pixel with independent X/Y spacing.
 */
export function hexToPixel(q: number, r: number, size: number): PixelPosition {
  const cubeHalfW = (7 / 8) * size
  const x = GAP_FACTOR_X * cubeHalfW * (q - r)
  const y = GAP_FACTOR_Y * size * (q + r)
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
