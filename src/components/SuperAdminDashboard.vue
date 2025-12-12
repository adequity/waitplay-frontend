<template>
  <div class="superadmin-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1>전체 통계</h1>
      <p class="header-subtitle">WaitPlay 전체 시스템 현황을 모니터링합니다</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card purple">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">총 Admin 수</p>
          <h3 class="stat-value">{{ stats.totalAdmins }}</h3>
        </div>
      </div>

      <div class="stat-card blue">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">총 사용자 수</p>
          <h3 class="stat-value">{{ stats.totalUsers }}</h3>
        </div>
      </div>

      <div class="stat-card orange">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">대기중 문의</p>
          <h3 class="stat-value">{{ stats.waitingInquiries }}</h3>
        </div>
      </div>

      <div class="stat-card green">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div class="stat-info">
          <p class="stat-label">시스템 상태</p>
          <h3 class="stat-value">정상</h3>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="activity-section">
      <div class="section-header">
        <h2>최근 활동</h2>
        <p>최근 Admin 및 시스템 활동 내역</p>
      </div>

      <div class="activity-list">
        <div v-if="loadingActivities" class="loading-state">
          <div class="spinner"></div>
          <p>활동 내역을 불러오는 중...</p>
        </div>

        <div v-else-if="activities.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <p>활동 내역이 없습니다</p>
        </div>

        <div v-else class="activity-items">
          <div v-for="activity in activities" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="activity.type">
              <svg v-if="activity.type === 'inquiry'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <svg v-else-if="activity.type === 'admin'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.text }}</p>
              <p class="activity-time">{{ formatTime(activity.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <div class="section-header">
        <h2>빠른 작업</h2>
        <p>자주 사용하는 기능</p>
      </div>

      <div class="actions-grid">
        <button class="action-card" @click="switchTab('admins')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          <span>Admin 생성</span>
        </button>

        <button class="action-card" @click="switchTab('inquiries')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>문의 확인</span>
        </button>

        <button class="action-card" @click="refreshData">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          <span>새로고침</span>
        </button>

        <button class="action-card" @click="viewLogs">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>시스템 로그</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface Stats {
  totalAdmins: number
  totalUsers: number
  waitingInquiries: number
}

interface Activity {
  id: string
  type: 'inquiry' | 'admin' | 'system'
  text: string
  createdAt: string
}

const authStore = useAuthStore()
const loadingActivities = ref(false)

const stats = ref<Stats>({
  totalAdmins: 0,
  totalUsers: 0,
  waitingInquiries: 0
})

const activities = ref<Activity[]>([])

const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const fetchStats = async () => {
  try {
    const response = await fetch(`${API_URL}/api/stats/superadmin`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch stats')

    const data = await response.json()
    stats.value = data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    // Use mock data for now
    stats.value = {
      totalAdmins: 0,
      totalUsers: 0,
      waitingInquiries: 0
    }
  }
}

const fetchActivities = async () => {
  loadingActivities.value = true
  try {
    const response = await fetch(`${API_URL}/api/activities/recent`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch activities')

    const data = await response.json()
    activities.value = data
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    // Use mock data for now
    activities.value = []
  } finally {
    loadingActivities.value = false
  }
}

const switchTab = (tabId: string) => {
  window.dispatchEvent(new CustomEvent('switch-tab', { detail: tabId }))
}

const refreshData = () => {
  fetchStats()
  fetchActivities()
}

const viewLogs = () => {
  alert('시스템 로그 기능은 곧 제공될 예정입니다.')
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return '방금 전'
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchStats()
  fetchActivities()
})
</script>

<style scoped>
.superadmin-dashboard {
  padding: 40px;
  min-height: 100vh;
}

/* Dashboard Header */
.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-header h1 {
  font-size: 32px;
  font-weight: 800;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.header-subtitle {
  font-size: 15px;
  color: #86868b;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card.purple .stat-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  color: white;
}

.stat-card.blue .stat-icon {
  background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
  color: white;
}

.stat-card.orange .stat-icon {
  background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);
  box-shadow: 0 4px 12px rgba(245, 124, 0, 0.3);
  color: white;
}

.stat-card.green .stat-icon {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #86868b;
  margin: 0 0 6px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #1d1d1f;
  margin: 0;
}

/* Activity Section */
.activity-section,
.quick-actions {
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.section-header p {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #86868b;
}

.loading-state p,
.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

.empty-state svg {
  color: #d2d2d7;
}

.activity-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f9f9fb;
  border-radius: 12px;
  transition: all 0.2s;
}

.activity-item:hover {
  background: #f5f5f7;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.inquiry {
  background: #fff3e0;
  color: #f57c00;
}

.activity-icon.admin {
  background: #f3e5f5;
  color: #8b5cf6;
}

.activity-icon.system {
  background: #e8f5e9;
  color: #2e7d32;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.activity-time {
  font-size: 12px;
  color: #aeaeb2;
  margin: 0;
}

/* Quick Actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #f9f9fb;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
  transform: translateY(-2px);
}

.action-card svg {
  color: #8b5cf6;
}

.action-card span {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
