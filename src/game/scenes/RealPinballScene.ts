/**
 * Real Pinball Game Scene - Mobile Optimized
 * 모바일 최적화 핀볼 게임 - 플리퍼로 공을 튕기는 핀볼 게임
 */

import * as Phaser from 'phaser';
import { COLORS } from '../config';
import { submitGameScore } from '../../services/gameScoreService';

export class RealPinballScene extends Phaser.Scene {
  private ball?: Phaser.Physics.Arcade.Image;
  private leftFlipper?: Phaser.Physics.Arcade.Image;
  private rightFlipper?: Phaser.Physics.Arcade.Image;
  private score: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private bumpers?: Phaser.Physics.Arcade.StaticGroup;
  private gameStarted: boolean = false;
  private gameOver: boolean = false;
  private ballsLeft: number = 3;
  private ballsText?: Phaser.GameObjects.Text;
  private leftFlipperButton?: Phaser.GameObjects.Rectangle;
  private rightFlipperButton?: Phaser.GameObjects.Rectangle;

  // 콤보 시스템
  private comboCount: number = 0;
  private comboTimer?: Phaser.Time.TimerEvent;
  private comboText?: Phaser.GameObjects.Text;
  private lastHitTime: number = 0;

  // 레인 시스템
  private lanes?: Phaser.Physics.Arcade.StaticGroup;
  private laneBonus: number = 500;
  private laneMultiplier: number = 1;

  // 트레일 효과 시스템
  private ballTrail: Phaser.GameObjects.Graphics[] = [];
  private readonly MAX_TRAIL_LENGTH = 8;
  private trailUpdateCounter: number = 0;

  // 슬로우 모션 시스템
  private isSlowMotion: boolean = false;
  private slowMotionDuration: number = 0;

  // 사운드 시스템
  private audioContext?: AudioContext;

  constructor() {
    super({ key: 'RealPinballScene' });
  }

  preload() {
    // 텍스처 생성
    this.createBallTexture();
    this.createFlipperTexture();
    this.createBumperTexture();
  }

  create() {
    // 사운드 시스템 초기화
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
    }

    // 배경 - 네온 그라디언트 (화려한 깊이감)
    const bgGradient1 = this.add.rectangle(187.5, 150, 375, 300, 0x1e1b4b); // 깊은 보라
    const bgGradient2 = this.add.rectangle(187.5, 400, 375, 300, 0x312e81); // 중간 보라
    const bgGradient3 = this.add.rectangle(187.5, 600, 375, 134, 0x4c1d95); // 밝은 보라

    // 네온 글로우 효과 (배경에 빛나는 레이어)
    const neonGlow1 = this.add.rectangle(187.5, 333.5, 340, 550, 0x7c3aed, 0.1);
    const neonGlow2 = this.add.rectangle(187.5, 333.5, 320, 530, 0xa855f7, 0.05);

    // 상단 로고 영역 - 네온 스타일
    const logoBg = this.add.rectangle(187.5, 50, 320, 60, 0x60a5fa);
    logoBg.setStrokeStyle(4, 0x93c5fd);

    // 로고 내부 테두리
    const logoInner = this.add.rectangle(187.5, 50, 310, 50, 0x3b82f6);
    logoInner.setStrokeStyle(2, 0x2563eb);

    const logoText = this.add.text(187.5, 50, 'PINBALL', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold',
      stroke: '#1e40af',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 점수 표시 - 네온 스타일 (좌측 상단으로 이동)
    const scoreBox = this.add.rectangle(80, 105, 120, 50, 0x7c3aed);
    scoreBox.setStrokeStyle(3, 0xa855f7);

    const scoreInner = this.add.rectangle(80, 105, 114, 44, 0x5b21b6);

    // 네온 글로우 효과
    const scoreGlow = this.add.circle(80, 105, 35, 0xc084fc, 0.2);

    this.scoreText = this.add.text(80, 97, '0', {
      fontSize: '26px',
      color: '#fbbf24',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold',
      stroke: '#f59e0b',
      strokeThickness: 2
    }).setOrigin(0.5);

    const scoreLabel = this.add.text(80, 118, 'SCORE', {
      fontSize: '11px',
      color: '#fde68a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 공 개수 표시 - 네온 스타일 (우측 상단으로 이동)
    const ballsCircle = this.add.circle(295, 105, 28, 0xef4444);
    ballsCircle.setStrokeStyle(3, 0xfca5a5);

    const ballsInner = this.add.circle(295, 105, 23, 0xdc2626);

    // 네온 글로우 효과
    const ballsGlow = this.add.circle(295, 105, 35, 0xfca5a5, 0.2);

    this.ballsText = this.add.text(295, 105, this.ballsLeft.toString(), {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold',
      stroke: '#7f1d1d',
      strokeThickness: 3
    }).setOrigin(0.5);

    // 공 아이콘 레이블
    const ballsLabel = this.add.text(295, 130, '⚪', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 콤보 카운터 (화면 중앙 상단, 처음엔 숨김)
    this.comboText = this.add.text(187.5, 200, '', {
      fontSize: '48px',
      color: '#fbbf24',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold',
      stroke: '#f59e0b',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0).setDepth(1000);

    // 핀볼 테이블 - 3D 원근감
    // 외곽 그림자 (깊이감)
    const tableShadow = this.add.rectangle(187.5, 413, 365, 520, 0x000000, 0.5);

    // 테이블 테두리 (금속 프레임)
    const tableBorder = this.add.rectangle(187.5, 410, 360, 515, 0x8b7355);
    tableBorder.setStrokeStyle(3, 0x654321);

    // 내부 테두리 (입체감)
    const tableInnerBorder = this.add.rectangle(187.5, 410, 350, 505, 0xa0826d);
    tableInnerBorder.setStrokeStyle(2, 0x8b7355);

    // 테이블 표면 - 다크 블루 그라디언트 (원근감)
    const tableBg1 = this.add.rectangle(187.5, 280, 340, 200, 0x1e3a8a);
    const tableBg2 = this.add.rectangle(187.5, 430, 340, 200, 0x1e40af);
    const tableBg3 = this.add.rectangle(187.5, 580, 340, 150, 0x2563eb);

    // 테이블 하이라이트 (유리 반사)
    const tableHighlight = this.add.rectangle(187.5, 250, 320, 80, 0xffffff, 0.1);

    // 핀볼 테이블 테두리
    this.createWalls();

    // 범퍼 생성
    this.createBumpers();

    // 레인 생성
    this.createLanes();

    // 플리퍼 생성
    this.createFlippers();

    // 공 생성 - 발사 구역에 배치
    this.ball = this.physics.add.image(337, 430, 'ball');
    this.ball.setBounce(0.8); // 적절한 바운스
    this.ball.setCollideWorldBounds(true);
    if (this.ball.body) {
      (this.ball.body as Phaser.Physics.Arcade.Body).setGravity(0, 600); // 조금 느린 중력
    }

    // 충돌 설정
    if (this.bumpers && this.ball) {
      this.physics.add.collider(this.ball, this.bumpers, this.hitBumper as any, undefined, this);
    }
    if (this.lanes && this.ball) {
      this.physics.add.overlap(this.ball, this.lanes, this.hitLane as any, undefined, this);
    }
    if (this.leftFlipper && this.ball) {
      this.physics.add.collider(this.ball, this.leftFlipper);
    }
    if (this.rightFlipper && this.ball) {
      this.physics.add.collider(this.ball, this.rightFlipper);
    }

    // 터치 컨트롤 버튼 생성
    this.createTouchControls();

    // 시작 안내
    const startOverlay = this.add.rectangle(187.5, 333.5, 375, 667, 0x000000, 0.7);
    const startText = this.add.text(187.5, 280, '핀볼 게임', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const instructionText = this.add.text(187.5, 340, '왼쪽/오른쪽 버튼으로\n플리퍼를 조작하세요', {
      fontSize: '16px',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    const startButton = this.add.rectangle(187.5, 420, 200, 50, 0x3b82f6);
    startButton.setInteractive();

    const buttonText = this.add.text(187.5, 420, '게임 시작', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    startButton.on('pointerdown', () => {
      this.startGame();
      startOverlay.destroy();
      startText.destroy();
      instructionText.destroy();
      startButton.destroy();
      buttonText.destroy();
    });
  }

  update() {
    if (!this.ball || !this.gameStarted || this.gameOver) return;

    // 슬로우 모션 업데이트
    if (this.isSlowMotion) {
      this.slowMotionDuration -= this.game.loop.delta;
      if (this.slowMotionDuration <= 0) {
        this.physics.world.timeScale = 1;
        this.isSlowMotion = false;
      }
    }

    // 트레일 효과 업데이트 (2프레임마다)
    this.trailUpdateCounter++;
    if (this.trailUpdateCounter >= 2) {
      this.trailUpdateCounter = 0;
      this.updateBallTrail();
    }

    // 공이 아래로 떨어지려 할 때 슬로우 모션
    if (this.ball.y > 580 && this.ball.y < 650 && !this.isSlowMotion) {
      const velocity = this.ball.body as Phaser.Physics.Arcade.Body;
      if (velocity.velocity.y > 200) {
        this.activateSlowMotion(600); // 0.6초 슬로우 모션
      }
    }

    // 공이 아래로 떨어졌는지 확인
    if (this.ball.y > 650) {
      this.loseBall();
    }
  }

  private createBallTexture() {
    const graphics = this.add.graphics();

    // 공 그림자 (3D 깊이감)
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillCircle(11, 12, 9);

    // 공 베이스 - 다크 그라디언트
    graphics.fillStyle(0x1e3a8a, 1);
    graphics.fillCircle(10, 10, 10);

    // 중간 레이어 (입체감)
    graphics.fillStyle(0x3b82f6, 1);
    graphics.fillCircle(10, 10, 8);

    // 밝은 레이어
    graphics.fillStyle(0x60a5fa, 1);
    graphics.fillCircle(9, 9, 6);

    // 하이라이트 1 (큰 반사광)
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(7, 7, 4);

    // 하이라이트 2 (작은 반짝임)
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(6, 6, 2);

    // 외곽 테두리 (윤곽)
    graphics.lineStyle(1, 0x1e40af, 0.8);
    graphics.strokeCircle(10, 10, 10);

    graphics.generateTexture('ball', 22, 22);
    graphics.destroy();
  }

  private createFlipperTexture() {
    const graphics = this.add.graphics();

    // 플리퍼 그림자 (3D 깊이)
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRoundedRect(1, 3, 75, 20, 10);

    // 플리퍼 베이스 - 다크 실버 (금속)
    graphics.fillStyle(0x475569, 1);
    graphics.fillRoundedRect(0, 0, 75, 20, 10);

    // 중간 레이어 - 실버
    graphics.fillStyle(0x64748b, 1);
    graphics.fillRoundedRect(2, 2, 71, 16, 8);

    // 밝은 레이어 - 밝은 실버
    graphics.fillStyle(0x94a3b8, 1);
    graphics.fillRoundedRect(4, 4, 67, 12, 6);

    // 하이라이트 (금속 반사)
    graphics.fillStyle(0xcbd5e1, 1);
    graphics.fillRoundedRect(6, 5, 63, 6, 3);

    // 반사광 (빛나는 부분)
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillRoundedRect(10, 6, 40, 4, 2);

    // 외곽 테두리 (다크 메탈)
    graphics.lineStyle(2, 0x1e293b, 1);
    graphics.strokeRoundedRect(0, 0, 75, 20, 10);

    // 내부 테두리 (입체감)
    graphics.lineStyle(1, 0xe2e8f0, 0.5);
    graphics.strokeRoundedRect(3, 3, 69, 14, 7);

    graphics.generateTexture('flipper', 77, 24);
    graphics.destroy();
  }

  private createBumperTexture() {
    const graphics = this.add.graphics();

    // 범퍼 그림자 (3D 깊이)
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillCircle(22, 23, 19);

    // 범퍼 베이스 - 다크 레드
    graphics.fillStyle(0x991b1b, 1);
    graphics.fillCircle(20, 20, 20);

    // 중간 레이어 - 레드
    graphics.fillStyle(0xdc2626, 1);
    graphics.fillCircle(20, 20, 17);

    // 밝은 레이어 - 밝은 레드
    graphics.fillStyle(0xef4444, 1);
    graphics.fillCircle(19, 19, 14);

    // 하이라이트 레이어
    graphics.fillStyle(0xfca5a5, 1);
    graphics.fillCircle(18, 18, 10);

    // 중앙 밝은 부분
    graphics.fillStyle(0xfecaca, 1);
    graphics.fillCircle(17, 17, 6);

    // 반사광 1
    graphics.fillStyle(0xffffff, 0.7);
    graphics.fillCircle(15, 15, 4);

    // 반사광 2 (작은 반짝임)
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(14, 14, 2);

    // 외곽 테두리 (금속 링)
    graphics.lineStyle(3, 0x7f1d1d, 1);
    graphics.strokeCircle(20, 20, 20);

    // 내부 링 (입체감)
    graphics.lineStyle(1, 0xfee2e2, 0.5);
    graphics.strokeCircle(20, 20, 15);

    graphics.generateTexture('bumper', 44, 44);
    graphics.destroy();
  }

  private createWalls() {
    // ===== 핀볼 테이블 외벽 (메인 테두리) =====

    // 왼쪽 외벽 (전체 높이)
    const leftWallShadow = this.add.rectangle(24, 410, 10, 505, 0x000000, 0.3);
    const leftWall = this.add.rectangle(22, 410, 12, 505, 0x334155);
    const leftWallHighlight = this.add.rectangle(20, 410, 4, 505, 0x64748b);
    leftWall.setStrokeStyle(2, 0x1e293b);
    this.physics.add.existing(leftWall, true);

    // 오른쪽 외벽 (전체 높이)
    const rightWallShadow = this.add.rectangle(355, 410, 10, 505, 0x000000, 0.3);
    const rightWall = this.add.rectangle(353, 410, 12, 505, 0x334155);
    const rightWallHighlight = this.add.rectangle(351, 410, 4, 505, 0x64748b);
    rightWall.setStrokeStyle(2, 0x1e293b);
    this.physics.add.existing(rightWall, true);

    // 상단 외벽
    const topWallShadow = this.add.rectangle(187.5, 167, 310, 10, 0x000000, 0.3);
    const topWall = this.add.rectangle(187.5, 165, 310, 12, 0x334155);
    const topWallHighlight = this.add.rectangle(187.5, 163, 310, 4, 0x64748b);
    topWall.setStrokeStyle(2, 0x1e293b);
    this.physics.add.existing(topWall, true);

    // ===== 공 발사 구역 벽 =====

    // 발사 구역 배경 (어두운 그라디언트)
    const launchZoneBg1 = this.add.rectangle(337, 350, 35, 100, 0x1e3a8a, 0.8);
    const launchZoneBg2 = this.add.rectangle(337, 415, 35, 100, 0x1e40af, 0.8);

    // 발사 구역 바닥 패턴 (스프링이 있는 공간)
    const launchFloor = this.add.rectangle(337, 465, 35, 10, 0x475569);
    launchFloor.setStrokeStyle(1, 0x64748b);

    // 스프링/플런저 비주얼
    const plungerBase = this.add.rectangle(337, 550, 20, 150, 0x1e293b);
    plungerBase.setStrokeStyle(2, 0x334155);

    // 스프링 코일 표시 (여러 개의 수평선)
    for (let i = 0; i < 8; i++) {
      const springLine = this.add.rectangle(337, 485 + i * 15, 18, 2, 0xfbbf24);
      springLine.setAlpha(0.6);
    }

    // 플런저 손잡이 (상단)
    const plungerHandle = this.add.rectangle(337, 620, 25, 30, 0xef4444);
    plungerHandle.setStrokeStyle(2, 0xdc2626);
    const plungerHandleHighlight = this.add.rectangle(337, 615, 20, 10, 0xfca5a5, 0.6);

    // 발사 구역 오른쪽 세로 벽 (공이 대기하는 공간)
    const launchLaneShadow = this.add.rectangle(322, 350, 10, 230, 0x000000, 0.3);
    const launchLane = this.add.rectangle(320, 350, 12, 230, 0x334155);
    const launchLaneHighlight = this.add.rectangle(318, 350, 4, 230, 0x64748b);
    launchLane.setStrokeStyle(2, 0x1e293b);
    this.physics.add.existing(launchLane, true);

    // 발사 구역 하단 가로 벽 (발사대 상단)
    const launchBottomShadow = this.add.rectangle(337, 467, 40, 10, 0x000000, 0.3);
    const launchBottom = this.add.rectangle(337, 465, 40, 12, 0x334155);
    const launchBottomHighlight = this.add.rectangle(337, 463, 40, 4, 0x64748b);
    launchBottom.setStrokeStyle(2, 0x1e293b);
    this.physics.add.existing(launchBottom, true);

    // 발사 방향 안내 화살표 (위쪽)
    const arrowGraphics = this.add.graphics();
    arrowGraphics.fillStyle(0xfbbf24, 0.7);
    arrowGraphics.fillTriangle(
      337, 380,     // 상단 꼭지점
      330, 395,     // 좌측 하단
      344, 395      // 우측 하단
    );
    arrowGraphics.setAlpha(0.8);

    // 화살표 깜빡임 애니메이션
    this.tweens.add({
      targets: arrowGraphics,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // ===== 플레이 구역 하단 각진 벽 (공을 플리퍼로 유도) =====

    // 왼쪽 하단 각진 벽 (플리퍼 위쪽)
    const leftSlopeShadow = this.add.rectangle(75, 545, 105, 10, 0x000000, 0.3);
    leftSlopeShadow.rotation = -0.52; // 약 30도
    const leftSlope = this.add.rectangle(73, 543, 105, 12, 0x334155);
    const leftSlopeHighlight = this.add.rectangle(71, 541, 105, 4, 0x64748b);
    leftSlopeHighlight.rotation = -0.52;
    leftSlope.setStrokeStyle(2, 0x1e293b);
    leftSlope.rotation = -0.52;
    this.physics.add.existing(leftSlope, true);

    // 오른쪽 하단 각진 벽 (플리퍼 위쪽)
    const rightSlopeShadow = this.add.rectangle(300, 545, 105, 10, 0x000000, 0.3);
    rightSlopeShadow.rotation = 0.52; // 약 30도
    const rightSlope = this.add.rectangle(302, 543, 105, 12, 0x334155);
    const rightSlopeHighlight = this.add.rectangle(304, 541, 105, 4, 0x64748b);
    rightSlopeHighlight.rotation = 0.52;
    rightSlope.setStrokeStyle(2, 0x1e293b);
    rightSlope.rotation = 0.52;
    this.physics.add.existing(rightSlope, true);

    // ===== 중앙 하단 구분 벽 (플리퍼 사이) =====

    // 플리퍼 사이의 작은 벽 (공이 중앙으로 떨어지는 것 유도)
    const centerDividerShadow = this.add.rectangle(187.5, 612, 40, 10, 0x000000, 0.3);
    const centerDivider = this.add.rectangle(187.5, 610, 40, 12, 0x334155);
    const centerDividerHighlight = this.add.rectangle(187.5, 608, 40, 4, 0x64748b);
    centerDivider.setStrokeStyle(2, 0x1e293b);
    this.physics.add.existing(centerDivider, true);

    // ===== 상단 곡선 벽 (범퍼 구역 경계) =====

    // 왼쪽 상단 곡선 가이드
    const topLeftCurveShadow = this.add.rectangle(65, 215, 80, 10, 0x000000, 0.3);
    topLeftCurveShadow.rotation = -0.35;
    const topLeftCurve = this.add.rectangle(63, 213, 80, 12, 0x334155);
    const topLeftCurveHighlight = this.add.rectangle(61, 211, 80, 4, 0x64748b);
    topLeftCurveHighlight.rotation = -0.35;
    topLeftCurve.setStrokeStyle(2, 0x1e293b);
    topLeftCurve.rotation = -0.35;
    this.physics.add.existing(topLeftCurve, true);

    // 오른쪽 상단 곡선 가이드
    const topRightCurveShadow = this.add.rectangle(310, 215, 80, 10, 0x000000, 0.3);
    topRightCurveShadow.rotation = 0.35;
    const topRightCurve = this.add.rectangle(312, 213, 80, 12, 0x334155);
    const topRightCurveHighlight = this.add.rectangle(314, 211, 80, 4, 0x64748b);
    topRightCurveHighlight.rotation = 0.35;
    topRightCurve.setStrokeStyle(2, 0x1e293b);
    topRightCurve.rotation = 0.35;
    this.physics.add.existing(topRightCurve, true);
  }

  private createBumpers() {
    this.bumpers = this.physics.add.staticGroup();

    // 핀볼 테이블 중앙 범퍼 배치 (클래식 핀볼 스타일)
    const bumperPositions = [
      // 상단 중앙 (높은 점수)
      { x: 187.5, y: 260, points: 100 },

      // 중앙 좌우
      { x: 120, y: 320, points: 50 },
      { x: 255, y: 320, points: 50 },

      // 중앙 아래 좌우
      { x: 90, y: 390, points: 30 },
      { x: 285, y: 390, points: 30 },

      // 하단 좌우 (플리퍼 위쪽)
      { x: 110, y: 470, points: 20 },
      { x: 265, y: 470, points: 20 }
    ];

    bumperPositions.forEach(pos => {
      const bumper = this.bumpers!.create(pos.x, pos.y, 'bumper') as Phaser.Physics.Arcade.Sprite;
      bumper.setData('points', pos.points);
      bumper.setCircle(20);
      bumper.setScale(1.0);
    });
  }

  private createLanes() {
    this.lanes = this.physics.add.staticGroup();

    // 왼쪽 레인 (좁은 통로)
    const leftLaneBg = this.add.rectangle(50, 450, 20, 200, 0x10b981, 0.5);
    leftLaneBg.setDepth(-1);

    const leftLane = this.add.rectangle(50, 450, 20, 200, 0x10b981, 0);
    this.physics.add.existing(leftLane, true);
    this.lanes.add(leftLane);
    leftLane.setData('type', 'lane');
    leftLane.setData('side', 'left');

    // 왼쪽 레인 텍스트 (세로)
    const leftLaneText = this.add.text(50, 450, 'LANE', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setRotation(-Math.PI / 2);

    // 오른쪽 레인 (좁은 통로) - 발사 레인 왼쪽에 배치
    const rightLaneBg = this.add.rectangle(300, 350, 15, 150, 0xfbbf24, 0.5);
    rightLaneBg.setDepth(-1);

    const rightLane = this.add.rectangle(300, 350, 15, 150, 0xfbbf24, 0);
    this.physics.add.existing(rightLane, true);
    this.lanes.add(rightLane);
    rightLane.setData('type', 'lane');
    rightLane.setData('side', 'right');

    // 오른쪽 레인 텍스트 (세로)
    const rightLaneText = this.add.text(300, 350, 'BONUS', {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setRotation(-Math.PI / 2);
  }

  private createFlippers() {
    // 왼쪽 플리퍼
    this.leftFlipper = this.physics.add.image(120, 600, 'flipper');
    this.leftFlipper.setImmovable(true);
    if (this.leftFlipper.body) {
      (this.leftFlipper.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }

    // 오른쪽 플리퍼
    this.rightFlipper = this.physics.add.image(255, 600, 'flipper');
    this.rightFlipper.setImmovable(true);
    if (this.rightFlipper.body) {
      (this.rightFlipper.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }
  }

  private createTouchControls() {
    // 왼쪽 플리퍼 버튼 - 귀여운 통통한 스타일
    const leftButtonBg = this.add.rectangle(90, 647, 155, 58, 0xc084fc);
    leftButtonBg.setDepth(-1);

    this.leftFlipperButton = this.add.rectangle(90, 643, 155, 58, 0xa855f7);
    this.leftFlipperButton.setInteractive();
    this.leftFlipperButton.setStrokeStyle(4, 0x9333ea);

    // 내부 하이라이트
    const leftInner = this.add.rectangle(90, 638, 145, 40, 0xd8b4fe, 0.3);

    const leftText = this.add.text(90, 643, '◀ LEFT', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold',
      stroke: '#7c3aed',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.leftFlipperButton.on('pointerdown', () => {
      this.activateFlipper('left');
      this.leftFlipperButton!.setFillStyle(0x7c3aed);
      this.leftFlipperButton!.setScale(0.97);
      leftText.setScale(0.97);
      leftInner.setScale(0.97);
    });

    this.leftFlipperButton.on('pointerup', () => {
      this.leftFlipperButton!.setFillStyle(0xa855f7);
      this.leftFlipperButton!.setScale(1);
      leftText.setScale(1);
      leftInner.setScale(1);
    });

    // 오른쪽 플리퍼 버튼
    const rightButtonBg = this.add.rectangle(285, 647, 155, 58, 0x34d399);
    rightButtonBg.setDepth(-1);

    this.rightFlipperButton = this.add.rectangle(285, 643, 155, 58, 0x10b981);
    this.rightFlipperButton.setInteractive();
    this.rightFlipperButton.setStrokeStyle(4, 0x059669);

    // 내부 하이라이트
    const rightInner = this.add.rectangle(285, 638, 145, 40, 0xa7f3d0, 0.3);

    const rightText = this.add.text(285, 643, 'RIGHT ▶', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold',
      stroke: '#047857',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.rightFlipperButton.on('pointerdown', () => {
      this.activateFlipper('right');
      this.rightFlipperButton!.setFillStyle(0x047857);
      this.rightFlipperButton!.setScale(0.97);
      rightText.setScale(0.97);
      rightInner.setScale(0.97);
    });

    this.rightFlipperButton.on('pointerup', () => {
      this.rightFlipperButton!.setFillStyle(0x10b981);
      this.rightFlipperButton!.setScale(1);
      rightText.setScale(1);
      rightInner.setScale(1);
    });
  }

  private startGame() {
    if (this.gameStarted) return;
    this.gameStarted = true;

    // 공에 초기 속도
    if (this.ball) {
      this.ball.setVelocity(Phaser.Math.Between(-50, 50), 200);
    }
  }

  private activateFlipper(side: 'left' | 'right') {
    if (!this.gameStarted || this.gameOver) return;

    const flipper = side === 'left' ? this.leftFlipper : this.rightFlipper;
    if (!flipper) return;

    // 플리퍼 작동 사운드 재생
    this.playSound('flipper');

    // 플리퍼 회전 애니메이션
    const targetRotation = side === 'left' ? -0.5 : 0.5;

    this.tweens.add({
      targets: flipper,
      rotation: targetRotation,
      duration: 50,
      yoyo: true,
      ease: 'Power2'
    });

    // 플리퍼에 맞았을 때 공에 강한 힘 가하기
    if (this.ball && this.physics.overlap(this.ball, flipper)) {
      const velocityY = -600;
      const velocityX = side === 'left' ? -300 : 300;
      this.ball.setVelocity(velocityX, velocityY);
    }
  }

  private hitBumper(
    ball: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    bumper: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const bumperObj = bumper as Phaser.GameObjects.GameObject;
    const ballObj = ball as Phaser.Physics.Arcade.Image;
    const bumperSprite = bumper as Phaser.GameObjects.Image;

    // ===== 콤보 시스템 =====
    const currentTime = this.time.now;
    const timeSinceLastHit = currentTime - this.lastHitTime;

    // 1초 이내에 연속 히트하면 콤보 증가
    if (timeSinceLastHit < 1000 && this.lastHitTime > 0) {
      this.comboCount++;
    } else {
      this.comboCount = 1; // 콤보 리셋
    }

    this.lastHitTime = currentTime;

    // 콤보 타이머 리셋
    if (this.comboTimer) {
      this.comboTimer.destroy();
    }

    // 1초 후 콤보 리셋
    this.comboTimer = this.time.delayedCall(1000, () => {
      this.comboCount = 0;
      this.comboText?.setAlpha(0);
    });

    // ===== 점수 계산 (콤보 보너스) =====
    const basePoints = bumperObj.getData('points') || 10;
    const comboMultiplier = this.comboCount;
    const totalPoints = basePoints * comboMultiplier;

    this.score += totalPoints;
    this.scoreText?.setText(this.score.toString());

    // 범퍼 충돌 사운드 재생
    this.playSound('bumper');

    // ===== 점수 팝업 애니메이션 =====
    const scorePopup = this.add.text(bumperSprite.x, bumperSprite.y - 30, `+${totalPoints}`, {
      fontSize: '32px',
      color: '#fbbf24',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold',
      stroke: '#f59e0b',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(1000);

    // 팝업 애니메이션 (위로 올라가며 사라짐)
    this.tweens.add({
      targets: scorePopup,
      y: bumperSprite.y - 80,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        scorePopup.destroy();
      }
    });

    // ===== 콤보 표시 (2콤보 이상일 때만) =====
    if (this.comboCount >= 2 && this.comboText) {
      this.comboText.setText(`${this.comboCount}x COMBO!`);
      this.comboText.setAlpha(1);

      // 콤보 사운드 재생
      this.playSound('combo');

      // 콤보 텍스트 펄스 애니메이션
      this.tweens.add({
        targets: this.comboText,
        scale: 1.2,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
    }

    // ===== 범퍼 깜빡임 효과 =====
    this.tweens.add({
      targets: bumperSprite,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true
    });

    // ===== 범퍼 네온 글로우 효과 =====
    const glowCircle = this.add.circle(bumperSprite.x, bumperSprite.y, 30, 0xfbbf24, 0.8);
    glowCircle.setDepth(100);

    // 글로우 펄스 애니메이션 (커지며 사라짐)
    this.tweens.add({
      targets: glowCircle,
      scale: 2.5,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        glowCircle.destroy();
      }
    });

    // ===== 파티클 효과 (충돌 시 반짝임) =====
    const particles = this.add.particles(bumperSprite.x, bumperSprite.y, 'ball', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 300,
      quantity: 8,
      tint: [0xffffff, 0x60a5fa, 0xef4444]
    });

    // 파티클 자동 제거
    this.time.delayedCall(300, () => {
      particles.destroy();
    });

    // ===== 공에 추가 속도 =====
    const angle = Phaser.Math.Angle.Between(
      bumperSprite.x,
      bumperSprite.y,
      ballObj.x,
      ballObj.y
    );
    const force = 300;
    ballObj.setVelocity(
      Math.cos(angle) * force,
      Math.sin(angle) * force
    );
  }

  private hitLane(
    ball: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    lane: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const laneObj = lane as Phaser.GameObjects.GameObject;
    const laneSprite = lane as Phaser.GameObjects.Rectangle;

    // 중복 히트 방지 (레인은 한 번만 점수 획득)
    if (laneObj.getData('hit')) {
      return;
    }
    laneObj.setData('hit', true);

    // 레인 보너스 점수
    const bonusPoints = this.laneBonus * this.laneMultiplier;
    this.score += bonusPoints;
    this.scoreText?.setText(this.score.toString());

    // 레인 배율 증가 (다음번 레인 히트 시 더 높은 점수)
    this.laneMultiplier++;

    // 레인 통과 팝업
    const lanePopup = this.add.text(laneSprite.x, laneSprite.y - 40, `LANE BONUS!\n+${bonusPoints}`, {
      fontSize: '24px',
      color: '#10b981',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold',
      stroke: '#047857',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5).setDepth(1000);

    // 팝업 애니메이션
    this.tweens.add({
      targets: lanePopup,
      y: laneSprite.y - 80,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => {
        lanePopup.destroy();
      }
    });

    // 레인 깜빡임 효과
    this.tweens.add({
      targets: laneSprite,
      alpha: 1,
      duration: 200,
      yoyo: true,
      repeat: 3
    });

    // 파티클 효과
    const particles = this.add.particles(laneSprite.x, laneSprite.y, 'ball', {
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 12,
      tint: [0x10b981, 0xfbbf24, 0xffffff]
    });

    this.time.delayedCall(500, () => {
      particles.destroy();
    });

    // 일정 시간 후 다시 히트 가능하게 설정
    this.time.delayedCall(2000, () => {
      laneObj.setData('hit', false);
    });
  }

  private loseBall() {
    this.ballsLeft--;
    this.ballsText?.setText(this.ballsLeft.toString());

    // 공 잃음 사운드 재생
    this.playSound('lose');

    if (this.ballsLeft === 0) {
      this.endGame();
    } else {
      // 공 리셋
      this.gameStarted = false;
      if (this.ball) {
        this.ball.setPosition(187.5, 150);
        this.ball.setVelocity(0, 0);
      }

      // 재시작
      const continueText = this.add.text(187.5, 333.5, '터치하여 계속', {
        fontSize: '20px',
        color: '#3b82f6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.time.delayedCall(1000, () => {
        this.input.once('pointerdown', () => {
          this.startGame();
          continueText.destroy();
        });
      });
    }
  }

  private async endGame() {
    if (this.gameOver) return;
    this.gameOver = true;

    // 공 멈추기
    if (this.ball) {
      this.ball.setVelocity(0, 0);
      if (this.ball.body) {
        (this.ball.body as Phaser.Physics.Arcade.Body).setGravity(0, 0);
      }
    }

    // 결과 화면
    const overlay = this.add.rectangle(187.5, 333.5, 375, 667, 0x000000, 0.8);

    const resultText = this.add.text(187.5, 220, '게임 종료', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    const scoreText = this.add.text(187.5, 280, `최종 점수: ${this.score}`, {
      fontSize: '24px',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      align: 'center'
    }).setOrigin(0.5);

    // 이름 입력
    const namePrompt = this.add.text(187.5, 350, '이름을 입력하세요:', {
      fontSize: '16px',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
    }).setOrigin(0.5);

    // HTML 입력 요소
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = '플레이어 이름';
    inputElement.maxLength = 20;
    inputElement.style.cssText = `
      position: absolute;
      left: 50%;
      top: 380px;
      transform: translateX(-50%);
      width: 280px;
      padding: 12px;
      font-size: 16px;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      text-align: center;
      background: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
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
      padding: 12px 40px;
      font-size: 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
    `;
    document.getElementById('game-container')?.appendChild(submitButton);

    const submitScore = async () => {
      const playerName = inputElement.value.trim() || '익명';

      // 점수 제출
      const success = await submitGameScore({
        gameType: 'pinball',
        playerName,
        score: this.score
      });

      // 입력 요소 제거
      inputElement.remove();
      submitButton.remove();

      if (success) {
        namePrompt.setText('점수가 제출되었습니다!');
        namePrompt.setColor('#10b981');
      } else {
        namePrompt.setText('점수 제출 실패');
        namePrompt.setColor('#ef4444');
      }

      // 재시작 버튼
      this.time.delayedCall(2000, () => {
        const restartButton = this.add.rectangle(187.5, 520, 200, 50, 0x3b82f6);
        restartButton.setInteractive();

        const restartText = this.add.text(187.5, 520, '다시 시작', {
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          fontStyle: 'bold'
        }).setOrigin(0.5);

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

  // ===== 트레일 효과 시스템 =====
  private updateBallTrail() {
    if (!this.ball) return;

    // 새 트레일 포인트 생성
    const trail = this.add.graphics();
    trail.fillStyle(0x60a5fa, 0.6);
    trail.fillCircle(this.ball.x, this.ball.y, 8);
    trail.setDepth(-1);

    // 트레일 페이드 아웃 애니메이션
    this.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        trail.destroy();
      }
    });

    this.ballTrail.push(trail);

    // 트레일 길이 제한
    if (this.ballTrail.length > this.MAX_TRAIL_LENGTH) {
      const oldTrail = this.ballTrail.shift();
      if (oldTrail) {
        oldTrail.destroy();
      }
    }
  }

  // ===== 슬로우 모션 시스템 =====
  private activateSlowMotion(duration: number) {
    this.isSlowMotion = true;
    this.slowMotionDuration = duration;
    this.physics.world.timeScale = 0.5; // 시간을 절반으로 느리게

    // 슬로우 모션 비주얼 효과
    const slowMotionOverlay = this.add.rectangle(187.5, 333.5, 375, 667, 0x4facfe, 0.1);
    slowMotionOverlay.setDepth(999);

    this.tweens.add({
      targets: slowMotionOverlay,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        slowMotionOverlay.destroy();
      }
    });
  }

  // ===== 사운드 효과 시스템 =====
  private playSound(type: 'bumper' | 'flipper' | 'combo' | 'lose') {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'bumper':
        // 범퍼 충돌 - 짧고 높은 톤
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        break;

      case 'flipper':
        // 플리퍼 작동 - 빠른 클릭 소리
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
        break;

      case 'combo':
        // 콤보 달성 - 상승하는 톤
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;

      case 'lose':
        // 공 잃음 - 하강하는 톤
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        break;
    }
  }
}
