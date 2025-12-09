/**
 * Phaser Game Engine Configuration
 * WaitPlay 게임 엔진 기본 설정
 */

import * as Phaser from 'phaser';

export const GAME_CONFIG = {
  width: 375,
  height: 667,
  backgroundColor: '#ffffff',
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 180, x: 0 },
      debug: import.meta.env.DEV
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container'
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
