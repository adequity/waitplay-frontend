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
              <img
                v-if="game.iconUrl"
                :src="game.iconUrl"
                :alt="game.name"
                class="carousel-game-icon"
              />
              <component v-else :is="game.icon" :size="64" color="currentColor" />
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
              <img
                v-if="game.iconUrl"
                :src="game.iconUrl"
                :alt="game.name"
                class="portfolio-game-icon"
              />
              <component v-else :is="game.icon" :size="100" color="#1a1a1a" />
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

    <!-- ========== SHOWCASE 스타일 (Apple Arcade 스타일) ========== -->
    <template v-else>
      <div class="showcase-slider" @scroll="onShowcaseScroll" ref="showcaseSliderRef">
        <div
          v-for="game in allowedGames"
          :key="game.type"
          class="showcase-card"
          :class="{
            'has-bg-image': game.backgroundImageUrl,
            'no-icon': !game.iconUrl && game.backgroundImageUrl
          }"
          @click="goToGame(game.type)"
          @touchstart="handleTouchStart"
          @touchend="(e) => handleTouchEnd(e, game.type)"
        >
          <!-- 배경 이미지 레이어 (mask-image로 상단/하단 페이드) -->
          <div
            v-if="game.backgroundImageUrl"
            class="showcase-bg"
            :style="{
              backgroundImage: `url(${game.backgroundImageUrl})`,
              opacity: (game.bgOpacity ?? 100) / 100,
              filter: game.bgBlur ? `blur(${game.bgBlur}px)` : undefined
            }"
          ></div>

          <!-- 텍스트 가독성을 위한 하단 오버레이 -->
          <div class="showcase-overlay"></div>

          <!-- 카드 콘텐츠 (하단 정렬) -->
          <div class="showcase-content">
            <!-- 게임 아이콘 (있을 때만 표시) -->
            <div v-if="game.iconUrl" class="showcase-icon-wrapper">
              <img
                :src="game.iconUrl"
                :alt="game.name"
                class="showcase-game-icon"
              />
            </div>
            <!-- 배경도 없고 아이콘도 없을 때 fallback 아이콘 표시 -->
            <div v-else-if="!game.backgroundImageUrl" class="showcase-icon-wrapper">
              <div class="showcase-fallback-icon">
                <component :is="game.icon" :size="60" color="#374151" />
              </div>
            </div>

            <!-- 게임 정보 -->
            <div class="showcase-info">
              <h3 class="showcase-game-name" :style="{
                fontSize: game.nameFontSize ? `${game.nameFontSize}px` : undefined,
                fontFamily: game.nameFontFamily || undefined,
                textShadow: game.nameTextShadow ? `0 1px ${game.nameTextShadow * 2}px rgba(0,0,0,${Math.min(game.nameTextShadow * 0.15, 1)})` : undefined
              }">{{ game.name }}</h3>
              <p class="showcase-game-desc" :style="{
                fontSize: game.descFontSize ? `${game.descFontSize}px` : undefined,
                fontFamily: game.descFontFamily || undefined,
                textShadow: game.descTextShadow ? `0 1px ${game.descTextShadow * 2}px rgba(0,0,0,${Math.min(game.descTextShadow * 0.15, 1)})` : undefined
              }">{{ game.description }}</p>
            </div>

            <!-- 버튼 -->
            <button class="showcase-play-btn">{{ game.buttonText || '지금 도전하기' }}</button>
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
import { ref, computed, onMounted, onUnmounted, h, type FunctionalComponent, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { GamesCarouselBlockData } from '@/types/blocks'
import gameSettingsService, { type AvailableGameDto } from '@/services/gameSettingsService'

interface Props {
  data: GamesCarouselBlockData
  qrCodeId?: string
  isPreview?: boolean // 편집기 미리보기 모드
  availableGamesFromParent?: AvailableGameDto[] // 부모 컴포넌트에서 전달받은 게임 목록
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
  iconImageUrl?: string | null
  backgroundImageUrl?: string | null
  buttonText?: string | null
  bgOpacity?: number
  bgBlur?: number
  nameFontSize?: number
  nameFontFamily?: string | null
  nameTextShadow?: number
  descFontSize?: number
  descFontFamily?: string | null
  descTextShadow?: number
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

// 게임 타입별 아이콘 맵 (fallback용)
const gameIcons: Record<string, FunctionalComponent<{ size?: number; color?: string }>> = {
  'pinball': PinballIcon,
  'brick-breaker': BrickBreakerIcon,
  'memory': MemoryIcon,
  'spot-difference': SpotDifferenceIcon
}

// 게임 기본 정보 (fallback용 - API 실패시 또는 미리보기용)
const fallbackGameDefinitions: Record<string, { name: string; description: string }> = {
  'pinball': { name: '핀볼', description: '플리퍼로 공을 튕겨서 점수를 획득하세요' },
  'brick-breaker': { name: '벽돌깨기', description: '공을 튕겨서 벽돌을 깨세요' },
  'memory': { name: '같은 카드 찾기', description: '같은 그림의 카드를 찾아보세요' },
  'spot-difference': { name: '틀린 그림 찾기', description: '두 그림의 다른 부분을 찾아보세요' },
  'roulette': { name: '행운의 룰렛', description: '룰렛을 돌려서 운을 시험하세요' },
  'slot': { name: '슬롯머신', description: '슬롯을 돌려 행운을 잡으세요' }
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
const isGamesLoaded = ref(false)
let observer: IntersectionObserver | null = null

// API에서 로드된 게임 목록
const availableGamesFromApi = ref<AvailableGameDto[]>([])

// API에서 가져온 게임 목록 또는 fallback 사용
const allGames = ref<GameData[]>([])

// API에서 게임 목록 로드
async function loadAvailableGames() {
  if (isGamesLoaded.value || props.isPreview) return

  try {
    if (props.availableGamesFromParent && props.availableGamesFromParent.length > 0) {
      // 부모에서 전달받은 게임 목록 사용
      availableGamesFromApi.value = props.availableGamesFromParent
    } else if (props.qrCodeId) {
      // API에서 게임 목록 로드
      const games = await gameSettingsService.getAvailableGamesPublic(props.qrCodeId)
      availableGamesFromApi.value = games
    }

    // GameData 형식으로 변환
    if (availableGamesFromApi.value.length > 0) {
      allGames.value = availableGamesFromApi.value.map(game => ({
        type: game.gameKey,
        name: game.name,
        icon: gameIcons[game.gameKey] || PinballIcon,
        description: game.description || fallbackGameDefinitions[game.gameKey]?.description || '',
        rankings: [],
        iconImageUrl: game.iconImageUrl,
        backgroundImageUrl: game.backgroundImageUrl,
        buttonText: game.buttonText,
        bgOpacity: game.bgOpacity,
        bgBlur: game.bgBlur,
        nameFontSize: game.nameFontSize,
        nameFontFamily: game.nameFontFamily,
        nameTextShadow: game.nameTextShadow,
        descFontSize: game.descFontSize,
        descFontFamily: game.descFontFamily,
        descTextShadow: game.descTextShadow
      }))
    } else {
      // Fallback: 기본 게임 목록 사용
      allGames.value = Object.keys(fallbackGameDefinitions).slice(0, 4).map(key => {
        const def = fallbackGameDefinitions[key]
        return {
          type: key,
          name: def?.name || key,
          icon: gameIcons[key] || PinballIcon,
          description: def?.description || '',
          rankings: []
        }
      })
    }

    isGamesLoaded.value = true
  } catch (error) {
    console.error('Failed to load available games:', error)
    // Fallback: 기본 게임 목록 사용
    allGames.value = Object.keys(fallbackGameDefinitions).slice(0, 4).map(key => {
      const def = fallbackGameDefinitions[key]
      return {
        type: key,
        name: def?.name || key,
        icon: gameIcons[key] || PinballIcon,
        description: def?.description || '',
        rankings: []
      }
    })
    isGamesLoaded.value = true
  }
}

// 미리보기 모드용 초기화
function initForPreview() {
  allGames.value = Object.keys(fallbackGameDefinitions).slice(0, 4).map(key => {
    const def = fallbackGameDefinitions[key]
    return {
      type: key,
      name: def?.name || key,
      icon: gameIcons[key] || PinballIcon,
      description: def?.description || '',
      rankings: []
    }
  })
  isGamesLoaded.value = true
}

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
  if (isLeaderboardLoaded.value || !isGamesLoaded.value) return
  isLeaderboardLoaded.value = true

  // 현재 로드된 게임 목록에 리더보드 데이터 추가
  const promises = allGames.value.map(async (game) => {
    const rankings = await fetchLeaderboard(game.type)
    return {
      ...game,
      rankings
    }
  })

  allGames.value = await Promise.all(promises)
}

// qrCodeId가 변경될 때 게임 목록 다시 로드
watch(() => props.qrCodeId, async (newQrCodeId, oldQrCodeId) => {
  if (newQrCodeId && newQrCodeId !== oldQrCodeId && !props.isPreview) {
    // qrCodeId가 나중에 설정되면 게임 목록 로드
    isGamesLoaded.value = false
    await loadAvailableGames()
  }
}, { immediate: false })

onMounted(async () => {
  // 미리보기 모드에서는 fallback 게임 목록 사용
  if (props.isPreview) {
    initForPreview()
    return
  }

  // 게임 목록 로드 (API에서)
  await loadAvailableGames()

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
  // 게임이 아직 로드되지 않았으면 빈 배열 반환
  if (allGames.value.length === 0) return []

  const orderedGames = props.data.gamesOrder.map(gameOrder => {
    const game = allGames.value.find(g => g.type === gameOrder.type)
    if (game) {
      // gamesOrder에서 iconUrl이 있으면 사용, 없으면 API의 iconImageUrl 사용
      // buttonText도 API에서 전달된 값 사용
      return {
        ...game,
        iconUrl: gameOrder.iconUrl || game.iconImageUrl,
        backgroundImageUrl: game.backgroundImageUrl,
        buttonText: game.buttonText,
        bgOpacity: game.bgOpacity,
        bgBlur: game.bgBlur,
        nameFontSize: game.nameFontSize,
        nameFontFamily: game.nameFontFamily,
        nameTextShadow: game.nameTextShadow,
        descFontSize: game.descFontSize,
        descFontFamily: game.descFontFamily,
        descTextShadow: game.descTextShadow
      }
    }
    return null
  }).filter(Boolean)

  return orderedGames.filter(game =>
    props.data.enabledGames.includes(game!.type)
  ) as (GameData & { iconUrl?: string; backgroundImageUrl?: string | null; buttonText?: string | null })[]
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

// Showcase 스타일용 스크롤 핸들러 (100% 너비)
function onShowcaseScroll() {
  if (!showcaseSliderRef.value) return
  const slideWidth = showcaseSliderRef.value.offsetWidth
  const scrollLeft = showcaseSliderRef.value.scrollLeft
  const newIndex = Math.round(scrollLeft / slideWidth)
  currentGameIndex.value = newIndex
}

function scrollToShowcaseGame(index: number) {
  if (!showcaseSliderRef.value) return
  const slideWidth = showcaseSliderRef.value.offsetWidth
  const scrollPosition = index * slideWidth
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
  /* margin은 부모 컨테이너(CustomerView)에서 block.marginTop/marginBottom으로 설정 */
  margin-left: 30px;
  margin-right: 30px;
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
  padding: 0;
  margin: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-x;
}

.games-slider::-webkit-scrollbar {
  display: none;
  height: 0;
}

.game-slide {
  flex: 0 0 100%;
  min-width: 100%;
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
  aspect-ratio: 6 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.carousel-game-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 12px;
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
  /* 좌우 margin은 부모 .games-carousel-block에서 15px 적용 */
}

.portfolio-slider {
  display: flex;
  overflow-x: scroll;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  gap: 16px;
  padding: 8px 0 16px;
  margin: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-x;
}

.portfolio-slider::-webkit-scrollbar {
  display: none;
  height: 0;
}

.portfolio-card {
  flex: 0 0 100%;
  min-width: 100%;
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
  aspect-ratio: 6 / 9;
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
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.portfolio-game-icon {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 16px;
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

/* ========== SHOWCASE 스타일 (Apple Arcade 스타일, 풀스크린 배경) ========== */
.games-carousel-block.showcase-style {
  margin-left: 0;
  margin-right: 0;
}

.showcase-slider {
  display: flex;
  overflow-x: scroll;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  gap: 0;
  padding: 0;
  margin: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-x;
}

.showcase-slider::-webkit-scrollbar {
  display: none;
  height: 0;
}

.showcase-card {
  flex: 0 0 100%;
  min-width: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  position: relative;
  min-height: 480px;
  background-color: transparent;
  overflow: hidden;
}

/* 배경 이미지 레이어 (mask로 상단/하단 페이드 - 텍스트에 영향 없음) */
.showcase-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* 상단/하단 페이드아웃 (6등분 기준: 상단 1/6, 하단 1/6 페이드) */
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 16.67%,
    black 83.33%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 16.67%,
    black 83.33%,
    transparent 100%
  );
}

/* 텍스트 가독성을 위한 하단 그라데이션 (배경과 동일한 mask 적용) */
.showcase-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg,
    transparent 0%,
    transparent 60%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
  /* 배경과 동일하게 상단/하단 페이드 적용 */
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 16.67%,
    black 83.33%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 16.67%,
    black 83.33%,
    transparent 100%
  );
}

/* 카드 콘텐츠 - 하단 정렬 (Apple Arcade 스타일) */
.showcase-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  text-align: center;
  padding: 0 24px 40px;
}

/* 게임 아이콘 래퍼 (Apple Arcade 스타일 - 큰 앱 아이콘) */
.showcase-icon-wrapper {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.showcase-card:active .showcase-icon-wrapper {
  transform: scale(0.95);
}

.showcase-game-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.showcase-fallback-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
}

.showcase-fallback-icon :deep(svg) {
  width: 60px;
  height: 60px;
}

/* 게임 정보 영역 */
.showcase-info {
  margin-bottom: 16px;
}

/* 게임 이름 */
.showcase-game-name {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
}

/* 게임 설명 */
.showcase-game-desc {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: 1.4;
}

/* 버튼 (Apple Arcade 스타일 - 반투명 흰색) */
.showcase-play-btn {
  display: inline-block;
  padding: 12px 32px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: none;
  border-radius: 22px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.showcase-play-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}

.showcase-card:active .showcase-play-btn {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.98);
}

/* Showcase Page Indicator Dots */
.showcase-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 16px 0;
  background: transparent;
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
  width: 24px;
  border-radius: 4px;
}

.showcase-dot:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
}
</style>
