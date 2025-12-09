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
    // 배경 - 파스텔 그라디언트 (핑크-옐로우-블루)
    const bgGradient1 = this.add.rectangle(187.5, 150, 375, 300, 0xfce7f3);
    const bgGradient2 = this.add.rectangle(187.5, 400, 375, 300, 0xfef3c7);
    const bgGradient3 = this.add.rectangle(187.5, 600, 375, 134, 0xdbeafe);

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

    // 점수 표시 - 귀여운 박스 스타일
    const scoreBox = this.add.rectangle(60, 120, 100, 45, 0xfbbf24);
    scoreBox.setStrokeStyle(3, 0xf59e0b);

    const scoreInner = this.add.rectangle(60, 120, 94, 39, 0xfef3c7);

    this.scoreText = this.add.text(60, 112, '0', {
      fontSize: '22px',
      color: '#f59e0b',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const scoreLabel = this.add.text(60, 132, 'SCORE', {
      fontSize: '10px',
      color: '#92400e',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 공 개수 표시 - 동그란 귀여운 스타일
    const ballsCircle = this.add.circle(315, 120, 25, 0xf87171);
    ballsCircle.setStrokeStyle(3, 0xef4444);

    const ballsInner = this.add.circle(315, 120, 20, 0xfecaca);

    this.ballsText = this.add.text(315, 120, this.ballsLeft.toString(), {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold',
      stroke: '#dc2626',
      strokeThickness: 2
    }).setOrigin(0.5);

    // 핀볼 테이블 - 화려한 파스텔 테이블
    const tableBorder = this.add.rectangle(187.5, 410, 355, 510, 0xfbbf24);
    tableBorder.setStrokeStyle(5, 0xf59e0b);

    // 테이블 내부 - 파스텔 핑크+블루+옐로우
    const tableBg1 = this.add.rectangle(187.5, 280, 345, 200, 0xfce7f3);
    const tableBg2 = this.add.rectangle(187.5, 430, 345, 200, 0xfef3c7);
    const tableBg3 = this.add.rectangle(187.5, 580, 345, 150, 0xbfdbfe);

    // 핀볼 테이블 테두리
    this.createWalls();

    // 범퍼 생성
    this.createBumpers();

    // 플리퍼 생성
    this.createFlippers();

    // 공 생성
    this.ball = this.physics.add.image(187.5, 150, 'ball');
    this.ball.setBounce(0.9);
    this.ball.setCollideWorldBounds(true);
    if (this.ball.body) {
      (this.ball.body as Phaser.Physics.Arcade.Body).setGravity(0, 800);
    }

    // 충돌 설정
    if (this.bumpers && this.ball) {
      this.physics.add.collider(this.ball, this.bumpers, this.hitBumper as any, undefined, this);
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

    // 공이 아래로 떨어졌는지 확인
    if (this.ball.y > 650) {
      this.loseBall();
    }
  }

  private createBallTexture() {
    const graphics = this.add.graphics();
    // 공 - 반짝이는 실버 펄
    graphics.fillStyle(0xe0e7ff, 1);
    graphics.fillCircle(10, 10, 10);
    // 외곽 테두리 - 진한 회색
    graphics.lineStyle(3, 0x6366f1, 1);
    graphics.strokeCircle(10, 10, 10);
    // 하이라이트 - 크고 밝게
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(7, 7, 4);
    graphics.generateTexture('ball', 20, 20);
    graphics.destroy();
  }

  private createFlipperTexture() {
    const graphics = this.add.graphics();
    // 플리퍼 - 오렌지+옐로우 그라디언트
    graphics.fillStyle(0xfb923c, 1);
    graphics.fillRoundedRect(0, 0, 75, 20, 10);
    // 외곽 테두리 - 진한 오렌지
    graphics.lineStyle(4, 0xea580c, 1);
    graphics.strokeRoundedRect(0, 0, 75, 20, 10);
    // 내부 하이라이트 - 밝은 옐로우
    graphics.fillStyle(0xfef3c7, 0.7);
    graphics.fillRoundedRect(8, 4, 59, 8, 4);
    graphics.generateTexture('flipper', 75, 20);
    graphics.destroy();
  }

  private createBumperTexture() {
    const graphics = this.add.graphics();
    // 범퍼 - 레인보우 스타일
    // 외곽 - 핑크
    graphics.fillStyle(0xfda4af, 1);
    graphics.fillCircle(20, 20, 20);
    // 중간 - 옐로우
    graphics.fillStyle(0xfde047, 1);
    graphics.fillCircle(20, 20, 16);
    // 내부 - 민트
    graphics.fillStyle(0xa7f3d0, 1);
    graphics.fillCircle(20, 20, 12);
    // 중앙 - 화이트
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(20, 20, 8);
    // 외곽 테두리
    graphics.lineStyle(4, 0xf43f5e, 1);
    graphics.strokeCircle(20, 20, 20);
    graphics.generateTexture('bumper', 40, 40);
    graphics.destroy();
  }

  private createWalls() {
    // 왼쪽 벽 - 형광 핑크 네온
    const leftWall = this.add.rectangle(22, 400, 10, 490, 0xfda4af);
    leftWall.setStrokeStyle(3, 0xf43f5e);
    this.physics.add.existing(leftWall, true);

    // 오른쪽 벽 - 형광 핑크 네온
    const rightWall = this.add.rectangle(353, 400, 10, 490, 0xfda4af);
    rightWall.setStrokeStyle(3, 0xf43f5e);
    this.physics.add.existing(rightWall, true);

    // 위쪽 벽 - 민트 네온
    const topWall = this.add.rectangle(187.5, 165, 325, 10, 0xa7f3d0);
    topWall.setStrokeStyle(3, 0x34d399);
    this.physics.add.existing(topWall, true);

    // 사선 가이드 (공을 아래로 유도) - 오렌지 네온
    const leftGuide = this.add.rectangle(80, 570, 110, 10, 0xfed7aa);
    leftGuide.setStrokeStyle(3, 0xfb923c);
    leftGuide.rotation = -0.35;
    this.physics.add.existing(leftGuide, true);

    const rightGuide = this.add.rectangle(295, 570, 110, 10, 0xfed7aa);
    rightGuide.setStrokeStyle(3, 0xfb923c);
    rightGuide.rotation = 0.35;
    this.physics.add.existing(rightGuide, true);
  }

  private createBumpers() {
    this.bumpers = this.physics.add.staticGroup();

    // 상단 범퍼들 (삼각형 배치)
    const bumperPositions = [
      { x: 187.5, y: 200, points: 100 },
      { x: 130, y: 250, points: 50 },
      { x: 245, y: 250, points: 50 },
      { x: 100, y: 320, points: 30 },
      { x: 187.5, y: 320, points: 30 },
      { x: 275, y: 320, points: 30 }
    ];

    bumperPositions.forEach(pos => {
      const bumper = this.bumpers!.create(pos.x, pos.y, 'bumper') as Phaser.Physics.Arcade.Sprite;
      bumper.setData('points', pos.points);
      bumper.setCircle(20);
      bumper.setScale(1.1);
    });
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

    // 점수 추가
    const points = bumperObj.getData('points') || 10;
    this.score += points;
    this.scoreText?.setText(this.score.toString());

    // 범퍼 깜빡임 효과
    const bumperSprite = bumper as Phaser.GameObjects.Image;
    this.tweens.add({
      targets: bumperSprite,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true
    });

    // 공에 추가 속도
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

  private loseBall() {
    this.ballsLeft--;
    this.ballsText?.setText(this.ballsLeft.toString());

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
}
