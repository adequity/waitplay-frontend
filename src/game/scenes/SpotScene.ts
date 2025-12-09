/**
 * Spot Difference Game Scene
 * 틀린 그림 찾기 게임 - 두 그림의 다른 부분을 찾는 게임
 */

import * as Phaser from 'phaser';
import { COLORS } from '../config';
import { submitGameScore } from '../../services/gameScoreService';

interface Difference {
  x: number;
  y: number;
  found: boolean;
  sprite?: Phaser.GameObjects.Arc;
}

export class SpotScene extends Phaser.Scene {
  private differences: Difference[] = [];
  private foundCount: number = 0;
  private readonly TOTAL_DIFFERENCES = 5;
  private foundText?: Phaser.GameObjects.Text;
  private timeText?: Phaser.GameObjects.Text;
  private startTime: number = 0;
  private elapsedTime: number = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private gameStarted: boolean = false;
  private gameOver: boolean = false;

  constructor() {
    super({ key: 'SpotScene' });
  }

  create() {
    // 배경
    this.add.rectangle(400, 300, 800, 600, 0x0f0f23);

    // UI 텍스트
    this.foundText = this.add.text(16, 16, `찾은 개수: 0/${this.TOTAL_DIFFERENCES}`, {
      fontSize: '24px',
      color: COLORS.white
    });

    this.timeText = this.add.text(650, 16, '시간: 0초', {
      fontSize: '24px',
      color: COLORS.white
    });

    // 타이틀
    const title = this.add.text(400, 80, '틀린 그림 찾기', {
      fontSize: '36px',
      color: COLORS.primary,
      align: 'center'
    }).setOrigin(0.5);

    const instructions = this.add.text(400, 130, '두 그림에서 다른 부분 5개를 찾으세요!', {
      fontSize: '18px',
      color: COLORS.white,
      align: 'center'
    }).setOrigin(0.5);

    // 왼쪽 그림 생성
    this.createLeftPicture();

    // 오른쪽 그림 생성 (차이점 포함)
    this.createRightPicture();

    // 시작 버튼
    const startButton = this.add.text(400, 540, '게임 시작', {
      fontSize: '28px',
      color: COLORS.white,
      backgroundColor: COLORS.primary,
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      this.startGame();
      startButton.destroy();
      title.destroy();
      instructions.destroy();
    });
  }

  private createLeftPicture() {
    const leftContainer = this.add.rectangle(200, 330, 320, 360, 0xffffff);
    leftContainer.setStrokeStyle(4, 0x6366f1);

    // 왼쪽 그림에 요소들 추가 (원본)
    this.addPictureElements(200, 330, false);
  }

  private createRightPicture() {
    const rightContainer = this.add.rectangle(600, 330, 320, 360, 0xffffff);
    rightContainer.setStrokeStyle(4, 0x8b5cf6);

    // 오른쪽 그림에 요소들 추가 (차이점 포함)
    this.addPictureElements(600, 330, true);
  }

  private addPictureElements(baseX: number, baseY: number, withDifferences: boolean) {
    // 집
    const houseColor = withDifferences && this.isDifference(0) ? 0xef4444 : 0x3b82f6;
    this.add.rectangle(baseX, baseY - 30, 100, 80, houseColor);
    this.add.triangle(baseX, baseY - 85, baseX - 60, baseY - 40, baseX + 60, baseY - 40, 0xef4444);

    // 문
    this.add.rectangle(baseX, baseY + 10, 30, 40, 0x8b5cf6);

    // 나무
    const treeX = baseX - 80;
    this.add.rectangle(treeX, baseY + 20, 15, 50, 0x78350f);
    const treeColor = withDifferences && this.isDifference(1) ? 0xfbbf24 : 0x10b981;
    this.add.circle(treeX, baseY - 20, 30, treeColor);

    // 태양
    const sunSize = withDifferences && this.isDifference(2) ? 35 : 25;
    this.add.circle(baseX + 100, baseY - 100, sunSize, 0xfbbf24);

    // 구름
    const cloudX = withDifferences && this.isDifference(3) ? baseX - 50 : baseX + 50;
    this.add.circle(cloudX, baseY - 100, 20, 0xe5e7eb);
    this.add.circle(cloudX + 15, baseY - 105, 25, 0xe5e7eb);
    this.add.circle(cloudX + 35, baseY - 100, 20, 0xe5e7eb);

    // 꽃
    const flowerX = baseX + 70;
    this.add.circle(flowerX, baseY + 50, 8, withDifferences && this.isDifference(4) ? 0xf472b6 : 0xef4444);
    this.add.rectangle(flowerX, baseY + 60, 3, 20, 0x10b981);

    // 차이점이 있는 오른쪽 그림인 경우, 클릭 영역 설정
    if (withDifferences) {
      // 각 차이점 영역에 클릭 감지 추가
      this.addDifferenceClickZone(0, baseX, baseY - 30, 100, 80); // 집
      this.addDifferenceClickZone(1, treeX, baseY - 20, 60, 60); // 나무
      this.addDifferenceClickZone(2, baseX + 100, baseY - 100, 70, 70); // 태양
      this.addDifferenceClickZone(3, cloudX + 15, baseY - 100, 70, 50); // 구름
      this.addDifferenceClickZone(4, flowerX, baseY + 50, 25, 25); // 꽃
    }
  }

  private isDifference(index: number): boolean {
    return this.differences[index]?.found === false;
  }

  private addDifferenceClickZone(index: number, x: number, y: number, width: number, height: number) {
    const zone = this.add.rectangle(x, y, width, height, 0x000000, 0);
    zone.setInteractive();

    const diff: Difference = {
      x,
      y,
      found: false
    };

    this.differences[index] = diff;

    zone.on('pointerdown', () => {
      if (this.gameStarted && !this.gameOver && !diff.found) {
        this.foundDifference(diff, index);
      }
    });
  }

  private startGame() {
    this.gameStarted = true;
    this.startTime = Date.now();

    // 타이머 시작
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  private updateTimer() {
    this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    this.timeText?.setText(`시간: ${this.elapsedTime}초`);
  }

  private foundDifference(diff: Difference, index: number) {
    diff.found = true;
    this.foundCount++;

    // 찾은 위치에 표시
    const circle = this.add.circle(diff.x, diff.y, 30, 0x10b981, 0);
    circle.setStrokeStyle(4, 0x10b981);
    diff.sprite = circle;

    // 애니메이션
    this.tweens.add({
      targets: circle,
      scale: { from: 0, to: 1 },
      alpha: { from: 1, to: 0.3 },
      duration: 500
    });

    // UI 업데이트
    this.foundText?.setText(`찾은 개수: ${this.foundCount}/${this.TOTAL_DIFFERENCES}`);

    // 모든 차이점을 찾았을 때
    if (this.foundCount === this.TOTAL_DIFFERENCES) {
      this.time.delayedCall(500, () => {
        this.endGame();
      });
    }
  }

  private async endGame() {
    if (this.gameOver) return;
    this.gameOver = true;

    // 타이머 중지
    this.timerEvent?.remove();

    // 점수 계산 (시간이 짧을수록 높은 점수)
    const baseScore = 1000;
    const timePenalty = this.elapsedTime * 5;
    const finalScore = Math.max(100, baseScore - timePenalty);

    // 결과 화면
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);

    const resultText = this.add.text(400, 200, '완료!', {
      fontSize: '48px',
      color: COLORS.success,
      align: 'center'
    }).setOrigin(0.5);

    const statsText = this.add.text(
      400,
      270,
      `완료 시간: ${this.elapsedTime}초\n점수: ${finalScore}`,
      {
        fontSize: '28px',
        color: COLORS.white,
        align: 'center',
        lineSpacing: 15
      }
    ).setOrigin(0.5);

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
        gameType: 'spot-difference',
        playerName,
        score: finalScore
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
