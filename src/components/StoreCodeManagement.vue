<template>
  <div class="store-code-management">
    <div class="header">
      <div class="header-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      </div>
      <div class="header-text">
        <h2>매장 코드</h2>
        <p class="subtitle">직원이 고객의 쿠폰을 빠르게 사용 처리할 수 있습니다</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-pulse">
        <div class="pulse-ring"></div>
        <div class="pulse-ring"></div>
        <div class="pulse-ring"></div>
      </div>
      <p>불러오는 중...</p>
    </div>

    <!-- Store Code Display -->
    <div v-else class="code-section">
      <div class="code-card" :class="{ 'has-code': storeCode }">
        <div class="code-card-header">
          <span class="code-label">현재 매장 코드</span>
          <span v-if="storeCode" class="code-status active">
            <span class="status-dot"></span>
            활성화됨
          </span>
        </div>

        <div class="code-display">
          <div class="code-value-wrapper">
            <span class="code-value" :class="{ 'blur': isCodeHidden }">
              {{ isCodeHidden ? '••••••' : (storeCode || '미설정') }}
            </span>
            <button
              v-if="storeCode"
              class="btn-toggle-visibility"
              @click="isCodeHidden = !isCodeHidden"
              :title="isCodeHidden ? '코드 보기' : '코드 숨기기'"
            >
              <IconBase :name="isCodeHidden ? 'eye' : 'eye-off'" class="toggle-icon" />
            </button>
          </div>
        </div>

        <div v-if="storeCode" class="code-actions">
          <button class="btn-action btn-copy" @click="copyCode" :disabled="!storeCode">
            <IconBase name="copy" class="btn-icon" />
            <span>복사</span>
          </button>
          <button class="btn-action btn-regenerate" @click="regenerateCode" :disabled="isRegenerating">
            <IconBase name="refresh" class="btn-icon" :class="{ 'spinning': isRegenerating }" />
            <span>{{ isRegenerating ? '생성 중...' : '새로 생성' }}</span>
          </button>
        </div>

        <!-- Generate Code (if no code exists) -->
        <button
          v-else
          class="btn-generate"
          @click="regenerateCode"
          :disabled="isRegenerating"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ isRegenerating ? '생성 중...' : '매장 코드 생성하기' }}
        </button>
      </div>

      <!-- Usage Statistics -->
      <div v-if="stats" class="stats-card">
        <div class="stats-header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            사용 통계
          </h3>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon today">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.todayUsed }}</span>
              <span class="stat-label">오늘</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon week">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.weekUsed }}</span>
              <span class="stat-label">이번 주</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon total">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.totalUsed }}</span>
              <span class="stat-label">전체</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Card -->
      <div class="info-card">
        <div class="info-header">
          <IconBase name="info" class="info-icon" />
          <h3>사용 방법</h3>
        </div>
        <div class="usage-steps">
          <div class="step-item">
            <span class="step-number">1</span>
            <span class="step-text">고객이 게임을 완료하고 쿠폰을 받습니다</span>
          </div>
          <div class="step-item">
            <span class="step-number">2</span>
            <span class="step-text">쿠폰 화면 하단에 매장 코드 입력란이 표시됩니다</span>
          </div>
          <div class="step-item">
            <span class="step-number">3</span>
            <span class="step-text">직원이 매장 코드를 입력하면 바로 사용 처리됩니다</span>
          </div>
        </div>
        <div class="security-notice">
          <IconBase name="lock" class="notice-icon" />
          <p>보안을 위해 매장 코드는 주기적으로 변경하세요</p>
        </div>
      </div>
    </div>

    <!-- Toast Messages -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <IconBase :name="toast.type === 'success' ? 'check' : 'alert'" class="toast-icon" />
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'
import api from '@/services/api'

const authStore = useAuthStore()

// State
const isLoading = ref(true)
const storeCode = ref<string | null>(null)
const isCodeHidden = ref(true)
const isRegenerating = ref(false)
const stats = ref<{
  todayUsed: number
  weekUsed: number
  totalUsed: number
} | null>(null)

const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

// Show toast message
function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// Fetch current store code
async function fetchStoreCode() {
  isLoading.value = true
  try {
    const qrCodeId = authStore.user?.qrCodeId
    if (!qrCodeId) {
      isLoading.value = false
      return
    }

    const response = await api.get(`/api/store-code/${qrCodeId}`)
    storeCode.value = response.data.storeCode
    stats.value = response.data.stats || null
  } catch (error: any) {
    // 404는 코드가 아직 없는 상태
    if (error.response?.status !== 404) {
      console.error('Failed to fetch store code:', error)
      showToast('매장 코드를 불러오는데 실패했습니다', 'error')
    }
  } finally {
    isLoading.value = false
  }
}

// Generate or regenerate store code
async function regenerateCode() {
  if (isRegenerating.value) return

  // Confirm if regenerating existing code
  if (storeCode.value) {
    const confirmed = confirm('새로운 매장 코드를 생성하면 기존 코드는 더 이상 사용할 수 없습니다.\n계속하시겠습니까?')
    if (!confirmed) return
  }

  isRegenerating.value = true
  try {
    const qrCodeId = authStore.user?.qrCodeId
    if (!qrCodeId) {
      showToast('QR 코드 정보가 없습니다', 'error')
      return
    }

    const response = await api.post(`/api/store-code/${qrCodeId}/regenerate`)
    storeCode.value = response.data.storeCode
    isCodeHidden.value = false // Show the new code
    showToast('새로운 매장 코드가 생성되었습니다', 'success')
  } catch (error) {
    console.error('Failed to regenerate store code:', error)
    showToast('매장 코드 생성에 실패했습니다', 'error')
  } finally {
    isRegenerating.value = false
  }
}

// Copy code to clipboard
async function copyCode() {
  if (!storeCode.value) return

  try {
    await navigator.clipboard.writeText(storeCode.value)
    showToast('매장 코드가 복사되었습니다', 'success')
  } catch (error) {
    console.error('Failed to copy:', error)
    showToast('복사에 실패했습니다', 'error')
  }
}

onMounted(() => {
  fetchStoreCode()
})
</script>

<style scoped>
.store-code-management {
  padding: 24px;
  max-width: 600px;
}

/* Header */
.header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.header-text h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.subtitle {
  font-size: 14px;
  color: #86868b;
  margin: 0;
  line-height: 1.4;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
}

.loading-pulse {
  position: relative;
  width: 48px;
  height: 48px;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 48px;
  height: 48px;
  border: 3px solid #3b82f6;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 1.5s ease-out infinite;
}

.pulse-ring:nth-child(2) {
  animation-delay: 0.3s;
}

.pulse-ring:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.loading-state p {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

/* Code Section */
.code-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Code Card */
.code-card {
  background: white;
  border: 2px solid #e5e5ea;
  border-radius: 20px;
  padding: 24px;
  transition: all 0.3s ease;
}

.code-card.has-code {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.code-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.code-label {
  font-size: 13px;
  font-weight: 500;
  color: #86868b;
}

.code-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  background: #dcfce7;
  color: #16a34a;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #16a34a;
  border-radius: 50%;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.code-display {
  text-align: center;
  margin-bottom: 24px;
}

.code-value-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
}

.code-value {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 6px;
  color: #1e293b;
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  transition: filter 0.3s ease;
}

.code-value.blur {
  filter: blur(8px);
  user-select: none;
}

.btn-toggle-visibility {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-visibility:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.toggle-icon {
  width: 20px;
  height: 20px;
  color: #64748b;
}

.code-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  max-width: 160px;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.btn-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-copy {
  background: white;
  border: 2px solid #e2e8f0;
  color: #475569;
}

.btn-copy:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-regenerate {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  color: white;
}

.btn-regenerate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-regenerate:disabled,
.btn-copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-generate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Stats Card */
.stats-card {
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 20px;
  padding: 20px;
}

.stats-header {
  margin-bottom: 16px;
}

.stats-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.stats-header h3 svg {
  color: #3b82f6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 14px;
  transition: all 0.2s;
}

.stat-item:hover {
  background: #f1f5f9;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.today {
  background: #dbeafe;
  color: #2563eb;
}

.stat-icon.week {
  background: #dcfce7;
  color: #16a34a;
}

.stat-icon.total {
  background: #fef3c7;
  color: #d97706;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-item .stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.stat-item .stat-label {
  font-size: 12px;
  color: #64748b;
}

/* Info Card */
.info-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px;
  padding: 20px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.info-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.info-icon {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.usage-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.step-number {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.step-text {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
  padding-top: 2px;
}

.security-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
}

.notice-icon {
  width: 18px;
  height: 18px;
  color: #92400e;
  flex-shrink: 0;
}

.security-notice p {
  font-size: 13px;
  color: #92400e;
  font-weight: 500;
  margin: 0;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.toast.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.toast-icon {
  width: 20px;
  height: 20px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px) scale(0.9);
}

/* Responsive */
@media (max-width: 480px) {
  .store-code-management {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    gap: 12px;
  }

  .header-icon {
    width: 44px;
    height: 44px;
  }

  .code-value {
    font-size: 28px;
    letter-spacing: 4px;
  }

  .code-value-wrapper {
    padding: 12px 16px;
  }

  .code-actions {
    flex-direction: column;
  }

  .btn-action {
    max-width: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-item {
    justify-content: flex-start;
  }
}
</style>
