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
              <span class="grade-emoji">{{ gradeInfo.emoji }}</span>
            </div>
            <h2 class="grade-title">{{ gradeInfo.title }}</h2>
            <p v-if="reward" class="reward-name">{{ reward.title }}</p>
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

            <!-- 다시하기 -->
            <button class="btn-retry" @click="handleRetry">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 4v6h6M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              다시 하기
            </button>
          </div>
        </div>

        <!-- Step 2: 쿠폰 발급 완료 -->
        <div v-else-if="step === 'coupon'" class="step-content">
          <div class="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 class="success-title">축하합니다!</h2>

          <div class="coupon-card">
            <div class="coupon-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
              </svg>
            </div>
            <h3 class="coupon-title">{{ reward?.title }}</h3>
            <p class="coupon-achievement">{{ reward?.requiredScore }}점 달성!</p>
          </div>

          <div class="coupon-code-section">
            <span class="coupon-code-label">쿠폰 코드</span>
            <span class="coupon-code">{{ couponCode }}</span>
            <p class="coupon-notice">5분 내에 직원에게 제시하세요</p>
          </div>

          <button class="btn-primary" @click="handleClose">확인</button>
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
        @close="handleCouponCreated"
        @coupon-created="handleCouponCode"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { submitGameScore } from '@/services/gameScoreService'
import benefitsService, { type BenefitDto } from '@/services/benefitsService'
import AuthModal from '@/components/AuthModal.vue'
import CouponRewardModal from '@/components/CouponRewardModal.vue'

interface GameData {
  score: number
  time: number
  grade: { emoji: string; text: string; color: string }
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
  qrCode?: string
  gameType: string
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

// Computed values
const score = computed(() => props.gameData?.score ?? 0)
const gradeInfo = computed(() => {
  const grade = props.gameData?.grade
  if (!grade) return { emoji: '🎮', title: '게임 완료', bgColor: '#e0e7ff' }
  return {
    emoji: grade.emoji,
    title: grade.text,
    bgColor: getBgColorFromGrade(grade.color)
  }
})

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

// Fetch eligible reward on modal open
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    step.value = 'result'
    playerName.value = ''
    isSubmitting.value = false
    showAuthModal.value = false
    showCouponModal.value = false
    couponCode.value = ''
    scoreId.value = ''
    reward.value = null

    // Fetch benefits
    if (props.qrCode && props.gameData?.score) {
      try {
        const benefits = await benefitsService.getBenefitsByGame(props.qrCode, props.gameType)
        const eligible = benefits
          .filter(b => b.isActive && b.requiredScore <= props.gameData.score)
          .sort((a, b) => b.requiredScore - a.requiredScore)[0]
        if (eligible) {
          reward.value = eligible
        }
      } catch (error) {
        console.error('Failed to fetch benefits:', error)
      }
    }
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

.grade-emoji {
  font-size: 32px;
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

.coupon-notice::before {
  content: '⏱';
}
</style>
