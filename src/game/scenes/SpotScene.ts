/**
 * Spot Difference Game Scene - 틀린 그림 찾기
 * Admin이 업로드한 이미지 기반 게임
 * 세로 배치 (모바일 최적화)
 * UI 고도화 - MatchScene 수준의 디자인
 */

import * as Phaser from 'phaser';
import { gameManager } from '../GameManager';
import { getSpotDifferenceByQrCode, type SpotDifferenceGame, type DifferencePoint } from '../../services/spotDifferenceService';

interface FoundDifference {
  point: DifferencePoint;
  found: boolean;
  marker?: Phaser.GameObjects.Arc;
}

export class SpotScene extends Phaser.Scene {
  // 게임 데이터
  private gameData: SpotDifferenceGame | null = null;
  private foundDifferences: FoundDifference[] = [];
  private foundCount: number = 0;
  private totalDifferences: number = 0;

  // UI 요소
  private foundText?: Phaser.GameObjects.Text;
  private timeText?: Phaser.GameObjects.Text;
  private hintsText?: Phaser.GameObjects.Text;
  private titleElements: Phaser.GameObjects.GameObject[] = [];
  private loadingContainer?: Phaser.GameObjects.Container;

  // 타이머
  private startTime: number = 0;
  private elapsedTime: number = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timeLimit: number = 0;

  // 힌트
  private hintsRemaining: number = 3;

  // 게임 상태
  private gameStarted: boolean = false;
  private gameOver: boolean = false;

  // 이미지
  private originalImage?: Phaser.GameObjects.Image;
  private modifiedImage?: Phaser.GameObjects.Image;
  private imageWidth: number = 0;
  private imageHeight: number = 0;

  // 매장 정보
  private storeName?: string;
  private logoUrl?: string;
  private hasLogo: boolean = false;

  constructor() {
    super({ key: 'SpotScene' });
  }

  init() {
    this.gameData = null;
    this.foundDifferences = [];
    this.foundCount = 0;
    this.totalDifferences = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timeLimit = 0;
    this.hintsRemaining = 3;
    this.gameStarted = false;
    this.gameOver = false;
    this.titleElements = [];
    this.hasLogo = false;
  }

  async create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // 그라데이션 배경
    this.createBackground(W, H);

    // 로딩 스피너 표시
    this.createLoadingSpinner(W, H);

    // QR 코드로 게임 데이터 조회
    const qrCode = gameManager.getQrCode();
    if (qrCode) {
      this.gameData = await getSpotDifferenceByQrCode(qrCode);
    }

    // 로딩 스피너 제거
    if (this.loadingContainer) {
      this.loadingContainer.destroy();
      this.loadingContainer = undefined;
    }

    if (!this.gameData) {
      this.showNoDataScreen();
      return;
    }

    // 게임 설정 적용
    this.totalDifferences = this.gameData.differenceCount;
    this.timeLimit = this.gameData.timeLimit;
    this.hintsRemaining = this.gameData.hintsAllowed;
    this.storeName = this.gameData.storeName;
    this.logoUrl = this.gameData.logoUrl;

    // 차이점 데이터 초기화
    this.foundDifferences = this.gameData.differences.map(point => ({
      point,
      found: false
    }));

    // 로고 이미지 로드
    if (this.logoUrl) {
      this.load.image('store_logo', this.logoUrl);
    }

    // 이미지 프리로드
    await this.loadImages();

    // 로고 로드 확인
    this.hasLogo = this.textures.exists('store_logo');

    // 시작 화면 표시
    this.showStartScreen();

    // Vue에 게임 준비 완료 알림
    window.dispatchEvent(new CustomEvent('phaser-game-ready'));

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

  private createBackground(W: number, H: number) {
    // 파스텔 블루/퍼플 그라데이션 배경 (틀린그림찾기 테마)
    this.add.rectangle(W * 0.5, H * 0.25, W, H * 0.5, 0xf0f4ff); // slate-50/indigo-50
    this.add.rectangle(W * 0.5, H * 0.75, W, H * 0.5, 0xeef2ff); // indigo-50

    // 부드러운 중간 레이어
    this.add.rectangle(W * 0.5, H * 0.5, W, H * 0.3, 0xe0e7ff, 0.4); // indigo-100

    // 미니멀한 장식 - 작은 원 몇 개만
    const decorColors = [0xa5b4fc, 0x818cf8, 0x6366f1]; // indigo 계열
    const positions = [
      { x: W * 0.1, y: H * 0.15 },
      { x: W * 0.9, y: H * 0.2 },
      { x: W * 0.15, y: H * 0.85 },
      { x: W * 0.85, y: H * 0.9 }
    ];

    positions.forEach((pos, i) => {
      const color = decorColors[i % decorColors.length] || 0xa5b4fc;
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

  private createLoadingSpinner(W: number, H: number) {
    // Vue 오버레이에서 로딩을 표시하므로 Phaser 내부 스피너는 최소화
    // 빈 컨테이너만 생성 (나중에 destroy를 위해)
    this.loadingContainer = this.add.container(W * 0.5, H * 0.5);
  }

  private showNoDataScreen() {
    const W = this.scale.width;
    const H = this.scale.height;

    // 경고 아이콘 배경
    const iconBg = this.add.circle(W / 2, H / 2 - 60, 50, 0xfef2f2, 1);
    iconBg.setStrokeStyle(2, 0xfecaca);

    this.add.text(W / 2, H / 2 - 60, '!', {
      fontSize: '48px',
      color: '#ef4444',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 20, '등록된 틀린그림찾기가 없습니다', {
      fontSize: '20px',
      color: '#1f2937',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 55, '관리자에게 문의해주세요', {
      fontSize: '15px',
      color: '#6b7280',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
  }

  private loadImages(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.gameData) {
        resolve();
        return;
      }

      // 원본 이미지
      this.load.image('spot-original', this.gameData.originalImageUrl);
      // 차이점 이미지
      this.load.image('spot-modified', this.gameData.modifiedImageUrl);

      this.load.once('complete', () => {
        resolve();
      });

      this.load.start();
    });
  }

  private showStartScreen() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ==================== 로고 영역 + 데코레이션 ====================
    let contentY = H * 0.35;
    const logoY = H * 0.22;

    if (this.hasLogo) {
      const logoRadius = W * 0.22;

      // 로고 배경 - 그라데이션 입체감 (다중 원 레이어)
      const shadowOuter = this.add.circle(W * 0.5, logoY + 4, logoRadius + 8, 0x000000, 0.08);
      this.titleElements.push(shadowOuter);

      const outerRing = this.add.circle(W * 0.5, logoY, logoRadius + 6, 0xc7d2fe, 0.6);
      this.titleElements.push(outerRing);

      const bgCircle = this.add.circle(W * 0.5, logoY, logoRadius, 0xffffff, 0.95);
      this.titleElements.push(bgCircle);

      const highlightTop = this.add.ellipse(W * 0.5, logoY - logoRadius * 0.35, logoRadius * 1.2, logoRadius * 0.5, 0xffffff, 0.5);
      this.titleElements.push(highlightTop);

      const innerGlow = this.add.circle(W * 0.5, logoY + logoRadius * 0.1, logoRadius * 0.85, 0xeef2ff, 0.3);
      this.titleElements.push(innerGlow);

      // 로고 이미지 (원형 마스크 적용)
      const logo = this.add.image(W * 0.5, logoY, 'store_logo');
      const logoSize = logoRadius * 1.9;
      const logoScaleX = logoSize / logo.width;
      const logoScaleY = logoSize / logo.height;
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
    const titleText = this.storeName || '틀린 그림 찾기';
    const title = this.add.text(W * 0.5, contentY, titleText, {
      fontSize: Math.floor(H * 0.05) + 'px',
      color: '#1f2937',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.titleElements.push(title);

    // 부제목 (구분선 포함)
    const subtitleY = contentY + H * 0.055;

    const leftLine = this.add.rectangle(W * 0.2, subtitleY, W * 0.12, 2, 0xd1d5db, 0.5);
    this.titleElements.push(leftLine);

    const subtitle = this.add.text(W * 0.5, subtitleY, '틀린 그림 찾기', {
      fontSize: Math.floor(H * 0.024) + 'px',
      color: '#6b7280',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    this.titleElements.push(subtitle);

    const rightLine = this.add.rectangle(W * 0.8, subtitleY, W * 0.12, 2, 0xd1d5db, 0.5);
    this.titleElements.push(rightLine);

    // ==================== 버튼 위치 계산 (먼저 계산) ====================
    const buttonWidth = W * 0.72;
    const buttonHeight = 64;
    const buttonY = H * 0.82;

    // ==================== 게임 정보 패널 (타이틀과 버튼 사이 중앙 배치) ====================
    // 타이틀 하단(subtitleY)과 버튼 상단(buttonY) 사이의 중앙
    const infoPanelTop = subtitleY + H * 0.04;
    const infoPanelBottom = buttonY - buttonHeight / 2 - H * 0.04;
    const infoY = (infoPanelTop + infoPanelBottom) / 2;
    const infoWidth = W * 0.8;
    const infoHeight = H * 0.12;
    const infoRadius = 16;

    // 정보 패널 배경
    const infoBg = this.add.graphics();
    infoBg.fillStyle(0xf8fafc, 1);
    infoBg.fillRoundedRect(W * 0.5 - infoWidth / 2, infoY - infoHeight / 2, infoWidth, infoHeight, infoRadius);
    infoBg.lineStyle(1, 0xe2e8f0, 1);
    infoBg.strokeRoundedRect(W * 0.5 - infoWidth / 2, infoY - infoHeight / 2, infoWidth, infoHeight, infoRadius);
    this.titleElements.push(infoBg);

    // 정보 항목들
    const infoSpacing = infoWidth / 3;

    // 차이점 개수
    this.add.text(W * 0.5 - infoSpacing, infoY - 12, '차이점', {
      fontSize: Math.floor(H * 0.016) + 'px',
      color: '#94a3b8',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    this.titleElements.push(this.children.list[this.children.list.length - 1] as Phaser.GameObjects.Text);

    const diffText = this.add.text(W * 0.5 - infoSpacing, infoY + 12, `${this.totalDifferences}개`, {
      fontSize: Math.floor(H * 0.028) + 'px',
      color: '#1f2937',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    this.titleElements.push(diffText);

    // 제한시간
    this.add.text(W * 0.5, infoY - 12, '제한시간', {
      fontSize: Math.floor(H * 0.016) + 'px',
      color: '#94a3b8',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    this.titleElements.push(this.children.list[this.children.list.length - 1] as Phaser.GameObjects.Text);

    const timeLimitText = this.timeLimit > 0 ? `${this.timeLimit}초` : '무제한';
    const timeValText = this.add.text(W * 0.5, infoY + 12, timeLimitText, {
      fontSize: Math.floor(H * 0.028) + 'px',
      color: '#1f2937',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    this.titleElements.push(timeValText);

    // 힌트
    this.add.text(W * 0.5 + infoSpacing, infoY - 12, '힌트', {
      fontSize: Math.floor(H * 0.016) + 'px',
      color: '#94a3b8',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    this.titleElements.push(this.children.list[this.children.list.length - 1] as Phaser.GameObjects.Text);

    const hintValText = this.add.text(W * 0.5 + infoSpacing, infoY + 12, `${this.hintsRemaining}회`, {
      fontSize: Math.floor(H * 0.028) + 'px',
      color: '#1f2937',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    this.titleElements.push(hintValText);

    // ==================== 둥근 버튼 (rounded-3xl 스타일) ====================
    const borderRadius = 32;

    const btnContainer = this.add.container(W * 0.5, buttonY);
    this.titleElements.push(btnContainer);

    // 버튼 그림자
    const shadowGraphics = this.add.graphics();
    shadowGraphics.fillStyle(0xa5b4fc, 0.5);
    shadowGraphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2 + 6, buttonWidth, buttonHeight, borderRadius);
    btnContainer.add(shadowGraphics);

    // 버튼 배경
    const btnGraphics = this.add.graphics();
    btnGraphics.fillStyle(0x6366f1, 1); // indigo-500
    btnGraphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
    btnContainer.add(btnGraphics);

    // 시머 효과
    const shimmerGraphics = this.add.graphics();
    shimmerGraphics.fillStyle(0xffffff, 0.2);
    shimmerGraphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth * 0.3, buttonHeight, borderRadius);
    shimmerGraphics.setX(-buttonWidth * 0.5);
    btnContainer.add(shimmerGraphics);

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

    // 히트 영역
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
          this.titleElements.forEach(el => el.destroy());
          this.titleElements = [];
          this.startGame();
        }
      });
    });

    // ==================== 하단 힌트 텍스트 ====================
    const hintText = this.add.text(W * 0.5, H * 0.95, '최고 기록에 도전하세요!', {
      fontSize: Math.floor(H * 0.02) + 'px',
      color: '#9ca3af',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    this.titleElements.push(hintText);

    this.tweens.add({
      targets: hintText,
      alpha: 0.5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private startGame() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.gameStarted = true;
    this.startTime = Date.now();

    // UI 패널 (상단) - Neumorphism 스타일
    this.createUIPanel(W, H);

    // 타이머 시작
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 이미지 배치 (세로 - 위/아래)
    this.setupImages();
  }

  private createUIPanel(W: number, H: number) {
    const panelWidth = W * 0.94;
    const panelHeight = H * 0.10;
    const panelY = H * 0.06;
    const borderRadius = 16;

    const panelContainer = this.add.container(W * 0.5, panelY);

    // 패널 그림자
    const shadowGraphics = this.add.graphics();
    shadowGraphics.fillStyle(0xcbd5e1, 0.3);
    shadowGraphics.fillRoundedRect(-panelWidth / 2, -panelHeight / 2 + 4, panelWidth, panelHeight, borderRadius);
    panelContainer.add(shadowGraphics);

    // 패널 배경
    const panelGraphics = this.add.graphics();
    panelGraphics.fillStyle(0xeef2ff, 1); // indigo-50
    panelGraphics.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, borderRadius);
    panelGraphics.lineStyle(1, 0xc7d2fe, 0.8); // indigo-200
    panelGraphics.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, borderRadius);
    panelContainer.add(panelGraphics);

    const statSpacing = panelWidth / 3;

    // 찾은 개수
    const foundX = -statSpacing;

    const foundLabel = this.add.text(foundX, -panelHeight * 0.25, 'FOUND', {
      fontSize: Math.floor(H * 0.016) + 'px',
      color: '#94a3b8',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(foundLabel);

    this.foundText = this.add.text(foundX, panelHeight * 0.12, `0/${this.totalDifferences}`, {
      fontSize: Math.floor(H * 0.032) + 'px',
      color: '#6366f1', // indigo-500
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(this.foundText);

    // 시간
    const timeX = 0;

    const timeLabel = this.add.text(timeX, -panelHeight * 0.25, 'TIME', {
      fontSize: Math.floor(H * 0.016) + 'px',
      color: '#94a3b8',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(timeLabel);

    const timeDisplay = this.timeLimit > 0 ? `${this.timeLimit}s` : '0s';
    this.timeText = this.add.text(timeX, panelHeight * 0.12, timeDisplay, {
      fontSize: Math.floor(H * 0.032) + 'px',
      color: this.timeLimit > 0 ? '#ef4444' : '#8b5cf6',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(this.timeText);

    // 힌트 버튼
    const hintX = statSpacing;

    const hintLabel = this.add.text(hintX, -panelHeight * 0.25, 'HINT', {
      fontSize: Math.floor(H * 0.016) + 'px',
      color: '#94a3b8',
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(hintLabel);

    // 힌트 버튼 배경
    const hintBtnWidth = panelWidth * 0.22;
    const hintBtnHeight = panelHeight * 0.5;
    const hintBtnGraphics = this.add.graphics();
    hintBtnGraphics.fillStyle(0xfef3c7, 1); // amber-100
    hintBtnGraphics.fillRoundedRect(hintX - hintBtnWidth / 2, panelHeight * 0.12 - hintBtnHeight / 2, hintBtnWidth, hintBtnHeight, 8);
    hintBtnGraphics.lineStyle(1, 0xfcd34d, 1); // amber-300
    hintBtnGraphics.strokeRoundedRect(hintX - hintBtnWidth / 2, panelHeight * 0.12 - hintBtnHeight / 2, hintBtnWidth, hintBtnHeight, 8);
    panelContainer.add(hintBtnGraphics);

    this.hintsText = this.add.text(hintX, panelHeight * 0.12, `${this.hintsRemaining}`, {
      fontSize: Math.floor(H * 0.028) + 'px',
      color: '#f59e0b', // amber-500
      fontStyle: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }).setOrigin(0.5);
    panelContainer.add(this.hintsText);

    // 힌트 버튼 히트 영역
    const hintHitArea = this.add.rectangle(hintX, panelHeight * 0.12, hintBtnWidth, hintBtnHeight, 0x000000, 0);
    hintHitArea.setInteractive({ useHandCursor: true });
    panelContainer.add(hintHitArea);

    hintHitArea.on('pointerdown', () => this.useHint());
  }

  private setupImages() {
    const W = this.scale.width;
    const H = this.scale.height;

    const imageAreaTop = 90;
    const imageAreaHeight = H - imageAreaTop - 10;
    const maxImageHeight = (imageAreaHeight - 20) / 2;
    const padding = 12; // 좌우 여백
    const maxImageWidth = W - padding * 2;

    const frame = this.textures.getFrame('spot-original');
    if (!frame) return;

    const imgWidth = frame.width;
    const imgHeight = frame.height;

    // 스케일 계산 (가로/세로 중 작은 쪽에 맞춤 - 화면에 꽉 차게)
    const scaleByWidth = maxImageWidth / imgWidth;
    const scaleByHeight = maxImageHeight / imgHeight;
    const scale = Math.min(scaleByWidth, scaleByHeight);

    this.imageWidth = imgWidth * scale;
    this.imageHeight = imgHeight * scale;

    // 원본 이미지 (위)
    const originalY = imageAreaTop + this.imageHeight / 2;
    this.originalImage = this.add.image(W / 2, originalY, 'spot-original');
    this.originalImage.setScale(scale);
    this.originalImage.setInteractive({ useHandCursor: true });

    // 원본 이미지 테두리 (둥근 모서리 효과)
    const origBorderGraphics = this.add.graphics();
    origBorderGraphics.lineStyle(3, 0x6366f1, 1);
    origBorderGraphics.strokeRoundedRect(
      W / 2 - this.imageWidth / 2 - 2,
      originalY - this.imageHeight / 2 - 2,
      this.imageWidth + 4,
      this.imageHeight + 4,
      8
    );

    // 차이점 이미지 (아래)
    const modifiedY = originalY + this.imageHeight + 20;
    this.modifiedImage = this.add.image(W / 2, modifiedY, 'spot-modified');
    this.modifiedImage.setScale(scale);
    this.modifiedImage.setInteractive({ useHandCursor: true });

    // 차이점 이미지 테두리
    const modBorderGraphics = this.add.graphics();
    modBorderGraphics.lineStyle(3, 0xa78bfa, 1);
    modBorderGraphics.strokeRoundedRect(
      W / 2 - this.imageWidth / 2 - 2,
      modifiedY - this.imageHeight / 2 - 2,
      this.imageWidth + 4,
      this.imageHeight + 4,
      8
    );

    // 클릭 이벤트 설정
    this.modifiedImage.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameStarted || this.gameOver) return;
      this.handleImageClick(pointer);
    });

    this.originalImage.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameStarted || this.gameOver) return;
      this.handleImageClick(pointer);
    });
  }

  private handleImageClick(pointer: Phaser.Input.Pointer) {
    if (!this.modifiedImage) return;

    const imgBounds = this.modifiedImage.getBounds();
    const relX = (pointer.x - imgBounds.left) / imgBounds.width;
    const relY = (pointer.y - imgBounds.top) / imgBounds.height;

    if (this.originalImage) {
      const origBounds = this.originalImage.getBounds();
      if (pointer.x >= origBounds.left && pointer.x <= origBounds.right &&
          pointer.y >= origBounds.top && pointer.y <= origBounds.bottom) {
        const origRelX = (pointer.x - origBounds.left) / origBounds.width;
        const origRelY = (pointer.y - origBounds.top) / origBounds.height;
        this.checkDifference(origRelX, origRelY);
        return;
      }
    }

    if (relX >= 0 && relX <= 1 && relY >= 0 && relY <= 1) {
      this.checkDifference(relX, relY);
    }
  }

  private checkDifference(relX: number, relY: number) {
    for (const diff of this.foundDifferences) {
      if (diff.found) continue;

      const distance = Math.sqrt(
        Math.pow(relX - diff.point.x, 2) +
        Math.pow(relY - diff.point.y, 2)
      );

      const tolerance = diff.point.radius + 0.03;

      if (distance <= tolerance) {
        this.markDifferenceFound(diff);
        return;
      }
    }

    this.showMissEffect(relX, relY);
  }

  private markDifferenceFound(diff: FoundDifference) {
    diff.found = true;
    this.foundCount++;

    if (this.originalImage && this.modifiedImage) {
      const origBounds = this.originalImage.getBounds();
      const modBounds = this.modifiedImage.getBounds();

      // 원본 이미지에 마커
      const origX = origBounds.left + diff.point.x * origBounds.width;
      const origY = origBounds.top + diff.point.y * origBounds.height;
      const origMarker = this.add.circle(origX, origY, diff.point.radius * origBounds.width, 0x10b981, 0);
      origMarker.setStrokeStyle(3, 0x10b981);

      // 차이점 이미지에 마커
      const modX = modBounds.left + diff.point.x * modBounds.width;
      const modY = modBounds.top + diff.point.y * modBounds.height;
      const modMarker = this.add.circle(modX, modY, diff.point.radius * modBounds.width, 0x10b981, 0);
      modMarker.setStrokeStyle(3, 0x10b981);

      // 애니메이션
      this.tweens.add({
        targets: [origMarker, modMarker],
        scale: { from: 0, to: 1 },
        alpha: { from: 1, to: 0.6 },
        duration: 300,
        ease: 'Back.easeOut'
      });

      // 성공 효과
      const successText = this.add.text(modX, modY - 30, '✓', {
        fontSize: '24px',
        color: '#10b981',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: successText,
        y: modY - 50,
        alpha: 0,
        duration: 500,
        onComplete: () => successText.destroy()
      });
    }

    // UI 업데이트
    this.foundText?.setText(`${this.foundCount}/${this.totalDifferences}`);

    // 모두 찾았는지 확인
    if (this.foundCount >= this.totalDifferences) {
      this.time.delayedCall(500, () => this.endGame(true));
    }
  }

  private showMissEffect(relX: number, relY: number) {
    if (!this.modifiedImage) return;

    const bounds = this.modifiedImage.getBounds();
    const x = bounds.left + relX * bounds.width;
    const y = bounds.top + relY * bounds.height;

    const miss = this.add.text(x, y, '✗', {
      fontSize: '24px',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: miss,
      alpha: 0,
      scale: 1.5,
      duration: 400,
      onComplete: () => miss.destroy()
    });
  }

  private useHint() {
    if (this.hintsRemaining <= 0 || this.gameOver) return;

    const notFound = this.foundDifferences.filter(d => !d.found);
    if (notFound.length === 0) return;

    this.hintsRemaining--;
    this.hintsText?.setText(`${this.hintsRemaining}`);

    const hint = notFound[Math.floor(Math.random() * notFound.length)];
    if (!hint) return;

    if (this.originalImage && this.modifiedImage) {
      const origBounds = this.originalImage.getBounds();
      const modBounds = this.modifiedImage.getBounds();

      const origX = origBounds.left + hint.point.x * origBounds.width;
      const origY = origBounds.top + hint.point.y * origBounds.height;
      const modX = modBounds.left + hint.point.x * modBounds.width;
      const modY = modBounds.top + hint.point.y * modBounds.height;

      const radius = hint.point.radius * origBounds.width * 1.5;

      const hintCircle1 = this.add.circle(origX, origY, radius, 0xfbbf24, 0);
      hintCircle1.setStrokeStyle(3, 0xfbbf24);
      const hintCircle2 = this.add.circle(modX, modY, radius, 0xfbbf24, 0);
      hintCircle2.setStrokeStyle(3, 0xfbbf24);

      this.tweens.add({
        targets: [hintCircle1, hintCircle2],
        alpha: { from: 1, to: 0.3 },
        scale: { from: 1, to: 1.2 },
        duration: 300,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          hintCircle1.destroy();
          hintCircle2.destroy();
        }
      });
    }
  }

  private updateTimer() {
    if (!this.gameStarted || this.gameOver) return;

    this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

    if (this.timeLimit > 0) {
      const remaining = this.timeLimit - this.elapsedTime;
      this.timeText?.setText(`${Math.max(0, remaining)}s`);

      if (remaining <= 10) {
        this.timeText?.setColor('#ef4444');
      }

      if (remaining <= 0) {
        this.endGame(false);
      }
    } else {
      this.timeText?.setText(`${this.elapsedTime}s`);
    }
  }

  private async endGame(success: boolean) {
    if (this.gameOver) return;
    this.gameOver = true;

    this.timerEvent?.remove();

    // 점수 계산
    const baseScore = success ? 1000 : 0;
    const timeBonus = success ? Math.max(0, (this.timeLimit > 0 ? this.timeLimit : 120) - this.elapsedTime) * 10 : 0;
    const hintPenalty = (this.gameData!.hintsAllowed - this.hintsRemaining) * 50;
    const difficultyBonus = (this.gameData!.difficulty - 1) * 200;
    const finalScore = Math.max(0, baseScore + timeBonus + difficultyBonus - hintPenalty);

    // 등급 계산
    const grade = this.getGrade(success);

    // Vue 컴포넌트에 게임 종료 이벤트 전달 (통합 모달에서 처리)
    window.dispatchEvent(new CustomEvent('phaser-game-over', {
      detail: {
        score: finalScore,
        time: this.elapsedTime,
        foundCount: this.foundCount,
        totalDifferences: this.totalDifferences,
        hintsUsed: this.gameData!.hintsAllowed - this.hintsRemaining,
        success: success,
        grade: grade,
        gameType: 'spot-difference'
      }
    }));

    // 게임 일시정지 (Vue 모달에서 처리할 때까지)
    this.scene.pause();
  }

  private getGrade(success: boolean): { icon: string; text: string; color: string } {
    if (!success) {
      return { icon: 'tent', text: '다음에 다시 도전!', color: '#ef4444' };
    }

    const timeRatio = this.elapsedTime / (this.timeLimit || 120);
    const hintsUsed = this.gameData!.hintsAllowed - this.hintsRemaining;

    if (timeRatio < 0.3 && hintsUsed === 0) {
      return { icon: 'trophy', text: '탐정 마스터', color: '#f59e0b' };
    } else if (timeRatio < 0.5 && hintsUsed <= 1) {
      return { icon: 'target', text: '명탐정', color: '#6366f1' };
    } else if (timeRatio < 0.7 && hintsUsed <= 2) {
      return { icon: 'star', text: '훌륭한 관찰자', color: '#8b5cf6' };
    } else {
      return { icon: 'gamepad', text: '초보 탐정', color: '#64748b' };
    }
  }
}
