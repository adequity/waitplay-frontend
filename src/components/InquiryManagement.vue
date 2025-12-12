<template>
  <div class="inquiry-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>문의 관리</h1>
        <p class="header-subtitle">Admin들의 문의사항을 확인하고 답변합니다</p>
      </div>
      <div class="status-filter">
        <button
          v-for="status in statuses"
          :key="status.value"
          @click="currentStatus = status.value"
          class="filter-btn"
          :class="{ active: currentStatus === status.value }"
        >
          {{ status.label }}
          <span class="count">{{ getStatusCount(status.value) }}</span>
        </button>
      </div>
    </div>

    <!-- Inquiry List -->
    <div class="inquiry-list">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>문의사항을 불러오는 중...</p>
      </div>

      <div v-else-if="filteredInquiries.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>{{ currentStatus === 'all' ? '문의사항이 없습니다' : '해당 상태의 문의사항이 없습니다' }}</p>
      </div>

      <div v-else class="inquiry-cards">
        <div v-for="inquiry in filteredInquiries" :key="inquiry.id" class="inquiry-card">
          <div class="inquiry-header">
            <div class="inquiry-meta">
              <span :class="`status-badge status-${inquiry.status}`">
                {{ getStatusLabel(inquiry.status) }}
              </span>
              <span class="category-badge">{{ inquiry.category }}</span>
            </div>
            <span class="inquiry-date">{{ formatDate(inquiry.createdAt) }}</span>
          </div>

          <h3 class="inquiry-title">{{ inquiry.title }}</h3>
          <p class="inquiry-content">{{ inquiry.content }}</p>

          <div class="inquiry-admin">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>{{ inquiry.adminNickname }} ({{ inquiry.adminCompany }})</span>
          </div>

          <div v-if="inquiry.status === 'answered' && inquiry.answer" class="inquiry-answer">
            <div class="answer-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>답변</span>
              <span class="answer-date">{{ formatDate(inquiry.answeredAt!) }}</span>
            </div>
            <p class="answer-content">{{ inquiry.answer }}</p>
          </div>

          <button
            v-if="inquiry.status === 'waiting'"
            class="btn-answer"
            @click="openAnswerModal(inquiry)"
          >
            답변하기
          </button>
        </div>
      </div>
    </div>

    <!-- Answer Modal -->
    <div v-if="showAnswerModal" class="modal-overlay active" @click.self="closeAnswerModal">
      <div class="modal-card answer-modal">
        <div class="modal-header">
          <div class="header-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <polyline points="9 11 12 14 22 4"/>
            </svg>
          </div>
          <div class="header-text">
            <h2>문의 답변</h2>
            <p class="header-subtitle">Admin의 문의에 답변합니다</p>
          </div>
          <button class="btn-close" @click="closeAnswerModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="inquiry-detail">
            <div class="detail-header">
              <span class="category-badge">{{ selectedInquiry?.category }}</span>
              <span class="inquiry-date">{{ formatDate(selectedInquiry!.createdAt) }}</span>
            </div>
            <h3>{{ selectedInquiry?.title }}</h3>
            <p class="content">{{ selectedInquiry?.content }}</p>
            <div class="admin-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>{{ selectedInquiry?.adminNickname }} ({{ selectedInquiry?.adminCompany }})</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">답변 내용</label>
            <textarea
              v-model="answerText"
              class="form-textarea"
              placeholder="문의에 대한 답변을 작성해주세요..."
              rows="8"
              maxlength="2000"
            ></textarea>
            <div class="input-hint">{{ answerText.length }}/2000</div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeAnswerModal">취소</button>
          <button class="btn-primary" @click="submitAnswer" :disabled="submitting || !answerText.trim()">
            <div v-if="submitting" class="spinner-small"></div>
            <span v-else>답변 전송</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface Inquiry {
  id: number
  title: string
  content: string
  category: string
  status: 'waiting' | 'answered'
  answer?: string
  answeredAt?: string
  createdAt: string
  adminNickname: string
  adminCompany: string
  adminUserId: string
}

const authStore = useAuthStore()
const loading = ref(false)
const submitting = ref(false)
const inquiries = ref<Inquiry[]>([])
const currentStatus = ref<'all' | 'waiting' | 'answered'>('all')
const showAnswerModal = ref(false)
const selectedInquiry = ref<Inquiry | null>(null)
const answerText = ref('')

const statuses = [
  { value: 'all' as const, label: '전체' },
  { value: 'waiting' as const, label: '대기중' },
  { value: 'answered' as const, label: '답변완료' }
]

const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const filteredInquiries = computed(() => {
  if (currentStatus.value === 'all') {
    return inquiries.value
  }
  return inquiries.value.filter(i => i.status === currentStatus.value)
})

const getStatusCount = (status: 'all' | 'waiting' | 'answered') => {
  if (status === 'all') return inquiries.value.length
  return inquiries.value.filter(i => i.status === status).length
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'waiting': return '대기중'
    case 'answered': return '답변완료'
    default: return status
  }
}

const fetchInquiries = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_URL}/api/inquiry/all`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch inquiries')

    const data = await response.json()
    inquiries.value = data
  } catch (error) {
    console.error('Failed to fetch inquiries:', error)
    alert('문의사항을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const openAnswerModal = (inquiry: Inquiry) => {
  selectedInquiry.value = inquiry
  answerText.value = ''
  showAnswerModal.value = true
}

const closeAnswerModal = () => {
  showAnswerModal.value = false
  selectedInquiry.value = null
  answerText.value = ''
}

const submitAnswer = async () => {
  if (!selectedInquiry.value || !answerText.value.trim()) return

  submitting.value = true
  try {
    const response = await fetch(`${API_URL}/api/inquiry/${selectedInquiry.value.id}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: JSON.stringify({
        answer: answerText.value
      })
    })

    if (!response.ok) throw new Error('Failed to submit answer')

    alert('답변이 전송되었습니다.')
    closeAnswerModal()
    fetchInquiries()
  } catch (error) {
    console.error('Failed to submit answer:', error)
    alert('답변 전송에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return '방금 전'
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}일 전`

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchInquiries()
})
</script>

<style scoped>
.inquiry-management {
  padding: 40px;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e5ea;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 800;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.header-subtitle {
  font-size: 15px;
  color: #86868b;
  margin: 0 0 20px 0;
}

.status-filter {
  display: flex;
  gap: 12px;
}

.filter-btn {
  padding: 10px 20px;
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #86868b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-btn:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.filter-btn.active {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border-color: #8b5cf6;
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
}

.filter-btn:not(.active) .count {
  background: #f5f5f7;
  color: #86868b;
}

/* Inquiry List */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #86868b;
}

.loading-state p,
.empty-state p {
  margin-top: 16px;
  font-size: 15px;
}

.empty-state svg {
  color: #d2d2d7;
}

.inquiry-cards {
  display: grid;
  gap: 16px;
}

.inquiry-card {
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s;
}

.inquiry-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.inquiry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.inquiry-meta {
  display: flex;
  gap: 8px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.status-waiting {
  background: #fff3e0;
  color: #f57c00;
}

.status-answered {
  background: #e8f5e9;
  color: #2e7d32;
}

.category-badge {
  padding: 6px 12px;
  background: #f5f5f7;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #86868b;
}

.inquiry-date {
  font-size: 13px;
  color: #aeaeb2;
}

.inquiry-title {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

.inquiry-content {
  font-size: 15px;
  color: #4a4a4a;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.inquiry-admin {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f5f5f7;
  border-radius: 10px;
  font-size: 13px;
  color: #86868b;
  margin-bottom: 16px;
}

.inquiry-admin svg {
  color: #8b5cf6;
}

.inquiry-answer {
  background: #f9f9fb;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #2e7d32;
}

.answer-header svg {
  color: #2e7d32;
}

.answer-date {
  margin-left: auto;
  font-size: 12px;
  color: #aeaeb2;
}

.answer-content {
  font-size: 14px;
  color: #4a4a4a;
  margin: 0;
  line-height: 1.6;
}

.btn-answer {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  transition: all 0.2s;
}

.btn-answer:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

/* Modal (using same styles as AdminManagement) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.modal-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.modal-card {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.modal-overlay.active .modal-card {
  transform: scale(1);
}

.modal-header {
  padding: 32px 32px 24px 32px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.header-icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
}

.header-text {
  flex: 1;
}

.header-text h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-close:hover {
  background: #e5e5ea;
}

.modal-body {
  padding: 32px;
}

.inquiry-detail {
  background: #f9f9fb;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.inquiry-detail h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

.inquiry-detail .content {
  font-size: 14px;
  color: #4a4a4a;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #86868b;
}

.admin-info svg {
  color: #8b5cf6;
}

.form-group {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.form-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e5ea;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
  background: #fafafa;
  resize: vertical;
  box-sizing: border-box;
}

.form-textarea:hover {
  border-color: #d2d2d7;
  background: #ffffff;
}

.form-textarea:focus {
  border-color: #8b5cf6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.input-hint {
  text-align: right;
  font-size: 12px;
  color: #aeaeb2;
  margin-top: 6px;
}

.modal-footer {
  padding: 20px 32px 32px 32px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-secondary:hover {
  background: #e5e5ea;
}

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
