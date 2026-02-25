/**
 * Phaser Game Engine Configuration
 * WaitPlay 게임 엔진 기본 설정
 *
 * [최적화] Phaser import 제거 - Scale 상수를 직접 정의
 * Phaser.Scale.FIT = 1, Phaser.Scale.CENTER_BOTH = 1
 * 이렇게 하면 config.ts import 시 Phaser 번들이 로드되지 않음
 */

// Phaser Scale 상수 (Phaser import 없이 직접 정의)
// https://newdocs.phaser.io/docs/3.60.0/Phaser.Scale.ScaleModes
const SCALE_RESIZE = 5;  // Phaser.Scale.RESIZE - 화면 크기에 맞게 게임 영역 조정
const CENTER_BOTH = 1;  // Phaser.Scale.CENTER_BOTH

// 고해상도(Retina) 디스플레이에서 선명한 텍스트/그래픽을 위한 DPR 값
export const DPR = Math.min(window.devicePixelRatio || 1, 3);

export const GAME_CONFIG = {
  width: 390,   // 기본 너비 (RESIZE 모드에서는 참고값)
  height: 844,  // 기본 높이 (RESIZE 모드에서는 참고값)
  backgroundColor: '#fdf2f8',  // 게임 배경색과 동일 (pink-50)
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 180, x: 0 },
      debug: import.meta.env.DEV
    }
  },
  scale: {
    mode: SCALE_RESIZE,
    autoCenter: CENTER_BOTH,
    parent: 'game-container',
    width: '100%',
    height: '100%'
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true
  }
};

export const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#4facfe',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#fbbf24',
  white: '#ffffff',
  black: '#000000',
  bg: '#0f0f23',
  bgSecondary: '#1a1a2e',
  bgTertiary: '#2d2d44'
};

export const GAME_TYPES = {
  PINBALL: 'PINBALL',
  BRICK_BREAKER: 'BRICK_BREAKER',
  MATCH: 'MATCH',
  SPOT: 'SPOT'
} as const;

export type GameType = typeof GAME_TYPES[keyof typeof GAME_TYPES];
