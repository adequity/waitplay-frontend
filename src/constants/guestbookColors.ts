// 레거시 색상 이름 → hex 매핑 (기존 데이터 호환용)
const LEGACY_COLOR_MAP: Record<string, string> = {
  white:  '#ffffff',
  yellow: '#fff9c4',
  pink:   '#fce4ec',
  blue:   '#e3f2fd',
  green:  '#e8f5e9',
  orange: '#fff3e0',
  purple: '#f3e5f5',
}

export const DEFAULT_BG_COLOR = '#ffffff'

/**
 * color 값을 실제 배경색 hex로 변환
 * - hex 값(#으로 시작)이면 그대로 반환
 * - 레거시 이름(yellow 등)이면 매핑된 hex 반환
 * - 없거나 빈 값이면 흰색 디폴트
 */
export function getCardBgHex(color: string): string {
  if (!color) return DEFAULT_BG_COLOR
  if (color.startsWith('#')) return color
  return LEGACY_COLOR_MAP[color] || DEFAULT_BG_COLOR
}

/** 그라데이션 문자열인지 판별 */
export function isGradient(color: string): boolean {
  return !!color && color.startsWith('linear-gradient')
}

/**
 * CSS background 속성에 사용할 값 반환 (단색 + 그라데이션 모두 지원)
 */
export function getCardBg(color: string): string {
  if (!color) return DEFAULT_BG_COLOR
  if (color.startsWith('#')) return color
  if (color.startsWith('linear-gradient')) return color
  return LEGACY_COLOR_MAP[color] || DEFAULT_BG_COLOR
}
