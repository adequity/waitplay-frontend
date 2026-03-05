export interface VillageStoreRoom {
  id: string
  roomImageUrl: string
  roomName: string
  roomColor: string
  gridQ: number
  gridR: number
  storeName: string
  storeCode?: string
}

export interface VillageEmptySlot {
  gridQ: number
  gridR: number
}

// Zoom
export const VILLAGE_MAX_ZOOM = 3.0
export const VILLAGE_DETAIL_ZOOM = 1.2

// Bright background
export const VILLAGE_BG_COLOR = 0xF0F0F5

// Label styles
export const HEX_LABEL_STYLE = {
  fontFamily: 'Noto Sans KR, sans-serif',
  fontSize: '11px',
  color: '#555555',
  align: 'center' as const,
}

export const CENTER_LABEL_STYLE = {
  fontFamily: 'Noto Sans KR, sans-serif',
  fontSize: '12px',
  color: '#6366F1',
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
