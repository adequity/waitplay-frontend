<template>
  <div class="tab-content">
    <!-- Apple-Style Greeting -->
    <div class="apple-greeting">
      <h1 class="greeting-title">게임 라인업 설정</h1>
      <p class="greeting-subtitle">매장 상황에 맞춰 원하는 게임을 활성화하세요.</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <p>게임 설정을 불러오는 중...</p>
    </div>

    <!-- Games List -->
    <div v-else class="games-list">
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
            <input type="checkbox" v-model="game.active" @change="handleToggleChange(game)" />
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

    <!-- Save Button -->
    <div v-if="!isLoading" class="save-section">
      <button @click="saveSettings" :disabled="isSaving" class="btn-save">
        {{ isSaving ? '저장 중...' : '설정 저장' }}
      </button>
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
  icon: string
  description: string
  active: boolean
  stats: {
    todayPlays: number
    avgScore: number
    participants: number
  }
}

// Game definitions matching GamesCarouselBlock
const gameDefinitions = [
  {
    id: 'pinball',
    name: '핀볼',
    icon: '🎯',
    description: '플리퍼로 공을 튕겨서 점수를 획득하세요'
  },
  {
    id: 'brick-breaker',
    name: '벽돌깨기',
    icon: '🧱',
    description: '공을 튕겨서 벽돌을 깨세요'
  },
  {
    id: 'memory',
    name: '같은 카드 찾기',
    icon: '🃏',
    description: '같은 그림의 카드를 찾아보세요'
  },
  {
    id: 'spot-difference',
    name: '틀린 그림 찾기',
    icon: '🔍',
    description: '두 그림의 다른 부분을 찾아보세요'
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
    stats: {
      todayPlays: 0,
      avgScore: 0,
      participants: 0
    }
  }))
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

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #6e6e73;
  font-size: 16px;
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

.save-section {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
