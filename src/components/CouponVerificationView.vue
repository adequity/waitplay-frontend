<template>
  <div class="verify-page">
    <!-- Navigation Header -->
    <header class="verify-header">
      <button class="btn-back" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span>관리자</span>
      </button>
      <h1 class="header-title">쿠폰 검증</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- Main Content -->
    <main class="verify-main">
      <!-- Input Card -->
      <section class="input-card">
        <div class="card-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="2"/>
            <path d="M9 12h6"/>
            <path d="M9 16h6"/>
          </svg>
        </div>
        <h2 class="card-title">쿠폰 코드 입력</h2>
        <p class="card-subtitle">고객에게 받은 쿠폰 코드를 입력해주세요</p>

        <div class="input-group">
          <input
            v-model="couponCode"
            type="text"
            class="code-input"
            :class="{ 'has-value': couponCode.length > 0 }"
            placeholder="DRINK-ABC12345"
            @keyup.enter="verifyCoupon"
            @input="formatCouponCode"
            :disabled="isVerifying"
            maxlength="20"
            autocomplete="off"
            spellcheck="false"
          />
          <button
            class="btn-scan"
            @click="startScan"
            :disabled="isVerifying"
            title="QR 스캔"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7V5a2 2 0 012-2h2"/>
              <path d="M17 3h2a2 2 0 012 2v2"/>
              <path d="M21 17v2a2 2 0 01-2 2h-2"/>
              <path d="M7 21H5a2 2 0 01-2-2v-2"/>
              <rect x="7" y="7" width="3" height="3"/>
              <rect x="14" y="7" width="3" height="3"/>
              <rect x="7" y="14" width="3" height="3"/>
              <rect x="14" y="14" width="3" height="3"/>
            </svg>
          </button>
        </div>

        <button
          class="btn-verify"
          @click="verifyCoupon"
          :disabled="!couponCode.trim() || isVerifying"
        >
          <span v-if="isVerifying" class="loading-spinner"></span>
          <span v-else>검증하기</span>
        </button>
      </section>

      <!-- Result Card -->
      <transition name="result-fade">
        <section v-if="verificationResult" class="result-card" :class="verificationResult.isValid ? 'success' : 'error'">
          <div class="result-badge">
            <svg v-if="verificationResult.isValid" width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#34C759"/>
              <path d="M8 12l2.5 2.5L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#FF3B30"/>
              <path d="M15 9l-6 6M9 9l6 6" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>

          <h3 class="result-title">{{ verificationResult.isValid ? '사용 완료!' : '사용 불가' }}</h3>
          <p class="result-message">{{ verificationResult.message }}</p>

          <!-- Success Details -->
          <div v-if="verificationResult.isValid" class="result-details">
            <div class="detail-item">
              <span class="detail-icon">🎁</span>
              <div class="detail-content">
                <span class="detail-label">혜택</span>
                <span class="detail-value">{{ verificationResult.benefitTitle }}</span>
              </div>
            </div>
            <div v-if="verificationResult.benefitDescription" class="detail-item">
              <span class="detail-icon">📝</span>
              <div class="detail-content">
                <span class="detail-label">설명</span>
                <span class="detail-value">{{ verificationResult.benefitDescription }}</span>
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-icon">⏰</span>
              <div class="detail-content">
                <span class="detail-label">사용 시간</span>
                <span class="detail-value">{{ formatDateTime(verificationResult.usedAt) }}</span>
              </div>
            </div>
          </div>

          <button class="btn-new-verify" @click="resetVerification">
            새로운 쿠폰 검증
          </button>
        </section>
      </transition>

      <!-- Statistics Section -->
      <section v-if="stats && !verificationResult" class="stats-section">
        <h3 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 20V10"/>
            <path d="M12 20V4"/>
            <path d="M6 20v-6"/>
          </svg>
          오늘의 통계
        </h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon issued">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.todayIssued }}</span>
              <span class="stat-label">발급</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon used">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.todayUsed }}</span>
              <span class="stat-label">사용</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon rate">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats.usageRate }}%</span>
              <span class="stat-label">사용률</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Verifications -->
      <section v-if="recentVerifications.length > 0 && !verificationResult" class="recent-section">
        <h3 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          최근 검증 내역
        </h3>
        <div class="recent-list">
          <div v-for="item in recentVerifications" :key="item.code" class="recent-item" :class="item.isValid ? 'valid' : 'invalid'">
            <div class="recent-status">
              <svg v-if="item.isValid" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </div>
            <div class="recent-info">
              <span class="recent-code">{{ item.code }}</span>
              <span class="recent-benefit">{{ item.benefitTitle || '유효하지 않음' }}</span>
            </div>
            <span class="recent-time">{{ formatTime(item.verifiedAt) }}</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import couponsService, { type CouponVerificationResponse, type CouponStatsResponse } from '@/services/couponsService'

const router = useRouter()
const authStore = useAuthStore()

const couponCode = ref('')
const isVerifying = ref(false)
const verificationResult = ref<CouponVerificationResponse | null>(null)
const stats = ref<CouponStatsResponse | null>(null)

interface RecentVerification {
  code: string
  isValid: boolean
  benefitTitle?: string
  verifiedAt: Date
}

const recentVerifications = ref<RecentVerification[]>([])

onMounted(async () => {
  await loadStats()
  loadRecentVerifications()
})

function goBack() {
  router.push('/admin')
}

function formatCouponCode(event: Event) {
  const input = event.target as HTMLInputElement
  let value = input.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
  couponCode.value = value
}

function startScan() {
  // TODO: QR 스캔 기능 구현
  alert('QR 스캔 기능은 추후 지원 예정입니다.')
}

async function verifyCoupon() {
  if (!couponCode.value.trim()) return

  isVerifying.value = true

  try {
    const result = await couponsService.verifyCoupon({
      couponCode: couponCode.value.trim().toUpperCase()
    })

    verificationResult.value = result

    // Add to recent verifications
    addToRecentVerifications({
      code: couponCode.value.trim().toUpperCase(),
      isValid: result.isValid,
      benefitTitle: result.benefitTitle,
      verifiedAt: new Date()
    })

    // Reload stats after successful verification
    if (result.isValid) {
      await loadStats()
    }
  } catch (err: any) {
    console.error('Failed to verify coupon:', err)
    const errorMessage = err.response?.data?.message || '쿠폰 확인에 실패했습니다'
    verificationResult.value = {
      isValid: false,
      benefitTitle: '',
      message: errorMessage
    }

    addToRecentVerifications({
      code: couponCode.value.trim().toUpperCase(),
      isValid: false,
      benefitTitle: undefined,
      verifiedAt: new Date()
    })
  } finally {
    isVerifying.value = false
  }
}

function addToRecentVerifications(item: RecentVerification) {
  recentVerifications.value = [item, ...recentVerifications.value.slice(0, 9)]
  saveRecentVerifications()
}

function loadRecentVerifications() {
  try {
    const saved = localStorage.getItem('waitplay_recent_verifications')
    if (saved) {
      const parsed = JSON.parse(saved)
      recentVerifications.value = parsed.map((item: any) => ({
        ...item,
        verifiedAt: new Date(item.verifiedAt)
      }))
    }
  } catch (e) {
    console.error('Failed to load recent verifications:', e)
  }
}

function saveRecentVerifications() {
  try {
    localStorage.setItem('waitplay_recent_verifications', JSON.stringify(recentVerifications.value))
  } catch (e) {
    console.error('Failed to save recent verifications:', e)
  }
}

function resetVerification() {
  verificationResult.value = null
  couponCode.value = ''
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
/* Page Layout */
.verify-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Noto Sans KR', sans-serif;
}

/* Header */
.verify-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #0071e3;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.btn-back:hover {
  background: rgba(0, 113, 227, 0.1);
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.header-spacer {
  width: 80px;
}

/* Main Content */
.verify-main {
  max-width: 520px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

/* Input Card */
.input-card {
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.card-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0071e3;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.card-subtitle {
  font-size: 15px;
  color: #86868b;
  margin: 0 0 28px;
}

/* Input Group */
.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.code-input {
  flex: 1;
  padding: 16px 18px;
  border: 2px solid #e5e5ea;
  border-radius: 14px;
  font-size: 18px;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-align: center;
  transition: all 0.2s;
  background: #f5f5f7;
}

.code-input::placeholder {
  color: #c7c7cc;
  font-weight: 400;
  letter-spacing: 0;
}

.code-input:focus {
  outline: none;
  border-color: #0071e3;
  background: white;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
}

.code-input.has-value {
  background: white;
  border-color: #0071e3;
}

.code-input:disabled {
  background: #f5f5f7;
  color: #86868b;
  cursor: not-allowed;
}

.btn-scan {
  width: 56px;
  height: 56px;
  background: #f5f5f7;
  border: 2px solid #e5e5ea;
  border-radius: 14px;
  color: #86868b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-scan:hover:not(:disabled) {
  background: #e8e8ed;
  color: #0071e3;
  border-color: #0071e3;
}

.btn-scan:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Verify Button */
.btn-verify {
  width: 100%;
  padding: 18px 32px;
  background: linear-gradient(135deg, #0071e3 0%, #0077ed 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-verify:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 113, 227, 0.4);
}

.btn-verify:active:not(:disabled) {
  transform: translateY(0);
}

.btn-verify:disabled {
  background: #d2d2d7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Loading Spinner */
.loading-spinner {
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

/* Result Card */
.result-card {
  background: white;
  border-radius: 20px;
  padding: 40px 24px;
  text-align: center;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  border: 3px solid transparent;
}

.result-card.success {
  border-color: #34c759;
  background: linear-gradient(180deg, #f0fff4 0%, white 100%);
}

.result-card.error {
  border-color: #ff3b30;
  background: linear-gradient(180deg, #fff5f5 0%, white 100%);
}

.result-badge {
  margin-bottom: 16px;
}

.result-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.result-card.success .result-title {
  color: #34c759;
}

.result-card.error .result-title {
  color: #ff3b30;
}

.result-message {
  font-size: 15px;
  color: #86868b;
  margin: 0 0 24px;
}

/* Result Details */
.result-details {
  background: #f5f5f7;
  border-radius: 16px;
  padding: 4px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin: 4px;
}

.detail-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  flex: 1;
}

.detail-label {
  font-size: 12px;
  color: #86868b;
  font-weight: 500;
}

.detail-value {
  font-size: 15px;
  color: #1d1d1f;
  font-weight: 600;
}

/* New Verify Button */
.btn-new-verify {
  padding: 14px 28px;
  background: #f5f5f7;
  color: #1d1d1f;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-new-verify:hover {
  background: #e8e8ed;
}

/* Result Animation */
.result-fade-enter-active {
  animation: resultIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result-fade-leave-active {
  animation: resultOut 0.2s ease-out;
}

@keyframes resultIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes resultOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Section Title */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px;
  padding-left: 4px;
}

.section-title svg {
  color: #86868b;
}

/* Statistics Section */
.stats-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 12px;
  background: #f5f5f7;
  border-radius: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.issued {
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  color: white;
}

.stat-icon.used {
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
  color: white;
}

.stat-icon.rate {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b00 100%);
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
}

.stat-label {
  font-size: 13px;
  color: #86868b;
  font-weight: 500;
}

/* Recent Section */
.recent-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #f5f5f7;
  border-radius: 14px;
  transition: background 0.2s;
}

.recent-item:hover {
  background: #e8e8ed;
}

.recent-status {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.recent-item.valid .recent-status {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.recent-item.invalid .recent-status {
  background: rgba(255, 59, 48, 0.15);
  color: #ff3b30;
}

.recent-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.recent-code {
  font-size: 14px;
  font-weight: 600;
  font-family: 'SF Mono', 'Menlo', monospace;
  color: #1d1d1f;
}

.recent-benefit {
  font-size: 13px;
  color: #86868b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-time {
  font-size: 12px;
  color: #aeaeb2;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .verify-main {
    padding: 16px 16px 32px;
  }

  .input-card {
    padding: 24px 20px;
  }

  .card-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
  }

  .card-icon svg {
    width: 36px;
    height: 36px;
  }

  .card-title {
    font-size: 22px;
  }

  .code-input {
    font-size: 16px;
    padding: 14px 16px;
  }

  .btn-scan {
    width: 52px;
    height: 52px;
  }

  .stats-grid {
    gap: 8px;
  }

  .stat-item {
    padding: 14px 8px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .stat-icon svg {
    width: 20px;
    height: 20px;
  }

  .stat-value {
    font-size: 20px;
  }

  .result-card {
    padding: 32px 20px;
  }

  .result-title {
    font-size: 24px;
  }
}
</style>
