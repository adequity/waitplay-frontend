/**
 * Pinball Game Scene
 * 핀볼 게임 - 공을 튕겨서 점수를 획득하는 게임
 */

import * as Phaser from 'phaser';
import { COLORS } from '../config';

export class PinballScene extends Phaser.Scene {
  private ball?: Phaser.Physics.Arcade.Sprite;
  private paddle?: Phaser.Physics.Arcade.Sprite;
  private score: number = 0;
  private scoreText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PinballScene' });
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: COLORS.white
    });

    const title = this.add.text(400, 300, 'Pinball Game\n\nClick to Start', {
      fontSize: '32px',
      color: COLORS.primary,
      align: 'center'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      title.destroy();
      this.startGame();
    });
  }

  private startGame() {
    this.add.text(400, 300, 'Game Started!', {
      fontSize: '24px',
      color: COLORS.success
    }).setOrigin(0.5);
  }
}
