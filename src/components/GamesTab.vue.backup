<template>
  <div class="tab-content">
    <!-- Apple-Style Greeting -->
    <div class="apple-greeting">
      <h1 class="greeting-title">게임 라인업 설정</h1>
      <p class="greeting-subtitle">매장 상황에 맞춰 원하는 게임을 활성화하세요.</p>
    </div>

    <!-- Games List -->
    <div class="games-list">
      <div v-for="game in games" :key="game.id" class="game-card">
        <div class="game-header">
          <div class="game-info">
            <div class="game-icon">{{ game.icon }}</div>
            <div>
              <h3 class="game-name">{{ game.name }}</h3>
              <p class="game-description">{{ game.description }}</p>
            </div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="game.active" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="game-stats">
          <div class="stat-item">
            <span class="stat-label">오늘 플레이</span>
            <span class="stat-value">{{ game.stats.todayPlays }}회</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">평균 점수</span>
            <span class="stat-value">{{ game.stats.avgScore }}점</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">참여자</span>
            <span class="stat-value">{{ game.stats.participants }}명</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Game {
  id: string
  name: string
  icon: string
  description: string
  active: boolean
  stats: {
    todayPlays: number
    avgScore: number
    participants: number
  }
}

const games = ref<Game[]>([
  {
    id: 'quiz',
    name: '브랜드 퀴즈',
    icon: '🎯',
    description: '가장 인기 있는 게임입니다.',
    active: true,
    stats: { todayPlays: 24, avgScore: 8.2, participants: 127 }
  },
  {
    id: 'menu-pick',
    name: '메뉴 픽 맞추기',
    icon: '🃏',
    description: '신메뉴 이미지로 자동 생성됩니다.',
    active: true,
    stats: { todayPlays: 18, avgScore: 7.8, participants: 95 }
  },
  {
    id: 'spot-difference',
    name: '틀린 그림 찾기',
    icon: '🔍',
    description: '이미지 비교 게임입니다.',
    active: false,
    stats: { todayPlays: 0, avgScore: 0, participants: 0 }
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

.games-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.game-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  background: #f5f5f7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1d1d1f;
}

.game-description {
  font-size: 14px;
  margin: 0;
  color: #6e6e73;
}

.toggle-switch {
  position: relative;
  width: 51px;
  height: 31px;
  display: inline-block;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d1d6;
  transition: 0.3s;
  border-radius: 31px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 27px;
  width: 27px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #34c759;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.game-stats {
  display: flex;
  gap: 24px;
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
</style>
