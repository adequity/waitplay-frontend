/**
 * Game Manager - Phaser 게임 초기화 및 관리
 */

import * as Phaser from 'phaser';
import { GAME_CONFIG, GameType } from './config';
import { PinballScene } from './scenes/PinballScene';
import { MatchScene } from './scenes/MatchScene';
import { SpotScene } from './scenes/SpotScene';

export class GameManager {
  private game: Phaser.Game | null = null;
  private currentGameType: GameType | null = null;

  /**
   * 게임 초기화
   * @param gameType 게임 타입 (PINBALL, MATCH, SPOT)
   * @param containerId HTML 컨테이너 ID
   */
  public initGame(gameType: GameType, containerId: string = 'game-container'): Phaser.Game {
    // 기존 게임 인스턴스가 있으면 제거
    if (this.game) {
      this.destroyGame();
    }

    this.currentGameType = gameType;

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
   * 게임 타입별 Scene 반환
   */
  private getSceneByType(gameType: GameType): any {
    switch (gameType) {
      case 'PINBALL':
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
