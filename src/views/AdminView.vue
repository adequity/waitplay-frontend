<template>
  <div class="admin-view" :class="{ 'sidebar-open': isSidebarOpen }">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <button class="hamburger-btn" @click="toggleSidebar" aria-label="메뉴 열기">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      <div class="mobile-logo">
        <IconBase name="logo" class="mobile-logo-icon" />
        <span>WaitPlay</span>
      </div>
      <div class="mobile-avatar" @click="toggleSidebar">
        <img v-if="authStore.user?.profileImage" :src="authStore.user.profileImage" alt="프로필" />
        <IconBase v-else name="user" class="avatar-icon" />
      </div>
    </header>

    <!-- Sidebar Overlay (Mobile) -->
    <div class="sidebar-overlay" @click="closeSidebar"></div>

    <!-- Left Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-close-btn" @click="closeSidebar">
        <IconBase name="close" class="close-icon" />
      </div>
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
          @click="selectTab(tab.id)"
          class="nav-item"
          :class="{ active: activeTab === tab.id }"
        >
          <div class="nav-icon-wrapper">
            <IconBase :name="tab.iconName" class="nav-icon" />
          </div>
          <span class="nav-label">{{ tab.label }}</span>
        </button>

        <!-- Coupon Verification Button (Special Style) -->
        <button class="nav-item coupon-verify-btn" @click="goToVerifyCoupon">
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
        <GuestbookManageTab v-if="activeTab === 'guestbook'" />
        <CustomersTab v-if="activeTab === 'customers'" />
        <CustomerSupportTab v-if="activeTab === 'cs'" />
        <CalendarManageTab v-if="activeTab === 'calendar'" />
        <SettingsTab v-if="activeTab === 'settings'" />
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
import CustomerSupportTab from '@/components/CustomerSupportTab.vue'
import GuestbookManageTab from '@/components/GuestbookManageTab.vue'
import CalendarManageTab from '@/components/CalendarManageTab.vue'
import SettingsTab from '@/components/SettingsTab.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const activeTab = ref('dashboard')
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const selectTab = (tabId: string) => {
  activeTab.value = tabId
  closeSidebar()
}

const goToVerifyCoupon = () => {
  closeSidebar()
  router.push('/admin/verify-coupon')
}

const tabs = [
  { id: 'dashboard', label: '대시보드', iconName: 'chart' },
  { id: 'qr', label: 'QR 관리', iconName: 'qr' },
  { id: 'games', label: '게임 설정', iconName: 'gamepad' },
  { id: 'benefits', label: '혜택 설정', iconName: 'gift' },
  { id: 'guestbook', label: '방명록 관리', iconName: 'book' },
  { id: 'customers', label: '고객 분석', iconName: 'users' },
  { id: 'cs', label: 'CS 게시판', iconName: 'message' },
  { id: 'calendar', label: '캘린더 관리', iconName: 'calendar' },
  { id: 'settings', label: '설정', iconName: 'settings' }
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

/* Mobile Header */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--bg-sidebar);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-light);
  padding: 0 16px;
  align-items: center;
  justify-content: space-between;
  z-index: 200;
}

.hamburger-btn {
  width: 44px;
  height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: background-color 0.2s;
}

.hamburger-btn:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.hamburger-line {
  width: 22px;
  height: 2px;
  background-color: var(--text-dark);
  border-radius: 2px;
  transition: all 0.3s;
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
}

.mobile-logo-icon {
  width: 28px;
  height: 28px;
  color: var(--primary-blue);
}

.mobile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border-light);
  cursor: pointer;
}

.mobile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-avatar .avatar-icon {
  width: 18px;
  height: 18px;
  color: var(--text-gray);
}

/* Sidebar Overlay */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 150;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Sidebar Close Button */
.sidebar-close-btn {
  display: none;
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar-close-btn:active {
  background: rgba(0, 0, 0, 0.1);
}

.close-icon {
  width: 20px;
  height: 20px;
  color: var(--text-gray);
}

/* Responsive */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
    pointer-events: none;
  }

  .admin-view.sidebar-open .sidebar-overlay {
    opacity: 1;
    pointer-events: auto;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: none;
    z-index: 300;
  }

  .admin-view.sidebar-open .sidebar {
    transform: translateX(0);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  }

  .sidebar-close-btn {
    display: flex;
  }

  .main-content {
    padding-top: 56px;
  }

  .content-wrapper {
    padding: 16px;
  }
}

/* Small Mobile */
@media (max-width: 480px) {
  .sidebar {
    width: 280px;
  }

  .content-wrapper {
    padding: 12px;
  }

  .nav-item {
    padding: 14px 16px;
  }
}
</style>
