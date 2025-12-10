<template>
  <div class="admin-view">
    <!-- Left Sidebar Navigation -->
    <aside class="sidebar">
      <a href="#" class="logo">
        <i class="fa-solid fa-shapes"></i> WaitPlay
      </a>

      <ul class="nav-menu">
        <li
          v-for="tab in tabs"
          :key="tab.id"
          class="nav-item"
        >
          <a
            @click.prevent="activeTab = tab.id"
            :class="['nav-link', { active: activeTab === tab.id }]"
          >
            <i :class="tab.iconClass"></i> {{ tab.label }}
          </a>
        </li>
      </ul>

      <!-- User Profile Section -->
      <div class="user-profile">
        <div class="profile-card">
          <div class="avatar">
            <i v-if="!authStore.user?.profileImage" class="fa-regular fa-user"></i>
            <img v-else :src="authStore.user.profileImage" alt="프로필" />
          </div>
          <div class="user-info">
            <h4>{{ authStore.user?.nickname || '관리자' }}</h4>
            <p>{{ authStore.user?.company || 'admin@waitplay.com' }}</p>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          로그아웃
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Dashboard Tab -->
      <DashboardTab v-show="activeTab === 'dashboard'" />

      <!-- QR Management Tab -->
      <QRManagement v-show="activeTab === 'qr'" />

      <!-- Games Management Tab -->
      <GamesTab v-show="activeTab === 'games'" />

      <!-- Benefits Tab -->
      <BenefitsTab v-show="activeTab === 'benefits'" />

      <!-- Customers Tab -->
      <CustomersTab v-show="activeTab === 'customers'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardTab from '@/components/DashboardTab.vue'
import QRManagement from '@/components/QRManagement.vue'
import GamesTab from '@/components/GamesTab.vue'
import BenefitsTab from '@/components/BenefitsTab.vue'
import CustomersTab from '@/components/CustomersTab.vue'

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref('dashboard')

const tabs = [
  { id: 'dashboard', label: '대시보드', iconClass: 'fa-solid fa-chart-pie' },
  { id: 'qr', label: 'QR관리', iconClass: 'fa-solid fa-qrcode' },
  { id: 'games', label: '게임관리', iconClass: 'fa-solid fa-gamepad' },
  { id: 'benefits', label: '혜택설정', iconClass: 'fa-solid fa-gift' },
  { id: 'customers', label: '고객분석', iconClass: 'fa-solid fa-users' }
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
.admin-view {
  display: flex;
  background-color: #f4f6f9;
  height: 100vh;
  overflow: hidden;
}

/* --- Sidebar --- */
.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  padding: 24px;
  flex-shrink: 0;
  z-index: 10;
}

.logo {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #212529;
  text-decoration: none;
  letter-spacing: -0.5px;
  cursor: pointer;
}

.logo i {
  color: #007bff;
  font-size: 26px;
}

.nav-menu {
  list-style: none;
  flex-grow: 1;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: #495057;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-link i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
  color: #adb5bd;
}

.nav-link:hover {
  background-color: #f4f6f9;
  color: #212529;
}

.nav-link:hover i {
  color: #212529;
}

.nav-link.active {
  background-color: #007bff;
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
}

.nav-link.active i {
  color: white;
}

.user-profile {
  margin-top: auto;
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
}

.profile-card {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 18px;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info h4 {
  font-size: 14px;
  margin-bottom: 2px;
  font-weight: 700;
  color: #212529;
}

.user-info p {
  font-size: 12px;
  color: #868e96;
  margin: 0;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background: #f1f3f5;
  border: none;
  border-radius: 8px;
  color: #495057;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #e9ecef;
}

/* --- Main Content Area --- */
.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f4f6f9;
}
</style>
