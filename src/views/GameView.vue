<template>
  <div class="game-view">
    <!-- 핀볼 게임: 새로운 Pixi.js + Rapier 기반 -->
    <HyperPinball
      v-if="isPinball"
      :qr-code="qrCode"
      @game-over="handleGameOver"
      @exit="goBack"
    />

    <!-- 다른 게임: Phaser 기반 -->
    <template v-else>
      <div class="header">
        <h2>{{ gameTitle }}</h2>
        <button @click="goBack" class="btn-back">← 뒤로가기</button>
      </div>
      <div id="game-container" ref="gameContainer"></div>
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

const gameType = computed(() => (route.params.type as string).toUpperCase() as GameType)
const qrCode = computed(() => route.query.qr as string | undefined)
const isPinball = computed(() => gameType.value === 'PINBALL')

const gameTitle = computed(() => {
  const titles: Record<GameType, string> = {
    PINBALL: '핀볼 게임',
    BRICK_BREAKER: '벽돌깨기 게임',
    MATCH: '카드 매치 게임',
    SPOT: '틀린그림찾기'
  }
  return titles[gameType.value] || '게임'
})

onMounted(() => {
  // 핀볼이 아닌 경우에만 Phaser 게임 초기화
  if (!isPinball.value && gameContainer.value) {
    try {
      console.log('GameView QR Code:', qrCode.value)
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
</style>
