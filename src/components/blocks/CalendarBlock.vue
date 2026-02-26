<template>
  <div class="calendar-block" :class="`calendar-block--${data.style}`">
    <h3 v-if="data.title" class="calendar-title" :style="{ color: titleColorValue }">{{ data.title }}</h3>

    <!-- Full / Compact Calendar View -->
    <template v-if="data.style === 'full' || data.style === 'compact'">
      <div class="calendar-nav">
        <button class="nav-btn" @click="prevMonth">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="nav-label" :style="{ color: titleColorValue }">{{ currentYear }}년 {{ currentMonth }}월</span>
        <button class="nav-btn" @click="nextMonth">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <div class="calendar-grid">
        <div class="calendar-weekdays">
          <span v-for="day in weekdays" :key="day" class="weekday" :class="{ 'weekday-sun': day === '일', 'weekday-sat': day === '토' }">{{ day }}</span>
        </div>
        <div class="calendar-days">
          <div
            v-for="(cell, idx) in calendarCells"
            :key="idx"
            class="day-cell"
            :class="{
              'other-month': !cell.isCurrentMonth,
              'today': cell.isToday,
              'has-holiday': cell.holiday && !cell.isPast,
              'has-schedule': cell.schedules.length > 0 && !cell.isPast,
              'is-closed': cell.isClosed && !cell.isPast,
              'is-sunday': cell.dayOfWeek === 0,
              'is-saturday': cell.dayOfWeek === 6,
              'is-past': cell.isPast
            }"
            @click="cell.isCurrentMonth && selectDate(cell)"
          >
            <span class="day-number">{{ cell.day }}</span>
            <template v-if="!cell.isPast">
              <div v-if="cell.holiday" class="day-marker holiday-marker" :style="{ backgroundColor: data.closedDayColor || '#ef4444' }"></div>
              <div v-for="(sched, si) in cell.schedules.slice(0, 2)" :key="si" class="day-marker schedule-marker" :style="{ backgroundColor: sched.color || data.highlightColor || '#3b82f6' }"></div>
            </template>
          </div>
        </div>
      </div>

      <!-- 선택된 날짜 상세 -->
      <div v-if="selectedDate" class="selected-date-detail">
        <div class="detail-header">
          <span class="detail-date">{{ selectedDate.month }}월 {{ selectedDate.day }}일</span>
          <button class="detail-close" @click="selectedDate = null">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div v-if="selectedDate.holiday" class="detail-item holiday-item">
          <span class="detail-dot" :style="{ backgroundColor: data.closedDayColor || '#ef4444' }"></span>
          <span class="detail-text">{{ selectedDate.holiday }}</span>
          <span class="detail-badge badge-holiday">공휴일</span>
        </div>
        <div v-for="sched in selectedDate.schedules" :key="sched.id" class="detail-item">
          <span class="detail-dot" :style="{ backgroundColor: sched.color || data.highlightColor || '#3b82f6' }"></span>
          <span class="detail-text">{{ sched.title }}</span>
          <span v-if="sched.scheduleType === 'closed'" class="detail-badge badge-closed">휴무</span>
          <span v-else-if="sched.scheduleType === 'event'" class="detail-badge badge-event">이벤트</span>
          <span v-else-if="sched.scheduleType === 'hours_change'" class="detail-badge badge-hours">시간변경</span>
        </div>
        <div v-if="!selectedDate.holiday && selectedDate.schedules.length === 0" class="detail-empty">
          일정이 없습니다
        </div>
      </div>
    </template>

    <!-- Week View (이번주 캘린더) -->
    <template v-if="data.style === 'week'">
      <div class="week-grid">
        <div class="calendar-weekdays">
          <span v-for="day in weekdays" :key="day" class="weekday" :class="{ 'weekday-sun': day === '일', 'weekday-sat': day === '토' }">{{ day }}</span>
        </div>
        <div class="week-rows">
          <div
            v-for="(cell, idx) in weekCells"
            :key="idx"
            class="day-cell week-day-cell"
            :class="{
              'today': cell.isToday,
              'has-holiday': cell.holiday,
              'has-schedule': cell.schedules.length > 0,
              'is-closed': cell.isClosed,
              'is-sunday': cell.dayOfWeek === 0,
              'is-saturday': cell.dayOfWeek === 6,
              'other-month': !cell.isSameMonth
            }"
            @click="selectDate(cell)"
          >
            <span class="day-number">{{ cell.day }}</span>
            <div v-if="cell.holiday" class="day-marker holiday-marker" :style="{ backgroundColor: data.closedDayColor || '#ef4444' }"></div>
            <div v-for="(sched, si) in cell.schedules.slice(0, 2)" :key="si" class="day-marker schedule-marker" :style="{ backgroundColor: sched.color || data.highlightColor || '#3b82f6' }"></div>
          </div>
        </div>
      </div>

      <!-- 이번주/다음주 일정 목록 -->
      <div class="week-events">
        <div v-if="weekEvents.length === 0" class="list-empty">
          예정된 일정이 없습니다
        </div>
        <div v-for="event in weekEvents" :key="event.id" class="list-item">
          <div class="list-date">
            <span class="list-day">{{ event.day }}</span>
            <span class="list-weekday">{{ event.weekday }}</span>
          </div>
          <div class="list-content">
            <div class="list-title">{{ event.title }}</div>
            <div v-if="event.description" class="list-desc">{{ event.description }}</div>
          </div>
          <span class="list-badge" :class="`badge-${event.type}`">
            {{ event.typeLabel }}
          </span>
        </div>
      </div>

      <!-- 선택된 날짜 상세 (week) -->
      <div v-if="selectedDate" class="selected-date-detail">
        <div class="detail-header">
          <span class="detail-date">{{ selectedDate.month }}월 {{ selectedDate.day }}일</span>
          <button class="detail-close" @click="selectedDate = null">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div v-if="selectedDate.holiday" class="detail-item holiday-item">
          <span class="detail-dot" :style="{ backgroundColor: data.closedDayColor || '#ef4444' }"></span>
          <span class="detail-text">{{ selectedDate.holiday }}</span>
          <span class="detail-badge badge-holiday">공휴일</span>
        </div>
        <div v-for="sched in selectedDate.schedules" :key="sched.id" class="detail-item">
          <span class="detail-dot" :style="{ backgroundColor: sched.color || data.highlightColor || '#3b82f6' }"></span>
          <span class="detail-text">{{ sched.title }}</span>
          <span v-if="sched.scheduleType === 'closed'" class="detail-badge badge-closed">휴무</span>
          <span v-else-if="sched.scheduleType === 'event'" class="detail-badge badge-event">이벤트</span>
          <span v-else-if="sched.scheduleType === 'hours_change'" class="detail-badge badge-hours">시간변경</span>
        </div>
        <div v-if="!selectedDate.holiday && selectedDate.schedules.length === 0" class="detail-empty">
          일정이 없습니다
        </div>
      </div>
    </template>

    <!-- List View -->
    <template v-if="data.style === 'list'">
      <div class="calendar-nav">
        <button class="nav-btn" @click="prevMonth">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="nav-label" :style="{ color: titleColorValue }">{{ currentYear }}년 {{ currentMonth }}월</span>
        <button class="nav-btn" @click="nextMonth">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <div class="schedule-list">
        <div v-if="filteredEvents.length === 0" class="list-empty">
          {{ data.futureOnly ? '예정된 일정이 없습니다' : '이번 달 일정이 없습니다' }}
        </div>
        <div v-for="event in filteredEvents" :key="event.id" class="list-item">
          <div class="list-date">
            <span class="list-day">{{ event.day }}</span>
            <span class="list-weekday">{{ event.weekday }}</span>
          </div>
          <div class="list-content">
            <div class="list-title">{{ event.title }}</div>
            <div v-if="event.description" class="list-desc">{{ event.description }}</div>
          </div>
          <span class="list-badge" :class="`badge-${event.type}`">
            {{ event.typeLabel }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { CalendarBlockData } from '@/types/blocks'

interface Props {
  data: CalendarBlockData
  qrCodeId?: string
  textColor?: string
  isPreview?: boolean
}

const props = defineProps<Props>()

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.waitplay.co.kr'

interface HolidayItem {
  id: string
  date: string
  name: string
  description?: string
  isRecurring: boolean
}

interface ScheduleItem {
  id: string
  scheduleType: string
  title: string
  description?: string
  startDate: string
  endDate: string
  color?: string
}

interface CalendarCell {
  day: number
  month: number
  year: number
  isCurrentMonth: boolean
  isSameMonth?: boolean
  isToday: boolean
  isPast: boolean
  dayOfWeek: number
  holiday: string | null
  isClosed: boolean
  schedules: ScheduleItem[]
  dateStr: string
}

interface SelectedDateInfo {
  day: number
  month: number
  holiday: string | null
  schedules: ScheduleItem[]
}

interface ListEvent {
  id: string
  day: number
  weekday: string | undefined
  title: string
  description?: string
  type: string
  typeLabel: string
  dateStr: string
}

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const holidays = ref<HolidayItem[]>([])
const schedules = ref<ScheduleItem[]>([])
const selectedDate = ref<SelectedDateInfo | null>(null)

// week 모드용: 추가 월 데이터
const nextMonthHolidays = ref<HolidayItem[]>([])
const nextMonthSchedules = ref<ScheduleItem[]>([])

const weekdays = ['일', '월', '화', '수', '목', '금', '토']
const weekdayNames = ['일', '월', '화', '수', '목', '금', '토']

const titleColorValue = computed(() => {
  return props.data.titleColor || props.textColor || undefined
})

const todayStr = computed(() => {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
})

function makeDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function getHolidayForDate(dateStr: string): string | null {
  const allH = [...holidays.value, ...nextMonthHolidays.value]
  const h = allH.find(h => h.date === dateStr)
  return h?.name || null
}

function getSchedulesForDate(dateStr: string): ScheduleItem[] {
  const allS = [...schedules.value, ...nextMonthSchedules.value]
  return allS.filter(s => dateStr >= s.startDate && dateStr <= s.endDate)
}

const calendarCells = computed<CalendarCell[]>(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const firstDay = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()
  const prevMonthDays = new Date(y, m - 1, 0).getDate()

  const cells: CalendarCell[] = []
  const isFutureOnly = props.data.futureOnly

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const pm = m - 1 || 12
    const py = m === 1 ? y - 1 : y
    const dateStr = makeDateStr(py, pm, day)
    cells.push({
      day,
      month: pm,
      year: py,
      isCurrentMonth: false,
      isToday: false,
      isPast: false,
      dayOfWeek: (firstDay - i - 1 + 7) % 7,
      holiday: null,
      isClosed: false,
      schedules: [],
      dateStr
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = makeDateStr(y, m, d)
    const dayOfWeek = new Date(y, m - 1, d).getDay()
    const isPast = isFutureOnly ? dateStr < todayStr.value : false

    const holiday = isPast ? null : (holidays.value.find(h => h.date === dateStr)?.name || null)
    const daySchedules = isPast ? [] : schedules.value.filter(s => dateStr >= s.startDate && dateStr <= s.endDate)
    const isClosed = daySchedules.some(s => s.scheduleType === 'closed')

    cells.push({
      day: d,
      month: m,
      year: y,
      isCurrentMonth: true,
      isToday: dateStr === todayStr.value,
      isPast,
      dayOfWeek,
      holiday,
      isClosed,
      schedules: daySchedules,
      dateStr
    })
  }

  // Next month days
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const nm = m + 1 > 12 ? 1 : m + 1
    const ny = m === 12 ? y + 1 : y
    const dateStr = makeDateStr(ny, nm, d)
    cells.push({
      day: d,
      month: nm,
      year: ny,
      isCurrentMonth: false,
      isToday: false,
      isPast: false,
      dayOfWeek: (firstDay + daysInMonth + d - 1) % 7,
      holiday: null,
      isClosed: false,
      schedules: [],
      dateStr
    })
  }

  return cells
})

// Week mode: 이번주 + 다음주 14일 셀
const weekCells = computed<CalendarCell[]>(() => {
  const today = new Date()
  const todayDay = today.getDay() // 0=일 ~ 6=토
  // 이번주 일요일로 이동
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - todayDay)

  const cells: CalendarCell[] = []
  const thisMonth = today.getMonth() + 1

  for (let i = 0; i < 14; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const day = d.getDate()
    const dateStr = makeDateStr(y, m, day)
    const dayOfWeek = d.getDay()

    const holiday = getHolidayForDate(dateStr)
    const daySchedules = getSchedulesForDate(dateStr)
    const isClosed = daySchedules.some(s => s.scheduleType === 'closed')

    cells.push({
      day,
      month: m,
      year: y,
      isCurrentMonth: true,
      isSameMonth: m === thisMonth,
      isToday: dateStr === todayStr.value,
      isPast: false,
      dayOfWeek,
      holiday,
      isClosed,
      schedules: daySchedules,
      dateStr
    })
  }

  return cells
})

// Week mode: 이번주/다음주 일정 목록
const weekEvents = computed<ListEvent[]>(() => {
  const events: ListEvent[] = []
  const typeLabels: Record<string, string> = {
    closed: '휴무',
    event: '이벤트',
    notice: '공지',
    hours_change: '시간변경'
  }

  for (const cell of weekCells.value) {
    if (cell.holiday && props.data.showPublicHolidays) {
      events.push({
        id: `wh-${cell.dateStr}`,
        day: cell.day,
        weekday: weekdayNames[cell.dayOfWeek],
        title: cell.holiday,
        type: 'holiday',
        typeLabel: '공휴일',
        dateStr: cell.dateStr
      })
    }
    if (props.data.showStoreSchedules) {
      for (const s of cell.schedules) {
        // 중복 방지: startDate 기준으로만 추가
        if (s.startDate === cell.dateStr || (cell.dateStr >= s.startDate && cell.dateStr <= s.endDate && !events.some(e => e.id === `ws-${s.id}`))) {
          if (!events.some(e => e.id === `ws-${s.id}`)) {
            events.push({
              id: `ws-${s.id}`,
              day: new Date(s.startDate).getDate(),
              weekday: weekdayNames[new Date(s.startDate).getDay()],
              title: s.title,
              description: s.description,
              type: s.scheduleType,
              typeLabel: typeLabels[s.scheduleType] || s.scheduleType,
              dateStr: s.startDate
            })
          }
        }
      }
    }
  }

  return events.sort((a, b) => a.dateStr.localeCompare(b.dateStr))
})

const allEvents = computed<ListEvent[]>(() => {
  const events: ListEvent[] = []

  if (props.data.showPublicHolidays) {
    for (const h of holidays.value) {
      const d = new Date(h.date)
      events.push({
        id: `h-${h.id}`,
        day: d.getDate(),
        weekday: weekdayNames[d.getDay()],
        title: h.name,
        description: h.description,
        type: 'holiday',
        typeLabel: '공휴일',
        dateStr: h.date
      })
    }
  }

  if (props.data.showStoreSchedules) {
    for (const s of schedules.value) {
      const d = new Date(s.startDate)
      const typeLabels: Record<string, string> = {
        closed: '휴무',
        event: '이벤트',
        notice: '공지',
        hours_change: '시간변경'
      }
      events.push({
        id: `s-${s.id}`,
        day: d.getDate(),
        weekday: weekdayNames[d.getDay()],
        title: s.title,
        description: s.description,
        type: s.scheduleType,
        typeLabel: typeLabels[s.scheduleType] || s.scheduleType,
        dateStr: s.startDate
      })
    }
  }

  return events.sort((a, b) => a.dateStr.localeCompare(b.dateStr))
})

// futureOnly 필터 적용된 이벤트 목록 (list 모드용)
const filteredEvents = computed(() => {
  if (!props.data.futureOnly) return allEvents.value
  return allEvents.value.filter(e => e.dateStr >= todayStr.value)
})

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

function selectDate(cell: CalendarCell) {
  selectedDate.value = {
    day: cell.day,
    month: cell.month,
    holiday: cell.holiday,
    schedules: cell.schedules
  }
}

async function loadCalendarData() {
  if (!props.qrCodeId || props.isPreview) return

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(props.qrCodeId)
    const endpoint = isUuid
      ? `${API_BASE_URL}/api/calendar/data/${props.qrCodeId}`
      : `${API_BASE_URL}/api/calendar/data/by-code/${encodeURIComponent(props.qrCodeId)}`
    const res = await fetch(
      `${endpoint}?year=${currentYear.value}&month=${currentMonth.value}`
    )
    if (res.ok) {
      const data = await res.json()
      holidays.value = data.publicHolidays || []
      schedules.value = data.storeSchedules || []
    }
  } catch (e) {
    console.error('[CalendarBlock] Failed to load calendar data:', e)
  }

  // week 모드일 때 다음달 데이터도 로드 (2주가 월을 걸칠 수 있음)
  if (props.data.style === 'week') {
    await loadNextMonthData()
  }
}

async function loadNextMonthData() {
  if (!props.qrCodeId || props.isPreview) return

  const today = new Date()
  const thisMonth = today.getMonth() + 1
  const thisYear = today.getFullYear()

  // 다음달과 이번달이 다를 때만
  const nextM = thisMonth === 12 ? 1 : thisMonth + 1
  const nextY = thisMonth === 12 ? thisYear + 1 : thisYear

  // 이번주+다음주가 다음달에 걸치는지 확인
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() - today.getDay() + 13) // 다음주 토요일
  if (endOfWeek.getMonth() + 1 !== thisMonth) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(props.qrCodeId!)
      const endpoint = isUuid
        ? `${API_BASE_URL}/api/calendar/data/${props.qrCodeId}`
        : `${API_BASE_URL}/api/calendar/data/by-code/${encodeURIComponent(props.qrCodeId!)}`
      const res = await fetch(
        `${endpoint}?year=${nextY}&month=${nextM}`
      )
      if (res.ok) {
        const data = await res.json()
        nextMonthHolidays.value = data.publicHolidays || []
        nextMonthSchedules.value = data.storeSchedules || []
      }
    } catch (e) {
      // silent
    }
  }
}

onMounted(() => {
  loadCalendarData()
})

watch([currentYear, currentMonth], () => {
  selectedDate.value = null
  loadCalendarData()
})
</script>

<style scoped>
.calendar-block {
  padding: 1rem;
}

.calendar-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
}

/* Navigation */
.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: background 0.2s;
}

.nav-btn:hover {
  background: rgba(255,255,255,0.2);
}

.nav-label {
  font-size: 16px;
  font-weight: 600;
  min-width: 120px;
  text-align: center;
}

/* Calendar Grid */
.calendar-grid {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.weekday {
  padding: 8px 0;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.weekday-sun {
  color: #ef4444;
}

.weekday-sat {
  color: #3b82f6;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day-cell {
  position: relative;
  min-height: 44px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  border-right: 1px solid #f3f4f6;
  transition: background 0.15s;
}

.day-cell:hover {
  background: #f9fafb;
}

.day-cell.other-month {
  opacity: 0.3;
}

.day-cell.is-past {
  opacity: 0.35;
}

.day-cell.today .day-number {
  background: #4f46e5;
  color: #fff;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell.is-sunday .day-number {
  color: #ef4444;
}

.day-cell.is-saturday .day-number {
  color: #3b82f6;
}

.day-cell.has-holiday .day-number,
.day-cell.is-closed .day-number {
  color: #ef4444;
  font-weight: 700;
}

.day-number {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  line-height: 1;
}

.day-marker {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* Selected Date Detail */
.selected-date-detail {
  margin-top: 12px;
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detail-date {
  font-weight: 600;
  font-size: 15px;
  color: #1f2937;
}

.detail-close {
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-close:hover {
  color: #6b7280;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.detail-text {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.detail-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.badge-holiday {
  background: #fef2f2;
  color: #ef4444;
}

.badge-closed {
  background: #fef2f2;
  color: #dc2626;
}

.badge-event {
  background: #eff6ff;
  color: #2563eb;
}

.badge-hours {
  background: #fff7ed;
  color: #ea580c;
}

.detail-empty {
  text-align: center;
  padding: 12px;
  color: #9ca3af;
  font-size: 14px;
}

/* Week View */
.week-grid {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.week-rows {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.week-day-cell {
  min-height: 48px;
}

.week-events {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* List View */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-empty {
  text-align: center;
  padding: 32px 16px;
  color: #9ca3af;
  font-size: 14px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.list-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 44px;
}

.list-day {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.list-weekday {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.list-content {
  flex: 1;
  min-width: 0;
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.list-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.list-badge.badge-holiday {
  background: #fef2f2;
  color: #ef4444;
}

.list-badge.badge-closed {
  background: #fef2f2;
  color: #dc2626;
}

.list-badge.badge-event {
  background: #eff6ff;
  color: #2563eb;
}

.list-badge.badge-notice {
  background: #f0fdf4;
  color: #16a34a;
}

.list-badge.badge-hours_change {
  background: #fff7ed;
  color: #ea580c;
}

/* Compact style */
.calendar-block--compact .day-cell {
  min-height: 36px;
}

.calendar-block--compact .day-number {
  font-size: 12px;
}

.calendar-block--compact .calendar-title {
  font-size: 16px;
}

/* Week style */
.calendar-block--week .calendar-title {
  font-size: 18px;
  margin-bottom: 12px;
}

@media (max-width: 640px) {
  .day-cell {
    min-height: 38px;
    padding: 2px;
  }

  .day-number {
    font-size: 12px;
  }

  .day-marker {
    width: 4px;
    height: 4px;
  }
}
</style>
