/**
 * Match Game Scene
 * 메모리 카드 매치 게임 - 같은 그림을 찾는 카드 게임
 */

import * as Phaser from 'phaser';
import { COLORS } from '../config';
import { submitGameScore } from '../../services/gameScoreService';

interface Card {
  sprite: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export class MatchScene extends Phaser.Scene {
  private cards: Card[] = [];
  private flippedCards: Card[] = [];
  private canFlip: boolean = true;
  private moves: number = 0;
  private matches: number = 0;
  private movesText?: Phaser.GameObjects.Text;
  private matchesText?: Phaser.GameObjects.Text;
  private gameStarted: boolean = false;
  private startTime: number = 0;
  private readonly TOTAL_PAIRS = 8;

  constructor() {
    super({ key: 'MatchScene' });
  }

  create() {
    // 배경
    this.add.rectangle(400, 300, 800, 600, 0x0f0f23);

    // UI 텍스트
    this.movesText = this.add.text(16, 16, '이동: 0', {
      fontSize: '24px',
      color: COLORS.white
    });

    this.matchesText = this.add.text(16, 50, '매치: 0/' + this.TOTAL_PAIRS, {
      fontSize: '24px',
      color: COLORS.white
    });

    // 타이틀
    const title = this.add.text(400, 100, '같은 카드 찾기', {
      fontSize: '36px',
      color: COLORS.primary,
      align: 'center'
    }).setOrigin(0.5);

    const instructions = this.add.text(400, 150, '같은 이모지를 찾으세요!', {
      fontSize: '20px',
      color: COLORS.white,
      align: 'center'
    }).setOrigin(0.5);

    // 카드 생성
    this.createCards();

    // 시작 버튼
    const startButton = this.add.text(400, 520, '게임 시작', {
      fontSize: '28px',
      color: COLORS.white,
      backgroundColor: COLORS.primary,
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      this.startGame();
      startButton.destroy();
      title.destroy();
      instructions.destroy();
    });
  }

  private createCards() {
    // 8쌍의 이모지 (16장의 카드)
    const emojis = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎲', '🎺'];
    const cardValues = [...emojis, ...emojis]; // 중복 생성

    // 카드 섞기
    this.shuffleArray(cardValues);

    // 4x4 그리드로 카드 배치
    const cols = 4;
    const rows = 4;
    const cardWidth = 90;
    const cardHeight = 110;
    const startX = 190;
    const startY = 220;
    const spacingX = 110;
    const spacingY = 130;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;

        // 카드 뒷면
        const cardBack = this.add.rectangle(x, y, cardWidth, cardHeight, 0x667eea, 1);
        cardBack.setStrokeStyle(3, 0x764ba2);

        // 카드 앞면 (이모지)
        const cardFront = this.add.text(x, y, cardValues[index] || '?', {
          fontSize: '48px'
        }).setOrigin(0.5).setVisible(false);

        const card: Card = {
          sprite: cardBack,
          text: cardFront,
          value: cardValues[index] || '?',
          isFlipped: false,
          isMatched: false
        };

        // 클릭 이벤트
        cardBack.setInteractive();
        cardBack.on('pointerdown', () => this.flipCard(card));

        this.cards.push(card);
      }
    }
  }

  private startGame() {
    this.gameStarted = true;
    this.startTime = Date.now();
  }

  private flipCard(card: Card) {
    if (!this.gameStarted || !this.canFlip || card.isFlipped || card.isMatched) {
      return;
    }

    // 카드 뒤집기
    card.isFlipped = true;
    card.sprite.setFillStyle(0xffffff);
    card.text.setVisible(true);
    this.flippedCards.push(card);

    // 두 장의 카드가 뒤집혔을 때
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.movesText?.setText('이동: ' + this.moves);
      this.canFlip = false;

      // 매치 확인
      this.checkMatch();
    }
  }

  private checkMatch() {
    const [card1, card2] = this.flippedCards;

    if (!card1 || !card2) return;

    if (card1.value === card2.value) {
      // 매치 성공
      this.matches++;
      this.matchesText?.setText('매치: ' + this.matches + '/' + this.TOTAL_PAIRS);

      card1.isMatched = true;
      card2.isMatched = true;

      // 매치된 카드 효과
      this.tweens.add({
        targets: [card1.sprite, card1.text, card2.sprite, card2.text],
        alpha: 0.3,
        duration: 300
      });

      this.flippedCards = [];
      this.canFlip = true;

      // 모든 카드 매치 완료
      if (this.matches === this.TOTAL_PAIRS) {
        this.time.delayedCall(500, () => {
          this.endGame();
        });
      }
    } else {
      // 매치 실패 - 1초 후 다시 뒤집기
      this.time.delayedCall(1000, () => {
        card1.isFlipped = false;
        card1.sprite.setFillStyle(0x667eea);
        card1.text.setVisible(false);

        card2.isFlipped = false;
        card2.sprite.setFillStyle(0x667eea);
        card2.text.setVisible(false);

        this.flippedCards = [];
        this.canFlip = true;
      });
    }
  }

  private shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      const jVal = array[j];
      if (temp && jVal) {
        array[i] = jVal;
        array[j] = temp;
      }
    }
  }

  private async endGame() {
    const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

    // 점수 계산 (이동 수가 적을수록, 시간이 짧을수록 높은 점수)
    const baseScore = 1000;
    const movePenalty = (this.moves - this.TOTAL_PAIRS) * 10; // 최소 이동 수는 TOTAL_PAIRS
    const timePenalty = elapsedTime * 2;
    const finalScore = Math.max(100, baseScore - movePenalty - timePenalty);

    // 결과 화면
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    const resultText = this.add.text(400, 200, '완료!', {
      fontSize: '48px',
      color: COLORS.success,
      align: 'center'
    }).setOrigin(0.5);

    const statsText = this.add.text(
      400,
      270,
      `이동 수: ${this.moves}\n시간: ${elapsedTime}초\n점수: ${finalScore}`,
      {
        fontSize: '24px',
        color: COLORS.white,
        align: 'center',
        lineSpacing: 10
      }
    ).setOrigin(0.5);

    // 이름 입력
    const namePrompt = this.add.text(400, 360, '이름을 입력하세요:', {
      fontSize: '20px',
      color: COLORS.white
    }).setOrigin(0.5);

    // HTML 입력 요소
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = '플레이어 이름';
    inputElement.maxLength = 20;
    inputElement.style.cssText = `
      position: absolute;
      left: 50%;
      top: 400px;
      transform: translateX(-50%);
      width: 300px;
      padding: 10px;
      font-size: 18px;
      border: 2px solid ${COLORS.primary};
      border-radius: 8px;
      text-align: center;
    `;
    document.getElementById('game-container')?.appendChild(inputElement);
    inputElement.focus();

    const submitButton = document.createElement('button');
    submitButton.textContent = '점수 제출';
    submitButton.style.cssText = `
      position: absolute;
      left: 50%;
      top: 450px;
      transform: translateX(-50%);
      padding: 10px 30px;
      font-size: 18px;
      background: ${COLORS.primary};
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    `;
    document.getElementById('game-container')?.appendChild(submitButton);

    const submitScore = async () => {
      const playerName = inputElement.value.trim() || '익명';

      // 점수 제출
      const success = await submitGameScore({
        gameType: 'memory',
        playerName,
        score: finalScore
      });

      // 입력 요소 제거
      inputElement.remove();
      submitButton.remove();

      if (success) {
        namePrompt.setText('점수가 제출되었습니다!');
        namePrompt.setColor(COLORS.success);
      } else {
        namePrompt.setText('점수 제출 실패');
        namePrompt.setColor(COLORS.danger);
      }

      // 재시작 버튼
      this.time.delayedCall(2000, () => {
        const restartButton = this.add.text(400, 480, '다시 시작', {
          fontSize: '24px',
          color: COLORS.white,
          backgroundColor: COLORS.primary,
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        restartButton.on('pointerdown', () => {
          this.scene.restart();
        });
      });
    };

    submitButton.onclick = submitScore;
    inputElement.onkeydown = (e) => {
      if (e.key === 'Enter') {
        submitScore();
      }
    };
  }
}
