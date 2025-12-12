<template>
  <div class="admin-view">
    <!-- Left Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <IconBase name="logo" class="logo-icon" />
        </div>
        <h2>WaitPlay</h2>
      </div>

      <nav class="sidebar-nav">
        <!-- Main Menu Items -->
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="nav-item"
          :class="{ active: activeTab === tab.id }"
        >
          <div class="nav-icon-wrapper">
            <IconBase :name="tab.iconName" class="nav-icon" />
          </div>
          <span class="nav-label">{{ tab.label }}</span>
        </button>

        <!-- Coupon Verification Button (Special Style) -->
        <button class="nav-item coupon-verify-btn" @click="router.push('/admin/verify-coupon')">
          <div class="nav-icon-wrapper">
            <IconBase name="qr" class="nav-icon" />
          </div>
          <span class="nav-label">쿠폰 검증</span>
        </button>
      </nav>

      <!-- Account Section -->
      <div class="sidebar-account">
        <div class="account-info">
          <div class="account-avatar">
            <!-- Profile Image Fallback -->
            <img v-if="authStore.user?.profileImage" :src="authStore.user.profileImage" alt="프로필" />
            <IconBase v-else name="user" class="avatar-icon" />
          </div>
          <div class="account-details">
            <p class="account-name">{{ authStore.user?.nickname || '관리자' }}</p>
            <p class="account-email">{{ authStore.user?.company || 'WaitPlay Admin' }}</p>
          </div>
        </div>
        <button class="btn-logout" @click="handleLogout">
          <IconBase name="logout" class="logout-icon" />
          로그아웃
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- Tab Components -->
        <DashboardTab v-if="activeTab === 'dashboard'" />
        <QRManagement v-if="activeTab === 'qr'" />
        <GamesTab v-if="activeTab === 'games'" />
        <BenefitsTab v-if="activeTab === 'benefits'" />
        <CustomersTab v-if="activeTab === 'customers'" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'
import DashboardTab from '@/components/DashboardTab.vue'
import QRManagement from '@/components/QRManagement.vue'
import GamesTab from '@/components/GamesTab.vue'
import BenefitsTab from '@/components/BenefitsTab.vue'
import CustomersTab from '@/components/CustomersTab.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const activeTab = ref('dashboard')

const tabs = [
  { id: 'dashboard', label: '대시보드', iconName: 'chart' },
  { id: 'qr', label: 'QR 관리', iconName: 'qr' },
  { id: 'games', label: '게임 설정', iconName: 'gamepad' },
  { id: 'benefits', label: '혜택 설정', iconName: 'gift' },
  { id: 'customers', label: '고객 분석', iconName: 'users' }
]

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    authStore.logout()
    router.push('/login')
  }
}

// Router navigation guard already handles all authentication and authorization
// No additional checks needed here
onMounted(() => {
  // Check for tab query parameter
  const tabParam = route.query.tab as string
  if (tabParam && tabs.find(t => t.id === tabParam)) {
    activeTab.value = tabParam
  }

  // Listen for tab switch events from child components
  window.addEventListener('switch-tab', (event: any) => {
    const tabId = event.detail
    if (tabs.find(t => t.id === tabId)) {
      activeTab.value = tabId
    }
  })
})
</script>

<style scoped>
/* Apple Style Design System
  - CSS Variables defined locally to ensure visibility
*/
.admin-view {
  --sidebar-width: 260px;
  --primary-blue: #0071e3;
  --text-dark: #1d1d1f;
  --text-gray: #86868b;
  --text-light: #aeaeb2;
  --text-light-gray: #aeaeb2;
  --bg-main: #f5f5f7;
  --bg-sidebar: rgba(255, 255, 255, 0.85);
  --border-light: #e5e5ea;
  --btn-radius: 12px;

  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-main);
  overflow: hidden;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-dark);
}

/* Sidebar Styling */
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--bg-sidebar);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  flex-shrink: 0;
  z-index: 100;
  box-sizing: border-box;
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 36px;
  padding-left: 6px;
}

.logo {
  width: 36px;
  height: 36px;
  background: var(--primary-blue);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
}

.logo-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.sidebar-header h2 {
  font-size: 21px;
  font-weight: 800;
  color: var(--text-dark);
  margin: 0;
  letter-spacing: -0.6px;
}

/* Navigation Menu */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: var(--btn-radius);
  color: var(--text-gray);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
}

.nav-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
}

.nav-icon {
  width: 20px;
  height: 20px;
  color: var(--text-light);
  transition: color 0.2s ease;
}

.nav-label {
  flex: 1;
}

/* Hover State */
.nav-item:hover {
  background-color: white;
  color: var(--text-dark);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transform: translateX(2px);
}

.nav-item:hover .nav-icon {
  color: var(--primary-blue);
}

/* Active State */
.nav-item.active {
  background-color: var(--primary-blue);
  color: white !important;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.35);
  transform: translateX(0);
}

.nav-item.active .nav-icon {
  color: white;
}

/* Coupon Verify Button */
.coupon-verify-btn {
  margin-top: 20px;
  background-color: #ffffff;
  color: var(--text-dark);
  border: 1px solid var(--border-light);
  font-weight: 600;
}

.coupon-verify-btn:hover {
  background-color: #f5f5f7;
  border-color: #d2d2d7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.coupon-verify-btn .nav-icon {
  color: var(--primary-blue);
}

/* Account Section */
.sidebar-account {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  margin-bottom: 12px;
  border-radius: 12px;
  transition: background-color 0.2s;
}

.account-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border-light);
  flex-shrink: 0;
}

.account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  width: 20px;
  height: 20px;
  color: var(--text-gray);
}

.account-details {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.account-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-email {
  font-size: 12px;
  color: var(--text-gray);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-logout {
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: 1px solid #d2d2d7;
  border-radius: var(--btn-radius);
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-icon {
  width: 16px;
  height: 16px;
  color: var(--text-gray);
  transition: color 0.2s;
}

.btn-logout:hover {
  background-color: #fff0f3;
  color: #ff3b30;
  border-color: #ffcdd2;
}

.btn-logout:hover .logout-icon {
  color: #ff3b30;
}

/* Main Content */
.main-content {
  flex: 1;
  position: relative;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
