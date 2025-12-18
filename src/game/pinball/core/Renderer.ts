/**
 * Renderer - Pixi.js 렌더링 관리
 * WebGL 기반 고성능 2D 렌더링
 */

import * as PIXI from 'pixi.js';
import { VIEWPORT, RENDER } from '../utils/Constants';

export class Renderer {
  private app: PIXI.Application | null = null;
  private gameContainer: PIXI.Container | null = null;
  private uiContainer: PIXI.Container | null = null;
  private effectsContainer: PIXI.Container | null = null;

  private scale: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;

  /**
   * Pixi.js 애플리케이션 초기화
   */
  async init(canvas: HTMLCanvasElement): Promise<void> {
    // Pixi.js 애플리케이션 생성
    this.app = new PIXI.Application();

    await this.app.init({
      canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: RENDER.BACKGROUND_COLOR,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // 컨테이너 계층 구조 생성
    this.gameContainer = new PIXI.Container();
    this.effectsContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();

    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.effectsContainer);
    this.app.stage.addChild(this.uiContainer);

    // 초기 스케일 계산
    this.updateScale();

    // 리사이즈 이벤트 등록
    window.addEventListener('resize', this.handleResize.bind(this));

    console.log('[Renderer] Pixi.js initialized');
  }

  /**
   * 화면 스케일 계산 (Letterboxing)
   */
  private updateScale(): void {
    if (!this.app || !this.gameContainer) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // 논리 해상도 기준으로 스케일 계산 (Show All)
    const scaleX = screenWidth / VIEWPORT.LOGICAL_WIDTH;
    const scaleY = screenHeight / VIEWPORT.LOGICAL_HEIGHT;
    this.scale = Math.min(scaleX, scaleY);

    // 중앙 정렬 오프셋
    this.offsetX = (screenWidth - VIEWPORT.LOGICAL_WIDTH * this.scale) / 2;
    this.offsetY = (screenHeight - VIEWPORT.LOGICAL_HEIGHT * this.scale) / 2;

    // 게임 컨테이너에 적용
    this.gameContainer.scale.set(this.scale);
    this.gameContainer.position.set(this.offsetX, this.offsetY);

    // 이펙트 컨테이너에도 적용
    if (this.effectsContainer) {
      this.effectsContainer.scale.set(this.scale);
      this.effectsContainer.position.set(this.offsetX, this.offsetY);
    }
  }

  /**
   * 리사이즈 핸들러
   */
  private handleResize(): void {
    if (!this.app) return;

    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    this.updateScale();
  }

  /**
   * 화면 좌표를 논리 좌표로 변환
   */
  screenToLogical(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.offsetX) / this.scale,
      y: (screenY - this.offsetY) / this.scale,
    };
  }

  /**
   * 논리 좌표를 화면 좌표로 변환
   */
  logicalToScreen(logicalX: number, logicalY: number): { x: number; y: number } {
    return {
      x: logicalX * this.scale + this.offsetX,
      y: logicalY * this.scale + this.offsetY,
    };
  }

  /**
   * 원 그래픽 생성
   */
  createCircle(radius: number, color: number, alpha: number = 1): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, radius);
    graphics.fill({ color, alpha });
    return graphics;
  }

  /**
   * 사각형 그래픽 생성
   */
  createRect(width: number, height: number, color: number, alpha: number = 1): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill({ color, alpha });
    return graphics;
  }

  /**
   * 둥근 사각형 그래픽 생성
   */
  createRoundedRect(
    width: number,
    height: number,
    radius: number,
    color: number,
    alpha: number = 1
  ): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    graphics.roundRect(-width / 2, -height / 2, width, height, radius);
    graphics.fill({ color, alpha });
    return graphics;
  }

  /**
   * 캡슐 모양 그래픽 생성 (플리퍼용)
   */
  createCapsule(length: number, width: number, color: number): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    const radius = width / 2;
    const halfLength = (length - width) / 2;

    // 왼쪽 반원
    graphics.arc(-halfLength, 0, radius, Math.PI / 2, -Math.PI / 2);
    // 위쪽 선
    graphics.lineTo(halfLength, -radius);
    // 오른쪽 반원
    graphics.arc(halfLength, 0, radius, -Math.PI / 2, Math.PI / 2);
    // 아래쪽 선
    graphics.lineTo(-halfLength, radius);
    graphics.closePath();
    graphics.fill({ color });

    return graphics;
  }

  /**
   * 그라디언트 원 생성 (공용 - 3D 효과)
   */
  createBall(radius: number): PIXI.Container {
    const container = new PIXI.Container();

    // 그림자
    const shadow = new PIXI.Graphics();
    shadow.circle(3, 3, radius);
    shadow.fill({ color: 0x000000, alpha: 0.3 });
    container.addChild(shadow);

    // 베이스 원
    const base = new PIXI.Graphics();
    base.circle(0, 0, radius);
    base.fill({ color: RENDER.COLORS.BALL });
    container.addChild(base);

    // 하이라이트 (3D 효과)
    const highlight = new PIXI.Graphics();
    highlight.circle(-radius * 0.3, -radius * 0.3, radius * 0.4);
    highlight.fill({ color: 0xffffff, alpha: 0.6 });
    container.addChild(highlight);

    // 작은 반짝임
    const sparkle = new PIXI.Graphics();
    sparkle.circle(-radius * 0.4, -radius * 0.4, radius * 0.15);
    sparkle.fill({ color: 0xffffff, alpha: 0.9 });
    container.addChild(sparkle);

    return container;
  }

  /**
   * 범퍼 그래픽 생성 (네온 효과)
   */
  createBumper(radius: number, isActive: boolean = false): PIXI.Container {
    const container = new PIXI.Container();
    const color = isActive ? RENDER.COLORS.BUMPER_ACTIVE : RENDER.COLORS.BUMPER_INACTIVE;

    // 외부 글로우
    const glow = new PIXI.Graphics();
    glow.circle(0, 0, radius + 10);
    glow.fill({ color, alpha: 0.3 });
    container.addChild(glow);

    // 메인 원
    const main = new PIXI.Graphics();
    main.circle(0, 0, radius);
    main.fill({ color });
    container.addChild(main);

    // 내부 하이라이트
    const inner = new PIXI.Graphics();
    inner.circle(0, 0, radius * 0.7);
    inner.fill({ color: 0xffffff, alpha: 0.3 });
    container.addChild(inner);

    // 중앙 반짝임
    const center = new PIXI.Graphics();
    center.circle(-radius * 0.2, -radius * 0.2, radius * 0.3);
    center.fill({ color: 0xffffff, alpha: 0.5 });
    container.addChild(center);

    return container;
  }

  /**
   * 플리퍼 그래픽 생성 (메탈릭 효과)
   */
  createFlipper(length: number, width: number, isLeft: boolean): PIXI.Container {
    const container = new PIXI.Container();

    // 그림자
    const shadow = this.createCapsule(length, width, 0x000000);
    shadow.alpha = 0.4;
    shadow.position.set(2, 3);
    container.addChild(shadow);

    // 메인 바디
    const body = this.createCapsule(length, width, RENDER.COLORS.FLIPPER);
    container.addChild(body);

    // 하이라이트 (금속 반사)
    const highlight = new PIXI.Graphics();
    const halfLength = (length - width) / 2;
    highlight.roundRect(-halfLength, -width / 4, length - width / 2, width / 3, 5);
    highlight.fill({ color: 0xffffff, alpha: 0.4 });
    container.addChild(highlight);

    // 피벗 포인트 표시
    const pivot = new PIXI.Graphics();
    const pivotX = isLeft ? -halfLength : halfLength;
    pivot.circle(pivotX, 0, width / 3);
    pivot.fill({ color: 0x333333 });
    container.addChild(pivot);

    return container;
  }

  /**
   * 파티클 효과 생성
   */
  createParticleEffect(x: number, y: number, color: number, count: number = 10): void {
    if (!this.effectsContainer) return;

    for (let i = 0; i < count; i++) {
      const particle = new PIXI.Graphics();
      particle.circle(0, 0, 3 + Math.random() * 5);
      particle.fill({ color, alpha: 0.8 });
      particle.position.set(x, y);
      this.effectsContainer.addChild(particle);

      // 랜덤 방향으로 퍼지는 애니메이션
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 150;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // 간단한 애니메이션 (requestAnimationFrame 기반)
      let life = 1;
      const animate = () => {
        life -= 0.02;
        if (life <= 0) {
          particle.destroy();
          return;
        }

        particle.x += vx * 0.016;
        particle.y += vy * 0.016;
        particle.alpha = life;
        particle.scale.set(life);

        requestAnimationFrame(animate);
      };
      animate();
    }
  }

  /**
   * 점수 팝업 효과
   */
  createScorePopup(x: number, y: number, score: number, color: number = 0xfbbf24): void {
    if (!this.effectsContainer) return;

    const text = new PIXI.Text({
      text: `+${score}`,
      style: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        fontSize: 48,
        fontWeight: 'bold',
        fill: color,
        stroke: { color: 0x000000, width: 4 },
      },
    });
    text.anchor.set(0.5);
    text.position.set(x, y);
    this.effectsContainer.addChild(text);

    // 위로 올라가며 사라지는 애니메이션
    let progress = 0;
    const animate = () => {
      progress += 0.02;
      if (progress >= 1) {
        text.destroy();
        return;
      }

      text.y = y - progress * 80;
      text.alpha = 1 - progress;
      text.scale.set(1 + progress * 0.3);

      requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * 트레일 효과용 원 추가
   */
  addTrailPoint(x: number, y: number, radius: number, color: number, alpha: number): void {
    if (!this.effectsContainer) return;

    const trail = new PIXI.Graphics();
    trail.circle(0, 0, radius);
    trail.fill({ color, alpha });
    trail.position.set(x, y);
    this.effectsContainer.addChild(trail);

    // 페이드 아웃
    let life = alpha;
    const fadeOut = () => {
      life -= RENDER.EFFECTS.TRAIL_ALPHA_DECAY;
      if (life <= 0) {
        trail.destroy();
        return;
      }
      trail.alpha = life;
      requestAnimationFrame(fadeOut);
    };
    fadeOut();
  }

  /**
   * 게임 컨테이너에 오브젝트 추가
   */
  addToGame(displayObject: PIXI.Container | PIXI.Graphics): void {
    this.gameContainer?.addChild(displayObject);
  }

  /**
   * UI 컨테이너에 오브젝트 추가
   */
  addToUI(displayObject: PIXI.Container | PIXI.Graphics | PIXI.Text): void {
    this.uiContainer?.addChild(displayObject);
  }

  /**
   * 오브젝트 제거
   */
  remove(displayObject: PIXI.Container | PIXI.Graphics | PIXI.Text): void {
    displayObject.destroy();
  }

  /**
   * 게임 컨테이너 반환
   */
  getGameContainer(): PIXI.Container | null {
    return this.gameContainer;
  }

  /**
   * 현재 스케일 반환
   */
  getScale(): number {
    return this.scale;
  }

  /**
   * 매 프레임 업데이트 (이펙트 등)
   */
  update(_deltaTime: number): void {
    // 이펙트 컨테이너의 애니메이션은 requestAnimationFrame으로 처리됨
    // 추가적인 업데이트 로직이 필요하면 여기에 구현
  }

  /**
   * 정리
   */
  destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));

    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
    }

    this.gameContainer = null;
    this.uiContainer = null;
    this.effectsContainer = null;

    console.log('[Renderer] Destroyed');
  }
}
