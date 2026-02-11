<template>
  <div class="master-dashboard">
    <div class="dashboard-header">
      <h1>마스터 대시보드</h1>
      <p class="subtitle">전체 시스템 현황을 한눈에 확인하세요</p>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" message="데이터를 불러오는 중..." />

    <!-- Stats Grid -->
    <div v-else class="stats-grid">
      <!-- Total Stats Row -->
      <div class="stat-card primary">
        <div class="stat-icon">
          <IconBase name="users" />
        </div>
        <div class="stat-content">
          <h3>전체 계정</h3>
          <p class="stat-value">{{ stats.totalAccounts }}</p>
          <div class="stat-breakdown">
            <span>Admin: {{ stats.adminCount }}</span>
            <span>SuperAdmin: {{ stats.superadminCount }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card info">
        <div class="stat-icon">
          <IconBase name="qr" />
        </div>
        <div class="stat-content">
          <h3>QR 코드</h3>
          <p class="stat-value">{{ stats.totalQRCodes }}</p>
          <div class="stat-breakdown">
            <span>활성: {{ stats.activeQRCodes }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">
          <IconBase name="gift" />
        </div>
        <div class="stat-content">
          <h3>혜택</h3>
          <p class="stat-value">{{ stats.totalBenefits }}</p>
          <div class="stat-breakdown">
            <span>활성: {{ stats.activeBenefits }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">
          <IconBase name="book" />
        </div>
        <div class="stat-content">
          <h3>방명록</h3>
          <p class="stat-value">{{ stats.totalGuestbook }}</p>
          <div class="stat-breakdown">
            <span>고정: {{ stats.pinnedGuestbook }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card purple">
        <div class="stat-icon">
          <IconBase name="gamepad" />
        </div>
        <div class="stat-content">
          <h3>게임 플레이</h3>
          <p class="stat-value">{{ stats.totalGameScores }}</p>
        </div>
      </div>

      <div class="stat-card orange">
        <div class="stat-icon">
          <IconBase name="message" />
        </div>
        <div class="stat-content">
          <h3>문의</h3>
          <p class="stat-value">{{ stats.totalInquiries }}</p>
          <div class="stat-breakdown">
            <span class="highlight">미답변: {{ stats.unansweredInquiries }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card teal">
        <div class="stat-icon">
          <IconBase name="bell" />
        </div>
        <div class="stat-content">
          <h3>공지사항</h3>
          <p class="stat-value">{{ stats.totalNotices }}</p>
          <div class="stat-breakdown">
            <span>고정: {{ stats.pinnedNotices }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card pink">
        <div class="stat-icon">
          <IconBase name="image" />
        </div>
        <div class="stat-content">
          <h3>에셋</h3>
          <p class="stat-value">{{ stats.totalAssets }}</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="activity-section" v-if="!loading">
      <h2>최근 활동</h2>
      <div class="activity-grid">
        <!-- Recent Accounts -->
        <div class="activity-card">
          <h3>
            <IconBase name="users" class="section-icon" />
            최근 가입 계정
          </h3>
          <ul class="activity-list">
            <li v-for="account in (recentActivity.accounts || [])" :key="account.id">
              <div class="activity-item">
                <span class="item-name">{{ account.nickname || account.username }}</span>
                <span class="item-role" :class="account.userRole">{{ getRoleLabel(account.userRole) }}</span>
              </div>
              <span class="item-date">{{ formatDate(account.createdAt) }}</span>
            </li>
            <li v-if="!recentActivity.accounts || recentActivity.accounts.length === 0" class="empty">
              최근 가입한 계정이 없습니다
            </li>
          </ul>
        </div>

        <!-- Recent Inquiries -->
        <div class="activity-card">
          <h3>
            <IconBase name="message" class="section-icon" />
            최근 문의
          </h3>
          <ul class="activity-list">
            <li v-for="inquiry in (recentActivity.inquiries || [])" :key="inquiry.id">
              <div class="activity-item">
                <span class="item-name">{{ inquiry.title }}</span>
                <span class="item-status" :class="{ answered: inquiry.isAnswered }">
                  {{ inquiry.isAnswered ? '답변완료' : '대기중' }}
                </span>
              </div>
              <span class="item-date">{{ formatDate(inquiry.createdAt) }}</span>
            </li>
            <li v-if="!recentActivity.inquiries || recentActivity.inquiries.length === 0" class="empty">
              최근 문의가 없습니다
            </li>
          </ul>
        </div>

        <!-- Recent Guestbook -->
        <div class="activity-card">
          <h3>
            <IconBase name="book" class="section-icon" />
            최근 방명록
          </h3>
          <ul class="activity-list">
            <li v-for="msg in (recentActivity.guestbook || [])" :key="msg.id">
              <div class="activity-item">
                <span class="item-name">{{ msg.userName }}</span>
                <span class="item-preview">{{ truncate(msg.message, 20) }}</span>
              </div>
              <span class="item-date">{{ formatDate(msg.createdAt) }}</span>
            </li>
            <li v-if="!recentActivity.guestbook || recentActivity.guestbook.length === 0" class="empty">
              최근 방명록이 없습니다
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const loading = ref(true)
const stats = ref({
  totalAccounts: 0,
  adminCount: 0,
  superadminCount: 0,
  totalQRCodes: 0,
  activeQRCodes: 0,
  totalBenefits: 0,
  activeBenefits: 0,
  totalGuestbook: 0,
  pinnedGuestbook: 0,
  totalGameScores: 0,
  totalInquiries: 0,
  unansweredInquiries: 0,
  totalNotices: 0,
  pinnedNotices: 0,
  totalAssets: 0
})

const recentActivity = ref({
  accounts: [] as any[],
  inquiries: [] as any[],
  guestbook: [] as any[]
})

const fetchDashboard = async () => {
  try {
    loading.value = true

    // Fetch stats and recent activity in parallel
    const [statsResponse, activityResponse] = await Promise.all([
      fetch(`${API_URL}/api/masteradmin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`
        }
      }),
      fetch(`${API_URL}/api/masteradmin/system/recent-activity`, {
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`
        }
      })
    ])

    if (!statsResponse.ok) throw new Error('Failed to fetch dashboard stats')

    const data = await statsResponse.json()

    // Map backend response structure to frontend stats
    // Backend returns: accounts, qrCodes, benefits, guestbook, games, inquiries, notices, assets
    stats.value = {
      totalAccounts: data.accounts?.total ?? 0,
      adminCount: data.accounts?.admins ?? 0,
      superadminCount: data.accounts?.superAdmins ?? 0,
      totalQRCodes: data.qrCodes?.total ?? 0,
      activeQRCodes: data.qrCodes?.active ?? 0,
      totalBenefits: data.benefits?.total ?? 0,
      activeBenefits: data.benefits?.active ?? 0,
      totalGuestbook: data.guestbook?.total ?? 0,
      pinnedGuestbook: data.guestbook?.today ?? 0,
      totalGameScores: data.games?.total ?? 0,
      totalInquiries: data.inquiries?.total ?? 0,
      unansweredInquiries: data.inquiries?.pending ?? 0,
      totalNotices: data.notices?.total ?? 0,
      pinnedNotices: data.notices?.pinned ?? 0,
      totalAssets: data.assets?.total ?? 0
    }

    // Fetch recent activity from separate endpoint
    // Backend returns: { recentUsers, recentGames, recentGuestbook }
    if (activityResponse.ok) {
      const activityData = await activityResponse.json()
      recentActivity.value = {
        accounts: activityData.recentUsers ?? [],
        inquiries: activityData.recentInquiries ?? [],
        guestbook: activityData.recentGuestbook ?? []
      }
    }
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    // Ensure recentActivity is always defined
    recentActivity.value = {
      accounts: [],
      inquiries: [],
      guestbook: []
    }
  } finally {
    loading.value = false
  }
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    'masteradmin': '마스터',
    'superadmin': '슈퍼',
    'admin': '관리자',
    'user': '사용자'
  }
  return labels[role] || role
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 1) return '방금 전'
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return date.toLocaleDateString('ko-KR')
}

const truncate = (text: string | null, length: number) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style scoped>
.master-dashboard {
  padding: 0;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 15px;
  color: #86868b;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon :deep(svg) {
  width: 24px;
  height: 24px;
  color: white;
}

.stat-card.primary .stat-icon { background: linear-gradient(135deg, #d4a853, #b8942e); }
.stat-card.info .stat-icon { background: linear-gradient(135deg, #0071e3, #0058b0); }
.stat-card.success .stat-icon { background: linear-gradient(135deg, #34c759, #28a745); }
.stat-card.warning .stat-icon { background: linear-gradient(135deg, #ff9500, #e68900); }
.stat-card.purple .stat-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-card.orange .stat-icon { background: linear-gradient(135deg, #ff6b6b, #ee5a5a); }
.stat-card.teal .stat-icon { background: linear-gradient(135deg, #14b8a6, #0d9488); }
.stat-card.pink .stat-icon { background: linear-gradient(135deg, #ec4899, #db2777); }

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 13px;
  font-weight: 500;
  color: #86868b;
  margin: 0 0 8px 0;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  line-height: 1;
}

.stat-breakdown {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #86868b;
}

.stat-breakdown .highlight {
  color: #ff6b6b;
  font-weight: 600;
}

/* Activity Section */
.activity-section {
  margin-top: 40px;
}

.activity-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 20px 0;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.activity-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.activity-card h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  width: 18px;
  height: 18px;
  color: #d4a853;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-list li {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-list li:last-child {
  border-bottom: none;
}

.activity-list li.empty {
  color: #aeaeb2;
  font-size: 13px;
  justify-content: center;
  padding: 24px 0;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.item-role {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f0f0f0;
  color: #86868b;
}

.item-role.masteradmin { background: #fef3c7; color: #b8942e; }
.item-role.superadmin { background: #ede9fe; color: #7c3aed; }
.item-role.admin { background: #dbeafe; color: #1d4ed8; }

.item-status {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: #fff0f0;
  color: #ff6b6b;
}

.item-status.answered {
  background: #dcfce7;
  color: #16a34a;
}

.item-preview {
  font-size: 12px;
  color: #86868b;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-date {
  font-size: 12px;
  color: #aeaeb2;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .activity-grid {
    grid-template-columns: 1fr;
  }
}
</style>
