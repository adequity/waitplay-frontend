<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
      <div class="modal-container">
        <!-- 컨페티 효과 -->
        <div class="confetti-container">
          <div v-for="i in 20" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
        </div>

        <!-- 닫기 버튼 -->
        <button class="btn-close" @click="handleClose">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <!-- Step 1: 점수/등급 표시 + 혜택 제안 -->
        <div v-if="step === 'result'" class="step-content">
          <!-- 점수 배지 -->
          <div class="score-badge">
            <span class="score-label">획득점수</span>
            <span class="score-value">{{ score }}</span>
          </div>

          <!-- 등급 -->
          <div class="grade-section">
            <div class="grade-icon" :style="{ background: gradeInfo.bgColor }">
              <!-- 커스텀 아이콘 (이미지 URL) -->
              <img
                v-if="reward?.customIconUrl"
                :src="reward.customIconUrl"
                alt="아이콘"
                class="custom-icon-img"
              />
              <!-- 프리셋 아이콘 (IconBase 사용) -->
              <IconBase
                v-else
                :name="gradeInfo.icon"
                :size="32"
                class="grade-svg"
                :style="{ color: getIconColor(gradeInfo.icon) }"
              />
            </div>
            <h2 class="grade-title">{{ gradeInfo.title }}</h2>
          </div>

          <!-- 혜택이 있으면 표시 -->
          <div v-if="reward" class="reward-section">
            <div class="reward-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <span>필요 점수: {{ reward.requiredScore }}점</span>
            </div>
          </div>

          <!-- 게임 통계 -->
          <div class="stats-panel">
            <div class="stat-row">
              <span class="stat-label">시간</span>
              <span class="stat-value">{{ gameStats.time }}초</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">{{ gameStats.secondLabel }}</span>
              <span class="stat-value">{{ gameStats.secondValue }}</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-row highlight">
              <span class="stat-label">점수</span>
              <span class="stat-value">{{ score }}점</span>
            </div>
          </div>

          <!-- 이름 입력 -->
          <div class="name-input-section">
            <input
              v-model="playerName"
              type="text"
              class="name-input"
              placeholder="이름을 입력하세요"
              maxlength="20"
              @keydown.enter="handleSubmitScore"
            />
          </div>

          <!-- 버튼 영역 -->
          <div class="button-section">
            <!-- 혜택이 있으면 쿠폰 받기 버튼 -->
            <button
              v-if="reward"
              class="btn-primary btn-coupon"
              :disabled="isSubmitting"
              @click="handleGetCoupon"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z"/>
              </svg>
              쿠폰으로 받기
            </button>

            <!-- 점수 제출 버튼 -->
            <button
              class="btn-primary btn-submit"
              :class="{ 'btn-secondary': reward }"
              :disabled="isSubmitting"
              @click="handleSubmitScore"
            >
              {{ isSubmitting ? '전송 중...' : '점수 제출' }}
            </button>

            <!-- 하단 버튼들 -->
            <div class="bottom-actions">
              <!-- 다시하기 -->
              <button class="btn-retry" @click="handleRetry">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 4v6h6M23 20v-6h-6"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                다시 하기
              </button>

              <!-- 공유하기 -->
              <button class="btn-share" @click="openShareSheet">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                공유하기
              </button>
            </div>
          </div>
        </div>

        <!-- Step 2: 쿠폰 카드 (인스타그램 얼리 액세스 스타일) -->
        <div v-else-if="step === 'coupon'" class="step-content coupon-step">
          <!-- 쿠폰 카드 -->
          <div class="coupon-card-instagram">
            <!-- 상단 뱃지 -->
            <div class="coupon-top-badge">
              <span class="badge-icon">🎁</span>
              <span class="badge-text">쿠폰</span>
            </div>

            <!-- 매장 로고/프로필 -->
            <div class="store-profile">
              <div class="store-logo-wrapper">
                <img
                  v-if="storeLogoUrl"
                  :src="storeLogoUrl"
                  alt="매장 로고"
                  class="store-logo-img"
                />
                <div v-else class="store-logo-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- 혜택 정보 -->
            <div class="benefit-info-card">
              <h3 class="benefit-title-card">{{ reward?.title || '혜택' }}</h3>
              <p class="store-name-card">{{ storeName || '매장' }}</p>
            </div>

            <!-- 바코드 스타일 쿠폰 코드 -->
            <div class="barcode-section">
              <div class="barcode-lines">
                <span v-for="i in 30" :key="i" class="barcode-line" :style="getBarcodeStyle(i)"></span>
              </div>
              <p class="coupon-code-display">{{ couponCode }}</p>
            </div>

            <!-- 타이머 -->
            <div class="timer-section">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span class="timer-text">{{ formatRemainingTime }} 남음</span>
            </div>
          </div>

          <!-- 쿠폰 사용 완료 표시 -->
          <div v-if="couponUsed" class="coupon-used-overlay">
            <div class="used-stamp">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              <span>사용 완료</span>
            </div>
          </div>

          <!-- 매장 코드 입력 (쿠폰 미사용 시) -->
          <div v-if="!couponUsed" class="store-code-section-new">
            <div class="store-code-input-wrapper">
              <input
                v-model="storeCodeInput"
                type="text"
                class="store-code-input-new"
                placeholder="매장 코드 입력"
                maxlength="10"
                :disabled="isVerifyingStoreCode"
                @keydown.enter="handleStoreCodeSubmit"
              />
              <button
                class="btn-store-code-new"
                :disabled="!storeCodeInput || isVerifyingStoreCode"
                @click="handleStoreCodeSubmit"
              >
                <span v-if="!isVerifyingStoreCode">사용</span>
                <span v-else class="btn-loading-new"></span>
              </button>
            </div>
            <p v-if="storeCodeError" class="store-code-error-new">{{ storeCodeError }}</p>
          </div>

          <!-- 하단 버튼 -->
          <div class="coupon-actions">
            <button class="btn-coupon-confirm" @click="handleClose">
              확인
            </button>
            <button class="btn-coupon-dismiss" @click="handleClose">
              닫기
            </button>
          </div>
        </div>
      </div>

      <!-- 로그인 모달 -->
      <AuthModal
        :is-open="showAuthModal"
        :qr-code-id="qrCodeId"
        :reward-info="reward ? { title: reward.title, description: reward.description } : undefined"
        @success="handleAuthSuccess"
        @close="showAuthModal = false"
      />

      <!-- 쿠폰 생성 모달 (내부 처리) -->
      <CouponRewardModal
        v-if="reward"
        :is-open="showCouponModal"
        :benefit="reward"
        :user-id="currentUserId"
        :game-score-id="scoreId"
        :qr-code="qrCodeId"
        :game-score="score"
        @close="handleCouponCreated"
        @coupon-created="handleCouponCode"
      />

      <!-- 공유 시트 -->
      <Transition name="sheet">
        <div v-if="showShare" class="share-overlay" @click.self="closeShareSheet">
          <div class="share-sheet">
            <div class="share-header">
              <h3>결과 공유하기</h3>
              <button class="share-close-btn" @click="closeShareSheet">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="share-preview">
              <div class="share-preview-card">
                <span class="share-score">{{ score }}점</span>
                <span class="share-game">{{ getGameName(gameType) }}</span>
              </div>
            </div>

            <div class="share-options">
              <button class="share-option kakao" @click="shareToKakao">
                <div class="share-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3C1E1E">
                    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.86 5.26 4.64 6.68-.14.53-.92 3.37-.95 3.58 0 0-.02.16.08.22.1.06.22.01.22.01.29-.04 3.37-2.2 3.9-2.57.7.1 1.42.15 2.16.15 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
                  </svg>
                </div>
                <span>카카오톡</span>
              </button>

              <button class="share-option link" @click="copyShareLink">
                <div class="share-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <span>링크 복사</span>
              </button>

              <button class="share-option twitter" @click="shareToTwitter">
                <div class="share-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span>X</span>
              </button>
            </div>

            <!-- 복사 완료 토스트 -->
            <Transition name="toast">
              <div v-if="showCopyToast" class="copy-toast">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                링크가 복사되었습니다
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { submitGameScore } from '@/services/gameScoreService'
import benefitsService, { type BenefitDto } from '@/services/benefitsService'
import shareService from '@/services/shareService'
import couponsService from '@/services/couponsService'
import AuthModal from '@/components/AuthModal.vue'
import CouponRewardModal from '@/components/CouponRewardModal.vue'
import IconBase from '@/components/IconBase.vue'

interface GameData {
  score: number
  time: number
  grade: { icon: string; text: string; color: string }
  // Memory game
  moves?: number
  combo?: number
  // Spot difference game
  foundCount?: number
  totalDifferences?: number
  hintsUsed?: number
  success?: boolean
}

interface Props {
  isOpen: boolean
  gameData: GameData
  qrCode?: string // short code for game score, benefits API
  qrCodeUuid?: string // UUID for share API
  gameType: string
  storeName?: string // 매장명
  storeLogoUrl?: string // 매장 로고 URL
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  restart: []
}>()

const authStore = useAuthStore()

// State
const step = ref<'result' | 'coupon'>('result')
const playerName = ref('')
const isSubmitting = ref(false)
const showAuthModal = ref(false)
const showCouponModal = ref(false)
const currentUserId = ref('')
const couponCode = ref('')
const scoreId = ref('')
const reward = ref<BenefitDto | null>(null)
const qrCodeId = computed(() => props.qrCode)

// Share state
const showShare = ref(false)
const showCopyToast = ref(false)

// Store code state (매장 코드로 빠른 쿠폰 사용)
const storeCodeInput = ref('')
const isVerifyingStoreCode = ref(false)
const storeCodeError = ref('')
const couponUsed = ref(false)

// 매장 정보 (props 또는 API에서 가져옴)
const storeName = ref<string | undefined>(undefined)
const storeLogoUrl = ref<string | undefined>(undefined)

// 쿠폰 만료 타이머
const couponExpiresAt = ref<Date | null>(null)
const remainingSeconds = ref(300) // 기본 5분
let timerInterval: ReturnType<typeof setInterval> | null = null

// Computed values
const score = computed(() => props.gameData?.score ?? 0)
const gradeInfo = computed(() => {
  // 혜택이 있으면 혜택의 아이콘/제목 사용
  if (reward.value) {
    return {
      icon: reward.value.iconName || 'trophy',
      title: reward.value.title,
      bgColor: getBgColorFromIcon(reward.value.iconName || 'trophy')
    }
  }
  // 혜택이 없으면 게임 내 등급 사용
  const grade = props.gameData?.grade
  if (!grade) return { icon: 'gamepad', title: '게임 완료', bgColor: '#e0e7ff' }
  return {
    icon: grade.icon || 'gamepad',
    title: grade.text,
    bgColor: getBgColorFromGrade(grade.color)
  }
})

function getBgColorFromIcon(iconName: string): string {
  const iconColorMap: Record<string, string> = {
    'trophy': '#fef3c7',      // amber
    'medal-gold': '#fef3c7',  // amber
    'medal-silver': '#f3f4f6', // gray
    'medal-bronze': '#fed7aa', // orange
    'star': '#fef3c7',        // amber
    'gift': '#fce7f3',        // pink
    'ticket': '#f3e8ff',      // purple
    'sparkles': '#e0f2fe',    // cyan
    'party-horn': '#ffedd5',  // orange
  }
  return iconColorMap[iconName] || '#e0e7ff'
}

function getIconColor(iconName: string): string {
  const iconColors: Record<string, string> = {
    'medal-bronze': '#cd7f32',
    'medal-silver': '#a8a8a8',
    'medal-gold': '#ffd700',
    'trophy': '#ffd700',
    'star': '#ffc107',
    'gift': '#e91e63',
    'ticket': '#9c27b0',
    'sparkles': '#00bcd4',
    'party-horn': '#ff5722',
  }
  return iconColors[iconName] || '#ffffff'
}

const gameStats = computed(() => {
  const data = props.gameData
  if (!data) return { time: 0, secondLabel: '', secondValue: '' }

  if (props.gameType === 'memory') {
    return {
      time: data.time,
      secondLabel: '콤보',
      secondValue: `${data.combo || 0}회`
    }
  } else if (props.gameType === 'spot-difference') {
    return {
      time: data.time,
      secondLabel: '찾은 개수',
      secondValue: `${data.foundCount || 0}/${data.totalDifferences || 0}`
    }
  } else if (props.gameType === 'pinball') {
    return {
      time: data.time,
      secondLabel: '최대 콤보',
      secondValue: `x${data.combo || 0}`
    }
  }
  return { time: data.time, secondLabel: '', secondValue: '' }
})

function getBgColorFromGrade(color: string): string {
  // Convert text color to background color (lighter version)
  const colorMap: Record<string, string> = {
    '#f59e0b': '#fef3c7', // amber
    '#f43f5e': '#ffe4e6', // rose
    '#ec4899': '#fce7f3', // pink
    '#8b5cf6': '#ede9fe', // violet
    '#6b7280': '#f3f4f6', // gray
    '#6366f1': '#e0e7ff', // indigo
    '#ef4444': '#fee2e2'  // red
  }
  return colorMap[color] || '#e0e7ff'
}

// 남은 시간 포맷
const formatRemainingTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

// 바코드 스타일 생성
function getBarcodeStyle(index: number) {
  const width = Math.random() > 0.5 ? 2 : 3
  const height = 30 + Math.random() * 15
  return {
    width: `${width}px`,
    height: `${height}px`
  }
}

// 타이머 시작
function startCouponTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  remainingSeconds.value = 300 // 5분
  couponExpiresAt.value = new Date(Date.now() + 300 * 1000)

  timerInterval = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
  }, 1000)
}

// 타이머 정리
function stopCouponTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// Fetch eligible reward on modal open
watch(() => props.isOpen, async (isOpen) => {
  console.log('[GameResultModal] v2 - isOpen changed:', isOpen)
  if (isOpen) {
    step.value = 'result'
    playerName.value = ''
    isSubmitting.value = false
    showAuthModal.value = false
    showCouponModal.value = false
    couponCode.value = ''
    scoreId.value = ''
    reward.value = null
    couponUsed.value = false
    storeCodeInput.value = ''
    storeCodeError.value = ''

    // props에서 매장 정보 설정
    storeName.value = props.storeName
    storeLogoUrl.value = props.storeLogoUrl

    // Fetch benefits (qrCodeUuid 사용 - API는 UUID를 기대함)
    console.log('[GameResultModal] Fetching benefits:', {
      qrCodeUuid: props.qrCodeUuid,
      qrCode: props.qrCode,
      gameType: props.gameType,
      score: props.gameData?.score
    })

    if (props.qrCodeUuid && props.gameData?.score) {
      try {
        const benefits = await benefitsService.getBenefitsByGame(props.qrCodeUuid, props.gameType)
        console.log('[GameResultModal] Benefits received:', benefits)

        const eligible = benefits
          .filter(b => b.isActive && b.requiredScore <= props.gameData.score)
          .sort((a, b) => b.requiredScore - a.requiredScore)[0]

        console.log('[GameResultModal] Eligible benefit:', eligible)

        if (eligible) {
          reward.value = eligible
        }
      } catch (error) {
        console.error('Failed to fetch benefits:', error)
      }
    } else {
      console.warn('[GameResultModal] Missing qrCodeUuid or score:', {
        qrCodeUuid: props.qrCodeUuid,
        score: props.gameData?.score
      })
    }
  } else {
    // 모달 닫힐 때 타이머 정리
    stopCouponTimer()
  }
})

// Confetti styles
function getConfettiStyle(index: number) {
  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
  const color = colors[index % colors.length]
  const left = Math.random() * 100
  const delay = Math.random() * 2
  const duration = 2 + Math.random() * 2

  return {
    left: `${left}%`,
    backgroundColor: color,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

// 점수 제출
async function handleSubmitScore() {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    const success = await submitGameScore({
      gameType: props.gameType,
      playerName: playerName.value.trim() || '익명',
      score: score.value,
      qrCode: props.qrCode
    })

    if (success) {
      // 제출 성공 후 닫기
      emit('close')
    }
  } catch (error) {
    console.error('Score submit failed:', error)
  } finally {
    isSubmitting.value = false
  }
}

// 쿠폰 받기
async function handleGetCoupon() {
  // 먼저 점수 제출
  if (!scoreId.value && !isSubmitting.value) {
    isSubmitting.value = true
    try {
      const success = await submitGameScore({
        gameType: props.gameType,
        playerName: playerName.value.trim() || '익명',
        score: score.value,
        qrCode: props.qrCode
      })
      if (success) {
        scoreId.value = 'submitted' // 임시 ID
      }
    } catch (error) {
      console.error('Score submit failed:', error)
    } finally {
      isSubmitting.value = false
    }
  }
  proceedWithCoupon()
}

function proceedWithCoupon() {
  if (authStore.isAuthenticated && authStore.user) {
    // 로그인 되어있음 → 바로 쿠폰 생성
    currentUserId.value = authStore.user.id
    showCouponModal.value = true
  } else {
    // 로그인 필요
    showAuthModal.value = true
  }
}

// 로그인 성공
function handleAuthSuccess(userId: string) {
  showAuthModal.value = false
  currentUserId.value = userId
  showCouponModal.value = true
}

// 쿠폰 코드 수신
function handleCouponCode(code: string) {
  couponCode.value = code
  // 쿠폰 타이머 시작
  startCouponTimer()
}

// 쿠폰 생성 완료
function handleCouponCreated() {
  showCouponModal.value = false
  if (couponCode.value) {
    step.value = 'coupon'
  }
}

// 다시하기
function handleRetry() {
  emit('restart')
}

// 닫기
function handleClose() {
  emit('close')
}

// 공유 시트 열기/닫기
function openShareSheet() {
  showShare.value = true
}

function closeShareSheet() {
  showShare.value = false
}

// 게임 이름 가져오기
function getGameName(type: string): string {
  const gameNames: Record<string, string> = {
    'memory': '카드 매칭',
    'spot-difference': '틀린그림찾기',
    'pinball': '핀볼'
  }
  return gameNames[type] || '게임'
}

// 공유용 QR Code ID (UUID 우선, 없으면 short code 폴백)
const shareQrCodeId = computed(() => props.qrCodeUuid || props.qrCode)

// 카카오톡 공유
async function shareToKakao() {
  const qrId = shareQrCodeId.value
  if (!qrId) {
    // QR 코드 없이도 기본 공유 시도
    alert('공유 링크를 생성할 수 없습니다.')
    return
  }
  try {
    await shareService.shareToKakao(
      qrId,
      `${getGameName(props.gameType)}에서 ${score.value}점 달성!`,
      '도전해보세요!',
      undefined,
      'game_result',
      props.gameType,
      score.value
    )
    closeShareSheet()
  } catch (error) {
    console.error('카카오톡 공유 실패:', error)
    alert('카카오톡 공유에 실패했습니다. 다시 시도해주세요.')
  }
}

// 링크 복사
async function copyShareLink() {
  const qrId = shareQrCodeId.value
  if (!qrId) {
    // QR 코드 없으면 현재 URL 복사
    try {
      await navigator.clipboard.writeText(window.location.href)
      showCopyToast.value = true
      setTimeout(() => showCopyToast.value = false, 2000)
    } catch {
      alert('링크 복사에 실패했습니다.')
    }
    return
  }
  try {
    await shareService.copyLink(qrId, 'game_result', props.gameType, score.value)
    showCopyToast.value = true
    setTimeout(() => showCopyToast.value = false, 2000)
  } catch (error) {
    console.error('링크 복사 실패:', error)
    // API 실패 시 현재 URL 복사 폴백
    try {
      await navigator.clipboard.writeText(window.location.href)
      showCopyToast.value = true
      setTimeout(() => showCopyToast.value = false, 2000)
    } catch {
      alert('링크 복사에 실패했습니다.')
    }
  }
}

// X(Twitter) 공유
async function shareToTwitter() {
  const qrId = shareQrCodeId.value
  const shareText = `${getGameName(props.gameType)}에서 ${score.value}점 달성! 도전해보세요!`

  if (!qrId) {
    // QR 코드 없이 기본 X 공유
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
    closeShareSheet()
    return
  }
  try {
    await shareService.shareToTwitter(
      qrId,
      shareText,
      'game_result',
      props.gameType,
      score.value
    )
    closeShareSheet()
  } catch (error) {
    console.error('X 공유 실패:', error)
    // API 실패 시 기본 X 공유 폴백
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
    closeShareSheet()
  }
}

// 매장 코드로 쿠폰 사용 처리
async function handleStoreCodeSubmit() {
  if (!storeCodeInput.value || !couponCode.value) return

  storeCodeError.value = ''
  isVerifyingStoreCode.value = true

  try {
    const response = await couponsService.redeemWithStoreCode({
      couponCode: couponCode.value,
      storeCode: storeCodeInput.value
    })

    if (response.success) {
      couponUsed.value = true
      storeCodeInput.value = ''
    } else {
      storeCodeError.value = response.message || '사용에 실패했습니다'
    }
  } catch (error: unknown) {
    console.error('매장 코드 검증 실패:', error)
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      storeCodeError.value = axiosError.response?.data?.message || '매장 코드가 올바르지 않습니다'
    } else {
      storeCodeError.value = '매장 코드가 올바르지 않습니다'
    }
  } finally {
    isVerifyingStoreCode.value = false
  }
}

// 컴포넌트 언마운트 시 타이머 정리
onBeforeUnmount(() => {
  stopCouponTimer()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-container {
  position: relative;
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 360px;
  padding: 32px 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Confetti */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  border-radius: 2px;
  animation: confettiFall 3s ease-out forwards;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(400px) rotate(720deg);
    opacity: 0;
  }
}

/* Close button */
.btn-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  z-index: 10;
}

.btn-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #1e293b;
}

/* Step content */
.step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* Score badge */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  padding: 16px 32px;
  border-radius: 16px;
  color: white;
  margin-bottom: 8px;
}

.score-label {
  font-size: 12px;
  opacity: 0.9;
}

.score-value {
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
}

/* Grade section */
.grade-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.grade-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grade-svg {
  width: 32px;
  height: 32px;
}

.custom-icon-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 8px;
}

.grade-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.reward-name {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* Reward section */
.reward-section {
  margin-top: -8px;
}

.reward-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fef3c7;
  color: #d97706;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

/* Stats panel */
.stats-panel {
  width: 100%;
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.stat-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 8px 0;
}

.stat-row.highlight .stat-label,
.stat-row.highlight .stat-value {
  color: #f43f5e;
  font-size: 16px;
}

/* Name input */
.name-input-section {
  width: 100%;
}

.name-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  text-align: center;
  outline: none;
  transition: border-color 0.2s;
  background: #f8fafc;
}

.name-input:focus {
  border-color: #3b82f6;
  background: white;
}

/* Buttons */
.button-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-coupon {
  background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(244, 63, 94, 0.4);
}

.btn-coupon:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 63, 94, 0.5);
}

.btn-submit {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  box-shadow: none;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
  transform: none;
  box-shadow: none;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-retry {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  transition: color 0.2s;
}

.btn-retry:hover {
  color: #64748b;
}

/* Success step */
.success-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 8px;
}

.success-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.coupon-card {
  width: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.coupon-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.coupon-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.coupon-achievement {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 600;
  background: #eff6ff;
  padding: 4px 12px;
  border-radius: 20px;
  margin: 0;
}

.coupon-code-section {
  width: 100%;
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.coupon-code-label {
  font-size: 12px;
  color: #64748b;
  display: block;
  margin-bottom: 8px;
}

.coupon-code {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 2px;
  display: block;
}

.coupon-notice {
  font-size: 13px;
  color: #f43f5e;
  margin: 12px 0 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* Bottom actions */
.bottom-actions {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.btn-retry,
.btn-share {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  transition: color 0.2s;
}

.btn-retry:hover,
.btn-share:hover {
  color: #64748b;
}

.btn-share {
  color: #d4a853;
}

.btn-share:hover {
  color: #b8942e;
}

/* Share Sheet */
.share-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10001;
}

.share-sheet {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 20px 20px 40px;
  position: relative;
}

.share-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.share-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.share-close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
}

.share-preview {
  margin-bottom: 24px;
}

.share-preview-card {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  color: white;
}

.share-score {
  display: block;
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 4px;
}

.share-game {
  font-size: 14px;
  opacity: 0.9;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: #f8f8f8;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.share-option:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.share-option:active {
  transform: scale(0.95);
}

.share-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.share-option.kakao .share-icon {
  background: #FEE500;
}

.share-option.link .share-icon {
  background: #e8e8e8;
  color: #333;
}

.share-option.twitter .share-icon {
  background: #000;
}

.share-option.twitter .share-icon svg {
  fill: white;
}

.share-option span {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

/* Copy toast */
.copy-toast {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #1d1d1f;
  color: white;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  z-index: 10001;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Transitions */
.sheet-enter-active,
.sheet-leave-active {
  transition: all 0.3s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .share-sheet,
.sheet-leave-to .share-sheet {
  transform: translateY(100%);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

/* Store code section (매장 코드 입력) */
.store-code-section {
  width: 100%;
  margin-top: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
  border: 2px solid #fde047;
  border-radius: 16px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.store-code-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
}

.store-code-icon {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.store-code-hint {
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
  margin: 0;
}

.store-code-input-wrapper {
  display: flex;
  gap: 10px;
}

.store-code-input {
  flex: 1;
  padding: 14px 16px;
  border: 2px solid #fde047;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 3px;
  outline: none;
  background: white;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(234, 179, 8, 0.15);
}

.store-code-input:focus {
  border-color: #eab308;
  box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.2);
}

.store-code-input:disabled {
  background: #fefce8;
  opacity: 0.7;
}

.store-code-input::placeholder {
  color: #d4a853;
  letter-spacing: 2px;
  font-weight: 500;
}

.btn-store-code {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3);
}

.btn-store-code:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px rgba(234, 179, 8, 0.4);
}

.btn-store-code:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.btn-store-code:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-loading {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.store-code-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #dc2626;
  margin: 12px 0 0 0;
  padding: 10px;
  background: #fef2f2;
  border-radius: 10px;
  animation: shake 0.4s ease-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

/* Coupon used badge (사용 완료 표시) */
.coupon-used-badge {
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  margin-top: 12px;
  animation: successPop 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes successPop {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.used-badge-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.used-check-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: checkBounce 0.6s ease-out 0.2s both;
}

@keyframes checkBounce {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.used-badge-text {
  display: flex;
  flex-direction: column;
  color: white;
}

.used-title {
  font-size: 18px;
  font-weight: 700;
}

.used-subtitle {
  font-size: 13px;
  opacity: 0.9;
}

/* ==========================================
   인스타그램 얼리 액세스 스타일 쿠폰 카드
   ========================================== */

.coupon-step {
  gap: 20px;
}

/* 쿠폰 카드 - 화이트→블루 그라데이션 */
.coupon-card-instagram {
  width: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 50%, #bae6fd 100%);
  border-radius: 24px;
  padding: 24px;
  position: relative;
  box-shadow:
    0 4px 6px -1px rgba(59, 130, 246, 0.1),
    0 2px 4px -1px rgba(59, 130, 246, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: cardFloat 0.5s ease-out;
}

@keyframes cardFloat {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 상단 뱃지 */
.coupon-top-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.badge-icon {
  font-size: 14px;
}

.badge-text {
  letter-spacing: 0.5px;
}

/* 매장 로고/프로필 */
.store-profile {
  margin-top: 12px;
}

.store-logo-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border: 3px solid white;
  overflow: hidden;
}

.store-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.store-logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #3b82f6;
}

/* 혜택 정보 */
.benefit-info-card {
  text-align: center;
}

.benefit-title-card {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.store-name-card {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* 바코드 스타일 쿠폰 코드 */
.barcode-section {
  width: 100%;
  padding: 16px;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.barcode-lines {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1px;
  height: 45px;
}

.barcode-line {
  background: #1e293b;
  border-radius: 1px;
}

.coupon-code-display {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 4px;
  font-family: 'Courier New', monospace;
  margin: 0;
}

/* 타이머 */
.timer-section {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
}

.timer-text {
  animation: timerPulse 1s ease-in-out infinite;
}

@keyframes timerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 쿠폰 사용 완료 오버레이 */
.coupon-used-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(16, 185, 129, 0.95);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlayFade 0.3s ease-out;
}

@keyframes overlayFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.used-stamp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
}

.used-stamp svg {
  animation: stampBounce 0.5s ease-out;
}

@keyframes stampBounce {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.used-stamp span {
  font-size: 20px;
  font-weight: 700;
}

/* 매장 코드 입력 (새 스타일) */
.store-code-section-new {
  width: 100%;
}

.store-code-section-new .store-code-input-wrapper {
  display: flex;
  gap: 8px;
}

.store-code-input-new {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  outline: none;
  transition: all 0.2s;
}

.store-code-input-new:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.store-code-input-new::placeholder {
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 1px;
}

.btn-store-code-new {
  padding: 12px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.btn-store-code-new:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-store-code-new:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loading-new {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.store-code-error-new {
  font-size: 13px;
  color: #ef4444;
  margin: 8px 0 0 0;
  text-align: center;
}

/* 하단 버튼 */
.coupon-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-coupon-confirm {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-coupon-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-coupon-dismiss {
  width: 100%;
  padding: 12px 24px;
  background: transparent;
  color: #64748b;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-coupon-dismiss:hover {
  color: #475569;
  background: #f1f5f9;
}
</style>
