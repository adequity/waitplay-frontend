<template>
  <div class="tab-content">
    <!-- Apple-Style Greeting -->
    <div class="apple-greeting">
      <h1 class="greeting-title">고객 분석</h1>
      <p class="greeting-subtitle">고객 활동 및 참여 데이터를 확인하세요.</p>
    </div>

    <!-- Customer Stats -->
    <div class="customer-stats">
      <div class="stat-card">
        <div class="stat-icon-wrapper">
          <i class="fa-solid fa-users"></i>
        </div>
        <div class="stat-content">
          <p class="stat-value">1,247</p>
          <p class="stat-label">총 고객 수</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper star">
          <i class="fa-solid fa-star"></i>
        </div>
        <div class="stat-content">
          <p class="stat-value">823</p>
          <p class="stat-label">단골 고객</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper game">
          <i class="fa-solid fa-gamepad"></i>
        </div>
        <div class="stat-content">
          <p class="stat-value">68%</p>
          <p class="stat-label">게임 참여율</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper ticket">
          <i class="fa-solid fa-ticket"></i>
        </div>
        <div class="stat-content">
          <p class="stat-value">82%</p>
          <p class="stat-label">쿠폰 사용률</p>
        </div>
      </div>
    </div>

    <!-- Recent Customers Table -->
    <div class="customers-table-section">
      <div class="section-header">
        <h2 class="section-title">최근 활동 고객</h2>
        <button class="btn-export">데이터 내보내기</button>
      </div>

      <div class="table-container">
        <table class="customers-table">
          <thead>
            <tr>
              <th>고객 이름</th>
              <th>마지막 방문</th>
              <th>총 플레이</th>
              <th>평균 점수</th>
              <th>쿠폰 사용</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.id">
              <td class="customer-name">{{ customer.name }}</td>
              <td>{{ customer.lastVisit }}</td>
              <td>{{ customer.totalPlays }}회</td>
              <td>{{ customer.avgScore }}점</td>
              <td>{{ customer.couponsUsed }}개</td>
              <td>
                <span :class="['status-badge', customer.status]">
                  {{ customer.status === 'regular' ? '단골' : '신규' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Customer {
  id: string
  name: string
  lastVisit: string
  totalPlays: number
  avgScore: number
  couponsUsed: number
  status: 'regular' | 'new'
}

const customers = ref<Customer[]>([
  {
    id: '1',
    name: '김단골',
    lastVisit: '2024-01-08',
    totalPlays: 42,
    avgScore: 8.5,
    couponsUsed: 15,
    status: 'regular'
  },
  {
    id: '2',
    name: '이고객',
    lastVisit: '2024-01-08',
    totalPlays: 28,
    avgScore: 7.8,
    couponsUsed: 12,
    status: 'regular'
  },
  {
    id: '3',
    name: '박신규',
    lastVisit: '2024-01-07',
    totalPlays: 3,
    avgScore: 8.2,
    couponsUsed: 2,
    status: 'new'
  },
  {
    id: '4',
    name: '최방문',
    lastVisit: '2024-01-07',
    totalPlays: 15,
    avgScore: 7.5,
    couponsUsed: 8,
    status: 'regular'
  },
  {
    id: '5',
    name: '정참여',
    lastVisit: '2024-01-06',
    totalPlays: 6,
    avgScore: 8.9,
    couponsUsed: 4,
    status: 'new'
  }
])
</script>

<style scoped>
.tab-content {
  padding: 40px;
}

.apple-greeting {
  margin-bottom: 40px;
}

.greeting-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1d1d1f;
}

.greeting-subtitle {
  font-size: 16px;
  color: #6e6e73;
  margin: 0;
}

.customer-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-wrapper i {
  font-size: 32px;
  color: white;
}

.stat-icon-wrapper.star {
  background: linear-gradient(135deg, #ffd93d 0%, #ff9500 100%);
}

.stat-icon-wrapper.game {
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
}

.stat-icon-wrapper.ticket {
  background: linear-gradient(135deg, #ff375f 0%, #ff6482 100%);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #1d1d1f;
}

.stat-label {
  font-size: 14px;
  margin: 0;
  color: #6e6e73;
}

.customers-table-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #1d1d1f;
}

.btn-export {
  padding: 10px 20px;
  background: #0071e3;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-export:hover {
  background: #0077ed;
}

.table-container {
  overflow-x: auto;
}

.customers-table {
  width: 100%;
  border-collapse: collapse;
}

.customers-table th {
  text-align: left;
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #86868b;
  border-bottom: 2px solid #f5f5f7;
}

.customers-table td {
  padding: 16px 12px;
  font-size: 15px;
  color: #1d1d1f;
  border-bottom: 1px solid #f5f5f7;
}

.customer-name {
  font-weight: 600;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.regular {
  background: #34c759;
  color: #ffffff;
}

.status-badge.new {
  background: #ff9500;
  color: #ffffff;
}
</style>
