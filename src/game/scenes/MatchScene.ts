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
  private readonly TIME_LIMIT = 120; // 시간 제한 (초)
  private timeRemaining: number = 120;

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
    this.timeRemaining = this.TIME_LIMIT;
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
    // RESIZE 모드에서는 scale.width/height 사용
    const W = this.scale.width;
    const H = this.scale.height;

    // 그라데이션 배경
    this.createBackground(W, H);

    // UI 패널은 게임 시작 시 생성 (startGame에서 호출)

    // 로딩 스피너 표시
    this.createLoadingSpinner(W, H);

    // 에셋 로딩 후 게임 초기화
    this.loadGameAssetsAndInit(W, H);

    // Vue에서 게임 재시작 이벤트 수신
    const restartHandler = () => {
      this.scene.restart();
    };
    window.addEventListener('phaser-restart-game', restartHandler);

    // 씬 종료 시 이벤트 리스너 제거
    this.events.on('shutdown', () => {
      window.removeEventListener('phaser-restart-game', restartHandler);
    });
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

        // 로드 에러 처리 (once로 변경하여 메모리 누수 방지)
        this.load.once('loaderror', (file: Phaser.Loader.File) => {
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

    // ========== TIME (남은 시간) ==========
    const timeX = statSpacing;

    // 라벨
    const timeLabel = this.add.text(timeX, -panelHeight * 0.25, 'TIME', {
      fontSize: Math.floor(H * 0.016) + 'px',
      color: '#94a3b8',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(timeLabel);

    // 초기 시간 표시 (2:00 형식)
    const initMinutes = Math.floor(this.TIME_LIMIT / 60);
    const initSeconds = this.TIME_LIMIT % 60;
    const initTimeDisplay = `${initMinutes}:${initSeconds.toString().padStart(2, '0')}`;

    // 값 (⏱️ 아이콘 + 남은시간)
    this.timeText = this.add.text(timeX, panelHeight * 0.12, `⏱️ ${initTimeDisplay}`, {
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
      const scaleX = width / frontImage.width;
      const scaleY = height / frontImage.height;
      const scale = Math.max(scaleX, scaleY);  // cover 방식: 카드를 꽉 채움
      frontImage.setScale(scale);
      frontImage.setOrigin(0.5, 0.5);

      // 카드 영역 밖으로 넘치는 부분을 잘라내기 위한 마스크 (둥근 모서리)
      const maskGraphics = this.make.graphics({ x: 0, y: 0 });
      maskGraphics.fillStyle(0xffffff);
      maskGraphics.fillRoundedRect(
        container.x - width / 2,
        container.y - height / 2,
        width,
        height,
        cornerRadius
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
    this.timeRemaining = Math.max(0, this.TIME_LIMIT - this.elapsedTime);

    // 남은 시간 표시 (분:초 형식)
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    const timeDisplay = minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, '0')}`
      : `${seconds}초`;

    // 시간이 30초 이하면 빨간색으로 경고
    if (this.timeRemaining <= 30) {
      this.timeText?.setColor('#ef4444'); // red-500

      // 10초 이하면 깜빡임 효과
      if (this.timeRemaining <= 10 && this.timeRemaining > 0) {
        this.tweens.add({
          targets: this.timeText,
          alpha: 0.5,
          duration: 200,
          yoyo: true
        });
      }
    }

    this.timeText?.setText(`⏱️ ${timeDisplay}`);

    // 시간 초과 - 게임 종료
    if (this.timeRemaining <= 0) {
      this.timerEvent?.remove();
      this.endGame(false); // 시간 초과로 실패
    }
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
          this.endGame(true); // 성공으로 종료
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

  private async endGame(completed: boolean = true) {
    // 점수 계산
    let finalScore: number;

    if (completed) {
      // 성공 - 기본 점수에서 시간/이동 패널티, 콤보 보너스 적용
      const baseScore = 1000;
      const movePenalty = Math.max(0, (this.moves - this.TOTAL_PAIRS) * 8);
      const timePenalty = this.elapsedTime * 3;
      const comboBonus = this.maxCombo * 50;
      // 빨리 클리어하면 시간 보너스
      const timeBonus = Math.max(0, (this.TIME_LIMIT - this.elapsedTime) * 2);
      finalScore = Math.max(100, baseScore - movePenalty - timePenalty + comboBonus + timeBonus);
    } else {
      // 시간 초과 - 찾은 매치 수에 따라 점수 부여
      const matchScore = this.matches * 50;
      const comboBonus = this.maxCombo * 20;
      finalScore = Math.max(50, matchScore + comboBonus);
    }

    // 성능 등급
    const grade = this.getGrade(finalScore);

    // Vue 컴포넌트에 게임 종료 이벤트 전달 (통합 모달에서 처리)
    window.dispatchEvent(new CustomEvent('phaser-game-over', {
      detail: {
        score: finalScore,
        time: this.elapsedTime,
        moves: this.moves,
        combo: this.maxCombo,
        grade: grade,
        gameType: 'memory',
        success: completed,
        matchesFound: this.matches,
        totalPairs: this.TOTAL_PAIRS,
        timeLimit: this.TIME_LIMIT
      }
    }));

    // 게임 일시정지 (Vue 모달에서 처리할 때까지)
    this.scene.pause();
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
