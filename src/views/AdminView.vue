<template>
  <div class="admin-view">
    <!-- Left Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">⚙️</div>
        <h2>WaitPlay</h2>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </nav>

      <!-- Account Section -->
      <div class="sidebar-account">
        <div class="account-info">
          <div class="account-avatar">👤</div>
          <div class="account-details">
            <p class="account-name">관리자</p>
            <p class="account-email">admin@waitplay.com</p>
          </div>
        </div>
        <button class="btn-logout">
          <span>로그아웃</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <div class="content-header">
        <h1>{{ tabs.find(t => t.id === activeTab)?.label }}</h1>
      </div>

      <!-- Component-based tabs -->
      <DashboardTab v-show="activeTab === 'dashboard'" />
      <QRManagement v-show="activeTab === 'qr'" />
      <GamesTab v-show="activeTab === 'games'" />
      <BenefitsTab v-show="activeTab === 'benefits'" />
      <CustomersTab v-show="activeTab === 'customers'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashboardTab from '@/components/DashboardTab.vue'
import QRManagement from '@/components/QRManagement.vue'
import GamesTab from '@/components/GamesTab.vue'
import BenefitsTab from '@/components/BenefitsTab.vue'
import CustomersTab from '@/components/CustomersTab.vue'

const activeTab = ref('dashboard')

const tabs = [
  { id: 'dashboard', label: '대시보드', icon: '▪' },
  { id: 'qr', label: 'QR관리', icon: '▫' },
  { id: 'games', label: '게임관리', icon: '▪' },
  { id: 'benefits', label: '혜택설정', icon: '▫' },
  { id: 'customers', label: '고객분석', icon: '▪' }
]
</script>

<style scoped>
.admin-view {
  display: flex;
  height: 100vh;
  background: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #1d1d1f 0%, #2d2d2f 100%);
  color: #f5f5f7;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
}

.sidebar-header {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  font-size: 28px;
}

.sidebar-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #a1a1a6;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 15px;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f5f5f7;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.nav-icon {
  font-size: 18px;
}

.sidebar-account {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.account-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.account-details {
  flex: 1;
}

.account-name {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #ffffff;
}

.account-email {
  font-size: 12px;
  margin: 0;
  color: #a1a1a6;
}

.btn-logout {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 8px;
  color: #f5f5f7;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.12);
}

/* Main Content */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.content-header {
  background: #ffffff;
  padding: 24px 40px;
  border-bottom: 1px solid #e5e5ea;
  position: sticky;
  top: 0;
  z-index: 10;
}

.content-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #1d1d1f;
}
</style>
