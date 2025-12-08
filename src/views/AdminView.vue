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
          <span class="nav-dot"></span>
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
        <button class="btn-logout" @click="handleLogout">
          <span>로그아웃</span>
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
import { ref } from 'vue'
import DashboardTab from '@/components/DashboardTab.vue'
import QRManagement from '@/components/QRManagement.vue'
import GamesTab from '@/components/GamesTab.vue'
import BenefitsTab from '@/components/BenefitsTab.vue'
import CustomersTab from '@/components/CustomersTab.vue'

const activeTab = ref('dashboard')

const tabs = [
  { id: 'dashboard', label: '대시보드', icon: '📊' },
  { id: 'qr', label: 'QR 관리', icon: '📱' },
  { id: 'games', label: '게임 설정', icon: '🎮' },
  { id: 'benefits', label: '혜택 설정', icon: '🎁' },
  { id: 'customers', label: '고객 분석', icon: '👥' }
]

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    // TODO: Implement logout logic
    window.location.href = '/'
  }
}
</script>

<style scoped>
@import '../assets/admin-styles.css';
</style>
