/**
 * Table Entity - 핀볼 테이블
 * 벽, 범퍼, 타겟 등 테이블 구성 요소
 */

import * as PIXI from 'pixi.js';
import { PhysicsWorld, type PhysicsBody } from '../core/PhysicsWorld';
import { Renderer } from '../core/Renderer';
import { VIEWPORT, PHYSICS, RENDER, TABLE_LAYOUT, GAME, HAPTICS } from '../utils/Constants';

export interface BumperData {
  physicsBody: PhysicsBody;
  graphics: PIXI.Container;
  x: number;
  y: number;
  radius: number;
  points: number;
}

export interface TargetData {
  physicsBody: PhysicsBody;
  graphics: PIXI.Graphics;
  x: number;
  y: number;
  isHit: boolean;
  points: number;
}

export class Table {
  private physics: PhysicsWorld;
  private renderer: Renderer;

  // 구성 요소
  private walls: PhysicsBody[] = [];
  private bumpers: BumperData[] = [];
  private targets: TargetData[] = [];
  private drainSensor: PhysicsBody | null = null;

  // 콜백
  private onBumperHit?: (points: number, x: number, y: number) => void;
  private onTargetHit?: (points: number, x: number, y: number) => void;
  private onDrain?: () => void;

  constructor(physics: PhysicsWorld, renderer: Renderer) {
    this.physics = physics;
    this.renderer = renderer;
  }

  /**
   * 테이블 초기화 (모든 구성 요소 생성)
   */
  init(): void {
    this.createBackground();
    this.createWalls();
    this.createBumpers();
    this.createTargets();
    this.createDrainSensor();
    this.createPlungerLane();

    console.log('[Table] Initialized');
  }

  /**
   * 배경 생성
   */
  private createBackground(): void {
    // 메인 테이블 배경
    const tableBg = new PIXI.Graphics();
    tableBg.rect(
      VIEWPORT.TABLE_LEFT,
      VIEWPORT.TABLE_TOP,
      VIEWPORT.TABLE_RIGHT - VIEWPORT.TABLE_LEFT,
      VIEWPORT.TABLE_BOTTOM - VIEWPORT.TABLE_TOP
    );
    tableBg.fill({ color: 0x1e3a8a, alpha: 0.9 });
    this.renderer.addToGame(tableBg);

    // 테이블 테두리 장식
    const border = new PIXI.Graphics();
    border.rect(
      VIEWPORT.TABLE_LEFT,
      VIEWPORT.TABLE_TOP,
      VIEWPORT.TABLE_RIGHT - VIEWPORT.TABLE_LEFT,
      VIEWPORT.TABLE_BOTTOM - VIEWPORT.TABLE_TOP
    );
    border.stroke({ color: 0x60a5fa, width: 8 });
    this.renderer.addToGame(border);

    // 플레이 영역 내부 장식선
    const innerLines = new PIXI.Graphics();
    innerLines.moveTo(VIEWPORT.TABLE_LEFT + 50, VIEWPORT.TABLE_TOP + 100);
    innerLines.lineTo(VIEWPORT.TABLE_LEFT + 50, VIEWPORT.TABLE_BOTTOM - 300);
    innerLines.moveTo(VIEWPORT.TABLE_RIGHT - 150, VIEWPORT.TABLE_TOP + 100);
    innerLines.lineTo(VIEWPORT.TABLE_RIGHT - 150, VIEWPORT.TABLE_BOTTOM - 300);
    innerLines.stroke({ color: 0x3b82f6, width: 3, alpha: 0.5 });
    this.renderer.addToGame(innerLines);
  }

  /**
   * 벽 생성
   */
  private createWalls(): void {
    const { TABLE_LEFT, TABLE_RIGHT, TABLE_TOP, TABLE_BOTTOM } = VIEWPORT;
    const wallThickness = 30;

    // 상단 벽
    this.createWall(
      (TABLE_LEFT + TABLE_RIGHT) / 2,
      TABLE_TOP,
      TABLE_RIGHT - TABLE_LEFT,
      wallThickness
    );

    // 좌측 벽 (상단부)
    this.createWall(
      TABLE_LEFT,
      (TABLE_TOP + TABLE_BOTTOM * 0.6) / 2,
      wallThickness,
      TABLE_BOTTOM * 0.6 - TABLE_TOP
    );

    // 우측 벽 (발사대 영역 제외)
    this.createWall(
      TABLE_RIGHT - 100,
      (TABLE_TOP + TABLE_BOTTOM * 0.5) / 2,
      wallThickness,
      TABLE_BOTTOM * 0.5 - TABLE_TOP
    );

    // 좌측 하단 경사 벽 (플리퍼로 유도)
    this.createAngledWall(
      TABLE_LEFT + 80,
      TABLE_BOTTOM - 350,
      200,
      wallThickness,
      -0.6 // 약 -35도
    );

    // 우측 하단 경사 벽 (플리퍼로 유도)
    this.createAngledWall(
      TABLE_RIGHT - 180,
      TABLE_BOTTOM - 350,
      200,
      wallThickness,
      0.6 // 약 35도
    );

    // 플리퍼 사이 중앙 작은 벽
    this.createWall(
      (TABLE_LEFT + TABLE_RIGHT) / 2,
      TABLE_BOTTOM - 120,
      80,
      wallThickness
    );

    // 발사대 왼쪽 벽
    this.createWall(
      TABLE_RIGHT - 100,
      TABLE_BOTTOM - 200,
      wallThickness,
      400
    );

    console.log('[Table] Walls created:', this.walls.length);
  }

  /**
   * 단일 벽 생성
   */
  private createWall(x: number, y: number, width: number, height: number): void {
    const physicsBody = this.physics.createWall(x, y, width, height);
    this.walls.push(physicsBody);

    // 벽 그래픽
    const graphics = this.renderer.createRoundedRect(width, height, 5, 0x475569);
    graphics.position.set(x, y);
    this.renderer.addToGame(graphics);
  }

  /**
   * 경사 벽 생성
   */
  private createAngledWall(x: number, y: number, width: number, height: number, angle: number): void {
    const physicsBody = this.physics.createWall(x, y, width, height, angle);
    this.walls.push(physicsBody);

    // 경사 벽 그래픽
    const graphics = this.renderer.createRoundedRect(width, height, 5, 0x475569);
    graphics.position.set(x, y);
    graphics.rotation = angle;
    this.renderer.addToGame(graphics);
  }

  /**
   * 범퍼 생성
   */
  private createBumpers(): void {
    TABLE_LAYOUT.BUMPERS.forEach((bumperConfig, index) => {
      const { x, y, radius } = bumperConfig;

      // 물리 바디
      const physicsBody = this.physics.createBumper(x, y, radius);

      // 그래픽
      const graphics = this.renderer.createBumper(radius);
      graphics.position.set(x, y);
      this.renderer.addToGame(graphics);

      // 범퍼 데이터 저장
      const bumperData: BumperData = {
        physicsBody,
        graphics,
        x,
        y,
        radius,
        points: GAME.SCORE.BUMPER_BASE * (index < 2 ? 2 : 1), // 상단 범퍼는 2배 점수
      };
      this.bumpers.push(bumperData);

      // 충돌 콜백 등록
      this.physics.onCollision(physicsBody.collider.handle, () => {
        this.handleBumperHit(bumperData);
      });
    });

    console.log('[Table] Bumpers created:', this.bumpers.length);
  }

  /**
   * 범퍼 충돌 처리
   */
  private handleBumperHit(bumper: BumperData): void {
    // 범퍼 애니메이션 (스케일 펄스)
    const originalScale = bumper.graphics.scale.x;
    bumper.graphics.scale.set(1.3);

    // 파티클 효과
    this.renderer.createParticleEffect(
      bumper.x,
      bumper.y,
      RENDER.COLORS.BUMPER_ACTIVE,
      15
    );

    // 점수 팝업
    this.renderer.createScorePopup(bumper.x, bumper.y - 50, bumper.points);

    // 햅틱 피드백
    if ('vibrate' in navigator) {
      navigator.vibrate(HAPTICS.BUMP);
    }

    // 스케일 복원
    setTimeout(() => {
      bumper.graphics.scale.set(originalScale);
    }, 100);

    // 콜백 호출
    this.onBumperHit?.(bumper.points, bumper.x, bumper.y);
  }

  /**
   * 타겟 생성
   */
  private createTargets(): void {
    TABLE_LAYOUT.TARGETS.forEach((targetConfig) => {
      const { x, y } = targetConfig;
      const width = 60;
      const height = 20;

      // 물리 센서 (충돌 감지만)
      const physicsBody = this.physics.createSensor(x, y, width, height);

      // 그래픽
      const graphics = this.renderer.createRoundedRect(width, height, 5, RENDER.COLORS.WARNING);
      graphics.position.set(x, y);
      this.renderer.addToGame(graphics);

      // 타겟 데이터
      const targetData: TargetData = {
        physicsBody,
        graphics,
        x,
        y,
        isHit: false,
        points: GAME.SCORE.TARGET_BASE,
      };
      this.targets.push(targetData);

      // 충돌 콜백
      this.physics.onCollision(physicsBody.collider.handle, () => {
        this.handleTargetHit(targetData);
      });
    });

    console.log('[Table] Targets created:', this.targets.length);
  }

  /**
   * 타겟 충돌 처리
   */
  private handleTargetHit(target: TargetData): void {
    if (target.isHit) return; // 이미 맞은 타겟

    target.isHit = true;

    // 타겟 색상 변경
    target.graphics.clear();
    target.graphics.roundRect(-30, -10, 60, 20, 5);
    target.graphics.fill({ color: RENDER.COLORS.SUCCESS });

    // 파티클 효과
    this.renderer.createParticleEffect(target.x, target.y, RENDER.COLORS.SUCCESS, 10);

    // 점수 팝업
    this.renderer.createScorePopup(target.x, target.y - 30, target.points, RENDER.COLORS.SUCCESS);

    // 햅틱 피드백
    if ('vibrate' in navigator) {
      navigator.vibrate(HAPTICS.SCORE);
    }

    // 콜백 호출
    this.onTargetHit?.(target.points, target.x, target.y);

    // 일정 시간 후 리셋
    setTimeout(() => {
      this.resetTarget(target);
    }, 3000);
  }

  /**
   * 타겟 리셋
   */
  private resetTarget(target: TargetData): void {
    target.isHit = false;
    target.graphics.clear();
    target.graphics.roundRect(-30, -10, 60, 20, 5);
    target.graphics.fill({ color: RENDER.COLORS.WARNING });
  }

  /**
   * 드레인 센서 생성 (공이 빠지는 영역)
   */
  private createDrainSensor(): void {
    const { x, y, width, height } = TABLE_LAYOUT.DRAIN;

    this.drainSensor = this.physics.createSensor(x, y, width, height);

    // 드레인 영역 시각화 (디버그용, 실제로는 숨김)
    const graphics = this.renderer.createRect(width, height, RENDER.COLORS.DANGER, 0.3);
    graphics.position.set(x, y);
    this.renderer.addToGame(graphics);

    // 충돌 콜백
    this.physics.onCollision(this.drainSensor.collider.handle, () => {
      this.onDrain?.();
    });

    console.log('[Table] Drain sensor created');
  }

  /**
   * 발사대 레인 생성
   */
  private createPlungerLane(): void {
    const { PLUNGER, BALL_START } = TABLE_LAYOUT;

    // 발사대 배경
    const laneBg = new PIXI.Graphics();
    laneBg.rect(
      VIEWPORT.TABLE_RIGHT - 90,
      VIEWPORT.TABLE_TOP + 200,
      80,
      VIEWPORT.TABLE_BOTTOM - VIEWPORT.TABLE_TOP - 250
    );
    laneBg.fill({ color: 0x1e293b, alpha: 0.8 });
    this.renderer.addToGame(laneBg);

    // 발사대 스프링 표시
    const spring = new PIXI.Graphics();
    for (let i = 0; i < 8; i++) {
      spring.rect(PLUNGER.x - 20, PLUNGER.y - 100 + i * 20, 40, 3);
      spring.fill({ color: RENDER.COLORS.WARNING, alpha: 0.6 });
    }
    this.renderer.addToGame(spring);

    // 발사 방향 화살표
    const arrow = new PIXI.Graphics();
    arrow.moveTo(BALL_START.x, BALL_START.y - 80);
    arrow.lineTo(BALL_START.x - 15, BALL_START.y - 50);
    arrow.lineTo(BALL_START.x + 15, BALL_START.y - 50);
    arrow.closePath();
    arrow.fill({ color: RENDER.COLORS.WARNING, alpha: 0.7 });
    this.renderer.addToGame(arrow);

    // 화살표 깜빡임 애니메이션
    let alpha = 0.7;
    let increasing = false;
    const animateArrow = () => {
      if (increasing) {
        alpha += 0.02;
        if (alpha >= 0.9) increasing = false;
      } else {
        alpha -= 0.02;
        if (alpha <= 0.3) increasing = true;
      }
      arrow.alpha = alpha;
      requestAnimationFrame(animateArrow);
    };
    animateArrow();
  }

  /**
   * 콜백 설정
   */
  setCallbacks(callbacks: {
    onBumperHit?: (points: number, x: number, y: number) => void;
    onTargetHit?: (points: number, x: number, y: number) => void;
    onDrain?: () => void;
  }): void {
    this.onBumperHit = callbacks.onBumperHit;
    this.onTargetHit = callbacks.onTargetHit;
    this.onDrain = callbacks.onDrain;
  }

  /**
   * 모든 타겟 리셋
   */
  resetAllTargets(): void {
    this.targets.forEach((target) => this.resetTarget(target));
  }

  /**
   * 모든 타겟이 맞았는지 확인
   */
  areAllTargetsHit(): boolean {
    return this.targets.every((target) => target.isHit);
  }

  /**
   * 정리
   */
  destroy(): void {
    // 벽 제거
    this.walls.forEach((wall) => {
      this.physics.removeBody(wall.rigidBody);
    });
    this.walls = [];

    // 범퍼 제거
    this.bumpers.forEach((bumper) => {
      this.physics.removeCollisionCallback(bumper.physicsBody.collider.handle);
      this.physics.removeBody(bumper.physicsBody.rigidBody);
      this.renderer.remove(bumper.graphics);
    });
    this.bumpers = [];

    // 타겟 제거
    this.targets.forEach((target) => {
      this.physics.removeCollisionCallback(target.physicsBody.collider.handle);
      this.physics.removeBody(target.physicsBody.rigidBody);
      this.renderer.remove(target.graphics);
    });
    this.targets = [];

    // 드레인 센서 제거
    if (this.drainSensor) {
      this.physics.removeCollisionCallback(this.drainSensor.collider.handle);
      this.physics.removeBody(this.drainSensor.rigidBody);
      this.drainSensor = null;
    }

    console.log('[Table] Destroyed');
  }
}
