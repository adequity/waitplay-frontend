<template>
  <div class="masteradmin-view" :class="{ 'sidebar-open': isSidebarOpen }">
    <!-- Mobile Header -->
    <header class="mobile-header">
      <button class="hamburger-btn" @click="toggleSidebar" aria-label="메뉴 열기">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      <div class="mobile-logo">
        <IconBase name="crown" class="mobile-logo-icon" />
        <span>MASTER</span>
      </div>
      <div class="mobile-avatar" @click="toggleSidebar">
        <img v-if="authStore.user?.profileImage" :src="authStore.user.profileImage" alt="프로필" />
        <IconBase v-else name="crown" class="avatar-icon" />
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
        <div class="logo masteradmin-logo">
          <IconBase name="crown" class="logo-icon" />
        </div>
        <div>
          <h2>WaitPlay</h2>
          <p class="masteradmin-badge">MASTER ADMIN</p>
        </div>
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
      </nav>

      <!-- Account Section -->
      <div class="sidebar-account">
        <div class="account-info">
          <div class="account-avatar masteradmin-avatar">
            <img v-if="authStore.user?.profileImage" :src="authStore.user.profileImage" alt="프로필" />
            <IconBase v-else name="crown" class="avatar-icon" />
          </div>
          <div class="account-details">
            <p class="account-name">{{ authStore.user?.nickname || '마스터관리자' }}</p>
            <p class="account-email">{{ authStore.user?.company || 'WaitPlay' }}</p>
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
        <MasterDashboard v-if="activeTab === 'dashboard'" />
        <MasterAccountsManagement v-if="activeTab === 'accounts'" />
        <MasterQRManagement v-if="activeTab === 'qrcodes'" />
        <MasterBenefitsManagement v-if="activeTab === 'benefits'" />
        <MasterGuestbookManagement v-if="activeTab === 'guestbook'" />
        <MasterNoticesManagement v-if="activeTab === 'notices'" />
        <MasterInquiriesManagement v-if="activeTab === 'inquiries'" />
        <MasterGamesManagement v-if="activeTab === 'games'" />
        <MasterAssetsManagement v-if="activeTab === 'assets'" />
        <MasterBgmManagement v-if="activeTab === 'bgm'" />
        <MasterCalendarManagement v-if="activeTab === 'calendar'" />
        <MasterSettingsManagement v-if="activeTab === 'settings'" />
        <SidebarAdManagement v-if="activeTab === 'sidebar-ads'" />
        <MasterVillageAdManagement v-if="activeTab === 'village-ads'" />
        <MasterStoreRoomManagement v-if="activeTab === 'store-rooms'" />
        <MasterRoomAssetManagement v-if="activeTab === 'room-assets'" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'
import MasterDashboard from '@/components/master/MasterDashboard.vue'
import MasterAccountsManagement from '@/components/master/MasterAccountsManagement.vue'
import MasterQRManagement from '@/components/master/MasterQRManagement.vue'
import MasterBenefitsManagement from '@/components/master/MasterBenefitsManagement.vue'
import MasterGuestbookManagement from '@/components/master/MasterGuestbookManagement.vue'
import MasterNoticesManagement from '@/components/master/MasterNoticesManagement.vue'
import MasterInquiriesManagement from '@/components/master/MasterInquiriesManagement.vue'
import MasterGamesManagement from '@/components/master/MasterGamesManagement.vue'
import MasterAssetsManagement from '@/components/master/MasterAssetsManagement.vue'
import MasterBgmManagement from '@/components/master/MasterBgmManagement.vue'
import MasterCalendarManagement from '@/components/master/MasterCalendarManagement.vue'
import MasterSettingsManagement from '@/components/master/MasterSettingsManagement.vue'
import SidebarAdManagement from '@/components/SidebarAdManagement.vue'
import MasterVillageAdManagement from '@/components/master/MasterVillageAdManagement.vue'
import MasterStoreRoomManagement from '@/components/master/MasterStoreRoomManagement.vue'
import MasterRoomAssetManagement from '@/components/master/MasterRoomAssetManagement.vue'

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

const tabs = [
  { id: 'dashboard', label: '대시보드', iconName: 'chart' },
  { id: 'accounts', label: '계정 관리', iconName: 'users' },
  { id: 'qrcodes', label: 'QR 관리', iconName: 'qr' },
  { id: 'benefits', label: '혜택 관리', iconName: 'gift' },
  { id: 'guestbook', label: '방명록 관리', iconName: 'book' },
  { id: 'notices', label: '공지사항', iconName: 'bell' },
  { id: 'inquiries', label: '문의 관리', iconName: 'message' },
  { id: 'games', label: '게임 관리', iconName: 'gamepad' },
  { id: 'assets', label: '에셋 관리', iconName: 'image' },
  { id: 'bgm', label: 'BGM 관리', iconName: 'music' },
  { id: 'calendar', label: '캘린더 관리', iconName: 'calendar' },
  { id: 'sidebar-ads', label: '사이드 광고', iconName: 'image' },
  { id: 'village-ads', label: '빌리지 광고', iconName: 'image' },
  { id: 'store-rooms', label: '매장 룸', iconName: 'grid' },
  { id: 'room-assets', label: '룸 에셋', iconName: 'image' },
  { id: 'settings', label: '설정', iconName: 'settings' }
]

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    authStore.logout()
    router.push('/login')
  }
}

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
/* MasterAdmin Style Design System - Premium Gold Theme */
.masteradmin-view {
  --sidebar-width: 260px;
  --primary-gold: #d4a853;
  --primary-gold-dark: #b8942e;
  --primary-gold-light: #f5e6c8;
  --text-dark: #1d1d1f;
  --text-gray: #86868b;
  --text-light: #aeaeb2;
  --bg-main: #faf9f7;
  --bg-sidebar: rgba(255, 255, 255, 0.92);
  --border-light: #e8e6e1;
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

.masteradmin-logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-gold) 0%, var(--primary-gold-dark) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(212, 168, 83, 0.45);
}

.logo-icon {
  width: 22px;
  height: 22px;
  color: white;
}

.sidebar-header h2 {
  font-size: 21px;
  font-weight: 800;
  color: var(--text-dark);
  margin: 0;
  letter-spacing: -0.6px;
}

.masteradmin-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--primary-gold-dark);
  margin: 2px 0 0 0;
  letter-spacing: 0.8px;
  background: linear-gradient(90deg, var(--primary-gold) 0%, var(--primary-gold-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Navigation Menu */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
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
  color: var(--primary-gold);
}

/* Active State */
.nav-item.active {
  background: linear-gradient(135deg, var(--primary-gold) 0%, var(--primary-gold-dark) 100%);
  color: white !important;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(212, 168, 83, 0.4);
  transform: translateX(0);
}

.nav-item.active .nav-icon {
  color: white;
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

.masteradmin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-gold) 0%, var(--primary-gold-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid var(--primary-gold);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(212, 168, 83, 0.3);
}

.masteradmin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  width: 20px;
  height: 20px;
  color: white;
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
  max-width: 1800px;
  margin: 0 auto;
  padding: 40px;
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
  color: var(--primary-gold-dark);
}

.mobile-logo-icon {
  width: 28px;
  height: 28px;
  color: var(--primary-gold);
}

.mobile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-gold) 0%, var(--primary-gold-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid var(--primary-gold);
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
  color: white;
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

  .masteradmin-view.sidebar-open .sidebar-overlay {
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

  .masteradmin-view.sidebar-open .sidebar {
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
