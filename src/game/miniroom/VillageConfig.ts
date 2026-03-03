export interface VillageStoreRoom {
  id: string
  roomImageUrl: string
  roomName: string
  roomColor: string
  gridQ: number
  gridR: number
  storeName: string
}

// Zoom
export const VILLAGE_MAX_ZOOM = 3.0
export const VILLAGE_DETAIL_ZOOM = 1.2

// Dark background
export const VILLAGE_BG_COLOR = 0x111827

// Label styles (white for dark bg)
export const HEX_LABEL_STYLE = {
  fontFamily: 'Noto Sans KR, sans-serif',
  fontSize: '11px',
  color: '#ffffff',
  align: 'center' as const,
}

export const CENTER_LABEL_STYLE = {
  fontFamily: 'Noto Sans KR, sans-serif',
  fontSize: '12px',
  color: '#a5b4fc',
  fontStyle: 'bold',
  align: 'center' as const,
}

/** Calculate hex size based on viewport — large hexes for honeycomb look */
export function calcHexSize(viewportW: number, viewportH: number): number {
  return Math.min(viewportW, viewportH) * 0.22
}

/** Calculate zoom level to fit entire village in viewport */
export function calcVillageZoom(
  worldW: number, worldH: number,
  viewportW: number, viewportH: number,
): number {
  const zoom = Math.min(viewportW / worldW, viewportH / worldH) * 0.9
  return Math.max(zoom, 0.08)
}
