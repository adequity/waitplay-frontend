/**
 * Phaser Game Engine Configuration
 * WaitPlay 게임 엔진 기본 설정
 */

import * as Phaser from 'phaser';

export const GAME_CONFIG = {
  width: 800,
  height: 600,
  backgroundColor: '#282c34',
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300, x: 0 },
      debug: import.meta.env.DEV
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },
  render: {
    antialias: true,
    pixelArt: false
  }
};

export const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  white: '#ffffff',
  black: '#000000'
};

export const GAME_TYPES = {
  PINBALL: 'PINBALL',
  MATCH: 'MATCH',
  SPOT: 'SPOT'
} as const;

export type GameType = typeof GAME_TYPES[keyof typeof GAME_TYPES];
