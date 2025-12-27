<template>
  <div class="game-view" :class="{ fullscreen: isFullscreen }">
    <!-- 핀볼 게임: 새로운 Pixi.js + Rapier 기반 -->
    <HyperPinball
      v-if="isPinball"
      :qr-code="qrCode"
      @game-over="handleGameOver"
      @exit="goBack"
    />

    <!-- 다른 게임: Phaser 기반 -->
    <template v-else>
      <!-- 전체화면 모드가 아닐 때만 헤더 표시 -->
      <div v-if="!isFullscreen" class="header">
        <h2>{{ gameTitle }}</h2>
        <button @click="goBack" class="btn-back">← 뒤로가기</button>
      </div>
      <!-- 전체화면 모드에서는 뒤로가기 플로팅 버튼 -->
      <button v-if="isFullscreen" @click="exitFullscreen" class="btn-exit-fullscreen">✕</button>
      <div id="game-container" ref="gameContainer" :class="{ 'fullscreen-container': isFullscreen }"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gameManager } from '../game/GameManager'
import type { GameType } from '../game/config'
import HyperPinball from '../game/pinball/components/HyperPinball.vue'

const route = useRoute()
const router = useRouter()
const gameContainer = ref<HTMLElement>()
const isFullscreen = ref(false)

const gameType = computed(() => (route.params.type as string).toUpperCase() as GameType)
const qrCode = computed(() => route.query.qr as string | undefined)
const isPinball = computed(() => gameType.value === 'PINBALL')

// 모바일 감지
const isMobile = computed(() => {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

// 전체화면 지원 게임 (MATCH 카드 게임)
const supportsFullscreen = computed(() => ['MATCH', 'SPOT'].includes(gameType.value))

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

onMounted(() => {
  // 핀볼이 아닌 경우에만 Phaser 게임 초기화
  if (!isPinball.value && gameContainer.value) {
    try {
      console.log('GameView QR Code:', qrCode.value)

      // 모바일 + 전체화면 지원 게임이면 자동 전체화면
      if (isMobile.value && supportsFullscreen.value) {
        enterFullscreen()
      }

      gameManager.initGame(gameType.value, 'game-container', qrCode.value)
    } catch (error) {
      console.error('게임 초기화 실패:', error)
    }
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
})

function handleGameOver(finalScore: number) {
  console.log('Game Over! Final Score:', finalScore)
  // TODO: 점수 저장 API 호출
}

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
  display: flex;
  justify-content: center;
  align-items: center;
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
  background: #0f0f23;
}

.fullscreen-container {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
}

.fullscreen-container canvas {
  width: 100vw !important;
  height: 100vh !important;
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
</style>
