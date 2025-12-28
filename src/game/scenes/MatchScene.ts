/**
 * Match Game Scene - 같은 그림 찾기
 * 메모리 카드 매치 게임 - 같은 그림을 찾는 카드 게임
 * 개선된 UI/UX와 다양한 테마 지원
 * Admin 등록 에셋 이미지 또는 기본 이모지 테마 사용
 */

import * as Phaser from 'phaser';
import { submitGameScore } from '../../services/gameScoreService';
import { gameManager } from '../GameManager';
import { getMatchGameAssets, type GameAsset } from '../../services/gameAssetService';

interface Card {
  container: Phaser.GameObjects.Container;
  back: Phaser.GameObjects.Rectangle;
  backIcon: Phaser.GameObjects.Text;
  starPattern: Phaser.GameObjects.Text;
  backLogo?: Phaser.GameObjects.Image;
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
  private storeName?: string;
  private logoUrl?: string;
  private hasLogo: boolean = false;

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
    // preload에서는 아무것도 하지 않음
    // 에셋 로딩은 create에서 비동기로 처리
  }

  create() {
    const W = this.sys.game.config.width as number;
    const H = this.sys.game.config.height as number;

    // 그라데이션 배경
    this.createBackground(W, H);

    // UI 패널
    this.createUIPanel(W, H);

    // 로딩 화면 표시
    this.loadingText = this.add.text(W * 0.5, H * 0.5, '🔄 이미지 로딩 중...', {
      fontSize: Math.floor(H * 0.04) + 'px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 에셋 로딩 후 게임 초기화
    this.loadGameAssetsAndInit(W, H);
  }

  private async loadGameAssetsAndInit(W: number, H: number) {
    try {
      console.log('[MatchScene] Fetching game assets...');
      const qrCode = gameManager.getQrCode();
      console.log('[MatchScene] QR Code:', qrCode);
      const result = await getMatchGameAssets(this.TOTAL_PAIRS, qrCode);
      this.gameAssets = result.assets;
      this.storeName = result.storeName;
      this.logoUrl = result.logoUrl;
      console.log('[MatchScene] Store name:', this.storeName, 'Logo:', this.logoUrl);

      // 로고 이미지 로드 (있으면)
      if (this.logoUrl) {
        this.load.image('store_logo', this.logoUrl);
      }

      if (this.gameAssets.length >= this.TOTAL_PAIRS) {
        console.log(`[MatchScene] Found ${this.gameAssets.length} assets, loading images...`);
        this.useImageAssets = true;

        // 이미지 로드
        let loadedCount = 0;
        this.gameAssets.forEach((asset, index) => {
          if (asset.imageUrl) {
            const key = `asset_${index}`;
            console.log(`[MatchScene] Loading image: ${key}`);
            this.load.image(key, asset.imageUrl);
            loadedCount++;
          }
        });

        if (loadedCount === 0) {
          console.log('[MatchScene] No valid image URLs, using emoji theme');
          this.useImageAssets = false;
          this.assetsLoaded = true;
          this.finishInit(W, H);
          return;
        }

        // 로드 에러 처리
        this.load.on('loaderror', (file: Phaser.Loader.File) => {
          const url = typeof file.url === 'string' ? file.url.substring(0, 100) : 'unknown';
          console.error('[MatchScene] Failed to load image:', file.key, url);
        });

        // 로드 완료 이벤트
        this.load.once('complete', () => {
          // 실제로 로드된 텍스처 확인
          const loadedTextures = this.gameAssets.filter((_, i) =>
            this.textures.exists(`asset_${i}`)
          ).length;
          console.log(`[MatchScene] Loaded textures: ${loadedTextures}/${this.TOTAL_PAIRS}`);

          if (loadedTextures < this.TOTAL_PAIRS) {
            console.log('[MatchScene] Not enough textures loaded, using emoji theme');
            this.useImageAssets = false;
          }

          // 로고 로드 확인
          this.hasLogo = this.textures.exists('store_logo');
          console.log(`[MatchScene] Logo loaded: ${this.hasLogo}`);

          this.assetsLoaded = true;
          this.finishInit(W, H);
        });

        this.load.start();
      } else {
        console.log('[MatchScene] Not enough assets, using emoji theme');
        this.useImageAssets = false;

        // 에셋이 부족해도 로고는 로드 시도
        if (this.logoUrl) {
          this.load.once('complete', () => {
            this.hasLogo = this.textures.exists('store_logo');
            console.log(`[MatchScene] Logo loaded (fallback): ${this.hasLogo}`);
            this.assetsLoaded = true;
            this.finishInit(W, H);
          });
          this.load.start();
        } else {
          this.assetsLoaded = true;
          this.finishInit(W, H);
        }
      }
    } catch (error) {
      console.error('[MatchScene] Failed to load game assets:', error);
      this.useImageAssets = false;
      this.assetsLoaded = true;
      this.finishInit(W, H);
    }
  }

  private finishInit(W: number, H: number) {
    // 로딩 텍스트 제거
    if (this.loadingText) {
      this.loadingText.destroy();
      this.loadingText = undefined;
    }

    // 타이틀 화면
    this.createTitleScreen(W, H);

    // 카드 생성 (숨김 상태)
    this.createCards(W, H);

    console.log('[MatchScene] Game initialized with useImageAssets:', this.useImageAssets);
  }

  private createBackground(W: number, H: number) {
    // 우주 배경 - 깊은 우주 색상
    const bg = this.add.rectangle(W * 0.5, H * 0.5, W, H, 0x0a0a1a);

    // 성운 효과 - 큰 발광 원들
    this.add.circle(W * 0.15, H * 0.2, 120, 0x4c1d95, 0.15); // 보라색 성운
    this.add.circle(W * 0.85, H * 0.15, 100, 0x1e3a8a, 0.12); // 파란 성운
    this.add.circle(W * 0.9, H * 0.75, 140, 0x7c3aed, 0.1); // 보라색 성운
    this.add.circle(W * 0.1, H * 0.85, 90, 0x0ea5e9, 0.08); // 청록색 성운

    // 별 생성 - 여러 크기와 밝기
    const starCount = 60;
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const size = Math.random() * 2.5 + 0.5;
      const alpha = Math.random() * 0.6 + 0.3;

      // 별 색상 (흰색, 연한 파랑, 연한 노랑)
      const colors = [0xffffff, 0xe0f2fe, 0xfef3c7, 0xddd6fe];
      const color = colors[Math.floor(Math.random() * colors.length)] || 0xffffff;

      const star = this.add.circle(x, y, size, color, alpha);

      // 일부 별에 깜빡임 애니메이션
      if (Math.random() > 0.6) {
        this.tweens.add({
          targets: star,
          alpha: alpha * 0.3,
          duration: 1000 + Math.random() * 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    // 큰 밝은 별 몇 개
    const brightStars = [
      { x: W * 0.2, y: H * 0.1 },
      { x: W * 0.7, y: H * 0.05 },
      { x: W * 0.95, y: H * 0.4 },
      { x: W * 0.05, y: H * 0.6 }
    ];

    brightStars.forEach(pos => {
      // 별 광채
      this.add.circle(pos.x, pos.y, 8, 0xffffff, 0.1);
      this.add.circle(pos.x, pos.y, 4, 0xffffff, 0.3);
      const brightStar = this.add.circle(pos.x, pos.y, 2, 0xffffff, 0.9);

      // 밝은 별 깜빡임
      this.tweens.add({
        targets: brightStar,
        alpha: 0.5,
        scale: 0.7,
        duration: 1500 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private createUIPanel(W: number, H: number) {
    // 상단 UI 패널 - 우주 테마
    const panelBg = this.add.rectangle(W * 0.5, H * 0.05, W * 0.98, H * 0.08, 0x0f172a, 0.95);
    panelBg.setStrokeStyle(2, 0x7c3aed, 0.6);

    // 이동 수
    this.movesText = this.add.text(W * 0.05, H * 0.05, '🚀 0', {
      fontSize: Math.floor(H * 0.032) + 'px',
      color: '#e0f2fe',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // 매치 수
    this.matchesText = this.add.text(W * 0.35, H * 0.05, '⭐ 0/' + this.TOTAL_PAIRS, {
      fontSize: Math.floor(H * 0.032) + 'px',
      color: '#fef3c7',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // 시간
    this.timeText = this.add.text(W * 0.68, H * 0.05, '🕐 0초', {
      fontSize: Math.floor(H * 0.032) + 'px',
      color: '#ddd6fe',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // 콤보 텍스트 (숨김 상태로 시작)
    this.comboText = this.add.text(W * 0.5, H * 0.11, '', {
      fontSize: Math.floor(H * 0.045) + 'px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);
  }

  private createTitleScreen(W: number, H: number) {
    // 타이틀 - 매장명이 있으면 매장명, 없으면 기본
    const titleText = this.storeName || '카드 매치';
    const title = this.add.text(W * 0.5, H * 0.25, titleText, {
      fontSize: Math.floor(H * 0.06) + 'px',
      color: '#c4b5fd',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.titleElements.push(title);

    // 부제목 - 같은 그림 찾기
    const subtitle = this.add.text(W * 0.5, H * 0.32, '같은 그림 찾기', {
      fontSize: Math.floor(H * 0.035) + 'px',
      color: '#a5b4fc'
    }).setOrigin(0.5);
    this.titleElements.push(subtitle);

    // 시작 버튼
    const startButtonBg = this.add.rectangle(W * 0.5, H * 0.88, 220, 65, 0x7c3aed);
    startButtonBg.setStrokeStyle(3, 0xa78bfa);
    startButtonBg.setInteractive({ useHandCursor: true });
    this.titleElements.push(startButtonBg);

    const startButtonText = this.add.text(W * 0.5, H * 0.88, '게임 시작', {
      fontSize: Math.floor(H * 0.04) + 'px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.titleElements.push(startButtonText);

    // 버튼 호버 효과
    startButtonBg.on('pointerover', () => {
      startButtonBg.setFillStyle(0x8b5cf6);
      this.tweens.add({
        targets: [startButtonBg, startButtonText],
        scale: 1.08,
        duration: 100
      });
    });

    startButtonBg.on('pointerout', () => {
      startButtonBg.setFillStyle(0x7c3aed);
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

    // 4x4 그리드 설정 - 전체화면에 맞게 크기 조정
    const cols = 4;
    const rows = 4;

    // UI 영역(상단 패널) 고려한 게임 영역 계산 - 여백 최소화
    const gameAreaTop = H * 0.10; // UI 패널 아래
    const gameAreaBottom = H; // 하단 여백 없음
    const gameAreaHeight = gameAreaBottom - gameAreaTop;
    const gameAreaWidth = W; // 좌우 여백 없음

    // 카드 간격 (최소화)
    const gapX = W * 0.015; // 가로 간격
    const gapY = H * 0.01; // 세로 간격

    // 카드 크기 계산 - 화면에 꽉 차게
    const cardWidth = (gameAreaWidth - gapX * (cols + 1)) / cols;
    const cardHeight = (gameAreaHeight - gapY * (rows + 1)) / rows;

    // 시작 위치
    const startX = gapX + cardWidth / 2;
    const startY = gameAreaTop + gapY + cardHeight / 2;

    // 간격 계산
    const spacingX = cardWidth + gapX;
    const spacingY = cardHeight + gapY;

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
    const container = this.add.container(x, y);

    // 카드 뒷면 - 우주 테마 색상
    const back = this.add.rectangle(0, 0, width, height, 0x1e1b4b);
    back.setStrokeStyle(3, 0x7c3aed);

    // 뒷면 장식 - 별 패턴 (로고가 없을 때만 표시)
    const starPattern = this.add.text(0, -height * 0.15, '✨', {
      fontSize: Math.floor(height * 0.2) + 'px'
    }).setOrigin(0.5);
    starPattern.setVisible(!this.hasLogo);

    // 뒷면 아이콘 (로고가 없을 때만 표시)
    const backIcon = this.add.text(0, height * 0.1, '🌟', {
      fontSize: Math.floor(height * 0.35) + 'px'
    }).setOrigin(0.5);
    backIcon.setVisible(!this.hasLogo);

    // 뒷면 로고 이미지 (로고가 있을 때만 표시)
    let backLogo: Phaser.GameObjects.Image | undefined;
    if (this.hasLogo) {
      backLogo = this.add.image(0, 0, 'store_logo');
      // 로고를 카드 크기에 맞게 조절 (contain 방식)
      const logoScaleX = (width * 0.7) / backLogo.width;
      const logoScaleY = (height * 0.7) / backLogo.height;
      const logoScale = Math.min(logoScaleX, logoScaleY);
      backLogo.setScale(logoScale);
      backLogo.setOrigin(0.5, 0.5);
    }

    // 카드 앞면 (숨김) - 어두운 배경으로 이미지 강조
    const front = this.add.rectangle(0, 0, width, height, 0x0f172a);
    front.setStrokeStyle(3, 0x22d3ee);
    front.setVisible(false);

    let frontText: Phaser.GameObjects.Text | undefined;
    let frontImage: Phaser.GameObjects.Image | undefined;

    // 컨테이너에 뒷면 요소 추가 (로고가 있으면 로고도 추가)
    const backElements: Phaser.GameObjects.GameObject[] = [back, starPattern, backIcon];
    if (backLogo) {
      backElements.push(backLogo);
    }

    if (isImageCard && this.textures.exists(value)) {
      // 이미지 카드 - 카드에 꽉 차게 표시
      frontImage = this.add.image(0, 0, value);

      // 이미지를 카드 크기에 맞게 조절 (contain 방식 - 카드 안에 맞춤)
      const scaleX = (width * 0.9) / frontImage.width;
      const scaleY = (height * 0.9) / frontImage.height;
      const scale = Math.min(scaleX, scaleY);
      frontImage.setScale(scale);
      frontImage.setOrigin(0.5, 0.5);

      frontImage.setVisible(false);
      container.add([...backElements, front, frontImage]);
    } else if (isImageCard) {
      // 텍스처가 없는 경우 폴백 이모지
      console.warn(`[MatchScene] Texture not found: ${value}, using fallback emoji`);
      const themeEmojis = THEMES[this.currentTheme] || THEMES.animals;
      const emojiIndex = index % themeEmojis.length;
      const fallbackEmoji = themeEmojis[emojiIndex] || '🖼️';
      frontText = this.add.text(0, 0, fallbackEmoji, {
        fontSize: Math.floor(height * 0.55) + 'px'
      }).setOrigin(0.5).setVisible(false);
      container.add([...backElements, front, frontText]);
    } else {
      // 이모지 카드 - 크게 표시
      frontText = this.add.text(0, 0, value, {
        fontSize: Math.floor(height * 0.55) + 'px'
      }).setOrigin(0.5).setVisible(false);
      container.add([...backElements, front, frontText]);
    }

    // 클릭 이벤트
    back.setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.flipCard(card));

    const card: Card = {
      container,
      back,
      backIcon,
      starPattern,
      backLogo,
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
      card.starPattern.setVisible(false);
      if (card.backLogo) card.backLogo.setVisible(false);
      card.front.setVisible(true);
      if (card.frontText) card.frontText.setVisible(true);
      if (card.frontImage) card.frontImage.setVisible(true);
    });

    this.time.delayedCall(1500, () => {
      // 카드 다시 뒤집기
      this.cards.forEach(card => {
        card.back.setVisible(true);
        card.backIcon.setVisible(!this.hasLogo);
        card.starPattern.setVisible(!this.hasLogo);
        if (card.backLogo) card.backLogo.setVisible(true);
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
    this.timeText?.setText(`🕐 ${this.elapsedTime}초`);
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
        card.starPattern.setVisible(false);
        if (card.backLogo) card.backLogo.setVisible(false);
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
      this.movesText?.setText('🚀 ' + this.moves);
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
      this.matchesText?.setText('⭐ ' + this.matches + '/' + this.TOTAL_PAIRS);

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
              card.backIcon.setVisible(!this.hasLogo);
              card.starPattern.setVisible(!this.hasLogo);
              if (card.backLogo) card.backLogo.setVisible(true);
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

    // 결과 오버레이 - 우주 테마
    this.add.rectangle(W * 0.5, H * 0.5, W, H, 0x0a0a1a, 0.95);

    // 결과 타이틀 - 우주 테마
    this.add.text(W * 0.5, H * 0.18, '🌟 미션 완료! 🌟', {
      fontSize: Math.floor(H * 0.065) + 'px',
      color: '#34d399',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 등급 표시
    this.add.text(W * 0.5, H * 0.28, grade.emoji + ' ' + grade.text, {
      fontSize: Math.floor(H * 0.055) + 'px',
      color: grade.color
    }).setOrigin(0.5);

    // 통계 - 우주 테마 아이콘
    const statsText = [
      `🕐 시간: ${this.elapsedTime}초`,
      `🚀 이동 수: ${this.moves}회`,
      `⚡ 최대 콤보: ${this.maxCombo}회`,
      `🌟 점수: ${finalScore}점`
    ].join('\n');

    this.add.text(W * 0.5, H * 0.43, statsText, {
      fontSize: Math.floor(H * 0.032) + 'px',
      color: '#e0f2fe',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    // 이름 입력
    const namePrompt = this.add.text(W * 0.5, H * 0.58, '🧑‍🚀 우주 비행사 이름:', {
      fontSize: Math.floor(H * 0.028) + 'px',
      color: '#a5b4fc'
    }).setOrigin(0.5);

    // HTML 입력 요소 - 우주 테마
    const gameContainer = document.getElementById('game-container');
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = '플레이어 이름';
    inputElement.maxLength = 20;
    inputElement.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${H * 0.63}px;
      transform: translateX(-50%);
      width: 250px;
      padding: 12px;
      font-size: 16px;
      border: 2px solid #7c3aed;
      border-radius: 10px;
      text-align: center;
      background: rgba(15, 23, 42, 0.95);
      color: #e0f2fe;
    `;
    gameContainer?.appendChild(inputElement);
    inputElement.focus();

    const submitButton = document.createElement('button');
    submitButton.textContent = '🚀 점수 제출';
    submitButton.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${H * 0.71}px;
      transform: translateX(-50%);
      padding: 12px 30px;
      font-size: 16px;
      background: linear-gradient(135deg, #7c3aed, #a78bfa);
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
      submitButton.textContent = '전송 중...';

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
        namePrompt.setColor('#34d399');
      } else {
        namePrompt.setText('❌ 점수 제출 실패');
        namePrompt.setColor('#f87171');
      }

      // 재시작 버튼 - 우주 테마
      this.time.delayedCall(1500, () => {
        const restartBg = this.add.rectangle(W * 0.5, H * 0.85, 200, 55, 0x7c3aed);
        restartBg.setStrokeStyle(2, 0xa78bfa);
        restartBg.setInteractive({ useHandCursor: true });

        this.add.text(W * 0.5, H * 0.85, '🔄 다시 도전', {
          fontSize: Math.floor(H * 0.035) + 'px',
          color: '#ffffff',
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
    // 우주 테마 등급
    if (score >= 900) return { emoji: '🌟', text: '전설의 탐험가', color: '#fbbf24' };
    if (score >= 750) return { emoji: '🚀', text: '우주 비행사', color: '#34d399' };
    if (score >= 600) return { emoji: '🛸', text: '스타 파일럿', color: '#60a5fa' };
    if (score >= 450) return { emoji: '🌙', text: '우주 여행자', color: '#a78bfa' };
    return { emoji: '✨', text: '별 수집가', color: '#9ca3af' };
  }
}
