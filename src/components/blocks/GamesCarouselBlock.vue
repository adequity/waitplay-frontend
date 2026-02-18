<template>
  <div class="games-carousel-block" :class="[
    displayStyle === 'portfolio' ? 'portfolio-style' : '',
    displayStyle === 'showcase' ? 'showcase-style' : ''
  ]">
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
            <div class="game-icon-large">
              <component :is="game.icon" :size="64" color="currentColor" />
            </div>
            <h3 class="game-title-large">{{ game.name }}</h3>
            <p class="game-desc-large">{{ game.description }}</p>
            <div v-if="data.showLeaderboard" class="game-leaderboard">
              <div class="leaderboard-title">
              <component :is="TrophyIcon" :size="16" color="#ffd700" class="trophy-icon" />
              리더보드
            </div>
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

    <!-- ========== PORTFOLIO 스타일 ========== -->
    <template v-else-if="displayStyle === 'portfolio'">
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
            <div class="portfolio-icon">
              <component :is="game.icon" :size="72" color="#1a1a1a" />
            </div>
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

    <!-- ========== SHOWCASE 스타일 (워터마크 + 디바이스 프레임) ========== -->
    <template v-else>
      <div class="showcase-slider" @scroll="onShowcaseScroll" ref="showcaseSliderRef">
        <div
          v-for="game in allowedGames"
          :key="game.type"
          class="showcase-card"
          @click="goToGame(game.type)"
          @touchstart="handleTouchStart"
          @touchend="(e) => handleTouchEnd(e, game.type)"
        >
          <!-- 워터마크 텍스트 -->
          <div class="showcase-watermark">{{ game.name }}</div>

          <!-- 디바이스 프레임 -->
          <div class="showcase-device">
            <div class="showcase-device-inner">
              <div class="showcase-icon">
                <component :is="game.icon" :size="80" color="#374151" />
              </div>
            </div>
          </div>

          <!-- 카드 외부 설명 -->
          <div class="showcase-info">
            <p class="showcase-desc">{{ game.description }}</p>
            <span class="showcase-cta">Play Game</span>
          </div>
        </div>
      </div>
      <!-- Page Indicator Dots -->
      <div class="showcase-dots">
        <span
          v-for="(game, index) in allowedGames"
          :key="game.type"
          class="showcase-dot"
          :class="{ active: currentGameIndex === index }"
          @click="scrollToShowcaseGame(index)"
        ></span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, h, type FunctionalComponent } from 'vue'
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
  icon: FunctionalComponent<{ size?: number; color?: string }>
  description: string
  rankings: LeaderboardEntry[]
}

// SVG 아이콘 컴포넌트들
const PinballIcon: FunctionalComponent<{ size?: number; color?: string }> = (props) => {
  const size = props.size || 64
  const color = props.color || 'currentColor'
  return h('svg', {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
  }, [
    // 핀볼 머신 몸체
    h('rect', { x: 8, y: 12, width: 48, height: 44, rx: 6, fill: color, opacity: 0.15 }),
    h('rect', { x: 8, y: 12, width: 48, height: 44, rx: 6, stroke: color, 'stroke-width': 2.5 }),
    // 공
    h('circle', { cx: 40, cy: 28, r: 6, fill: color }),
    // 플리퍼 왼쪽
    h('path', { d: 'M16 46 L28 42 L28 46 Z', fill: color }),
    // 플리퍼 오른쪽
    h('path', { d: 'M48 46 L36 42 L36 46 Z', fill: color }),
    // 범퍼들
    h('circle', { cx: 24, cy: 24, r: 4, fill: color, opacity: 0.6 }),
    h('circle', { cx: 32, cy: 20, r: 3, fill: color, opacity: 0.6 }),
  ])
}

const BrickBreakerIcon: FunctionalComponent<{ size?: number; color?: string }> = (props) => {
  const size = props.size || 64
  const color = props.color || 'currentColor'
  return h('svg', {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
  }, [
    // 벽돌들
    h('rect', { x: 8, y: 8, width: 14, height: 8, rx: 2, fill: color }),
    h('rect', { x: 25, y: 8, width: 14, height: 8, rx: 2, fill: color }),
    h('rect', { x: 42, y: 8, width: 14, height: 8, rx: 2, fill: color }),
    h('rect', { x: 8, y: 19, width: 14, height: 8, rx: 2, fill: color, opacity: 0.8 }),
    h('rect', { x: 25, y: 19, width: 14, height: 8, rx: 2, fill: color, opacity: 0.8 }),
    h('rect', { x: 42, y: 19, width: 14, height: 8, rx: 2, fill: color, opacity: 0.8 }),
    h('rect', { x: 8, y: 30, width: 14, height: 8, rx: 2, fill: color, opacity: 0.6 }),
    h('rect', { x: 25, y: 30, width: 14, height: 8, rx: 2, fill: color, opacity: 0.6 }),
    h('rect', { x: 42, y: 30, width: 14, height: 8, rx: 2, fill: color, opacity: 0.6 }),
    // 패들
    h('rect', { x: 20, y: 52, width: 24, height: 6, rx: 3, fill: color }),
    // 공
    h('circle', { cx: 32, cy: 44, r: 4, fill: color }),
  ])
}

const MemoryIcon: FunctionalComponent<{ size?: number; color?: string }> = (props) => {
  const size = props.size || 64
  const color = props.color || 'currentColor'
  return h('svg', {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
  }, [
    // 카드 1 (뒤집힌)
    h('rect', { x: 6, y: 8, width: 22, height: 28, rx: 4, fill: color, opacity: 0.2 }),
    h('rect', { x: 6, y: 8, width: 22, height: 28, rx: 4, stroke: color, 'stroke-width': 2 }),
    h('text', { x: 17, y: 28, 'font-size': 16, 'font-weight': 'bold', fill: color, 'text-anchor': 'middle' }, '?'),
    // 카드 2 (뒤집힌)
    h('rect', { x: 36, y: 8, width: 22, height: 28, rx: 4, fill: color, opacity: 0.2 }),
    h('rect', { x: 36, y: 8, width: 22, height: 28, rx: 4, stroke: color, 'stroke-width': 2 }),
    h('text', { x: 47, y: 28, 'font-size': 16, 'font-weight': 'bold', fill: color, 'text-anchor': 'middle' }, '?'),
    // 카드 3 (열림 - 하트)
    h('rect', { x: 6, y: 40, width: 22, height: 18, rx: 3, fill: color }),
    h('path', { d: 'M17 46 L14 49 L17 55 L20 49 Z', fill: 'white' }),
    // 카드 4 (열림 - 하트)
    h('rect', { x: 36, y: 40, width: 22, height: 18, rx: 3, fill: color }),
    h('path', { d: 'M47 46 L44 49 L47 55 L50 49 Z', fill: 'white' }),
  ])
}

const SpotDifferenceIcon: FunctionalComponent<{ size?: number; color?: string }> = (props) => {
  const size = props.size || 64
  const color = props.color || 'currentColor'
  return h('svg', {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
  }, [
    // 돋보기 원
    h('circle', { cx: 26, cy: 26, r: 16, stroke: color, 'stroke-width': 3, fill: 'none' }),
    // 돋보기 손잡이
    h('line', { x1: 38, y1: 38, x2: 54, y2: 54, stroke: color, 'stroke-width': 4, 'stroke-linecap': 'round' }),
    // 돋보기 안 체크마크
    h('path', { d: 'M18 26 L24 32 L34 20', stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }),
  ])
}

const TrophyIcon: FunctionalComponent<{ size?: number; color?: string }> = (props) => {
  const size = props.size || 16
  const color = props.color || 'currentColor'
  return h('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg'
  }, [
    h('path', {
      d: 'M12 15C15.866 15 19 11.866 19 8V3H5V8C5 11.866 8.134 15 12 15Z',
      fill: color
    }),
    h('path', {
      d: 'M5 5H3C2.448 5 2 5.448 2 6V8C2 9.657 3.343 11 5 11V5Z',
      fill: color,
      opacity: 0.7
    }),
    h('path', {
      d: 'M19 5H21C21.552 5 22 5.448 22 6V8C22 9.657 20.657 11 19 11V5Z',
      fill: color,
      opacity: 0.7
    }),
    h('rect', { x: 10, y: 15, width: 4, height: 4, fill: color }),
    h('rect', { x: 7, y: 19, width: 10, height: 2, rx: 1, fill: color }),
  ])
}

// 게임 타입별 아이콘 맵
const gameIcons: Record<string, FunctionalComponent<{ size?: number; color?: string }>> = {
  'pinball': PinballIcon,
  'brick-breaker': BrickBreakerIcon,
  'memory': MemoryIcon,
  'spot-difference': SpotDifferenceIcon
}

const props = defineProps<Props>()
const router = useRouter()

const currentGameIndex = ref(0)
const gamesSliderRef = ref<HTMLElement | null>(null)
const portfolioSliderRef = ref<HTMLElement | null>(null)
const showcaseSliderRef = ref<HTMLElement | null>(null)
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
    icon: PinballIcon,
    description: '플리퍼로 공을 튕겨서 점수를 획득하세요'
  },
  {
    type: 'brick-breaker',
    name: '벽돌깨기',
    icon: BrickBreakerIcon,
    description: '공을 튕겨서 벽돌을 깨세요'
  },
  {
    type: 'memory',
    name: '같은 카드 찾기',
    icon: MemoryIcon,
    description: '같은 그림의 카드를 찾아보세요'
  },
  {
    type: 'spot-difference',
    name: '틀린 그림 찾기',
    icon: SpotDifferenceIcon,
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

// Showcase 스타일용 스크롤 핸들러
function onShowcaseScroll() {
  if (!showcaseSliderRef.value) return
  const slideWidth = showcaseSliderRef.value.offsetWidth
  const scrollLeft = showcaseSliderRef.value.scrollLeft
  const newIndex = Math.round(scrollLeft / (slideWidth * 0.85 + 20))
  currentGameIndex.value = newIndex
}

function scrollToShowcaseGame(index: number) {
  if (!showcaseSliderRef.value) return
  const slideWidth = showcaseSliderRef.value.offsetWidth
  const scrollPosition = index * (slideWidth * 0.85 + 20)
  showcaseSliderRef.value.scrollTo({
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
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  color: #ffffff;
}

.game-icon-large :deep(svg) {
  width: 64px;
  height: 64px;
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
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.trophy-icon {
  flex-shrink: 0;
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
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.portfolio-icon :deep(svg) {
  width: 72px;
  height: 72px;
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

/* ========== SHOWCASE 스타일 (워터마크 + 디바이스 프레임) ========== */
.games-carousel-block.showcase-style {
  padding: 0;
}

.showcase-slider {
  display: flex;
  overflow-x: scroll;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  gap: 20px;
  padding: 16px 1.5rem 20px;
  margin: 0 -1.5rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-x;
}

.showcase-slider::-webkit-scrollbar {
  display: none;
  height: 0;
}

.showcase-card {
  flex: 0 0 85%;
  min-width: 85%;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  position: relative;
}

/* 워터마크 텍스트 */
.showcase-watermark {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 42px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.08);
  letter-spacing: -0.02em;
  white-space: nowrap;
  pointer-events: none;
  z-index: 0;
}

/* 디바이스 프레임 */
.showcase-device {
  position: relative;
  z-index: 1;
  background: linear-gradient(145deg, #f5f5f7 0%, #e8e8ed 100%);
  border-radius: 20px;
  padding: 16px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.showcase-card:active .showcase-device {
  transform: scale(0.98);
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.1);
}

.showcase-device-inner {
  background: #ffffff;
  border-radius: 12px;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.showcase-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.showcase-icon :deep(svg) {
  width: 80px;
  height: 80px;
}

/* 카드 외부 설명 */
.showcase-info {
  margin-top: 16px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.showcase-desc {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.showcase-cta {
  display: inline-block;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #007aff;
  transition: color 0.2s ease;
}

.showcase-card:hover .showcase-cta {
  color: #0056b3;
}

/* Showcase Page Indicator Dots */
.showcase-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.showcase-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.showcase-dot.active {
  background: #ffffff;
  transform: scale(1.2);
}

.showcase-dot:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
}
</style>
