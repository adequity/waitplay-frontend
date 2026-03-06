export interface VillageStoreRoom {
  id: string
  roomImageUrl: string
  roomName: string
  roomColor: string
  gridQ: number
  gridR: number
  storeName: string
  storeCode?: string
  isFriend?: boolean
  friendProfileCode?: string
  // 광고 필드
  isAd?: boolean
  adId?: string
  adLinkType?: string
  adLinkUrl?: string
  adStoreCode?: string
}

export interface VillageEmptySlot {
  gridQ: number
  gridR: number
}

// Zoom
export const VILLAGE_MAX_ZOOM = 3.0
export const VILLAGE_DETAIL_ZOOM = 1.2

// White background (default)
export const VILLAGE_BG_COLOR = 0xFFFFFF

// Village theme presets (color)
export const VILLAGE_THEMES: Record<string, number> = {
  white: 0xFFFFFF,
  cream: 0xFFF8F0,
  sky: 0xE8F4FD,
  mint: 0xE8F5E8,
  lavender: 0xF0E8F5,
  peach: 0xFFF0E8,
  gray: 0xF0F0F0,
  dark: 0x2C2C2C,
}

// Village theme presets (image)
export interface VillageImageTheme {
  imageUrl: string
  bgColor: number
  bgColorCss: string
}

export const VILLAGE_THEME_IMAGES: Record<string, VillageImageTheme> = {
  tema1: {
    imageUrl: '/assets/village-themes/tema1.png',
    bgColor: 0x87CEEB,
    bgColorCss: '#87CEEB',
  },
}

export function isImageTheme(key: string): boolean {
  return key in VILLAGE_THEME_IMAGES
}

export function getThemeBgColorCss(key: string): string {
  if (VILLAGE_THEME_IMAGES[key]) return VILLAGE_THEME_IMAGES[key].bgColorCss
  const hex = VILLAGE_THEMES[key] ?? VILLAGE_BG_COLOR
  return '#' + hex.toString(16).padStart(6, '0')
}

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
