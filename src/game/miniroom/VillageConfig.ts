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
  // 랜덤 추천
  isRandom?: boolean
  randomType?: string
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

// ========== Fallback: Hardcoded theme presets (used if API unavailable) ==========

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

// ========== Dynamic theme data (loaded from API) ==========

export interface VillageThemeDynamic {
  themeKey: string
  displayName: string
  themeType: 'color' | 'image'
  colorValue: string | null
  imageUrl: string | null
  bgColor: string | null
}

let _dynamicThemes: VillageThemeDynamic[] | null = null

export function setDynamicThemes(themes: VillageThemeDynamic[]) {
  _dynamicThemes = themes
}

export function getDynamicThemes(): VillageThemeDynamic[] | null {
  return _dynamicThemes
}

// ========== Theme helper functions (dynamic → fallback) ==========

export function isImageTheme(key: string): boolean {
  if (_dynamicThemes) {
    return _dynamicThemes.some(t => t.themeKey === key && t.themeType === 'image')
  }
  return key in VILLAGE_THEME_IMAGES
}

export function getThemeBgColorCss(key: string): string {
  if (_dynamicThemes) {
    const dt = _dynamicThemes.find(t => t.themeKey === key)
    if (dt) {
      if (dt.themeType === 'image') return dt.bgColor || '#FFFFFF'
      return dt.colorValue || '#FFFFFF'
    }
  }
  // Fallback
  if (VILLAGE_THEME_IMAGES[key]) return VILLAGE_THEME_IMAGES[key].bgColorCss
  const hex = VILLAGE_THEMES[key] ?? VILLAGE_BG_COLOR
  return '#' + hex.toString(16).padStart(6, '0')
}

/** Get image theme data — dynamic first, fallback to hardcoded */
export function getImageThemeData(key: string): VillageImageTheme | null {
  if (_dynamicThemes) {
    const dt = _dynamicThemes.find(t => t.themeKey === key && t.themeType === 'image')
    if (dt && dt.imageUrl) {
      const bgHex = dt.bgColor || '#87CEEB'
      return {
        imageUrl: dt.imageUrl,
        bgColor: parseInt(bgHex.replace('#', ''), 16),
        bgColorCss: bgHex,
      }
    }
  }
  return VILLAGE_THEME_IMAGES[key] || null
}

/** Get color theme value as Phaser hex number — dynamic first, fallback to hardcoded */
export function getColorThemeValue(key: string): number {
  if (_dynamicThemes) {
    const dt = _dynamicThemes.find(t => t.themeKey === key && t.themeType === 'color')
    if (dt?.colorValue) return parseInt(dt.colorValue.replace('#', ''), 16)
  }
  return VILLAGE_THEMES[key] ?? VILLAGE_BG_COLOR
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
