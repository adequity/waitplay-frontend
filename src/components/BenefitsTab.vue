<template>
  <div class="tab-content">
    <!-- Apple-Style Greeting -->
    <div class="apple-greeting">
      <h1 class="greeting-title">혜택 설정</h1>
      <p class="greeting-subtitle">게임별 쿠폰 라인업을 관리하세요.</p>
    </div>

    <!-- Game-Based Coupon Lineup -->
    <div class="game-benefits-list">
      <div v-for="game in gamesList" :key="game.type" class="game-benefit-card">
        <!-- Game Header with Toggle -->
        <div class="game-header">
          <div class="game-info">
            <span class="game-icon">{{ game.icon }}</span>
            <h3 class="game-title">{{ game.name }}</h3>
          </div>
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="game.enabled"
              @change="toggleGame(game.type)"
            />
            <span class="toggle-slider"></span>
            <span class="toggle-label">{{ game.enabled ? 'ON' : 'OFF' }}</span>
          </label>
        </div>

        <!-- Game Statistics -->
        <div class="game-stats">
          <div class="stat-group">
            <div class="stat-item">
              <span class="stat-label">오늘 플레이</span>
              <span class="stat-value">{{ game.stats.todayPlays || 0 }}회</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">평균 점수</span>
              <span class="stat-value">{{ game.stats.avgScore || 0 }}점</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">참여자</span>
              <span class="stat-value">{{ game.stats.participants || 0 }}명</span>
            </div>
          </div>
          <div class="stat-group">
            <div class="stat-item">
              <span class="stat-label">쿠폰 발급 수</span>
              <span class="stat-value">{{ game.stats.couponsIssued || 0 }}장</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">최고 점수</span>
              <span class="stat-value">{{ game.stats.highestScore || 0 }}점</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">평균 플레이 시간</span>
              <span class="stat-value">{{ game.stats.avgPlayTime || 0 }}초</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="game-actions">
          <button class="btn-benefit-setting" @click="openBenefitSetting(game.type)">
            혜택 설정
          </button>
          <button class="btn-detail" @click="viewDetails(game.type)">
            상세 보기
          </button>
        </div>
      </div>
    </div>

    <!-- More Games Section -->
    <div class="more-games-section">
      <div class="more-games-card">
        <div class="more-games-content">
          <h3 class="more-games-title">더 많은 게임이 필요하신가요?</h3>
          <p class="more-games-subtitle">다양한 게임을 마켓플레이스에서 찾아보세요</p>
        </div>
        <button class="btn-marketplace">
          마켓플레이스 보기
        </button>
      </div>
    </div>

    <!-- Modals -->
    <BenefitSettingModal
      v-if="selectedGame"
      :is-open="showBenefitSettingModal"
      :game-type="selectedGame.type"
      :game-name="selectedGame.name"
      :game-icon="selectedGame.icon"
      :qr-code-id="authStore.user?.qrCodeId || ''"
      @close="showBenefitSettingModal = false"
      @saved="handleBenefitSaved"
    />

    <BenefitDetailsModal
      v-if="selectedGame"
      :is-open="showBenefitDetailsModal"
      :game-type="selectedGame.type"
      :game-name="selectedGame.name"
      :game-icon="selectedGame.icon"
      :qr-code-id="authStore.user?.qrCodeId || ''"
      :stats="selectedGame.stats"
      @close="showBenefitDetailsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import gameSettingsService from '@/services/gameSettingsService'
import benefitsService, { type GameBenefitStatsDto } from '@/services/benefitsService'
import BenefitSettingModal from './BenefitSettingModal.vue'
import BenefitDetailsModal from './BenefitDetailsModal.vue'

interface GameStats {
  todayPlays: number
  avgScore: number
  participants: number
  couponsIssued: number
  highestScore: number
  avgPlayTime: number
}

interface GameBenefit {
  type: string
  name: string
  icon: string
  enabled: boolean
  stats: GameStats
}

const authStore = useAuthStore()
const gamesList = ref<GameBenefit[]>([])
const loading = ref(false)

// Modal state
const showBenefitSettingModal = ref(false)
const showBenefitDetailsModal = ref(false)
const selectedGame = ref<GameBenefit | null>(null)

// Game definitions matching GamesTab
const gameDefinitions: Record<string, { name: string; icon: string }> = {
  'pinball': { name: '핀볼', icon: '🎯' },
  'brick-breaker': { name: '벽돌깨기', icon: '🧱' },
  'memory': { name: '같은 카드 찾기', icon: '🃏' },
  'spot-difference': { name: '틀린 그림 찾기', icon: '🔍' }
}

async function loadGameSettings() {
  loading.value = true
  try {
    const qrCodeId = authStore.user?.qrCodeId
    if (!qrCodeId) {
      console.error('No QR code ID found for admin user')
      return
    }

    // Load game settings and stats in parallel
    const [settings, stats] = await Promise.all([
      gameSettingsService.getGameSettings(qrCodeId),
      benefitsService.getGameStats(qrCodeId)
    ])

    // Create stats lookup map
    const statsMap: Record<string, GameBenefitStatsDto> = {}
    stats.forEach(stat => {
      statsMap[stat.gameType] = stat
    })

    // Create games list from all game types with real stats
    gamesList.value = Object.entries(gameDefinitions).map(([type, def]) => ({
      type,
      name: def.name,
      icon: def.icon,
      enabled: settings.enabledGames.includes(type),
      stats: statsMap[type] || {
        todayPlays: 0,
        avgScore: 0,
        participants: 0,
        couponsIssued: 0,
        highestScore: 0,
        avgPlayTime: 0
      }
    }))

    console.log('Game benefits loaded with stats:', gamesList.value)
  } catch (error) {
    console.error('Failed to load game settings:', error)
    // Initialize with default games on error
    gamesList.value = Object.entries(gameDefinitions).map(([type, def]) => ({
      type,
      name: def.name,
      icon: def.icon,
      enabled: false,
      stats: {
        todayPlays: 0,
        avgScore: 0,
        participants: 0,
        couponsIssued: 0,
        highestScore: 0,
        avgPlayTime: 0
      }
    }))
  } finally {
    loading.value = false
  }
}

async function toggleGame(gameType: string) {
  const game = gamesList.value.find(g => g.type === gameType)
  if (!game) return

  try {
    const qrCodeId = authStore.user?.qrCodeId
    if (!qrCodeId) {
      console.error('No QR code ID found for admin user')
      return
    }

    // Toggle the enabled state
    game.enabled = !game.enabled

    // Update the enabled games list
    const enabledGames = gamesList.value
      .filter(g => g.enabled)
      .map(g => g.type)

    // Create games order
    const gamesOrder = enabledGames.map((gameType, index) => ({
      type: gameType,
      order: index
    }))

    // Save to backend
    await gameSettingsService.updateGameSettings(qrCodeId, {
      enabledGames,
      gamesOrder
    })

    console.log(`Game ${gameType} toggled to ${game.enabled}`)
  } catch (error) {
    console.error('Failed to toggle game:', error)
    // Revert on error
    game.enabled = !game.enabled
  }
}

function openBenefitSetting(gameType: string) {
  const game = gamesList.value.find(g => g.type === gameType)
  if (!game) return

  selectedGame.value = game
  showBenefitSettingModal.value = true
}

function viewDetails(gameType: string) {
  const game = gamesList.value.find(g => g.type === gameType)
  if (!game) return

  selectedGame.value = game
  showBenefitDetailsModal.value = true
}

async function handleBenefitSaved() {
  // Reload stats after saving benefit
  await loadGameSettings()
}

onMounted(() => {
  loadGameSettings()
})
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

.game-benefits-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.game-benefit-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.game-icon {
  font-size: 32px;
}

.game-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: #1d1d1f;
}

/* Toggle Switch */
.toggle-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
}

.toggle-switch input {
  display: none;
}

.toggle-slider {
  width: 52px;
  height: 28px;
  background: #d2d2d7;
  border-radius: 14px;
  position: relative;
  transition: background-color 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
}

.toggle-switch input:checked + .toggle-slider {
  background: #34c759;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  min-width: 30px;
}

/* Game Statistics */
.game-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 13px;
  color: #86868b;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

/* Action Buttons */
.game-actions {
  display: flex;
  gap: 12px;
}

.btn-benefit-setting,
.btn-detail {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-benefit-setting {
  background: #0071e3;
  color: #ffffff;
}

.btn-benefit-setting:hover {
  background: #0077ed;
}

.btn-detail {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-detail:hover {
  background: #e5e5ea;
}

/* More Games Section */
.more-games-section {
  margin-top: 30px;
}

.more-games-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.more-games-content {
  color: white;
}

.more-games-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.more-games-subtitle {
  font-size: 15px;
  margin: 0;
  opacity: 0.9;
}

.btn-marketplace {
  background: white;
  color: #667eea;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.btn-marketplace:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
  .stat-group {
    grid-template-columns: repeat(2, 1fr);
  }

  .game-actions {
    flex-direction: column;
  }

  .more-games-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
}
</style>
