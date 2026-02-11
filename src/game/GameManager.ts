/**
 * Game Manager - Phaser 게임 초기화 및 관리
 * PINBALL은 새로운 Pixi.js + Rapier 기반으로 별도 처리
 *
 * [최적화] Phaser와 Scene을 동적 import로 로드하여 초기 번들 크기 감소
 */

import { GAME_CONFIG, type GameType } from './config';

// Phaser 타입만 import (런타임 코드 없음)
import type * as PhaserTypes from 'phaser';

export class GameManager {
  private game: PhaserTypes.Game | null = null;
  private currentGameType: GameType | null = null;
  private qrCode: string | undefined = undefined;
  private Phaser: typeof PhaserTypes | null = null;

  /**
   * 게임 초기화 (비동기 - Phaser를 동적 로드)
   * @param gameType 게임 타입 (PINBALL, BRICK_BREAKER, MATCH, SPOT)
   * @param containerId HTML 컨테이너 ID
   * @param qrCode QR 코드 문자열 (선택)
   * @returns Promise<Phaser.Game | null> (PINBALL은 Vue 컴포넌트로 처리하므로 null 반환)
   */
  public async initGame(gameType: GameType, containerId: string = 'game-container', qrCode?: string): Promise<PhaserTypes.Game | null> {
    // 기존 게임 인스턴스가 있으면 제거
    if (this.game) {
      this.destroyGame();
    }

    this.currentGameType = gameType;
    this.qrCode = qrCode;

    // PINBALL은 새로운 Pixi.js + Rapier 기반 (별도 Vue 컴포넌트에서 처리)
    if (gameType === 'PINBALL') {
      console.log('[GameManager] PINBALL uses HyperPinball Vue component');
      return null;
    }

    // Phaser 동적 로드 (첫 호출 시에만)
    if (!this.Phaser) {
      console.log('[GameManager] Loading Phaser dynamically...');
      this.Phaser = await import('phaser');
    }

    // 게임 타입에 따른 Scene 동적 로드
    const scene = await this.loadSceneByType(gameType);

    const config: PhaserTypes.Types.Core.GameConfig = {
      ...GAME_CONFIG,
      parent: containerId,
      scene: scene
    };

    this.game = new this.Phaser.Game(config);
    return this.game;
  }

  /**
   * 핀볼 게임 여부 확인
   */
  public isPinballGame(gameType: GameType): boolean {
    return gameType === 'PINBALL';
  }

  /**
   * 게임 타입별 Scene 동적 로드 (Phaser 게임만)
   * Code Splitting으로 각 게임 씬을 별도 청크로 분리
   */
  private async loadSceneByType(gameType: GameType): Promise<any> {
    switch (gameType) {
      case 'BRICK_BREAKER': {
        const module = await import(/* webpackChunkName: "game-pinball" */ './scenes/PinballScene');
        return module.PinballScene;
      }
      case 'MATCH': {
        const module = await import(/* webpackChunkName: "game-match" */ './scenes/MatchScene');
        return module.MatchScene;
      }
      case 'SPOT': {
        const module = await import(/* webpackChunkName: "game-spot" */ './scenes/SpotScene');
        return module.SpotScene;
      }
      default:
        throw new Error(`Unknown game type: ${gameType}`);
    }
  }

  /**
   * 현재 게임 타입 반환
   */
  public getCurrentGameType(): GameType | null {
    return this.currentGameType;
  }

  /**
   * QR 코드 반환
   */
  public getQrCode(): string | undefined {
    return this.qrCode;
  }

  /**
   * 게임 일시정지
   */
  public pauseGame(): void {
    if (this.game && this.game.scene.scenes[0]) {
      this.game.scene.scenes[0].scene.pause();
    }
  }

  /**
   * 게임 재개
   */
  public resumeGame(): void {
    if (this.game && this.game.scene.scenes[0]) {
      this.game.scene.scenes[0].scene.resume();
    }
  }

  /**
   * 게임 종료 및 정리
   */
  public destroyGame(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
      this.currentGameType = null;
    }
  }

  /**
   * 게임 인스턴스 반환
   */
  public getGame(): PhaserTypes.Game | null {
    return this.game;
  }
}

// Singleton instance
export const gameManager = new GameManager();
