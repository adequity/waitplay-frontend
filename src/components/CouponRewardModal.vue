<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="celebration-icon">
            <IconBase name="party-horn" />
          </div>
          <h2 class="modal-title">축하합니다!</h2>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Benefit Info -->
        <div class="benefit-info">
          <div class="benefit-icon-wrapper">
            <!-- 커스텀 아이콘 -->
            <img v-if="benefit.iconType === 'custom' && benefit.customIconUrl"
                 :src="benefit.customIconUrl"
                 class="benefit-custom-icon" />
            <!-- 프리셋 아이콘 -->
            <IconBase v-else :name="benefit.iconName || 'gift'" />
          </div>
          <h3 class="benefit-title">{{ benefit.title }}</h3>
          <p v-if="benefit.description" class="benefit-description">
            {{ benefit.description }}
          </p>
          <div class="score-badge">
            {{ benefit.requiredScore }}점 달성!
          </div>
        </div>

        <!-- Coupon Display (after generation) -->
        <div v-if="couponCode && !benefitRedeemed" class="coupon-section">
          <div class="coupon-code-box">
            <p class="coupon-label">쿠폰 코드</p>
            <p class="coupon-code">{{ couponCode }}</p>
            <p class="expiry-warning">
              <IconBase name="clock" class="warning-icon" /> {{ expiryMinutes }}분 내에 직원에게 제시하세요
            </p>
          </div>

          <!-- 매장 코드로 바로 사용 (쿠폰 생성 후) -->
          <div class="store-code-section coupon-redeem">
            <div class="store-code-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>매장 코드로 바로 사용</span>
            </div>
            <div class="store-code-input-wrapper">
              <input
                v-model="storeCodeInput"
                type="text"
                class="store-code-input"
                placeholder="매장 코드 입력"
                maxlength="10"
                :disabled="isRedeemingWithCode"
                @keydown.enter="redeemCouponWithStoreCode"
              />
              <button
                class="btn-store-code"
                :disabled="!storeCodeInput || isRedeemingWithCode"
                @click="redeemCouponWithStoreCode"
              >
                <svg v-if="!isRedeemingWithCode" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span v-else class="btn-loading"></span>
              </button>
            </div>
            <p v-if="storeCodeError" class="store-code-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ storeCodeError }}
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isGenerating" class="loading-section">
          <div class="spinner"></div>
          <p>쿠폰 생성 중...</p>
        </div>

        <!-- 로그인 필요 상태 -->
        <div v-if="requiresLogin && !benefitRedeemed" class="login-required-section">
          <div class="login-icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3 class="login-title">로그인이 필요합니다</h3>
          <p class="login-description">쿠폰을 받으려면 먼저 로그인해주세요</p>
          <button class="btn-login" @click="handleRequireLogin">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            로그인하기
          </button>
        </div>

        <!-- Error Message (간결한 인라인) -->
        <div v-else-if="error && !benefitRedeemed" class="error-inline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- 점수 확인 정보 (에러 시 표시, 독립 섹션) -->
        <div v-if="error && !benefitRedeemed && !requiresLogin" class="score-verification-box">
          <div class="score-verification-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>점수 확인</span>
          </div>
          <div class="score-row">
            <span class="score-label">획득 점수</span>
            <span class="score-value highlight">{{ gameScore ?? '-' }}점</span>
          </div>
          <div class="score-row">
            <span class="score-label">필요 점수</span>
            <span class="score-value">{{ benefit.requiredScore }}점</span>
          </div>
          <div v-if="gameScore && gameScore >= benefit.requiredScore" class="score-status success">
            <div class="status-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
            <span>조건 충족 - 혜택을 받을 수 있습니다</span>
          </div>
          <div v-else class="score-status fail">
            <div class="status-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
              </svg>
            </div>
            <span>점수가 부족합니다</span>
          </div>
        </div>

        <!-- 매장 코드로 직접 인정받기 (에러 시 표시, 독립 섹션) -->
        <div v-if="error && !benefitRedeemed && !requiresLogin" class="store-code-section">
          <div class="store-code-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>매장 코드로 바로 인정받기</span>
          </div>
          <div class="store-code-input-wrapper">
            <input
              v-model="storeCodeInput"
              type="text"
              class="store-code-input"
              placeholder="매장 코드 입력"
              maxlength="10"
              :disabled="isRedeemingDirect"
              @keydown.enter="redeemBenefitDirect"
            />
            <button
              class="btn-store-code"
              :disabled="!storeCodeInput || isRedeemingDirect"
              @click="redeemBenefitDirect"
            >
              <svg v-if="!isRedeemingDirect" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              <span v-else class="btn-loading"></span>
            </button>
          </div>
          <p v-if="storeCodeError" class="store-code-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ storeCodeError }}
          </p>
        </div>

        <!-- 혜택 인정 완료 -->
        <div v-if="benefitRedeemed" class="benefit-redeemed-section">
          <div class="redeemed-animation">
            <div class="redeemed-circle">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
          </div>
          <h3 class="redeemed-title">혜택이 인정되었습니다!</h3>
          <p class="redeemed-notice">직원에게 혜택을 받으세요</p>
        </div>

        <!-- Instructions -->
        <div v-if="!couponCode && !isGenerating" class="instructions">
          <p>이 혜택을 지금 받으시겠습니까?</p>
          <p class="warning-text">
            <IconBase name="triangle-exclamation" class="warning-icon" /> 쿠폰은 즉시 사용해야 하며, 나중에 사용할 수 없습니다
          </p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <template v-if="!couponCode && !isGenerating && !error && !benefitRedeemed && !requiresLogin">
          <button class="btn-secondary" @click="handleRetry">다시하기</button>
          <button class="btn-primary" @click="generateCoupon">지금 받기</button>
        </template>
        <template v-else-if="couponCode || benefitRedeemed">
          <button class="btn-primary-full" @click="close">확인</button>
        </template>
        <template v-else-if="requiresLogin">
          <button class="btn-secondary" @click="handleRetry">다시하기</button>
          <button class="btn-primary" @click="handleRequireLogin">로그인</button>
        </template>
        <template v-else-if="error && !benefitRedeemed">
          <button class="btn-secondary" @click="close">닫기</button>
          <button class="btn-primary" @click="generateCoupon">다시 시도</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import couponsService from '@/services/couponsService'
import followService from '@/services/followService'
import IconBase from '@/components/IconBase.vue'

interface Props {
  isOpen: boolean
  benefit: {
    id: string
    title: string
    description?: string
    requiredScore: number
    // Icon settings
    iconType?: 'preset' | 'custom'
    iconName?: string
    customIconUrl?: string
  }
  userId: string
  gameScoreId?: string
  qrCode?: string // 팔로우 처리를 위한 QR 코드
  gameScore?: number // 실제 획득 점수 (에러 시 직원 확인용)
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  retry: []
  requireLogin: []
}>()

const couponCode = ref<string>('')
const expiryMinutes = ref<number>(5)
const isGenerating = ref(false)
const error = ref<string>('')
const requiresLogin = ref(false) // 로그인 필요 상태

// Store code state
const storeCodeInput = ref('')
const storeCodeError = ref('')
const isRedeemingDirect = ref(false) // 에러 시 직접 인정용
const isRedeemingWithCode = ref(false) // 쿠폰 생성 후 매장코드로 사용
const benefitRedeemed = ref(false)

async function generateCoupon() {
  isGenerating.value = true
  error.value = ''

  // userId 검증
  if (!props.userId || props.userId.trim() === '') {
    console.error('[CouponRewardModal] userId is empty, requiring login')
    error.value = '로그인이 필요합니다'
    requiresLogin.value = true
    isGenerating.value = false
    return
  }

  console.log('[CouponRewardModal] Generating coupon:', {
    benefitId: props.benefit.id,
    userId: props.userId,
    gameScoreId: props.gameScoreId
  })

  try {
    // 1. 쿠폰 생성
    const response = await couponsService.generateCoupon({
      benefitId: props.benefit.id,
      userId: props.userId,
      gameScoreId: props.gameScoreId
    })

    couponCode.value = response.couponCode
    expiryMinutes.value = response.expiresInMinutes

    // 2. 자동 팔로우 (QR 코드가 있는 경우)
    if (props.qrCode) {
      try {
        await followService.followAdmin(props.qrCode)
        console.log('Automatically followed admin via QR:', props.qrCode)
      } catch (followErr) {
        // 팔로우 실패는 무시 (쿠폰은 이미 생성됨)
        console.warn('Auto-follow failed (non-critical):', followErr)
      }
    }
  } catch (err: any) {
    console.error('Failed to generate coupon:', err)
    const errorMessage = err.response?.data?.message || '쿠폰 생성에 실패했습니다'
    error.value = errorMessage

    // 사용자 미존재 에러 → 로그인 필요
    if (errorMessage.includes('User not found') || errorMessage.includes('사용자를 찾을 수 없습니다')) {
      requiresLogin.value = true
    }
  } finally {
    isGenerating.value = false
  }
}

// 매장 코드로 혜택 직접 인정
async function redeemBenefitDirect() {
  if (!storeCodeInput.value) return

  // userId 검증
  if (!props.userId || props.userId.trim() === '') {
    storeCodeError.value = '로그인이 필요합니다'
    return
  }

  storeCodeError.value = ''
  isRedeemingDirect.value = true

  console.log('[CouponRewardModal] Redeeming benefit directly:', {
    benefitId: props.benefit.id,
    userId: props.userId,
    storeCode: storeCodeInput.value,
    gameScoreId: props.gameScoreId
  })

  try {
    const response = await couponsService.redeemBenefitDirect({
      benefitId: props.benefit.id,
      userId: props.userId,
      storeCode: storeCodeInput.value,
      gameScoreId: props.gameScoreId
    })

    if (response.success) {
      benefitRedeemed.value = true
      storeCodeInput.value = ''
      error.value = '' // 에러 메시지 숨기기

      // 자동 팔로우
      if (props.qrCode) {
        try {
          await followService.followAdmin(props.qrCode)
        } catch (followErr) {
          console.warn('Auto-follow failed (non-critical):', followErr)
        }
      }
    } else {
      storeCodeError.value = response.message || '인정에 실패했습니다'
    }
  } catch (err: any) {
    console.error('Failed to redeem benefit directly:', err)
    storeCodeError.value = err.response?.data?.message || '매장 코드가 올바르지 않습니다'
  } finally {
    isRedeemingDirect.value = false
  }
}

// 쿠폰 생성 후 매장 코드로 바로 사용
async function redeemCouponWithStoreCode() {
  if (!storeCodeInput.value || !couponCode.value) return

  storeCodeError.value = ''
  isRedeemingWithCode.value = true

  console.log('[CouponRewardModal] Redeeming coupon with store code:', {
    couponCode: couponCode.value,
    storeCode: storeCodeInput.value
  })

  try {
    const response = await couponsService.redeemWithStoreCode({
      couponCode: couponCode.value,
      storeCode: storeCodeInput.value
    })

    if (response.success) {
      benefitRedeemed.value = true
      storeCodeInput.value = ''
    } else {
      storeCodeError.value = response.message || '사용에 실패했습니다'
    }
  } catch (err: any) {
    console.error('Failed to redeem coupon with store code:', err)
    storeCodeError.value = err.response?.data?.message || '매장 코드가 올바르지 않습니다'
  } finally {
    isRedeemingWithCode.value = false
  }
}

function close() {
  emit('close')
  // Reset state
  couponCode.value = ''
  error.value = ''
  isGenerating.value = false
  storeCodeInput.value = ''
  storeCodeError.value = ''
  isRedeemingDirect.value = false
  isRedeemingWithCode.value = false
  benefitRedeemed.value = false
  requiresLogin.value = false
}

function handleRetry() {
  // 모달 닫고 다시하기 이벤트 emit
  close()
  emit('retry')
}

function handleRequireLogin() {
  // 로그인 필요 이벤트 emit
  close()
  emit('requireLogin')
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: surfaceRise 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes surfaceRise {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 20px 24px 16px;
  text-align: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.celebration-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: white;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.benefit-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.benefit-icon-wrapper {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
}

.benefit-icon-wrapper i {
  font-size: 36px;
  color: white;
}

.benefit-icon-wrapper :deep(svg) {
  width: 36px;
  height: 36px;
  color: white;
}

.benefit-custom-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
}

.benefit-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.benefit-description {
  font-size: 16px;
  color: #6e6e73;
  margin: 0;
  max-width: 80%;
}

.score-badge {
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
}

.coupon-section {
  margin-top: 8px;
}

.coupon-code-box {
  background: #f5f5f7;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.coupon-label {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.coupon-code {
  font-size: 32px;
  font-weight: 700;
  color: #3b82f6;
  letter-spacing: 4px;
  font-family: 'Courier New', monospace;
  margin: 0 0 12px 0;
}

.expiry-warning {
  font-size: 14px;
  color: #ff3b30;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.warning-icon {
  width: 14px;
  height: 14px;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f5f5f7;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 에러 메시지 (간결한 인라인) */
.error-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border-radius: 12px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 점수 확인 박스 (직원용) */
.score-verification-box {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
}

.score-verification-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.score-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.score-row:not(:last-of-type) {
  border-bottom: 1px solid #f1f5f9;
}

.score-row .score-label {
  font-size: 13px;
  color: #64748b;
}

.score-row .score-value {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.score-row .score-value.highlight {
  color: #3b82f6;
  font-size: 18px;
}

.score-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 8px;
}

.score-status .status-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-status.success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
}

.score-status.success .status-icon {
  background: #16a34a;
  color: white;
}

.score-status.fail {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.score-status.fail .status-icon {
  background: #dc2626;
  color: white;
}

/* 매장 코드 입력 섹션 (독립) */
.store-code-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-radius: 12px;
  padding: 12px;
}

/* 쿠폰 생성 후 매장코드 사용 섹션 */
.store-code-section.coupon-redeem {
  margin-top: 16px;
  background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
  border: 1px solid #fde047;
}

.store-code-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #16a34a;
  font-size: 14px;
  font-weight: 600;
}

.store-code-input-wrapper {
  display: flex;
  gap: 10px;
  max-width: 100%;
  box-sizing: border-box;
}

.store-code-input {
  flex: 1;
  min-width: 0;
  padding: 12px 10px;
  border: 2px solid #86efac;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  outline: none;
  background: white;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
  box-sizing: border-box;
}

.store-code-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

.store-code-input:disabled {
  background: #ecfdf5;
  opacity: 0.7;
}

.store-code-input::placeholder {
  color: #6ee7b7;
  letter-spacing: 2px;
  font-weight: 500;
}

.btn-store-code {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-store-code:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
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
  background: white;
  border-radius: 10px;
  border: 1px solid #fecaca;
  animation: errorShake 0.4s ease-out;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

/* 혜택 인정 완료 */
.benefit-redeemed-section {
  text-align: center;
  padding: 24px 20px;
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.redeemed-animation {
  margin-bottom: 16px;
}

.redeemed-circle {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: successBounce 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes successBounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.redeemed-title {
  font-size: 20px;
  font-weight: 700;
  color: #10b981;
  margin: 0 0 8px 0;
}

.redeemed-notice {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.instructions {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.instructions p {
  font-size: 16px;
  color: #1d1d1f;
  margin: 0;
}

.warning-text {
  font-size: 14px !important;
  color: #ff9500 !important;
  font-weight: 600;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e5ea;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.btn-primary,
.btn-secondary,
.btn-primary-full {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-secondary:hover {
  background: #e5e5ea;
}

.btn-primary-full {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn-primary-full:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 로그인 필요 섹션 */
.login-required-section {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #93c5fd;
  border-radius: 12px;
  animation: slideIn 0.3s ease-out;
}

.login-icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
}

.login-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e40af;
  margin: 0 0 6px 0;
}

.login-description {
  font-size: 13px;
  color: #3b82f6;
  margin: 0 0 14px 0;
}

.btn-login {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-login:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    margin: 20px;
  }

  .benefit-icon-wrapper {
    width: 80px;
    height: 80px;
  }

  .benefit-icon-wrapper i {
    font-size: 36px;
  }

  .benefit-title {
    font-size: 20px;
  }

  .coupon-code {
    font-size: 24px;
    letter-spacing: 2px;
  }

  .store-code-input {
    padding: 12px 10px;
    font-size: 14px;
    letter-spacing: 1px;
  }

  .btn-store-code {
    width: 48px;
    height: 48px;
  }

  .store-code-section {
    padding: 14px;
  }

  .login-required-section {
    padding: 16px;
  }
}
</style>
