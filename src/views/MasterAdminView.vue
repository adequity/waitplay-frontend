<template>
  <div class="masteradmin-view">
    <!-- Left Sidebar Navigation -->
    <aside class="sidebar">
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
          @click="activeTab = tab.id"
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

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const activeTab = ref('dashboard')

const tabs = [
  { id: 'dashboard', label: '대시보드', iconName: 'chart' },
  { id: 'accounts', label: '계정 관리', iconName: 'users' },
  { id: 'qrcodes', label: 'QR 관리', iconName: 'qr' },
  { id: 'benefits', label: '혜택 관리', iconName: 'gift' },
  { id: 'guestbook', label: '방명록 관리', iconName: 'book' },
  { id: 'notices', label: '공지사항', iconName: 'bell' },
  { id: 'inquiries', label: '문의 관리', iconName: 'message' },
  { id: 'games', label: '게임 관리', iconName: 'gamepad' },
  { id: 'assets', label: '에셋 관리', iconName: 'image' }
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

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
