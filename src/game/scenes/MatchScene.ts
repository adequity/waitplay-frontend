/**
 * Match Game Scene
 * 카드 매칭 게임 - 같은 그림의 카드를 찾는 게임
 */

import * as Phaser from 'phaser';
import { COLORS } from '../config';

export class MatchScene extends Phaser.Scene {
  private score: number = 0;
  private moves: number = 0;
  private matchedPairs: number = 0;
  private firstCard?: Phaser.GameObjects.Rectangle;
  private secondCard?: Phaser.GameObjects.Rectangle;
  private canClick: boolean = true;
  private cards: Phaser.GameObjects.Rectangle[] = [];
  private scoreText?: Phaser.GameObjects.Text;
  private movesText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MatchScene' });
  }

  create() {
    // 배경
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // UI 텍스트
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: COLORS.white
    });

    this.movesText = this.add.text(20, 50, 'Moves: 0', {
      fontSize: '24px',
      color: COLORS.white
    });

    // 타이틀
    this.add.text(400, 50, 'Match Game - Find Pairs!', {
      fontSize: '32px',
      color: COLORS.primary
    }).setOrigin(0.5);

    // 카드 생성
    this.createCards();
  }

  private createCards() {
    const cardWidth = 100;
    const cardHeight = 120;
    const padding = 20;
    const startX = 150;
    const startY = 150;
    const cols = 4;
    const rows = 4;

    // 8쌍의 카드 (총 16장)
    const colors = [
      0xef4444, 0xef4444, // 빨강
      0xf59e0b, 0xf59e0b, // 주황
      0x10b981, 0x10b981, // 초록
      0x3b82f6, 0x3b82f6, // 파랑
      0x8b5cf6, 0x8b5cf6, // 보라
      0xec4899, 0xec4899, // 분홍
      0x06b6d4, 0x06b6d4, // 청록
      0xf43f5e, 0xf43f5e, // 장미
    ];

    // 카드 섞기
    const shuffled = Phaser.Utils.Array.Shuffle(colors);

    let index = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (cardWidth + padding);
        const y = startY + row * (cardHeight + padding);

        const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0x4b5563);
        card.setStrokeStyle(2, 0x9ca3af);
        card.setInteractive();
        card.setData('color', shuffled[index]);
        card.setData('revealed', false);
        card.setData('matched', false);

        card.on('pointerdown', () => this.onCardClick(card));
        this.cards.push(card);

        index++;
      }
    }
  }

  private onCardClick(card: Phaser.GameObjects.Rectangle) {
    if (!this.canClick) return;
    if (card.getData('revealed')) return;
    if (card.getData('matched')) return;

    // 카드 뒤집기
    card.setFillStyle(card.getData('color'));
    card.setData('revealed', true);

    if (!this.firstCard) {
      this.firstCard = card;
    } else if (!this.secondCard && card !== this.firstCard) {
      this.secondCard = card;
      this.moves++;
      this.updateMoves();
      this.canClick = false;

      // 0.8초 후 매칭 확인
      this.time.delayedCall(800, () => {
        this.checkMatch();
      });
    }
  }

  private checkMatch() {
    if (!this.firstCard || !this.secondCard) return;

    const color1 = this.firstCard.getData('color');
    const color2 = this.secondCard.getData('color');

    if (color1 === color2) {
      // 매칭 성공
      this.firstCard.setData('matched', true);
      this.secondCard.setData('matched', true);
      this.matchedPairs++;
      this.score += 100;
      this.updateScore();

      // 모든 카드 매칭 완료
      if (this.matchedPairs === 8) {
        this.winGame();
      }
    } else {
      // 매칭 실패 - 카드 다시 뒤집기
      this.firstCard.setFillStyle(0x4b5563);
      this.firstCard.setData('revealed', false);
      this.secondCard.setFillStyle(0x4b5563);
      this.secondCard.setData('revealed', false);
    }

    this.firstCard = undefined;
    this.secondCard = undefined;
    this.canClick = true;
  }

  private updateScore() {
    this.scoreText?.setText(`Score: ${this.score}`);
  }

  private updateMoves() {
    this.movesText?.setText(`Moves: ${this.moves}`);
  }

  private winGame() {
    // 보너스 점수 (적은 이동으로 클리어할수록 높은 점수)
    const bonus = Math.max(0, (50 - this.moves) * 10);
    this.score += bonus;
    this.updateScore();

    this.add.text(400, 300, 'You Win!', {
      fontSize: '48px',
      color: COLORS.success
    }).setOrigin(0.5);

    this.add.text(400, 350, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: COLORS.white
    }).setOrigin(0.5);

    this.events.emit('gameWin', { score: this.score, moves: this.moves });
  }

  public getScore(): number {
    return this.score;
  }
}
