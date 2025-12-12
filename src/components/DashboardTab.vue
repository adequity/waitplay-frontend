<template>
  <div class="tab-content">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-text">
        <h1 class="page-title">WaitPlay 관리자</h1>
        <p class="page-desc">오늘도 좋은 하루 보내세요 👋</p>
      </div>
      
      <!-- Date Range Filter -->
      <div class="date-filter">
        <span class="filter-label">기간 선택</span>
        <div class="segmented-control">
          <button 
            v-for="period in ['today', 'week', 'month']" 
            :key="period"
            class="segment-btn"
            :class="{ active: currentPeriod === period }"
            @click="setPeriod(period)"
          >
            {{ getPeriodLabel(period) }}
          </button>
        </div>
      </div>
    </div>

    <!-- 1. KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-value">{{ animatedStats.qrScan }}</div>
        <div class="kpi-label">QR 활용자</div>
        <div class="kpi-badge blue">{{ getPeriodLabel(currentPeriod) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">{{ animatedStats.couponUsed }}</div>
        <div class="kpi-label">쿠폰 사용</div>
        <div class="kpi-badge blue">{{ getPeriodLabel(currentPeriod) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">{{ animatedStats.newRegular }}</div>
        <div class="kpi-label">신규 단골</div>
        <div class="kpi-badge blue">{{ getPeriodLabel(currentPeriod) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value">{{ animatedStats.totalRegular }}</div>
        <div class="kpi-label">총 단골 수</div>
        <div class="kpi-badge gray">누적</div>
      </div>
    </div>

    <!-- 2. Activity Chart -->
    <div class="chart-section card">
      <div class="card-header">
        <h2 class="section-title">일자별 활동 추이</h2>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="dot blue"></span> QR 활용자
          </div>
          <div class="legend-item">
            <span class="dot green"></span> 쿠폰 사용
          </div>
          <div class="legend-item">
            <span class="dot orange"></span> 신규 단골
          </div>
        </div>
      </div>

      <div class="chart-container">
        <!-- SVG Line Chart -->
        <svg viewBox="0 0 1000 300" class="activity-chart" preserveAspectRatio="none">
          <!-- Grid Lines (Horizontal) -->
          <g class="grid-lines">
            <line x1="0" y1="250" x2="1000" y2="250" />
            <line x1="0" y1="190" x2="1000" y2="190" />
            <line x1="0" y1="130" x2="1000" y2="130" />
            <line x1="0" y1="70" x2="1000" y2="70" />
          </g>

          <!-- Y-Axis Labels (Dynamic based on max value) -->
          <g class="axis-labels y-axis">
            <text x="0" y="255">0</text>
            <text x="0" y="195">{{ Math.round(maxY * 0.33) }}</text>
            <text x="0" y="135">{{ Math.round(maxY * 0.66) }}</text>
            <text x="0" y="75">{{ maxY }}</text>
          </g>

          <!-- Paths (Lines) - Calculated Dynamically -->
          <!-- Blue: QR Scans -->
          <polyline 
            :points="getPoints('qrScan')"
            class="chart-line blue" 
          />
          <!-- Green: Coupon -->
          <polyline 
            :points="getPoints('couponUsed')"
            class="chart-line green" 
          />
          <!-- Orange: New Regular -->
          <polyline 
            :points="getPoints('newRegular')"
            class="chart-line orange" 
          />

          <!-- Data Points (Circles) -->
          <g class="data-points">
            <template v-for="(point, index) in chartData" :key="index">
              <!-- X Coordinate Calculation: 50 + (index / (length-1)) * 900 -->
              <!-- Y Coordinate Calculation: 250 - (value / maxY) * 180 -->
              
              <circle 
                :cx="getX(index)" 
                :cy="getY(point.qrScan)" 
                r="4" class="point blue" 
              />
              <circle 
                :cx="getX(index)" 
                :cy="getY(point.couponUsed)" 
                r="4" class="point green" 
              />
              <circle 
                :cx="getX(index)" 
                :cy="getY(point.newRegular)" 
                r="4" class="point orange" 
              />
            </template>
          </g>

          <!-- X-Axis Labels -->
          <g class="axis-labels x-axis">
            <text 
              v-for="(point, index) in chartData" 
              :key="index"
              :x="getX(index)" 
              y="280" 
              text-anchor="middle"
            >
              {{ point.label }}
            </text>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'

// --- Data Types ---
type Period = 'today' | 'week' | 'month'

interface ChartPoint {
  label: string
  qrScan: number
  couponUsed: number
  newRegular: number
}

// --- State ---
const currentPeriod = ref<Period>('today')

// Animated Display Stats
const animatedStats = reactive({
  qrScan: 0,
  couponUsed: 0,
  newRegular: 0,
  totalRegular: 248 // This typically doesn't reset by period
})

// --- Mock Data ---
const mockData: Record<Period, ChartPoint[]> = {
  today: [
    { label: '0시', qrScan: 5, couponUsed: 2, newRegular: 0 },
    { label: '6시', qrScan: 12, couponUsed: 8, newRegular: 1 },
    { label: '12시', qrScan: 45, couponUsed: 30, newRegular: 5 },
    { label: '18시', qrScan: 85, couponUsed: 60, newRegular: 8 },
    { label: '21시', qrScan: 110, couponUsed: 75, newRegular: 10 },
    { label: '현재', qrScan: 127, couponUsed: 85, newRegular: 12 },
  ],
  week: [
    { label: '월', qrScan: 150, couponUsed: 100, newRegular: 15 },
    { label: '화', qrScan: 180, couponUsed: 120, newRegular: 20 },
    { label: '수', qrScan: 160, couponUsed: 110, newRegular: 18 },
    { label: '목', qrScan: 190, couponUsed: 130, newRegular: 22 },
    { label: '금', qrScan: 250, couponUsed: 180, newRegular: 30 },
    { label: '토', qrScan: 300, couponUsed: 220, newRegular: 45 },
    { label: '일', qrScan: 280, couponUsed: 200, newRegular: 40 },
  ],
  month: [
    { label: '1주', qrScan: 800, couponUsed: 500, newRegular: 80 },
    { label: '2주', qrScan: 950, couponUsed: 600, newRegular: 100 },
    { label: '3주', qrScan: 1100, couponUsed: 750, newRegular: 120 },
    { label: '4주', qrScan: 1050, couponUsed: 700, newRegular: 110 },
  ]
}

// --- Computeds ---
const chartData = computed(() => mockData[currentPeriod.value])

// Calculate totals based on current chart data
const currentTotals = computed(() => {
  if (currentPeriod.value === 'today') {
    // For today, take the last value (cumulative)
    const last = chartData.value[chartData.value.length - 1]
    if (!last) {
      return { qrScan: 0, couponUsed: 0, newRegular: 0, totalRegular: 248 }
    }
    return {
      qrScan: last.qrScan,
      couponUsed: last.couponUsed,
      newRegular: last.newRegular,
      totalRegular: 248
    }
  } else {
    // For week/month, sum up values
    return chartData.value.reduce((acc, curr) => ({
      qrScan: acc.qrScan + curr.qrScan,
      couponUsed: acc.couponUsed + curr.couponUsed,
      newRegular: acc.newRegular + curr.newRegular,
      totalRegular: 248
    }), { qrScan: 0, couponUsed: 0, newRegular: 0, totalRegular: 248 })
  }
})

// Calculate max value for Y-axis scaling
const maxY = computed(() => {
  const allValues = chartData.value.flatMap(p => [p.qrScan, p.couponUsed, p.newRegular])
  const max = Math.max(...allValues)
  return Math.ceil(max * 1.1) // Add 10% padding
})

// --- Helper Functions for SVG ---
const getX = (index: number) => {
  const count = chartData.value.length
  const width = 900 // 1000 - 50 - 50 (padding)
  return 50 + (index / (count - 1)) * width
}

const getY = (value: number) => {
  const height = 180 // 250 (bottom) - 70 (top grid)
  const ratio = value / maxY.value
  return 250 - (ratio * height)
}

const getPoints = (key: keyof ChartPoint) => {
  return chartData.value.map((point, index) => {
    // Exclude label field for type safety
    if (key === 'label') return '' 
    return `${getX(index)},${getY(point[key as 'qrScan' | 'couponUsed' | 'newRegular'])}`
  }).join(' ')
}

const getPeriodLabel = (period: string) => {
  const labels: Record<string, string> = {
    today: '오늘',
    week: '7일',
    month: '30일'
  }
  return labels[period]
}

// --- Animation ---
const animateNumbers = () => {
  const duration = 800
  const start = { ...animatedStats }
  const end = currentTotals.value
  const startTime = performance.now()

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3) // Cubic ease-out

    animatedStats.qrScan = Math.round(start.qrScan + (end.qrScan - start.qrScan) * easeOut)
    animatedStats.couponUsed = Math.round(start.couponUsed + (end.couponUsed - start.couponUsed) * easeOut)
    animatedStats.newRegular = Math.round(start.newRegular + (end.newRegular - start.newRegular) * easeOut)
    animatedStats.totalRegular = end.totalRegular

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  requestAnimationFrame(step)
}

const setPeriod = (period: string) => {
  currentPeriod.value = period as Period
}

// Watch for data changes to trigger animation
watch(currentTotals, animateNumbers)

onMounted(() => {
  animateNumbers()
})
</script>

<style scoped>
/* --- Design Tokens (Apple Style) --- */
:root {
  --primary-blue: #0071e3;
  --bg-gray: #f5f5f7;
  --text-dark: #1d1d1f;
  --text-gray: #86868b;
  --border-light: #e5e5ea;
  --card-radius: 20px;
  --shadow-sm: 0 4px 12px rgba(0,0,0,0.04);
  
  --chart-blue: #0071e3;
  --chart-green: #34c759;
  --chart-orange: #ff9500;
}

.tab-content {
  padding: 50px 60px;
  background-color: #f5f5f7;
  min-height: 100vh;
  color: #1d1d1f;
  font-family: 'Noto Sans KR', sans-serif;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  background: white;
  padding: 30px;
  border-radius: 24px;
  box-shadow: var(--shadow-sm);
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

/* Date Filter */
.date-filter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}

.segmented-control {
  background: #f5f5f7;
  padding: 4px;
  border-radius: 12px;
  display: flex;
  gap: 4px;
}

.segment-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #86868b;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.segment-btn.active {
  background: #0071e3;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 113, 227, 0.2);
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.kpi-card {
  background: white;
  border-radius: var(--card-radius);
  padding: 30px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.02);
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}

.kpi-value {
  font-size: 36px;
  font-weight: 800;
  color: #1d1d1f;
  margin-bottom: 8px;
  letter-spacing: -1px;
}

.kpi-label {
  font-size: 14px;
  color: #86868b;
  margin-bottom: 16px;
  font-weight: 500;
}

.kpi-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}

.kpi-badge.blue {
  color: #0071e3;
  background: #e8f2ff;
}

.kpi-badge.gray {
  color: #0071e3;
  background: #f5f5f7;
}

/* Chart Section */
.card {
  background: white;
  border-radius: var(--card-radius);
  padding: 36px;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0,0,0,0.02);
}

.card-header {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 16px;
}

.chart-legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #86868b;
  font-weight: 500;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.blue { background: #0071e3; }
.dot.green { background: #34c759; }
.dot.orange { background: #ff9500; }

/* SVG Chart Styles */
.chart-container {
  width: 100%;
  height: 300px;
  position: relative;
}

.activity-chart {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.grid-lines line {
  stroke: #e5e5ea;
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.axis-labels text {
  fill: #86868b;
  font-size: 12px;
  font-family: -apple-system, sans-serif;
}

.y-axis text {
  text-anchor: start;
}

.chart-line {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: all 0.5s ease; /* Animation for line changes */
}

.chart-line.blue { stroke: #0071e3; }
.chart-line.green { stroke: #34c759; }
.chart-line.orange { stroke: #ff9500; }

.point {
  stroke-width: 2;
  stroke: white;
  fill: currentColor;
  transition: all 0.5s ease; /* Animation for point movement */
}
.point.blue { color: #0071e3; }
.point.green { color: #34c759; }
.point.orange { color: #ff9500; }

/* Responsive */
@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .tab-content { padding: 30px 20px; }
  .dashboard-header { flex-direction: column; align-items: flex-start; gap: 20px; }
  .date-filter { width: 100%; align-items: flex-start; }
  .kpi-grid { grid-template-columns: 1fr; }
  .axis-labels.y-axis { display: none; } /* Mobile: Hide Y-axis labels for space */
}
</style>