/**
 * Real Pinball Game Scene
 * 진짜 핀볼 게임 - 플리퍼로 공을 튕기는 핀볼 게임
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
    // 배경
    this.add.rectangle(400, 300, 800, 600, 0x0f0f23);

    // 핀볼 테이블 테두리
    this.createWalls();

    // 점수 텍스트
    this.scoreText = this.add.text(16, 16, '점수: 0', {
      fontSize: '24px',
      color: COLORS.white
    });

    // 공 개수 텍스트
    this.ballsText = this.add.text(680, 16, '🔴 ' + this.ballsLeft, {
      fontSize: '24px',
      color: COLORS.white
    });

    // 범퍼 생성
    this.createBumpers();

    // 플리퍼 생성
    this.createFlippers();

    // 공 생성
    this.ball = this.physics.add.image(400, 100, 'ball');
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

    // 키보드 입력
    const leftKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const rightKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    leftKey?.on('down', () => this.activateFlipper('left'));
    rightKey?.on('down', () => this.activateFlipper('right'));

    // 시작 안내
    const startText = this.add.text(400, 300, '클릭하여 시작\nA: 왼쪽 플리퍼\nL: 오른쪽 플리퍼', {
      fontSize: '28px',
      color: COLORS.primary,
      align: 'center'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.startGame();
      startText.destroy();
    });
  }

  update() {
    if (!this.ball || !this.gameStarted || this.gameOver) return;

    // 공이 아래로 떨어졌는지 확인
    if (this.ball.y > 580) {
      this.loseBall();
    }
  }

  private createBallTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff4444, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('ball', 20, 20);
    graphics.destroy();
  }

  private createFlipperTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x667eea, 1);
    graphics.fillRoundedRect(0, 0, 80, 20, 5);
    graphics.generateTexture('flipper', 80, 20);
    graphics.destroy();
  }

  private createBumperTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xfbbf24, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('bumper', 40, 40);
    graphics.destroy();
  }

  private createWalls() {
    // 왼쪽 벽
    const leftWall = this.add.rectangle(50, 300, 10, 600, 0x764ba2);
    this.physics.add.existing(leftWall, true);

    // 오른쪽 벽
    const rightWall = this.add.rectangle(750, 300, 10, 600, 0x764ba2);
    this.physics.add.existing(rightWall, true);

    // 위쪽 벽
    const topWall = this.add.rectangle(400, 50, 700, 10, 0x764ba2);
    this.physics.add.existing(topWall, true);

    // 사선 가이드 (공을 아래로 유도)
    const leftGuide = this.add.rectangle(150, 450, 150, 10, 0x764ba2);
    leftGuide.rotation = -0.3;
    this.physics.add.existing(leftGuide, true);

    const rightGuide = this.add.rectangle(650, 450, 150, 10, 0x764ba2);
    rightGuide.rotation = 0.3;
    this.physics.add.existing(rightGuide, true);
  }

  private createBumpers() {
    this.bumpers = this.physics.add.staticGroup();

    // 상단 범퍼들 (삼각형 배치)
    const bumperPositions = [
      { x: 400, y: 150, points: 100 },
      { x: 300, y: 200, points: 50 },
      { x: 500, y: 200, points: 50 },
      { x: 250, y: 280, points: 30 },
      { x: 400, y: 280, points: 30 },
      { x: 550, y: 280, points: 30 }
    ];

    bumperPositions.forEach(pos => {
      const bumper = this.bumpers!.create(pos.x, pos.y, 'bumper') as Phaser.Physics.Arcade.Sprite;
      bumper.setData('points', pos.points);
      bumper.setCircle(20);
    });
  }

  private createFlippers() {
    // 왼쪽 플리퍼
    this.leftFlipper = this.physics.add.image(250, 520, 'flipper');
    this.leftFlipper.setImmovable(true);
    if (this.leftFlipper.body) {
      (this.leftFlipper.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }

    // 오른쪽 플리퍼
    this.rightFlipper = this.physics.add.image(550, 520, 'flipper');
    this.rightFlipper.setImmovable(true);
    if (this.rightFlipper.body) {
      (this.rightFlipper.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }
  }

  private startGame() {
    if (this.gameStarted) return;
    this.gameStarted = true;

    // 공에 초기 속도
    if (this.ball) {
      this.ball.setVelocity(Phaser.Math.Between(-100, 100), 200);
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
    this.scoreText?.setText('점수: ' + this.score);

    // 범퍼 깜빡임 효과
    const bumperSprite = bumper as Phaser.GameObjects.Rectangle;
    this.tweens.add({
      targets: bumperSprite,
      alpha: 0.3,
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
    this.ballsText?.setText('🔴 ' + this.ballsLeft);

    if (this.ballsLeft === 0) {
      this.endGame();
    } else {
      // 공 리셋
      this.gameStarted = false;
      if (this.ball) {
        this.ball.setPosition(400, 100);
        this.ball.setVelocity(0, 0);
      }

      // 재시작
      this.time.delayedCall(1000, () => {
        this.input.once('pointerdown', () => {
          this.startGame();
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
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);

    const resultText = this.add.text(400, 200, '게임 오버!', {
      fontSize: '48px',
      color: COLORS.danger,
      align: 'center'
    }).setOrigin(0.5);

    const scoreText = this.add.text(400, 270, `최종 점수: ${this.score}`, {
      fontSize: '32px',
      color: COLORS.white,
      align: 'center'
    }).setOrigin(0.5);

    // 이름 입력
    const namePrompt = this.add.text(400, 360, '이름을 입력하세요:', {
      fontSize: '22px',
      color: COLORS.white
    }).setOrigin(0.5);

    // HTML 입력 요소
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = '플레이어 이름';
    inputElement.maxLength = 20;
    inputElement.style.cssText = `
      position: absolute;
      left: 50%;
      top: 400px;
      transform: translateX(-50%);
      width: 300px;
      padding: 10px;
      font-size: 18px;
      border: 2px solid ${COLORS.primary};
      border-radius: 8px;
      text-align: center;
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
      padding: 10px 30px;
      font-size: 18px;
      background: ${COLORS.primary};
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
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
        namePrompt.setColor(COLORS.success);
      } else {
        namePrompt.setText('점수 제출 실패');
        namePrompt.setColor(COLORS.danger);
      }

      // 재시작 버튼
      this.time.delayedCall(2000, () => {
        const restartButton = this.add.text(400, 480, '다시 시작', {
          fontSize: '24px',
          color: COLORS.white,
          backgroundColor: COLORS.primary,
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

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
