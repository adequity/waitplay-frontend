<template>
  <div class="game-view">
    <div class="header">
      <h2>{{ gameTitle }}</h2>
      <button @click="goBack" class="btn-back">← 뒤로가기</button>
    </div>
    <div id="game-container" ref="gameContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gameManager } from '../game/GameManager'
import type { GameType } from '../game/config'

const route = useRoute()
const router = useRouter()
const gameContainer = ref<HTMLElement>()

const gameType = computed(() => (route.params.type as string).toUpperCase() as GameType)
const gameTitle = computed(() => {
  const titles: Record<GameType, string> = {
    PINBALL: '핀볼 게임',
    MATCH: '카드 매치 게임',
    SPOT: '틀린그림찾기'
  }
  return titles[gameType.value] || '게임'
})

onMounted(() => {
  if (gameContainer.value) {
    try {
      gameManager.initGame(gameType.value, 'game-container')
    } catch (error) {
      console.error('게임 초기화 실패:', error)
    }
  }
})

onBeforeUnmount(() => {
  gameManager.destroyGame()
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
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
