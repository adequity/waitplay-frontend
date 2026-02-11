<template>
  <div class="inquiries-management">
    <div class="page-header">
      <div>
        <h1>문의 관리</h1>
        <p class="subtitle">전체 시스템의 문의사항을 관리합니다</p>
      </div>
      <div class="header-stats">
        <span class="stat-pill warning">미답변 {{ unansweredCount }}</span>
      </div>
    </div>

    <div class="filters-bar">
      <select v-model="statusFilter" @change="fetchInquiries">
        <option value="">전체</option>
        <option value="unanswered">미답변</option>
        <option value="answered">답변완료</option>
      </select>
    </div>

    <LoadingSpinner v-if="loading" message="문의 목록을 불러오는 중..." />

    <div v-else class="inquiries-list">
      <div v-for="inquiry in inquiries" :key="inquiry.id" class="inquiry-card" :class="{ answered: inquiry.isAnswered }">
        <div class="inquiry-header">
          <div class="inquiry-info">
            <h3>{{ inquiry.title }}</h3>
            <p class="inquiry-meta">
              <span>{{ inquiry.user?.nickname || inquiry.user?.username || '익명' }}</span>
              <span>{{ formatDate(inquiry.createdAt) }}</span>
            </p>
          </div>
          <span class="status-badge" :class="{ answered: inquiry.isAnswered }">
            {{ inquiry.isAnswered ? '답변완료' : '대기중' }}
          </span>
        </div>
        <div class="inquiry-content">
          <p>{{ inquiry.content }}</p>
        </div>
        <div v-if="inquiry.isAnswered && inquiry.answer" class="inquiry-answer">
          <div class="answer-label">
            <IconBase name="message" class="answer-icon" />
            답변
          </div>
          <p>{{ inquiry.answer }}</p>
          <span class="answer-date">{{ formatDate(inquiry.answeredAt) }}</span>
        </div>
        <div class="inquiry-actions">
          <button v-if="!inquiry.isAnswered" class="btn-primary" @click="openAnswerModal(inquiry)">
            <IconBase name="message" class="btn-icon" />
            답변하기
          </button>
          <button v-else class="btn-secondary" @click="openAnswerModal(inquiry)">
            <IconBase name="edit" class="btn-icon" />
            답변 수정
          </button>
          <button class="btn-action danger" @click="confirmDelete(inquiry)">
            <IconBase name="trash" />
          </button>
        </div>
      </div>

      <div v-if="!inquiries || inquiries.length === 0" class="empty-state">
        <IconBase name="message" class="empty-icon" />
        <p>문의가 없습니다</p>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button @click="page = page - 1" :disabled="page <= 1">이전</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button @click="page = page + 1" :disabled="page >= totalPages">다음</button>
    </div>

    <!-- Answer Modal -->
    <div v-if="showAnswerModal" class="modal-overlay" @click.self="showAnswerModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>답변 작성</h2>
          <button class="btn-close" @click="showAnswerModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="inquiry-preview">
            <h4>{{ selectedInquiry?.title }}</h4>
            <p>{{ selectedInquiry?.content }}</p>
          </div>
          <div class="form-group">
            <label>답변</label>
            <textarea v-model="answerText" placeholder="답변을 입력하세요..." rows="6"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAnswerModal = false">취소</button>
          <button class="btn-primary" @click="submitAnswer" :disabled="submitting || !answerText.trim()">
            {{ submitting ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const loading = ref(true)
const inquiries = ref<any[]>([])
const page = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)
const unansweredCount = ref(0)
const statusFilter = ref('')

const showAnswerModal = ref(false)
const selectedInquiry = ref<any>(null)
const answerText = ref('')
const submitting = ref(false)

const fetchInquiries = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({ page: page.value.toString(), pageSize: pageSize.value.toString() })
    if (statusFilter.value) params.append('status', statusFilter.value)

    const response = await fetch(`${API_URL}/api/masteradmin/inquiries?${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    inquiries.value = data.inquiries
    totalPages.value = data.totalPages
    unansweredCount.value = data.unansweredCount || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openAnswerModal = (inquiry: any) => {
  selectedInquiry.value = inquiry
  answerText.value = inquiry.answer || ''
  showAnswerModal.value = true
}

const submitAnswer = async () => {
  if (!selectedInquiry.value || !answerText.value.trim()) return
  try {
    submitting.value = true
    const response = await fetch(`${API_URL}/api/masteradmin/inquiries/${selectedInquiry.value.id}/answer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answer: answerText.value })
    })
    if (!response.ok) throw new Error('Failed')
    showAnswerModal.value = false
    fetchInquiries()
    alert('답변이 저장되었습니다')
  } catch (error) {
    alert('저장에 실패했습니다')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (inquiry: any) => {
  if (!confirm('이 문의를 삭제하시겠습니까?')) return
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/inquiries/${inquiry.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    fetchInquiries()
  } catch (error) {
    alert('삭제에 실패했습니다')
  }
}

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ko-KR')

watch(page, fetchInquiries)
onMounted(() => fetchInquiries())
</script>

<style scoped>
.inquiries-management { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
.page-header h1 { font-size: 28px; font-weight: 700; color: #1d1d1f; margin: 0 0 8px 0; }
.subtitle { font-size: 15px; color: #86868b; margin: 0; }
.stat-pill { padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
.stat-pill.warning { background: #fff0f0; color: #ff6b6b; }

.filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
.filters-bar select { padding: 12px 16px; border: 1px solid #e5e5ea; border-radius: 12px; font-size: 14px; background: white; min-width: 150px; }

.inquiries-list { display: flex; flex-direction: column; gap: 16px; }

.inquiry-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); border-left: 4px solid #ff6b6b; }
.inquiry-card.answered { border-left-color: #16a34a; }

.inquiry-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.inquiry-info h3 { font-size: 18px; font-weight: 600; color: #1d1d1f; margin: 0 0 8px 0; }
.inquiry-meta { font-size: 13px; color: #86868b; margin: 0; display: flex; gap: 16px; }

.status-badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #fff0f0; color: #ff6b6b; }
.status-badge.answered { background: #dcfce7; color: #16a34a; }

.inquiry-content { margin-bottom: 16px; }
.inquiry-content p { font-size: 15px; color: #1d1d1f; line-height: 1.6; margin: 0; }

.inquiry-answer { background: #f8f9fa; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.answer-label { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #16a34a; margin-bottom: 8px; }
.answer-icon { width: 14px; height: 14px; }
.inquiry-answer p { font-size: 14px; color: #1d1d1f; margin: 0 0 8px 0; }
.answer-date { font-size: 12px; color: #86868b; }

.inquiry-actions { display: flex; gap: 12px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.btn-primary { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: linear-gradient(135deg, #d4a853, #b8942e); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-secondary { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: #f0f0f0; color: #1d1d1f; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-icon { width: 16px; height: 16px; }
.btn-action { width: 40px; height: 40px; border: none; border-radius: 10px; background: #f0f0f0; color: #86868b; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: auto; }
.btn-action.danger:hover { background: #fff0f0; color: #ff3b30; }
.btn-action :deep(svg) { width: 18px; height: 18px; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 80px 0; color: #86868b; }
.empty-icon { width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 32px 0; }
.pagination button { padding: 8px 16px; border: 1px solid #e5e5ea; border-radius: 8px; background: white; font-size: 14px; cursor: pointer; }
.pagination button:hover:not(:disabled) { background: #f0f0f0; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; border-radius: 20px; width: 100%; max-width: 560px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid #f0f0f0; }
.modal-header h2 { font-size: 20px; font-weight: 600; margin: 0; }
.btn-close { width: 32px; height: 32px; border: none; border-radius: 50%; background: #f0f0f0; font-size: 20px; cursor: pointer; }
.modal-body { padding: 24px; }
.inquiry-preview { background: #f8f9fa; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
.inquiry-preview h4 { font-size: 15px; font-weight: 600; margin: 0 0 8px 0; }
.inquiry-preview p { font-size: 14px; color: #86868b; margin: 0; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #1d1d1f; margin-bottom: 8px; }
.form-group textarea { width: 100%; padding: 12px 16px; border: 1px solid #e5e5ea; border-radius: 10px; font-size: 14px; resize: vertical; }
.form-group textarea:focus { outline: none; border-color: #d4a853; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 24px; border-top: 1px solid #f0f0f0; }
.modal-footer .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
