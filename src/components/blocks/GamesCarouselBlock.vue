<template>
  <div class="games-carousel-block">
    <!-- Game Tabs Navigation -->
    <div class="game-tabs">
      <button
        v-for="(game, index) in allowedGames"
        :key="game.type"
        class="game-tab"
        :class="{ active: currentGameIndex === index }"
        @click="scrollToGame(index)"
      >
        {{ game.name }}
      </button>
    </div>

    <div class="games-slider" @scroll="onSliderScroll" ref="gamesSliderRef">
      <div
        v-for="game in allowedGames"
        :key="game.type"
        class="game-slide"
        @click="goToGame(game.type)"
      >
        <div class="game-slide-content">
          <div class="game-icon-large">{{ game.icon }}</div>
          <h3 class="game-title-large">{{ game.name }}</h3>
          <p class="game-desc-large">{{ game.description }}</p>
          <div v-if="data.showLeaderboard && game.rankings && game.rankings.length > 0" class="game-leaderboard">
            <div class="leaderboard-title">🏆 리더보드</div>
            <div class="leaderboard-item" v-for="(rank, index) in game.rankings.slice(0, 3)" :key="index">
              <span class="leaderboard-rank">{{ index + 1 }}위</span>
              <span class="leaderboard-name">{{ rank.playerName }}</span>
              <span class="leaderboard-score">{{ rank.score.toLocaleString() }}점</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { GamesCarouselBlockData } from '@/types/blocks'

interface Props {
  data: GamesCarouselBlockData
}

const props = defineProps<Props>()
const router = useRouter()

const currentGameIndex = ref(0)
const gamesSliderRef = ref<HTMLElement | null>(null)

// 전체 게임 데이터 (실제로는 API에서 가져와야 함)
const allGames = [
  {
    type: 'pinball',
    name: '핀볼게임',
    icon: '🎯',
    description: '공을 튕겨서 점수를 획득하세요',
    rankings: [
      { playerName: '김민수', score: 15420 },
      { playerName: '이지은', score: 14230 },
      { playerName: '박준혁', score: 13150 }
    ]
  },
  {
    type: 'memory',
    name: '같은 카드 찾기',
    icon: '🃏',
    description: '같은 그림의 카드를 찾아보세요',
    rankings: [
      { playerName: '정수진', score: 12580 },
      { playerName: '최동욱', score: 11940 },
      { playerName: '강혜원', score: 10230 }
    ]
  },
  {
    type: 'spot-difference',
    name: '틀린 그림 찾기',
    icon: '🔍',
    description: '두 그림의 다른 부분을 찾아보세요',
    rankings: [
      { playerName: '윤성민', score: 9540 },
      { playerName: '한예진', score: 8990 },
      { playerName: '임준호', score: 7430 }
    ]
  }
]

const allowedGames = computed(() => {
  const orderedGames = props.data.gamesOrder.map(type =>
    allGames.find(game => game.type === type)
  ).filter(Boolean)

  return orderedGames.filter(game =>
    props.data.enabledGames.includes(game!.type)
  ) as typeof allGames
})

function scrollToGame(index: number) {
  if (!gamesSliderRef.value) return
  const slideWidth = gamesSliderRef.value.offsetWidth
  const scrollPosition = index * (slideWidth * 0.85 + 12)
  gamesSliderRef.value.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  })
}

function onSliderScroll() {
  if (!gamesSliderRef.value) return
  const slideWidth = gamesSliderRef.value.offsetWidth
  const scrollLeft = gamesSliderRef.value.scrollLeft
  const newIndex = Math.round(scrollLeft / (slideWidth * 0.85 + 12))
  currentGameIndex.value = newIndex
}

function goToGame(type: string) {
  router.push({ name: 'game', params: { type } })
}
</script>

<style scoped>
.games-carousel-block {
  margin-bottom: 20px;
  width: 100%;
  overflow: hidden;
}

.game-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 1.5rem;
}

.game-tab {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  background: none;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}

.game-tab.active {
  color: #ffffff;
}

.game-tab:hover {
  color: rgba(255, 255, 255, 0.8);
}

.games-slider {
  display: flex;
  overflow-x: scroll;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  gap: 12px;
  padding: 0 1.5rem;
  margin: 0 -1.5rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-x;
}

.games-slider::-webkit-scrollbar {
  display: none;
  height: 0;
}

.game-slide {
  flex: 0 0 85%;
  min-width: 85%;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  cursor: grab;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.game-slide:active {
  cursor: grabbing;
}

.game-slide-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.2s ease;
}

.game-slide:active .game-slide-content {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.08);
}

.game-icon-large {
  font-size: 64px;
  margin-bottom: 16px;
}

.game-title-large {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.game-desc-large {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  color: #b0b0b0;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.game-leaderboard {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
}

.leaderboard-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.leaderboard-item:last-child {
  border-bottom: none;
}

.leaderboard-rank {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  width: 40px;
}

.leaderboard-name {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  flex: 1;
}

.leaderboard-score {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #007aff;
}
</style>
