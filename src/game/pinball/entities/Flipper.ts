/**
 * Flipper Entity - 핀볼 플리퍼
 * 터치 입력에 반응하여 공을 튕기는 메커니즘
 */

import * as PIXI from 'pixi.js';
import { PhysicsWorld, type PhysicsBody } from '../core/PhysicsWorld';
import { Renderer } from '../core/Renderer';
import { PHYSICS, HAPTICS } from '../utils/Constants';

export type FlipperSide = 'left' | 'right';

export class Flipper {
  private physics: PhysicsWorld;
  private renderer: Renderer;
  private physicsBody: PhysicsBody | null = null;
  private graphics: PIXI.Container | null = null;

  private side: FlipperSide;
  private x: number;
  private y: number;

  // 플리퍼 상태
  private isPressed: boolean = false;
  private currentAngle: number = 0;
  private targetAngle: number = 0;

  // 각도 설정
  private readonly restAngle: number;
  private readonly activeAngle: number;

  constructor(
    physics: PhysicsWorld,
    renderer: Renderer,
    side: FlipperSide,
    x: number,
    y: number
  ) {
    this.physics = physics;
    this.renderer = renderer;
    this.side = side;
    this.x = x;
    this.y = y;

    // 왼쪽/오른쪽에 따른 각도 설정
    if (side === 'left') {
      this.restAngle = PHYSICS.FLIPPER.REST_ANGLE;
      this.activeAngle = -PHYSICS.FLIPPER.ACTIVE_ANGLE;
    } else {
      this.restAngle = -PHYSICS.FLIPPER.REST_ANGLE;
      this.activeAngle = PHYSICS.FLIPPER.ACTIVE_ANGLE;
    }

    this.currentAngle = this.restAngle;
    this.targetAngle = this.restAngle;
  }

  /**
   * 플리퍼 초기화
   */
  init(): void {
    const { LENGTH, WIDTH } = PHYSICS.FLIPPER;

    // 물리 바디 생성
    this.physicsBody = this.physics.createFlipper(this.x, this.y, this.side === 'left');

    // 그래픽 생성
    this.graphics = this.renderer.createFlipper(LENGTH, WIDTH, this.side === 'left');
    this.graphics.position.set(this.x, this.y);
    this.graphics.rotation = this.restAngle;

    // 피벗 포인트 조정 (회전 중심)
    const pivotOffset = this.side === 'left' ? -LENGTH / 2 + PHYSICS.FLIPPER.PIVOT_OFFSET : LENGTH / 2 - PHYSICS.FLIPPER.PIVOT_OFFSET;
    this.graphics.pivot.set(pivotOffset, 0);

    this.renderer.addToGame(this.graphics);

    console.log(`[Flipper] ${this.side} initialized at`, this.x, this.y);
  }

  /**
   * 플리퍼 활성화 (버튼 누름)
   */
  press(): void {
    if (this.isPressed) return;

    this.isPressed = true;
    this.targetAngle = this.activeAngle;

    // 햅틱 피드백
    this.triggerHaptic();

    console.log(`[Flipper] ${this.side} pressed`);
  }

  /**
   * 플리퍼 비활성화 (버튼 뗌)
   */
  release(): void {
    if (!this.isPressed) return;

    this.isPressed = false;
    this.targetAngle = this.restAngle;

    console.log(`[Flipper] ${this.side} released`);
  }

  /**
   * 매 프레임 업데이트
   */
  update(deltaTime: number): void {
    if (!this.physicsBody || !this.graphics) return;

    // 목표 각도로 부드럽게 회전
    const angleDiff = this.targetAngle - this.currentAngle;
    const rotationSpeed = PHYSICS.FLIPPER.ANGULAR_VELOCITY * deltaTime;

    if (Math.abs(angleDiff) < rotationSpeed) {
      // 목표에 도달
      this.currentAngle = this.targetAngle;
    } else {
      // 목표 방향으로 회전
      this.currentAngle += Math.sign(angleDiff) * rotationSpeed;
    }

    // 물리 바디 각도 업데이트
    this.physics.setKinematicRotation(this.physicsBody.rigidBody, this.currentAngle);

    // 그래픽 동기화
    this.graphics.rotation = this.currentAngle;
  }

  /**
   * 햅틱 피드백 트리거
   */
  private triggerHaptic(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(HAPTICS.FLIP);
    }
  }

  /**
   * 플리퍼 측면 반환
   */
  getSide(): FlipperSide {
    return this.side;
  }

  /**
   * 눌림 상태 반환
   */
  isPressedState(): boolean {
    return this.isPressed;
  }

  /**
   * 현재 각도 반환
   */
  getAngle(): number {
    return this.currentAngle;
  }

  /**
   * 물리 바디 반환 (충돌 식별용)
   */
  getColliderHandle(): number | null {
    return this.physicsBody?.collider.handle ?? null;
  }

  /**
   * 정리
   */
  destroy(): void {
    if (this.physicsBody) {
      this.physics.removeBody(this.physicsBody.rigidBody);
      this.physicsBody = null;
    }

    if (this.graphics) {
      this.renderer.remove(this.graphics);
      this.graphics = null;
    }
  }
}
