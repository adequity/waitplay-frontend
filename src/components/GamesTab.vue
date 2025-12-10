<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">게임 라인업 설정</h1>
      <p class="page-desc">매장 상황에 맞춰 원하는 게임을 활성화하세요.</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <p>게임 설정을 불러오는 중...</p>
    </div>

    <!-- Games List -->
    <div v-else class="game-list">
      <div v-for="game in games" :key="game.id" class="game-card" :class="{ expanded: game.isExpanded }">

        <!-- Header -->
        <div class="game-header">
          <div class="game-info">
            <div class="icon-box" :class="game.iconBg">
              <i :class="game.iconClass"></i>
            </div>
            <div>
              <div class="card-title">{{ game.name }}</div>
              <div class="game-status-text" :class="game.active ? 'status-on' : 'status-off'">
                {{ game.active ? 'ON' : 'OFF' }} • {{ game.statusText }}
              </div>
            </div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="game.active" @change="handleToggleChange(game)" />
            <span class="slider"></span>
          </label>
        </div>

        <!-- Stats Grid -->
        <div class="game-stats-grid">
          <div class="stats-group">
            <div class="stat-block">
              <span class="stat-label">오늘 플레이</span>
              <span class="stat-value">{{ game.stats.todayPlays }}회</span>
            </div>
            <div class="stat-block">
              <span class="stat-label">재참여율</span>
              <span class="stat-value" :class="{ empty: !game.stats.revisitRate }">{{ game.stats.revisitRate || '-' }}</span>
            </div>
          </div>
          <div class="stats-group">
            <div class="stat-block">
              <span class="stat-label">평균 점수</span>
              <span class="stat-value" :class="{ empty: !game.stats.avgScore }">{{ game.stats.avgScore || '-' }}</span>
            </div>
            <div class="stat-block">
              <span class="stat-label">쿠폰 평균점수</span>
              <span class="stat-value" :class="{ empty: !game.stats.couponAvgScore }">{{ game.stats.couponAvgScore || '-' }}</span>
            </div>
          </div>
          <div class="stats-group">
            <div class="stat-block">
              <span class="stat-label">참여자</span>
              <span class="stat-value">{{ game.stats.participants }}명</span>
            </div>
            <div class="stat-block">
              <span class="stat-label">쿠폰 확인</span>
              <span class="stat-value" :class="{ empty: !game.stats.couponCheck }">{{ game.stats.couponCheck || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="game-actions">
          <button class="btn-benefit-setting" @click="switchToBenefits">혜택 설정</button>
          <button class="btn-details" @click="game.isExpanded = !game.isExpanded">
            <span v-if="game.isExpanded">접기 <i class="fa-solid fa-chevron-up"></i></span>
            <span v-else>상세 보기 <i class="fa-solid fa-chevron-down"></i></span>
          </button>
        </div>

        <!-- Details Box (Collapsible) -->
        <div v-show="game.isExpanded" class="details-box">
          <template v-if="game.details">
            <div class="detail-column">
              <div class="detail-title">이용 통계</div>
              <div class="detail-row" v-for="(val, key) in game.details.usage" :key="key">
                <span class="detail-key">{{ key }}</span> <span class="detail-val">{{ val }}</span>
              </div>
            </div>
            <div class="detail-column" style="border-left: 1px solid #e9ecef; padding-left: 40px;">
              <div class="detail-title">점수 현황</div>
              <div class="detail-row" v-for="(val, key) in game.details.score" :key="key">
                <span class="detail-key">{{ key }}</span> <span class="detail-val" :class="{'text-blue': key === '평균 점수'}">{{ val }}</span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="detail-column">상세 데이터 없음</div>
          </template>
        </div>
      </div>
    </div>

    <!-- Promo Banner -->
    <div v-if="!isLoading" class="promo-banner">
      <div class="promo-content">
        <div class="promo-icon"><i class="fa-solid fa-store"></i></div>
        <div class="promo-text">
          <h3>더 많은 게임이 필요하신가요?</h3>
          <p>마켓플레이스에서 새로운 게임을 구매하고 고객 경험을 확대하세요.</p>
        </div>
      </div>
      <button class="btn-marketplace">마켓플레이스 바로가기 <i class="fa-solid fa-arrow-right"></i></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import gameSettingsService from '@/services/gameSettingsService'
import type { GameOrderDto } from '@/services/gameSettingsService'

interface Game {
  id: string
  name: string
  iconClass: string
  iconBg: string
  statusText: string
  active: boolean
  isExpanded: boolean
  stats: {
    todayPlays: string
    avgScore: string | null
    participants: string
    revisitRate: string | null
    couponAvgScore: string | null
    couponCheck: string | null
  }
  details: {
    usage: Record<string, string>
    score: Record<string, string>
  } | null
}

// Game definitions matching HTML design
const gameDefinitions = [
  {
    id: 'pinball',
    name: '브랜드 퀴즈',
    iconClass: 'fa-solid fa-bullseye',
    iconBg: 'brand',
    statusText: '가장 인기 있는 게임입니다.'
  },
  {
    id: 'brick-breaker',
    name: '메뉴 픽 맞추기',
    iconClass: 'fa-solid fa-utensils',
    iconBg: 'menu',
    statusText: '신메뉴 이미지로 자동 생성됩니다.'
  },
  {
    id: 'memory',
    name: '같은 카드 찾기',
    iconClass: 'fa-solid fa-clone',
    iconBg: 'find',
    statusText: '기억력 향상 게임입니다.'
  },
  {
    id: 'spot-difference',
    name: '틀린 그림 찾기',
    iconClass: 'fa-solid fa-magnifying-glass',
    iconBg: 'find',
    statusText: '관찰력 향상 게임입니다.'
  }
]

const authStore = useAuthStore()
const games = ref<Game[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const qrCodeId = ref<string>('')

// Initialize games with default stats
const initializeGames = (enabledGames: string[] = []) => {
  games.value = gameDefinitions.map(game => ({
    ...game,
    active: enabledGames.includes(game.id),
    isExpanded: false,
    stats: {
      todayPlays: '0',
      avgScore: null,
      participants: '0',
      revisitRate: null,
      couponAvgScore: null,
      couponCheck: null
    },
    details: null
  }))
}

// Switch to benefits tab
const switchToBenefits = () => {
  window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'benefits' }))
}

// Load game settings from API
const loadSettings = async () => {
  isLoading.value = true
  try {
    // Get user's QR code
    const user = authStore.user
    if (!user?.qrCodeId) {
      console.error('No QR code ID found for user')
      initializeGames(['pinball', 'memory']) // Default enabled games
      return
    }

    qrCodeId.value = user.qrCodeId

    // Fetch settings from API
    const settings = await gameSettingsService.getGameSettings(qrCodeId.value)
    initializeGames(settings.enabledGames)

    console.log('Game settings loaded:', settings)
  } catch (error) {
    console.error('Failed to load game settings:', error)
    // Initialize with defaults on error
    initializeGames(['pinball', 'memory'])
  } finally {
    isLoading.value = false
  }
}

// Handle toggle change
const handleToggleChange = (game: Game) => {
  console.log(`Game ${game.name} toggled:`, game.active)
}

// Save settings to API
const saveSettings = async () => {
  if (!qrCodeId.value) {
    alert('QR 코드 ID를 찾을 수 없습니다.')
    return
  }

  isSaving.value = true
  try {
    // Get enabled games
    const enabledGames = games.value
      .filter(game => game.active)
      .map(game => game.id)

    // Create games order
    const gamesOrder: GameOrderDto[] = enabledGames.map((gameId, index) => ({
      type: gameId,
      order: index + 1
    }))

    // Update settings
    await gameSettingsService.updateGameSettings(qrCodeId.value, {
      enabledGames,
      gamesOrder
    })

    alert('게임 설정이 저장되었습니다!')
    console.log('Settings saved:', { enabledGames, gamesOrder })
  } catch (error) {
    console.error('Failed to save game settings:', error)
    alert('게임 설정 저장에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
:root {
  --primary-blue: #007bff;
  --primary-dark: #0056b3;
  --primary-light: #e7f1ff;
  --bg-gray: #f4f6f9;
  --box-bg: #f8f9fa;
  --border-color: #e9ecef;
  --text-dark: #212529;
  --text-gray: #868e96;
  --text-light-gray: #adb5bd;
  --card-radius: 16px;
}

.tab-content {
  padding: 40px;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 10px;
  letter-spacing: -0.5px;
  color: var(--text-dark);
}

.page-desc {
  color: var(--text-gray);
  font-size: 15px;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #6e6e73;
  font-size: 16px;
}

.game-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-card {
  background: white;
  border-radius: var(--card-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 30px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.game-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
}

.icon-box.brand {
  background-color: #ffeef0;
  color: #ff6b6b;
}

.icon-box.menu {
  background-color: #f3f0ff;
  color: #845ef7;
}

.icon-box.find {
  background-color: #e7f5ff;
  color: #339af0;
}

.card-title {
  font-weight: 700;
  font-size: 18px;
  color: var(--text-dark);
}

.game-status-text {
  font-size: 13px;
  font-weight: 500;
  margin-top: 4px;
}

.status-on {
  color: var(--primary-blue);
}

.status-off {
  color: var(--text-gray);
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e9ecef;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input:checked + .slider {
  background-color: var(--primary-blue);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* Stats Grid */
.game-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.stat-block {
  margin-bottom: 24px;
}

.stat-block:last-child {
  margin-bottom: 0;
}

.stat-label {
  font-size: 12px;
  color: var(--text-gray);
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-dark);
  display: block;
  letter-spacing: -0.5px;
}

.stat-value.empty {
  color: #dee2e6;
}

/* Actions */
.game-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-benefit-setting {
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  width: 48%;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-benefit-setting:hover {
  background: var(--primary-dark);
}

.btn-details {
  width: 48%;
  border: 1px solid var(--border-color);
  background: white;
  padding: 12px 0;
  border-radius: 8px;
  color: var(--primary-blue);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.btn-details:hover {
  background: var(--bg-gray);
}

/* Details Box */
.details-box {
  margin-top: 20px;
  background: var(--box-bg);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 40px;
  border: 1px solid #e9ecef;
}

.detail-column {
  flex: 1;
}

.detail-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-dark);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-key {
  color: var(--text-gray);
  font-weight: 500;
}

.detail-val {
  font-weight: 700;
  color: var(--text-dark);
}

.text-blue {
  color: var(--primary-blue);
}

/* Promo Banner */
.promo-banner {
  margin-top: 40px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-radius: var(--card-radius);
  padding: 30px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 20px rgba(0, 86, 179, 0.2);
}

.promo-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.promo-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}

.promo-text h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
}

.promo-text p {
  font-size: 14px;
  opacity: 0.9;
}

.btn-marketplace {
  background: white;
  color: var(--primary-blue);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Responsive */
@media (max-width: 1200px) {
  .game-stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .details-box {
    flex-direction: column;
    gap: 20px;
  }

  .promo-banner {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .promo-content {
    flex-direction: column;
  }
}

@media (max-width: 900px) {
  .game-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-benefit-setting,
  .btn-details {
    width: 100%;
  }

  .game-stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
