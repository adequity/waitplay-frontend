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
const SCALE_FIT = 1;  // Phaser.Scale.FIT
const CENTER_BOTH = 1;  // Phaser.Scale.CENTER_BOTH

export const GAME_CONFIG = {
  width: 390,   // iPhone 기준 세로 해상도
  height: 844,
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
    mode: SCALE_FIT,
    autoCenter: CENTER_BOTH,
    parent: 'game-container',
    width: 390,
    height: 844,
    min: {
      width: 320,
      height: 480
    },
    max: {
      width: 600,
      height: 1200
    }
  },
  render: {
    antialias: true,
    pixelArt: false
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
