/**
 * Pinball Game Scene
 * 핀볼 게임 - 공을 튕겨서 점수를 획득하는 게임
 */

import * as Phaser from 'phaser';
import { COLORS } from '../config';
import { submitGameScore } from '../../services/gameScoreService';
import { gameManager } from '../GameManager';

export class PinballScene extends Phaser.Scene {
  private ball?: Phaser.Physics.Arcade.Image;
  private paddle?: Phaser.Physics.Arcade.Image;
  private score: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private lives: number = 3;
  private livesText?: Phaser.GameObjects.Text;
  private bricks?: Phaser.Physics.Arcade.StaticGroup;
  private gameStarted: boolean = false;
  private gameOver: boolean = false;
  private stuckTimer: number = 0;
  private lastBallX: number = 0;
  private lastBallY: number = 0;

  constructor() {
    super({ key: 'PinballScene' });
  }

  preload() {
    // 이미지 생성 (간단한 도형들)
    this.createBallTexture();
    this.createPaddleTexture();
    this.createBrickTexture();
  }

  create() {
    const W = this.sys.game.config.width as number;
    const H = this.sys.game.config.height as number;

    // 배경
    this.add.rectangle(W * 0.5, H * 0.5, W, H, 0x0f0f23);

    // 점수 텍스트
    this.scoreText = this.add.text(W * 0.02, H * 0.027, '점수: 0', {
      fontSize: Math.floor(H * 0.04) + 'px',
      color: COLORS.white
    });

    // 생명 텍스트
    this.livesText = this.add.text(W * 0.85, H * 0.027, '❤️ ' + this.lives, {
      fontSize: Math.floor(H * 0.04) + 'px',
      color: COLORS.white
    });

    // 벽돌 생성
    this.createBricks();

    // 패들 생성
    this.paddle = this.physics.add.image(W * 0.5, H * 0.917, 'paddle').setImmovable();
    if (this.paddle.body) {
      (this.paddle.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }

    // 공 생성
    this.ball = this.physics.add.image(W * 0.5, H * 0.833, 'ball');
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(1, 1);
    if (this.ball.body) {
      (this.ball.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }

    // 충돌 설정
    this.physics.add.collider(this.ball, this.paddle, this.hitPaddle as any, undefined, this);
    if (this.bricks) {
      this.physics.add.collider(this.ball, this.bricks, this.hitBrick as any, undefined, this);
    }

    // 마우스/터치 입력
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.paddle) {
        this.paddle.x = Phaser.Math.Clamp(pointer.x, W * 0.065, W * 0.935);

        // 게임 시작 전에는 공도 함께 이동
        if (!this.gameStarted && this.ball) {
          this.ball.x = this.paddle.x;
        }
      }
    });

    // 클릭으로 게임 시작
    this.input.once('pointerdown', () => {
      this.startGame();
    });

    // 시작 안내 텍스트
    const startText = this.add.text(W * 0.5, H * 0.5, '클릭하여 시작', {
      fontSize: Math.floor(H * 0.053) + 'px',
      color: COLORS.primary,
      align: 'center'
    }).setOrigin(0.5);

    this.time.delayedCall(100, () => {
      this.input.once('pointerdown', () => {
        startText.destroy();
      });
    });
  }

  update() {
    if (!this.ball || !this.gameStarted || this.gameOver) return;

    const H = this.sys.game.config.height as number;

    // 공이 아래로 떨어졌는지 확인
    if (this.ball.y > H) {
      this.loseLife();
      return;
    }

    // 공이 멈춰있거나 거의 움직이지 않는지 확인
    const body = this.ball.body as Phaser.Physics.Arcade.Body;
    if (body) {
      const velocityX = Math.abs(body.velocity.x);
      const velocityY = Math.abs(body.velocity.y);

      // 공의 위치 변화 확인
      const positionChanged =
        Math.abs(this.ball.x - this.lastBallX) > 1 ||
        Math.abs(this.ball.y - this.lastBallY) > 1;

      // 공이 거의 정지 상태 (속도 < 50) 이거나 위치가 변하지 않으면
      if ((velocityX < 50 && velocityY < 50) || !positionChanged) {
        this.stuckTimer += this.game.loop.delta;

        // 3초 이상 멈춰있으면 생명 잃음
        if (this.stuckTimer > 3000) {
          this.loseLife();
          this.stuckTimer = 0;
        }
      } else {
        this.stuckTimer = 0;
      }

      this.lastBallX = this.ball.x;
      this.lastBallY = this.ball.y;
    }
  }

  private createBallTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('ball', 16, 16);
    graphics.destroy();
  }

  private createPaddleTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x667eea, 1);
    graphics.fillRoundedRect(0, 0, 100, 20, 10);
    graphics.generateTexture('paddle', 100, 20);
    graphics.destroy();
  }

  private createBrickTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8b5cf6, 1);
    graphics.fillRoundedRect(0, 0, 60, 20, 5);
    graphics.generateTexture('brick', 60, 20);
    graphics.destroy();
  }

  private createBricks() {
    this.bricks = this.physics.add.staticGroup();

    const W = this.sys.game.config.width as number;
    const H = this.sys.game.config.height as number;

    const colors = [0xef4444, 0xf59e0b, 0x10b981, 0x3b82f6, 0x8b5cf6];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        const graphics = this.add.graphics();
        graphics.fillStyle(colors[row] || 0x8b5cf6, 1);
        graphics.fillRoundedRect(0, 0, 60, 20, 5);
        graphics.generateTexture(`brick_${row}_${col}`, 60, 20);
        graphics.destroy();

        const brick = this.bricks.create(
          W * (0.0875 + col * 0.0875),
          H * (0.083 + row * 0.05),
          `brick_${row}_${col}`
        ) as Phaser.Physics.Arcade.Sprite;
        if (brick) {
          brick.setData('points', (5 - row) * 10); // 위쪽 벽돌일수록 높은 점수
        }
      }
    }
  }

  private startGame() {
    if (this.gameStarted || !this.ball) return;

    this.gameStarted = true;
    this.stuckTimer = 0;
    this.lastBallX = this.ball.x;
    this.lastBallY = this.ball.y;

    // 공에 초기 속도 부여
    this.ball.setVelocity(-150, -300);
  }

  private hitPaddle(
    ball: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    paddle: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const ballObj = ball as Phaser.Physics.Arcade.Image;
    const paddleObj = paddle as Phaser.Physics.Arcade.Image;

    // 패들의 어느 부분에 맞았는지에 따라 각도 조절
    const diff = ballObj.x - paddleObj.x;
    ballObj.setVelocityX(diff * 10);
  }

  private hitBrick(
    ball: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    brick: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const brickObj = brick as Phaser.GameObjects.GameObject;

    // 점수 추가
    const points = brickObj.getData('points') || 10;
    this.score += points;
    this.scoreText?.setText('점수: ' + this.score);

    // 벽돌 제거
    brickObj.destroy();

    // 모든 벽돌을 깼는지 확인
    if (this.bricks?.countActive() === 0) {
      this.winGame();
    }
  }

  private loseLife() {
    this.lives--;
    this.livesText?.setText('❤️ ' + this.lives);

    const W = this.sys.game.config.width as number;
    const H = this.sys.game.config.height as number;

    if (this.lives === 0) {
      this.endGame(false);
    } else {
      // 공과 패들 위치 리셋
      this.gameStarted = false;
      this.stuckTimer = 0;
      if (this.ball && this.paddle) {
        this.ball.setPosition(W * 0.5, H * 0.833);
        this.ball.setVelocity(0, 0);
        this.paddle.setPosition(W * 0.5, H * 0.917);
        this.lastBallX = W * 0.5;
        this.lastBallY = H * 0.833;
      }

      // 다시 시작
      this.time.delayedCall(1000, () => {
        this.input.once('pointerdown', () => {
          this.startGame();
        });
      });
    }
  }

  private winGame() {
    // 보너스 점수
    this.score += this.lives * 100;
    this.scoreText?.setText('점수: ' + this.score);

    this.endGame(true);
  }

  private async endGame(won: boolean) {
    if (this.gameOver) return;
    this.gameOver = true;

    const W = this.sys.game.config.width as number;
    const H = this.sys.game.config.height as number;

    // 공 멈추기
    if (this.ball) {
      this.ball.setVelocity(0, 0);
    }

    // 게임 오버 텍스트
    const message = won ? '승리!' : '게임 오버';
    const resultText = this.add.text(W * 0.5, H * 0.417, message + '\n최종 점수: ' + this.score, {
      fontSize: Math.floor(H * 0.08) + 'px',
      color: won ? COLORS.success : COLORS.danger,
      align: 'center'
    }).setOrigin(0.5);

    // 이름 입력 받기
    const nameText = this.add.text(W * 0.5, H * 0.583, '이름을 입력하세요:', {
      fontSize: Math.floor(H * 0.04) + 'px',
      color: COLORS.white,
      align: 'center'
    }).setOrigin(0.5);

    // HTML 입력 창 생성
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = '플레이어 이름';
    inputElement.maxLength = 20;
    inputElement.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${H * 0.667}px;
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
      top: ${H * 0.75}px;
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

      // 점수 제출 (QR 코드 포함)
      const qrCode = gameManager.getQrCode();
      const success = await submitGameScore({
        gameType: 'brick-breaker',
        playerName,
        score: this.score,
        qrCode: qrCode
      });

      // 입력 요소 제거
      inputElement.remove();
      submitButton.remove();

      // 제출 결과 표시
      if (success) {
        nameText.setText('점수가 제출되었습니다!');
        nameText.setColor(COLORS.success);
      } else {
        nameText.setText('점수 제출 실패');
        nameText.setColor(COLORS.danger);
      }

      // 재시작 버튼
      this.time.delayedCall(2000, () => {
        const restartText = this.add.text(W * 0.5, H * 0.75, '클릭하여 다시 시작', {
          fontSize: Math.floor(H * 0.04) + 'px',
          color: COLORS.primary,
          align: 'center'
        }).setOrigin(0.5).setInteractive();

        restartText.on('pointerdown', () => {
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
