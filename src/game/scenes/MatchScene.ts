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
    // 심플한 파스텔 그라데이션 배경
    this.add.rectangle(W * 0.5, H * 0.25, W, H * 0.5, 0xfff5f5);
    this.add.rectangle(W * 0.5, H * 0.75, W, H * 0.5, 0xfdf2f8);

    // 부드러운 중간 레이어
    this.add.rectangle(W * 0.5, H * 0.5, W, H * 0.3, 0xfff1f2, 0.5);

    // 미니멀한 장식 - 작은 원 몇 개만
    const decorColors = [0xfecdd3, 0xfda4af, 0xfb7185];
    const positions = [
      { x: W * 0.1, y: H * 0.15 },
      { x: W * 0.9, y: H * 0.2 },
      { x: W * 0.15, y: H * 0.85 },
      { x: W * 0.85, y: H * 0.9 }
    ];

    positions.forEach((pos, i) => {
      const color = decorColors[i % decorColors.length] || 0xfecdd3;
      const circle = this.add.circle(pos.x, pos.y, 20 + i * 5, color, 0.15);

      this.tweens.add({
        targets: circle,
        alpha: 0.08,
        scale: 1.1,
        duration: 3000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private createUIPanel(W: number, H: number) {
    // 상단 UI 패널 - 글래스모피즘 효과
    const panelHeight = H * 0.07;
    const panelY = H * 0.045;

    // 글래스 배경 (다중 레이어)
    const panelShadow = this.add.rectangle(W * 0.5, panelY + 2, W * 0.94, panelHeight, 0x000000, 0.05);
    panelShadow.setStrokeStyle(0);
    (panelShadow as any).setRoundedRectRadius?.(16) || null;

    const panelBg = this.add.rectangle(W * 0.5, panelY, W * 0.94, panelHeight, 0xffffff, 0.85);
    panelBg.setStrokeStyle(1.5, 0xfecdd3, 0.8);

    // 상단 하이라이트 (글래스 반사 효과)
    this.add.rectangle(W * 0.5, panelY - panelHeight * 0.2, W * 0.9, panelHeight * 0.3, 0xffffff, 0.4);

    // 각 스탯을 개별 글래스 박스에 담기
    const statWidth = W * 0.28;
    const statHeight = panelHeight * 0.7;
    const statY = panelY;

    // 이동 수 박스
    const moveBox = this.add.rectangle(W * 0.17, statY, statWidth, statHeight, 0xfff1f2, 0.6);
    moveBox.setStrokeStyle(1, 0xfda4af, 0.5);

    this.movesText = this.add.text(W * 0.17, statY, '🎯 0', {
      fontSize: Math.floor(H * 0.028) + 'px',
      color: '#e11d48',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    // 매치 수 박스
    const matchBox = this.add.rectangle(W * 0.5, statY, statWidth, statHeight, 0xfdf2f8, 0.6);
    matchBox.setStrokeStyle(1, 0xf9a8d4, 0.5);

    this.matchesText = this.add.text(W * 0.5, statY, '💖 0/' + this.TOTAL_PAIRS, {
      fontSize: Math.floor(H * 0.028) + 'px',
      color: '#db2777',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    // 시간 박스
    const timeBox = this.add.rectangle(W * 0.83, statY, statWidth, statHeight, 0xf5f3ff, 0.6);
    timeBox.setStrokeStyle(1, 0xc4b5fd, 0.5);

    this.timeText = this.add.text(W * 0.83, statY, '⏱️ 0초', {
      fontSize: Math.floor(H * 0.028) + 'px',
      color: '#7c3aed',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    // 콤보 텍스트 (숨김 상태로 시작)
    this.comboText = this.add.text(W * 0.5, H * 0.10, '', {
      fontSize: Math.floor(H * 0.04) + 'px',
      color: '#f43f5e',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5).setAlpha(0);
  }

  private createTitleScreen(W: number, H: number) {
    // ==================== 떠다니는 장식 아이콘 ====================
    const floatingIcons = [
      { emoji: '🍬', x: W * 0.12, y: H * 0.08, size: 0.045, duration: 2500 },
      { emoji: '🍭', x: W * 0.88, y: H * 0.15, size: 0.05, duration: 3000 },
      { emoji: '🧁', x: W * 0.1, y: H * 0.65, size: 0.04, duration: 4000 }
    ];

    floatingIcons.forEach((icon, i) => {
      const floatIcon = this.add.text(icon.x, icon.y, icon.emoji, {
        fontSize: Math.floor(H * icon.size) + 'px'
      }).setOrigin(0.5);
      this.titleElements.push(floatIcon);

      // 바운스 애니메이션
      this.tweens.add({
        targets: floatIcon,
        y: icon.y - 15,
        duration: icon.duration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 300
      });
    });

    // ==================== 로고 영역 + 데코레이션 카드 ====================
    let contentY = H * 0.35;
    const logoY = H * 0.22;

    if (this.hasLogo) {
      const logoRadius = W * 0.22;

      // 뒤에 숨어있는 카드 장식 (Match 느낌 강조)
      // 왼쪽 카드
      const leftCard = this.add.rectangle(W * 0.5 - logoRadius * 0.7, logoY + 8, W * 0.22, W * 0.22, 0xffffff);
      leftCard.setStrokeStyle(1, 0xfecdd3);
      leftCard.setAngle(-12);
      this.titleElements.push(leftCard);

      const leftCardIcon = this.add.text(W * 0.5 - logoRadius * 0.7, logoY + 8, '🍰', {
        fontSize: Math.floor(H * 0.035) + 'px'
      }).setOrigin(0.5).setAlpha(0.5).setAngle(-12);
      this.titleElements.push(leftCardIcon);

      // 오른쪽 카드
      const rightCard = this.add.rectangle(W * 0.5 + logoRadius * 0.7, logoY + 8, W * 0.22, W * 0.22, 0xffffff);
      rightCard.setStrokeStyle(1, 0xfecdd3);
      rightCard.setAngle(12);
      this.titleElements.push(rightCard);

      const rightCardIcon = this.add.text(W * 0.5 + logoRadius * 0.7, logoY + 8, '🍩', {
        fontSize: Math.floor(H * 0.035) + 'px'
      }).setOrigin(0.5).setAlpha(0.5).setAngle(12);
      this.titleElements.push(rightCardIcon);

      // 로고 배경 - 그라데이션 입체감 (다중 원 레이어)
      // 외곽 그림자
      const shadowOuter = this.add.circle(W * 0.5, logoY + 4, logoRadius + 8, 0x000000, 0.08);
      this.titleElements.push(shadowOuter);

      // 외곽 링 (테두리 효과)
      const outerRing = this.add.circle(W * 0.5, logoY, logoRadius + 6, 0xfecdd3, 0.6);
      this.titleElements.push(outerRing);

      // 메인 배경 원
      const bgCircle = this.add.circle(W * 0.5, logoY, logoRadius, 0xffffff, 0.95);
      this.titleElements.push(bgCircle);

      // 상단 하이라이트 (빛 반사 효과)
      const highlightTop = this.add.ellipse(W * 0.5, logoY - logoRadius * 0.35, logoRadius * 1.2, logoRadius * 0.5, 0xffffff, 0.5);
      this.titleElements.push(highlightTop);

      // 내부 그라데이션 효과 (부드러운 음영)
      const innerGlow = this.add.circle(W * 0.5, logoY + logoRadius * 0.1, logoRadius * 0.85, 0xfff1f2, 0.3);
      this.titleElements.push(innerGlow);

      // 반짝임 효과
      const sparkle = this.add.text(W * 0.5 + logoRadius * 0.6, logoY - logoRadius * 0.5, '✨', {
        fontSize: Math.floor(H * 0.03) + 'px'
      }).setOrigin(0.5);
      this.titleElements.push(sparkle);

      // 반짝임 애니메이션
      this.tweens.add({
        targets: sparkle,
        alpha: 0.3,
        scale: 1.2,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // 로고 이미지
      const logo = this.add.image(W * 0.5, logoY, 'store_logo');
      const logoMaxWidth = W * 0.35;
      const logoMaxHeight = H * 0.14;
      const logoScaleX = logoMaxWidth / logo.width;
      const logoScaleY = logoMaxHeight / logo.height;
      const logoScale = Math.min(logoScaleX, logoScaleY);
      logo.setScale(logoScale);
      logo.setOrigin(0.5, 0.5);
      this.titleElements.push(logo);

      contentY = H * 0.42;
    }

    // ==================== 타이틀 섹션 ====================
    const titleText = this.storeName || '카드 매치';
    const title = this.add.text(W * 0.5, contentY, titleText, {
      fontSize: Math.floor(H * 0.05) + 'px',
      color: '#1f2937',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.titleElements.push(title);

    // 부제목 (구분선 포함)
    const subtitleY = contentY + H * 0.055;

    // 왼쪽 구분선
    const leftLine = this.add.rectangle(W * 0.2, subtitleY, W * 0.12, 2, 0xd1d5db, 0.5);
    this.titleElements.push(leftLine);

    const subtitle = this.add.text(W * 0.5, subtitleY, '같은 그림 찾기', {
      fontSize: Math.floor(H * 0.024) + 'px',
      color: '#6b7280',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    this.titleElements.push(subtitle);

    // 오른쪽 구분선
    const rightLine = this.add.rectangle(W * 0.8, subtitleY, W * 0.12, 2, 0xd1d5db, 0.5);
    this.titleElements.push(rightLine);

    // ==================== 글래스모피즘 버튼 ====================
    const buttonWidth = W * 0.75;
    const buttonHeight = 56;
    const buttonY = H * 0.72;

    // 버튼 그림자
    const btnShadow = this.add.rectangle(W * 0.5, buttonY + 4, buttonWidth, buttonHeight, 0x000000, 0.15);
    this.titleElements.push(btnShadow);

    // 버튼 배경
    const btnBase = this.add.rectangle(W * 0.5, buttonY, buttonWidth, buttonHeight, 0xf43f5e);
    btnBase.setInteractive({ useHandCursor: true });
    this.titleElements.push(btnBase);

    // 버튼 상단 하이라이트 (글래스 효과)
    const btnHighlight = this.add.rectangle(W * 0.5, buttonY - buttonHeight * 0.18, buttonWidth * 0.92, buttonHeight * 0.35, 0xffffff, 0.25);
    this.titleElements.push(btnHighlight);

    // 시머 효과 (버튼 위로 지나가는 빛)
    const shimmer = this.add.rectangle(W * 0.5 - buttonWidth * 0.6, buttonY, buttonWidth * 0.3, buttonHeight, 0xffffff, 0.2);
    this.titleElements.push(shimmer);

    // 시머 애니메이션
    this.tweens.add({
      targets: shimmer,
      x: W * 0.5 + buttonWidth * 0.6,
      duration: 2000,
      repeat: -1,
      repeatDelay: 1500,
      ease: 'Sine.easeInOut'
    });

    // 버튼 텍스트
    const startButtonText = this.add.text(W * 0.5, buttonY, '🎮 게임 시작', {
      fontSize: Math.floor(H * 0.034) + 'px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.titleElements.push(startButtonText);

    // 버튼 호버 효과
    btnBase.on('pointerover', () => {
      btnBase.setFillStyle(0xfb7185);
      btnHighlight.setAlpha(0.35);
    });

    btnBase.on('pointerout', () => {
      btnBase.setFillStyle(0xf43f5e);
      btnHighlight.setAlpha(0.25);
    });

    btnBase.on('pointerdown', () => {
      this.tweens.add({
        targets: [btnBase, btnHighlight, startButtonText, btnShadow, shimmer],
        scale: 0.96,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.startGame();
        }
      });
    });

    // ==================== 하단 힌트 텍스트 ====================
    const hintText = this.add.text(W * 0.5, H * 0.82, '최고 기록에 도전하세요!', {
      fontSize: Math.floor(H * 0.02) + 'px',
      color: '#9ca3af',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    this.titleElements.push(hintText);

    // 힌트 펄스 애니메이션
    this.tweens.add({
      targets: hintText,
      alpha: 0.5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
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

    // 카드 뒷면 - Sweet Match 흰색/파스텔 테마
    const back = this.add.rectangle(0, 0, width, height, 0xffffff);
    back.setStrokeStyle(2, 0xfda4af);

    // 뒷면 장식 - 로즈 패턴 (로고가 없을 때만 표시)
    const starPattern = this.add.text(0, -height * 0.15, '💖', {
      fontSize: Math.floor(height * 0.18) + 'px'
    }).setOrigin(0.5);
    starPattern.setVisible(!this.hasLogo);

    // 뒷면 아이콘 (로고가 없을 때만 표시)
    const backIcon = this.add.text(0, height * 0.1, '🎀', {
      fontSize: Math.floor(height * 0.3) + 'px'
    }).setOrigin(0.5);
    backIcon.setVisible(!this.hasLogo);

    // 뒷면 로고 이미지 (로고가 있을 때만 표시)
    let backLogo: Phaser.GameObjects.Image | undefined;
    if (this.hasLogo) {
      backLogo = this.add.image(0, 0, 'store_logo');
      const logoScaleX = (width * 0.7) / backLogo.width;
      const logoScaleY = (height * 0.7) / backLogo.height;
      const logoScale = Math.min(logoScaleX, logoScaleY);
      backLogo.setScale(logoScale);
      backLogo.setOrigin(0.5, 0.5);
    }

    // 카드 앞면 (숨김) - 밝은 파스텔 배경
    const front = this.add.rectangle(0, 0, width, height, 0xfff1eb);
    front.setStrokeStyle(2, 0xf472b6);
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
          // 성공 색상으로 변경 - Sweet Match 테마
          card1.front.setStrokeStyle(3, 0x34d399);
          card2.front.setStrokeStyle(3, 0x34d399);

          this.tweens.add({
            targets: [card1.container, card2.container],
            alpha: 0.7,
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
    const comboEmoji = this.consecutiveMatches >= 4 ? '🎉' : this.consecutiveMatches >= 3 ? '💖' : '✨';
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

    // 결과 오버레이 - Sweet Match 파스텔 테마
    this.add.rectangle(W * 0.5, H * 0.5, W, H, 0xfff1eb, 0.97);

    // 결과 타이틀
    this.add.text(W * 0.5, H * 0.18, '🎉 축하해요! 🎉', {
      fontSize: Math.floor(H * 0.06) + 'px',
      color: '#f43f5e',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    // 등급 표시
    this.add.text(W * 0.5, H * 0.28, grade.emoji + ' ' + grade.text, {
      fontSize: Math.floor(H * 0.05) + 'px',
      color: grade.color,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    // 통계 - Sweet Match 테마 아이콘
    const statsText = [
      `⏱️ 시간: ${this.elapsedTime}초`,
      `🍰 이동 수: ${this.moves}회`,
      `⚡ 최대 콤보: ${this.maxCombo}회`,
      `💖 점수: ${finalScore}점`
    ].join('\n');

    this.add.text(W * 0.5, H * 0.43, statsText, {
      fontSize: Math.floor(H * 0.03) + 'px',
      color: '#374151',
      align: 'center',
      lineSpacing: 10,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    // 이름 입력
    const namePrompt = this.add.text(W * 0.5, H * 0.58, '🎀 닉네임을 입력하세요:', {
      fontSize: Math.floor(H * 0.026) + 'px',
      color: '#6b7280',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    // HTML 입력 요소 - Sweet Match 테마
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
      border: 2px solid #fda4af;
      border-radius: 12px;
      text-align: center;
      background: rgba(255, 255, 255, 0.95);
      color: #374151;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    gameContainer?.appendChild(inputElement);
    inputElement.focus();

    const submitButton = document.createElement('button');
    submitButton.textContent = '💖 점수 제출';
    submitButton.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${H * 0.71}px;
      transform: translateX(-50%);
      padding: 12px 30px;
      font-size: 16px;
      background: linear-gradient(135deg, #f43f5e, #fb7185);
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: bold;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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

      // 재시작 버튼 - Sweet Match 테마
      this.time.delayedCall(1500, () => {
        const restartBg = this.add.rectangle(W * 0.5, H * 0.85, 200, 55, 0xf43f5e);
        restartBg.setStrokeStyle(0);
        restartBg.setInteractive({ useHandCursor: true });

        this.add.text(W * 0.5, H * 0.85, '🔄 다시 도전', {
          fontSize: Math.floor(H * 0.032) + 'px',
          color: '#ffffff',
          fontStyle: 'bold',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }).setOrigin(0.5);

        restartBg.on('pointerdown', () => {
          this.scene.restart();
        });

        restartBg.on('pointerover', () => {
          restartBg.setFillStyle(0xfb7185);
        });

        restartBg.on('pointerout', () => {
          restartBg.setFillStyle(0xf43f5e);
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
    // Sweet Match 디저트 테마 등급
    if (score >= 900) return { emoji: '🏆', text: '파티시에 마스터', color: '#f59e0b' };
    if (score >= 750) return { emoji: '🍰', text: '케이크 장인', color: '#f43f5e' };
    if (score >= 600) return { emoji: '🧁', text: '컵케이크 메이커', color: '#ec4899' };
    if (score >= 450) return { emoji: '🍪', text: '쿠키 베이커', color: '#8b5cf6' };
    return { emoji: '🍬', text: '캔디 수집가', color: '#6b7280' };
  }
}
