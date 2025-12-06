/**
 * Spot Game Scene
 * 틀린그림찾기 게임
 */

import * as Phaser from 'phaser';
import { COLORS } from '../config';

export class SpotScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SpotScene' });
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    this.add.text(400, 300, 'Spot Difference Game\n\nClick to Start', {
      fontSize: '32px',
      color: COLORS.primary,
      align: 'center'
    }).setOrigin(0.5);
  }
}
