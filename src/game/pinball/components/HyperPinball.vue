<template>
  <div class="hyper-pinball-container">
    <!-- 로딩 상태 -->
    <div v-if="gameState === 'loading'" class="loading-overlay">
      <video
        autoplay
        loop
        muted
        playsinline
        class="loading-video"
      >
        <source src="/loading-character.mp4" type="video/mp4" />
      </video>
      <p>게임 로딩 중...</p>
    </div>

    <!-- 게임 캔버스 -->
    <canvas
      ref="canvasRef"
      class="game-canvas"
      @contextmenu.prevent
    ></canvas>

    <!-- UI 오버레이 -->
    <div class="ui-overlay">
      <!-- 상단 점수판 -->
      <div class="score-panel">
        <div class="score-item">
          <span class="label">SCORE</span>
          <span class="value">{{ formattedScore }}</span>
        </div>
        <div class="score-item">
          <span class="label">COMBO</span>
          <span class="value" :class="{ 'combo-active': score.combo > 0 }">
            x{{ score.combo || 1 }}
          </span>
        </div>
        <div class="score-item balls">
          <span class="label">BALLS</span>
          <div class="ball-icons">
            <span
              v-for="i in 3"
              :key="i"
              class="ball-icon"
              :class="{ active: i <= score.balls }"
            >⚪</span>
          </div>
        </div>
      </div>

      <!-- 게임 상태 메시지 -->
      <div v-if="gameState === 'ready'" class="state-message ready">
        <p>화면 아래를 터치하거나<br>스페이스바를 눌러 발사!</p>
      </div>

      <div v-if="gameState === 'paused'" class="state-message paused">
        <p>일시정지</p>
        <button @click="resumeGame" class="btn-primary">계속하기</button>
      </div>

      <!-- 게임 오버 상태는 GameResultModal에서 처리 -->

      <!-- 컨트롤 힌트 (첫 플레이 시) -->
      <div v-if="showControlHints" class="control-hints">
        <div class="hint left">
          <span class="icon">👆</span>
          <span class="text">왼쪽 플리퍼</span>
        </div>
        <div class="hint right">
          <span class="icon">👆</span>
          <span class="text">오른쪽 플리퍼</span>
        </div>
        <div class="hint bottom">
          <span class="icon">📱</span>
          <span class="text">흔들어서 Nudge!</span>
        </div>
      </div>

      <!-- 일시정지 버튼 -->
      <button
        v-if="gameState === 'playing'"
        @click="pauseGame"
        class="btn-pause"
      >
        ⏸
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { Application, type GameState, type GameScore } from '../core/Application';

// Props
const props = defineProps<{
  qrCode?: string;
}>();

// Emits
const emit = defineEmits<{
  (e: 'gameOver', data: { score: number; time: number; maxCombo: number; ballsUsed: number; grade: { icon: string; text: string; color: string } }): void;
  (e: 'exit'): void;
  (e: 'restart'): void;
}>();

// 점수에 따른 등급 계산
function getGrade(score: number): { icon: string; text: string; color: string } {
  if (score >= 100000) return { icon: 'trophy', text: '핀볼 레전드', color: '#f59e0b' }
  if (score >= 50000) return { icon: 'target', text: '핀볼 마스터', color: '#f43f5e' }
  if (score >= 25000) return { icon: 'star', text: '프로 플레이어', color: '#ec4899' }
  if (score >= 10000) return { icon: 'gamepad', text: '숙련된 게이머', color: '#8b5cf6' }
  return { icon: 'tent', text: '도전자', color: '#6b7280' }
}

// Refs
const canvasRef = ref<HTMLCanvasElement | null>(null);
const gameState = ref<GameState>('loading');
const score = ref<GameScore>({
  score: 0,
  balls: 3,
  combo: 0,
  maxCombo: 0,
});
const showControlHints = ref(true);

// Game instance
let app: Application | null = null;
let gameStartTime = Date.now();

// Computed
const formattedScore = computed(() => {
  return score.value.score.toLocaleString();
});

// Lifecycle
onMounted(async () => {
  if (!canvasRef.value) return;

  try {
    // Application 생성 및 초기화
    app = new Application();

    // 콜백 설정
    app.setCallbacks({
      onScoreUpdate: (newScore) => {
        score.value = newScore;
      },
      onStateChange: (newState) => {
        gameState.value = newState;
      },
      onBallLost: (ballsRemaining) => {
        console.log('Ball lost! Remaining:', ballsRemaining);
      },
      onGameOver: (finalScore) => {
        // 게임 결과 데이터를 상위 컴포넌트로 전달
        emit('gameOver', {
          score: finalScore,
          time: Math.floor((Date.now() - gameStartTime) / 1000),
          maxCombo: score.value.maxCombo,
          ballsUsed: 3 - score.value.balls,
          grade: getGrade(finalScore)
        });
      },
      onReady: () => {
        // 게임 시작 시간 기록
        gameStartTime = Date.now();
        // 게임 준비 완료, 5초 후 컨트롤 힌트 숨김
        setTimeout(() => {
          showControlHints.value = false;
        }, 5000);
      },
    });

    // 초기화 (WASM 로딩 포함) - init() 내부에서 자동으로 start() 호출됨
    await app.init(canvasRef.value);
  } catch (error) {
    console.error('Game initialization failed:', error);
    gameState.value = 'loading'; // 에러 상태 처리 필요
  }
});

onBeforeUnmount(() => {
  if (app) {
    app.destroy();
    app = null;
  }
});

// Methods
function pauseGame() {
  app?.pause();
}

function resumeGame() {
  app?.resume();
}

function restartGame() {
  gameStartTime = Date.now();
  app?.restart();
  app?.start();
}

// 외부에서 호출 가능한 restart 함수
defineExpose({
  restartGame
})

function exitGame() {
  emit('exit');
}
</script>

<style scoped>
.hyper-pinball-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #0a0a1a;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 로딩 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(10, 10, 26, 0.95);
  z-index: 100;
}

.loading-video {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 12px;
}

.loading-overlay p {
  margin-top: 1rem;
  color: #a0aec0;
  font-size: 1.2rem;
}

/* UI 오버레이 */
.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

/* 점수판 */
.score-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  background: linear-gradient(to bottom, rgba(10, 10, 26, 0.9), transparent);
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-item .label {
  font-size: 0.75rem;
  color: #a0aec0;
  letter-spacing: 0.1em;
}

.score-item .value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  font-family: 'Monaco', 'Consolas', monospace;
}

.score-item .value.combo-active {
  color: #fbbf24;
  animation: pulse 0.3s ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.ball-icons {
  display: flex;
  gap: 0.25rem;
}

.ball-icon {
  font-size: 1rem;
  opacity: 0.3;
  transition: opacity 0.3s;
}

.ball-icon.active {
  opacity: 1;
}

/* 상태 메시지 */
.state-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  padding: 2rem;
  background: rgba(10, 10, 26, 0.95);
  border-radius: 16px;
  border: 2px solid #3b82f6;
  pointer-events: auto;
}

.state-message.ready p {
  color: #a0aec0;
  font-size: 1.2rem;
  line-height: 1.6;
}

.state-message.game-over h2 {
  font-size: 2.5rem;
  color: #ef4444;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
}

.final-score {
  font-size: 1.5rem;
  color: #fbbf24;
  margin-bottom: 0.5rem;
}

.max-combo {
  font-size: 1rem;
  color: #a0aec0;
  margin-bottom: 1.5rem;
}

/* 버튼 */
.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #a0aec0;
  border: 2px solid #4a5568;
}

.btn-secondary:hover {
  border-color: #3b82f6;
  color: #fff;
}

.btn-pause {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  pointer-events: auto;
  transition: background 0.2s;
}

.btn-pause:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 컨트롤 힌트 */
.control-hints {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.hint .icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.hint.bottom {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
}

/* 반응형 */
@media (max-width: 480px) {
  .score-panel {
    padding: 0.5rem;
  }

  .score-item .value {
    font-size: 1.2rem;
  }

  .state-message {
    width: 90%;
    padding: 1.5rem;
  }

  .state-message.game-over h2 {
    font-size: 2rem;
  }
}
</style>
