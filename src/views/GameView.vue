<template>
  <div class="game-view" :class="{ fullscreen: isFullscreen }">
    <!-- 핀볼 게임: 새로운 Pixi.js + Rapier 기반 -->
    <HyperPinball
      v-if="isPinball"
      ref="pinballRef"
      :qr-code="qrCode"
      @game-over="handlePinballGameOver"
      @exit="goBack"
    />

    <!-- 다른 게임: Phaser 기반 -->
    <template v-else>
      <!-- 게임 로딩 오버레이 -->
      <div v-if="isGameLoading" class="game-loading-overlay">
        <video
          autoplay
          loop
          muted
          playsinline
          class="loading-video"
        >
          <source src="/loading-character.mp4" type="video/mp4" />
        </video>
        <p class="loading-text">게임 로딩 중...</p>
      </div>
      <!-- 전체화면 모드가 아닐 때만 헤더 표시 -->
      <div v-if="!isFullscreen" class="header">
        <h2>{{ gameTitle }}</h2>
        <button @click="goBack" class="btn-back">← 뒤로가기</button>
      </div>
      <!-- 전체화면 모드에서는 뒤로가기 플로팅 버튼 -->
      <button v-if="isFullscreen" @click="exitFullscreen" class="btn-exit-fullscreen">✕</button>
      <div id="game-container" ref="gameContainer" :class="{ 'fullscreen-container': isFullscreen }"></div>
    </template>

    <!-- 통합 게임 결과 모달 (모든 게임 공통) -->
    <GameResultModal
      v-if="gameResultData"
      :is-open="showGameResultModal"
      :game-data="gameResultData"
      :qr-code="qrCodeShort"
      :qr-code-uuid="qrCodeUuid"
      :game-type="mapGameTypeForApi(gameType)"
      @close="handleResultClose"
      @restart="handleRestart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gameManager } from '../game/GameManager'
import type { GameType } from '../game/config'
import GameResultModal from '@/components/GameResultModal.vue'

// 핀볼 컴포넌트 동적 로드 (Pixi.js + Rapier 번들 분리)
const HyperPinball = defineAsyncComponent(() =>
  import(/* webpackChunkName: "game-pinball-vue" */ '../game/pinball/components/HyperPinball.vue')
)

// 게임 결과 데이터 타입
interface GameResultData {
  score: number
  time: number
  grade: { icon: string; text: string; color: string }
  // Memory game specific
  moves?: number
  combo?: number
  // Spot difference game specific
  foundCount?: number
  totalDifferences?: number
  hintsUsed?: number
  success?: boolean
}

const route = useRoute()
const router = useRouter()
const gameContainer = ref<HTMLElement>()
// MATCH, SPOT 게임은 기본적으로 풀스크린 모드
const isFullscreen = ref(false)  // onMounted에서 게임 타입에 따라 설정됨
const isGameLoading = ref(true)

// Game state
const gameType = computed(() => (route.params.type as string).toUpperCase() as GameType)
const qrCode = computed(() => route.query.qr as string | undefined)
const isPinball = computed(() => gameType.value === 'PINBALL')

// 전체화면 지원 게임 (MATCH 카드 게임, SPOT 틀린그림찾기)
const supportsFullscreen = computed(() => ['MATCH', 'SPOT'].includes(gameType.value))

// QR Code ID from URL (short code)
const qrCodeShort = computed(() => route.query.qr as string | undefined)

// QR Code UUID for share API
const qrCodeUuid = ref<string | undefined>(undefined)

// Game result state
const finalScore = ref(0)

// 통합 결과 모달 상태 (모든 게임 공통)
const showGameResultModal = ref(false)
const gameResultData = ref<GameResultData | null>(null)

// 핀볼 ref
const pinballRef = ref<InstanceType<typeof HyperPinball> | null>(null)

const gameTitle = computed(() => {
  const titles: Record<GameType, string> = {
    PINBALL: '핀볼 게임',
    BRICK_BREAKER: '벽돌깨기 게임',
    MATCH: '카드 매치 게임',
    SPOT: '틀린그림찾기'
  }
  return titles[gameType.value] || '게임'
})

// 전체화면 진입
function enterFullscreen() {
  isFullscreen.value = true
  document.body.style.overflow = 'hidden'

  // 전체화면 API 시도
  const elem = document.documentElement
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch(() => {})
  } else if ((elem as any).webkitRequestFullscreen) {
    (elem as any).webkitRequestFullscreen()
  }
}

// 전체화면 종료
function exitFullscreen() {
  isFullscreen.value = false
  document.body.style.overflow = ''

  if (document.exitFullscreen) {
    document.exitFullscreen().catch(() => {})
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen()
  }

  goBack()
}

// 핀볼 게임 오버 핸들러 (통합 모달 사용)
interface PinballGameOverData {
  score: number
  time: number
  maxCombo: number
  ballsUsed: number
  grade: { icon: string; text: string; color: string }
}

function handlePinballGameOver(data: PinballGameOverData) {
  console.log('Pinball Game Over!', data)

  gameResultData.value = {
    score: data.score,
    time: data.time,
    grade: data.grade,
    combo: data.maxCombo,
    moves: data.ballsUsed // ballsUsed를 moves로 표시
  }
  finalScore.value = data.score
  showGameResultModal.value = true
}

// 게임 타입을 API용으로 변환
function mapGameTypeForApi(type: GameType): string {
  const mapping: Record<GameType, string> = {
    PINBALL: 'pinball',
    BRICK_BREAKER: 'brick-breaker',
    MATCH: 'memory',
    SPOT: 'spot-difference'
  }
  return mapping[type] || type.toLowerCase()
}


// Phaser 게임 이벤트 리스너 (통합 모달)
function handlePhaserGameOver(event: Event) {
  const customEvent = event as CustomEvent
  const detail = customEvent.detail

  gameResultData.value = {
    score: detail.score,
    time: detail.time,
    grade: detail.grade,
    moves: detail.moves,
    combo: detail.combo,
    foundCount: detail.foundCount,
    totalDifferences: detail.totalDifferences,
    hintsUsed: detail.hintsUsed,
    success: detail.success
  }
  finalScore.value = detail.score
  showGameResultModal.value = true
}

// 결과 모달 닫기
function handleResultClose() {
  showGameResultModal.value = false
  gameResultData.value = null
}

// 게임 재시작
function handleRestart() {
  showGameResultModal.value = false
  gameResultData.value = null

  if (isPinball.value) {
    // 핀볼 재시작
    pinballRef.value?.restartGame()
  } else {
    // Phaser 게임 재시작 이벤트 발생
    window.dispatchEvent(new CustomEvent('phaser-restart-game'))
  }
}

// 게임 로딩 완료 이벤트 리스너
function handleGameReady() {
  isGameLoading.value = false
}

onMounted(async () => {
  // 핀볼이 아닌 경우에만 Phaser 게임 초기화
  if (!isPinball.value && gameContainer.value) {
    // MATCH, SPOT 게임은 항상 풀스크린 모드로 시작 (기본값)
    if (supportsFullscreen.value) {
      enterFullscreen()
    }

    // Phaser 게임 이벤트 리스너 설정 (먼저 등록)
    window.addEventListener('phaser-game-over', handlePhaserGameOver)
    window.addEventListener('phaser-game-ready', handleGameReady)

    // QR UUID 조회와 게임 초기화를 병렬로 실행 (성능 최적화)
    const qrUuidPromise = qrCodeShort.value
      ? (async () => {
          try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://api.waitplay.co.kr'
            const response = await fetch(`${apiUrl}/api/qrcode/by-code/${encodeURIComponent(qrCodeShort.value!)}`)
            if (response.ok) {
              const qrData = await response.json()
              if (qrData?.id) {
                qrCodeUuid.value = qrData.id
              }
            }
          } catch (error) {
            console.error('QR 코드 UUID 조회 실패:', error)
          }
        })()
      : Promise.resolve()

    const gameInitPromise = (async () => {
      try {
        await gameManager.initGame(gameType.value, 'game-container', qrCode.value)
      } catch (error) {
        console.error('게임 초기화 실패:', error)
        isGameLoading.value = false
      }
    })()

    // 둘 다 완료될 때까지 대기
    await Promise.all([qrUuidPromise, gameInitPromise])
  }
})

onBeforeUnmount(() => {
  // 핀볼이 아닌 경우에만 Phaser 게임 정리
  if (!isPinball.value) {
    gameManager.destroyGame()
  }

  // 전체화면 모드 정리
  if (isFullscreen.value) {
    document.body.style.overflow = ''
  }

  // 이벤트 리스너 제거
  window.removeEventListener('phaser-game-over', handlePhaserGameOver)
  window.removeEventListener('phaser-game-ready', handleGameReady)
})

function goBack() {
  router.back()
}
</script>

<style scoped>
.game-view {
  padding: 2rem;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h2 {
  font-size: 2rem;
  color: #6366f1;
}

.btn-back {
  padding: 0.75rem 1.5rem;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-back:hover {
  background-color: #7c3aed;
}

#game-container {
  width: 100%;
  height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fdf2f8;  /* 게임 배경색과 동일 */
}

/* 전체화면 모드에서 게임 컨테이너 */
.fullscreen #game-container,
#game-container.fullscreen-container {
  width: 100vw !important;
  height: 100vh !important;
  position: fixed;
  top: 0;
  left: 0;
  background: #fdf2f8;  /* 게임 배경색과 동일 */
}

/* 전체화면 모드 스타일 */
.game-view.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
  z-index: 9999;
  background: #fdf2f8;  /* 게임 배경색과 동일 (pink-50) */
}

/* fullscreen-container는 위에서 정의됨 */

.fullscreen-container canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.btn-exit-fullscreen {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
}

.btn-exit-fullscreen:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

/* 게임 로딩 오버레이 */
.game-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  gap: 16px;
}

.game-loading-overlay .loading-video {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 16px;
}

.game-loading-overlay .loading-text {
  font-size: 16px;
  color: #86868b;
  font-weight: 500;
}
</style>
