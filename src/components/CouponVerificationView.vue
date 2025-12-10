<template>
  <div class="verification-container">
    <!-- Header -->
    <div class="header">
      <h1 class="title">🎫 쿠폰 검증</h1>
      <p class="subtitle">고객의 쿠폰 코드를 입력하여 확인하세요</p>
    </div>

    <!-- Input Section -->
    <div class="input-section">
      <div class="input-wrapper">
        <input
          v-model="couponCode"
          type="text"
          class="coupon-input"
          placeholder="쿠폰 코드 입력 (예: DRINK-ABC12345)"
          @keyup.enter="verifyCoupon"
          :disabled="isVerifying"
        />
        <button
          class="btn-verify"
          @click="verifyCoupon"
          :disabled="!couponCode.trim() || isVerifying"
        >
          {{ isVerifying ? '확인 중...' : '확인' }}
        </button>
      </div>
    </div>

    <!-- Result Section -->
    <div v-if="verificationResult" class="result-section">
      <!-- Success -->
      <div v-if="verificationResult.isValid" class="result-card success">
        <div class="result-icon">✅</div>
        <h2 class="result-title">유효한 쿠폰입니다</h2>
        <div class="result-details">
          <div class="detail-row">
            <span class="detail-label">혜택</span>
            <span class="detail-value">{{ verificationResult.benefitTitle }}</span>
          </div>
          <div v-if="verificationResult.benefitDescription" class="detail-row">
            <span class="detail-label">설명</span>
            <span class="detail-value">{{ verificationResult.benefitDescription }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">사용 시간</span>
            <span class="detail-value">{{ formatDateTime(verificationResult.usedAt) }}</span>
          </div>
        </div>
        <p class="result-message success-message">{{ verificationResult.message }}</p>
      </div>

      <!-- Error -->
      <div v-else class="result-card error">
        <div class="result-icon">❌</div>
        <h2 class="result-title">유효하지 않은 쿠폰</h2>
        <p class="result-message error-message">{{ verificationResult.message }}</p>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="error-alert">
      <p>{{ error }}</p>
    </div>

    <!-- Statistics Section -->
    <div v-if="stats" class="stats-section">
      <h3 class="stats-title">오늘의 쿠폰 통계</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <p class="stat-label">오늘 발급</p>
            <p class="stat-value">{{ stats.todayIssued }}장</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <p class="stat-label">오늘 사용</p>
            <p class="stat-value">{{ stats.todayUsed }}장</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💯</div>
          <div class="stat-content">
            <p class="stat-label">총 사용률</p>
            <p class="stat-value">{{ stats.usageRate }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import couponsService, { type CouponVerificationResponse, type CouponStatsResponse } from '@/services/couponsService'

const authStore = useAuthStore()

const couponCode = ref('')
const isVerifying = ref(false)
const verificationResult = ref<CouponVerificationResponse | null>(null)
const error = ref('')
const stats = ref<CouponStatsResponse | null>(null)

onMounted(async () => {
  await loadStats()
})

async function verifyCoupon() {
  if (!couponCode.value.trim()) return

  isVerifying.value = true
  error.value = ''
  verificationResult.value = null

  try {
    const result = await couponsService.verifyCoupon({
      couponCode: couponCode.value.trim().toUpperCase()
    })

    verificationResult.value = result

    // Reload stats after successful verification
    if (result.isValid) {
      await loadStats()
      // Clear input after successful verification
      setTimeout(() => {
        couponCode.value = ''
        verificationResult.value = null
      }, 5000)
    }
  } catch (err: any) {
    console.error('Failed to verify coupon:', err)
    if (err.response?.data?.message) {
      verificationResult.value = {
        isValid: false,
        benefitTitle: '',
        message: err.response.data.message
      }
    } else {
      error.value = '쿠폰 확인에 실패했습니다'
    }
  } finally {
    isVerifying.value = false
  }
}

async function loadStats() {
  try {
    const qrCodeId = authStore.user?.qrCodeId
    if (!qrCodeId) {
      console.error('No QR code ID found')
      return
    }

    stats.value = await couponsService.getCouponStats(qrCodeId)
  } catch (err) {
    console.error('Failed to load coupon stats:', err)
  }
}

function formatDateTime(dateString?: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.verification-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 16px;
  color: #6e6e73;
  margin: 0;
}

.input-section {
  margin-bottom: 32px;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.coupon-input {
  flex: 1;
  padding: 16px 20px;
  border: 2px solid #d2d2d7;
  border-radius: 12px;
  font-size: 18px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  transition: border-color 0.2s ease;
}

.coupon-input:focus {
  outline: none;
  border-color: #0071e3;
}

.coupon-input:disabled {
  background: #f5f5f7;
  color: #86868b;
}

.btn-verify {
  padding: 16px 32px;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-verify:hover:not(:disabled) {
  background: #0077ed;
  transform: translateY(-2px);
}

.btn-verify:disabled {
  background: #d2d2d7;
  cursor: not-allowed;
  transform: none;
}

.result-section {
  margin-bottom: 40px;
}

.result-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-card.success {
  border: 3px solid #34c759;
}

.result-card.error {
  border: 3px solid #ff3b30;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.result-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 24px 0;
}

.result-card.success .result-title {
  color: #34c759;
}

.result-card.error .result-title {
  color: #ff3b30;
}

.result-details {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e5e5ea;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 15px;
  color: #86868b;
  font-weight: 600;
}

.detail-value {
  font-size: 15px;
  color: #1d1d1f;
  font-weight: 600;
}

.result-message {
  font-size: 16px;
  margin: 0;
}

.success-message {
  color: #34c759;
  font-weight: 600;
}

.error-message {
  color: #ff3b30;
  font-weight: 600;
}

.error-alert {
  background: #fff5f5;
  border: 1px solid #ff3b30;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 32px;
}

.error-alert p {
  color: #ff3b30;
  margin: 0;
  text-align: center;
}

.stats-section {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stats-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 20px 0;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 32px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #86868b;
  margin: 0 0 4px 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .verification-container {
    padding: 20px;
  }

  .title {
    font-size: 28px;
  }

  .input-wrapper {
    flex-direction: column;
  }

  .result-card {
    padding: 24px;
  }

  .result-icon {
    font-size: 48px;
  }

  .result-title {
    font-size: 22px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
