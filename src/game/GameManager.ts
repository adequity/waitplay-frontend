/**
 * Game Manager - Phaser 게임 초기화 및 관리
 * PINBALL은 새로운 Pixi.js + Rapier 기반으로 별도 처리
 */

import * as Phaser from 'phaser';
import { GAME_CONFIG, type GameType } from './config';
import { PinballScene } from './scenes/PinballScene';
import { MatchScene } from './scenes/MatchScene';
import { SpotScene } from './scenes/SpotScene';

export class GameManager {
  private game: Phaser.Game | null = null;
  private currentGameType: GameType | null = null;
  private qrCode: string | undefined = undefined;

  /**
   * 게임 초기화
   * @param gameType 게임 타입 (PINBALL, BRICK_BREAKER, MATCH, SPOT)
   * @param containerId HTML 컨테이너 ID
   * @param qrCode QR 코드 문자열 (선택)
   * @returns Phaser.Game | null (PINBALL은 Vue 컴포넌트로 처리하므로 null 반환)
   */
  public initGame(gameType: GameType, containerId: string = 'game-container', qrCode?: string): Phaser.Game | null {
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

    // 게임 타입에 따른 Scene 선택
    const scene = this.getSceneByType(gameType);

    const config: Phaser.Types.Core.GameConfig = {
      ...GAME_CONFIG,
      parent: containerId,
      scene: scene
    };

    this.game = new Phaser.Game(config);
    return this.game;
  }

  /**
   * 핀볼 게임 여부 확인
   */
  public isPinballGame(gameType: GameType): boolean {
    return gameType === 'PINBALL';
  }

  /**
   * 게임 타입별 Scene 반환 (Phaser 게임만)
   */
  private getSceneByType(gameType: GameType): any {
    switch (gameType) {
      case 'BRICK_BREAKER':
        return PinballScene;
      case 'MATCH':
        return MatchScene;
      case 'SPOT':
        return SpotScene;
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
  public getGame(): Phaser.Game | null {
    return this.game;
  }
}

// Singleton instance
export const gameManager = new GameManager();
