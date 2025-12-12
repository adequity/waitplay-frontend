<template>
  <div class="dashboard-content">

    <!-- 1. Key Metrics Cards -->
    <div class="kpi-grid">
      <div class="metric-card" v-for="(card, index) in topCards" :key="index">
        <div class="card-icon-wrapper" :class="card.color">
          <IconBase :name="card.icon" class="card-icon" />
        </div>
        <div class="card-info">
          <span class="card-label">{{ card.label }}</span>
          <div class="card-value-row">
            <span class="card-value">{{ card.value }}</span>
            <span class="card-unit" v-if="card.unit">{{ card.unit }}</span>
          </div>
        </div>
        <div class="card-trend">
          <span class="trend-badge">{{ card.period }}</span>
        </div>
      </div>
    </div>

    <!-- 2. Alert & Status Cards -->
    <div class="status-grid">
      <div class="status-card" v-for="(card, index) in middleCards" :key="index" :class="{ alert: card.isAlert }">
        <div class="status-header">
          <span class="status-label">{{ card.label }}</span>
          <span class="status-badge" :class="card.isAlert ? 'red' : 'green'">
            {{ card.isAlert ? 'Action Required' : 'Normal' }}
          </span>
        </div>
        <div class="status-body">
          <span class="status-value" :class="card.isAlert ? 'text-red' : 'text-dark'">
            {{ card.value }}
          </span>
          <span class="status-desc">{{ card.subText }}</span>
        </div>
        <button class="btn-arrow" @click="handleStatusCardClick(card)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 3. Real-time Franchise Activity -->
    <div class="activity-section">
      <div class="section-header">
        <div class="title-group">
          <h3 class="section-title">가맹점 실시간 현황</h3>
          <span class="section-subtitle">오늘 쿠폰 사용량 기준 TOP 9</span>
        </div>
        <button class="btn-more" @click="viewAllStores">더보기</button>
      </div>

      <div v-if="loading" class="loading-message">
        데이터를 불러오는 중입니다...
      </div>

      <div v-else-if="topStores.length === 0" class="empty-message">
        아직 가맹점 데이터가 없습니다.
      </div>

      <div v-else class="store-grid">
        <div class="store-card" v-for="(store, index) in topStores" :key="store.id">
          <div class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
          <div class="store-header">
            <span class="store-name">{{ store.name }}</span>
            <span class="store-location">{{ store.location }}</span>
          </div>
          <div class="store-stats">
            <div class="stat-item">
              <span class="stat-label">쿠폰 사용</span>
              <span class="stat-value">{{ store.couponCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">게임 수</span>
              <span class="stat-value">{{ store.gameCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">단골 수</span>
              <span class="stat-value">{{ store.regularCount }}</span>
            </div>
          </div>
          <div class="game-tags">
            <span v-for="game in store.games.slice(0, 2)" :key="game" class="game-tag">
              {{ game }}
            </span>
            <span v-if="store.games.length > 2" class="game-tag more">+{{ store.games.length - 2 }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IconBase from '@/components/IconBase.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

// Data
const topCards = ref([
  { label: '전체 가맹점', value: '0', unit: '개소', period: '로딩중...', icon: 'users', color: 'blue' },
  { label: '전체 이용자', value: '0', unit: '명', period: '로딩중...', icon: 'users', color: 'purple' },
  { label: '오늘 게임 수', value: '0', unit: '건', period: '로딩중...', icon: 'gamepad', color: 'green' },
  { label: '오늘 쿠폰 사용', value: '0', unit: '장', period: '로딩중...', icon: 'gift', color: 'orange' }
])

const middleCards = ref([
  { label: '미처리 CS 문의', value: '0건', subText: '로딩중...', isAlert: false, action: 'inquiries' },
  { label: '가맹점 승인 대기', value: '0건', subText: '로딩중...', isAlert: false, action: 'admins' },
  { label: '서버 상태', value: '확인중', subText: '로딩중...', isAlert: false, action: null },
  { label: '인기 혜택', value: '로딩중', subText: '로딩중...', isAlert: false, action: null }
])

const topStores = ref<any[]>([])
const loading = ref(true)

// Fetch dashboard statistics
const fetchDashboardStats = async () => {
  try {
    const response = await fetch(`${API_URL}/api/superadmin/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch dashboard stats')

    const data = await response.json()
    topCards.value = data.topCards
    middleCards.value = data.middleCards
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
  }
}

// Fetch top stores
const fetchTopStores = async () => {
  try {
    const response = await fetch(`${API_URL}/api/superadmin/dashboard/top-stores`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch top stores')

    const data = await response.json()
    topStores.value = data
  } catch (error) {
    console.error('Failed to fetch top stores:', error)
    // Keep empty array on error
  } finally {
    loading.value = false
  }
}

const handleStatusCardClick = (card: any) => {
  if (card.action) {
    window.dispatchEvent(new CustomEvent('switch-tab', { detail: card.action }))
  }
}

const viewAllStores = () => {
  alert('전체 가맹점 현황은 곧 제공될 예정입니다.')
}

onMounted(async () => {
  await Promise.all([
    fetchDashboardStats(),
    fetchTopStores()
  ])
})
</script>

<style scoped>
/* Common Layout */
.dashboard-content {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px;
}

/* 1. KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.02);
  display: flex;
  align-items: flex-start;
  position: relative;
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}

.card-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}
.card-icon-wrapper.blue { background: #e8f2ff; color: #0071e3; }
.card-icon-wrapper.purple { background: #f3e8ff; color: #9333ea; }
.card-icon-wrapper.green { background: #dcfce7; color: #16a34a; }
.card-icon-wrapper.orange { background: #ffedd5; color: #ea580c; }

.card-icon { width: 24px; height: 24px; }

.card-info { flex: 1; }
.card-label { font-size: 13px; color: #86868b; font-weight: 600; display: block; margin-bottom: 4px; }
.card-value-row { display: flex; align-items: baseline; gap: 4px; }
.card-value { font-size: 28px; font-weight: 800; color: #1d1d1f; letter-spacing: -0.5px; }
.card-unit { font-size: 14px; color: #86868b; font-weight: 500; }

.card-trend {
  position: absolute;
  top: 24px;
  right: 24px;
}
.trend-badge {
  font-size: 11px;
  padding: 4px 8px;
  background: #f5f5f7;
  border-radius: 10px;
  color: #6e6e73;
  font-weight: 500;
}

/* 2. Status Grid */
.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.status-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  border: 1px solid #e5e5ea;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 160px;
  transition: all 0.2s;
}

.status-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transform: translateY(-2px);
}

.status-card.alert {
  border-color: #ffcccc;
  background: linear-gradient(135deg, #fff 0%, #fff5f5 100%);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-label { font-size: 14px; font-weight: 700; color: #1d1d1f; }
.status-badge { font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
.status-badge.red { background: #ff3b30; color: white; }
.status-badge.green { background: #34c759; color: white; }

.status-body { margin-top: auto; }
.status-value { font-size: 24px; font-weight: 800; display: block; margin-bottom: 4px; }
.text-red { color: #ff3b30; }
.text-dark { color: #1d1d1f; }
.status-desc { font-size: 12px; color: #86868b; }

.btn-arrow {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: #d2d2d7;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s;
}
.btn-arrow:hover { color: #1d1d1f; transform: translateX(2px); }

/* 3. Activity Section */
.activity-section {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f5f5f7;
}

.title-group {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.section-title { font-size: 20px; font-weight: 800; color: #1d1d1f; margin: 0; }
.section-subtitle { font-size: 13px; color: #86868b; }
.btn-more {
  font-size: 13px; font-weight: 600; color: #0071e3;
  background: transparent; border: none; cursor: pointer;
  transition: all 0.2s;
}
.btn-more:hover { color: #0056b3; }

.store-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.store-card {
  background: #ffffff;
  border: 1px solid #e5e5ea;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  transition: all 0.2s;
}

.store-card:hover {
  border-color: #8b5cf6;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  transform: translateY(-2px);
}

.rank-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 24px;
  height: 24px;
  background: #f5f5f7;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; color: #86868b;
}
.rank-badge.rank-1 { background: #ffdf00; color: #b4690e; }
.rank-badge.rank-2 { background: #e0e0e0; color: #555; }
.rank-badge.rank-3 { background: #cd7f32; color: #6d3303; }

.store-header {
  margin-bottom: 12px;
  padding-left: 32px;
}
.store-name { font-size: 16px; font-weight: 700; color: #1d1d1f; display: block; }
.store-location { font-size: 12px; color: #86868b; }

.store-stats {
  padding-left: 32px;
  margin-bottom: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-label { font-size: 11px; color: #86868b; font-weight: 600; }
.stat-value { font-size: 16px; font-weight: 800; color: #1d1d1f; }

.game-tags {
  display: flex;
  gap: 6px;
  padding-left: 32px;
}
.game-tag {
  font-size: 11px;
  padding: 4px 8px;
  background: #f5f5f7;
  border-radius: 6px;
  color: #6e6e73;
  font-weight: 500;
}
.game-tag.more { background: white; border: 1px solid #e5e5ea; color: #aeaeb2; }

/* Loading & Empty States */
.loading-message, .empty-message {
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 1400px) {
  .kpi-grid, .status-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .kpi-grid, .status-grid { grid-template-columns: 1fr; }
  .store-grid { grid-template-columns: 1fr; }
  .dashboard-content { padding: 20px; }
}
</style>
