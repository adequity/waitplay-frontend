<template>
  <div class="tab-content">
    <!-- Apple-Style Greeting -->
    <div class="apple-greeting">
      <h1 class="greeting-title">혜택 설정</h1>
      <p class="greeting-subtitle">게임별 쿠폰 혜택을 관리하세요.</p>
    </div>

    <!-- Benefits List -->
    <div class="benefits-list">
      <div v-for="benefit in benefits" :key="benefit.id" class="benefit-card">
        <div class="benefit-header">
          <h3 class="benefit-title">{{ benefit.title }}</h3>
          <span class="benefit-score">{{ benefit.requiredScore }}점 이상</span>
        </div>

        <p class="benefit-description">{{ benefit.description }}</p>

        <div class="benefit-stats">
          <div class="stat-item">
            <span class="stat-label">발급 횟수</span>
            <span class="stat-value">{{ benefit.stats.issued }}회</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">사용 횟수</span>
            <span class="stat-value">{{ benefit.stats.used }}회</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">사용률</span>
            <span class="stat-value">{{ benefit.stats.usageRate }}%</span>
          </div>
        </div>

        <div class="benefit-actions">
          <button class="btn-edit">수정</button>
          <button class="btn-delete">삭제</button>
        </div>
      </div>

      <button class="btn-add-benefit">
        <span>+</span>
        <span>새 혜택 추가</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Benefit {
  id: string
  title: string
  description: string
  requiredScore: number
  stats: {
    issued: number
    used: number
    usageRate: number
  }
}

const benefits = ref<Benefit[]>([
  {
    id: '1',
    title: '음료 1잔 무료',
    description: '아메리카노, 카페라떼 중 선택 가능',
    requiredScore: 8,
    stats: { issued: 145, used: 118, usageRate: 81 }
  },
  {
    id: '2',
    title: '디저트 10% 할인',
    description: '모든 디저트 메뉴 10% 할인',
    requiredScore: 7,
    stats: { issued: 89, used: 64, usageRate: 72 }
  },
  {
    id: '3',
    title: '다음 방문 20% 할인',
    description: '전 메뉴 20% 할인 (1회 한정)',
    requiredScore: 9,
    stats: { issued: 42, used: 35, usageRate: 83 }
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

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.benefit-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.benefit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.benefit-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #1d1d1f;
}

.benefit-score {
  padding: 6px 12px;
  background: #0071e3;
  color: #ffffff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.benefit-description {
  font-size: 15px;
  color: #6e6e73;
  margin: 0 0 20px 0;
}

.benefit-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86868b;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.benefit-actions {
  display: flex;
  gap: 10px;
}

.btn-edit, .btn-delete {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #0071e3;
  color: #ffffff;
}

.btn-edit:hover {
  background: #0077ed;
}

.btn-delete {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-delete:hover {
  background: #e5e5ea;
}

.btn-add-benefit {
  background: #ffffff;
  border: 2px dashed #d2d2d7;
  border-radius: 16px;
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #0071e3;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add-benefit:hover {
  background: #f5f5f7;
  border-color: #0071e3;
}
</style>
