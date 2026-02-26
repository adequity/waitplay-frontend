<template>
  <div class="calendar-block" :class="[`calendar-block--${data.style}`, { 'calendar-dark': isDarkTheme }]">
    <!-- iOS 대형 타이틀 -->
    <header v-if="data.title" class="calendar-header">
      <h1 :style="{ color: titleColorValue }">{{ data.title }}</h1>
    </header>

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
        <div class="weekdays">
          <span v-for="day in weekdays" :key="day">{{ day }}</span>
        </div>

        <div class="weeks">
          <div
            v-for="(week, wi) in calendarWeeks"
            :key="wi"
            class="week-row"
          >
            <div
              v-for="(cell, di) in week"
              :key="di"
              class="day-cell"
              :class="{
                'empty': !cell,
                'other-month': cell && !cell.isCurrentMonth,
                'today': cell && cell.isToday,
                'selected': cell && selectedDate && selectedDate.day === cell.day && selectedDate.month === cell.month && cell.isCurrentMonth,
                'sunday': cell && cell.dayOfWeek === 0,
                'text-red': cell && cell.holiday && !cell.isPast,
                'is-past': cell && cell.isPast
              }"
              @click="cell && cell.isCurrentMonth && selectDate(cell)"
            >
              <template v-if="cell">
                <span class="date-text">{{ cell.day }}</span>
                <template v-if="!cell.isPast">
                  <!-- pill: 다일 일정 (2일 이상) / dot: 단일 일정 -->
                  <div v-if="cell.holiday" class="indicator pill" :style="{ backgroundColor: data.closedDayColor || '#FF3B30' }"></div>
                  <template v-else>
                    <div
                      v-for="(sched, si) in cell.schedules.slice(0, 1)"
                      :key="si"
                      class="indicator"
                      :class="isMultiDaySchedule(sched) ? 'pill' : 'dot'"
                      :style="{ backgroundColor: sched.color || data.highlightColor || '#32ADE6' }"
                    ></div>
                  </template>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 선택된 날짜 이벤트 목록 -->
      <div v-if="selectedDate" class="event-list-container">
        <div v-if="selectedDate.holiday" class="event-item">
          <div class="event-color-bar" :style="{ backgroundColor: data.closedDayColor || '#FF3B30' }"></div>
          <div class="event-details">
            <h3 class="event-title">{{ selectedDate.holiday }}</h3>
            <p class="event-location">공휴일</p>
          </div>
        </div>
        <div v-for="sched in selectedDate.schedules" :key="sched.id" class="event-item">
          <div class="event-color-bar" :style="{ backgroundColor: sched.color || data.highlightColor || '#32ADE6' }"></div>
          <div class="event-details">
            <h3 class="event-title">{{ sched.title }}</h3>
            <p v-if="sched.description" class="event-location">{{ sched.description }}</p>
            <p v-else class="event-location">{{ getScheduleTypeLabel(sched.scheduleType) }}</p>
          </div>
        </div>
        <div v-if="!selectedDate.holiday && selectedDate.schedules.length === 0" class="event-item-empty">
          일정이 없습니다
        </div>
      </div>
    </template>

    <!-- Week View (이번주 캘린더) -->
    <template v-if="data.style === 'week'">
      <div class="calendar-grid">
        <div class="weekdays">
          <span v-for="day in weekdays" :key="day">{{ day }}</span>
        </div>
        <div class="weeks">
          <div class="week-row">
            <div
              v-for="(cell, idx) in weekCells.slice(0, 7)"
              :key="idx"
              class="day-cell"
              :class="{
                'today': cell.isToday,
                'selected': selectedDate && selectedDate.day === cell.day && selectedDate.month === cell.month,
                'sunday': cell.dayOfWeek === 0,
                'text-red': cell.holiday,
                'other-month': !cell.isSameMonth
              }"
              @click="selectDate(cell)"
            >
              <span class="date-text">{{ cell.day }}</span>
              <div v-if="cell.holiday" class="indicator pill" :style="{ backgroundColor: data.closedDayColor || '#FF3B30' }"></div>
              <template v-else>
                <div
                  v-for="(sched, si) in cell.schedules.slice(0, 1)"
                  :key="si"
                  class="indicator"
                  :class="isMultiDaySchedule(sched) ? 'pill' : 'dot'"
                  :style="{ backgroundColor: sched.color || data.highlightColor || '#32ADE6' }"
                ></div>
              </template>
            </div>
          </div>
          <div class="week-row">
            <div
              v-for="(cell, idx) in weekCells.slice(7, 14)"
              :key="idx"
              class="day-cell"
              :class="{
                'today': cell.isToday,
                'selected': selectedDate && selectedDate.day === cell.day && selectedDate.month === cell.month,
                'sunday': cell.dayOfWeek === 0,
                'text-red': cell.holiday,
                'other-month': !cell.isSameMonth
              }"
              @click="selectDate(cell)"
            >
              <span class="date-text">{{ cell.day }}</span>
              <div v-if="cell.holiday" class="indicator pill" :style="{ backgroundColor: data.closedDayColor || '#FF3B30' }"></div>
              <template v-else>
                <div
                  v-for="(sched, si) in cell.schedules.slice(0, 1)"
                  :key="si"
                  class="indicator"
                  :class="isMultiDaySchedule(sched) ? 'pill' : 'dot'"
                  :style="{ backgroundColor: sched.color || data.highlightColor || '#32ADE6' }"
                ></div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 이번주/다음주 일정 목록 -->
      <div class="event-list-container">
        <div v-if="weekEvents.length === 0" class="event-item-empty">
          예정된 일정이 없습니다
        </div>
        <div v-for="event in weekEvents" :key="event.id" class="event-item">
          <div class="event-color-bar" :style="{ backgroundColor: getEventColor(event) }"></div>
          <div class="event-details">
            <h3 class="event-title">{{ event.title }}</h3>
            <p class="event-location">{{ event.day }}일 ({{ event.weekday }}) · {{ event.typeLabel }}</p>
          </div>
        </div>
      </div>

      <!-- 선택된 날짜 상세 (week) -->
      <div v-if="selectedDate" class="event-list-container selected-detail">
        <div class="event-list-header">
          <span class="event-list-date">{{ selectedDate.month }}월 {{ selectedDate.day }}일</span>
          <button class="event-list-close" @click="selectedDate = null">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div v-if="selectedDate.holiday" class="event-item">
          <div class="event-color-bar" :style="{ backgroundColor: data.closedDayColor || '#FF3B30' }"></div>
          <div class="event-details">
            <h3 class="event-title">{{ selectedDate.holiday }}</h3>
            <p class="event-location">공휴일</p>
          </div>
        </div>
        <div v-for="sched in selectedDate.schedules" :key="sched.id" class="event-item">
          <div class="event-color-bar" :style="{ backgroundColor: sched.color || data.highlightColor || '#32ADE6' }"></div>
          <div class="event-details">
            <h3 class="event-title">{{ sched.title }}</h3>
            <p v-if="sched.description" class="event-location">{{ sched.description }}</p>
            <p v-else class="event-location">{{ getScheduleTypeLabel(sched.scheduleType) }}</p>
          </div>
        </div>
        <div v-if="!selectedDate.holiday && selectedDate.schedules.length === 0" class="event-item-empty">
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

      <div class="event-list-container">
        <div v-if="filteredEvents.length === 0" class="event-item-empty">
          {{ data.futureOnly ? '예정된 일정이 없습니다' : '이번 달 일정이 없습니다' }}
        </div>
        <div v-for="event in filteredEvents" :key="event.id" class="event-item">
          <div class="event-color-bar" :style="{ backgroundColor: getEventColor(event) }"></div>
          <div class="event-details">
            <h3 class="event-title">{{ event.title }}</h3>
            <p class="event-location">{{ event.day }}일 ({{ event.weekday }}) · {{ event.typeLabel }}</p>
          </div>
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
  themeBackgroundColor?: string
  isPreview?: boolean
}

const props = defineProps<Props>()

// 배경색 밝기 판단 → 다크모드 자동 전환
function isDarkColor(color: string): boolean {
  if (!color) return false
  let hex = color.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

const isDarkTheme = computed(() => isDarkColor(props.themeBackgroundColor || ''))

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

const typeLabels: Record<string, string> = {
  closed: '휴무',
  event: '이벤트',
  notice: '공지',
  hours_change: '시간변경'
}

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
  return props.data.highlightColor || '#32ADE6'
}

function getScheduleTypeLabel(type: string): string {
  return typeLabels[type] || type
}

function isMultiDaySchedule(sched: ScheduleItem): boolean {
  return sched.startDate !== sched.endDate
}

// calendarCells를 주 단위 2D 배열로 변환
const calendarWeeks = computed<(CalendarCell | null)[][]>(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const firstDay = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()
  const isFutureOnly = props.data.futureOnly

  const allCells: (CalendarCell | null)[] = []

  // 첫 주 빈 셀
  for (let i = 0; i < firstDay; i++) {
    allCells.push(null)
  }

  // 현재 월 날짜
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = makeDateStr(y, m, d)
    const dayOfWeek = new Date(y, m - 1, d).getDay()
    const isPast = isFutureOnly ? dateStr < todayStr.value : false

    const holiday = isPast ? null : (holidays.value.find(h => h.date === dateStr)?.name || null)
    const daySchedules = isPast ? [] : schedules.value.filter(s => dateStr >= s.startDate && dateStr <= s.endDate)
    const isClosed = daySchedules.some(s => s.scheduleType === 'closed')

    allCells.push({
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

  // 마지막 주 빈 셀
  while (allCells.length % 7 !== 0) {
    allCells.push(null)
  }

  // 주 단위로 나누기
  const weeks: (CalendarCell | null)[][] = []
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7))
  }

  return weeks
})

// Week mode: 이번주 + 다음주 14일 셀
const weekCells = computed<CalendarCell[]>(() => {
  const today = new Date()
  const todayDay = today.getDay()
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

  if (props.data.style === 'week') {
    await loadNextMonthData()
  }
}

async function loadNextMonthData() {
  if (!props.qrCodeId || props.isPreview) return

  const today = new Date()
  const thisMonth = today.getMonth() + 1
  const thisYear = today.getFullYear()

  const nextM = thisMonth === 12 ? 1 : thisMonth + 1
  const nextY = thisMonth === 12 ? thisYear + 1 : thisYear

  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() - today.getDay() + 13)
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
/*
  반응형 CSS 변수 시스템
  컨테이너 너비 기준으로 모든 크기가 비례 조절됨
  clamp(최소, 선호, 최대) 패턴 사용
*/
.calendar-block {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 100%;
  margin: 0 auto;
  color: #000000;

  /* 코어 크기 변수 - clamp로 반응형 */
  --cell-height: clamp(40px, 13.5cqi, 54px);
  --cell-pt: clamp(5px, 2cqi, 8px);
  --date-size: clamp(14px, 5cqi, 20px);
  --date-circle: clamp(24px, 8cqi, 32px);
  --dot-size: clamp(3px, 1cqi, 4px);
  --pill-w: clamp(8px, 3.5cqi, 14px);
  --pill-h: clamp(3px, 1cqi, 4px);
  --indicator-mt: clamp(1px, 0.5cqi, 2px);
  --header-size: clamp(22px, 8.5cqi, 34px);
  --nav-size: clamp(14px, 4.3cqi, 17px);
  --weekday-size: clamp(9px, 2.8cqi, 11px);
  --side-pad: clamp(12px, 5cqi, 20px);
  --event-pad-y: clamp(10px, 4cqi, 16px);
  --event-title-size: clamp(13px, 3.8cqi, 15px);
  --event-sub-size: clamp(11px, 3.3cqi, 13px);
  --bar-height: clamp(28px, 9.5cqi, 38px);
  --bar-mr: clamp(8px, 3cqi, 12px);

  container-type: inline-size;
}

/* --- iOS 대형 헤더 --- */
.calendar-header {
  padding: var(--cell-pt) var(--side-pad);
}

.calendar-header h1 {
  font-size: var(--header-size);
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

/* --- 네비게이션 --- */
.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 5cqi, 20px);
  margin-bottom: clamp(8px, 3cqi, 12px);
}

.nav-btn {
  width: clamp(28px, 8.5cqi, 34px);
  height: clamp(28px, 8.5cqi, 34px);
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
  font-size: var(--nav-size);
  font-weight: 600;
  text-align: center;
  letter-spacing: -0.2px;
}

/* --- 캘린더 그리드 --- */
.calendar-grid {
  width: 100%;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: clamp(4px, 2cqi, 8px);
  border-bottom: 1px solid #E5E5EA;
  padding-bottom: clamp(4px, 2cqi, 8px);
}

.weekdays span {
  font-size: var(--weekday-size);
  font-weight: 600;
  color: #8E8E93;
  text-transform: uppercase;
}

/* --- 주차 행 --- */
.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #E5E5EA;
}

.week-row:last-child {
  border-bottom: none;
}

/* --- 날짜 셀 --- */
.day-cell {
  height: var(--cell-height);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: var(--cell-pt);
  position: relative;
  cursor: pointer;
}

.day-cell:active:not(.empty) {
  opacity: 0.6;
}

.day-cell.empty {
  cursor: default;
}

/* --- 날짜 텍스트 --- */
.date-text {
  font-size: var(--date-size);
  font-weight: 500;
  width: var(--date-circle);
  height: var(--date-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* 일요일: 회색 */
.day-cell.sunday .date-text {
  color: #8E8E93;
}

/* 이전/다음 달 */
.day-cell.other-month {
  opacity: 0.3;
}

/* 과거 날짜 (futureOnly) */
.day-cell.is-past {
  opacity: 0.3;
}

/* 공휴일 빨간색 */
.day-cell.text-red .date-text {
  color: #FF3B30;
}

/* 선택된 날짜: 검은 원 */
.day-cell.selected .date-text {
  background-color: #000000;
  color: #ffffff;
  font-weight: 600;
}

/* 오늘: 빨간 원 (iOS 캘린더 기본) */
.day-cell.today .date-text {
  background-color: #FF3B30;
  color: #ffffff;
  font-weight: 600;
}

/* 선택 + 오늘 동시: 선택 우선 */
.day-cell.selected.today .date-text {
  background-color: #000000;
  color: #ffffff;
}

/* --- 인디케이터 (dot, pill) --- */
.indicator {
  margin-top: var(--indicator-mt);
}

.indicator.dot {
  width: var(--dot-size);
  height: var(--dot-size);
  border-radius: 50%;
}

.indicator.pill {
  width: var(--pill-w);
  height: var(--pill-h);
  border-radius: 2px;
}

/* --- 하단 이벤트 리스트 --- */
.event-list-container {
  margin-top: var(--event-pad-y);
  border-top: 1px solid #F2F2F7;
}

.event-list-container.selected-detail {
  margin-top: clamp(8px, 3cqi, 12px);
}

.event-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(8px, 3cqi, 12px) var(--side-pad) 0;
}

.event-list-date {
  font-weight: 600;
  font-size: var(--event-title-size);
  color: #000000;
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
}

.event-list-close:hover {
  background: rgba(142, 142, 147, 0.12);
}

.event-item {
  display: flex;
  align-items: flex-start;
  padding: var(--event-pad-y) var(--side-pad);
  border-bottom: 1px solid #F2F2F7;
}

.event-item:last-child {
  border-bottom: none;
}

.event-color-bar {
  width: 4px;
  height: var(--bar-height);
  border-radius: 2px;
  margin-right: var(--bar-mr);
  flex-shrink: 0;
}

.event-details {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: var(--event-title-size);
  font-weight: 600;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #000000;
}

.event-location {
  font-size: var(--event-sub-size);
  color: #8E8E93;
  margin: 0;
}

.event-item-empty {
  text-align: center;
  padding: clamp(16px, 6cqi, 24px) var(--side-pad);
  color: #8E8E93;
  font-size: var(--event-sub-size);
}

/* --- Compact 스타일: 변수 오버라이드 --- */
.calendar-block--compact {
  --cell-height: clamp(34px, 11cqi, 44px);
  --cell-pt: clamp(4px, 1.5cqi, 6px);
  --date-size: clamp(12px, 4cqi, 16px);
  --date-circle: clamp(20px, 7cqi, 28px);
  --dot-size: clamp(2px, 0.8cqi, 3px);
  --pill-w: clamp(6px, 2.5cqi, 10px);
  --pill-h: clamp(2px, 0.8cqi, 3px);
  --header-size: clamp(17px, 5.5cqi, 22px);
}

/* --- Week 스타일 --- */
.calendar-block--week {
  --header-size: clamp(18px, 6cqi, 24px);
}

/* --- 다크 테마 (어두운 배경 자동 감지) --- */
.calendar-dark {
  color: #FFFFFF;
}

.calendar-dark .calendar-header h1 {
  color: #FFFFFF;
}

.calendar-dark .nav-btn {
  color: rgba(255, 255, 255, 0.6);
}

.calendar-dark .nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.calendar-dark .nav-btn:active {
  background: rgba(255, 255, 255, 0.15);
}

.calendar-dark .weekdays {
  border-bottom-color: #38383A;
}

.calendar-dark .weekdays span {
  color: #98989D;
}

.calendar-dark .week-row {
  border-bottom-color: #38383A;
}

.calendar-dark .day-cell.sunday .date-text {
  color: #98989D;
}

.calendar-dark .day-cell.text-red .date-text {
  color: #FF453A;
}

/* 다크: 선택된 날짜 → 흰 원 + 검정 글 (반전) */
.calendar-dark .day-cell.selected .date-text {
  background-color: #FFFFFF;
  color: #000000;
}

/* 다크: 오늘 → 빨간 원 유지 */
.calendar-dark .day-cell.today .date-text {
  background-color: #FF453A;
  color: #FFFFFF;
}

/* 다크: 선택 + 오늘 동시 → 흰 원 우선 */
.calendar-dark .day-cell.selected.today .date-text {
  background-color: #FFFFFF;
  color: #000000;
}

.calendar-dark .event-list-container {
  border-top-color: #38383A;
}

.calendar-dark .event-list-date {
  color: #FFFFFF;
}

.calendar-dark .event-list-close {
  color: #98989D;
}

.calendar-dark .event-list-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.calendar-dark .event-item {
  border-bottom-color: #38383A;
}

.calendar-dark .event-title {
  color: #FFFFFF;
}

.calendar-dark .event-location {
  color: #98989D;
}

.calendar-dark .event-item-empty {
  color: #98989D;
}

/* cqi 미지원 브라우저 폴백 (vw 기반) */
@supports not (width: 1cqi) {
  .calendar-block {
    --cell-height: clamp(40px, 13.5vw, 54px);
    --cell-pt: clamp(5px, 2vw, 8px);
    --date-size: clamp(14px, 5vw, 20px);
    --date-circle: clamp(24px, 8vw, 32px);
    --dot-size: clamp(3px, 1vw, 4px);
    --pill-w: clamp(8px, 3.5vw, 14px);
    --pill-h: clamp(3px, 1vw, 4px);
    --indicator-mt: clamp(1px, 0.5vw, 2px);
    --header-size: clamp(22px, 8.5vw, 34px);
    --nav-size: clamp(14px, 4.3vw, 17px);
    --weekday-size: clamp(9px, 2.8vw, 11px);
    --side-pad: clamp(12px, 5vw, 20px);
    --event-pad-y: clamp(10px, 4vw, 16px);
    --event-title-size: clamp(13px, 3.8vw, 15px);
    --event-sub-size: clamp(11px, 3.3vw, 13px);
    --bar-height: clamp(28px, 9.5vw, 38px);
    --bar-mr: clamp(8px, 3vw, 12px);
  }

  .calendar-block--compact {
    --cell-height: clamp(34px, 11vw, 44px);
    --cell-pt: clamp(4px, 1.5vw, 6px);
    --date-size: clamp(12px, 4vw, 16px);
    --date-circle: clamp(20px, 7vw, 28px);
    --dot-size: clamp(2px, 0.8vw, 3px);
    --pill-w: clamp(6px, 2.5vw, 10px);
    --pill-h: clamp(2px, 0.8vw, 3px);
    --header-size: clamp(17px, 5.5vw, 22px);
  }

  .calendar-block--week {
    --header-size: clamp(18px, 6vw, 24px);
  }
}
</style>
