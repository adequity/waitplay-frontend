/**
 * Match Game Scene - 같은 그림 찾기
 * 메모리 카드 매치 게임 - 같은 그림을 찾는 카드 게임
 * 개선된 UI/UX와 다양한 테마 지원
 * Admin 등록 에셋 이미지 또는 기본 이모지 테마 사용
 */

import * as Phaser from 'phaser';
import { COLORS } from '../config';
import { submitGameScore } from '../../services/gameScoreService';
import { gameManager } from '../GameManager';
import { getMatchGameAssets, extractImageUrls, type GameAsset } from '../../services/gameAssetService';

interface Card {
  container: Phaser.GameObjects.Container;
  back: Phaser.GameObjects.Rectangle;
  backIcon: Phaser.GameObjects.Text;
  front: Phaser.GameObjects.Rectangle;
  frontText?: Phaser.GameObjects.Text;
  frontImage?: Phaser.GameObjects.Image;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  index: number;
  isImageCard: boolean;
}

// 테마별 이모지 세트 (에셋이 없을 때 폴백)
const THEMES = {
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
  food: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝', '🍌', '🍉', '🍐', '🥭'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '⛳'],
  nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🍀', '🌴', '🌵', '🌲', '🍁', '🌊', '⭐'],
  travel: ['✈️', '🚗', '🚀', '🚂', '🚢', '🚁', '🛵', '🚲', '🎢', '🗼', '🏰', '⛵'],
};

type ThemeKey = keyof typeof THEMES;

export class MatchScene extends Phaser.Scene {
  private cards: Card[] = [];
  private flippedCards: Card[] = [];
  private canFlip: boolean = true;
  private moves: number = 0;
  private matches: number = 0;
  private movesText?: Phaser.GameObjects.Text;
  private matchesText?: Phaser.GameObjects.Text;
  private timeText?: Phaser.GameObjects.Text;
  private comboText?: Phaser.GameObjects.Text;
  private gameStarted: boolean = false;
  private startTime: number = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private elapsedTime: number = 0;
  private readonly TOTAL_PAIRS = 8;
  private currentTheme: ThemeKey = 'animals';
  private consecutiveMatches: number = 0;
  private maxCombo: number = 0;
  private titleElements: Phaser.GameObjects.GameObject[] = [];

  // 에셋 관련
  private gameAssets: GameAsset[] = [];
  private useImageAssets: boolean = false;
  private assetsLoaded: boolean = false;
  private loadingText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MatchScene' });
  }

  init() {
    // 상태 초기화
    this.cards = [];
    this.flippedCards = [];
    this.canFlip = true;
    this.moves = 0;
    this.matches = 0;
    this.gameStarted = false;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.consecutiveMatches = 0;
    this.maxCombo = 0;
    this.titleElements = [];
    this.gameAssets = [];
    this.useImageAssets = false;
    this.assetsLoaded = false;

    // 랜덤 테마 선택 (폴백용)
    const themeKeys = Object.keys(THEMES) as ThemeKey[];
    this.currentTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)] || 'animals';
  }

  preload() {
    // 이미지 에셋을 동적으로 로드
    this.loadGameAssets();
  }

  private async loadGameAssets() {
    try {
      console.log('[MatchScene] Fetching game assets...');
      const qrCode = gameManager.getQrCode();
      console.log('[MatchScene] QR Code:', qrCode);
      this.gameAssets = await getMatchGameAssets(this.TOTAL_PAIRS, qrCode);

      if (this.gameAssets.length >= this.TOTAL_PAIRS) {
        console.log(`[MatchScene] Found ${this.gameAssets.length} assets, loading images...`);
        this.useImageAssets = true;

        // 이미지 로드
        this.gameAssets.forEach((asset, index) => {
          if (asset.imageUrl) {
            this.load.image(`asset_${index}`, asset.imageUrl);
          }
        });

        // 로드 완료 이벤트
        this.load.once('complete', () => {
          console.log('[MatchScene] All asset images loaded');
          this.assetsLoaded = true;
          if (this.loadingText) {
            this.loadingText.destroy();
            this.loadingText = undefined;
          }
        });

        this.load.start();
      } else {
        console.log('[MatchScene] Not enough assets, using emoji theme');
        this.useImageAssets = false;
        this.assetsLoaded = true;
      }
    } catch (error) {
      console.error('[MatchScene] Failed to load game assets:', error);
      this.useImageAssets = false;
      this.assetsLoaded = true;
    }
  }

  create() {
    const W = this.sys.game.config.width as number;
    const H = this.sys.game.config.height as number;

    // 그라데이션 배경
    this.createBackground(W, H);

    // UI 패널
    this.createUIPanel(W, H);

    // 타이틀 화면
    this.createTitleScreen(W, H);

    // 카드 생성 (숨김 상태)
    this.createCards(W, H);
  }

  private createBackground(W: number, H: number) {
    // 배경 그라데이션 효과 (사각형 레이어링)
    this.add.rectangle(W * 0.5, H * 0.5, W, H, 0x0f0f23);

    // 장식 원
    const decorCircle1 = this.add.circle(W * 0.1, H * 0.1, 100, 0x667eea, 0.1);
    const decorCircle2 = this.add.circle(W * 0.9, H * 0.9, 150, 0x764ba2, 0.1);
    const decorCircle3 = this.add.circle(W * 0.8, H * 0.2, 80, 0x4facfe, 0.08);
  }

  private createUIPanel(W: number, H: number) {
    // 상단 UI 패널
    const panelBg = this.add.rectangle(W * 0.5, H * 0.05, W * 0.95, H * 0.08, 0x1a1a2e, 0.9);
    panelBg.setStrokeStyle(2, 0x667eea, 0.5);

    // 이동 수
    this.movesText = this.add.text(W * 0.05, H * 0.05, '🎯 0', {
      fontSize: Math.floor(H * 0.035) + 'px',
      color: COLORS.white,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // 매치 수
    this.matchesText = this.add.text(W * 0.35, H * 0.05, '✅ 0/' + this.TOTAL_PAIRS, {
      fontSize: Math.floor(H * 0.035) + 'px',
      color: COLORS.white,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // 시간
    this.timeText = this.add.text(W * 0.65, H * 0.05, '⏱️ 0초', {
      fontSize: Math.floor(H * 0.035) + 'px',
      color: COLORS.white,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // 콤보 텍스트 (숨김 상태로 시작)
    this.comboText = this.add.text(W * 0.5, H * 0.12, '', {
      fontSize: Math.floor(H * 0.05) + 'px',
      color: COLORS.warning,
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);
  }

  private createTitleScreen(W: number, H: number) {
    // 타이틀
    const title = this.add.text(W * 0.5, H * 0.2, '🎴 같은 그림 찾기', {
      fontSize: Math.floor(H * 0.055) + 'px',
      color: COLORS.primary,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.titleElements.push(title);

    // 에셋 또는 테마 표시
    if (this.useImageAssets && this.gameAssets.length > 0) {
      // 관리자 등록 이미지 사용
      const assetLabel = this.add.text(W * 0.5, H * 0.28, '🖼️ 커스텀 이미지 모드', {
        fontSize: Math.floor(H * 0.03) + 'px',
        color: COLORS.success
      }).setOrigin(0.5);
      this.titleElements.push(assetLabel);

      const assetCount = this.add.text(W * 0.5, H * 0.34, `${this.gameAssets.length}개의 이미지로 플레이`, {
        fontSize: Math.floor(H * 0.025) + 'px',
        color: COLORS.white
      }).setOrigin(0.5);
      this.titleElements.push(assetCount);
    } else {
      // 이모지 테마 사용
      const themeEmojis = THEMES[this.currentTheme];
      const themeDisplay = themeEmojis ? themeEmojis.slice(0, 4).join(' ') : '🎮';

      const themeLabel = this.add.text(W * 0.5, H * 0.28, `테마: ${this.getThemeName()}`, {
        fontSize: Math.floor(H * 0.03) + 'px',
        color: COLORS.accent
      }).setOrigin(0.5);
      this.titleElements.push(themeLabel);

      const themeSample = this.add.text(W * 0.5, H * 0.34, themeDisplay, {
        fontSize: Math.floor(H * 0.06) + 'px'
      }).setOrigin(0.5);
      this.titleElements.push(themeSample);
    }

    // 게임 설명
    const instructions = this.add.text(W * 0.5, H * 0.42,
      '같은 그림 카드를 찾아 매칭하세요!\n연속으로 맞추면 콤보 보너스!', {
      fontSize: Math.floor(H * 0.028) + 'px',
      color: COLORS.white,
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);
    this.titleElements.push(instructions);

    // 시작 버튼
    const startButtonBg = this.add.rectangle(W * 0.5, H * 0.88, 200, 60, 0x667eea);
    startButtonBg.setStrokeStyle(3, 0x764ba2);
    startButtonBg.setInteractive({ useHandCursor: true });
    this.titleElements.push(startButtonBg);

    const startButtonText = this.add.text(W * 0.5, H * 0.88, '🎮 게임 시작', {
      fontSize: Math.floor(H * 0.04) + 'px',
      color: COLORS.white,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.titleElements.push(startButtonText);

    // 버튼 호버 효과
    startButtonBg.on('pointerover', () => {
      startButtonBg.setFillStyle(0x764ba2);
      this.tweens.add({
        targets: [startButtonBg, startButtonText],
        scale: 1.05,
        duration: 100
      });
    });

    startButtonBg.on('pointerout', () => {
      startButtonBg.setFillStyle(0x667eea);
      this.tweens.add({
        targets: [startButtonBg, startButtonText],
        scale: 1,
        duration: 100
      });
    });

    startButtonBg.on('pointerdown', () => {
      this.startGame();
    });
  }

  private getThemeName(): string {
    const names: Record<ThemeKey, string> = {
      animals: '🐾 동물',
      food: '🍎 음식',
      sports: '⚽ 스포츠',
      nature: '🌸 자연',
      travel: '✈️ 여행'
    };
    return names[this.currentTheme] || '🎮 기본';
  }

  private createCards(W: number, H: number) {
    let cardValues: string[];

    if (this.useImageAssets && this.gameAssets.length >= this.TOTAL_PAIRS) {
      // 이미지 에셋 사용 - asset_0, asset_1, ... 형태의 키 생성
      const assetKeys = this.gameAssets.slice(0, this.TOTAL_PAIRS).map((_, i) => `asset_${i}`);
      cardValues = [...assetKeys, ...assetKeys];
    } else {
      // 이모지 테마 사용
      const themeEmojis = THEMES[this.currentTheme] || THEMES.animals;
      const selectedEmojis = themeEmojis.slice(0, this.TOTAL_PAIRS);
      cardValues = [...selectedEmojis, ...selectedEmojis];
    }

    // 카드 섞기
    this.shuffleArray(cardValues);

    // 4x4 그리드 설정
    const cols = 4;
    const rows = 4;
    const cardWidth = Math.min(W * 0.2, 80);
    const cardHeight = cardWidth * 1.3;
    const totalWidth = cols * cardWidth + (cols - 1) * (W * 0.03);
    const totalHeight = rows * cardHeight + (rows - 1) * (H * 0.02);
    const startX = (W - totalWidth) / 2 + cardWidth / 2;
    const startY = H * 0.52;
    const spacingX = cardWidth + W * 0.03;
    const spacingY = cardHeight + H * 0.02;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const value = cardValues[index] || '?';
        const isImageCard = this.useImageAssets && value.startsWith('asset_');

        const card = this.createSingleCard(x, y, cardWidth, cardHeight, value, index, isImageCard);
        this.cards.push(card);

        // 초기에는 숨김
        card.container.setAlpha(0);
        card.container.setScale(0.8);
      }
    }
  }

  private createSingleCard(x: number, y: number, width: number, height: number, value: string, index: number, isImageCard: boolean = false): Card {
    const H = this.sys.game.config.height as number;
    const container = this.add.container(x, y);

    // 카드 뒷면
    const back = this.add.rectangle(0, 0, width, height, 0x667eea);
    back.setStrokeStyle(3, 0x764ba2);

    // 뒷면 아이콘 (물음표)
    const backIcon = this.add.text(0, 0, '❓', {
      fontSize: Math.floor(height * 0.4) + 'px'
    }).setOrigin(0.5);

    // 카드 앞면 (숨김)
    const front = this.add.rectangle(0, 0, width, height, 0xffffff);
    front.setStrokeStyle(3, 0x10b981);
    front.setVisible(false);

    let frontText: Phaser.GameObjects.Text | undefined;
    let frontImage: Phaser.GameObjects.Image | undefined;

    if (isImageCard) {
      // 이미지 카드
      try {
        frontImage = this.add.image(0, 0, value);
        // 이미지를 카드 크기에 맞게 조절
        const scaleX = (width - 10) / frontImage.width;
        const scaleY = (height - 10) / frontImage.height;
        const scale = Math.min(scaleX, scaleY);
        frontImage.setScale(scale);
        frontImage.setVisible(false);
        container.add([back, backIcon, front, frontImage]);
      } catch (e) {
        // 이미지 로드 실패 시 폴백
        console.warn(`Failed to load image: ${value}`);
        frontText = this.add.text(0, 0, '🖼️', {
          fontSize: Math.floor(height * 0.5) + 'px'
        }).setOrigin(0.5).setVisible(false);
        container.add([back, backIcon, front, frontText]);
      }
    } else {
      // 이모지 카드
      frontText = this.add.text(0, 0, value, {
        fontSize: Math.floor(height * 0.5) + 'px'
      }).setOrigin(0.5).setVisible(false);
      container.add([back, backIcon, front, frontText]);
    }

    // 클릭 이벤트
    back.setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.flipCard(card));

    const card: Card = {
      container,
      back,
      backIcon,
      front,
      frontText,
      frontImage,
      value,
      isFlipped: false,
      isMatched: false,
      index,
      isImageCard
    };

    return card;
  }

  private startGame() {
    // 타이틀 요소 제거
    this.titleElements.forEach(elem => {
      this.tweens.add({
        targets: elem,
        alpha: 0,
        y: '-=30',
        duration: 300,
        onComplete: () => elem.destroy()
      });
    });
    this.titleElements = [];

    // 카드 표시 애니메이션
    this.time.delayedCall(300, () => {
      this.cards.forEach((card, i) => {
        this.time.delayedCall(i * 50, () => {
          this.tweens.add({
            targets: card.container,
            alpha: 1,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
          });
        });
      });

      // 모든 카드 표시 후 게임 시작
      this.time.delayedCall(this.cards.length * 50 + 200, () => {
        // 모든 카드를 잠깐 보여주기
        this.showAllCards();
      });
    });
  }

  private showAllCards() {
    // 모든 카드를 1.5초간 보여주기
    this.cards.forEach(card => {
      card.back.setVisible(false);
      card.backIcon.setVisible(false);
      card.front.setVisible(true);
      if (card.frontText) card.frontText.setVisible(true);
      if (card.frontImage) card.frontImage.setVisible(true);
    });

    this.time.delayedCall(1500, () => {
      // 카드 다시 뒤집기
      this.cards.forEach(card => {
        card.back.setVisible(true);
        card.backIcon.setVisible(true);
        card.front.setVisible(false);
        if (card.frontText) card.frontText.setVisible(false);
        if (card.frontImage) card.frontImage.setVisible(false);
      });

      // 게임 시작
      this.gameStarted = true;
      this.startTime = Date.now();

      // 타이머 시작
      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true
      });
    });
  }

  private updateTimer() {
    this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    this.timeText?.setText(`⏱️ ${this.elapsedTime}초`);
  }

  private flipCard(card: Card) {
    if (!this.gameStarted || !this.canFlip || card.isFlipped || card.isMatched) {
      return;
    }

    // 카드 뒤집기 애니메이션
    card.isFlipped = true;

    this.tweens.add({
      targets: card.container,
      scaleX: 0,
      duration: 100,
      onComplete: () => {
        card.back.setVisible(false);
        card.backIcon.setVisible(false);
        card.front.setVisible(true);
        if (card.frontText) card.frontText.setVisible(true);
        if (card.frontImage) card.frontImage.setVisible(true);

        this.tweens.add({
          targets: card.container,
          scaleX: 1,
          duration: 100
        });
      }
    });

    this.flippedCards.push(card);

    // 두 장의 카드가 뒤집혔을 때
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.movesText?.setText('🎯 ' + this.moves);
      this.canFlip = false;

      this.time.delayedCall(200, () => {
        this.checkMatch();
      });
    }
  }

  private checkMatch() {
    const [card1, card2] = this.flippedCards;
    if (!card1 || !card2) return;

    if (card1.value === card2.value) {
      // 매치 성공!
      this.matches++;
      this.consecutiveMatches++;
      this.maxCombo = Math.max(this.maxCombo, this.consecutiveMatches);
      this.matchesText?.setText('✅ ' + this.matches + '/' + this.TOTAL_PAIRS);

      card1.isMatched = true;
      card2.isMatched = true;

      // 콤보 표시
      if (this.consecutiveMatches >= 2) {
        this.showCombo();
      }

      // 매치 성공 효과
      this.tweens.add({
        targets: [card1.container, card2.container],
        scale: 1.1,
        duration: 150,
        yoyo: true,
        onComplete: () => {
          // 성공 색상으로 변경
          card1.front.setStrokeStyle(4, 0x10b981);
          card2.front.setStrokeStyle(4, 0x10b981);

          this.tweens.add({
            targets: [card1.container, card2.container],
            alpha: 0.6,
            duration: 300
          });
        }
      });

      this.flippedCards = [];
      this.canFlip = true;

      // 모든 카드 매치 완료
      if (this.matches === this.TOTAL_PAIRS) {
        this.timerEvent?.remove();
        this.time.delayedCall(600, () => {
          this.endGame();
        });
      }
    } else {
      // 매치 실패
      this.consecutiveMatches = 0;

      // 실패 효과 (흔들기)
      this.tweens.add({
        targets: [card1.container, card2.container],
        x: '+=5',
        duration: 50,
        yoyo: true,
        repeat: 3
      });

      this.time.delayedCall(800, () => {
        // 카드 다시 뒤집기
        [card1, card2].forEach(card => {
          this.tweens.add({
            targets: card.container,
            scaleX: 0,
            duration: 100,
            onComplete: () => {
              card.isFlipped = false;
              card.back.setVisible(true);
              card.backIcon.setVisible(true);
              card.front.setVisible(false);
              if (card.frontText) card.frontText.setVisible(false);
              if (card.frontImage) card.frontImage.setVisible(false);

              this.tweens.add({
                targets: card.container,
                scaleX: 1,
                duration: 100
              });
            }
          });
        });

        this.flippedCards = [];
        this.canFlip = true;
      });
    }
  }

  private showCombo() {
    const comboEmoji = this.consecutiveMatches >= 4 ? '🔥' : this.consecutiveMatches >= 3 ? '⚡' : '✨';
    this.comboText?.setText(`${comboEmoji} ${this.consecutiveMatches} 콤보!`);
    this.comboText?.setAlpha(1);

    this.tweens.add({
      targets: this.comboText,
      scale: { from: 0.5, to: 1.2 },
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.time.delayedCall(500, () => {
          this.tweens.add({
            targets: this.comboText,
            alpha: 0,
            duration: 300
          });
        });
      }
    });
  }

  private shuffleArray(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      const jVal = array[j];
      if (temp !== undefined && jVal !== undefined) {
        array[i] = jVal;
        array[j] = temp;
      }
    }
  }

  private async endGame() {
    const W = this.sys.game.config.width as number;
    const H = this.sys.game.config.height as number;

    // 점수 계산
    const baseScore = 1000;
    const movePenalty = Math.max(0, (this.moves - this.TOTAL_PAIRS) * 8);
    const timePenalty = this.elapsedTime * 3;
    const comboBonus = this.maxCombo * 50;
    const finalScore = Math.max(100, baseScore - movePenalty - timePenalty + comboBonus);

    // 성능 등급
    const grade = this.getGrade(finalScore);

    // 결과 오버레이
    const overlay = this.add.rectangle(W * 0.5, H * 0.5, W, H, 0x000000, 0.85);

    // 결과 타이틀
    this.add.text(W * 0.5, H * 0.2, '🎉 완료!', {
      fontSize: Math.floor(H * 0.08) + 'px',
      color: COLORS.success,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 등급 표시
    this.add.text(W * 0.5, H * 0.3, grade.emoji + ' ' + grade.text, {
      fontSize: Math.floor(H * 0.06) + 'px',
      color: grade.color
    }).setOrigin(0.5);

    // 통계
    const statsText = [
      `⏱️ 시간: ${this.elapsedTime}초`,
      `🎯 이동 수: ${this.moves}회`,
      `🔥 최대 콤보: ${this.maxCombo}회`,
      `⭐ 점수: ${finalScore}점`
    ].join('\n');

    this.add.text(W * 0.5, H * 0.45, statsText, {
      fontSize: Math.floor(H * 0.035) + 'px',
      color: COLORS.white,
      align: 'center',
      lineSpacing: 12
    }).setOrigin(0.5);

    // 이름 입력
    const namePrompt = this.add.text(W * 0.5, H * 0.6, '이름을 입력하세요:', {
      fontSize: Math.floor(H * 0.03) + 'px',
      color: COLORS.white
    }).setOrigin(0.5);

    // HTML 입력 요소
    const gameContainer = document.getElementById('game-container');
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = '플레이어 이름';
    inputElement.maxLength = 20;
    inputElement.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${H * 0.65}px;
      transform: translateX(-50%);
      width: 250px;
      padding: 12px;
      font-size: 16px;
      border: 2px solid ${COLORS.primary};
      border-radius: 10px;
      text-align: center;
      background: rgba(255,255,255,0.95);
    `;
    gameContainer?.appendChild(inputElement);
    inputElement.focus();

    const submitButton = document.createElement('button');
    submitButton.textContent = '🏆 점수 제출';
    submitButton.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${H * 0.73}px;
      transform: translateX(-50%);
      padding: 12px 30px;
      font-size: 16px;
      background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary});
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
    `;
    gameContainer?.appendChild(submitButton);

    const submitScore = async () => {
      const playerName = inputElement.value.trim() || '익명';

      submitButton.disabled = true;
      submitButton.textContent = '제출 중...';

      const qrCode = gameManager.getQrCode();
      const success = await submitGameScore({
        gameType: 'memory',
        playerName,
        score: finalScore,
        qrCode: qrCode
      });

      inputElement.remove();
      submitButton.remove();

      if (success) {
        namePrompt.setText('✅ 점수가 제출되었습니다!');
        namePrompt.setColor(COLORS.success);
      } else {
        namePrompt.setText('❌ 점수 제출 실패');
        namePrompt.setColor(COLORS.danger);
      }

      // 재시작 버튼
      this.time.delayedCall(1500, () => {
        const restartBg = this.add.rectangle(W * 0.5, H * 0.85, 180, 50, 0x667eea);
        restartBg.setStrokeStyle(2, 0x764ba2);
        restartBg.setInteractive({ useHandCursor: true });

        const restartText = this.add.text(W * 0.5, H * 0.85, '🔄 다시 시작', {
          fontSize: Math.floor(H * 0.035) + 'px',
          color: COLORS.white,
          fontStyle: 'bold'
        }).setOrigin(0.5);

        restartBg.on('pointerdown', () => {
          this.scene.restart();
        });

        restartBg.on('pointerover', () => {
          restartBg.setFillStyle(0x764ba2);
        });

        restartBg.on('pointerout', () => {
          restartBg.setFillStyle(0x667eea);
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

  private getGrade(score: number): { emoji: string; text: string; color: string } {
    if (score >= 900) return { emoji: '🏆', text: 'S 랭크', color: '#fbbf24' };
    if (score >= 750) return { emoji: '🥇', text: 'A 랭크', color: '#10b981' };
    if (score >= 600) return { emoji: '🥈', text: 'B 랭크', color: '#60a5fa' };
    if (score >= 450) return { emoji: '🥉', text: 'C 랭크', color: '#a78bfa' };
    return { emoji: '📝', text: 'D 랭크', color: '#9ca3af' };
  }
}
