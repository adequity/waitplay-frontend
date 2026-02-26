<template>
  <div class="calendar-block" :class="`calendar-block--${data.style}`">
    <h3 v-if="data.title" class="calendar-title" :style="{ color: titleColorValue }">{{ data.title }}</h3>

    <!-- Full / Compact Calendar View -->
    <template v-if="data.style === 'full' || data.style === 'compact'">
      <div class="calendar-nav">
        <button class="nav-btn" @click="prevMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="nav-label" :style="{ color: titleColorValue }">{{ currentYear }}년 {{ currentMonth }}월</span>
        <button class="nav-btn" @click="nextMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <div class="calendar-grid">
        <div class="calendar-weekdays">
          <span v-for="day in weekdays" :key="day" class="weekday" :class="{ 'weekday-sun': day === '일', 'weekday-sat': day === '토' }">{{ day }}</span>
        </div>
        <div class="calendar-days">
          <template v-for="(cell, idx) in calendarCells" :key="idx">
            <!-- 주 구분선: 매 7개마다 (첫 줄 제외) -->
            <div v-if="idx > 0 && idx % 7 === 0" class="week-separator"></div>
            <div
              class="day-cell"
              :class="{
                'other-month': !cell.isCurrentMonth,
                'today': cell.isToday,
                'selected': selectedDate && selectedDate.day === cell.day && selectedDate.month === cell.month && cell.isCurrentMonth,
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
              <div v-if="!cell.isPast" class="day-indicators">
                <span v-if="cell.holiday" class="indicator-dot indicator-holiday" :style="{ backgroundColor: data.closedDayColor || '#FF3B30' }"></span>
                <span v-for="(sched, si) in cell.schedules.slice(0, 2)" :key="si" class="indicator-dot indicator-schedule" :style="{ backgroundColor: sched.color || data.highlightColor || '#007AFF' }"></span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 선택된 날짜 이벤트 목록 -->
      <div v-if="selectedDate" class="event-list">
        <div class="event-list-header">
          <span class="event-list-date">{{ selectedDate.month }}월 {{ selectedDate.day }}일</span>
          <button class="event-list-close" @click="selectedDate = null">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div v-if="selectedDate.holiday" class="event-item">
          <div class="event-color-bar" :style="{ backgroundColor: data.closedDayColor || '#FF3B30' }"></div>
          <div class="event-info">
            <span class="event-title">{{ selectedDate.holiday }}</span>
            <span class="event-label">공휴일</span>
          </div>
        </div>
        <div v-for="sched in selectedDate.schedules" :key="sched.id" class="event-item">
          <div class="event-color-bar" :style="{ backgroundColor: sched.color || data.highlightColor || '#007AFF' }"></div>
          <div class="event-info">
            <span class="event-title">{{ sched.title }}</span>
            <span v-if="sched.scheduleType === 'closed'" class="event-label label-closed">휴무</span>
            <span v-else-if="sched.scheduleType === 'event'" class="event-label label-event">이벤트</span>
            <span v-else-if="sched.scheduleType === 'hours_change'" class="event-label label-hours">시간변경</span>
          </div>
        </div>
        <div v-if="!selectedDate.holiday && selectedDate.schedules.length === 0" class="event-empty">
          일정이 없습니다
        </div>
      </div>
    </template>

    <!-- Week View (이번주 캘린더) -->
    <template v-if="data.style === 'week'">
      <div class="calendar-grid">
        <div class="calendar-weekdays">
          <span v-for="day in weekdays" :key="day" class="weekday" :class="{ 'weekday-sun': day === '일', 'weekday-sat': day === '토' }">{{ day }}</span>
        </div>
        <div class="calendar-days week-rows">
          <template v-for="(cell, idx) in weekCells" :key="idx">
            <div v-if="idx === 7" class="week-separator"></div>
            <div
              class="day-cell"
              :class="{
                'today': cell.isToday,
                'selected': selectedDate && selectedDate.day === cell.day && selectedDate.month === cell.month,
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
              <div class="day-indicators">
                <span v-if="cell.holiday" class="indicator-dot indicator-holiday" :style="{ backgroundColor: data.closedDayColor || '#FF3B30' }"></span>
                <span v-for="(sched, si) in cell.schedules.slice(0, 2)" :key="si" class="indicator-dot indicator-schedule" :style="{ backgroundColor: sched.color || data.highlightColor || '#007AFF' }"></span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 이번주/다음주 일정 목록 -->
      <div class="event-list">
        <div v-if="weekEvents.length === 0" class="event-empty">
          예정된 일정이 없습니다
        </div>
        <div v-for="event in weekEvents" :key="event.id" class="event-item">
          <div class="event-color-bar" :style="{ backgroundColor: getEventColor(event) }"></div>
          <div class="event-info">
            <span class="event-title">{{ event.title }}</span>
            <span class="event-meta">{{ event.day }}일 ({{ event.weekday }})</span>
          </div>
          <span class="event-badge" :class="`badge-${event.type}`">{{ event.typeLabel }}</span>
        </div>
      </div>

      <!-- 선택된 날짜 상세 (week) -->
      <div v-if="selectedDate" class="event-list selected-detail">
        <div class="event-list-header">
          <span class="event-list-date">{{ selectedDate.month }}월 {{ selectedDate.day }}일</span>
          <button class="event-list-close" @click="selectedDate = null">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div v-if="selectedDate.holiday" class="event-item">
          <div class="event-color-bar" :style="{ backgroundColor: data.closedDayColor || '#FF3B30' }"></div>
          <div class="event-info">
            <span class="event-title">{{ selectedDate.holiday }}</span>
            <span class="event-label">공휴일</span>
          </div>
        </div>
        <div v-for="sched in selectedDate.schedules" :key="sched.id" class="event-item">
          <div class="event-color-bar" :style="{ backgroundColor: sched.color || data.highlightColor || '#007AFF' }"></div>
          <div class="event-info">
            <span class="event-title">{{ sched.title }}</span>
            <span v-if="sched.scheduleType === 'closed'" class="event-label label-closed">휴무</span>
            <span v-else-if="sched.scheduleType === 'event'" class="event-label label-event">이벤트</span>
            <span v-else-if="sched.scheduleType === 'hours_change'" class="event-label label-hours">시간변경</span>
          </div>
        </div>
        <div v-if="!selectedDate.holiday && selectedDate.schedules.length === 0" class="event-empty">
          일정이 없습니다
        </div>
      </div>
    </template>

    <!-- List View -->
    <template v-if="data.style === 'list'">
      <div class="calendar-nav">
        <button class="nav-btn" @click="prevMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="nav-label" :style="{ color: titleColorValue }">{{ currentYear }}년 {{ currentMonth }}월</span>
        <button class="nav-btn" @click="nextMonth">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <div class="event-list">
        <div v-if="filteredEvents.length === 0" class="event-empty">
          {{ data.futureOnly ? '예정된 일정이 없습니다' : '이번 달 일정이 없습니다' }}
        </div>
        <div v-for="event in filteredEvents" :key="event.id" class="event-item">
          <div class="event-color-bar" :style="{ backgroundColor: getEventColor(event) }"></div>
          <div class="event-info">
            <span class="event-title">{{ event.title }}</span>
            <span class="event-meta">{{ event.day }}일 ({{ event.weekday }})</span>
            <span v-if="event.description" class="event-desc">{{ event.description }}</span>
          </div>
          <span class="event-badge" :class="`badge-${event.type}`">{{ event.typeLabel }}</span>
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

function getEventColor(event: ListEvent): string {
  if (event.type === 'holiday') return props.data.closedDayColor || '#FF3B30'
  return props.data.highlightColor || '#007AFF'
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
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.calendar-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
  letter-spacing: -0.3px;
}

/* Navigation */
.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
}

.nav-btn {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8E8E93;
  transition: background 0.15s;
}

.nav-btn:hover {
  background: rgba(142, 142, 147, 0.12);
}

.nav-btn:active {
  background: rgba(142, 142, 147, 0.2);
}

.nav-label {
  font-size: 17px;
  font-weight: 600;
  min-width: 130px;
  text-align: center;
  letter-spacing: -0.2px;
}

/* Calendar Grid */
.calendar-grid {
  background: transparent;
  border-radius: 0;
  overflow: visible;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.weekday-sun {
  color: #FF3B30;
}

.weekday-sat {
  color: #007AFF;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

/* Week separator line */
.week-separator {
  grid-column: 1 / -1;
  height: 1px;
  background: rgba(60, 60, 67, 0.08);
  margin: 2px 0;
}

.day-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 0;
  cursor: pointer;
  transition: opacity 0.15s;
  gap: 3px;
}

.day-cell:active {
  opacity: 0.6;
}

.day-cell.other-month {
  opacity: 0.25;
}

.day-cell.is-past {
  opacity: 0.3;
}

/* Date number */
.day-number {
  font-size: 16px;
  font-weight: 400;
  color: #1C1C1E;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  line-height: 1;
  letter-spacing: -0.2px;
}

/* Today: black circle with white text */
.day-cell.today .day-number {
  background: #1C1C1E;
  color: #FFFFFF;
  font-weight: 600;
}

/* Selected: iOS blue ring */
.day-cell.selected .day-number {
  background: #007AFF;
  color: #FFFFFF;
  font-weight: 600;
}

.day-cell.is-sunday .day-number {
  color: #FF3B30;
}

.day-cell.is-saturday .day-number {
  color: #007AFF;
}

.day-cell.today.is-sunday .day-number,
.day-cell.today.is-saturday .day-number,
.day-cell.selected.is-sunday .day-number,
.day-cell.selected.is-saturday .day-number {
  color: #FFFFFF;
}

.day-cell.has-holiday .day-number,
.day-cell.is-closed .day-number {
  color: #FF3B30;
  font-weight: 600;
}

.day-cell.today.has-holiday .day-number,
.day-cell.selected.has-holiday .day-number {
  color: #FFFFFF;
}

/* Indicator dots */
.day-indicators {
  display: flex;
  gap: 3px;
  height: 5px;
  align-items: center;
  justify-content: center;
}

.indicator-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Event list (selected date detail / list view) */
.event-list {
  margin-top: 16px;
}

.event-list.selected-detail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(60, 60, 67, 0.08);
}

.event-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.event-list-date {
  font-weight: 600;
  font-size: 15px;
  color: #1C1C1E;
  letter-spacing: -0.2px;
}

.event-list-close {
  border: none;
  background: none;
  color: #8E8E93;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.15s;
}

.event-list-close:hover {
  background: rgba(142, 142, 147, 0.12);
}

/* Event items with iOS color bar */
.event-item {
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px solid rgba(60, 60, 67, 0.06);
  min-height: 44px;
}

.event-item:last-child {
  border-bottom: none;
}

.event-color-bar {
  width: 4px;
  border-radius: 2px;
  flex-shrink: 0;
  align-self: stretch;
}

.event-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.event-title {
  font-size: 15px;
  font-weight: 500;
  color: #1C1C1E;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.2px;
}

.event-label {
  font-size: 12px;
  color: #8E8E93;
  letter-spacing: -0.1px;
}

.event-label.label-closed {
  color: #FF3B30;
}

.event-label.label-event {
  color: #007AFF;
}

.event-label.label-hours {
  color: #FF9500;
}

.event-meta {
  font-size: 12px;
  color: #8E8E93;
  letter-spacing: -0.1px;
}

.event-desc {
  font-size: 12px;
  color: #8E8E93;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 500;
  flex-shrink: 0;
  align-self: center;
  letter-spacing: -0.1px;
}

.event-badge.badge-holiday {
  background: rgba(255, 59, 48, 0.1);
  color: #FF3B30;
}

.event-badge.badge-closed {
  background: rgba(255, 59, 48, 0.1);
  color: #FF3B30;
}

.event-badge.badge-event {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

.event-badge.badge-notice {
  background: rgba(52, 199, 89, 0.1);
  color: #34C759;
}

.event-badge.badge-hours_change {
  background: rgba(255, 149, 0, 0.1);
  color: #FF9500;
}

.event-empty {
  text-align: center;
  padding: 24px 16px;
  color: #8E8E93;
  font-size: 14px;
  letter-spacing: -0.1px;
}

/* Week View */
.week-rows {
  grid-template-columns: repeat(7, 1fr);
}

/* Compact style */
.calendar-block--compact .day-cell {
  padding: 4px 0;
}

.calendar-block--compact .day-number {
  font-size: 14px;
  width: 28px;
  height: 28px;
}

.calendar-block--compact .calendar-title {
  font-size: 17px;
}

.calendar-block--compact .indicator-dot {
  width: 4px;
  height: 4px;
}

/* Week style */
.calendar-block--week .calendar-title {
  font-size: 18px;
  margin-bottom: 12px;
}

/* Responsive */
@media (max-width: 640px) {
  .calendar-block {
    padding: 12px;
  }

  .day-cell {
    padding: 4px 0;
  }

  .day-number {
    font-size: 14px;
    width: 28px;
    height: 28px;
  }

  .indicator-dot {
    width: 4px;
    height: 4px;
  }

  .event-title {
    font-size: 14px;
  }
}
</style>
