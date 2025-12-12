<template>
  <div class="affiliation-request">
    <div class="header">
      <h2>SuperAdmin 소속 요청</h2>
      <p class="subtitle">SuperAdmin의 초대 코드를 입력하여 소속을 요청하세요</p>
    </div>

    <!-- Current Status -->
    <div v-if="affiliationStatus" class="status-card" :class="`status-${affiliationStatus.status}`">
      <div class="status-icon">
        <IconBase :name="getStatusIcon(affiliationStatus.status)" />
      </div>
      <div class="status-info">
        <h3>{{ getStatusTitle(affiliationStatus.status) }}</h3>
        <p v-if="affiliationStatus.superAdminName">
          {{ affiliationStatus.superAdminCompany || affiliationStatus.superAdminName }}
        </p>
        <p v-if="affiliationStatus.approvedAt" class="status-date">
          {{ formatDate(affiliationStatus.approvedAt) }}
        </p>
      </div>
    </div>

    <!-- Invite Code Input (only if not affiliated) -->
    <div v-if="!affiliationStatus || affiliationStatus.status === 'none'" class="input-section">
      <form @submit.prevent="submitRequest">
        <div class="form-group">
          <label for="inviteCode">초대 코드</label>
          <input
            id="inviteCode"
            v-model="inviteCode"
            type="text"
            placeholder="8자리 초대 코드를 입력하세요"
            maxlength="8"
            :disabled="isSubmitting"
            required
          />
        </div>

        <button
          type="submit"
          class="btn-submit"
          :disabled="isSubmitting || inviteCode.length !== 8"
        >
          {{ isSubmitting ? '요청 중...' : '소속 요청하기' }}
        </button>
      </form>
    </div>

    <!-- Message Display -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const authStore = useAuthStore()

interface AffiliationStatus {
  status: 'none' | 'pending' | 'approved' | 'rejected'
  superAdminName?: string
  superAdminCompany?: string
  approvedAt?: string
  message?: string
}

const inviteCode = ref('')
const isSubmitting = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const affiliationStatus = ref<AffiliationStatus | null>(null)

const fetchAffiliationStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inquiry/affiliation-status`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch affiliation status')
    }

    const data = await response.json()
    affiliationStatus.value = data
  } catch (error) {
    console.error('Error fetching affiliation status:', error)
  }
}

const submitRequest = async () => {
  if (inviteCode.value.length !== 8) {
    message.value = '초대 코드는 8자리여야 합니다.'
    messageType.value = 'error'
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/api/inquiry/request-affiliation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: JSON.stringify({
        inviteCode: inviteCode.value.toUpperCase()
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit request')
    }

    message.value = data.message
    messageType.value = 'success'
    inviteCode.value = ''

    // Refresh status
    await fetchAffiliationStatus()
  } catch (error: any) {
    message.value = error.message || '소속 요청 중 오류가 발생했습니다.'
    messageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return 'clock'
    case 'approved': return 'check'
    case 'rejected': return 'x'
    default: return 'info'
  }
}

const getStatusTitle = (status: string) => {
  switch (status) {
    case 'pending': return '승인 대기 중'
    case 'approved': return '승인 완료'
    case 'rejected': return '거부됨'
    default: return '소속 정보 없음'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchAffiliationStatus()
})
</script>

<style scoped>
.affiliation-request {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 0.95rem;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 2px solid;
}

.status-none {
  background-color: #f9fafb;
  border-color: #e5e7eb;
}

.status-pending {
  background-color: #fef3c7;
  border-color: #fbbf24;
}

.status-approved {
  background-color: #d1fae5;
  border-color: #10b981;
}

.status-rejected {
  background-color: #fee2e2;
  border-color: #ef4444;
}

.status-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: white;
}

.status-pending .status-icon {
  color: #fbbf24;
}

.status-approved .status-icon {
  color: #10b981;
}

.status-rejected .status-icon {
  color: #ef4444;
}

.status-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1f2937;
}

.status-info p {
  color: #6b7280;
  font-size: 0.9rem;
}

.status-date {
  font-size: 0.85rem !important;
  color: #9ca3af !important;
  margin-top: 0.25rem;
}

.input-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: monospace;
}

.form-group input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-group input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.btn-submit {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
}

.message.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.message.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}
</style>
