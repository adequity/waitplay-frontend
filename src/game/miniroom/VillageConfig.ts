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
export const VILLAGE_MAX_ZOOM = 2.5
export const VILLAGE_DETAIL_ZOOM = 1.0

// Label styles
export const HEX_LABEL_STYLE = {
  fontFamily: 'Noto Sans KR, sans-serif',
  fontSize: '11px',
  color: '#555',
  align: 'center' as const,
}

export const CENTER_LABEL_STYLE = {
  fontFamily: 'Noto Sans KR, sans-serif',
  fontSize: '12px',
  color: '#6366F1',
  fontStyle: 'bold',
  align: 'center' as const,
}

/** Calculate hex size based on viewport */
export function calcHexSize(viewportW: number, viewportH: number): number {
  return Math.min(viewportW, viewportH) * 0.35
}

/** Calculate zoom level to fit entire village in viewport */
export function calcVillageZoom(
  worldW: number, worldH: number,
  viewportW: number, viewportH: number,
): number {
  const zoom = Math.min(viewportW / worldW, viewportH / worldH) * 0.85
  return Math.max(zoom, 0.08)
}
