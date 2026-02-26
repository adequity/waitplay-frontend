<template>
  <div class="calendar-management">
    <!-- 탭 네비게이션 -->
    <div class="tab-nav">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'holidays' }"
        @click="activeTab = 'holidays'"
      >
        등록된 공휴일
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'defaults' }"
        @click="activeTab = 'defaults'; loadDefaults()"
      >
        기본 공휴일 설정
      </button>
    </div>

    <!-- 탭 1: 등록된 공휴일 관리 -->
    <template v-if="activeTab === 'holidays'">
      <div class="page-header">
        <div>
          <h1>캘린더 관리 (공휴일)</h1>
          <p class="subtitle">전체 시스템의 공휴일을 관리합니다. 여기에 등록된 공휴일은 모든 매장의 캘린더 블록에 표시됩니다.</p>
        </div>
        <div class="header-actions">
          <button class="btn-seed" @click="seedKoreanHolidays">
            🇰🇷 한국 공휴일 일괄 등록
          </button>
          <button class="btn-add" @click="showAddModal = true">
            + 공휴일 추가
          </button>
        </div>
      </div>

      <LoadingSpinner v-if="loading" message="공휴일을 불러오는 중..." />

      <div v-else class="table-container">
        <div class="filter-bar">
          <select class="filter-select" v-model="filterYear" @change="loadHolidays">
            <option :value="null">전체 연도</option>
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}년</option>
          </select>
          <span class="result-count">총 {{ holidays.length }}개</span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>공휴일 이름</th>
              <th>설명</th>
              <th>반복</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="holiday in holidays" :key="holiday.id" :class="{ inactive: !holiday.isActive }">
              <td class="date-cell">{{ holiday.date }}</td>
              <td class="name-cell">
                <span class="holiday-name">{{ holiday.name }}</span>
              </td>
              <td class="desc-cell">{{ holiday.description || '-' }}</td>
              <td>
                <span class="badge" :class="holiday.isRecurring ? 'badge-recurring' : 'badge-once'">
                  {{ holiday.isRecurring ? '매년 반복' : '1회성' }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="{ active: holiday.isActive }">
                  {{ holiday.isActive ? '활성' : '비활성' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action" @click="editHoliday(holiday)" title="수정">
                    <IconBase name="edit" />
                  </button>
                  <button class="btn-action" @click="toggleActive(holiday)" :title="holiday.isActive ? '비활성화' : '활성화'">
                    <IconBase :name="holiday.isActive ? 'eye-off' : 'eye'" />
                  </button>
                  <button class="btn-action danger" @click="confirmDelete(holiday)" title="삭제">
                    <IconBase name="trash" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="holidays.length === 0">
              <td colspan="6" class="empty-row">등록된 공휴일이 없습니다</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- 탭 2: 기본 공휴일 설정 -->
    <template v-if="activeTab === 'defaults'">
      <div class="page-header">
        <div>
          <h1>기본 공휴일 설정</h1>
          <p class="subtitle">"한국 공휴일 일괄 등록" 시 사용되는 기본 공휴일 목록입니다. 여기서 추가/수정/삭제하면 일괄 등록에 반영됩니다.</p>
        </div>
        <button class="btn-add" @click="showDefaultAddModal = true">
          + 기본 공휴일 추가
        </button>
      </div>

      <LoadingSpinner v-if="defaultsLoading" message="기본 공휴일을 불러오는 중..." />

      <div v-else class="table-container">
        <span class="result-count" style="padding: 12px 16px; display: block;">총 {{ defaults.length }}개</span>
        <table class="data-table">
          <thead>
            <tr>
              <th>월</th>
              <th>일</th>
              <th>공휴일 이름</th>
              <th>설명</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in defaults" :key="d.id" :class="{ inactive: !d.isActive }">
              <td>{{ d.month }}월</td>
              <td>{{ d.day }}일</td>
              <td class="name-cell"><span class="holiday-name">{{ d.name }}</span></td>
              <td class="desc-cell">{{ d.description || '-' }}</td>
              <td>
                <span class="status-badge" :class="{ active: d.isActive }">
                  {{ d.isActive ? '활성' : '비활성' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action" @click="editDefault(d)" title="수정">
                    <IconBase name="edit" />
                  </button>
                  <button class="btn-action" @click="toggleDefaultActive(d)" :title="d.isActive ? '비활성화' : '활성화'">
                    <IconBase :name="d.isActive ? 'eye-off' : 'eye'" />
                  </button>
                  <button class="btn-action danger" @click="confirmDeleteDefault(d)" title="삭제">
                    <IconBase name="trash" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="defaults.length === 0">
              <td colspan="6" class="empty-row">등록된 기본 공휴일이 없습니다</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- 공휴일 추가/수정 모달 -->
    <div v-if="showAddModal || editingHoliday" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingHoliday ? '공휴일 수정' : '공휴일 추가' }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">날짜 *</label>
            <input type="date" class="form-input" v-model="form.date">
          </div>
          <div class="form-group">
            <label class="form-label">공휴일 이름 *</label>
            <input type="text" class="form-input" v-model="form.name" placeholder="예: 설날, 추석">
          </div>
          <div class="form-group">
            <label class="form-label">설명 (선택)</label>
            <input type="text" class="form-input" v-model="form.description" placeholder="공휴일에 대한 설명">
          </div>
          <div class="form-group">
            <label class="form-label checkbox-label">
              <input type="checkbox" v-model="form.isRecurring">
              <span>매년 반복 (양력 기준)</span>
            </label>
            <p class="form-hint">체크하면 매년 같은 날짜에 자동으로 표시됩니다</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">취소</button>
          <button class="btn-save" @click="saveHoliday" :disabled="!form.date || !form.name">
            {{ editingHoliday ? '수정' : '추가' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 기본 공휴일 추가/수정 모달 -->
    <div v-if="showDefaultAddModal || editingDefault" class="modal-overlay" @click.self="closeDefaultModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingDefault ? '기본 공휴일 수정' : '기본 공휴일 추가' }}</h2>
          <button class="modal-close" @click="closeDefaultModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">월 *</label>
              <select class="form-input" v-model.number="defaultForm.month">
                <option v-for="m in 12" :key="m" :value="m">{{ m }}월</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">일 *</label>
              <input type="number" class="form-input" v-model.number="defaultForm.day" min="1" max="31" placeholder="1~31">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">공휴일 이름 *</label>
            <input type="text" class="form-input" v-model="defaultForm.name" placeholder="예: 설날, 추석">
          </div>
          <div class="form-group">
            <label class="form-label">설명 (선택)</label>
            <input type="text" class="form-input" v-model="defaultForm.description" placeholder="공휴일에 대한 설명">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDefaultModal">취소</button>
          <button class="btn-save" @click="saveDefault" :disabled="!defaultForm.month || !defaultForm.day || !defaultForm.name">
            {{ editingDefault ? '수정' : '추가' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'https://api.waitplay.co.kr'

// Tab state
const activeTab = ref<'holidays' | 'defaults'>('holidays')

// --- 등록된 공휴일 ---
const loading = ref(true)
const holidays = ref<any[]>([])
const showAddModal = ref(false)
const editingHoliday = ref<any>(null)
const filterYear = ref<number | null>(new Date().getFullYear())

const form = ref({
  date: '',
  name: '',
  description: '',
  isRecurring: true
})

const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const years = []
  for (let y = currentYear - 1; y <= currentYear + 3; y++) {
    years.push(y)
  }
  return years
})

async function loadHolidays() {
  try {
    loading.value = true
    const params = filterYear.value ? `?year=${filterYear.value}` : ''
    const response = await fetch(`${API_URL}/api/calendar/holidays${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    holidays.value = await response.json()
  } catch (error) {
    console.error('공휴일 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

async function saveHoliday() {
  try {
    const url = editingHoliday.value
      ? `${API_URL}/api/calendar/holidays/${editingHoliday.value.id}`
      : `${API_URL}/api/calendar/holidays`

    const response = await fetch(url, {
      method: editingHoliday.value ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || '저장 실패')
    }

    closeModal()
    await loadHolidays()
  } catch (error: any) {
    alert(error.message || '공휴일 저장에 실패했습니다')
  }
}

function editHoliday(holiday: any) {
  editingHoliday.value = holiday
  form.value = {
    date: holiday.date,
    name: holiday.name,
    description: holiday.description || '',
    isRecurring: holiday.isRecurring
  }
}

async function toggleActive(holiday: any) {
  try {
    const response = await fetch(`${API_URL}/api/calendar/holidays/${holiday.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isActive: !holiday.isActive })
    })
    if (!response.ok) throw new Error('Failed')
    holiday.isActive = !holiday.isActive
  } catch {
    alert('상태 변경에 실패했습니다')
  }
}

async function confirmDelete(holiday: any) {
  if (!confirm(`"${holiday.name}" 공휴일을 삭제하시겠습니까?`)) return

  try {
    const response = await fetch(`${API_URL}/api/calendar/holidays/${holiday.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    await loadHolidays()
  } catch {
    alert('삭제에 실패했습니다')
  }
}

async function seedKoreanHolidays() {
  if (!confirm('기본 공휴일 설정에 등록된 공휴일들을 일괄 등록하시겠습니까?')) return

  try {
    const response = await fetch(`${API_URL}/api/calendar/holidays/seed-korean`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const result = await response.json()
    alert(result.message)
    await loadHolidays()
  } catch {
    alert('일괄 등록에 실패했습니다')
  }
}

function closeModal() {
  showAddModal.value = false
  editingHoliday.value = null
  form.value = { date: '', name: '', description: '', isRecurring: true }
}

// --- 기본 공휴일 설정 ---
const defaultsLoading = ref(false)
const defaults = ref<any[]>([])
const showDefaultAddModal = ref(false)
const editingDefault = ref<any>(null)

const defaultForm = ref({
  month: 1,
  day: 1,
  name: '',
  description: ''
})

async function loadDefaults() {
  try {
    defaultsLoading.value = true
    const response = await fetch(`${API_URL}/api/calendar/default-holidays`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    defaults.value = await response.json()
  } catch (error) {
    console.error('기본 공휴일 로드 실패:', error)
  } finally {
    defaultsLoading.value = false
  }
}

async function saveDefault() {
  try {
    const url = editingDefault.value
      ? `${API_URL}/api/calendar/default-holidays/${editingDefault.value.id}`
      : `${API_URL}/api/calendar/default-holidays`

    const response = await fetch(url, {
      method: editingDefault.value ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(defaultForm.value)
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || '저장 실패')
    }

    closeDefaultModal()
    await loadDefaults()
  } catch (error: any) {
    alert(error.message || '기본 공휴일 저장에 실패했습니다')
  }
}

function editDefault(d: any) {
  editingDefault.value = d
  defaultForm.value = {
    month: d.month,
    day: d.day,
    name: d.name,
    description: d.description || ''
  }
}

async function toggleDefaultActive(d: any) {
  try {
    const response = await fetch(`${API_URL}/api/calendar/default-holidays/${d.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isActive: !d.isActive })
    })
    if (!response.ok) throw new Error('Failed')
    d.isActive = !d.isActive
  } catch {
    alert('상태 변경에 실패했습니다')
  }
}

async function confirmDeleteDefault(d: any) {
  if (!confirm(`"${d.name}" 기본 공휴일을 삭제하시겠습니까?`)) return

  try {
    const response = await fetch(`${API_URL}/api/calendar/default-holidays/${d.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    await loadDefaults()
  } catch {
    alert('삭제에 실패했습니다')
  }
}

function closeDefaultModal() {
  showDefaultAddModal.value = false
  editingDefault.value = null
  defaultForm.value = { month: 1, day: 1, name: '', description: '' }
}

onMounted(() => {
  loadHolidays()
})
</script>

<style scoped>
.calendar-management {
  padding: 0;
}

/* Tab Navigation */
.tab-nav {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: white;
  color: #1f2937;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.tab-btn:hover:not(.active) {
  color: #374151;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-add, .btn-seed {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add {
  background: #4f46e5;
  color: white;
}

.btn-add:hover {
  background: #4338ca;
}

.btn-seed {
  background: #f3f4f6;
  color: #374151;
}

.btn-seed:hover {
  background: #e5e7eb;
}

/* Filter */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 0 16px;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.result-count {
  font-size: 13px;
  color: #9ca3af;
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
}

.data-table tr:hover {
  background: #f9fafb;
}

.data-table tr.inactive {
  opacity: 0.5;
}

.date-cell {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.holiday-name {
  font-weight: 600;
}

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 32px !important;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.badge-recurring {
  background: #dbeafe;
  color: #2563eb;
}

.badge-once {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

/* Actions */
.action-buttons {
  display: flex;
  gap: 4px;
}

.btn-action {
  padding: 6px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover {
  background: #e5e7eb;
}

.btn-action.danger:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  margin: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.modal-close {
  border: none;
  background: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0 4px;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.btn-save {
  padding: 8px 20px;
  border: none;
  background: #4f46e5;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save:not(:disabled):hover {
  background: #4338ca;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }

  .data-table th:nth-child(3),
  .data-table td:nth-child(3),
  .data-table th:nth-child(4),
  .data-table td:nth-child(4) {
    display: none;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
