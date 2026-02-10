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

    <!-- 리워드 제안 모달 (쿠폰화 할지 묻는 팝업) -->
    <RewardOfferModal
      v-if="eligibleReward"
      :is-open="showRewardOffer"
      :score="finalScore"
      :reward="eligibleReward"
      @accept="handleRewardAccept"
      @decline="handleRewardDecline"
      @close="showRewardOffer = false"
    />

    <!-- 로그인/회원가입 모달 -->
    <AuthModal
      :is-open="showAuthModal"
      :qr-code-id="qrCodeId"
      :reward-info="eligibleReward ? { title: eligibleReward.title, description: eligibleReward.description } : undefined"
      @success="handleAuthSuccess"
      @close="showAuthModal = false"
    />

    <!-- 쿠폰 생성 모달 -->
    <CouponRewardModal
      v-if="eligibleReward"
      :is-open="showCouponModal"
      :benefit="eligibleReward"
      :user-id="currentUserId"
      :game-score-id="gameScoreId"
      :qr-code="qrCodeId"
      @close="handleCouponClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gameManager } from '../game/GameManager'
import type { GameType } from '../game/config'
import { useAuthStore } from '@/stores/auth'
import benefitsService, { type BenefitDto } from '@/services/benefitsService'
import HyperPinball from '../game/pinball/components/HyperPinball.vue'
import RewardOfferModal from '@/components/RewardOfferModal.vue'
import AuthModal from '@/components/AuthModal.vue'
import CouponRewardModal from '@/components/CouponRewardModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const gameContainer = ref<HTMLElement>()
const isFullscreen = ref(false)
const isGameLoading = ref(true)

// Game state
const gameType = computed(() => (route.params.type as string).toUpperCase() as GameType)
const qrCode = computed(() => route.query.qr as string | undefined)
const isPinball = computed(() => gameType.value === 'PINBALL')

// QR Code ID from URL
const qrCodeId = computed(() => route.query.qr as string | undefined)

// Reward flow state
const finalScore = ref(0)
const gameScoreId = ref<string>('')
const eligibleReward = ref<BenefitDto | null>(null)
const showRewardOffer = ref(false)
const showAuthModal = ref(false)
const showCouponModal = ref(false)
const currentUserId = ref('')

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

// 게임 종료 시 리워드 플로우 처리
async function handleGameOver(score: number, scoreId?: string) {
  console.log('Game Over! Final Score:', score, 'Score ID:', scoreId)

  finalScore.value = score
  if (scoreId) {
    gameScoreId.value = scoreId
  }

  // QR 코드가 없으면 리워드 플로우 스킵
  if (!qrCodeId.value) {
    console.log('No QR code, skipping reward flow')
    return
  }

  try {
    // 게임 타입에 맞는 혜택 조회
    const gameTypeForApi = mapGameTypeForApi(gameType.value)
    const benefits = await benefitsService.getBenefitsByGame(qrCodeId.value, gameTypeForApi)

    console.log('Available benefits:', benefits)

    // 점수에 맞는 적격 리워드 찾기 (requiredScore 이하인 것 중 가장 높은 것)
    const eligible = benefits
      .filter(b => b.isActive && b.requiredScore <= score)
      .sort((a, b) => b.requiredScore - a.requiredScore)[0]

    if (eligible) {
      console.log('Eligible reward found:', eligible)
      eligibleReward.value = eligible
      showRewardOffer.value = true
    } else {
      console.log('No eligible reward for score:', score)
    }
  } catch (error) {
    console.error('Failed to fetch benefits:', error)
  }
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

// 리워드 수락 처리
function handleRewardAccept() {
  showRewardOffer.value = false

  // 로그인 여부 확인
  if (authStore.isAuthenticated && authStore.user) {
    // 이미 로그인됨 → 바로 쿠폰 생성
    currentUserId.value = authStore.user.id
    showCouponModal.value = true
  } else {
    // 비로그인 → 로그인 모달 표시
    showAuthModal.value = true
  }
}

// 리워드 거절 처리
function handleRewardDecline() {
  showRewardOffer.value = false
  eligibleReward.value = null
}

// 로그인 성공 처리
function handleAuthSuccess(loggedInUserId: string) {
  console.log('Auth success, user ID:', loggedInUserId)
  showAuthModal.value = false
  currentUserId.value = loggedInUserId

  // 로그인 완료 → 쿠폰 생성 모달 표시
  showCouponModal.value = true
}

// 쿠폰 모달 닫기
function handleCouponClose() {
  showCouponModal.value = false
  eligibleReward.value = null
}

// Phaser 게임 이벤트 리스너
function handlePhaserGameOver(event: Event) {
  const customEvent = event as CustomEvent
  const { score, scoreId } = customEvent.detail
  handleGameOver(score, scoreId)
}

// 게임 로딩 완료 이벤트 리스너
function handleGameReady() {
  isGameLoading.value = false
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

      // Phaser 게임 이벤트 리스너 설정
      window.addEventListener('phaser-game-over', handlePhaserGameOver)
      window.addEventListener('phaser-game-ready', handleGameReady)
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
}

/* 전체화면 모드에서 게임 컨테이너 */
.fullscreen #game-container,
#game-container.fullscreen-container {
  width: 100vw !important;
  height: 100vh !important;
  position: fixed;
  top: 0;
  left: 0;
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
