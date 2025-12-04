/**
 * Pinball Game Scene
 * 핀볼 게임 - 공을 튕겨서 점수를 획득하는 게임
 */

import Phaser from 'phaser';
import { COLORS } from '../config';

export class PinballScene extends Phaser.Scene {
  private ball?: Phaser.Physics.Arcade.Sprite;
  private paddle?: Phaser.Physics.Arcade.Sprite;
  private bricks?: Phaser.Physics.Arcade.StaticGroup;
  private score: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private livesText?: Phaser.GameObjects.Text;
  private lives: number = 3;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private gameStarted: boolean = false;
  private gameOver: boolean = false;

  constructor() {
    super({ key: 'PinballScene' });
  }

  preload() {
    // 에셋 로딩은 나중에 추가
    // this.load.image('ball', '/assets/ball.png');
    // this.load.image('paddle', '/assets/paddle.png');
  }

  create() {
    // 배경
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // 점수 표시
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: COLORS.white,
      fontFamily: 'Arial'
    });

    // 생명 표시
    this.livesText = this.add.text(20, 50, `Lives: ${this.lives}`, {
      fontSize: '24px',
      color: COLORS.white,
      fontFamily: 'Arial'
    });

    // 시작 안내
    const startText = this.add.text(400, 300, 'Press SPACE to Start', {
      fontSize: '32px',
      color: COLORS.primary,
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 패들 생성 (플레이어가 조작)
    this.paddle = this.physics.add.sprite(400, 550, undefined);
    this.paddle.displayWidth = 120;
    this.paddle.displayHeight = 20;
    this.paddle.setTint(0x6366f1);
    this.paddle.setImmovable(true);
    this.paddle.body?.setCollideWorldBounds(true);

    // 공 생성
    this.ball = this.physics.add.sprite(400, 500, undefined);
    this.ball.displayWidth = 20;
    this.ball.displayHeight = 20;
    this.ball.setTint(0xffffff);
    this.ball.setCircle(10);
    this.ball.setBounce(1, 1);
    this.ball.setCollideWorldBounds(true);

    // 벽돌 생성
    this.bricks = this.physics.add.staticGroup();
    this.createBricks();

    // 충돌 설정
    this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, undefined, this);
    this.physics.add.collider(this.ball, this.bricks, this.hitBrick, undefined, this);

    // 키보드 입력
    this.cursors = this.input.keyboard?.createCursorKeys();

    // 스페이스바로 게임 시작
    this.input.keyboard?.once('keydown-SPACE', () => {
      if (!this.gameStarted && !this.gameOver) {
        this.startGame();
        startText.destroy();
      }
    });

    // 모바일 터치 지원
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.gameStarted && !this.gameOver && this.paddle) {
        this.paddle.x = Phaser.Math.Clamp(pointer.x, 60, 740);
      }
    });
  }

  update() {
    if (this.gameOver || !this.gameStarted) return;

    // 키보드로 패들 이동
    if (this.cursors && this.paddle) {
      if (this.cursors.left.isDown) {
        this.paddle.x -= 8;
      } else if (this.cursors.right.isDown) {
        this.paddle.x += 8;
      }
      this.paddle.x = Phaser.Math.Clamp(this.paddle.x, 60, 740);
    }

    // 공이 아래로 떨어지면
    if (this.ball && this.ball.y > 600) {
      this.lives--;
      this.updateLives();

      if (this.lives > 0) {
        this.resetBall();
      } else {
        this.endGame();
      }
    }
  }

  private createBricks() {
    const rows = 5;
    const cols = 10;
    const brickWidth = 70;
    const brickHeight = 25;
    const padding = 10;
    const offsetX = 35;
    const offsetY = 100;

    const colors = [0xef4444, 0xf59e0b, 0x10b981, 0x3b82f6, 0x8b5cf6];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * (brickWidth + padding);
        const y = offsetY + row * (brickHeight + padding);

        const brick = this.add.rectangle(x, y, brickWidth, brickHeight, colors[row]);
        this.bricks?.add(brick);
      }
    }
  }

  private startGame() {
    this.gameStarted = true;
    // 공을 랜덤한 방향으로 발사
    const angle = Phaser.Math.Between(-45, 45);
    const velocity = 300;
    this.ball?.setVelocity(
      velocity * Math.sin(angle * Math.PI / 180),
      -velocity * Math.cos(angle * Math.PI / 180)
    );
  }

  private hitPaddle() {
    // 패들과 공의 충돌 시 각도 조절
    if (this.ball && this.paddle) {
      const diff = this.ball.x - this.paddle.x;
      this.ball.setVelocityX(diff * 10);
    }
  }

  private hitBrick(_ball: any, brick: any) {
    // 벽돌 파괴
    brick.destroy();

    // 점수 증가
    this.score += 10;
    this.updateScore();

    // 모든 벽돌 제거 시 승리
    if (this.bricks?.countActive() === 0) {
      this.winGame();
    }
  }

  private resetBall() {
    if (this.ball && this.paddle) {
      this.ball.setPosition(this.paddle.x, 500);
      this.ball.setVelocity(0, 0);

      // 1초 후 재시작
      this.time.delayedCall(1000, () => {
        const angle = Phaser.Math.Between(-45, 45);
        const velocity = 300;
        this.ball?.setVelocity(
          velocity * Math.sin(angle * Math.PI / 180),
          -velocity * Math.cos(angle * Math.PI / 180)
        );
      });
    }
  }

  private updateScore() {
    this.scoreText?.setText(`Score: ${this.score}`);
  }

  private updateLives() {
    this.livesText?.setText(`Lives: ${this.lives}`);
  }

  private endGame() {
    this.gameOver = true;
    this.gameStarted = false;
    this.ball?.setVelocity(0, 0);

    // 게임 오버 메시지
    this.add.text(400, 300, 'Game Over!', {
      fontSize: '48px',
      color: COLORS.danger,
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 350, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: COLORS.white,
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 게임 종료 이벤트 발생
    this.events.emit('gameOver', { score: this.score });
  }

  private winGame() {
    this.gameOver = true;
    this.gameStarted = false;
    this.ball?.setVelocity(0, 0);

    // 승리 메시지
    this.add.text(400, 300, 'You Win!', {
      fontSize: '48px',
      color: COLORS.success,
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 350, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: COLORS.white,
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 게임 승리 이벤트 발생
    this.events.emit('gameWin', { score: this.score });
  }

  public getScore(): number {
    return this.score;
  }
}
