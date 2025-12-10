<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">혜택 설정</h1>
      <p class="page-desc">게임별 리워드를 설정하고 고객 만족도를 높이세요.</p>
    </div>

    <!-- Info Box -->
    <div class="info-box">
      <i class="fa-solid fa-lightbulb"></i>
      <div>
        <strong>기본 설정:</strong> 게임별로 점수 구간을 설정하고 각 구간마다 제공할 쿠폰 혜택을 자유롭게 설정할 수 있습니다.
        혜택은 자동으로 게임 완료 시 제공되며, 고객은 즉시 사용하거나 나중에 사용할 수 있습니다.
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="enabledGames.length === 0" class="empty-state">
      <div class="empty-icon">🎮</div>
      <h3 class="empty-title">활성화된 게임이 없습니다</h3>
      <p class="empty-subtitle">게임 설정 탭에서 먼저 게임을 활성화해주세요</p>
      <button class="btn-go-to-games" @click="goToGamesTab">게임 설정으로 이동</button>
    </div>

    <!-- Grid Container -->
    <div v-else class="grid-container">
      <div
        v-for="game in enabledGames"
        :key="game.type"
        class="card"
        :class="{ 'collapsed': collapsedCards[game.type] }"
      >
        <!-- Card Header -->
        <div class="card-header">
          <div class="card-title-group">
            <div class="icon-box" :class="getIconClass(game.type)">
              <i :class="game.icon"></i>
            </div>
            <span class="card-title">{{ game.name }}</span>
          </div>
          <button
            class="btn-collapse"
            @click="toggleCard(game.type)"
          >
            {{ collapsedCards[game.type] ? '▼ 더보기' : '▲ 접기' }}
          </button>
        </div>

        <!-- Summary Medals (Always Visible) -->
        <div class="summary-medals">
          <div class="medal-box">
            <i class="fa-solid fa-medal medal-bronze medal-icon"></i>
            <span class="medal-name">동메달</span>
            <span class="medal-score">{{ game.stats.todayPlays || 0 }}회</span>
          </div>
          <div class="medal-box">
            <i class="fa-solid fa-medal medal-silver medal-icon"></i>
            <span class="medal-name">은메달</span>
            <span class="medal-score">{{ game.stats.couponsIssued || 0 }}장</span>
          </div>
          <div class="medal-box">
            <i class="fa-solid fa-medal medal-gold medal-icon"></i>
            <span class="medal-name">금메달</span>
            <span class="medal-score">{{ game.stats.avgScore || 0 }}점</span>
          </div>
        </div>

        <!-- Card Content (Collapsible) -->
        <div class="card-content">
          <button class="btn-template" @click="openBenefitSetting(game.type)">
            <i class="fa-solid fa-wand-magic-sparkles"></i> 템플릿 적용
          </button>

          <!-- Additional Stats -->
          <div class="detail-stats">
            <div class="detail-stat-item">
              <span class="detail-stat-label">참여자</span>
              <span class="detail-stat-value">{{ game.stats.participants || 0 }}명</span>
            </div>
            <div class="detail-stat-item">
              <span class="detail-stat-label">최고 점수</span>
              <span class="detail-stat-value">{{ game.stats.highestScore || 0 }}점</span>
            </div>
            <div class="detail-stat-item">
              <span class="detail-stat-label">평균 플레이 시간</span>
              <span class="detail-stat-value">{{ game.stats.avgPlayTime || 0 }}초</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="card-footer">
            <button class="btn-add" @click="openBenefitSetting(game.type)">
              <i class="fa-solid fa-plus"></i> 단계 추가
            </button>
            <button class="btn-save" @click="viewDetails(game.type)">
              저장
            </button>
          </div>
        </div>
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
import { ref, computed, onMounted } from 'vue'
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
const collapsedCards = ref<Record<string, boolean>>({})

// Modal state
const showBenefitSettingModal = ref(false)
const showBenefitDetailsModal = ref(false)
const selectedGame = ref<GameBenefit | null>(null)

// Computed property for enabled games only
const enabledGames = computed(() => {
  return gamesList.value.filter(game => game.enabled)
})

// Game definitions matching GamesTab and HTML design
const gameDefinitions: Record<string, { name: string; icon: string }> = {
  'pinball': { name: '핀볼', icon: 'fa-solid fa-bullseye' },
  'brick-breaker': { name: '벽돌깨기', icon: 'fa-solid fa-utensils' },
  'memory': { name: '같은 카드 찾기', icon: 'fa-solid fa-magnifying-glass' },
  'spot-difference': { name: '틀린 그림 찾기', icon: 'fa-solid fa-magnifying-glass' }
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

function toggleCard(gameType: string) {
  collapsedCards.value[gameType] = !collapsedCards.value[gameType]
}

function goToGamesTab() {
  // Emit event to parent (AdminView) to switch to games tab
  // Or use a more direct approach with a shared state
  window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'games' }))
}

function getIconClass(gameType: string): string {
  const iconClasses: Record<string, string> = {
    'pinball': 'brand',
    'brick-breaker': 'menu',
    'memory': 'find',
    'spot-difference': 'brand'
  }
  return iconClasses[gameType] || 'brand'
}

onMounted(() => {
  loadGameSettings()
})
</script>

<style scoped>
/* CSS Variables matching HTML design */
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

* {
  box-sizing: border-box;
  font-family: 'Noto Sans KR', sans-serif;
}

.tab-content {
  padding: 40px 50px;
  background-color: var(--bg-gray);
}

/* Page Header */
.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 10px;
  color: var(--text-dark);
  letter-spacing: -0.5px;
}

.page-desc {
  color: var(--text-gray);
  font-size: 15px;
}

/* Info Box */
.info-box {
  background-color: var(--primary-light);
  border: 1px solid #b6d4fe;
  color: #004085;
  padding: 20px;
  border-radius: 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
  line-height: 1.6;
}

.info-box i {
  font-size: 20px;
  color: #ffc107;
}

/* Empty State */
.empty-state {
  background: #ffffff;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

.empty-subtitle {
  font-size: 16px;
  color: #6e6e73;
  margin: 0 0 28px 0;
}

.btn-go-to-games {
  padding: 14px 32px;
  background: linear-gradient(135deg, #007aff 0%, #005ecb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-go-to-games:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
}

/* Grid Layout */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  align-items: start;
}

/* Card Styles */
.card {
  background: white;
  border-radius: var(--card-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
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

.btn-collapse {
  border: 1px solid #dee2e6;
  background: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-blue);
  cursor: pointer;
  transition: 0.2s;
}

.btn-collapse:hover {
  background: var(--primary-light);
}

/* Summary Medals */
.summary-medals {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 20px;
}

.medal-box {
  background: var(--box-bg);
  padding: 16px 10px;
  border-radius: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.medal-icon {
  font-size: 20px;
  margin-bottom: 8px;
}

.medal-bronze {
  color: #cd7f32;
}

.medal-silver {
  color: #adb5bd;
}

.medal-gold {
  color: #fab005;
}

.medal-name {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-dark);
}

.medal-score {
  font-size: 12px;
  color: var(--text-gray);
  font-weight: 500;
}

/* Card Content (Collapsible) */
.card-content {
  display: block;
}

.card.collapsed .card-content {
  display: none;
}

/* Detail Stats */
.detail-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  background: var(--box-bg);
  padding: 12px;
  border-radius: 8px;
}

.detail-stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-stat-label {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
}

.detail-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* Template Button */
.btn-template {
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  color: var(--primary-blue);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-template:hover {
  background: var(--primary-light);
  border-color: #b6d4fe;
}

/* Card Footer */
.card-footer {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-add {
  background: white;
  border: 1px solid var(--primary-blue);
  color: var(--primary-blue);
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
}

.btn-add:hover {
  background: var(--primary-light);
}

.btn-save {
  background: var(--primary-blue);
  color: white;
  border: none;
  padding: 10px 30px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
  transition: 0.2s;
}

.btn-save:hover {
  background: var(--primary-dark);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }

  .detail-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .card-footer {
    flex-direction: column;
  }
}
</style>
