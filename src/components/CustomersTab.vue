<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">고객 분석</h1>
      <p class="page-desc">고객 세그먼트별 현황과 참여도를 확인하세요.</p>
    </div>

    <!-- Segment Guide -->
    <div class="segment-guide">
      <div class="guide-header">
        <svg class="guide-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        <span class="guide-title">세그먼트 분류 기준</span>
      </div>
      <div class="guide-content">
        <div class="guide-item"><span class="guide-badge yellow">VIP</span> 쿠폰 사용 상위 5%</div>
        <div class="guide-item"><span class="guide-badge blue">단골</span> 상위 5~15% (다음 10%)</div>
        <div class="guide-item"><span class="guide-badge purple">활동</span> 상위 15~55% (다음 40%)</div>
        <div class="guide-item"><span class="guide-badge gray">일반</span> 나머지 45%</div>
        <div class="guide-item"><span class="guide-badge green">신규</span> 최근 1달 내 첫 쿠폰 사용</div>
      </div>
    </div>

    <!-- 1. Customer Segments (KPI Cards) -->
    <div class="segments-grid">
      <!-- VIP -->
      <div class="segment-card" :class="{ loading: isLoading }">
        <div class="segment-header">
          <div class="icon-circle yellow">
            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z"/></svg>
          </div>
          <div>
            <div class="segment-title">VIP 고객</div>
            <div class="segment-subtitle">상위 5%</div>
          </div>
        </div>
        <div class="segment-count">{{ segments.vip.count }}<span class="unit">명</span></div>
        <div class="segment-footer">
          <div class="stat-row"><span>평균 사용</span><strong>{{ segments.vip.avgUsage }}회</strong></div>
          <div class="stat-row"><span>쿠폰 보유</span><strong>평균 {{ segments.vip.avgCoupons }}장</strong></div>
        </div>
      </div>

      <!-- Regular -->
      <div class="segment-card" :class="{ loading: isLoading }">
        <div class="segment-header">
          <div class="icon-circle blue">
            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          </div>
          <div>
            <div class="segment-title">단골 고객</div>
            <div class="segment-subtitle">상위 5~15%</div>
          </div>
        </div>
        <div class="segment-count">{{ segments.regular.count }}<span class="unit">명</span></div>
        <div class="segment-footer">
          <div class="stat-row"><span>평균 사용</span><strong>{{ segments.regular.avgUsage }}회</strong></div>
          <div class="stat-row"><span>쿠폰 보유</span><strong>평균 {{ segments.regular.avgCoupons }}장</strong></div>
        </div>
      </div>

      <!-- Active -->
      <div class="segment-card" :class="{ loading: isLoading }">
        <div class="segment-header">
          <div class="icon-circle purple">
            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <div class="segment-title">활동 고객</div>
            <div class="segment-subtitle">상위 15~55%</div>
          </div>
        </div>
        <div class="segment-count">{{ segments.active.count }}<span class="unit">명</span></div>
        <div class="segment-footer">
          <div class="stat-row"><span>평균 사용</span><strong>{{ segments.active.avgUsage }}회</strong></div>
          <div class="stat-row"><span>쿠폰 보유</span><strong>평균 {{ segments.active.avgCoupons }}장</strong></div>
        </div>
      </div>

      <!-- Normal -->
      <div class="segment-card" :class="{ loading: isLoading }">
        <div class="segment-header">
          <div class="icon-circle gray">
            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div>
            <div class="segment-title">일반 고객</div>
            <div class="segment-subtitle">나머지 45%</div>
          </div>
        </div>
        <div class="segment-count">{{ segments.normal.count }}<span class="unit">명</span></div>
        <div class="segment-footer">
          <div class="stat-row"><span>평균 사용</span><strong>{{ segments.normal.avgUsage }}회</strong></div>
          <div class="stat-row"><span>쿠폰 보유</span><strong>평균 {{ segments.normal.avgCoupons }}장</strong></div>
        </div>
      </div>

      <!-- New -->
      <div class="segment-card" :class="{ loading: isLoading }">
        <div class="segment-header">
          <div class="icon-circle green">
            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
          </div>
          <div>
            <div class="segment-title">신규 고객</div>
            <div class="segment-subtitle">최근 1달 내</div>
          </div>
        </div>
        <div class="segment-count">{{ segments.new.count }}<span class="unit">명</span></div>
        <div class="segment-footer">
          <div class="stat-row"><span>평균 사용</span><strong>{{ segments.new.avgUsage }}회</strong></div>
          <div class="stat-row"><span>쿠폰 보유</span><strong>평균 {{ segments.new.avgCoupons }}장</strong></div>
        </div>
      </div>
    </div>

    <!-- 2. Message Sending Section -->
    <div class="message-section">
      <div class="card-header">
        <h2 class="section-title">메시지 발송</h2>
        <p class="section-desc">고객 세그먼트를 선택하여 문자 또는 카카오톡 메시지를 전송하세요.</p>
      </div>

      <!-- Sending Method -->
      <div class="form-group">
        <label class="form-label">발송 방식</label>
        <div class="method-grid">
          <div
            class="method-card"
            :class="{ active: form.method === 'sms' }"
            @click="form.method = 'sms'"
          >
            <svg class="method-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
            <span>문자 메시지 (SMS)</span>
          </div>
          <div
            class="method-card"
            :class="{ active: form.method === 'kakao' }"
            @click="form.method = 'kakao'"
          >
            <svg class="method-icon kakao" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            <span>카카오톡 플러스친구</span>
          </div>
        </div>
      </div>

      <!-- Target Segment -->
      <div class="form-group">
        <label class="form-label">대상 고객 세그먼트</label>
        <div class="select-wrapper">
          <select v-model="form.segment" class="form-select">
            <option value="all">전체 고객 ({{ segments.total }}명)</option>
            <option value="vip">VIP 고객 ({{ segments.vip.count }}명)</option>
            <option value="regular">단골 고객 ({{ segments.regular.count }}명)</option>
            <option value="active">활동 고객 ({{ segments.active.count }}명)</option>
            <option value="normal">일반 고객 ({{ segments.normal.count }}명)</option>
            <option value="new">신규 고객 ({{ segments.new.count }}명)</option>
          </select>
          <svg class="select-icon" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
        </div>
      </div>

      <!-- Filters -->
      <div class="form-group">
        <label class="form-label">상세 필터</label>
        <div class="filter-box">
          <label class="checkbox-item">
            <input type="checkbox" v-model="form.filters.waiting" />
            <span>특정 월 웨이팅 고객</span>
          </label>
          <label class="checkbox-item">
            <input type="checkbox" v-model="form.filters.visitCount" />
            <span>방문 횟수</span>
          </label>
          <label class="checkbox-item">
            <input type="checkbox" v-model="form.filters.game" />
            <span>게임 참여 여부</span>
          </label>
          <label class="checkbox-item">
            <input type="checkbox" v-model="form.filters.lastVisit" />
            <span>마지막 방문</span>
          </label>
          <label class="checkbox-item">
            <input type="checkbox" v-model="form.filters.reward" />
            <span>리워드 사용 여부</span>
          </label>
        </div>
      </div>

      <!-- Message Content -->
      <div class="form-group">
        <div class="label-row">
          <label class="form-label">메시지 템플릿</label>
          <div class="template-actions">
            <button class="btn-small" @click="openTemplateModal">
              <svg class="btn-icon-small" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
              템플릿 관리
            </button>
          </div>
        </div>
        <div class="select-wrapper mb-3">
          <select v-model="form.templateId" class="form-select" @change="applyTemplateFromSelect">
            <option value="">직접 입력</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.title }}</option>
          </select>
          <svg class="select-icon" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
        </div>

        <label class="form-label">메시지 내용</label>
        <div class="textarea-wrapper">
          <textarea
            v-model="form.message"
            class="form-textarea"
            placeholder="SMS 메시지를 입력하세요..."
            rows="6"
          ></textarea>
          <div class="char-count">{{ charCount }} / 2000자</div>
        </div>
      </div>

      <!-- Info Box -->
      <div class="info-alert">
        <svg class="info-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        <span>1건의 {{ form.method === 'sms' ? 'SMS' : '알림톡' }}로 발송됩니다 ({{ form.method === 'sms' ? '단문, 15원' : '건당 12원' }})</span>
      </div>

      <!-- Actions -->
      <div class="action-row">
        <button class="btn-preview" @click="openPreviewModal">
          <svg class="btn-icon" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
          미리보기
        </button>
        <button class="btn-send">
          <svg class="btn-icon" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          {{ form.method === 'sms' ? 'SMS' : '메시지' }} 발송
        </button>
      </div>
    </div>

    <!-- 3. Estimate Footer -->
    <div class="estimate-grid">
      <div class="estimate-card">
        <span class="est-label">예상 발송 건수</span>
        <span class="est-value blue">{{ selectedSegmentCount }}건</span>
      </div>
      <div class="estimate-card">
        <span class="est-label">예상 비용</span>
        <span class="est-value blue">{{ estimatedCost.toLocaleString() }}원</span>
      </div>
      <div class="estimate-card">
        <span class="est-label">발송 방식</span>
        <span class="est-value blue">{{ form.method === 'sms' ? 'SMS' : '카카오톡' }}</span>
      </div>
    </div>

    <!-- TEMPLATE MANAGEMENT MODAL -->
    <div v-if="isTemplateModalOpen" class="modal-overlay open" @click.self="closeTemplateModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">메시지 템플릿 관리</h3>
          <button class="btn-close" @click="closeTemplateModal">✕</button>
        </div>

        <div class="modal-body">
          <!-- Add New Template Form -->
          <div v-if="isAddingTemplate" class="add-template-form active">
            <label class="input-label">템플릿 제목</label>
            <input type="text" v-model="newTemplate.title" class="modal-input" placeholder="예: 신년 이벤트 안내">

            <label class="input-label">내용</label>
            <textarea v-model="newTemplate.content" class="modal-textarea" placeholder="템플릿 내용을 입력하세요"></textarea>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn-small" @click="toggleAddForm">취소</button>
              <button class="btn-send-small" @click="saveNewTemplate">저장하기</button>
            </div>
          </div>

          <!-- Template List -->
          <div class="template-list">
            <div v-if="templates.length === 0" class="empty-list">
              등록된 템플릿이 없습니다.
            </div>
            <div v-else v-for="t in templates" :key="t.id" class="template-item">
              <div class="template-content" @click="selectTemplate(t)">
                <div class="template-name">{{ t.title }}</div>
                <div class="template-preview">{{ t.content }}</div>
              </div>
              <button class="btn-delete-template" @click.stop="deleteTemplate(t.id)" title="삭제">
                <svg class="delete-icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-small" @click="closeTemplateModal">닫기</button>
          <button v-if="!isAddingTemplate" class="btn-send-small" @click="toggleAddForm">새 템플릿 추가</button>
        </div>
      </div>
    </div>

    <!-- PREVIEW MODAL -->
    <div v-if="isPreviewModalOpen" class="modal-overlay open" @click.self="closePreviewModal">
      <div class="modal-container preview-container">
        <div class="phone-frame">
          <div class="phone-screen">
            <div style="text-align:center; font-size:12px; color:#86868b; margin-bottom:20px;">오늘 오후 2:30</div>
            <div class="message-bubble">
              <span>{{ form.message || '메시지 내용이 여기에 표시됩니다.' }}</span>
            </div>
            <div class="message-time">전송됨</div>
          </div>
        </div>
        <div style="text-align:center; margin-top:20px;">
          <button class="btn-close-white" @click="closePreviewModal">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCustomerSegments, type CustomerSegments, type SegmentData } from '@/services/customersService'

// --- Types ---
interface Template {
  id: string
  title: string
  content: string
}

// --- State ---
const isLoading = ref(false)
const segments = ref<CustomerSegments>({
  vip: { count: 0, avgUsage: 0, avgCoupons: 0 },
  regular: { count: 0, avgUsage: 0, avgCoupons: 0 },
  active: { count: 0, avgUsage: 0, avgCoupons: 0 },
  normal: { count: 0, avgUsage: 0, avgCoupons: 0 },
  new: { count: 0, avgUsage: 0, avgCoupons: 0 },
  total: 0
})

const form = ref({
  method: 'sms', // 'sms' | 'kakao'
  segment: 'all',
  filters: {
    waiting: false,
    visitCount: false,
    game: false,
    lastVisit: false,
    reward: false
  },
  templateId: '',
  message: ''
})

const templates = ref<Template[]>([
  { id: 't1', title: '이벤트 안내', content: '안녕하세요 고객님! WaitPlay 여름 시즌 이벤트가 시작되었습니다. 지금 방문하셔서 시원한 혜택을 받아보세요!' },
  { id: 't2', title: '쿠폰 만료 알림', content: '[WaitPlay] 보유하신 쿠폰이 3일 뒤 만료될 예정입니다. 잊지 말고 사용해주세요!' },
  { id: 't3', title: '신메뉴 출시', content: '새로운 디저트 메뉴가 출시되었습니다. 이번 주말, 달콤한 휴식 어떠세요?' }
])

// --- API 호출 ---
const fetchCustomerSegments = async () => {
  isLoading.value = true
  try {
    segments.value = await getCustomerSegments()
  } catch (error) {
    console.error('고객 세그먼트 조회 실패:', error)
  } finally {
    isLoading.value = false
  }
}

// 선택된 세그먼트의 고객 수
const selectedSegmentCount = computed(() => {
  switch (form.value.segment) {
    case 'vip': return segments.value.vip.count
    case 'regular': return segments.value.regular.count
    case 'active': return segments.value.active.count
    case 'normal': return segments.value.normal.count
    case 'new': return segments.value.new.count
    default: return segments.value.total
  }
})

// Modal States
const isTemplateModalOpen = ref(false)
const isPreviewModalOpen = ref(false)
const isAddingTemplate = ref(false)

const newTemplate = ref({
  title: '',
  content: ''
})

// --- Computed ---
const charCount = computed(() => form.value.message.length)

const estimatedCost = computed(() => {
  const costPerMsg = form.value.method === 'sms' ? 15 : 12
  return selectedSegmentCount.value * costPerMsg
})

// --- Methods ---

// Template Management
function applyTemplateFromSelect() {
  const selectedTemplate = templates.value.find(t => t.id === form.value.templateId)
  if (selectedTemplate) {
    form.value.message = selectedTemplate.content
  } else {
    form.value.message = ''
  }
}

function selectTemplate(template: Template) {
  form.value.message = template.content
  form.value.templateId = template.id
  closeTemplateModal()
}

function openTemplateModal() {
  isTemplateModalOpen.value = true
  isAddingTemplate.value = false // Reset add mode
}

function closeTemplateModal() {
  isTemplateModalOpen.value = false
}

function toggleAddForm() {
  isAddingTemplate.value = !isAddingTemplate.value
  if (isAddingTemplate.value) {
    newTemplate.value = { title: '', content: '' }
  }
}

function saveNewTemplate() {
  if (!newTemplate.value.title.trim() || !newTemplate.value.content.trim()) {
    alert('제목과 내용을 모두 입력해주세요.')
    return
  }

  const newId = 't' + Date.now()
  templates.value.push({
    id: newId,
    title: newTemplate.value.title,
    content: newTemplate.value.content
  })

  // Reset & Close add form
  newTemplate.value = { title: '', content: '' }
  isAddingTemplate.value = false
}

function deleteTemplate(id: string) {
  if (confirm('정말 이 템플릿을 삭제하시겠습니까?')) {
    templates.value = templates.value.filter(t => t.id !== id)

    // If deleted template was selected, reset selection
    if (form.value.templateId === id) {
      form.value.templateId = ''
      form.value.message = ''
    }
  }
}

// Preview Modal
function openPreviewModal() {
  isPreviewModalOpen.value = true
}

function closePreviewModal() {
  isPreviewModalOpen.value = false
}

// --- Lifecycle ---
onMounted(() => {
  fetchCustomerSegments()
})
</script>

<style scoped>
/* --- Design Tokens --- */
:root {
  --primary-blue: #0071e3;
  --primary-dark: #0077ed;
  --bg-gray: #f5f5f7;
  --text-dark: #1d1d1f;
  --text-gray: #86868b;
  --border-color: #d2d2d7;
  --border-light: #e5e5ea;
  --card-radius: 20px;
  --input-radius: 12px;
  --danger-red: #ff3b30;
}

.tab-content {
  padding: 50px 60px;
  background-color: #f5f5f7;
  min-height: 100vh;
  color: #1d1d1f;
}

/* Page Header */
.page-header { margin-bottom: 40px; }
.page-title { font-size: 32px; font-weight: 800; margin-bottom: 10px; color: #1d1d1f; letter-spacing: -0.5px; }
.page-desc { color: #86868b; font-size: 16px; }

/* Segment Guide */
.segment-guide {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(0, 113, 227, 0.1);
  box-shadow: 0 2px 12px rgba(0, 113, 227, 0.06);
}
.guide-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.guide-icon {
  width: 20px;
  height: 20px;
  fill: #0071e3;
}
.guide-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}
.guide-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}
.guide-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #515154;
}
.guide-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}
.guide-badge.yellow { background: #fff9e6; color: #d97706; }
.guide-badge.blue { background: #e8f2ff; color: #0071e3; }
.guide-badge.purple { background: #f3f0ff; color: #845ef7; }
.guide-badge.gray { background: #f0f0f2; color: #6e6e73; }
.guide-badge.green { background: #e8fff0; color: #22c55e; }

/* 1. Segments Grid */
.segments-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.segment-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.02);
  transition: transform 0.2s;
  cursor: default;
}
.segment-card:hover { transform: translateY(-3px); }
.segment-card.loading { opacity: 0.6; }
.segment-card.loading .segment-count { animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.segment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.icon-circle {
  width: 44px; height: 44px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
}
.icon-circle.yellow { background: #fff9e6; color: #ffab00; }
.icon-circle.blue { background: #e8f2ff; color: #0071e3; }
.icon-circle.purple { background: #f3f0ff; color: #845ef7; }
.icon-circle.gray { background: #f0f0f2; color: #6e6e73; }
.icon-circle.green { background: #e6fcf5; color: #0ca678; }

.icon-svg { width: 24px; height: 24px; fill: currentColor; }

.segment-title { font-weight: 700; font-size: 16px; margin-bottom: 2px; }
.segment-subtitle { font-size: 12px; color: #86868b; }

.segment-count { font-size: 36px; font-weight: 800; margin-bottom: 24px; line-height: 1; }
.segment-count .unit { font-size: 16px; font-weight: 600; margin-left: 4px; color: #86868b; }

.segment-footer { border-top: 1px solid #e5e5ea; padding-top: 16px; }
.stat-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
.stat-row:last-child { margin-bottom: 0; }
.stat-row span { color: #86868b; }
.stat-row strong { color: #1d1d1f; }

/* 2. Message Section */
.message-section {
  background: white;
  border-radius: 20px;
  padding: 36px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
  margin-bottom: 24px;
}

.card-header { margin-bottom: 30px; }
.section-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.section-desc { color: #86868b; font-size: 14px; }

/* Forms */
.form-group { margin-bottom: 28px; }
.form-label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 10px; color: #1d1d1f; }

/* Method Grid */
.method-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.method-card {
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  padding: 20px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  cursor: pointer; font-weight: 600; color: #86868b;
  transition: all 0.2s;
  background: #fbfbfd;
}
.method-card:hover { background: white; border-color: #b0b0b5; }
.method-card.active {
  background: #0071e3; border-color: #0071e3; color: white;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);
}
.method-icon { font-size: 20px; width: 20px; height: 20px; fill: currentColor; }
.method-icon.kakao { color: #fee500; }
.method-card.active :deep(.method-icon.kakao) { color: white; }

/* Select */
.select-wrapper { position: relative; }
.form-select {
  width: 100%; padding: 14px 16px; border: 1px solid #d2d2d7;
  border-radius: 12px; font-size: 15px; appearance: none;
  background: white; cursor: pointer; color: #1d1d1f;
}
.form-select:focus { outline: none; border-color: #0071e3; }
.select-icon {
  position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
  width: 16px; height: 16px; color: #86868b; pointer-events: none; fill: currentColor;
}

/* Filters */
.filter-box {
  background: #f9f9fa; border: 1px solid #e5e5ea;
  border-radius: 12px; padding: 20px;
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
}
.checkbox-item { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; color: #1d1d1f; }
.checkbox-item input { width: 18px; height: 18px; accent-color: #0071e3; cursor: pointer; }

/* Textarea & Template */
.label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.template-actions { display: flex; gap: 8px; }
.btn-small {
  background: #f5f5f7; border: none; padding: 6px 12px; border-radius: 8px;
  font-size: 12px; font-weight: 600; color: #86868b; cursor: pointer;
  display: flex; align-items: center; gap: 4px; transition: 0.2s;
}
.btn-small:hover { background: #e5e5ea; color: #1d1d1f; }
.btn-icon-small { width: 14px; height: 14px; margin-right: 4px; fill: currentColor; }
.mb-3 { margin-bottom: 16px; }

.textarea-wrapper { position: relative; }
.form-textarea {
  width: 100%; padding: 16px; border: 1px solid #d2d2d7;
  border-radius: 12px; font-size: 15px; resize: vertical;
  background: white; border-color: #d2d2d7; font-family: inherit;
}
.form-textarea:focus { outline: none; border-color: #0071e3; }
.char-count {
  position: absolute; bottom: 16px; right: 16px;
  font-size: 12px; color: #86868b;
}

/* Info Alert */
.info-alert {
  background: #e8f2ff; border: 1px solid #b6d4fe; border-radius: 12px;
  padding: 16px; display: flex; align-items: center; gap: 10px;
  font-size: 14px; color: #004085; margin-bottom: 30px;
}
.info-icon { width: 18px; height: 18px; fill: currentColor; color: #004085; }

/* Action Buttons */
.action-row { display: flex; justify-content: flex-end; gap: 12px; }
.btn-preview {
  background: white; border: 1px solid #d2d2d7; color: #1d1d1f;
  padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px;
  display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s;
}
.btn-preview:hover { background: #f5f5f7; }

.btn-send {
  background: #0071e3; color: white; border: none;
  padding: 14px 36px; border-radius: 12px; font-weight: 600; font-size: 15px;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3); transition: 0.2s;
}
.btn-send:hover { background: #0077ed; transform: translateY(-1px); }
.btn-icon { width: 18px; height: 18px; fill: currentColor; }

.btn-send-small {
  background: #0071e3; color: white; border: none;
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: 0.2s;
}
.btn-send-small:hover { background: #0077ed; }

/* 3. Estimate Footer */
.estimate-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
}
.estimate-card {
  background: white; border-radius: 20px; padding: 24px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02);
}
.est-label { font-size: 13px; color: #86868b; margin-bottom: 8px; }
.est-value { font-size: 20px; font-weight: 700; color: #1d1d1f; }
.est-value.blue { color: #0071e3; }

/* --- MODAL STYLES --- */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; opacity: 0; visibility: hidden; transition: 0.2s;
}
.modal-overlay.open { opacity: 1; visibility: visible; }

.modal-container {
  background: white; border-radius: 24px; width: 100%; max-width: 500px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden;
  transform: scale(0.95); transition: 0.2s;
  display: flex; flex-direction: column; max-height: 85vh;
}
.modal-overlay.open .modal-container { transform: scale(1); }
.preview-container { background: transparent; box-shadow: none; max-width: 340px; }

.modal-header {
  padding: 20px 24px; border-bottom: 1px solid #e5e5ea;
  display: flex; justify-content: space-between; align-items: center;
  flex-shrink: 0;
}
.modal-title { font-size: 18px; font-weight: 700; margin: 0; color: #1d1d1f; }
.btn-close {
  background: #f5f5f7; border: none; width: 32px; height: 32px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #86868b;
}
.btn-close:hover { background: #e5e5ea; color: #1d1d1f; }
.btn-close-white {
  background: white; border: none; width: 40px; height: 40px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #1d1d1f; margin: 0 auto;
}

.modal-body { padding: 24px; overflow-y: auto; flex-grow: 1; }

/* Template List Styles */
.template-list { display: flex; flex-direction: column; gap: 12px; }
.empty-list { text-align: center; color: #86868b; padding: 20px; font-size: 14px; }

.template-item {
  padding: 16px; border: 1px solid #e5e5ea; border-radius: 12px;
  cursor: pointer; transition: 0.2s; position: relative;
  display: flex; justify-content: space-between; align-items: flex-start;
}
.template-item:hover { border-color: #0071e3; background: #f0f7ff; }

.template-content { flex: 1; margin-right: 12px; }
.template-name { font-weight: 600; margin-bottom: 4px; font-size: 15px; color: #1d1d1f; }
.template-preview { font-size: 13px; color: #86868b; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }

.btn-delete-template {
  background: none; border: none; color: #86868b; cursor: pointer;
  padding: 4px; display: flex; align-items: center; justify-content: center;
  opacity: 0.5; transition: 0.2s;
}
.template-item:hover .btn-delete-template { opacity: 1; }
.btn-delete-template:hover { color: #ff3b30; }
.delete-icon { width: 18px; height: 18px; fill: currentColor; }

/* Add Template Form */
.add-template-form {
  background: #f9f9fa; border-radius: 12px; padding: 20px;
  margin-bottom: 20px; border: 1px solid #e5e5ea;
  display: none;
}
.add-template-form.active { display: block; animation: slideDown 0.3s ease; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.input-label { font-size: 13px; font-weight: 600; margin-bottom: 6px; display: block; color: #86868b; }
.modal-input {
  width: 100%; padding: 10px 12px; border: 1px solid #d2d2d7;
  border-radius: 8px; font-size: 14px; margin-bottom: 12px;
}
.modal-textarea {
  width: 100%; padding: 10px 12px; border: 1px solid #d2d2d7;
  border-radius: 8px; font-size: 14px; resize: vertical; min-height: 80px; margin-bottom: 12px;
}

/* Preview Phone Styles */
.phone-frame {
  background: #fff; border: 12px solid #1d1d1f; border-radius: 36px;
  width: 300px; height: 500px; margin: 0 auto; overflow: hidden; position: relative;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
.phone-screen {
  background: #ebedf2; height: 100%; padding: 20px 16px;
  display: flex; flex-direction: column;
}
.message-bubble {
  background: white; padding: 12px 16px; border-radius: 16px;
  border-top-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  font-size: 14px; line-height: 1.5; color: #1d1d1f; max-width: 90%;
  margin-top: 20px; word-break: break-word;
}
.message-time { font-size: 11px; color: #86868b; margin-top: 6px; margin-left: 4px; }

/* Modal Footer */
.modal-footer {
  padding: 20px 24px; border-top: 1px solid #e5e5ea;
  display: flex; justify-content: flex-end; gap: 10px; background: #fbfbfd;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .segments-grid { grid-template-columns: repeat(2, 1fr); }
  .estimate-grid { grid-template-columns: 1fr; }
  .estimate-card { flex-direction: row; justify-content: space-between; padding: 20px 30px; }
  .est-label { margin-bottom: 0; }
}
@media (max-width: 1200px) {
  .segments-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .segments-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .tab-content { padding: 30px 20px; }
  .segments-grid { grid-template-columns: 1fr; }
  .method-grid { grid-template-columns: 1fr; }
  .filter-box { grid-template-columns: 1fr; }
  .action-row { flex-direction: column-reverse; }
  .btn-preview, .btn-send { width: 100%; justify-content: center; }
  .guide-content { flex-direction: column; gap: 8px; }
}
</style>
