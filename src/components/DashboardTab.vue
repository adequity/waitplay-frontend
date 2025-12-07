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
        <p class="metric-value-apple">{{ stats.qrUsers }}</p>
        <p class="metric-label-apple">QR 활용자</p>
        <p class="metric-change-apple">{{ selectedDateRange }}</p>
      </div>

      <div class="metric-apple">
        <p class="metric-value-apple">{{ stats.couponUsed }}</p>
        <p class="metric-label-apple">쿠폰 사용</p>
        <p class="metric-change-apple">{{ selectedDateRange }}</p>
      </div>

      <div class="metric-apple">
        <p class="metric-value-apple">{{ stats.newFavorites }}</p>
        <p class="metric-label-apple">신규 단골</p>
        <p class="metric-change-apple">{{ selectedDateRange }}</p>
      </div>

      <div class="metric-apple">
        <p class="metric-value-apple">{{ stats.totalFavorites }}</p>
        <p class="metric-label-apple">총 단골 수</p>
        <p class="metric-change-apple">누적</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const selectedFilter = ref('today')

const dateFilters = [
  { label: '오늘', value: 'today' },
  { label: '이번 주', value: 'week' },
  { label: '이번 달', value: 'month' },
  { label: '전체', value: 'all' }
]

const stats = ref({
  qrUsers: 142,
  couponUsed: 89,
  newFavorites: 23,
  totalFavorites: 1247
})

const selectedDateRange = computed(() => {
  const ranges: Record<string, string> = {
    today: '오늘',
    week: '이번 주',
    month: '이번 달',
    all: '전체'
  }
  return ranges[selectedFilter.value]
})
</script>

<style scoped>
.tab-content {
  padding: 40px;
}

.apple-greeting {
  margin-bottom: 40px;
}

.greeting-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1d1d1f;
}

.greeting-subtitle {
  font-size: 16px;
  color: #6e6e73;
  margin: 0;
}

.global-filter-section {
  margin-bottom: 30px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 12px;
}

.date-filter-apple {
  display: flex;
  gap: 8px;
}

.filter-btn-apple {
  padding: 10px 20px;
  background: #ffffff;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn-apple:hover {
  background: #f5f5f7;
}

.filter-btn-apple.active {
  background: #0071e3;
  border-color: #0071e3;
  color: #ffffff;
}

.metrics-apple {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.metric-apple {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.metric-apple:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.metric-value-apple {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1d1d1f;
}

.metric-label-apple {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: #6e6e73;
}

.metric-change-apple {
  font-size: 14px;
  margin: 0;
  color: #86868b;
}
</style>
