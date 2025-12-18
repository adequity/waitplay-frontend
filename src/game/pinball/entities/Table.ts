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
    const { TABLE_LEFT, TABLE_RIGHT, TABLE_TOP, TABLE_BOTTOM } = VIEWPORT;
    const centerX = (TABLE_LEFT + TABLE_RIGHT) / 2;

    // 메인 테이블 배경 (그라데이션 효과)
    const tableBg = new PIXI.Graphics();
    tableBg.rect(
      TABLE_LEFT - 20,
      TABLE_TOP - 20,
      TABLE_RIGHT - TABLE_LEFT + 40,
      TABLE_BOTTOM - TABLE_TOP + 40
    );
    tableBg.fill({ color: 0x0f172a });
    this.renderer.addToGame(tableBg);

    // 플레이 영역 배경
    const playArea = new PIXI.Graphics();
    playArea.rect(
      TABLE_LEFT,
      TABLE_TOP,
      TABLE_RIGHT - TABLE_LEFT - 100, // 발사대 레인 제외
      TABLE_BOTTOM - TABLE_TOP
    );
    playArea.fill({ color: 0x1e3a8a, alpha: 0.95 });
    this.renderer.addToGame(playArea);

    // 테이블 테두리 (네온 효과)
    const border = new PIXI.Graphics();
    border.rect(
      TABLE_LEFT,
      TABLE_TOP,
      TABLE_RIGHT - TABLE_LEFT - 100,
      TABLE_BOTTOM - TABLE_TOP
    );
    border.stroke({ color: 0x60a5fa, width: 6 });
    this.renderer.addToGame(border);

    // 외부 글로우 테두리
    const outerGlow = new PIXI.Graphics();
    outerGlow.rect(
      TABLE_LEFT - 5,
      TABLE_TOP - 5,
      TABLE_RIGHT - TABLE_LEFT - 90,
      TABLE_BOTTOM - TABLE_TOP + 10
    );
    outerGlow.stroke({ color: 0x3b82f6, width: 3, alpha: 0.4 });
    this.renderer.addToGame(outerGlow);

    // 중앙 장식 패턴
    const centerPattern = new PIXI.Graphics();
    // 큰 원
    centerPattern.circle(centerX - 50, TABLE_TOP + 950, 120);
    centerPattern.stroke({ color: 0x4f46e5, width: 4, alpha: 0.3 });
    // 중간 원
    centerPattern.circle(centerX - 50, TABLE_TOP + 950, 80);
    centerPattern.stroke({ color: 0x6366f1, width: 3, alpha: 0.4 });
    // 작은 원
    centerPattern.circle(centerX - 50, TABLE_TOP + 950, 40);
    centerPattern.fill({ color: 0x4f46e5, alpha: 0.2 });
    this.renderer.addToGame(centerPattern);

    // 상단 로고 영역
    const logoArea = new PIXI.Graphics();
    logoArea.roundRect(centerX - 150, TABLE_TOP + 50, 200, 80, 15);
    logoArea.fill({ color: 0x1e1b4b, alpha: 0.8 });
    logoArea.stroke({ color: 0x6366f1, width: 2 });
    this.renderer.addToGame(logoArea);

    // 로고 텍스트
    const logoText = new PIXI.Text({
      text: 'PINBALL',
      style: {
        fontFamily: 'Arial Black, Arial',
        fontSize: 36,
        fontWeight: 'bold',
        fill: 0xfbbf24,
        letterSpacing: 4,
      },
    });
    logoText.anchor.set(0.5);
    logoText.position.set(centerX - 50, TABLE_TOP + 90);
    this.renderer.addToGame(logoText);

    // 플리퍼 영역 바닥 강조
    const flipperZone = new PIXI.Graphics();
    flipperZone.rect(
      TABLE_LEFT + 50,
      TABLE_BOTTOM - 250,
      TABLE_RIGHT - TABLE_LEFT - 200,
      200
    );
    flipperZone.fill({ color: 0x172554, alpha: 0.6 });
    this.renderer.addToGame(flipperZone);

    // 사이드 장식 라인
    const sideLines = new PIXI.Graphics();
    // 좌측 레인 라인
    sideLines.moveTo(TABLE_LEFT + 115, TABLE_TOP + 150);
    sideLines.lineTo(TABLE_LEFT + 115, TABLE_BOTTOM - 400);
    sideLines.stroke({ color: 0x22d3ee, width: 3, alpha: 0.5 });
    // 우측 레인 라인
    sideLines.moveTo(TABLE_RIGHT - 195, TABLE_TOP + 150);
    sideLines.lineTo(TABLE_RIGHT - 195, TABLE_BOTTOM - 400);
    sideLines.stroke({ color: 0x22d3ee, width: 3, alpha: 0.5 });
    this.renderer.addToGame(sideLines);

    // 점수 배수 영역 표시
    const multiplierZones = new PIXI.Graphics();
    for (let i = 0; i < 3; i++) {
      const y = TABLE_TOP + 300 + i * 150;
      multiplierZones.roundRect(TABLE_LEFT + 130, y, 50, 25, 5);
      multiplierZones.fill({ color: 0xf59e0b, alpha: 0.3 });
      multiplierZones.roundRect(TABLE_RIGHT - 280, y, 50, 25, 5);
      multiplierZones.fill({ color: 0xf59e0b, alpha: 0.3 });
    }
    this.renderer.addToGame(multiplierZones);
  }

  /**
   * 벽 생성
   */
  private createWalls(): void {
    const { TABLE_LEFT, TABLE_RIGHT, TABLE_TOP, TABLE_BOTTOM } = VIEWPORT;
    const wallThickness = 25;
    const plungerLaneWidth = 80; // 발사대 레인 너비
    const plungerLaneX = TABLE_RIGHT - plungerLaneWidth / 2 - 10;

    // ===== 외벽 =====

    // 상단 벽
    this.createWall(
      (TABLE_LEFT + TABLE_RIGHT) / 2,
      TABLE_TOP - wallThickness / 2,
      TABLE_RIGHT - TABLE_LEFT,
      wallThickness
    );

    // 좌측 전체 벽
    this.createWall(
      TABLE_LEFT - wallThickness / 2,
      (TABLE_TOP + TABLE_BOTTOM) / 2,
      wallThickness,
      TABLE_BOTTOM - TABLE_TOP
    );

    // 우측 벽 (상단 - 발사대 입구까지)
    this.createWall(
      TABLE_RIGHT + wallThickness / 2,
      (TABLE_TOP + 300) / 2 + TABLE_TOP / 2,
      wallThickness,
      300
    );

    // ===== 발사대 레인 벽 =====

    // 발사대 왼쪽 세로 벽 (메인 영역과 분리)
    this.createWall(
      plungerLaneX - plungerLaneWidth / 2,
      TABLE_TOP + 600,
      wallThickness,
      TABLE_BOTTOM - TABLE_TOP - 400
    );

    // 발사대 오른쪽 벽
    this.createWall(
      TABLE_RIGHT + wallThickness / 2,
      (TABLE_TOP + 300 + TABLE_BOTTOM) / 2,
      wallThickness,
      TABLE_BOTTOM - TABLE_TOP - 300
    );

    // 발사대 레인 하단 막음벽 (공이 아래로 빠지지 않게)
    this.createWall(
      plungerLaneX,
      TABLE_BOTTOM - wallThickness / 2 + 20,
      plungerLaneWidth + wallThickness,
      wallThickness
    );

    // 발사대 레인 상단 곡선 입구 (좌측으로 꺾이는 벽)
    this.createAngledWall(
      plungerLaneX - plungerLaneWidth / 2 - 30,
      TABLE_TOP + 280,
      120,
      wallThickness,
      0.8
    );

    // ===== 플리퍼 영역 벽 =====

    // 좌측 하단 경사 벽 (플리퍼로 유도)
    this.createAngledWall(
      TABLE_LEFT + 130,
      TABLE_BOTTOM - 320,
      280,
      wallThickness,
      -0.55
    );

    // 우측 하단 경사 벽 (플리퍼로 유도) - 발사대 앞까지
    this.createAngledWall(
      plungerLaneX - plungerLaneWidth / 2 - 160,
      TABLE_BOTTOM - 320,
      250,
      wallThickness,
      0.55
    );

    // 좌측 플리퍼 옆 작은 벽 (아웃레인 방지)
    this.createWall(
      TABLE_LEFT + wallThickness,
      TABLE_BOTTOM - 150,
      wallThickness,
      150
    );

    // 우측 플리퍼 옆 작은 벽 (아웃레인 방지)
    this.createWall(
      plungerLaneX - plungerLaneWidth / 2 - wallThickness * 2,
      TABLE_BOTTOM - 150,
      wallThickness,
      150
    );

    // 플리퍼 사이 중앙 삼각 구조물
    this.createWall(
      540,
      TABLE_BOTTOM - 80,
      60,
      25
    );

    // ===== 상단 레인 벽 =====

    // 좌측 상단 안쪽 벽 (레인 형성)
    this.createWall(
      TABLE_LEFT + 100,
      TABLE_TOP + 350,
      wallThickness,
      500
    );

    // 우측 상단 안쪽 벽 (레인 형성)
    this.createWall(
      plungerLaneX - plungerLaneWidth / 2 - 80,
      TABLE_TOP + 350,
      wallThickness,
      500
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
    const plungerLaneWidth = 80;
    const plungerLaneX = VIEWPORT.TABLE_RIGHT - plungerLaneWidth / 2 - 10;

    // 발사대 레인 배경
    const laneBg = new PIXI.Graphics();
    laneBg.rect(
      plungerLaneX - plungerLaneWidth / 2 + 12,
      VIEWPORT.TABLE_TOP + 280,
      plungerLaneWidth - 24,
      VIEWPORT.TABLE_BOTTOM - VIEWPORT.TABLE_TOP - 300
    );
    laneBg.fill({ color: 0x0f172a, alpha: 0.9 });
    this.renderer.addToGame(laneBg);

    // 발사대 스프링 표시
    const spring = new PIXI.Graphics();
    for (let i = 0; i < 6; i++) {
      const yPos = PLUNGER.y - 60 + i * 15;
      spring.rect(PLUNGER.x - 15, yPos, 30, 4);
      spring.fill({ color: RENDER.COLORS.WARNING, alpha: 0.7 - i * 0.08 });
    }
    this.renderer.addToGame(spring);

    // 발사 방향 화살표 (여러 개)
    const arrowContainer = new PIXI.Container();
    for (let i = 0; i < 3; i++) {
      const arrow = new PIXI.Graphics();
      const yOffset = i * 40;
      arrow.moveTo(BALL_START.x, BALL_START.y - 120 - yOffset);
      arrow.lineTo(BALL_START.x - 12, BALL_START.y - 90 - yOffset);
      arrow.lineTo(BALL_START.x + 12, BALL_START.y - 90 - yOffset);
      arrow.closePath();
      arrow.fill({ color: RENDER.COLORS.WARNING, alpha: 0.8 - i * 0.2 });
      arrowContainer.addChild(arrow);
    }
    this.renderer.addToGame(arrowContainer);

    // 화살표 깜빡임 애니메이션
    let alpha = 0.8;
    let increasing = false;
    const animateArrow = () => {
      if (increasing) {
        alpha += 0.015;
        if (alpha >= 0.9) increasing = false;
      } else {
        alpha -= 0.015;
        if (alpha <= 0.4) increasing = true;
      }
      arrowContainer.alpha = alpha;
      requestAnimationFrame(animateArrow);
    };
    animateArrow();

    // 공 시작 위치 표시
    const startMarker = new PIXI.Graphics();
    startMarker.circle(BALL_START.x, BALL_START.y, 25);
    startMarker.stroke({ color: RENDER.COLORS.ACCENT, width: 2, alpha: 0.5 });
    this.renderer.addToGame(startMarker);
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
