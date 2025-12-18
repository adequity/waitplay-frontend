/**
 * InputManager - 터치, 자이로, 틸트 입력 관리
 * 화면 분할 터치 (왼쪽/오른쪽 플리퍼)
 * DeviceOrientation API (기울기 & 흔들기)
 * 틸트 감지 (과도한 흔들기 페널티)
 */

import { INPUT, GAME, HAPTICS, VIEWPORT } from '../utils/Constants';

export interface InputCallbacks {
  onLeftFlipperDown?: () => void;
  onLeftFlipperUp?: () => void;
  onRightFlipperDown?: () => void;
  onRightFlipperUp?: () => void;
  onPlungerStart?: () => void;
  onPlungerRelease?: () => void;
  onNudge?: (x: number, y: number) => void;
  onTiltWarning?: () => void;
  onTilt?: () => void;
}

interface TouchState {
  id: number;
  side: 'left' | 'right' | 'plunger';
  startX: number;
  startY: number;
}

export class InputManager {
  private canvas: HTMLCanvasElement | null = null;
  private callbacks: InputCallbacks = {};

  // 터치 상태
  private activeTouches: Map<number, TouchState> = new Map();
  private leftFlipperPressed: boolean = false;
  private rightFlipperPressed: boolean = false;

  // 자이로 상태
  private gyroSupported: boolean = false;
  private lastGyroX: number = 0;
  private lastGyroY: number = 0;
  private lastGyroZ: number = 0;
  private gyroBaseline: { beta: number; gamma: number } | null = null;

  // 틸트 상태
  private tiltWarnings: number = 0;
  private isTilted: boolean = false;
  private lastNudgeTime: number = 0;

  // 이벤트 핸들러 바인딩
  private boundHandleTouchStart: (e: TouchEvent) => void;
  private boundHandleTouchEnd: (e: TouchEvent) => void;
  private boundHandleTouchCancel: (e: TouchEvent) => void;
  private boundHandleDeviceOrientation: (e: DeviceOrientationEvent) => void;
  private boundHandleDeviceMotion: (e: DeviceMotionEvent) => void;
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    // 이벤트 핸들러 바인딩
    this.boundHandleTouchStart = this.handleTouchStart.bind(this);
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
    this.boundHandleTouchCancel = this.handleTouchCancel.bind(this);
    this.boundHandleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    this.boundHandleDeviceMotion = this.handleDeviceMotion.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * 입력 매니저 초기화
   */
  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;

    // 터치 이벤트 등록
    canvas.addEventListener('touchstart', this.boundHandleTouchStart, { passive: false });
    canvas.addEventListener('touchend', this.boundHandleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', this.boundHandleTouchCancel, { passive: false });

    // 키보드 이벤트 (데스크톱 테스트용)
    window.addEventListener('keydown', this.boundHandleKeyDown);
    window.addEventListener('keyup', this.boundHandleKeyUp);

    // 자이로스코프 초기화
    this.initGyroscope();

    console.log('[InputManager] Initialized');
  }

  /**
   * 자이로스코프 초기화
   */
  private async initGyroscope(): Promise<void> {
    // DeviceOrientationEvent 권한 요청 (iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          this.gyroSupported = true;
        }
      } catch (error) {
        console.warn('[InputManager] DeviceOrientation permission denied:', error);
      }
    } else if ('DeviceOrientationEvent' in window) {
      this.gyroSupported = true;
    }

    if (this.gyroSupported) {
      window.addEventListener('deviceorientation', this.boundHandleDeviceOrientation);
      window.addEventListener('devicemotion', this.boundHandleDeviceMotion);
      console.log('[InputManager] Gyroscope enabled');
    } else {
      console.log('[InputManager] Gyroscope not available');
    }
  }

  /**
   * 콜백 설정
   */
  setCallbacks(callbacks: InputCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * 터치 시작 처리
   */
  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();

    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches.item(i);
      if (!touch) continue;

      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const relativeX = x / rect.width;
      const relativeY = y / rect.height;

      // 터치 영역 판별
      let side: 'left' | 'right' | 'plunger';

      // 발사대 영역 (오른쪽 하단)
      if (relativeX > 0.85 && relativeY > 0.6) {
        side = 'plunger';
        this.callbacks.onPlungerStart?.();
      }
      // 왼쪽 영역
      else if (relativeX < INPUT.LEFT_ZONE_END) {
        side = 'left';
        if (!this.leftFlipperPressed) {
          this.leftFlipperPressed = true;
          this.callbacks.onLeftFlipperDown?.();
        }
      }
      // 오른쪽 영역
      else {
        side = 'right';
        if (!this.rightFlipperPressed) {
          this.rightFlipperPressed = true;
          this.callbacks.onRightFlipperDown?.();
        }
      }

      // 터치 상태 저장
      this.activeTouches.set(touch.identifier, {
        id: touch.identifier,
        side,
        startX: x,
        startY: y,
      });
    }
  }

  /**
   * 터치 종료 처리
   */
  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches.item(i);
      if (!touch) continue;

      const touchState = this.activeTouches.get(touch.identifier);

      if (touchState) {
        switch (touchState.side) {
          case 'left':
            // 왼쪽 영역에 다른 터치가 없는지 확인
            if (!this.hasOtherTouchInZone('left', touch.identifier)) {
              this.leftFlipperPressed = false;
              this.callbacks.onLeftFlipperUp?.();
            }
            break;

          case 'right':
            // 오른쪽 영역에 다른 터치가 없는지 확인
            if (!this.hasOtherTouchInZone('right', touch.identifier)) {
              this.rightFlipperPressed = false;
              this.callbacks.onRightFlipperUp?.();
            }
            break;

          case 'plunger':
            this.callbacks.onPlungerRelease?.();
            break;
        }

        this.activeTouches.delete(touch.identifier);
      }
    }
  }

  /**
   * 터치 취소 처리
   */
  private handleTouchCancel(e: TouchEvent): void {
    this.handleTouchEnd(e);
  }

  /**
   * 특정 영역에 다른 터치가 있는지 확인
   */
  private hasOtherTouchInZone(zone: 'left' | 'right', excludeId: number): boolean {
    for (const [id, state] of this.activeTouches) {
      if (id !== excludeId && state.side === zone) {
        return true;
      }
    }
    return false;
  }

  /**
   * DeviceOrientation 이벤트 처리 (기울기)
   */
  private handleDeviceOrientation(e: DeviceOrientationEvent): void {
    if (e.beta === null || e.gamma === null) return;

    // 기준선 설정 (첫 번째 이벤트)
    if (!this.gyroBaseline) {
      this.gyroBaseline = {
        beta: e.beta,
        gamma: e.gamma,
      };
      return;
    }

    // 기준선 대비 기울기 계산
    const tiltX = e.gamma - this.gyroBaseline.gamma; // 좌우 기울기
    const tiltY = e.beta - this.gyroBaseline.beta;   // 전후 기울기

    // 최대 기울기 제한
    const maxTilt = INPUT.GYRO.MAX_TILT_ANGLE;
    const clampedX = Math.max(-maxTilt, Math.min(maxTilt, tiltX));
    const clampedY = Math.max(-maxTilt, Math.min(maxTilt, tiltY));

    // 미세한 중력 조정을 위한 값 저장 (향후 확장용)
    // 현재는 Nudge만 처리
  }

  /**
   * DeviceMotion 이벤트 처리 (흔들기/Nudge)
   */
  private handleDeviceMotion(e: DeviceMotionEvent): void {
    if (!e.accelerationIncludingGravity) return;
    if (this.isTilted) return; // 틸트 상태면 무시

    const { x, y, z } = e.accelerationIncludingGravity;
    if (x === null || y === null || z === null) return;

    // 가속도 변화량 계산
    const deltaX = Math.abs(x - this.lastGyroX);
    const deltaY = Math.abs(y - this.lastGyroY);
    const deltaZ = Math.abs(z - this.lastGyroZ);

    this.lastGyroX = x;
    this.lastGyroY = y;
    this.lastGyroZ = z;

    // 총 가속도 변화
    const totalDelta = deltaX + deltaY + deltaZ;

    // 흔들기 감지
    if (totalDelta > INPUT.GYRO.NUDGE_THRESHOLD) {
      const now = performance.now();

      // 쿨다운 체크
      if (now - this.lastNudgeTime < GAME.TILT.COOLDOWN) {
        return;
      }

      this.lastNudgeTime = now;

      // 틸트 경고 누적
      this.tiltWarnings++;

      if (this.tiltWarnings >= GAME.TILT.WARNING_THRESHOLD) {
        // 틸트!
        this.isTilted = true;
        this.callbacks.onTilt?.();

        // 햅틱 피드백
        if ('vibrate' in navigator) {
          navigator.vibrate(HAPTICS.TILT_WARNING);
        }

        console.log('[InputManager] TILT!');
      } else {
        // 경고
        this.callbacks.onTiltWarning?.();

        // Nudge 효과 발생
        const nudgeX = (x > 0 ? 1 : -1) * INPUT.GYRO.NUDGE_FORCE * 0.01;
        const nudgeY = (y > 0 ? 1 : -1) * INPUT.GYRO.NUDGE_FORCE * 0.01;
        this.callbacks.onNudge?.(nudgeX, nudgeY);

        // 햅틱 피드백
        if ('vibrate' in navigator) {
          navigator.vibrate(HAPTICS.BUMP);
        }

        console.log('[InputManager] Nudge warning:', this.tiltWarnings);
      }
    }
  }

  /**
   * 키보드 다운 처리 (데스크톱 테스트용)
   */
  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.key.toLowerCase()) {
      case 'a':
      case 'arrowleft':
      case 'z':
        if (!this.leftFlipperPressed) {
          this.leftFlipperPressed = true;
          this.callbacks.onLeftFlipperDown?.();
        }
        break;

      case 'd':
      case 'arrowright':
      case '/':
        if (!this.rightFlipperPressed) {
          this.rightFlipperPressed = true;
          this.callbacks.onRightFlipperDown?.();
        }
        break;

      case ' ':
      case 'arrowdown':
        this.callbacks.onPlungerStart?.();
        break;
    }
  }

  /**
   * 키보드 업 처리 (데스크톱 테스트용)
   */
  private handleKeyUp(e: KeyboardEvent): void {
    switch (e.key.toLowerCase()) {
      case 'a':
      case 'arrowleft':
      case 'z':
        this.leftFlipperPressed = false;
        this.callbacks.onLeftFlipperUp?.();
        break;

      case 'd':
      case 'arrowright':
      case '/':
        this.rightFlipperPressed = false;
        this.callbacks.onRightFlipperUp?.();
        break;

      case ' ':
      case 'arrowdown':
        this.callbacks.onPlungerRelease?.();
        break;
    }
  }

  /**
   * 틸트 상태 리셋
   */
  resetTilt(): void {
    this.tiltWarnings = 0;
    this.isTilted = false;
  }

  /**
   * 자이로 기준선 재설정
   */
  recalibrateGyro(): void {
    this.gyroBaseline = null;
  }

  /**
   * 자이로 지원 여부
   */
  isGyroSupported(): boolean {
    return this.gyroSupported;
  }

  /**
   * 틸트 상태 확인
   */
  isTiltState(): boolean {
    return this.isTilted;
  }

  /**
   * 정리
   */
  destroy(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this.boundHandleTouchStart);
      this.canvas.removeEventListener('touchend', this.boundHandleTouchEnd);
      this.canvas.removeEventListener('touchcancel', this.boundHandleTouchCancel);
    }

    window.removeEventListener('keydown', this.boundHandleKeyDown);
    window.removeEventListener('keyup', this.boundHandleKeyUp);

    if (this.gyroSupported) {
      window.removeEventListener('deviceorientation', this.boundHandleDeviceOrientation);
      window.removeEventListener('devicemotion', this.boundHandleDeviceMotion);
    }

    this.activeTouches.clear();
    this.callbacks = {};

    console.log('[InputManager] Destroyed');
  }
}
