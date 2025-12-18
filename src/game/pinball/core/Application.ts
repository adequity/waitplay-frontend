/**
 * Application - Hyper-Pinball 메인 컨트롤러
 * 게임 루프, 상태 관리, 구성 요소 조율
 */

import { PhysicsWorld } from './PhysicsWorld';
import { Renderer } from './Renderer';
import { Ball } from '../entities/Ball';
import { Flipper, type FlipperSide } from '../entities/Flipper';
import { Table } from '../entities/Table';
import { InputManager } from '../managers/InputManager';
import { GAME, TABLE_LAYOUT, PHYSICS, VIEWPORT } from '../utils/Constants';

export type GameState = 'loading' | 'ready' | 'playing' | 'paused' | 'game_over';

export interface GameScore {
  score: number;
  balls: number;
  combo: number;
  maxCombo: number;
}

export interface GameCallbacks {
  onScoreUpdate?: (score: GameScore) => void;
  onStateChange?: (state: GameState) => void;
  onBallLost?: (ballsRemaining: number) => void;
  onGameOver?: (finalScore: number) => void;
  onReady?: () => void;
}

export class Application {
  // 코어 시스템
  private physics: PhysicsWorld;
  private renderer: Renderer;
  private inputManager: InputManager;

  // 엔티티
  private ball: Ball | null = null;
  private leftFlipper: Flipper | null = null;
  private rightFlipper: Flipper | null = null;
  private table: Table | null = null;

  // 게임 상태
  private state: GameState = 'loading';
  private score: GameScore = {
    score: 0,
    balls: GAME.INITIAL_BALLS,
    combo: 0,
    maxCombo: 0,
  };

  // 게임 루프
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;

  // 콤보 타이머
  private comboTimeoutId: number | null = null;

  // 콜백
  private callbacks: GameCallbacks = {};

  // 발사대 상태
  private plungerCharge: number = 0;
  private isChargingPlunger: boolean = false;

  constructor() {
    this.physics = new PhysicsWorld();
    this.renderer = new Renderer();
    this.inputManager = new InputManager();
  }

  /**
   * 게임 초기화 (비동기)
   */
  async init(canvas: HTMLCanvasElement): Promise<void> {
    console.log('[Application] Initializing...');

    try {
      // 물리 엔진 초기화 (WASM 로딩)
      await this.physics.init();

      // 렌더러 초기화
      await this.renderer.init(canvas);

      // 입력 매니저 초기화
      this.inputManager.init(canvas);

      // 테이블 생성
      this.table = new Table(this.physics, this.renderer);
      this.table.init();
      this.table.setCallbacks({
        onBumperHit: (points, x, y) => this.handleBumperHit(points, x, y),
        onTargetHit: (points, x, y) => this.handleTargetHit(points, x, y),
        onDrain: () => this.handleDrain(),
      });

      // 플리퍼 생성
      this.leftFlipper = new Flipper(
        this.physics,
        this.renderer,
        'left',
        TABLE_LAYOUT.LEFT_FLIPPER.x,
        TABLE_LAYOUT.LEFT_FLIPPER.y
      );
      this.leftFlipper.init();

      this.rightFlipper = new Flipper(
        this.physics,
        this.renderer,
        'right',
        TABLE_LAYOUT.RIGHT_FLIPPER.x,
        TABLE_LAYOUT.RIGHT_FLIPPER.y
      );
      this.rightFlipper.init();

      // 공 생성 (아직 스폰하지 않음)
      this.ball = new Ball(this.physics, this.renderer);

      // 입력 콜백 설정
      this.setupInputCallbacks();

      // 상태 변경
      this.setState('ready');
      this.callbacks.onReady?.();

      console.log('[Application] Initialized successfully');
    } catch (error) {
      console.error('[Application] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * 입력 콜백 설정
   */
  private setupInputCallbacks(): void {
    this.inputManager.setCallbacks({
      // 플리퍼 제어
      onLeftFlipperDown: () => {
        if (this.state === 'playing') {
          this.leftFlipper?.press();
        }
      },
      onLeftFlipperUp: () => {
        this.leftFlipper?.release();
      },
      onRightFlipperDown: () => {
        if (this.state === 'playing') {
          this.rightFlipper?.press();
        }
      },
      onRightFlipperUp: () => {
        this.rightFlipper?.release();
      },

      // 발사대 제어
      onPlungerStart: () => {
        if (this.state === 'ready' || (this.state === 'playing' && !this.ball?.isActive())) {
          this.startChargingPlunger();
        }
      },
      onPlungerRelease: () => {
        this.releasePlunger();
      },

      // 흔들기 (Nudge)
      onNudge: (x: number, y: number) => {
        if (this.state === 'playing') {
          this.handleNudge(x, y);
        }
      },

      // 틸트 경고
      onTiltWarning: () => {
        if (this.state === 'playing') {
          this.handleTiltWarning();
        }
      },

      // 틸트 (게임 오버 조건)
      onTilt: () => {
        if (this.state === 'playing') {
          this.handleTilt();
        }
      },
    });
  }

  /**
   * 게임 시작
   */
  start(): void {
    if (this.state !== 'ready' && this.state !== 'paused') {
      console.warn('[Application] Cannot start game in current state:', this.state);
      return;
    }

    this.isRunning = true;
    this.lastTime = performance.now();

    // 첫 공 스폰 (ready 상태에서 시작하는 경우)
    if (this.state === 'ready') {
      this.spawnBall();
    }

    this.setState('playing');
    this.gameLoop();

    console.log('[Application] Game started');
  }

  /**
   * 게임 일시정지
   */
  pause(): void {
    if (this.state !== 'playing') return;

    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.setState('paused');
    console.log('[Application] Game paused');
  }

  /**
   * 게임 재개
   */
  resume(): void {
    if (this.state !== 'paused') return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.setState('playing');
    this.gameLoop();

    console.log('[Application] Game resumed');
  }

  /**
   * 게임 재시작
   */
  restart(): void {
    // 점수 초기화
    this.score = {
      score: 0,
      balls: GAME.INITIAL_BALLS,
      combo: 0,
      maxCombo: 0,
    };
    this.callbacks.onScoreUpdate?.(this.score);

    // 공 초기화
    if (this.ball) {
      this.ball.destroy();
      this.ball = new Ball(this.physics, this.renderer);
    }

    // 타겟 리셋
    this.table?.resetAllTargets();

    // 발사대 상태 초기화
    this.plungerCharge = 0;
    this.isChargingPlunger = false;

    // 틸트 상태 리셋
    this.inputManager.resetTilt();

    // 게임 상태 리셋
    this.setState('ready');

    console.log('[Application] Game restarted');
  }

  /**
   * 공 스폰
   */
  private spawnBall(): void {
    if (!this.ball) return;

    this.ball.spawn(TABLE_LAYOUT.BALL_START.x, TABLE_LAYOUT.BALL_START.y);
    console.log('[Application] Ball spawned');
  }

  /**
   * 발사대 충전 시작
   */
  private startChargingPlunger(): void {
    if (this.isChargingPlunger) return;

    this.isChargingPlunger = true;
    this.plungerCharge = 0;

    // 공이 없으면 스폰
    if (!this.ball?.isActive()) {
      this.spawnBall();
    }
  }

  /**
   * 발사대 해제 (발사)
   */
  private releasePlunger(): void {
    if (!this.isChargingPlunger || !this.ball) return;

    // 충전량에 따른 발사 힘 계산
    const chargeRatio = Math.min(this.plungerCharge / 1000, 1); // 최대 1초 충전
    const force = PHYSICS.PLUNGER.MIN_FORCE +
      (PHYSICS.PLUNGER.MAX_FORCE - PHYSICS.PLUNGER.MIN_FORCE) * chargeRatio;

    // 공 발사 (위쪽으로)
    this.ball.launch(0, -force);

    this.isChargingPlunger = false;
    this.plungerCharge = 0;

    // 게임 상태를 playing으로 변경
    if (this.state === 'ready') {
      this.setState('playing');
    }

    console.log('[Application] Ball launched with force:', force);
  }

  /**
   * 게임 루프
   */
  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.05); // 최대 50ms
    this.lastTime = currentTime;

    this.update(deltaTime);

    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * 프레임 업데이트
   */
  private update(deltaTime: number): void {
    // 발사대 충전
    if (this.isChargingPlunger) {
      this.plungerCharge += PHYSICS.PLUNGER.CHARGE_RATE * deltaTime;
    }

    // 물리 시뮬레이션
    this.physics.step(deltaTime);

    // 플리퍼 업데이트
    this.leftFlipper?.update(deltaTime);
    this.rightFlipper?.update(deltaTime);

    // 공 업데이트
    this.ball?.update();

    // 렌더러 업데이트 (이펙트 등)
    this.renderer.update(deltaTime);

    // 드레인 체크
    if (this.ball?.isDrained()) {
      this.handleDrain();
    }
  }

  /**
   * 범퍼 충돌 처리
   */
  private handleBumperHit(points: number, x: number, y: number): void {
    this.addScore(points);
    this.incrementCombo();

    // 범퍼 반발력 추가 (물리 엔진 반발력 외 추가 힘)
    if (this.ball) {
      const ballPos = this.ball.getPosition();
      if (ballPos) {
        const dx = ballPos.x - x;
        const dy = ballPos.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const forceMultiplier = PHYSICS.BUMPER.FORCE_MULTIPLIER;

        this.ball.addVelocity(
          (dx / dist) * forceMultiplier,
          (dy / dist) * forceMultiplier
        );
      }
    }
  }

  /**
   * 타겟 충돌 처리
   */
  private handleTargetHit(points: number, x: number, y: number): void {
    this.addScore(points);
    this.incrementCombo();

    // 모든 타겟 히트 시 보너스
    if (this.table?.areAllTargetsHit()) {
      this.addScore(GAME.SCORE.LANE_BONUS);
      this.renderer.createScorePopup(
        (VIEWPORT.TABLE_LEFT + VIEWPORT.TABLE_RIGHT) / 2,
        VIEWPORT.TABLE_TOP + 300,
        GAME.SCORE.LANE_BONUS,
        0x10b981
      );
    }
  }

  /**
   * 드레인 처리 (공 손실)
   */
  private handleDrain(): void {
    if (!this.ball?.isActive()) return;

    // 공 비활성화
    this.ball.destroy();

    // 콤보 리셋
    this.resetCombo();

    // 남은 공 감소
    this.score.balls--;
    this.callbacks.onBallLost?.(this.score.balls);
    this.callbacks.onScoreUpdate?.(this.score);

    console.log('[Application] Ball drained, remaining:', this.score.balls);

    if (this.score.balls <= 0) {
      // 게임 오버
      this.gameOver();
    } else {
      // 새 공 생성 준비
      this.ball = new Ball(this.physics, this.renderer);
      // ready 상태는 아니지만 다음 발사 대기
    }
  }

  /**
   * 흔들기 처리
   */
  private handleNudge(x: number, y: number): void {
    // 일시적으로 중력 조정
    const nudgeX = x * 0.3;
    const nudgeY = y * 0.3;

    this.physics.setGravity(
      PHYSICS.GRAVITY_X + nudgeX,
      PHYSICS.GRAVITY_Y + nudgeY
    );

    // 100ms 후 중력 복원
    setTimeout(() => {
      this.physics.resetGravity();
    }, 100);
  }

  /**
   * 틸트 경고 처리
   */
  private handleTiltWarning(): void {
    // UI에 경고 표시 (콜백으로 처리)
    this.renderer.createScorePopup(
      (VIEWPORT.TABLE_LEFT + VIEWPORT.TABLE_RIGHT) / 2,
      (VIEWPORT.TABLE_TOP + VIEWPORT.TABLE_BOTTOM) / 2,
      0, // TILT WARNING 텍스트로 대체 필요
      0xef4444
    );

    // 햅틱 피드백
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  }

  /**
   * 틸트 처리 (현재 공 손실)
   */
  private handleTilt(): void {
    // 현재 공 즉시 드레인 처리
    if (this.ball?.isActive()) {
      this.handleDrain();
    }

    // 플리퍼 비활성화 잠시
    this.leftFlipper?.release();
    this.rightFlipper?.release();
  }

  /**
   * 점수 추가
   */
  private addScore(points: number): void {
    // 콤보 배수 적용
    const multiplier = Math.min(1 + this.score.combo * 0.1, GAME.MAX_COMBO_MULTIPLIER);
    const totalPoints = Math.floor(points * multiplier);

    this.score.score += totalPoints;
    this.callbacks.onScoreUpdate?.(this.score);
  }

  /**
   * 콤보 증가
   */
  private incrementCombo(): void {
    this.score.combo++;
    if (this.score.combo > this.score.maxCombo) {
      this.score.maxCombo = this.score.combo;
    }

    // 콤보 타이머 리셋
    if (this.comboTimeoutId !== null) {
      clearTimeout(this.comboTimeoutId);
    }

    this.comboTimeoutId = window.setTimeout(() => {
      this.resetCombo();
    }, GAME.COMBO_TIMEOUT);

    this.callbacks.onScoreUpdate?.(this.score);
  }

  /**
   * 콤보 리셋
   */
  private resetCombo(): void {
    this.score.combo = 0;
    if (this.comboTimeoutId !== null) {
      clearTimeout(this.comboTimeoutId);
      this.comboTimeoutId = null;
    }
    this.callbacks.onScoreUpdate?.(this.score);
  }

  /**
   * 게임 오버
   */
  private gameOver(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.setState('game_over');
    this.callbacks.onGameOver?.(this.score.score);

    console.log('[Application] Game Over! Final score:', this.score.score);
  }

  /**
   * 상태 변경
   */
  private setState(newState: GameState): void {
    if (this.state === newState) return;

    const oldState = this.state;
    this.state = newState;
    this.callbacks.onStateChange?.(newState);

    console.log('[Application] State changed:', oldState, '→', newState);
  }

  /**
   * 콜백 설정
   */
  setCallbacks(callbacks: GameCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * 현재 상태 반환
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * 현재 점수 반환
   */
  getScore(): GameScore {
    return { ...this.score };
  }

  /**
   * 정리
   */
  destroy(): void {
    // 게임 루프 중지
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // 콤보 타이머 정리
    if (this.comboTimeoutId !== null) {
      clearTimeout(this.comboTimeoutId);
      this.comboTimeoutId = null;
    }

    // 엔티티 정리
    this.ball?.destroy();
    this.leftFlipper?.destroy();
    this.rightFlipper?.destroy();
    this.table?.destroy();

    // 매니저 정리
    this.inputManager.destroy();

    // 코어 시스템 정리
    this.renderer.destroy();
    this.physics.destroy();

    console.log('[Application] Destroyed');
  }
}
