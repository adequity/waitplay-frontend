<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">공지사항 관리</h1>
      <p class="page-desc">WaitPlay 본사 관리 시스템</p>
    </div>

    <!-- Main Card -->
    <div class="content-card">
      <div class="card-toolbar">
        <div class="toolbar-left">
          <h2 class="card-label">공지사항 관리</h2>
        </div>
        <div class="toolbar-right">
          <button class="btn-primary" @click="openWriteModal">
            공지사항 작성
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th width="60" class="text-center">고정</th>
              <th width="100" class="text-center">구분</th>
              <th>제목</th>
              <th width="100">작성자</th>
              <th width="120">등록일</th>
              <th width="80" class="text-center">조회수</th>
              <th width="80" class="text-center">팝업</th>
              <th width="200">팝업 기간</th>
              <th width="120" class="text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in notices" :key="notice.id" class="data-row">
              <!-- Fixed Checkbox -->
              <td class="text-center">
                <div class="checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    class="custom-checkbox" 
                    :checked="notice.isFixed" 
                    @change="toggleFixed(notice)"
                  >
                </div>
              </td>
              
              <!-- Category Badge -->
              <td class="text-center">
                <span class="badge" :class="getCategoryClass(notice.category)">
                  {{ notice.category }}
                </span>
              </td>
              
              <!-- Title -->
              <td>
                <span class="text-title">{{ notice.title }}</span>
              </td>
              
              <!-- Writer -->
              <td class="text-gray">본사 관리자</td>
              
              <!-- Date -->
              <td class="text-gray">{{ notice.createdAt }}</td>
              
              <!-- Views -->
              <td class="text-gray text-center">{{ notice.views.toLocaleString() }}</td>
              
              <!-- Popup Status -->
              <td class="text-center">
                <span class="status-badge" :class="notice.isPopup ? 'active' : 'inactive'">
                  {{ notice.isPopup ? '활성' : '비활성' }}
                </span>
              </td>
              
              <!-- Popup Period -->
              <td class="text-gray text-small">
                {{ notice.isPopup ? `${notice.popupStartDate} ~ ${notice.popupEndDate}` : '-' }}
              </td>
              
              <!-- Actions -->
              <td class="text-center">
                <div class="action-group center">
                  <button class="btn-action" @click="editNotice(notice)">수정</button>
                  <button class="btn-action" @click="deleteNotice(notice.id)">삭제</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Write/Edit Modal -->
    <div v-if="showModal" class="modal-overlay active" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ isEditing ? '공지사항 상세' : '공지사항 작성' }}</h2>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">구분</label>
              <div class="category-options">
                <button 
                  v-for="cat in ['중요', '업데이트', '이벤트', '공지']" 
                  :key="cat"
                  class="category-btn"
                  :class="[getCategoryClass(cat), { active: form.category === cat }]"
                  @click="form.category = cat"
                >
                  {{ cat }}
                </button>
              </div>
            </div>
            
            <div class="form-group half">
               <label class="form-label">상단 고정</label>
               <label class="toggle-label">
                 <input type="checkbox" v-model="form.isFixed">
                 <span class="toggle-text">{{ form.isFixed ? '고정됨' : '고정 안함' }}</span>
               </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">제목</label>
            <input type="text" v-model="form.title" class="form-input" placeholder="제목을 입력하세요">
          </div>
          
          <!-- Popup Settings -->
          <div class="popup-settings-box">
            <div class="form-group mb-0">
              <div class="flex-between">
                <label class="form-label mb-0">팝업 설정</label>
                <button 
                  class="btn-toggle-popup" 
                  :class="{ active: form.isPopup }"
                  @click="form.isPopup = !form.isPopup"
                >
                  {{ form.isPopup ? '팝업 활성' : '팝업 비활성' }}
                </button>
              </div>
              
              <div v-if="form.isPopup" class="date-range-picker">
                <input type="date" v-model="form.popupStartDate" class="form-input date">
                <span class="tilde">~</span>
                <input type="date" v-model="form.popupEndDate" class="form-input date">
              </div>
            </div>
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
  category: string // '중요' | '업데이트' | '이벤트' | '공지'
  title: string
  content: string
  isFixed: boolean
  isPopup: boolean
  popupStartDate?: string
  popupEndDate?: string
  createdAt: string
  views: number
}

// Mock Data matching the image
const notices = ref<Notice[]>([
  { 
    id: 5, 
    category: '중요', 
    title: '[중요] 2025년 1월 정기 점검 안내', 
    content: '서버 점검 내용...', 
    isFixed: true, 
    isPopup: true, 
    popupStartDate: '2025-12-01',
    popupEndDate: '2025-12-31',
    createdAt: '2025-12-01', 
    views: 1247 
  },
  { 
    id: 4, 
    category: '업데이트', 
    title: '신규 게임 "포춘휠" 출시 안내', 
    content: '신규 게임 출시...', 
    isFixed: true, 
    isPopup: false, 
    createdAt: '2025-11-28', 
    views: 892 
  },
  { 
    id: 3, 
    category: '이벤트', 
    title: '연말 프로모션 이벤트 기획안', 
    content: '이벤트 내용...', 
    isFixed: false, 
    isPopup: true, 
    popupStartDate: '2025-12-15',
    popupEndDate: '2025-12-31',
    createdAt: '2025-11-25', 
    views: 654 
  },
  { 
    id: 2, 
    category: '공지', 
    title: '가맹점 교육 일정 안내', 
    content: '교육 일정...', 
    isFixed: false, 
    isPopup: false, 
    createdAt: '2025-11-20', 
    views: 523 
  },
  { 
    id: 1, 
    category: '업데이트', 
    title: '모바일 앱 v2.3 업데이트 내역', 
    content: '업데이트 내역...', 
    isFixed: false, 
    isPopup: false, 
    createdAt: '2025-11-15', 
    views: 418 
  },
])

const showModal = ref(false)
const isEditing = ref(false)
const form = ref<any>({
  id: 0, 
  category: '공지',
  title: '', 
  content: '', 
  isFixed: false,
  isPopup: false,
  popupStartDate: '',
  popupEndDate: ''
})

// Helper Functions
const getCategoryClass = (category: string) => {
  switch(category) {
    case '중요': return 'badge-red'
    case '업데이트': return 'badge-blue'
    case '이벤트': return 'badge-orange'
    default: return 'badge-purple'
  }
}

const toggleFixed = (notice: Notice) => {
  // In a real app, call API
  notice.isFixed = !notice.isFixed
}

// Modal Actions
const openWriteModal = () => {
  isEditing.value = false
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  form.value = { 
    id: 0, 
    category: '공지',
    title: '', 
    content: '', 
    isFixed: false,
    isPopup: false,
    popupStartDate: today,
    popupEndDate: nextWeek
  }
  showModal.value = true
}

const editNotice = (notice: Notice) => {
  isEditing.value = true
  form.value = JSON.parse(JSON.stringify(notice))
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
      notices.value[index] = { ...notices.value[index], ...form.value }
    }
  } else {
    notices.value.unshift({
      id: notices.value.length + 1,
      ...form.value,
      createdAt: new Date().toISOString().split('T')[0],
      views: 0
    })
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
  
  /* Badge Colors from image */
  --red-bg: #fff1f0; --red-text: #e03131;
  --blue-bg: #e7f5ff; --blue-text: #1971c2;
  --orange-bg: #fff4e6; --orange-text: #f59f00;
  --purple-bg: #f3f0ff; --purple-text: #7048e8;

  /* Status Colors */
  --status-active-bg: #e6fcf5; --status-active-text: #0ca678;
  --status-inactive-bg: #f1f3f5; --status-inactive-text: #868e96;
}

.tab-content { width: 100%; max-width: 1600px; margin: 0 auto; padding-top: 20px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 28px; font-weight: 800; color: var(--text-dark); margin-bottom: 8px; letter-spacing: -0.5px; }
.page-desc { color: var(--text-gray); font-size: 15px; }

/* Content Card */
.content-card { background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02); overflow: hidden; }
.card-toolbar { padding: 24px 32px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
.card-label { font-size: 18px; font-weight: 700; color: var(--text-dark); }

/* Table */
.table-container { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 16px 24px; background: #fafafa; border-bottom: 1px solid var(--border-light); color: var(--text-gray); font-size: 13px; font-weight: 600; white-space: nowrap; }
.data-table td { padding: 16px 24px; border-bottom: 1px solid #f5f5f7; font-size: 14px; vertical-align: middle; color: var(--text-dark); }
.data-row { transition: background 0.2s; }
.data-row:hover { background: #fbfbfd; }

.text-center { text-align: center; }
.text-title { font-weight: 600; color: var(--text-dark); }
.text-gray { color: var(--text-gray); }
.text-small { font-size: 13px; }

/* Checkbox Style */
.checkbox-wrapper { display: flex; justify-content: center; }
.custom-checkbox { width: 18px; height: 18px; accent-color: var(--primary-blue); cursor: pointer; }

/* Badges */
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; min-width: 60px; text-align: center; }
.badge-red { background: var(--red-bg); color: var(--red-text); }
.badge-blue { background: var(--blue-bg); color: var(--blue-text); }
.badge-orange { background: var(--orange-bg); color: var(--orange-text); }
.badge-purple { background: var(--purple-bg); color: var(--purple-text); }

/* Status Badge */
.status-badge { font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 4px; display: inline-block; }
.status-badge.active { background: var(--status-active-bg); color: var(--status-active-text); }
.status-badge.inactive { background: var(--status-inactive-bg); color: var(--status-inactive-text); }

/* Buttons */
.btn-primary { padding: 10px 24px; background: var(--primary-blue); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 8px rgba(0, 113, 227, 0.25); }
.btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }

.action-group { display: flex; gap: 6px; justify-content: center; }
.btn-action { padding: 4px 10px; background: white; border: 1px solid var(--border-light); border-radius: 6px; font-size: 12px; color: var(--text-dark); cursor: pointer; }
.btn-action:hover { background: #f5f5f7; border-color: var(--border-color); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; justify-content: center; align-items: center; }
.modal-card { background: white; width: 640px; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); display: flex; flex-direction: column; max-height: 85vh; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.modal-header { padding: 20px 28px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { font-size: 18px; font-weight: 700; margin: 0; }
.btn-close { background: #f5f5f7; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-gray); }
.btn-close:hover { background: #e5e5ea; color: var(--text-dark); }

.modal-body { padding: 28px; overflow-y: auto; }
.form-row { display: flex; gap: 20px; }
.form-group { margin-bottom: 24px; flex: 1; }
.form-group.half { flex: 1; }
.form-group.mb-0 { margin-bottom: 0; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }

/* Category Options */
.category-options { display: flex; gap: 8px; }
.category-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid transparent; font-size: 13px; font-weight: 600; cursor: pointer; opacity: 0.6; transition: 0.2s; background: #f5f5f7; color: var(--text-gray); }
.category-btn.active { opacity: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.category-btn.badge-red.active { background: var(--red-bg); color: var(--red-text); border-color: #ffc9c9; }
.category-btn.badge-blue.active { background: var(--blue-bg); color: var(--blue-text); border-color: #a5d8ff; }
.category-btn.badge-orange.active { background: var(--orange-bg); color: var(--orange-text); border-color: #ffec99; }
.category-btn.badge-purple.active { background: var(--purple-bg); color: var(--purple-text); border-color: #d0bfff; }

.toggle-label { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 12px; background: #f5f5f7; border-radius: 10px; }
.toggle-text { font-size: 14px; font-weight: 500; }

.form-input, .form-textarea { width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; font-size: 15px; outline: none; font-family: inherit; }
.form-textarea { resize: vertical; min-height: 200px; }
.form-input:focus, .form-textarea:focus { border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(0,113,227,0.1); }

/* Popup Settings */
.popup-settings-box { background: #f9f9fa; padding: 20px; border-radius: 12px; border: 1px solid var(--border-light); margin-bottom: 24px; }
.flex-between { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.btn-toggle-popup { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid var(--border-color); background: white; color: var(--text-gray); transition: 0.2s; }
.btn-toggle-popup.active { background: #e7f5ff; color: #1971c2; border-color: #1971c2; }

.date-range-picker { display: flex; align-items: center; gap: 10px; animation: slideDown 0.2s ease; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
.form-input.date { flex: 1; }
.tilde { color: var(--text-gray); font-weight: 600; }

.modal-footer { padding: 20px 28px; border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 10px; }
.btn-secondary { padding: 10px 20px; border-radius: 10px; border: 1px solid var(--border-color); background: white; color: var(--text-dark); font-weight: 600; cursor: pointer; }
.btn-secondary:hover { background: #f5f5f7; }
</style>