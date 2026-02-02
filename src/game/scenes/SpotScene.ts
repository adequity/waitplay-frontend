/**
 * Spot Difference Game Scene - 틀린 그림 찾기
 * Admin이 업로드한 이미지 기반 게임
 * 세로 배치 (모바일 최적화)
 */

import * as Phaser from 'phaser';
import { submitGameScore } from '../../services/gameScoreService';
import { gameManager } from '../GameManager';
import { getSpotDifferenceByQrCode, type SpotDifferenceGame, type DifferencePoint } from '../../services/spotDifferenceService';

interface FoundDifference {
  point: DifferencePoint;
  found: boolean;
  marker?: Phaser.GameObjects.Arc;
}

export class SpotScene extends Phaser.Scene {
  // 게임 데이터
  private gameData: SpotDifferenceGame | null = null;
  private foundDifferences: FoundDifference[] = [];
  private foundCount: number = 0;
  private totalDifferences: number = 0;

  // UI 요소
  private foundText?: Phaser.GameObjects.Text;
  private timeText?: Phaser.GameObjects.Text;
  private hintsText?: Phaser.GameObjects.Text;
  private titleElements: Phaser.GameObjects.GameObject[] = [];

  // 타이머
  private startTime: number = 0;
  private elapsedTime: number = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timeLimit: number = 0;

  // 힌트
  private hintsRemaining: number = 3;

  // 게임 상태
  private gameStarted: boolean = false;
  private gameOver: boolean = false;
  private isLoading: boolean = true;

  // 이미지
  private originalImage?: Phaser.GameObjects.Image;
  private modifiedImage?: Phaser.GameObjects.Image;
  private imageWidth: number = 0;
  private imageHeight: number = 0;

  // 매장 정보
  private storeName?: string;
  private logoUrl?: string;

  constructor() {
    super({ key: 'SpotScene' });
  }

  init() {
    this.gameData = null;
    this.foundDifferences = [];
    this.foundCount = 0;
    this.totalDifferences = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timeLimit = 0;
    this.hintsRemaining = 3;
    this.gameStarted = false;
    this.gameOver = false;
    this.isLoading = true;
    this.titleElements = [];
  }

  async create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // 배경
    this.add.rectangle(W / 2, H / 2, W, H, 0x1a1a2e);

    // 로딩 표시
    const loadingText = this.add.text(W / 2, H / 2, '게임 데이터 로딩 중...', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // QR 코드로 게임 데이터 조회
    const qrCode = gameManager.getQrCode();
    if (qrCode) {
      this.gameData = await getSpotDifferenceByQrCode(qrCode);
    }

    loadingText.destroy();
    this.isLoading = false;

    if (!this.gameData) {
      // 데이터 없음 - 폴백 (기본 도형 모드)
      this.showNoDataScreen();
      return;
    }

    // 게임 설정 적용
    this.totalDifferences = this.gameData.differenceCount;
    this.timeLimit = this.gameData.timeLimit;
    this.hintsRemaining = this.gameData.hintsAllowed;
    this.storeName = this.gameData.storeName;
    this.logoUrl = this.gameData.logoUrl;

    // 차이점 데이터 초기화
    this.foundDifferences = this.gameData.differences.map(point => ({
      point,
      found: false
    }));

    // 이미지 프리로드
    await this.loadImages();

    // 시작 화면 표시
    this.showStartScreen();
  }

  private showNoDataScreen() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.text(W / 2, H / 2 - 50, '😢', {
      fontSize: '64px'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 20, '등록된 틀린그림찾기가 없습니다', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 60, '관리자에게 문의해주세요', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  private loadImages(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.gameData) {
        resolve();
        return;
      }

      let loadedCount = 0;
      const checkComplete = () => {
        loadedCount++;
        if (loadedCount >= 2) {
          resolve();
        }
      };

      // 원본 이미지
      this.load.image('spot-original', this.gameData.originalImageUrl);
      // 차이점 이미지
      this.load.image('spot-modified', this.gameData.modifiedImageUrl);

      this.load.once('complete', () => {
        resolve();
      });

      this.load.start();
    });
  }

  private showStartScreen() {
    const W = this.scale.width;
    const H = this.scale.height;

    // 타이틀
    const title = this.add.text(W / 2, H * 0.15, '🔍 틀린 그림 찾기', {
      fontSize: '28px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.titleElements.push(title);

    // 매장명
    if (this.storeName) {
      const storeText = this.add.text(W / 2, H * 0.22, this.storeName, {
        fontSize: '18px',
        color: '#a78bfa'
      }).setOrigin(0.5);
      this.titleElements.push(storeText);
    }

    // 게임 설명
    const desc = this.add.text(W / 2, H * 0.35,
      `두 그림에서 다른 부분 ${this.totalDifferences}개를 찾으세요!`, {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    this.titleElements.push(desc);

    // 난이도 표시
    const difficultyText = ['쉬움', '보통', '어려움'][this.gameData!.difficulty - 1] || '보통';
    const difficultyColor = ['#10b981', '#fbbf24', '#ef4444'][this.gameData!.difficulty - 1] || '#fbbf24';
    const difficulty = this.add.text(W / 2, H * 0.42, `난이도: ${difficultyText}`, {
      fontSize: '16px',
      color: difficultyColor
    }).setOrigin(0.5);
    this.titleElements.push(difficulty);

    // 제한시간
    if (this.timeLimit > 0) {
      const timeInfo = this.add.text(W / 2, H * 0.48, `제한시간: ${this.timeLimit}초`, {
        fontSize: '16px',
        color: '#ef4444'
      }).setOrigin(0.5);
      this.titleElements.push(timeInfo);
    }

    // 힌트 정보
    const hintInfo = this.add.text(W / 2, H * 0.54, `힌트: ${this.hintsRemaining}회 사용 가능`, {
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);
    this.titleElements.push(hintInfo);

    // 미리보기 이미지 (작게)
    const previewY = H * 0.7;
    const previewScale = 0.25;

    if (this.textures.exists('spot-original')) {
      const preview = this.add.image(W / 2, previewY, 'spot-original');
      const frame = this.textures.getFrame('spot-original');
      if (frame) {
        const scale = Math.min((W * 0.6) / frame.width, (H * 0.2) / frame.height);
        preview.setScale(scale);
      }
      this.titleElements.push(preview);
    }

    // 시작 버튼
    const startBtn = this.add.text(W / 2, H * 0.88, '🎮 게임 시작', {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#6366f1',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.titleElements.push(startBtn);

    startBtn.on('pointerover', () => startBtn.setBackgroundColor('#4f46e5'));
    startBtn.on('pointerout', () => startBtn.setBackgroundColor('#6366f1'));
    startBtn.on('pointerdown', () => {
      this.titleElements.forEach(el => el.destroy());
      this.titleElements = [];
      this.startGame();
    });
  }

  private startGame() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.gameStarted = true;
    this.startTime = Date.now();

    // UI 패널 (상단)
    const uiPanel = this.add.rectangle(W / 2, 40, W, 80, 0x2d2d44);

    // 찾은 개수
    this.foundText = this.add.text(20, 25, `찾음: 0/${this.totalDifferences}`, {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 시간
    this.timeText = this.add.text(W / 2, 25, '시간: 0초', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    // 힌트 버튼
    this.hintsText = this.add.text(W - 20, 25, `💡 힌트 (${this.hintsRemaining})`, {
      fontSize: '16px',
      color: '#fbbf24',
      backgroundColor: '#3d3d5c',
      padding: { x: 10, y: 5 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    this.hintsText.on('pointerdown', () => this.useHint());

    // 타이머 시작
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 이미지 배치 (세로 - 위/아래)
    this.setupImages();
  }

  private setupImages() {
    const W = this.scale.width;
    const H = this.scale.height;

    const imageAreaTop = 90;
    const imageAreaHeight = H - imageAreaTop - 10;
    const imageHeight = (imageAreaHeight - 20) / 2; // 두 이미지 + 간격

    // 이미지 프레임 정보
    const frame = this.textures.getFrame('spot-original');
    if (!frame) return;

    const imgWidth = frame.width;
    const imgHeight = frame.height;

    // 스케일 계산 (이미지가 화면에 맞도록)
    const scaleX = (W - 20) / imgWidth;
    const scaleY = imageHeight / imgHeight;
    const scale = Math.min(scaleX, scaleY);

    this.imageWidth = imgWidth * scale;
    this.imageHeight = imgHeight * scale;

    // 원본 이미지 (위)
    const originalY = imageAreaTop + imageHeight / 2;
    this.originalImage = this.add.image(W / 2, originalY, 'spot-original');
    this.originalImage.setScale(scale);
    this.originalImage.setInteractive({ useHandCursor: true });

    // 원본 이미지 테두리
    const originalBorder = this.add.rectangle(
      W / 2, originalY,
      this.imageWidth + 4, this.imageHeight + 4
    );
    originalBorder.setStrokeStyle(2, 0x6366f1);

    // 원본 라벨
    this.add.text(W / 2, originalY - this.imageHeight / 2 - 15, '원본', {
      fontSize: '14px',
      color: '#6366f1'
    }).setOrigin(0.5);

    // 차이점 이미지 (아래)
    const modifiedY = originalY + imageHeight + 20;
    this.modifiedImage = this.add.image(W / 2, modifiedY, 'spot-modified');
    this.modifiedImage.setScale(scale);
    this.modifiedImage.setInteractive({ useHandCursor: true });

    // 차이점 이미지 테두리
    const modifiedBorder = this.add.rectangle(
      W / 2, modifiedY,
      this.imageWidth + 4, this.imageHeight + 4
    );
    modifiedBorder.setStrokeStyle(2, 0xa78bfa);

    // 차이점 라벨
    this.add.text(W / 2, modifiedY - this.imageHeight / 2 - 15, '차이점을 찾으세요!', {
      fontSize: '14px',
      color: '#a78bfa'
    }).setOrigin(0.5);

    // 클릭 이벤트 설정 (아래 이미지에서만 클릭 감지)
    this.modifiedImage.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameStarted || this.gameOver) return;
      this.handleImageClick(pointer);
    });

    // 원본 이미지에서도 클릭 감지 (동일한 좌표로 매핑)
    this.originalImage.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.gameStarted || this.gameOver) return;
      this.handleImageClick(pointer);
    });
  }

  private handleImageClick(pointer: Phaser.Input.Pointer) {
    if (!this.modifiedImage) return;

    // 클릭 좌표를 이미지 비율 좌표로 변환
    const imgBounds = this.modifiedImage.getBounds();
    const relX = (pointer.x - imgBounds.left) / imgBounds.width;
    const relY = (pointer.y - imgBounds.top) / imgBounds.height;

    // 원본 이미지 클릭 시 좌표 변환
    if (this.originalImage) {
      const origBounds = this.originalImage.getBounds();
      if (pointer.x >= origBounds.left && pointer.x <= origBounds.right &&
          pointer.y >= origBounds.top && pointer.y <= origBounds.bottom) {
        const origRelX = (pointer.x - origBounds.left) / origBounds.width;
        const origRelY = (pointer.y - origBounds.top) / origBounds.height;
        this.checkDifference(origRelX, origRelY);
        return;
      }
    }

    // 차이점 이미지 범위 내 클릭인지 확인
    if (relX >= 0 && relX <= 1 && relY >= 0 && relY <= 1) {
      this.checkDifference(relX, relY);
    }
  }

  private checkDifference(relX: number, relY: number) {
    // 찾지 않은 차이점 중에서 클릭 위치와 가까운 것 찾기
    for (const diff of this.foundDifferences) {
      if (diff.found) continue;

      const distance = Math.sqrt(
        Math.pow(relX - diff.point.x, 2) +
        Math.pow(relY - diff.point.y, 2)
      );

      // 클릭 허용 범위 (radius + 여유값)
      const tolerance = diff.point.radius + 0.03;

      if (distance <= tolerance) {
        this.markDifferenceFound(diff);
        return;
      }
    }

    // 못 찾음 - 실패 효과
    this.showMissEffect(relX, relY);
  }

  private markDifferenceFound(diff: FoundDifference) {
    diff.found = true;
    this.foundCount++;

    // 양쪽 이미지에 마커 표시
    if (this.originalImage && this.modifiedImage) {
      const origBounds = this.originalImage.getBounds();
      const modBounds = this.modifiedImage.getBounds();

      // 원본 이미지에 마커
      const origX = origBounds.left + diff.point.x * origBounds.width;
      const origY = origBounds.top + diff.point.y * origBounds.height;
      const origMarker = this.add.circle(origX, origY, diff.point.radius * origBounds.width, 0x10b981, 0);
      origMarker.setStrokeStyle(3, 0x10b981);

      // 차이점 이미지에 마커
      const modX = modBounds.left + diff.point.x * modBounds.width;
      const modY = modBounds.top + diff.point.y * modBounds.height;
      const modMarker = this.add.circle(modX, modY, diff.point.radius * modBounds.width, 0x10b981, 0);
      modMarker.setStrokeStyle(3, 0x10b981);

      // 애니메이션
      this.tweens.add({
        targets: [origMarker, modMarker],
        scale: { from: 0, to: 1 },
        alpha: { from: 1, to: 0.6 },
        duration: 300,
        ease: 'Back.easeOut'
      });

      // 성공 사운드 효과 (시각적)
      const successText = this.add.text(modX, modY - 30, '✓', {
        fontSize: '24px',
        color: '#10b981'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: successText,
        y: modY - 50,
        alpha: 0,
        duration: 500,
        onComplete: () => successText.destroy()
      });
    }

    // UI 업데이트
    this.foundText?.setText(`찾음: ${this.foundCount}/${this.totalDifferences}`);

    // 모두 찾았는지 확인
    if (this.foundCount >= this.totalDifferences) {
      this.time.delayedCall(500, () => this.endGame(true));
    }
  }

  private showMissEffect(relX: number, relY: number) {
    if (!this.modifiedImage) return;

    const bounds = this.modifiedImage.getBounds();
    const x = bounds.left + relX * bounds.width;
    const y = bounds.top + relY * bounds.height;

    // X 표시
    const miss = this.add.text(x, y, '✗', {
      fontSize: '24px',
      color: '#ef4444'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: miss,
      alpha: 0,
      scale: 1.5,
      duration: 400,
      onComplete: () => miss.destroy()
    });
  }

  private useHint() {
    if (this.hintsRemaining <= 0 || this.gameOver) return;

    // 아직 찾지 않은 차이점 찾기
    const notFound = this.foundDifferences.filter(d => !d.found);
    if (notFound.length === 0) return;

    this.hintsRemaining--;
    this.hintsText?.setText(`💡 힌트 (${this.hintsRemaining})`);

    // 랜덤하게 하나 선택
    const hint = notFound[Math.floor(Math.random() * notFound.length)];
    if (!hint) return;

    // 힌트 효과 (양쪽 이미지에 원 깜빡임)
    if (this.originalImage && this.modifiedImage) {
      const origBounds = this.originalImage.getBounds();
      const modBounds = this.modifiedImage.getBounds();

      const origX = origBounds.left + hint.point.x * origBounds.width;
      const origY = origBounds.top + hint.point.y * origBounds.height;
      const modX = modBounds.left + hint.point.x * modBounds.width;
      const modY = modBounds.top + hint.point.y * modBounds.height;

      const radius = hint.point.radius * origBounds.width * 1.5;

      const hintCircle1 = this.add.circle(origX, origY, radius, 0xfbbf24, 0);
      hintCircle1.setStrokeStyle(3, 0xfbbf24);
      const hintCircle2 = this.add.circle(modX, modY, radius, 0xfbbf24, 0);
      hintCircle2.setStrokeStyle(3, 0xfbbf24);

      // 깜빡임 애니메이션
      this.tweens.add({
        targets: [hintCircle1, hintCircle2],
        alpha: { from: 1, to: 0.3 },
        scale: { from: 1, to: 1.2 },
        duration: 300,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          hintCircle1.destroy();
          hintCircle2.destroy();
        }
      });
    }
  }

  private updateTimer() {
    if (!this.gameStarted || this.gameOver) return;

    this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

    if (this.timeLimit > 0) {
      const remaining = this.timeLimit - this.elapsedTime;
      this.timeText?.setText(`남은시간: ${Math.max(0, remaining)}초`);

      if (remaining <= 10) {
        this.timeText?.setColor('#ef4444');
      }

      if (remaining <= 0) {
        this.endGame(false);
      }
    } else {
      this.timeText?.setText(`시간: ${this.elapsedTime}초`);
    }
  }

  private async endGame(success: boolean) {
    if (this.gameOver) return;
    this.gameOver = true;

    this.timerEvent?.remove();

    const W = this.scale.width;
    const H = this.scale.height;

    // 오버레이
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85);

    // 결과
    const resultEmoji = success ? '🎉' : '⏰';
    const resultText = success ? '성공!' : '시간 초과!';
    const resultColor = success ? '#10b981' : '#ef4444';

    this.add.text(W / 2, H * 0.25, resultEmoji, {
      fontSize: '64px'
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.35, resultText, {
      fontSize: '32px',
      color: resultColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 점수 계산
    const baseScore = success ? 1000 : 0;
    const timeBonus = success ? Math.max(0, (this.timeLimit > 0 ? this.timeLimit : 120) - this.elapsedTime) * 10 : 0;
    const hintPenalty = (this.gameData!.hintsAllowed - this.hintsRemaining) * 50;
    const difficultyBonus = (this.gameData!.difficulty - 1) * 200;
    const finalScore = Math.max(0, baseScore + timeBonus + difficultyBonus - hintPenalty);

    this.add.text(W / 2, H * 0.45, [
      `찾은 개수: ${this.foundCount}/${this.totalDifferences}`,
      `소요 시간: ${this.elapsedTime}초`,
      `사용한 힌트: ${this.gameData!.hintsAllowed - this.hintsRemaining}회`,
      ``,
      `최종 점수: ${finalScore}점`
    ].join('\n'), {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    // 이름 입력
    this.add.text(W / 2, H * 0.65, '이름을 입력하세요:', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);

    // HTML 입력
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = '플레이어 이름';
    inputElement.maxLength = 20;
    inputElement.style.cssText = `
      position: fixed;
      left: 50%;
      top: ${H * 0.7}px;
      transform: translateX(-50%);
      width: 250px;
      padding: 12px;
      font-size: 16px;
      border: 2px solid #6366f1;
      border-radius: 8px;
      text-align: center;
      background: #1a1a2e;
      color: #ffffff;
      z-index: 1000;
    `;
    document.getElementById('game-container')?.appendChild(inputElement);
    inputElement.focus();

    const submitBtn = document.createElement('button');
    submitBtn.textContent = '점수 제출';
    submitBtn.style.cssText = `
      position: fixed;
      left: 50%;
      top: ${H * 0.78}px;
      transform: translateX(-50%);
      padding: 12px 30px;
      font-size: 16px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      z-index: 1000;
    `;
    document.getElementById('game-container')?.appendChild(submitBtn);

    const submitScore = async () => {
      const playerName = inputElement.value.trim() || '익명';
      inputElement.remove();
      submitBtn.remove();

      const qrCode = gameManager.getQrCode();
      const result = await submitGameScore({
        gameType: 'spot-difference',
        playerName,
        score: finalScore,
        qrCode
      });

      // 제출 결과 표시
      const resultMsg = result ? '점수가 제출되었습니다!' : '점수 제출 실패';
      const msgColor = result ? '#10b981' : '#ef4444';

      const msgText = this.add.text(W / 2, H * 0.72, resultMsg, {
        fontSize: '16px',
        color: msgColor
      }).setOrigin(0.5);

      // 재시작 버튼
      this.time.delayedCall(1500, () => {
        const restartBtn = this.add.text(W / 2, H * 0.85, '🔄 다시 시작', {
          fontSize: '20px',
          color: '#ffffff',
          backgroundColor: '#6366f1',
          padding: { x: 25, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartBtn.on('pointerdown', () => {
          this.scene.restart();
        });
      });
    };

    submitBtn.onclick = submitScore;
    inputElement.onkeydown = (e) => {
      if (e.key === 'Enter') submitScore();
    };
  }
}
