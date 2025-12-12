<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">1:1 문의</h1>
        <p class="page-desc">궁금한 점이나 시스템 오류가 있다면 문의를 남겨주세요.</p>
      </div>
      <button class="btn-write" @click="openWriteModal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        문의하기
      </button>
    </div>

    <!-- Toolbar & Filters -->
    <div class="toolbar-section">
      <div class="status-tabs">
        <button
          class="status-tab"
          :class="{ active: currentFilter === 'all' }"
          @click="currentFilter = 'all'"
        >
          전체
        </button>
        <button
          class="status-tab"
          :class="{ active: currentFilter === 'waiting' }"
          @click="currentFilter = 'waiting'"
        >
          대기중 <span class="count-badge waiting">{{ waitingCount }}</span>
        </button>
        <button
          class="status-tab"
          :class="{ active: currentFilter === 'answered' }"
          @click="currentFilter = 'answered'"
        >
          답변완료
        </button>
      </div>

      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" v-model="searchQuery" placeholder="제목 검색..." class="search-input">
      </div>
    </div>

    <!-- Inquiry List -->
    <div class="board-card">
      <div class="table-responsive">
        <table class="cs-table">
          <thead>
            <tr>
              <th width="100">상태</th>
              <th width="140">분류</th>
              <th>제목</th>
              <th width="120">등록일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredInquiries.length === 0">
              <td colspan="4" class="empty-state">
                <div class="empty-content">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="empty-icon"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <p>등록된 문의 내역이 없습니다.</p>
                </div>
              </td>
            </tr>
            <tr
              v-for="item in filteredInquiries"
              :key="item.id"
              @click="openDetailModal(item)"
              class="hover-row"
            >
              <td>
                <span class="badge" :class="item.status">
                  {{ item.status === 'waiting' ? '대기중' : '답변완료' }}
                </span>
              </td>
              <td class="text-category">{{ item.category }}</td>
              <td>
                <div class="title-wrapper">
                  <span class="text-title">{{ item.title }}</span>
                  <span v-if="isNew(item.createdAt)" class="new-dot"></span>
                </div>
              </td>
              <td class="text-date">{{ formatDate(item.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Write Modal -->
    <div v-if="showWriteModal" class="modal-overlay active" @click.self="closeWriteModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>새 문의 작성</h2>
          <button class="btn-close" @click="closeWriteModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">문의 유형</label>
            <select v-model="writeForm.category" class="form-select">
              <option value="시스템 오류">시스템 오류</option>
              <option value="결제/정산">결제/정산</option>
              <option value="게임 설정">게임 설정</option>
              <option value="기타">기타 문의</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">제목</label>
            <input type="text" v-model="writeForm.title" class="form-input" placeholder="문의 제목을 입력하세요">
          </div>
          <div class="form-group">
            <label class="form-label">내용</label>
            <textarea v-model="writeForm.content" class="form-textarea" placeholder="문의하실 내용을 자세히 적어주세요."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeWriteModal">취소</button>
          <button class="btn-primary" @click="submitInquiry" :disabled="isSubmitting">
            {{ isSubmitting ? '등록 중...' : '등록하기' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedInquiry" class="modal-overlay active" @click.self="closeDetailModal">
      <div class="modal-card detail-card">
        <div class="modal-header detail-header">
          <div class="header-status">
            <span class="badge" :class="selectedInquiry.status">
              {{ selectedInquiry.status === 'waiting' ? '대기중' : '답변완료' }}
            </span>
            <span class="detail-category">{{ selectedInquiry.category }}</span>
          </div>
          <button class="btn-close" @click="closeDetailModal">✕</button>
        </div>

        <div class="modal-body detail-body">
          <!-- Question -->
          <div class="question-section">
            <h3 class="detail-title">{{ selectedInquiry.title }}</h3>
            <div class="detail-meta">
              <span class="meta-label">작성일</span>
              <span class="meta-value">{{ formatFullDate(selectedInquiry.createdAt) }}</span>
            </div>
            <div class="detail-content">
              {{ selectedInquiry.content }}
            </div>
          </div>

          <!-- Answer Area -->
          <div v-if="selectedInquiry.answer" class="answer-section">
            <div class="answer-header">
              <div class="admin-profile">
                <div class="admin-avatar">W</div>
                <div class="admin-info">
                  <span class="admin-name">WaitPlay 운영팀</span>
                  <span class="admin-time">{{ formatFullDate(selectedInquiry.answeredAt) }}</span>
                </div>
              </div>
            </div>
            <div class="answer-content">
              {{ selectedInquiry.answer }}
            </div>
          </div>

          <!-- Empty Answer State -->
          <div v-else class="answer-waiting">
            <div class="waiting-icon">⏳</div>
            <p>담당자가 내용을 확인하고 있습니다.<br>조금만 기다려주세요.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-text-danger" @click="deleteInquiry(selectedInquiry.id)">삭제</button>
          <button class="btn-secondary" @click="closeDetailModal">닫기</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// --- Types ---
interface Inquiry {
  id: string
  userId: string
  category: string
  title: string
  content: string
  status: 'waiting' | 'answered'
  createdAt: string
  answer?: string
  answeredAt?: string
}

// --- State ---
const inquiries = ref<Inquiry[]>([])
const currentFilter = ref('all')
const searchQuery = ref('')
const showWriteModal = ref(false)
const selectedInquiry = ref<Inquiry | null>(null)
const isSubmitting = ref(false)

const writeForm = ref({
  category: '시스템 오류',
  title: '',
  content: ''
})

// --- Computed ---
const filteredInquiries = computed(() => {
  let result = inquiries.value

  // Filter by Tab
  if (currentFilter.value !== 'all') {
    result = result.filter(item => item.status === currentFilter.value)
  }

  // Filter by Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    )
  }

  return result
})

const waitingCount = computed(() => {
  return inquiries.value.filter(i => i.status === 'waiting').length
})

// --- Methods ---
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
}

const formatFullDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const isNew = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 2
}

// Modal Actions
const openWriteModal = () => {
  writeForm.value = { category: '시스템 오류', title: '', content: '' }
  showWriteModal.value = true
}

const closeWriteModal = () => {
  showWriteModal.value = false
}

const submitInquiry = async () => {
  if (!writeForm.value.title || !writeForm.value.content) {
    alert('제목과 내용을 입력해주세요.')
    return
  }

  isSubmitting.value = true
  try {
    // TODO: API 연동
    const newInquiry: Inquiry = {
      id: Date.now().toString(),
      userId: 'user-id',
      ...writeForm.value,
      status: 'waiting',
      createdAt: new Date().toISOString()
    }

    inquiries.value.unshift(newInquiry)
    closeWriteModal()
    alert('문의가 등록되었습니다.')
  } catch (error) {
    console.error('Error submitting inquiry:', error)
    alert('문의 등록 중 오류가 발생했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const openDetailModal = (inquiry: Inquiry) => {
  selectedInquiry.value = inquiry
}

const closeDetailModal = () => {
  selectedInquiry.value = null
}

const deleteInquiry = async (id: string) => {
  if (confirm('문의 내역을 삭제하시겠습니까?')) {
    try {
      // TODO: API 연동
      inquiries.value = inquiries.value.filter(i => i.id !== id)
      closeDetailModal()
    } catch (error) {
      console.error('Error deleting inquiry:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }
}
</script>

<style scoped>
/* --- Apple Style Design Tokens --- */
:root {
  --primary-blue: #0071e3;
  --primary-dark: #0056b3;
  --bg-body: #f5f5f7;
  --bg-white: #ffffff;
  --text-dark: #1d1d1f;
  --text-gray: #86868b;
  --border-light: #e5e5ea;
  --border-color: #d2d2d7;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.12);

  --status-waiting-bg: #fff4e6;
  --status-waiting-text: #f59f00;
  --status-answered-bg: #e7f5ff;
  --status-answered-text: #1971c2;
}

.tab-content {
  padding: 50px 60px;
  background-color: #f5f5f7;
  min-height: 100vh;
  color: #1d1d1f;
  font-family: 'Noto Sans KR', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

.page-desc {
  color: #86868b;
  font-size: 16px;
}

.btn-write {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
}

.btn-write:hover {
  background: #0077ed;
  transform: translateY(-1px);
}

/* Toolbar */
.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-tabs {
  display: flex;
  gap: 8px;
  background: #e5e5ea;
  padding: 4px;
  border-radius: 12px;
}

.status-tab {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #86868b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-tab.active {
  background: white;
  color: #1d1d1f;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.count-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  background: #86868b;
  color: white;
}
.count-badge.waiting { background: #f59f00; }

.search-box {
  position: relative;
  width: 240px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #d2d2d7;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: white;
  transition: 0.2s;
}

.search-input:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #86868b;
  pointer-events: none;
}

/* Table Card */
.board-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.02);
  overflow: hidden;
}

.cs-table {
  width: 100%;
  border-collapse: collapse;
}

.cs-table th {
  text-align: left;
  padding: 16px 24px;
  background: #fafafa;
  color: #86868b;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid #e5e5ea;
}

.cs-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #f5f5f7;
  vertical-align: middle;
  font-size: 14px;
  color: #1d1d1f;
}

.hover-row {
  cursor: pointer;
  transition: background 0.2s;
}

.hover-row:hover {
  background: #f9f9f9;
}

/* Badges & Text */
.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.badge.waiting { background: #fff4e6; color: #f59f00; }
.badge.answered { background: #e7f5ff; color: #1971c2; }

.text-category {
  color: #86868b;
  font-weight: 500;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.text-title {
  font-weight: 600;
  color: #1d1d1f;
}

.new-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ff3b30;
  display: inline-block;
}

.text-date {
  color: #aeaeb2;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  background: white;
}
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #86868b;
}

/* --- Modal Styles --- */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex; justify-content: center; align-items: center;
}

.modal-card {
  background: white;
  width: 500px;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  display: flex; flex-direction: column;
  max-height: 85vh;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.detail-card { width: 600px; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5ea;
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h2 { font-size: 18px; font-weight: 700; margin: 0; }

.detail-header { align-items: flex-start; }
.header-status { display: flex; align-items: center; gap: 10px; }
.detail-category { color: #86868b; font-size: 13px; font-weight: 500; }

.btn-close {
  background: #f5f5f7; border: none; width: 32px; height: 32px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #86868b;
}
.btn-close:hover { background: #e5e5ea; color: #1d1d1f; }

.modal-body { padding: 24px; overflow-y: auto; }

.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: #1d1d1f; margin-bottom: 8px; }
.form-input, .form-textarea, .form-select {
  width: 100%; padding: 12px; border: 1px solid #d2d2d7; border-radius: 10px;
  font-size: 15px; outline: none; font-family: inherit;
}
.form-textarea { resize: vertical; min-height: 120px; }
.form-input:focus, .form-textarea:focus, .form-select:focus {
  border-color: #0071e3; box-shadow: 0 0 0 3px rgba(0,113,227,0.1);
}

.modal-footer {
  padding: 20px 24px; border-top: 1px solid #e5e5ea;
  display: flex; justify-content: flex-end; gap: 10px;
}

.btn-secondary {
  padding: 10px 20px; border-radius: 10px; border: 1px solid #d2d2d7;
  background: white; color: #1d1d1f; font-weight: 600; cursor: pointer;
}
.btn-secondary:hover { background: #f5f5f7; }

.btn-primary {
  padding: 10px 24px; border-radius: 10px; border: none;
  background: #0071e3; color: white; font-weight: 600; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.25);
}
.btn-primary:hover { background: #0077ed; transform: translateY(-1px); }
.btn-primary:disabled { background: #b0c4de; cursor: not-allowed; transform: none; }

.btn-text-danger {
  padding: 10px 16px; background: none; border: none;
  color: #ff3b30; font-weight: 500; cursor: pointer;
  margin-right: auto;
}
.btn-text-danger:hover { background: #fff0f3; border-radius: 8px; }

/* Detail View */
.question-section { margin-bottom: 30px; }
.detail-title { font-size: 18px; font-weight: 700; margin: 0 0 8px 0; line-height: 1.4; }
.detail-meta { font-size: 13px; color: #aeaeb2; margin-bottom: 20px; display: flex; gap: 12px; }
.detail-content { line-height: 1.6; color: #333; white-space: pre-wrap; }

.answer-section {
  background: #f0f7ff; border: 1px solid #d0ebff;
  border-radius: 12px; padding: 20px;
}
.answer-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
.admin-profile { display: flex; align-items: center; gap: 10px; }
.admin-avatar {
  width: 24px; height: 24px; background: #0071e3; color: white;
  border-radius: 50%; font-size: 11px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.admin-name { font-size: 13px; font-weight: 700; color: #0071e3; }
.admin-time { font-size: 12px; color: #86868b; margin-left: 8px; }
.answer-content { font-size: 14px; line-height: 1.6; color: #1d1d1f; white-space: pre-wrap; }

.answer-waiting {
  background: #f9f9f9; border-radius: 12px; padding: 30px;
  text-align: center; color: #86868b; border: 1px dashed #d2d2d7;
}
.waiting-icon { font-size: 24px; margin-bottom: 8px; }

/* Responsive */
@media (max-width: 768px) {
  .tab-content { padding: 30px 20px; }
  .modal-card { width: 95%; max-height: 90vh; }
}
</style>
