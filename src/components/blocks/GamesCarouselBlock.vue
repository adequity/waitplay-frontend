<template>
  <div class="games-carousel-block" :class="{ 'portfolio-style': displayStyle === 'portfolio' }">
    <!-- ========== CAROUSEL 스타일 (기존) ========== -->
    <template v-if="displayStyle === 'carousel'">
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
          @touchstart="handleTouchStart"
          @touchend="(e) => handleTouchEnd(e, game.type)"
        >
          <div class="game-slide-content">
            <div class="game-icon-large">{{ game.icon }}</div>
            <h3 class="game-title-large">{{ game.name }}</h3>
            <p class="game-desc-large">{{ game.description }}</p>
            <div v-if="data.showLeaderboard" class="game-leaderboard">
              <div class="leaderboard-title">🏆 리더보드</div>
              <div v-if="game.rankings && game.rankings.length > 0">
                <div class="leaderboard-item" v-for="(rank, index) in game.rankings.slice(0, 3)" :key="index">
                  <span class="leaderboard-rank">{{ index + 1 }}위</span>
                  <span class="leaderboard-name">{{ rank.playerName }}</span>
                  <span class="leaderboard-score">{{ rank.score.toLocaleString() }}점</span>
                </div>
              </div>
              <div v-else class="leaderboard-empty">
                아직 기록이 없습니다
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== PORTFOLIO 스타일 (새로 추가) ========== -->
    <template v-else>
      <div class="portfolio-slider" @scroll="onPortfolioScroll" ref="portfolioSliderRef">
        <div
          v-for="game in allowedGames"
          :key="game.type"
          class="portfolio-card"
          @click="goToGame(game.type)"
          @touchstart="handleTouchStart"
          @touchend="(e) => handleTouchEnd(e, game.type)"
        >
          <div class="portfolio-card-inner">
            <div class="portfolio-icon">{{ game.icon }}</div>
            <div class="portfolio-info">
              <h3 class="portfolio-title">{{ game.name }}</h3>
              <p class="portfolio-desc">{{ game.description }}</p>
              <span class="portfolio-cta">Play Now →</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Page Indicator Dots -->
      <div class="portfolio-dots">
        <span
          v-for="(game, index) in allowedGames"
          :key="game.type"
          class="portfolio-dot"
          :class="{ active: currentGameIndex === index }"
          @click="scrollToPortfolioGame(index)"
        ></span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { GamesCarouselBlockData } from '@/types/blocks'

interface Props {
  data: GamesCarouselBlockData
  qrCodeId?: string
  isPreview?: boolean // 편집기 미리보기 모드
}

interface LeaderboardEntry {
  playerName: string
  score: number
}

interface GameData {
  type: string
  name: string
  icon: string
  description: string
  rankings: LeaderboardEntry[]
}

const props = defineProps<Props>()
const router = useRouter()

const currentGameIndex = ref(0)
const gamesSliderRef = ref<HTMLElement | null>(null)
const portfolioSliderRef = ref<HTMLElement | null>(null)
const blockRef = ref<HTMLElement | null>(null)

// displayStyle computed (기본값: carousel)
const displayStyle = computed(() => props.data.displayStyle || 'carousel')
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ✅ 지연 로딩 상태
const isLeaderboardLoaded = ref(false)
let observer: IntersectionObserver | null = null

// 게임 기본 정보
const gameDefinitions = [
  {
    type: 'pinball',
    name: '핀볼',
    icon: '🎯',
    description: '플리퍼로 공을 튕겨서 점수를 획득하세요'
  },
  {
    type: 'brick-breaker',
    name: '벽돌깨기',
    icon: '🧱',
    description: '공을 튕겨서 벽돌을 깨세요'
  },
  {
    type: 'memory',
    name: '같은 카드 찾기',
    icon: '🃏',
    description: '같은 그림의 카드를 찾아보세요'
  },
  {
    type: 'spot-difference',
    name: '틀린 그림 찾기',
    icon: '🔍',
    description: '두 그림의 다른 부분을 찾아보세요'
  }
]

const allGames = ref<GameData[]>(gameDefinitions.map(game => ({
  ...game,
  rankings: []
})))

// API에서 리더보드 데이터 가져오기
async function fetchLeaderboard(gameType: string) {
  try {
    if (!props.qrCodeId) {
      return []
    }

    const url = `${API_BASE_URL}/api/game/score/leaderboard/${gameType}/qr/${encodeURIComponent(props.qrCodeId)}?limit=3`

    const response = await fetch(url)
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.leaderboard || []
  } catch {
    return []
  }
}

// 모든 게임의 리더보드 데이터 로드
async function loadAllLeaderboards() {
  if (isLeaderboardLoaded.value) return
  isLeaderboardLoaded.value = true

  const promises = gameDefinitions.map(async (game) => {
    const rankings = await fetchLeaderboard(game.type)
    return {
      ...game,
      rankings
    }
  })

  allGames.value = await Promise.all(promises)
}

onMounted(() => {
  // 미리보기 모드에서는 API 호출 스킵
  if (props.isPreview) return

  // ✅ Intersection Observer로 뷰포트에 들어올 때만 리더보드 로드
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadAllLeaderboards()
          observer?.disconnect()
        }
      },
      { rootMargin: '200px' } // 200px 전에 미리 로드
    )

    // gamesSliderRef가 마운트된 후 관찰 시작
    const element = gamesSliderRef.value || document.querySelector('.games-carousel-block')
    if (element) {
      observer.observe(element)
    }
  } else {
    // Fallback: 즉시 로드
    loadAllLeaderboards()
  }
})

onUnmounted(() => {
  observer?.disconnect()
})

const allowedGames = computed(() => {
  const orderedGames = props.data.gamesOrder.map(gameOrder =>
    allGames.value.find(game => game.type === gameOrder.type)
  ).filter(Boolean)

  return orderedGames.filter(game =>
    props.data.enabledGames.includes(game!.type)
  ) as GameData[]
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

// Portfolio 스타일용 스크롤 핸들러
function onPortfolioScroll() {
  if (!portfolioSliderRef.value) return
  const slideWidth = portfolioSliderRef.value.offsetWidth
  const scrollLeft = portfolioSliderRef.value.scrollLeft
  const newIndex = Math.round(scrollLeft / (slideWidth * 0.9 + 16))
  currentGameIndex.value = newIndex
}

function scrollToPortfolioGame(index: number) {
  if (!portfolioSliderRef.value) return
  const slideWidth = portfolioSliderRef.value.offsetWidth
  const scrollPosition = index * (slideWidth * 0.9 + 16)
  portfolioSliderRef.value.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  })
}

// 터치 이벤트 처리 (드래그와 클릭 구분)
let touchStartX = 0
let touchStartTime = 0

function handleTouchStart(e: TouchEvent) {
  if (e.touches[0]) {
    touchStartX = e.touches[0].clientX
    touchStartTime = Date.now()
  }
}

function handleTouchEnd(e: TouchEvent, type: string) {
  if (!e.changedTouches[0]) return

  const touchEndX = e.changedTouches[0].clientX
  const touchEndTime = Date.now()
  const deltaX = Math.abs(touchEndX - touchStartX)
  const deltaTime = touchEndTime - touchStartTime

  // 이동 거리가 10px 미만이고 시간이 300ms 미만이면 클릭으로 간주
  if (deltaX < 10 && deltaTime < 300) {
    goToGame(type)
  }
}

function goToGame(type: string) {
  // 게임 타입 매핑 (carousel → GameView)
  const typeMap: Record<string, string> = {
    'pinball': 'pinball',
    'brick-breaker': 'brick-breaker',
    'memory': 'match',
    'spot-difference': 'spot'
  }

  const mappedType = typeMap[type] || type
  console.log('Navigating to game:', mappedType, 'with QR:', props.qrCodeId)

  // QR 코드를 query parameter로 전달
  router.push({
    name: 'game',
    params: { type: mappedType },
    query: props.qrCodeId ? { qr: props.qrCodeId } : {}
  })
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

.leaderboard-empty {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  padding: 20px 0;
}

/* ========== PORTFOLIO 스타일 ========== */
.games-carousel-block.portfolio-style {
  padding: 0;
}

.portfolio-slider {
  display: flex;
  overflow-x: scroll;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  gap: 16px;
  padding: 8px 1.5rem 16px;
  margin: 0 -1.5rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-x;
}

.portfolio-slider::-webkit-scrollbar {
  display: none;
  height: 0;
}

.portfolio-card {
  flex: 0 0 90%;
  min-width: 90%;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.portfolio-card-inner {
  background: #ffffff;
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.portfolio-card:active .portfolio-card-inner {
  transform: scale(0.98);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.portfolio-icon {
  font-size: 72px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.portfolio-info {
  width: 100%;
}

.portfolio-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.portfolio-desc {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  color: #666666;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.portfolio-cta {
  display: inline-block;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #007aff;
  transition: color 0.2s ease;
}

.portfolio-card:hover .portfolio-cta {
  color: #0056b3;
}

/* Page Indicator Dots */
.portfolio-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.portfolio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.portfolio-dot.active {
  background: #ffffff;
  transform: scale(1.2);
}

.portfolio-dot:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
}
</style>
