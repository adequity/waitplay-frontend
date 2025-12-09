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
    // 배경 - 그라디언트 느낌의 파란색
    this.add.rectangle(187.5, 333.5, 375, 667, 0xdbeafe);

    // 상단 헤더 영역 - 흰색 카드 스타일
    const headerBg = this.add.rectangle(187.5, 50, 355, 80, 0xffffff);
    headerBg.setStrokeStyle(1, 0xe2e8f0);

    // 그림자 효과
    const headerShadow = this.add.rectangle(187.5, 51, 355, 80, 0x000000, 0.05);

    // 점수 텍스트 - 더 큰 폰트와 강조
    this.scoreText = this.add.text(30, 25, '0', {
      fontSize: '32px',
      color: '#3b82f6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold'
    });

    const scoreLabel = this.add.text(30, 60, 'SCORE', {
      fontSize: '12px',
      color: '#94a3b8',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      fontStyle: '600'
    });

    // 공 개수 텍스트 - 아이콘 스타일
    const ballsContainer = this.add.rectangle(320, 50, 80, 50, 0xfef3c7, 0.3);
    ballsContainer.setStrokeStyle(2, 0xfbbf24);

    this.ballsText = this.add.text(320, 50, this.ballsLeft.toString(), {
      fontSize: '28px',
      color: '#f59e0b',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const ballsLabel = this.add.text(320, 73, 'BALLS', {
      fontSize: '10px',
      color: '#92400e',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      fontStyle: '600'
    }).setOrigin(0.5, 0);

    // 핀볼 테이블 영역 - 어두운 파란색 카드
    const tableBg = this.add.rectangle(187.5, 400, 345, 490, 0x1e3a8a);
    tableBg.setStrokeStyle(3, 0x3b82f6);

    // 테이블 내부 그라데이션 효과
    const innerTable = this.add.rectangle(187.5, 400, 335, 480, 0x1e40af, 0.5);

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
    // 공 - 밝은 실버/크롬 느낌
    graphics.fillStyle(0xf1f5f9, 1);
    graphics.fillCircle(8, 8, 8);
    // 테두리 - 은색
    graphics.lineStyle(3, 0x94a3b8, 1);
    graphics.strokeCircle(8, 8, 8);
    // 하이라이트 효과
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(6, 6, 3);
    graphics.generateTexture('ball', 16, 16);
    graphics.destroy();
  }

  private createFlipperTexture() {
    const graphics = this.add.graphics();
    // 플리퍼 - 밝은 파란색에 그라디언트 느낌
    graphics.fillStyle(0x60a5fa, 1);
    graphics.fillRoundedRect(0, 0, 70, 18, 9);
    // 테두리 - 진한 파란색
    graphics.lineStyle(3, 0x2563eb, 1);
    graphics.strokeRoundedRect(0, 0, 70, 18, 9);
    // 하이라이트
    graphics.fillStyle(0xdbeafe, 0.5);
    graphics.fillRoundedRect(5, 3, 60, 6, 3);
    graphics.generateTexture('flipper', 70, 18);
    graphics.destroy();
  }

  private createBumperTexture() {
    const graphics = this.add.graphics();
    // 범퍼 - 노란색/금색 느낌
    graphics.fillStyle(0xfde047, 1);
    graphics.fillCircle(18, 18, 18);
    // 외곽 링
    graphics.lineStyle(4, 0xeab308, 1);
    graphics.strokeCircle(18, 18, 18);
    // 내부 원
    graphics.lineStyle(2, 0xfef08a, 1);
    graphics.strokeCircle(18, 18, 12);
    // 중앙 점
    graphics.fillStyle(0xfef3c7, 1);
    graphics.fillCircle(18, 18, 6);
    graphics.generateTexture('bumper', 36, 36);
    graphics.destroy();
  }

  private createWalls() {
    // 왼쪽 벽 - 더 두껍게, 밝은 색상
    const leftWall = this.add.rectangle(22, 400, 8, 490, 0x93c5fd);
    leftWall.setStrokeStyle(2, 0x3b82f6);
    this.physics.add.existing(leftWall, true);

    // 오른쪽 벽
    const rightWall = this.add.rectangle(353, 400, 8, 490, 0x93c5fd);
    rightWall.setStrokeStyle(2, 0x3b82f6);
    this.physics.add.existing(rightWall, true);

    // 위쪽 벽
    const topWall = this.add.rectangle(187.5, 160, 325, 8, 0x93c5fd);
    topWall.setStrokeStyle(2, 0x3b82f6);
    this.physics.add.existing(topWall, true);

    // 사선 가이드 (공을 아래로 유도) - 더 두껍고 밝게
    const leftGuide = this.add.rectangle(80, 570, 110, 8, 0x93c5fd);
    leftGuide.setStrokeStyle(2, 0x3b82f6);
    leftGuide.rotation = -0.35;
    this.physics.add.existing(leftGuide, true);

    const rightGuide = this.add.rectangle(295, 570, 110, 8, 0x93c5fd);
    rightGuide.setStrokeStyle(2, 0x3b82f6);
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
      bumper.setCircle(18);
      bumper.setScale(1.2);
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
    // 왼쪽 플리퍼 버튼 - 더 세련된 디자인
    this.leftFlipperButton = this.add.rectangle(90, 645, 150, 55, 0x3b82f6);
    this.leftFlipperButton.setInteractive();
    this.leftFlipperButton.setStrokeStyle(3, 0x2563eb);

    // 버튼 그림자 효과
    const leftShadow = this.add.rectangle(90, 647, 150, 55, 0x000000, 0.15);
    leftShadow.setDepth(-1);

    const leftText = this.add.text(90, 645, '◀ LEFT', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.leftFlipperButton.on('pointerdown', () => {
      this.activateFlipper('left');
      this.leftFlipperButton!.setFillStyle(0x1e40af);
      this.leftFlipperButton!.setScale(0.95);
    });

    this.leftFlipperButton.on('pointerup', () => {
      this.leftFlipperButton!.setFillStyle(0x3b82f6);
      this.leftFlipperButton!.setScale(1);
    });

    // 오른쪽 플리퍼 버튼
    this.rightFlipperButton = this.add.rectangle(285, 645, 150, 55, 0x3b82f6);
    this.rightFlipperButton.setInteractive();
    this.rightFlipperButton.setStrokeStyle(3, 0x2563eb);

    // 버튼 그림자 효과
    const rightShadow = this.add.rectangle(285, 647, 150, 55, 0x000000, 0.15);
    rightShadow.setDepth(-1);

    const rightText = this.add.text(285, 645, 'RIGHT ▶', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.rightFlipperButton.on('pointerdown', () => {
      this.activateFlipper('right');
      this.rightFlipperButton!.setFillStyle(0x1e40af);
      this.rightFlipperButton!.setScale(0.95);
    });

    this.rightFlipperButton.on('pointerup', () => {
      this.rightFlipperButton!.setFillStyle(0x3b82f6);
      this.rightFlipperButton!.setScale(1);
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
