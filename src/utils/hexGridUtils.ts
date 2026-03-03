/**
 * Isometric cube grid utilities using axial coordinates (q, r).
 * Center (0, 0) = user's own room.
 *
 * Each "cell" is an isometric cube (diamond silhouette).
 * size = half the cube's on-screen height.
 * Cube dimensions: width = √3 × size, height = 2 × size.
 */

export interface HexPosition {
  q: number
  r: number
}

export interface PixelPosition {
  x: number
  y: number
}

/**
 * Axial (q, r) → pixel for isometric cube tessellation.
 * Adjacent cubes share edges seamlessly.
 */
export function hexToPixel(q: number, r: number, size: number): PixelPosition {
  const cubeHalfW = (Math.sqrt(3) / 2) * size // √3/2 × size
  const x = cubeHalfW * (q - r)
  const y = size * (q + r)
  return { x, y }
}

/** Bounding box of all positions + center for viewport sizing */
export function hexBoundingBox(positions: HexPosition[], size: number) {
  const allPositions = [{ q: 0, r: 0 }, ...positions]
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity

  const cubeHalfW = (Math.sqrt(3) / 2) * size

  for (const pos of allPositions) {
    const pixel = hexToPixel(pos.q, pos.r, size)
    minX = Math.min(minX, pixel.x - cubeHalfW)
    maxX = Math.max(maxX, pixel.x + cubeHalfW)
    minY = Math.min(minY, pixel.y - size)
    maxY = Math.max(maxY, pixel.y + size)
  }

  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
}
