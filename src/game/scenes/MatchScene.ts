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
  back: Phaser.GameObjects.Graphics;
  backIcon: Phaser.GameObjects.Text;
  starPattern: Phaser.GameObjects.Text;
  backLogo?: Phaser.GameObjects.Image;
  front: Phaser.GameObjects.Graphics;
  frontText?: Phaser.GameObjects.Text;
  frontImage?: Phaser.GameObjects.Image;
  hitArea: Phaser.GameObjects.Rectangle;
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
  private loadingContainer?: Phaser.GameObjects.Container;
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

    // UI 패널은 게임 시작 시 생성 (startGame에서 호출)

    // 로딩 스피너 표시
    this.createLoadingSpinner(W, H);

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
    // 로딩 스피너 제거
    if (this.loadingContainer) {
      this.loadingContainer.destroy();
      this.loadingContainer = undefined;
    }

    // 타이틀 화면 (상단 UI 패널 없이)
    this.createTitleScreen(W, H);

    // 카드 생성 (숨김 상태)
    this.createCards(W, H);

    console.log('[MatchScene] Game initialized with useImageAssets:', this.useImageAssets);

    // Vue에 게임 준비 완료 알림
    window.dispatchEvent(new CustomEvent('phaser-game-ready'));
  }

  private createLoadingSpinner(W: number, H: number) {
    // Vue 오버레이에서 로딩을 표시하므로 Phaser 내부 스피너는 최소화
    // 빈 컨테이너만 생성 (나중에 destroy를 위해)
    this.loadingContainer = this.add.container(W * 0.5, H * 0.5);
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
    // ==================== 상단 UI 패널 (Neumorphism 스타일) ====================
    const panelWidth = W * 0.94;
    const panelHeight = H * 0.10;
    const panelY = H * 0.06;
    const borderRadius = 16;

    // 패널 컨테이너
    const panelContainer = this.add.container(W * 0.5, panelY);

    // 패널 그림자 (shadow-lg shadow-slate-200/50)
    const shadowGraphics = this.add.graphics();
    shadowGraphics.fillStyle(0xcbd5e1, 0.3); // slate-300
    shadowGraphics.fillRoundedRect(-panelWidth / 2, -panelHeight / 2 + 4, panelWidth, panelHeight, borderRadius);
    panelContainer.add(shadowGraphics);

    // 패널 배경 (Neumorphism)
    const panelGraphics = this.add.graphics();
    panelGraphics.fillStyle(0xfff7ed, 1); // orange-50 계열
    panelGraphics.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, borderRadius);
    panelGraphics.lineStyle(1, 0xfed7aa, 0.8); // orange-200 테두리
    panelGraphics.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, borderRadius);
    panelContainer.add(panelGraphics);

    // 각 스탯 영역 간격
    const statSpacing = panelWidth / 3;

    // ========== MOVES (이동 수) ==========
    const movesX = -statSpacing;

    // 라벨
    const movesLabel = this.add.text(movesX, -panelHeight * 0.25, 'MOVES', {
      fontSize: Math.floor(H * 0.016) + 'px',
      color: '#94a3b8', // slate-400
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(movesLabel);

    // 값 (⚡ 아이콘 + 숫자)
    this.movesText = this.add.text(movesX, panelHeight * 0.12, '⚡ 0', {
      fontSize: Math.floor(H * 0.032) + 'px',
      color: '#f97316', // orange-500 (textMoves)
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(this.movesText);

    // ========== MATCHES (매치 수) ==========
    const matchesX = 0;

    // 라벨
    const matchesLabel = this.add.text(matchesX, -panelHeight * 0.25, 'MATCHES', {
      fontSize: Math.floor(H * 0.016) + 'px',
      color: '#94a3b8',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(matchesLabel);

    // 값 (⭐ 아이콘 + 숫자)
    this.matchesText = this.add.text(matchesX, panelHeight * 0.12, '⭐ 0/' + this.TOTAL_PAIRS, {
      fontSize: Math.floor(H * 0.032) + 'px',
      color: '#ec4899', // pink-500 (textMatches)
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(this.matchesText);

    // ========== TIME (시간) ==========
    const timeX = statSpacing;

    // 라벨
    const timeLabel = this.add.text(timeX, -panelHeight * 0.25, 'TIME', {
      fontSize: Math.floor(H * 0.016) + 'px',
      color: '#94a3b8',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(timeLabel);

    // 값 (🕐 아이콘 + 숫자)
    this.timeText = this.add.text(timeX, panelHeight * 0.12, '🕐 0s', {
      fontSize: Math.floor(H * 0.032) + 'px',
      color: '#8b5cf6', // violet-500 (textTime)
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(this.timeText);

    // ==================== 콤보 텍스트 ====================
    this.comboText = this.add.text(W * 0.5, H * 0.135, '', {
      fontSize: Math.floor(H * 0.038) + 'px',
      color: '#f43f5e', // rose-500 (textCombo)
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

      // 로고 이미지 (원형 마스크 적용)
      const logo = this.add.image(W * 0.5, logoY, 'store_logo');

      // 로고를 원형 영역에 꽉 차게 (정사각형 기준으로 스케일)
      const logoSize = logoRadius * 1.9; // 원형 지름의 95%
      const logoScaleX = logoSize / logo.width;
      const logoScaleY = logoSize / logo.height;
      // 정사각형으로 맞추기 위해 큰 쪽 스케일 사용 (원형에 꽉 차게)
      const logoScale = Math.max(logoScaleX, logoScaleY);
      logo.setScale(logoScale);
      logo.setOrigin(0.5, 0.5);

      // 원형 마스크 생성
      const maskGraphics = this.make.graphics({ x: 0, y: 0 });
      maskGraphics.fillStyle(0xffffff);
      maskGraphics.fillCircle(W * 0.5, logoY, logoRadius * 0.92);
      const mask = maskGraphics.createGeometryMask();
      logo.setMask(mask);

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

    // ==================== 둥근 버튼 (rounded-3xl 스타일) ====================
    const buttonWidth = W * 0.72;
    const buttonHeight = 64;
    const buttonY = H * 0.72;
    const borderRadius = 32; // rounded-3xl

    // 버튼 컨테이너
    const btnContainer = this.add.container(W * 0.5, buttonY);
    this.titleElements.push(btnContainer);

    // 버튼 그림자 (둥근 모서리)
    const shadowGraphics = this.add.graphics();
    shadowGraphics.fillStyle(0xfda4af, 0.5); // shadow-rose-300/50
    shadowGraphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2 + 6, buttonWidth, buttonHeight, borderRadius);
    btnContainer.add(shadowGraphics);

    // 버튼 배경 (둥근 모서리)
    const btnGraphics = this.add.graphics();
    btnGraphics.fillStyle(0xf43f5e, 1); // rose-500
    btnGraphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
    btnContainer.add(btnGraphics);

    // 시머 효과용 마스크 영역
    const shimmerGraphics = this.add.graphics();
    shimmerGraphics.fillStyle(0xffffff, 0.2);
    shimmerGraphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth * 0.3, buttonHeight, borderRadius);
    shimmerGraphics.setX(-buttonWidth * 0.5);
    btnContainer.add(shimmerGraphics);

    // 시머 애니메이션 (왼쪽에서 오른쪽으로)
    this.tweens.add({
      targets: shimmerGraphics,
      x: buttonWidth * 0.5,
      duration: 700,
      repeat: -1,
      repeatDelay: 2000,
      ease: 'Sine.easeInOut'
    });

    // 버튼 텍스트
    const startButtonText = this.add.text(0, 0, '게임 시작하기', {
      fontSize: Math.floor(H * 0.036) + 'px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    btnContainer.add(startButtonText);

    // 히트 영역 (투명한 인터랙티브 영역)
    const hitArea = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    btnContainer.add(hitArea);

    // 버튼 호버 효과
    hitArea.on('pointerover', () => {
      this.tweens.add({
        targets: btnContainer,
        scale: 1.05,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });

    hitArea.on('pointerout', () => {
      this.tweens.add({
        targets: btnContainer,
        scale: 1,
        duration: 150,
        ease: 'Sine.easeOut'
      });
    });

    hitArea.on('pointerdown', () => {
      this.tweens.add({
        targets: btnContainer,
        scale: 0.95,
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

    // UI 영역(상단 패널) 고려한 게임 영역 계산 - 적절한 여백 추가
    const gameAreaTop = H * 0.14; // UI 패널 아래 여백 추가
    const gameAreaBottom = H * 0.98; // 하단 여백
    const gameAreaHeight = gameAreaBottom - gameAreaTop;
    const gameAreaWidth = W * 0.96; // 좌우 여백 추가

    // 카드 간격 (부드러운 느낌)
    const gapX = W * 0.025; // 가로 간격
    const gapY = H * 0.015; // 세로 간격

    // 카드 크기 계산 - 화면에 꽉 차게
    const cardWidth = (gameAreaWidth - gapX * (cols + 1)) / cols;
    const cardHeight = (gameAreaHeight - gapY * (rows + 1)) / rows;

    // 시작 위치 (좌우 여백 고려)
    const startX = (W - gameAreaWidth) / 2 + gapX + cardWidth / 2;
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

    // 둥근 모서리 반경 (카드 크기의 15% - 부드러운 느낌)
    const cornerRadius = Math.min(width, height) * 0.15;

    // 카드 뒷면 - Sweet Match 흰색/파스텔 테마 (둥근 모서리)
    const back = this.add.graphics();
    back.fillStyle(0xffffff, 1);
    back.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
    back.lineStyle(2, 0xfda4af, 1);
    back.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);

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

    // 카드 앞면 (숨김) - 밝은 파스텔 배경 (둥근 모서리)
    const front = this.add.graphics();
    front.fillStyle(0xfff1eb, 1);
    front.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
    front.lineStyle(2, 0xf472b6, 1);
    front.strokeRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
    front.setVisible(false);

    // 클릭 이벤트를 위한 투명 히트 영역
    const hitArea = this.add.rectangle(0, 0, width, height, 0xffffff, 0);

    let frontText: Phaser.GameObjects.Text | undefined;
    let frontImage: Phaser.GameObjects.Image | undefined;

    // 컨테이너에 뒷면 요소 추가 (로고가 있으면 로고도 추가)
    const backElements: Phaser.GameObjects.GameObject[] = [back, starPattern, backIcon];
    if (backLogo) {
      backElements.push(backLogo);
    }

    if (isImageCard && this.textures.exists(value)) {
      // 이미지 카드 - 카드에 꽉 차게 표시 (cover 방식)
      frontImage = this.add.image(0, 0, value);

      // 이미지를 카드 크기에 맞게 조절 (cover 방식 - 카드를 꽉 채움)
      const scaleX = (width * 0.85) / frontImage.width;
      const scaleY = (height * 0.85) / frontImage.height;
      const scale = Math.max(scaleX, scaleY);  // cover 방식: 카드를 꽉 채움
      frontImage.setScale(scale);
      frontImage.setOrigin(0.5, 0.5);

      // 카드 영역 밖으로 넘치는 부분을 잘라내기 위한 마스크
      const maskGraphics = this.make.graphics({ x: 0, y: 0 });
      maskGraphics.fillStyle(0xffffff);
      maskGraphics.fillRoundedRect(
        container.x - width * 0.42,
        container.y - height * 0.42,
        width * 0.84,
        height * 0.84,
        cornerRadius - 2
      );
      const mask = maskGraphics.createGeometryMask();
      frontImage.setMask(mask);

      frontImage.setVisible(false);
      container.add([...backElements, front, frontImage, hitArea]);
    } else if (isImageCard) {
      // 텍스처가 없는 경우 폴백 이모지
      console.warn(`[MatchScene] Texture not found: ${value}, using fallback emoji`);
      const themeEmojis = THEMES[this.currentTheme] || THEMES.animals;
      const emojiIndex = index % themeEmojis.length;
      const fallbackEmoji = themeEmojis[emojiIndex] || '🖼️';
      frontText = this.add.text(0, 0, fallbackEmoji, {
        fontSize: Math.floor(height * 0.55) + 'px'
      }).setOrigin(0.5).setVisible(false);
      container.add([...backElements, front, frontText, hitArea]);
    } else {
      // 이모지 카드 - 크게 표시
      frontText = this.add.text(0, 0, value, {
        fontSize: Math.floor(height * 0.55) + 'px'
      }).setOrigin(0.5).setVisible(false);
      container.add([...backElements, front, frontText, hitArea]);
    }

    // 클릭 이벤트 (투명 히트 영역 사용)
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => this.flipCard(card));

    const card: Card = {
      container,
      back,
      backIcon,
      starPattern,
      backLogo,
      front,
      frontText,
      frontImage,
      hitArea,
      value,
      isFlipped: false,
      isMatched: false,
      index,
      isImageCard
    };

    return card;
  }

  private startGame() {
    const W = this.sys.game.config.width as number;
    const H = this.sys.game.config.height as number;

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

    // 게임 시작 시 상단 UI 패널 생성
    this.createUIPanel(W, H);

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
          // 성공 효과 - 녹색 틴트 적용
          card1.front.setAlpha(0.8);
          card2.front.setAlpha(0.8);

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

    // Vue 컴포넌트에 게임 종료 이벤트 전달
    window.dispatchEvent(new CustomEvent('phaser-game-over', {
      detail: { score: finalScore }
    }));

    // 성능 등급
    const grade = this.getGrade(finalScore);

    // ==================== 결과 오버레이 (밝은 모달 스타일) ====================
    // 배경 블러 오버레이 (bg-white/60 backdrop-blur-md)
    this.add.rectangle(W * 0.5, H * 0.5, W, H, 0xffffff, 0.6);

    // 모달 컨테이너 위치
    const modalCenterY = H * 0.48;
    const modalWidth = Math.min(W * 0.88, 340);
    const modalHeight = H * 0.72;
    const modalRadius = 24;

    // 모달 그림자 (shadow-2xl)
    const shadowGraphics = this.add.graphics();
    shadowGraphics.fillStyle(0x94a3b8, 0.25);
    shadowGraphics.fillRoundedRect(
      W * 0.5 - modalWidth / 2 + 4,
      modalCenterY - modalHeight / 2 + 8,
      modalWidth,
      modalHeight,
      modalRadius
    );

    // 모달 배경 (bg-white rounded-3xl border border-slate-100)
    const modalGraphics = this.add.graphics();
    modalGraphics.fillStyle(0xffffff, 1);
    modalGraphics.fillRoundedRect(
      W * 0.5 - modalWidth / 2,
      modalCenterY - modalHeight / 2,
      modalWidth,
      modalHeight,
      modalRadius
    );
    modalGraphics.lineStyle(1, 0xf1f5f9, 1); // slate-100
    modalGraphics.strokeRoundedRect(
      W * 0.5 - modalWidth / 2,
      modalCenterY - modalHeight / 2,
      modalWidth,
      modalHeight,
      modalRadius
    );

    // ========== 타이틀 (미션 완료! 🎉) ==========
    const titleY = modalCenterY - modalHeight * 0.38;
    this.add.text(W * 0.5, titleY, '미션 완료! 🎉', {
      fontSize: Math.floor(H * 0.042) + 'px',
      color: '#1e293b', // slate-800
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    // ========== 등급 표시 (바운스 애니메이션) ==========
    const gradeY = modalCenterY - modalHeight * 0.22;
    const gradeEmoji = this.add.text(W * 0.5, gradeY, grade.emoji, {
      fontSize: Math.floor(H * 0.10) + 'px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    // 바운스 애니메이션
    this.tweens.add({
      targets: gradeEmoji,
      y: gradeY - 8,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const gradeTextY = gradeY + H * 0.07;
    this.add.text(W * 0.5, gradeTextY, grade.text, {
      fontSize: Math.floor(H * 0.032) + 'px',
      color: grade.color,
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    // ========== 통계 패널 (bg-slate-50 rounded-2xl) ==========
    const statsY = modalCenterY + modalHeight * 0.02;
    const statsWidth = modalWidth * 0.85;
    const statsHeight = H * 0.14;
    const statsRadius = 16;

    // 통계 패널 배경
    const statsGraphics = this.add.graphics();
    statsGraphics.fillStyle(0xf8fafc, 1); // slate-50
    statsGraphics.fillRoundedRect(
      W * 0.5 - statsWidth / 2,
      statsY - statsHeight / 2,
      statsWidth,
      statsHeight,
      statsRadius
    );
    statsGraphics.lineStyle(1, 0xf1f5f9, 1); // slate-100
    statsGraphics.strokeRoundedRect(
      W * 0.5 - statsWidth / 2,
      statsY - statsHeight / 2,
      statsWidth,
      statsHeight,
      statsRadius
    );

    // 통계 항목들
    const statLineHeight = H * 0.032;
    const statStartY = statsY - statsHeight * 0.32;
    const statLeftX = W * 0.5 - statsWidth * 0.38;
    const statRightX = W * 0.5 + statsWidth * 0.38;

    // 시간
    this.add.text(statLeftX, statStartY, '🕐 시간', {
      fontSize: Math.floor(H * 0.022) + 'px',
      color: '#64748b', // slate-500
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0, 0.5);
    this.add.text(statRightX, statStartY, `${this.elapsedTime}초`, {
      fontSize: Math.floor(H * 0.022) + 'px',
      color: '#64748b',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(1, 0.5);

    // 콤보
    this.add.text(statLeftX, statStartY + statLineHeight, '⚡ 콤보', {
      fontSize: Math.floor(H * 0.022) + 'px',
      color: '#64748b',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0, 0.5);
    this.add.text(statRightX, statStartY + statLineHeight, `${this.maxCombo}회`, {
      fontSize: Math.floor(H * 0.022) + 'px',
      color: '#64748b',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(1, 0.5);

    // 구분선 (h-px bg-slate-200)
    const dividerY = statStartY + statLineHeight * 1.7;
    this.add.rectangle(W * 0.5, dividerY, statsWidth * 0.9, 1, 0xe2e8f0, 1); // slate-200

    // 점수 (rose-500)
    const scoreY = statStartY + statLineHeight * 2.4;
    this.add.text(statLeftX, scoreY, '🌟 점수', {
      fontSize: Math.floor(H * 0.026) + 'px',
      color: '#f43f5e', // rose-500
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0, 0.5);
    this.add.text(statRightX, scoreY, `${finalScore}점`, {
      fontSize: Math.floor(H * 0.026) + 'px',
      color: '#f43f5e',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(1, 0.5);

    // ========== 상태 메시지 영역 ==========
    const statusY = modalCenterY + modalHeight * 0.22;
    const statusText = this.add.text(W * 0.5, statusY, '', {
      fontSize: Math.floor(H * 0.022) + 'px',
      color: '#6b7280',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    // ========== HTML 이름 입력 필드 ==========
    const gameContainer = document.getElementById('game-container');
    const inputY = modalCenterY + modalHeight * 0.17;

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = '이름을 입력하세요';
    inputElement.maxLength = 20;
    inputElement.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${inputY}px;
      transform: translateX(-50%);
      width: ${modalWidth * 0.8}px;
      padding: 14px 16px;
      font-size: 15px;
      border: 2px solid transparent;
      border-radius: 12px;
      text-align: center;
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      outline: none;
      transition: all 0.2s ease;
    `;
    inputElement.onfocus = () => {
      inputElement.style.background = '#ffffff';
      inputElement.style.borderColor = '#fb7185'; // rose-400
    };
    inputElement.onblur = () => {
      inputElement.style.background = '#f1f5f9';
      inputElement.style.borderColor = 'transparent';
    };
    gameContainer?.appendChild(inputElement);
    inputElement.focus();

    // ========== 제출 버튼 (둥근 스타일 + 그림자) ==========
    const submitBtnY = modalCenterY + modalHeight * 0.30;

    const submitButton = document.createElement('button');
    submitButton.innerHTML = '✈️ 점수 제출';
    submitButton.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${submitBtnY}px;
      transform: translateX(-50%);
      width: ${modalWidth * 0.8}px;
      padding: 14px 24px;
      font-size: 15px;
      background: #f43f5e;
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: bold;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 8px 20px rgba(253, 164, 175, 0.5);
      transition: transform 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    `;
    submitButton.onmouseover = () => {
      submitButton.style.transform = 'translateX(-50%) scale(1.03)';
    };
    submitButton.onmouseout = () => {
      submitButton.style.transform = 'translateX(-50%) scale(1)';
    };
    submitButton.onmousedown = () => {
      submitButton.style.transform = 'translateX(-50%) scale(0.97)';
    };
    submitButton.onmouseup = () => {
      submitButton.style.transform = 'translateX(-50%) scale(1.03)';
    };
    gameContainer?.appendChild(submitButton);

    // ========== 다시 하기 버튼 ==========
    const restartBtnY = modalCenterY + modalHeight * 0.41;

    const restartButton = document.createElement('button');
    restartButton.innerHTML = '🔄 다시 하기';
    restartButton.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${restartBtnY}px;
      transform: translateX(-50%);
      padding: 8px 16px;
      font-size: 14px;
      background: transparent;
      color: #94a3b8;
      border: none;
      cursor: pointer;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      transition: color 0.15s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    restartButton.onmouseover = () => {
      restartButton.style.color = '#64748b';
    };
    restartButton.onmouseout = () => {
      restartButton.style.color = '#94a3b8';
    };
    gameContainer?.appendChild(restartButton);

    restartButton.onclick = () => {
      inputElement.remove();
      submitButton.remove();
      restartButton.remove();
      this.scene.restart();
    };

    const submitScore = async () => {
      const playerName = inputElement.value.trim() || '익명';

      submitButton.disabled = true;
      submitButton.innerHTML = '전송 중...';
      submitButton.style.opacity = '0.7';

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
        statusText.setText('✅ 점수가 제출되었습니다!');
        statusText.setColor('#34d399'); // green-400
      } else {
        statusText.setText('❌ 점수 제출 실패');
        statusText.setColor('#f87171'); // red-400
      }
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
