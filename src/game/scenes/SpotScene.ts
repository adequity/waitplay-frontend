/**
 * Spot The Difference Scene
 * 차이점 찾기 게임
 */

import * as Phaser from 'phaser';
import { COLORS } from '../config';

export class SpotScene extends Phaser.Scene {
  private score: number = 0;
  private foundDifferences: number = 0;
  private totalDifferences: number = 5;
  private scoreText?: Phaser.GameObjects.Text;
  private progressText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'SpotScene' });
  }

  create() {
    // 배경
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // UI 텍스트
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: COLORS.white
    });

    this.progressText = this.add.text(20, 50, `Found: 0/${this.totalDifferences}`, {
      fontSize: '24px',
      color: COLORS.white
    });

    // 타이틀
    this.add.text(400, 50, 'Spot The Difference!', {
      fontSize: '32px',
      color: COLORS.primary
    }).setOrigin(0.5);

    this.add.text(400, 90, 'Find 5 differences between the images', {
      fontSize: '18px',
      color: COLORS.white
    }).setOrigin(0.5);

    // 이미지 영역 (왼쪽/오른쪽)
    this.createGameArea();
  }

  private createGameArea() {
    // 왼쪽 이미지 영역
    const leftArea = this.add.rectangle(250, 350, 300, 350, 0x374151);
    leftArea.setStrokeStyle(2, 0x6b7280);

    // 오른쪽 이미지 영역
    const rightArea = this.add.rectangle(550, 350, 300, 350, 0x374151);
    rightArea.setStrokeStyle(2, 0x6b7280);

    // 차이점 생성 (임시로 도형 사용)
    this.createDifferences();
  }

  private createDifferences() {
    const differences = [
      { x: 250, y: 250, color: 0xef4444 },
      { x: 550, y: 250, color: 0x10b981 },
      { x: 250, y: 350, color: 0x3b82f6 },
      { x: 550, y: 350, color: 0xf59e0b },
      { x: 250, y: 450, color: 0x8b5cf6 },
    ];

    differences.forEach((diff, index) => {
      // 왼쪽 (정답)
      const leftShape = this.add.circle(diff.x, diff.y, 20, diff.color);

      // 오른쪽 (클릭 가능)
      const rightShape = this.add.circle(diff.x + 300, diff.y, 20, diff.color);
      rightShape.setInteractive();
      rightShape.setData('found', false);
      rightShape.setData('id', index);

      rightShape.on('pointerdown', () => {
        if (!rightShape.getData('found')) {
          this.onDifferenceFound(rightShape, diff.x + 300, diff.y);
        }
      });
    });
  }

  private onDifferenceFound(shape: Phaser.GameObjects.Arc, x: number, y: number) {
    shape.setData('found', true);
    this.foundDifferences++;
    this.score += 200;

    // 정답 표시 (원 그리기)
    const circle = this.add.circle(x, y, 25);
    circle.setStrokeStyle(3, 0x10b981);
    circle.setFillStyle(0x10b981, 0.2);

    this.updateScore();
    this.updateProgress();

    // 모든 차이점 찾기 완료
    if (this.foundDifferences === this.totalDifferences) {
      this.time.delayedCall(500, () => {
        this.winGame();
      });
    }
  }

  private updateScore() {
    this.scoreText?.setText(`Score: ${this.score}`);
  }

  private updateProgress() {
    this.progressText?.setText(`Found: ${this.foundDifferences}/${this.totalDifferences}`);
  }

  private winGame() {
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    this.add.text(400, 250, 'Perfect!', {
      fontSize: '48px',
      color: COLORS.success
    }).setOrigin(0.5);

    this.add.text(400, 320, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: COLORS.white
    }).setOrigin(0.5);

    this.add.text(400, 370, 'All differences found!', {
      fontSize: '24px',
      color: COLORS.white
    }).setOrigin(0.5);

    this.events.emit('gameWin', { score: this.score });
  }

  public getScore(): number {
    return this.score;
  }
}
