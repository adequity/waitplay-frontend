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

/** CSS clip-path for flat-top hexagon */
export const HEX_CLIP_PATH = 'polygon(75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%, 25% 0%)'

/** Generate hex ring positions */
export function hexRing(radius: number): HexPosition[] {
  if (radius === 0) return [{ q: 0, r: 0 }]

  const directions: HexPosition[] = [
    { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
    { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }
  ]

  const results: HexPosition[] = []
  let q = radius
  let r = 0

  for (let side = 0; side < 6; side++) {
    const dir = directions[(side + 2) % 6]!
    for (let step = 0; step < radius; step++) {
      results.push({ q, r })
      q += dir.q
      r += dir.r
    }
  }

  return results
}

/** Generate spiral positions (ring 1, 2, 3...) excluding center */
export function spiralPositions(maxRing: number = 5): HexPosition[] {
  const positions: HexPosition[] = []
  for (let ring = 1; ring <= maxRing; ring++) {
    positions.push(...hexRing(ring))
  }
  return positions
}

/** Calculate needed ring count to hold N rooms */
export function neededRings(roomCount: number): number {
  if (roomCount <= 0) return 1
  let total = 0
  for (let ring = 1; ring <= 20; ring++) {
    total += 6 * ring
    if (total >= roomCount) return ring
  }
  return 5
}

/** Flat-top hex dimensions */
export function hexDimensions(size: number) {
  return {
    width: size * 2,
    height: size * Math.sqrt(3),
  }
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
