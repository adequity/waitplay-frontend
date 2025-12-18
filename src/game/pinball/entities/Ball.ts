/**
 * Ball Entity - 핀볼 공
 * 물리 + 그래픽 통합 엔티티
 */

import * as PIXI from 'pixi.js';
import type RAPIER from '@dimforge/rapier2d';
import { PhysicsWorld, type PhysicsBody } from '../core/PhysicsWorld';
import { Renderer } from '../core/Renderer';
import { PHYSICS, RENDER, TABLE_LAYOUT } from '../utils/Constants';

export class Ball {
  private physics: PhysicsWorld;
  private renderer: Renderer;
  private physicsBody: PhysicsBody | null = null;
  private graphics: PIXI.Container | null = null;

  // 트레일 효과용
  private trailPositions: { x: number; y: number }[] = [];
  private readonly MAX_TRAIL_LENGTH = RENDER.EFFECTS.TRAIL_LENGTH;

  // 상태
  private _isActive: boolean = false;

  constructor(physics: PhysicsWorld, renderer: Renderer) {
    this.physics = physics;
    this.renderer = renderer;
  }

  /**
   * 공 생성 및 초기화
   */
  spawn(x: number = TABLE_LAYOUT.BALL_START.x, y: number = TABLE_LAYOUT.BALL_START.y): void {
    // 기존 공 제거
    this.destroy();

    const radius = PHYSICS.BALL.RADIUS;

    // 물리 바디 생성
    this.physicsBody = this.physics.createBall(x, y, radius);

    // 그래픽 생성
    this.graphics = this.renderer.createBall(radius);
    this.graphics.position.set(x, y);
    this.renderer.addToGame(this.graphics);

    // 충돌 콜백 등록
    this.physics.onCollision(this.physicsBody.collider.handle, (other) => {
      this.onCollision(other);
    });

    this._isActive = true;
    this.trailPositions = [];

    console.log('[Ball] Spawned at', x, y);
  }

  /**
   * 공 발사 (플런저에서)
   */
  launch(forceX: number, forceY: number): void {
    if (!this.physicsBody) return;

    // 힘을 적용하여 발사
    const maxForce = PHYSICS.PLUNGER.MAX_FORCE;
    const clampedForceX = Math.max(-maxForce, Math.min(maxForce, forceX));
    const clampedForceY = Math.max(-maxForce, Math.min(maxForce, forceY));
    this.physics.applyForce(this.physicsBody.rigidBody, clampedForceX, clampedForceY);

    console.log('[Ball] Launched with force:', clampedForceX, clampedForceY);
  }

  /**
   * 매 프레임 업데이트
   */
  update(): void {
    if (!this._isActive || !this.physicsBody || !this.graphics) return;

    // 물리 위치를 그래픽에 동기화
    const pos = this.physics.getPosition(this.physicsBody.rigidBody);
    this.graphics.position.set(pos.x, pos.y);

    // 트레일 효과 업데이트
    this.updateTrail(pos.x, pos.y);

    // 속도에 따른 회전 효과 (시각적)
    const vel = this.physics.getVelocity(this.physicsBody.rigidBody);
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    if (speed > 10) {
      this.graphics.rotation += speed * 0.0001;
    }
  }

  /**
   * 트레일 효과 업데이트
   */
  private updateTrail(x: number, y: number): void {
    // 트레일 위치 추가
    this.trailPositions.push({ x, y });

    // 최대 길이 유지
    if (this.trailPositions.length > this.MAX_TRAIL_LENGTH) {
      this.trailPositions.shift();
    }

    // 속도가 빠를 때만 트레일 렌더링
    if (this.physicsBody) {
      const vel = this.physics.getVelocity(this.physicsBody.rigidBody);
      const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);

      if (speed > 200 && this.trailPositions.length > 2) {
        // 마지막 몇 개 위치에 트레일 그리기
        const trailIdx = Math.max(0, this.trailPositions.length - 3);
        const trailPos = this.trailPositions[trailIdx];
        const alpha = 0.3 * (speed / 1000);
        if (trailPos) {
          this.renderer.addTrailPoint(
            trailPos.x,
            trailPos.y,
            PHYSICS.BALL.RADIUS * 0.8,
            RENDER.COLORS.BALL,
            Math.min(alpha, 0.5)
          );
        }
      }
    }
  }

  /**
   * 충돌 처리
   */
  private onCollision(other: RAPIER.Collider): void {
    // 충돌 시 약간의 속도 증가 (게임 활력)
    // 실제 게임에서는 충돌 대상에 따라 다른 처리 필요
  }

  /**
   * 현재 위치 반환
   */
  getPosition(): { x: number; y: number } | null {
    if (!this.physicsBody) return null;
    return this.physics.getPosition(this.physicsBody.rigidBody);
  }

  /**
   * 현재 속도 반환
   */
  getVelocity(): { x: number; y: number } | null {
    if (!this.physicsBody) return null;
    return this.physics.getVelocity(this.physicsBody.rigidBody);
  }

  /**
   * 속도 설정 (Nudge 등에 사용)
   */
  addVelocity(vx: number, vy: number): void {
    if (!this.physicsBody) return;
    const current = this.physics.getVelocity(this.physicsBody.rigidBody);
    this.physics.setVelocity(
      this.physicsBody.rigidBody,
      current.x + vx,
      current.y + vy
    );
  }

  /**
   * 힘 가하기
   */
  applyForce(fx: number, fy: number): void {
    if (!this.physicsBody) return;
    this.physics.applyForce(this.physicsBody.rigidBody, fx, fy);
  }

  /**
   * 공이 드레인(하단)으로 떨어졌는지 확인
   */
  isDrained(): boolean {
    if (!this.physicsBody) return false;
    const pos = this.physics.getPosition(this.physicsBody.rigidBody);
    return pos.y > TABLE_LAYOUT.DRAIN.y + TABLE_LAYOUT.DRAIN.height;
  }

  /**
   * 활성 상태 확인
   */
  isActive(): boolean {
    return this._isActive;
  }

  /**
   * 물리 바디 반환 (충돌 식별용)
   */
  getColliderHandle(): number | null {
    return this.physicsBody?.collider.handle ?? null;
  }

  /**
   * 공 제거
   */
  destroy(): void {
    if (this.physicsBody) {
      this.physics.removeCollisionCallback(this.physicsBody.collider.handle);
      this.physics.removeBody(this.physicsBody.rigidBody);
      this.physicsBody = null;
    }

    if (this.graphics) {
      this.renderer.remove(this.graphics);
      this.graphics = null;
    }

    this._isActive = false;
    this.trailPositions = [];
  }
}
