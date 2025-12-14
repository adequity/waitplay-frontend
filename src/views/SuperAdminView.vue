<template>
  <div class="superadmin-view">
    <!-- Left Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo superadmin-logo">
          <IconBase name="logo" class="logo-icon" />
        </div>
        <div>
          <h2>WaitPlay</h2>
          <p class="superadmin-badge">SUPER ADMIN</p>
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

      <!-- Invite Code Section -->
      <div class="invite-code-section">
        <div class="invite-code-label">
          <IconBase name="gift" class="invite-icon" />
          <span>초대 코드</span>
        </div>
        <div class="invite-code-box">
          <span class="invite-code-text">{{ inviteCode || '...' }}</span>
          <button class="btn-copy-small" @click="copyInviteCode" :disabled="!inviteCode" :title="copied ? '복사됨!' : '복사'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Account Section -->
      <div class="sidebar-account">
        <div class="account-info">
          <div class="account-avatar superadmin-avatar">
            <img v-if="authStore.user?.profileImage" :src="authStore.user.profileImage" alt="프로필" />
            <IconBase v-else name="user" class="avatar-icon" />
          </div>
          <div class="account-details">
            <p class="account-name">{{ authStore.user?.nickname || '슈퍼관리자' }}</p>
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
        <SuperAdminDashboard v-if="activeTab === 'dashboard'" />
        <AdminManagement v-if="activeTab === 'admins'" />
        <InquiryManagement v-if="activeTab === 'inquiries'" />
        <NoticeManagement v-if="activeTab === 'notices'" />
        <AssetManagement v-if="activeTab === 'assets'" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'
import SuperAdminDashboard from '@/components/SuperAdminDashboard.vue'
import AdminManagement from '@/components/AdminManagement.vue'
import InquiryManagement from '@/components/InquiryManagement.vue'
import NoticeManagement from '@/components/NoticeManagement.vue'
import AssetManagement from '@/components/AssetManagement.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const activeTab = ref('dashboard')
const inviteCode = ref('')
const copied = ref(false)

const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const tabs = [
  { id: 'dashboard', label: '대시보드', iconName: 'chart' },
  { id: 'admins', label: 'Admin 관리', iconName: 'users' },
  { id: 'inquiries', label: '문의 관리', iconName: 'message' },
  { id: 'notices', label: '공지사항', iconName: 'bell' },
  { id: 'assets', label: '에셋 관리', iconName: 'image' }
]

// Fetch invite code
const fetchInviteCode = async () => {
  try {
    const response = await fetch(`${API_URL}/api/superadmin/invite-code`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch invite code')

    const data = await response.json()
    inviteCode.value = data.inviteCode
  } catch (error) {
    console.error('Failed to fetch invite code:', error)
  }
}

// Copy invite code to clipboard
const copyInviteCode = async () => {
  try {
    await navigator.clipboard.writeText(inviteCode.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch (error) {
    console.error('Failed to copy invite code:', error)
  }
}

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    authStore.logout()
    router.push('/login')
  }
}

onMounted(() => {
  // Fetch invite code
  fetchInviteCode()

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
/* SuperAdmin Style Design System */
.superadmin-view {
  --sidebar-width: 260px;
  --primary-purple: #8b5cf6;
  --primary-purple-dark: #7c3aed;
  --text-dark: #1d1d1f;
  --text-gray: #86868b;
  --text-light: #aeaeb2;
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

.superadmin-logo {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-purple-dark) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
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

.superadmin-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--primary-purple);
  margin: 2px 0 0 0;
  letter-spacing: 0.5px;
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
  color: var(--primary-purple);
}

/* Active State */
.nav-item.active {
  background: linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-purple-dark) 100%);
  color: white !important;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
  transform: translateX(0);
}

.nav-item.active .nav-icon {
  color: white;
}

/* Invite Code Section */
.invite-code-section {
  padding: 14px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 12px;
  margin-bottom: 16px;
}

.invite-code-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--primary-purple);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.invite-icon {
  width: 14px;
  height: 14px;
}

.invite-code-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: white;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.invite-code-text {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  font-weight: 800;
  color: var(--primary-purple);
  letter-spacing: 2px;
  flex: 1;
}

.btn-copy-small {
  padding: 6px;
  background: rgba(139, 92, 246, 0.1);
  border: none;
  border-radius: 6px;
  color: var(--primary-purple);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-copy-small:hover:not(:disabled) {
  background: var(--primary-purple);
  color: white;
  transform: scale(1.05);
}

.btn-copy-small:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

.superadmin-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-purple-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid var(--primary-purple);
  flex-shrink: 0;
}

.superadmin-avatar img {
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
