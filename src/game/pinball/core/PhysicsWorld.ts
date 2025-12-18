/**
 * PhysicsWorld - Rapier.js 물리 월드 관리
 * WASM 기반 고성능 2D 물리 엔진
 */

import type RAPIER from '@dimforge/rapier2d';
import { PHYSICS } from '../utils/Constants';

// Rapier 모듈 타입 정의
type RapierModule = typeof import('@dimforge/rapier2d');

export interface PhysicsBody {
  rigidBody: RAPIER.RigidBody;
  collider: RAPIER.Collider;
}

export class PhysicsWorld {
  private RAPIER: RapierModule | null = null;
  private world: RAPIER.World | null = null;
  private eventQueue: RAPIER.EventQueue | null = null;
  private initialized: boolean = false;

  // 충돌 콜백
  private collisionCallbacks: Map<number, (other: RAPIER.Collider) => void> = new Map();

  /**
   * Rapier WASM 초기화 (비동기)
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // WASM 모듈 동적 로드
    this.RAPIER = await import('@dimforge/rapier2d');

    // 중력 설정 (핀볼 테이블 경사각 시뮬레이션)
    const gravity = { x: PHYSICS.GRAVITY_X, y: PHYSICS.GRAVITY_Y };
    this.world = new this.RAPIER.World(gravity);

    // 이벤트 큐 (충돌 감지용)
    this.eventQueue = new this.RAPIER.EventQueue(true);

    this.initialized = true;
    console.log('[PhysicsWorld] Rapier initialized');
  }

  /**
   * 물리 월드 스텝 (프레임마다 호출)
   */
  step(deltaTime: number): void {
    if (!this.world || !this.eventQueue) return;

    // 물리 시뮬레이션 진행
    this.world.step(this.eventQueue);

    // 충돌 이벤트 처리
    this.processCollisions();
  }

  /**
   * 충돌 이벤트 처리
   */
  private processCollisions(): void {
    if (!this.eventQueue || !this.world) return;

    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      if (!started) return; // 충돌 시작만 처리

      const collider1 = this.world!.getCollider(handle1);
      const collider2 = this.world!.getCollider(handle2);

      if (!collider1 || !collider2) return;

      // 등록된 콜백 실행
      const callback1 = this.collisionCallbacks.get(handle1);
      const callback2 = this.collisionCallbacks.get(handle2);

      if (callback1) callback1(collider2);
      if (callback2) callback2(collider1);
    });
  }

  /**
   * 동적 공 생성 (CCD 활성화)
   */
  createBall(x: number, y: number, radius: number): PhysicsBody {
    if (!this.world || !this.RAPIER) throw new Error('PhysicsWorld not initialized');

    // RigidBody 생성 (동적)
    const rigidBodyDesc = this.RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, y)
      .setCcdEnabled(PHYSICS.BALL.CCD_ENABLED) // 연속 충돌 감지
      .setLinearDamping(PHYSICS.BALL.LINEAR_DAMPING)
      .setAngularDamping(PHYSICS.BALL.ANGULAR_DAMPING);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    // Collider 생성 (원형)
    const colliderDesc = this.RAPIER.ColliderDesc.ball(radius)
      .setDensity(PHYSICS.BALL.DENSITY)
      .setRestitution(PHYSICS.BALL.RESTITUTION)
      .setFriction(PHYSICS.BALL.FRICTION)
      .setActiveEvents(this.RAPIER.ActiveEvents.COLLISION_EVENTS);

    const collider = this.world.createCollider(colliderDesc, rigidBody);

    return { rigidBody, collider };
  }

  /**
   * 플리퍼 생성 (키네마틱)
   */
  createFlipper(
    x: number,
    y: number,
    isLeft: boolean
  ): PhysicsBody {
    if (!this.world || !this.RAPIER) throw new Error('PhysicsWorld not initialized');

    const { LENGTH, WIDTH, REST_ANGLE, PIVOT_OFFSET } = PHYSICS.FLIPPER;

    // 초기 각도 설정
    const angle = isLeft ? REST_ANGLE : -REST_ANGLE;

    // RigidBody 생성 (키네마틱 - 위치 기반)
    const rigidBodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(x, y)
      .setRotation(angle);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    // Collider 생성 (캡슐형)
    const halfLength = (LENGTH - WIDTH) / 2;
    const colliderDesc = this.RAPIER.ColliderDesc.capsule(halfLength, WIDTH / 2)
      .setRestitution(PHYSICS.FLIPPER.RESTITUTION)
      .setFriction(PHYSICS.FLIPPER.FRICTION)
      .setActiveEvents(this.RAPIER.ActiveEvents.COLLISION_EVENTS);

    // 피벗 오프셋 적용 (회전 중심 조정)
    const offsetX = isLeft ? PIVOT_OFFSET : -PIVOT_OFFSET;
    colliderDesc.setTranslation(offsetX, 0);

    const collider = this.world.createCollider(colliderDesc, rigidBody);

    return { rigidBody, collider };
  }

  /**
   * 범퍼 생성 (정적, 높은 반발력)
   */
  createBumper(x: number, y: number, radius: number): PhysicsBody {
    if (!this.world || !this.RAPIER) throw new Error('PhysicsWorld not initialized');

    // RigidBody 생성 (정적)
    const rigidBodyDesc = this.RAPIER.RigidBodyDesc.fixed()
      .setTranslation(x, y);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    // Collider 생성 (원형, 높은 반발력)
    const colliderDesc = this.RAPIER.ColliderDesc.ball(radius)
      .setRestitution(PHYSICS.BUMPER.RESTITUTION)
      .setFriction(0.1)
      .setActiveEvents(this.RAPIER.ActiveEvents.COLLISION_EVENTS);

    const collider = this.world.createCollider(colliderDesc, rigidBody);

    return { rigidBody, collider };
  }

  /**
   * 벽 생성 (정적, 직사각형)
   */
  createWall(x: number, y: number, width: number, height: number, angle: number = 0): PhysicsBody {
    if (!this.world || !this.RAPIER) throw new Error('PhysicsWorld not initialized');

    const rigidBodyDesc = this.RAPIER.RigidBodyDesc.fixed()
      .setTranslation(x, y)
      .setRotation(angle);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    const colliderDesc = this.RAPIER.ColliderDesc.cuboid(width / 2, height / 2)
      .setRestitution(PHYSICS.WALL.RESTITUTION)
      .setFriction(PHYSICS.WALL.FRICTION);

    const collider = this.world.createCollider(colliderDesc, rigidBody);

    return { rigidBody, collider };
  }

  /**
   * 다각형 벽 생성 (정적)
   */
  createPolygonWall(x: number, y: number, vertices: Float32Array): PhysicsBody {
    if (!this.world || !this.RAPIER) throw new Error('PhysicsWorld not initialized');

    const rigidBodyDesc = this.RAPIER.RigidBodyDesc.fixed()
      .setTranslation(x, y);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    const colliderDesc = this.RAPIER.ColliderDesc.convexHull(vertices);
    if (!colliderDesc) throw new Error('Failed to create convex hull');

    colliderDesc.setRestitution(PHYSICS.WALL.RESTITUTION);
    colliderDesc.setFriction(PHYSICS.WALL.FRICTION);

    const collider = this.world.createCollider(colliderDesc, rigidBody);

    return { rigidBody, collider };
  }

  /**
   * 센서 영역 생성 (충돌 감지만, 물리 반응 없음)
   */
  createSensor(x: number, y: number, width: number, height: number): PhysicsBody {
    if (!this.world || !this.RAPIER) throw new Error('PhysicsWorld not initialized');

    const rigidBodyDesc = this.RAPIER.RigidBodyDesc.fixed()
      .setTranslation(x, y);

    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    const colliderDesc = this.RAPIER.ColliderDesc.cuboid(width / 2, height / 2)
      .setSensor(true)
      .setActiveEvents(this.RAPIER.ActiveEvents.COLLISION_EVENTS);

    const collider = this.world.createCollider(colliderDesc, rigidBody);

    return { rigidBody, collider };
  }

  /**
   * 충돌 콜백 등록
   */
  onCollision(colliderHandle: number, callback: (other: RAPIER.Collider) => void): void {
    this.collisionCallbacks.set(colliderHandle, callback);
  }

  /**
   * 충돌 콜백 제거
   */
  removeCollisionCallback(colliderHandle: number): void {
    this.collisionCallbacks.delete(colliderHandle);
  }

  /**
   * RigidBody에 힘 가하기
   */
  applyForce(body: RAPIER.RigidBody, forceX: number, forceY: number): void {
    body.applyImpulse({ x: forceX, y: forceY }, true);
  }

  /**
   * RigidBody 위치 가져오기
   */
  getPosition(body: RAPIER.RigidBody): { x: number; y: number } {
    const translation = body.translation();
    return { x: translation.x, y: translation.y };
  }

  /**
   * RigidBody 회전 가져오기
   */
  getRotation(body: RAPIER.RigidBody): number {
    return body.rotation();
  }

  /**
   * RigidBody 속도 가져오기
   */
  getVelocity(body: RAPIER.RigidBody): { x: number; y: number } {
    const vel = body.linvel();
    return { x: vel.x, y: vel.y };
  }

  /**
   * RigidBody 속도 설정
   */
  setVelocity(body: RAPIER.RigidBody, vx: number, vy: number): void {
    body.setLinvel({ x: vx, y: vy }, true);
  }

  /**
   * 키네마틱 바디 회전 설정 (플리퍼용)
   */
  setKinematicRotation(body: RAPIER.RigidBody, angle: number): void {
    const pos = body.translation();
    body.setNextKinematicRotation(angle);
  }

  /**
   * 중력 방향 변경 (Nudge 효과)
   */
  setGravity(x: number, y: number): void {
    if (!this.world) return;
    this.world.gravity = { x, y };
  }

  /**
   * 중력 초기화
   */
  resetGravity(): void {
    this.setGravity(PHYSICS.GRAVITY_X, PHYSICS.GRAVITY_Y);
  }

  /**
   * Body 제거
   */
  removeBody(body: RAPIER.RigidBody): void {
    if (!this.world) return;
    this.world.removeRigidBody(body);
  }

  /**
   * 월드 정리
   */
  destroy(): void {
    if (this.world) {
      this.world.free();
      this.world = null;
    }
    if (this.eventQueue) {
      this.eventQueue.free();
      this.eventQueue = null;
    }
    this.collisionCallbacks.clear();
    this.initialized = false;
    console.log('[PhysicsWorld] Destroyed');
  }

  /**
   * 초기화 여부 확인
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Rapier World 인스턴스 반환 (디버그용)
   */
  getWorld(): RAPIER.World | null {
    return this.world;
  }
}
