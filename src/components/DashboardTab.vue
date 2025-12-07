<template>
  <div class="tab-content">
    <!-- Apple-Style Greeting -->
    <div class="apple-greeting">
      <h1 class="greeting-title">WaitPlay 관리자</h1>
      <p class="greeting-subtitle">오늘도 좋은 하루 보내세요</p>
    </div>

    <!-- Global Date Filter -->
    <div class="global-filter-section">
      <div class="filter-label">기간 선택</div>
      <div class="date-filter-apple">
        <button
          v-for="filter in dateFilters"
          :key="filter.value"
          @click="selectedFilter = filter.value"
          :class="['filter-btn-apple', { active: selectedFilter === filter.value }]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Apple-Style Key Metrics -->
    <div class="metrics-apple">
      <div class="metric-apple">
        <p class="metric-value-apple">{{ animatedQrUsers }}</p>
        <p class="metric-label-apple">QR 활용자</p>
        <p class="metric-change-apple">{{ selectedDateRange }}</p>
      </div>

      <div class="metric-apple">
        <p class="metric-value-apple">{{ animatedCouponUsed }}</p>
        <p class="metric-label-apple">쿠폰 사용</p>
        <p class="metric-change-apple">{{ selectedDateRange }}</p>
      </div>

      <div class="metric-apple">
        <p class="metric-value-apple">{{ animatedNewFavorites }}</p>
        <p class="metric-label-apple">신규 단골</p>
        <p class="metric-change-apple">{{ selectedDateRange }}</p>
      </div>

      <div class="metric-apple">
        <p class="metric-value-apple">{{ animatedTotalFavorites }}</p>
        <p class="metric-label-apple">총 단골 수</p>
        <p class="metric-change-apple">누적</p>
      </div>
    </div>

    <!-- Apple-Style Chart Section -->
    <div class="chart-apple">
      <div class="chart-header-apple">
        <h3 class="chart-title-apple">일자별 활동 추이</h3>
      </div>

      <div class="chart-legend-apple">
        <div class="legend-item-apple">
          <span class="legend-dot-apple" style="background: #007aff"></span>
          <span class="legend-label-apple">QR 활용자</span>
        </div>
        <div class="legend-item-apple">
          <span class="legend-dot-apple" style="background: #34c759"></span>
          <span class="legend-label-apple">쿠폰 사용</span>
        </div>
        <div class="legend-item-apple">
          <span class="legend-dot-apple" style="background: #ff9500"></span>
          <span class="legend-label-apple">신규 단골</span>
        </div>
      </div>

      <div class="chart-container-apple">
        <div class="line-chart">
          <!-- Y-axis labels -->
          <div class="y-axis">
            <div class="y-label-apple" v-for="i in 5" :key="i">
              {{ Math.round((maxValue * (5 - i)) / 4) }}
            </div>
          </div>

          <!-- Chart area -->
          <div class="chart-area">
            <!-- Grid lines -->
            <div class="grid-lines-apple">
              <div class="grid-line-apple" v-for="i in 5" :key="i"></div>
            </div>

            <!-- Lines -->
            <svg class="chart-svg" viewBox="0 0 700 300" preserveAspectRatio="none">
              <!-- QR Users line -->
              <polyline
                :points="currentChartData.map((d, i) => `${i * 100 + 50},${300 - (d.qrUsers / maxValue * 280)}`).join(' ')"
                fill="none"
                stroke="#007aff"
                stroke-width="3"
              />
              <!-- Coupon Used line -->
              <polyline
                :points="currentChartData.map((d, i) => `${i * 100 + 50},${300 - (d.couponUsed / maxValue * 280)}`).join(' ')"
                fill="none"
                stroke="#34c759"
                stroke-width="3"
              />
              <!-- New Favorites line -->
              <polyline
                :points="currentChartData.map((d, i) => `${i * 100 + 50},${300 - (d.newFavorites / maxValue * 280)}`).join(' ')"
                fill="none"
                stroke="#ff9500"
                stroke-width="3"
              />

              <!-- Data points for QR Users -->
              <g v-for="(d, i) in currentChartData" :key="`qr-${i}`">
                <circle :cx="i * 100 + 50" :cy="300 - (d.qrUsers / maxValue * 280)" r="4" fill="#007aff" />
              </g>
              <!-- Data points for Coupon Used -->
              <g v-for="(d, i) in currentChartData" :key="`coupon-${i}`">
                <circle :cx="i * 100 + 50" :cy="300 - (d.couponUsed / maxValue * 280)" r="4" fill="#34c759" />
              </g>
              <!-- Data points for New Favorites -->
              <g v-for="(d, i) in currentChartData" :key="`fav-${i}`">
                <circle :cx="i * 100 + 50" :cy="300 - (d.newFavorites / maxValue * 280)" r="4" fill="#ff9500" />
              </g>
            </svg>

            <!-- X-axis labels -->
            <div class="x-axis">
              <div class="x-label-apple" v-for="(d, i) in currentChartData" :key="i">
                {{ d.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref } from 'vue'

const selectedFilter = ref('today')
const selectedDateRange = ref('오늘')

const dateFilters = [
  { label: '오늘', value: 'today' },
  { label: '7일', value: '7days' },
  { label: '30일', value: '30days' }
]

const dashboardData = ref({
  qrUsers: 127,
  couponUsed: 85,
  newFavorites: 12,
  totalFavorites: 248
})

// Animated values for counting animation
const animatedQrUsers = ref(127)
const animatedCouponUsed = ref(85)
const animatedNewFavorites = ref(12)
const animatedTotalFavorites = ref(248)

// Animation function with ease-out cubic easing
function animateValue(animatedRef: Ref<number>, target: number, duration: number = 800) {
  const start = animatedRef.value
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-out cubic) for smooth deceleration
    const easeProgress = 1 - Math.pow(1 - progress, 3)

    animatedRef.value = Math.round(start + (target - start) * easeProgress)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

// Watch dashboard data changes and trigger animations
watch(dashboardData, (newData) => {
  animateValue(animatedQrUsers, newData.qrUsers)
  animateValue(animatedCouponUsed, newData.couponUsed)
  animateValue(animatedNewFavorites, newData.newFavorites)
  animateValue(animatedTotalFavorites, newData.totalFavorites)
}, { deep: true })

// Initialize with current values on mount
onMounted(() => {
  animatedQrUsers.value = dashboardData.value.qrUsers
  animatedCouponUsed.value = dashboardData.value.couponUsed
  animatedNewFavorites.value = dashboardData.value.newFavorites
  animatedTotalFavorites.value = dashboardData.value.totalFavorites
})

// 오늘 시간별 데이터 (24시간)
const todayData = ref([
  { label: '0시', qrUsers: 5, couponUsed: 2, newFavorites: 0 },
  { label: '6시', qrUsers: 12, couponUsed: 5, newFavorites: 1 },
  { label: '12시', qrUsers: 45, couponUsed: 18, newFavorites: 3 },
  { label: '18시', qrUsers: 65, couponUsed: 32, newFavorites: 5 },
  { label: '21시', qrUsers: 85, couponUsed: 42, newFavorites: 7 },
  { label: '23시', qrUsers: 95, couponUsed: 48, newFavorites: 8 },
  { label: '현재', qrUsers: 127, couponUsed: 85, newFavorites: 12 }
])

// 7일 데이터 (주간)
const weeklyData = ref([
  { label: '월', qrUsers: 98, couponUsed: 45, newFavorites: 8 },
  { label: '화', qrUsers: 112, couponUsed: 52, newFavorites: 11 },
  { label: '수', qrUsers: 105, couponUsed: 48, newFavorites: 9 },
  { label: '목', qrUsers: 128, couponUsed: 61, newFavorites: 13 },
  { label: '금', qrUsers: 145, couponUsed: 73, newFavorites: 15 },
  { label: '토', qrUsers: 138, couponUsed: 68, newFavorites: 12 },
  { label: '일', qrUsers: 127, couponUsed: 59, newFavorites: 14 }
])

// 30일 데이터 (월간 - 주차별)
const monthlyData = ref([
  { label: '1주차', qrUsers: 420, couponUsed: 198, newFavorites: 45 },
  { label: '2주차', qrUsers: 485, couponUsed: 225, newFavorites: 52 },
  { label: '3주차', qrUsers: 512, couponUsed: 248, newFavorites: 58 },
  { label: '4주차', qrUsers: 548, couponUsed: 265, newFavorites: 62 },
  { label: '5주차', qrUsers: 592, couponUsed: 285, newFavorites: 68 },
  { label: '이번주', qrUsers: 625, couponUsed: 302, newFavorites: 72 },
  { label: '누적', qrUsers: 853, couponUsed: 359, newFavorites: 89 }
])

// 현재 차트 데이터 (필터에 따라 변경)
const currentChartData = computed(() => {
  if (selectedFilter.value === 'today') {
    return todayData.value
  } else if (selectedFilter.value === '7days') {
    return weeklyData.value
  } else {
    return monthlyData.value
  }
})

const maxValue = computed(() => {
  const data = currentChartData.value
  return Math.max(...data.map(d => Math.max(d.qrUsers, d.couponUsed, d.newFavorites)))
})

// 필터 변경 시 대시보드 데이터도 업데이트
watch(selectedFilter, (newFilter) => {
  if (newFilter === 'today') {
    selectedDateRange.value = '오늘'
    const lastData = todayData.value[todayData.value.length - 1]
    dashboardData.value = {
      qrUsers: lastData?.qrUsers || 0,
      couponUsed: lastData?.couponUsed || 0,
      newFavorites: lastData?.newFavorites || 0,
      totalFavorites: 248
    }
  } else if (newFilter === '7days') {
    selectedDateRange.value = '7일'
    const totalQr = weeklyData.value.reduce((sum, d) => sum + d.qrUsers, 0)
    const totalCoupon = weeklyData.value.reduce((sum, d) => sum + d.couponUsed, 0)
    const totalNew = weeklyData.value.reduce((sum, d) => sum + d.newFavorites, 0)
    dashboardData.value = {
      qrUsers: totalQr,
      couponUsed: totalCoupon,
      newFavorites: totalNew,
      totalFavorites: 248
    }
  } else {
    selectedDateRange.value = '30일'
    const lastData = monthlyData.value[monthlyData.value.length - 1]
    dashboardData.value = {
      qrUsers: lastData?.qrUsers || 0,
      couponUsed: lastData?.couponUsed || 0,
      newFavorites: lastData?.newFavorites || 0,
      totalFavorites: 248
    }
  }
})
</script>

<style scoped>
@import '../assets/admin-styles.css';
</style>
