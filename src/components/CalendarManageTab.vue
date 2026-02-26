<template>
  <div class="tab-content">
    <div class="page-header">
      <div>
        <h1>캘린더 관리</h1>
        <p class="subtitle">매장의 휴무일, 이벤트, 영업시간 변경 등 일정을 관리합니다</p>
      </div>
      <button class="btn-add" @click="showAddModal = true">
        + 일정 추가
      </button>
    </div>

    <LoadingSpinner v-if="loading" message="일정을 불러오는 중..." />

    <template v-else>
      <!-- 월 네비게이션 -->
      <div class="month-nav">
        <button class="nav-btn" @click="prevMonth">&lt;</button>
        <span class="nav-label">{{ currentYear }}년 {{ currentMonth }}월</span>
        <button class="nav-btn" @click="nextMonth">&gt;</button>
      </div>

      <!-- 미니 캘린더 -->
      <div class="mini-calendar">
        <div class="cal-weekdays">
          <span v-for="d in weekdays" :key="d" class="cal-weekday" :class="{ sun: d === '일', sat: d === '토' }">{{ d }}</span>
        </div>
        <div class="cal-days">
          <div
            v-for="(cell, idx) in calendarCells"
            :key="idx"
            class="cal-day"
            :class="{
              'other-month': !cell.isCurrentMonth,
              'today': cell.isToday,
              'has-event': cell.events.length > 0,
              'is-closed': cell.isClosed,
              'is-sunday': cell.dayOfWeek === 0,
              'is-saturday': cell.dayOfWeek === 6
            }"
          >
            <span class="cal-day-num">{{ cell.day }}</span>
            <div v-if="cell.events.length > 0" class="cal-dot-row">
              <span v-for="(ev, ei) in cell.events.slice(0, 3)" :key="ei" class="cal-dot" :style="{ background: getTypeColor(ev.scheduleType) }"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 일정 목록 -->
      <div class="schedule-section">
        <h3 class="section-title">이번 달 일정 ({{ schedules.length }}개)</h3>

        <div v-if="schedules.length === 0" class="empty-state">
          <p>등록된 일정이 없습니다</p>
          <button class="btn-add-small" @click="showAddModal = true">+ 일정 추가하기</button>
        </div>

        <div class="schedule-list">
          <div v-for="schedule in schedules" :key="schedule.id" class="schedule-card" :class="{ inactive: !schedule.isActive }">
            <div class="schedule-color-bar" :style="{ background: schedule.color || getTypeColor(schedule.scheduleType) }"></div>
            <div class="schedule-info">
              <div class="schedule-top">
                <span class="schedule-type-badge" :class="`type-${schedule.scheduleType}`">
                  {{ getTypeLabel(schedule.scheduleType) }}
                </span>
                <span v-if="!schedule.isActive" class="inactive-badge">비활성</span>
              </div>
              <div class="schedule-title">{{ schedule.title }}</div>
              <div class="schedule-date">
                {{ schedule.startDate }}
                <template v-if="schedule.startDate !== schedule.endDate">~ {{ schedule.endDate }}</template>
              </div>
              <div v-if="schedule.description" class="schedule-desc">{{ schedule.description }}</div>
              <div v-if="schedule.recurringDays" class="schedule-recurring">
                매주 {{ formatRecurringDays(schedule.recurringDays) }} 반복
              </div>
            </div>
            <div class="schedule-actions">
              <button class="btn-icon" @click="editSchedule(schedule)" title="수정">✏️</button>
              <button class="btn-icon" @click="confirmDelete(schedule)" title="삭제">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 일정 추가/수정 모달 -->
    <div v-if="showAddModal || editingSchedule" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingSchedule ? '일정 수정' : '일정 추가' }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">일정 유형 *</label>
            <div class="type-selector">
              <button
                v-for="t in scheduleTypes"
                :key="t.value"
                type="button"
                class="type-btn"
                :class="{ active: form.scheduleType === t.value, [`type-${t.value}`]: true }"
                @click="form.scheduleType = t.value"
              >
                <span class="type-icon">{{ t.icon }}</span>
                <span>{{ t.label }}</span>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">제목 *</label>
            <input type="text" class="form-input" v-model="form.title" :placeholder="getTitlePlaceholder(form.scheduleType)">
          </div>
          <div class="form-group">
            <label class="form-label">설명 (선택)</label>
            <textarea class="form-textarea" v-model="form.description" placeholder="일정에 대한 설명" rows="2"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">시작 날짜 *</label>
              <input type="date" class="form-input" v-model="form.startDate">
            </div>
            <div class="form-group">
              <label class="form-label">종료 날짜 *</label>
              <input type="date" class="form-input" v-model="form.endDate">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">반복 요일 (선택)</label>
            <div class="day-selector">
              <button
                v-for="(dayName, dayIdx) in weekdays"
                :key="dayIdx"
                type="button"
                class="day-btn"
                :class="{ active: selectedDays.includes(dayIdx) }"
                @click="toggleDay(dayIdx)"
              >
                {{ dayName }}
              </button>
            </div>
            <p class="form-hint">선택하면 매주 해당 요일에 반복됩니다</p>
          </div>
          <div class="form-group">
            <label class="form-label">표시 색상</label>
            <div class="color-picker-row">
              <button
                v-for="c in colorOptions"
                :key="c"
                type="button"
                class="color-dot"
                :class="{ active: form.color === c }"
                :style="{ background: c }"
                @click="form.color = c"
              ></button>
              <input type="color" class="color-custom" v-model="form.color" title="커스텀 색상">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">취소</button>
          <button class="btn-save" @click="saveSchedule" :disabled="!form.title || !form.startDate || !form.endDate">
            {{ editingSchedule ? '수정' : '추가' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'https://api.waitplay.co.kr'

const loading = ref(true)
const schedules = ref<any[]>([])
const showAddModal = ref(false)
const editingSchedule = ref<any>(null)

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

const scheduleTypes = [
  { value: 'closed', label: '휴무', icon: '🚫' },
  { value: 'event', label: '이벤트', icon: '🎉' },
  { value: 'notice', label: '공지', icon: '📢' },
  { value: 'hours_change', label: '시간변경', icon: '🕐' }
]

const colorOptions = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

const form = ref({
  scheduleType: 'closed',
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  isAllDay: true,
  color: '#ef4444',
  recurringDays: ''
})

const selectedDays = ref<number[]>([])

interface CalendarCell {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  dayOfWeek: number
  events: any[]
  isClosed: boolean
}

const calendarCells = computed<CalendarCell[]>(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const firstDay = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()
  const prevDays = new Date(y, m - 1, 0).getDate()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const cells: CalendarCell[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, isCurrentMonth: false, isToday: false, dayOfWeek: (firstDay - i - 1 + 7) % 7, events: [], isClosed: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dow = new Date(y, m - 1, d).getDay()
    const dayEvents = schedules.value.filter(s => dateStr >= s.startDate && dateStr <= s.endDate && s.isActive)
    cells.push({
      day: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      dayOfWeek: dow,
      events: dayEvents,
      isClosed: dayEvents.some(e => e.scheduleType === 'closed')
    })
  }

  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, isCurrentMonth: false, isToday: false, dayOfWeek: 0, events: [], isClosed: false })
  }

  return cells
})

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    closed: '#ef4444',
    event: '#3b82f6',
    notice: '#22c55e',
    hours_change: '#f97316'
  }
  return colors[type] || '#6b7280'
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    closed: '휴무',
    event: '이벤트',
    notice: '공지',
    hours_change: '시간변경'
  }
  return labels[type] || type
}

function getTitlePlaceholder(type: string): string {
  const placeholders: Record<string, string> = {
    closed: '예: 정기 휴무, 명절 휴무',
    event: '예: 봄맞이 할인 이벤트',
    notice: '예: 메뉴 변경 안내',
    hours_change: '예: 주말 단축 영업'
  }
  return placeholders[type] || '일정 제목'
}

function formatRecurringDays(days: string): string {
  if (!days) return ''
  return days.split(',').map(d => weekdays[parseInt(d)]).join(', ')
}

function toggleDay(dayIdx: number) {
  const idx = selectedDays.value.indexOf(dayIdx)
  if (idx === -1) {
    selectedDays.value.push(dayIdx)
  } else {
    selectedDays.value.splice(idx, 1)
  }
  selectedDays.value.sort()
  form.value.recurringDays = selectedDays.value.join(',')
}

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

async function loadSchedules() {
  try {
    loading.value = true
    const params = `?year=${currentYear.value}&month=${currentMonth.value}`
    const response = await fetch(`${API_URL}/api/calendar/schedules${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      console.error('API 에러 상세:', response.status, errBody)
      throw new Error(errBody.detail || errBody.message || 'Failed')
    }
    schedules.value = await response.json()
  } catch (error) {
    console.error('일정 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

async function saveSchedule() {
  try {
    const url = editingSchedule.value
      ? `${API_URL}/api/calendar/schedules/${editingSchedule.value.id}`
      : `${API_URL}/api/calendar/schedules`

    const body = { ...form.value }
    if (!body.recurringDays) body.recurringDays = null as any

    const response = await fetch(url, {
      method: editingSchedule.value ? 'PUT' : 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || '저장 실패')
    }

    closeModal()
    await loadSchedules()
  } catch (error: any) {
    alert(error.message || '일정 저장에 실패했습니다')
  }
}

function editSchedule(schedule: any) {
  editingSchedule.value = schedule
  form.value = {
    scheduleType: schedule.scheduleType,
    title: schedule.title,
    description: schedule.description || '',
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    isAllDay: schedule.isAllDay,
    color: schedule.color || getTypeColor(schedule.scheduleType),
    recurringDays: schedule.recurringDays || ''
  }
  selectedDays.value = schedule.recurringDays
    ? schedule.recurringDays.split(',').map(Number)
    : []
}

async function confirmDelete(schedule: any) {
  if (!confirm(`"${schedule.title}" 일정을 삭제하시겠습니까?`)) return

  try {
    const response = await fetch(`${API_URL}/api/calendar/schedules/${schedule.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    await loadSchedules()
  } catch {
    alert('삭제에 실패했습니다')
  }
}

function closeModal() {
  showAddModal.value = false
  editingSchedule.value = null
  selectedDays.value = []
  form.value = {
    scheduleType: 'closed',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isAllDay: true,
    color: '#ef4444',
    recurringDays: ''
  }
}

onMounted(() => {
  loadSchedules()
})

watch([currentYear, currentMonth], () => {
  loadSchedules()
})
</script>

<style scoped>
.tab-content {
  padding: 50px 60px;
  background-color: #f5f5f7;
  min-height: 100vh;
  color: #1d1d1f;
  font-family: 'Noto Sans KR', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
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

.btn-add {
  padding: 10px 20px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-add:hover {
  background: #4338ca;
}

/* Month Navigation */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: #f3f4f6;
}

.nav-label {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  min-width: 130px;
  text-align: center;
}

/* Mini Calendar */
.mini-calendar {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.cal-weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  padding: 4px 0;
}

.cal-weekday.sun { color: #ef4444; }
.cal-weekday.sat { color: #3b82f6; }

.cal-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-day {
  position: relative;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  gap: 2px;
}

.cal-day.other-month {
  opacity: 0.25;
}

.cal-day.today .cal-day-num {
  background: #4f46e5;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cal-day.is-closed {
  background: #fef2f2;
}

.cal-day.is-sunday .cal-day-num { color: #ef4444; }
.cal-day.is-saturday .cal-day-num { color: #3b82f6; }

.cal-day-num {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.cal-dot-row {
  display: flex;
  gap: 2px;
}

.cal-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

/* Schedule Section */
.schedule-section {
  margin-top: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.btn-add-small {
  margin-top: 12px;
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #4f46e5;
  font-weight: 600;
  cursor: pointer;
}

.schedule-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.schedule-card {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.schedule-card.inactive {
  opacity: 0.5;
}

.schedule-color-bar {
  width: 4px;
  flex-shrink: 0;
}

.schedule-info {
  flex: 1;
  padding: 12px 16px;
  min-width: 0;
}

.schedule-top {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}

.schedule-type-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.type-closed { background: #fef2f2; color: #dc2626; }
.type-event { background: #eff6ff; color: #2563eb; }
.type-notice { background: #f0fdf4; color: #16a34a; }
.type-hours_change { background: #fff7ed; color: #ea580c; }

.inactive-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f3f4f6;
  color: #6b7280;
}

.schedule-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.schedule-date {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
  font-variant-numeric: tabular-nums;
}

.schedule-desc {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 4px;
}

.schedule-recurring {
  font-size: 12px;
  color: #3b82f6;
  margin-top: 4px;
}

.schedule-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 8px;
}

.btn-icon {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 6px;
}

.btn-icon:hover {
  background: #f3f4f6;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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
  max-width: 520px;
  margin: 16px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
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
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  position: sticky;
  bottom: 0;
  background: white;
}

/* Form */
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

.form-input, .form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.form-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

/* Type Selector */
.type-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.2s;
}

.type-btn.active {
  border-color: #4f46e5;
  color: #4f46e5;
  background: #eef2ff;
}

.type-icon {
  font-size: 20px;
}

/* Day Selector */
.day-selector {
  display: flex;
  gap: 4px;
}

.day-btn {
  flex: 1;
  padding: 8px 0;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.day-btn.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

/* Color Picker */
.color-picker-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-dot.active {
  border-color: #1f2937;
  transform: scale(1.15);
}

.color-custom {
  width: 28px;
  height: 28px;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
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
  .tab-content { padding: 30px 20px; }

  .schedule-list {
    grid-template-columns: 1fr;
  }

  .type-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
