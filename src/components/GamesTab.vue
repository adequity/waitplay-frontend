<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">게임 라인업 설정</h1>
      <p class="page-desc">매장 상황에 맞춰 원하는 게임을 활성화하세요.</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>게임 설정을 불러오는 중...</p>
    </div>

    <!-- Games List -->
    <div v-else class="game-list">
      <div v-for="game in games" :key="game.id" class="game-card" :class="{ expanded: game.isExpanded }">

        <!-- Header -->
        <div class="game-header">
          <div class="game-info">
            <div class="icon-box" :class="game.iconBg">
              <IconBase :name="getIconName(game.iconClass)" />
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
          <button
            v-if="isAssetGame(game.id)"
            class="btn-asset-setting"
            @click="openAssetModal(game.id)"
          >
            <IconBase name="image" class="btn-icon" /> 에셋 설정
          </button>
          <button class="btn-benefit-setting" @click="switchToBenefits">
            <IconBase name="gift" class="btn-icon" /> 혜택 설정
          </button>
          <button class="btn-details" @click="game.isExpanded = !game.isExpanded">
            <span v-if="game.isExpanded">접기 <IconBase name="chevron-up" class="btn-icon-right" /></span>
            <span v-else>상세 보기 <IconBase name="chevron-down" class="btn-icon-right" /></span>
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
            <div class="detail-column right-column">
              <div class="detail-title">점수 현황</div>
              <div class="detail-row" v-for="(val, key) in game.details.score" :key="key">
                <span class="detail-key">{{ key }}</span> <span class="detail-val" :class="{'text-blue': key === '평균 점수'}">{{ val }}</span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="detail-column empty-details">상세 데이터 없음</div>
          </template>
        </div>
      </div>
    </div>

    <!-- Promo Banner -->
    <div v-if="!isLoading" class="promo-banner">
      <div class="promo-content">
        <div class="promo-icon"><IconBase name="store" /></div>
        <div class="promo-text">
          <h3>더 많은 게임이 필요하신가요?</h3>
          <p>마켓플레이스에서 새로운 게임을 구매하고 고객 경험을 확대하세요.</p>
        </div>
      </div>
      <button class="btn-marketplace">
        마켓플레이스 바로가기 <IconBase name="arrow-right" class="btn-icon-right" />
      </button>
    </div>

    <!-- Asset Select Modal -->
    <GameAssetSelectModal
      :isOpen="showAssetModal"
      :gameId="selectedGameId"
      @close="showAssetModal = false"
      @saved="onAssetsSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import gameSettingsService from '@/services/gameSettingsService'
import type { GameOrderDto } from '@/services/gameSettingsService'
import IconBase from '@/components/IconBase.vue'
import GameAssetSelectModal from '@/components/GameAssetSelectModal.vue'

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
    name: '핀볼',
    iconClass: 'fa-solid fa-bullseye',
    iconBg: 'brand',
    statusText: '가장 인기 있는 게임입니다.'
  },
  {
    id: 'brick-breaker',
    name: '벽돌깨기',
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

// Asset Modal State
const showAssetModal = ref(false)
const selectedGameId = ref('')

// Games that support asset settings (memory card games, spot-difference, etc.)
const assetSupportedGames = ['memory', 'spot-difference']

const isAssetGame = (gameId: string) => assetSupportedGames.includes(gameId)

const openAssetModal = (gameId: string) => {
  selectedGameId.value = gameId
  showAssetModal.value = true
}

const onAssetsSaved = () => {
  console.log('Assets saved for game:', selectedGameId.value)
  // Optionally refresh or show success message
}

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

// Helper to map FontAwesome classes to IconBase names
function getIconName(faClass: string): string {
  const iconMapping: Record<string, string> = {
    'fa-solid fa-bullseye': 'target',
    'fa-solid fa-utensils': 'utensils',
    'fa-solid fa-clone': 'clone',
    'fa-solid fa-magnifying-glass': 'magnifying-glass'
  }
  return iconMapping[faClass] || 'gamepad'
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
  // Auto-save logic can be triggered here if needed
  saveSettings()
}

// Save settings to API
const saveSettings = async () => {
  if (!qrCodeId.value) {
    // alert('QR 코드 ID를 찾을 수 없습니다.') 
    // Suppress alert for better UX during auto-save
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

    console.log('Settings saved:', { enabledGames, gamesOrder })
  } catch (error) {
    console.error('Failed to save game settings:', error)
    // alert('게임 설정 저장에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
/* --- Design System: Apple Style Unified --- */
:root {
  --primary-blue: #0071e3;       /* Apple Blue */
  --primary-dark: #0077ed;       /* Hover Blue */
  --primary-light: #e8f2ff;      /* Light Blue Bg */
  
  --bg-gray: #f5f5f7;           /* Main Background */
  --box-bg: #ffffff;            /* Card Background */
  
  --border-color: #d2d2d7;      /* Borders */
  --border-light: #e5e5ea;      /* Light Borders */
  
  --text-dark: #1d1d1f;         /* Main Text */
  --text-gray: #86868b;         /* Secondary Text */
  --text-light-gray: #aeaeb2;   /* Placeholder */
  
  --card-radius: 20px;
  --btn-radius: 12px;
  --input-radius: 10px;
}

* { box-sizing: border-box; font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif; }

.tab-content {
  padding: 50px 60px;
  background-color: #f5f5f7;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 10px;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

.page-desc {
  color: #86868b;
  font-size: 16px;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 100px 20px;
  color: #86868b;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e5ea;
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Game List */
.game-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.game-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.02);
  padding: 30px;
  transition: all 0.3s ease;
}
.game-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

/* Header */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.game-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
}

.icon-box.brand { background-color: #fff0f2; color: #ff3b30; }
.icon-box.menu { background-color: #f2f2ff; color: #5856d6; }
.icon-box.find { background-color: #f0f8ff; color: #007aff; }

.card-title {
  font-weight: 700;
  font-size: 20px;
  color: #1d1d1f;
}

.game-status-text {
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;
}

.status-on { color: #0071e3; }
.status-off { color: #86868b; }

/* Switch - Apple Style */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 30px;
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
  background-color: #e5e5ea;
  transition: 0.3s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input:checked + .slider {
  background-color: #34c759; /* Apple Green */
}

input:checked + .slider:before {
  transform: translateX(20px);
}

/* Stats Grid */
.game-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 30px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e5ea;
}

.stat-block {
  margin-bottom: 24px;
}
.stat-block:last-child {
  margin-bottom: 0;
}

.stat-label {
  font-size: 13px;
  color: #86868b;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  display: block;
  letter-spacing: -0.5px;
}

.stat-value.empty {
  color: #d2d2d7;
}

/* Actions */
.game-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.btn-benefit-setting {
  background: #1d1d1f;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 0;
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-benefit-setting:hover {
  background: #3a3a3c;
  transform: translateY(-1px);
}

.btn-asset-setting {
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 0;
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
}

.btn-asset-setting:hover {
  background: #0077ed;
  transform: translateY(-1px);
}

.btn-details {
  flex: 1;
  border: 1px solid #d2d2d7;
  background: white;
  padding: 14px 0;
  border-radius: 12px;
  color: #1d1d1f;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-details:hover {
  background: #f5f5f7;
  border-color: #c7c7cc;
}

.btn-icon { font-size: 16px; }
.btn-icon-right { font-size: 14px; }

/* Details Box */
.details-box {
  margin-top: 24px;
  background: #f5f5f7;
  border-radius: 16px;
  padding: 28px;
  display: flex;
  gap: 40px;
  border: none;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-column {
  flex: 1;
}
.right-column {
  border-left: 1px solid #e5e5ea;
  padding-left: 40px;
}

.detail-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1d1d1f;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-key {
  color: #86868b;
  font-weight: 500;
}

.detail-val {
  font-weight: 600;
  color: #1d1d1f;
}

.text-blue {
  color: #0071e3;
}
.empty-details {
  color: #86868b;
  text-align: center;
}

/* Promo Banner */
.promo-banner {
  margin-top: 40px;
  background: linear-gradient(135deg, #0071e3 0%, #0077ed 100%);
  border-radius: 20px;
  padding: 36px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 113, 227, 0.25);
}

.promo-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.promo-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 26px;
}

.promo-text h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.promo-text p {
  font-size: 15px;
  opacity: 0.9;
}

.btn-marketplace {
  background: white;
  color: #0071e3;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.btn-marketplace:hover {
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 1200px) {
  .game-stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .details-box {
    flex-direction: column;
    gap: 24px;
  }
  .right-column {
    border-left: none;
    padding-left: 0;
    border-top: 1px solid #e5e5ea;
    padding-top: 24px;
  }

  .promo-banner {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }

  .promo-content {
    flex-direction: column;
  }
}

@media (max-width: 900px) {
  .tab-content { padding: 30px 20px; }
  
  .game-actions {
    flex-direction: column;
    gap: 12px;
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