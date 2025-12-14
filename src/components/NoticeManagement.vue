<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">공지사항 관리</h1>
      <p class="page-desc">가맹점주들에게 보여질 공지사항을 작성하고 관리합니다.</p>
    </div>

    <!-- Main Card -->
    <div class="content-card">
      <div class="card-toolbar">
        <div class="toolbar-left">
          <h2 class="card-label">공지사항 목록</h2>
        </div>
        <div class="toolbar-right">
          <button class="btn-primary" @click="openWriteModal">
            <IconBase name="edit" class="btn-icon" /> 공지 작성
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th width="80">번호</th>
              <th>제목</th>
              <th width="100">작성자</th>
              <th width="120">등록일</th>
              <th width="80">조회수</th>
              <th width="120">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in notices" :key="notice.id" class="data-row" :class="{ 'important-row': notice.isImportant }">
              <td class="text-center">
                <span v-if="notice.isImportant" class="badge-important">중요</span>
                <span v-else>{{ notice.id }}</span>
              </td>
              <td>
                <span class="text-title">{{ notice.title }}</span>
              </td>
              <td class="text-gray">관리자</td>
              <td class="text-gray">{{ formatDate(notice.createdAt) }}</td>
              <td class="text-gray text-center">{{ notice.views }}</td>
              <td>
                <div class="action-group">
                  <button class="btn-action" @click="editNotice(notice)">수정</button>
                  <button class="btn-action danger" @click="deleteNotice(notice.id)">삭제</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Write Modal -->
    <div v-if="showModal" class="modal-overlay active" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ isEditing ? '공지사항 수정' : '새 공지사항 작성' }}</h2>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">제목</label>
            <input type="text" v-model="form.title" class="form-input" placeholder="제목을 입력하세요">
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.isImportant">
              <span class="checkbox-text">중요 공지로 상단 고정</span>
            </label>
          </div>
          <div class="form-group">
            <label class="form-label">내용</label>
            <textarea v-model="form.content" class="form-textarea" placeholder="공지 내용을 입력하세요"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">취소</button>
          <button class="btn-primary" @click="saveNotice">{{ isEditing ? '수정' : '등록' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconBase from '@/components/IconBase.vue'

interface Notice {
  id: number
  title: string
  content: string
  isImportant: boolean
  createdAt: string
  views: number
}

interface NoticeForm {
  id: number
  title: string
  content: string
  isImportant: boolean
}

const notices = ref<Notice[]>([
  { id: 10, title: '[필독] 12월 정기 서버 점검 안내', content: '서버 점검 내용...', isImportant: true, createdAt: '2025-12-01', views: 452 },
  { id: 9, title: '신규 게임 "틀린 그림 찾기" 출시 안내', content: '신규 게임 출시...', isImportant: true, createdAt: '2025-11-28', views: 320 },
  { id: 8, title: '서비스 이용약관 개정 안내', content: '약관 개정...', isImportant: false, createdAt: '2025-11-20', views: 128 },
  { id: 7, title: '가맹점 마케팅 가이드 배포', content: '가이드 내용...', isImportant: false, createdAt: '2025-11-15', views: 98 },
  { id: 6, title: '11월 결제 시스템 업데이트 내역', content: '업데이트 내역...', isImportant: false, createdAt: '2025-11-01', views: 156 },
])

const showModal = ref(false)
const isEditing = ref(false)
const form = ref<NoticeForm>({ id: 0, title: '', content: '', isImportant: false })

const formatDate = (date: string) => new Date(date).toLocaleDateString('ko-KR')

const openWriteModal = () => {
  isEditing.value = false
  form.value = { id: 0, title: '', content: '', isImportant: false }
  showModal.value = true
}

const editNotice = (notice: Notice) => {
  isEditing.value = true
  form.value = {
    id: notice.id,
    title: notice.title,
    content: notice.content,
    isImportant: notice.isImportant
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveNotice = () => {
  if (!form.value.title || !form.value.content) {
    alert('제목과 내용을 입력해주세요.')
    return
  }

  if (isEditing.value) {
    const index = notices.value.findIndex(n => n.id === form.value.id)
    if (index !== -1) {
      notices.value[index] = {
        ...notices.value[index],
        title: form.value.title,
        content: form.value.content,
        isImportant: form.value.isImportant
      }
    }
  } else {
    const newNotice: Notice = {
      id: notices.value.length + 1,
      title: form.value.title,
      content: form.value.content,
      isImportant: form.value.isImportant,
      createdAt: new Date().toISOString().split('T')[0],
      views: 0
    }
    notices.value.unshift(newNotice)
  }
  closeModal()
}

const deleteNotice = (id: number) => {
  if (confirm('삭제하시겠습니까?')) {
    notices.value = notices.value.filter(n => n.id !== id)
  }
}
</script>

<style scoped>
/* Common Variables */
:root {
  --primary-blue: #0071e3;
  --primary-dark: #0056b3;
  --text-dark: #1d1d1f;
  --text-gray: #86868b;
  --bg-body: #f5f5f7;
  --border-light: #e5e5ea;
  --border-color: #d2d2d7;
  --hq-red: #ff3b30;
}

.tab-content { width: 100%; max-width: 1600px; margin: 0 auto; padding-top: 20px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 28px; font-weight: 800; color: var(--text-dark); margin-bottom: 8px; letter-spacing: -0.5px; }
.page-desc { color: var(--text-gray); font-size: 15px; }

.content-card { background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02); overflow: hidden; }
.card-toolbar { padding: 24px 32px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
.card-label { font-size: 18px; font-weight: 700; color: var(--text-dark); }

.table-container { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 16px 32px; background: white; border-bottom: 1px solid var(--border-light); color: var(--text-gray); font-size: 13px; font-weight: 600; }
.data-table td { padding: 16px 32px; border-bottom: 1px solid #f5f5f7; font-size: 14px; vertical-align: middle; }
.data-row { transition: background 0.2s; }
.data-row:hover { background: #fbfbfd; }
.important-row { background: #fffdf5; }
.important-row:hover { background: #fff9e6; }

.badge-important { background: var(--hq-red); color: white; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
.text-center { text-align: center; }
.text-title { font-weight: 600; color: var(--text-dark); }
.text-gray { color: var(--text-gray); }

.action-group { display: flex; gap: 6px; }
.btn-action { padding: 6px 12px; background: white; border: 1px solid var(--border-light); border-radius: 6px; font-size: 12px; font-weight: 500; color: var(--text-dark); cursor: pointer; transition: all 0.2s; }
.btn-action:hover { background: #f5f5f7; border-color: var(--border-color); }
.btn-action.danger { color: #dc2626; }
.btn-action.danger:hover { background: #fef2f2; border-color: #fecaca; }

.btn-primary { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--primary-blue); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0, 113, 227, 0.25); }
.btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }
.btn-icon { width: 16px; height: 16px; }

.toolbar-right { display: flex; gap: 10px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; justify-content: center; align-items: center; }
.modal-card { background: white; width: 600px; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); display: flex; flex-direction: column; max-height: 85vh; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { font-size: 18px; font-weight: 700; margin: 0; }
.btn-close { background: #f5f5f7; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-gray); }
.btn-close:hover { background: #e5e5ea; color: var(--text-dark); }
.modal-body { padding: 24px; overflow-y: auto; }
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
.form-input, .form-textarea { width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; font-size: 15px; outline: none; font-family: inherit; }
.form-textarea { resize: vertical; min-height: 200px; }
.form-input:focus, .form-textarea:focus { border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(0,113,227,0.1); }
.checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.checkbox-text { font-size: 14px; color: var(--text-dark); }
.modal-footer { padding: 20px 24px; border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 10px; }
.btn-secondary { padding: 10px 20px; border-radius: 10px; border: 1px solid var(--border-color); background: white; color: var(--text-dark); font-weight: 600; cursor: pointer; }
.btn-secondary:hover { background: #f5f5f7; }
</style>
