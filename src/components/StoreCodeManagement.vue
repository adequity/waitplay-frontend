<template>
  <div class="store-code-management">
    <div class="header">
      <h2>매장 코드 관리</h2>
      <p class="subtitle">직원이 고객의 쿠폰을 빠르게 사용 처리할 수 있는 매장 코드입니다</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>불러오는 중...</p>
    </div>

    <!-- Store Code Display -->
    <div v-else class="code-section">
      <div class="code-card">
        <div class="code-label">현재 매장 코드</div>
        <div class="code-display">
          <span class="code-value" :class="{ 'blur': isCodeHidden }">
            {{ isCodeHidden ? '••••••' : (storeCode || '없음') }}
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

        <div v-if="storeCode" class="code-actions">
          <button class="btn-copy" @click="copyCode" :disabled="!storeCode">
            <IconBase name="copy" class="btn-icon" />
            복사
          </button>
          <button class="btn-regenerate" @click="regenerateCode" :disabled="isRegenerating">
            <IconBase name="refresh" class="btn-icon" />
            {{ isRegenerating ? '생성 중...' : '새로 생성' }}
          </button>
        </div>

        <!-- Generate Code (if no code exists) -->
        <button
          v-else
          class="btn-generate"
          @click="regenerateCode"
          :disabled="isRegenerating"
        >
          {{ isRegenerating ? '생성 중...' : '매장 코드 생성' }}
        </button>
      </div>

      <!-- Info Card -->
      <div class="info-card">
        <h3>
          <IconBase name="info" class="info-icon" />
          매장 코드 사용 방법
        </h3>
        <ol class="usage-steps">
          <li>고객이 게임을 완료하고 쿠폰을 받으면 쿠폰 화면이 표시됩니다</li>
          <li>쿠폰 화면 하단에 매장 코드 입력란이 있습니다</li>
          <li>직원이 매장 코드를 입력하면 바로 쿠폰이 사용 처리됩니다</li>
          <li>Admin 패널에서 따로 쿠폰을 확인할 필요가 없습니다</li>
        </ol>
        <div class="security-notice">
          <IconBase name="lock" class="notice-icon" />
          <p>매장 코드는 주기적으로 변경하는 것을 권장합니다</p>
        </div>
      </div>

      <!-- Usage Statistics -->
      <div v-if="stats" class="stats-card">
        <h3>매장 코드 사용 통계</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ stats.todayUsed }}</span>
            <span class="stat-label">오늘 사용</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.weekUsed }}</span>
            <span class="stat-label">이번 주</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalUsed }}</span>
            <span class="stat-label">전체</span>
          </div>
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

.header {
  margin-bottom: 24px;
}

.header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e5ea;
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  gap: 20px;
}

/* Code Card */
.code-card {
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.code-label {
  font-size: 13px;
  color: #86868b;
  margin-bottom: 12px;
}

.code-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.code-value {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 4px;
  color: #1d1d1f;
  font-family: 'SF Mono', 'Menlo', monospace;
  transition: filter 0.2s;
}

.code-value.blur {
  filter: blur(6px);
  user-select: none;
}

.btn-toggle-visibility {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-toggle-visibility:hover {
  background: #e5e5ea;
}

.toggle-icon {
  width: 18px;
  height: 18px;
  color: #86868b;
}

.code-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-copy,
.btn-regenerate {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.btn-copy {
  background: #f5f5f7;
  border: 1px solid #e5e5ea;
  color: #1d1d1f;
}

.btn-copy:hover:not(:disabled) {
  background: #e5e5ea;
}

.btn-regenerate {
  background: #0071e3;
  border: none;
  color: white;
}

.btn-regenerate:hover:not(:disabled) {
  background: #0077ed;
}

.btn-regenerate:disabled,
.btn-copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-generate {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #0071e3 0%, #0077ed 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Info Card */
.info-card {
  background: #f5f5f7;
  border-radius: 16px;
  padding: 20px;
}

.info-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
}

.info-icon {
  width: 18px;
  height: 18px;
  color: #0071e3;
}

.usage-steps {
  margin: 0 0 16px 0;
  padding-left: 20px;
}

.usage-steps li {
  font-size: 13px;
  color: #1d1d1f;
  line-height: 1.8;
  margin-bottom: 4px;
}

.security-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #fff3cd;
  border-radius: 10px;
}

.notice-icon {
  width: 16px;
  height: 16px;
  color: #856404;
  flex-shrink: 0;
  margin-top: 1px;
}

.security-notice p {
  font-size: 12px;
  color: #856404;
  margin: 0;
  line-height: 1.5;
}

/* Stats Card */
.stats-card {
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 16px;
  padding: 20px;
}

.stats-card h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
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
  padding: 12px;
  background: #f5f5f7;
  border-radius: 12px;
}

.stat-item .stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #0071e3;
}

.stat-item .stat-label {
  font-size: 12px;
  color: #86868b;
  margin-top: 4px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.toast.success {
  background: #1d1d1f;
  color: white;
}

.toast.error {
  background: #ff3b30;
  color: white;
}

.toast-icon {
  width: 18px;
  height: 18px;
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

/* Responsive */
@media (max-width: 480px) {
  .store-code-management {
    padding: 16px;
  }

  .code-value {
    font-size: 24px;
    letter-spacing: 2px;
  }

  .code-actions {
    flex-direction: column;
  }

  .btn-copy,
  .btn-regenerate {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
