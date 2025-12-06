/**
 * Match Game Scene
 * 매치 게임 - 같은 그림을 찾는 카드 게임
 */

import * as Phaser from 'phaser';
import { COLORS } from '../config';

export class MatchScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MatchScene' });
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    this.add.text(400, 300, 'Match Game\n\nClick to Start', {
      fontSize: '32px',
      color: COLORS.primary,
      align: 'center'
    }).setOrigin(0.5);
  }
}
