<template>
  <div class="games-management">
    <div class="page-header">
      <div>
        <h1>게임 관리</h1>
        <p class="subtitle">전체 시스템의 게임 점수와 설정을 관리합니다</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button :class="{ active: activeTab === 'scores' }" @click="activeTab = 'scores'">점수 기록</button>
      <button :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">게임 설정</button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <!-- Scores Tab -->
    <div v-else-if="activeTab === 'scores'" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>플레이어</th>
            <th>게임</th>
            <th>점수</th>
            <th>플레이 시간</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="score in scores" :key="score.id">
            <td>{{ score.playerName }}</td>
            <td>
              <span class="game-badge">{{ getGameLabel(score.gameType) }}</span>
            </td>
            <td>
              <span class="score-value">{{ score.score.toLocaleString() }}</span>
            </td>
            <td>{{ formatDate(score.playedAt) }}</td>
          </tr>
          <tr v-if="scores.length === 0">
            <td colspan="4" class="empty-row">게임 기록이 없습니다</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" v-if="scoresTotalPages > 1">
        <button @click="scoresPage = scoresPage - 1" :disabled="scoresPage <= 1">이전</button>
        <span>{{ scoresPage }} / {{ scoresTotalPages }}</span>
        <button @click="scoresPage = scoresPage + 1" :disabled="scoresPage >= scoresTotalPages">다음</button>
      </div>
    </div>

    <!-- Settings Tab -->
    <div v-else-if="activeTab === 'settings'" class="settings-grid">
      <div v-for="setting in settings" :key="setting.id" class="setting-card">
        <div class="setting-header">
          <div class="setting-icon">
            <IconBase name="gamepad" />
          </div>
          <div class="setting-info">
            <h3>{{ getGameLabel(setting.gameType) }}</h3>
            <p>{{ setting.qrCode?.name || 'QR 없음' }}</p>
          </div>
          <span class="status-badge" :class="{ active: setting.isActive }">
            {{ setting.isActive ? '활성' : '비활성' }}
          </span>
        </div>
        <div class="setting-details">
          <div class="detail-item">
            <span class="label">난이도</span>
            <span class="value">{{ getDifficultyLabel(setting.difficulty) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">제한시간</span>
            <span class="value">{{ setting.timeLimit }}초</span>
          </div>
        </div>
      </div>

      <div v-if="settings.length === 0" class="empty-state">
        <IconBase name="gamepad" class="empty-icon" />
        <p>게임 설정이 없습니다</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const loading = ref(true)
const activeTab = ref('scores')
const scores = ref<any[]>([])
const settings = ref<any[]>([])
const scoresPage = ref(1)
const scoresTotalPages = ref(1)

const fetchScores = async () => {
  try {
    const params = new URLSearchParams({ page: scoresPage.value.toString(), pageSize: '20' })
    const response = await fetch(`${API_URL}/api/masteradmin/games/scores?${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    scores.value = data.scores
    scoresTotalPages.value = data.totalPages
  } catch (error) {
    console.error(error)
  }
}

const fetchSettings = async () => {
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/games/settings`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    settings.value = data.settings
  } catch (error) {
    console.error(error)
  }
}

const fetchAll = async () => {
  loading.value = true
  await Promise.all([fetchScores(), fetchSettings()])
  loading.value = false
}

const getGameLabel = (type: string) => {
  const labels: Record<string, string> = {
    'roulette': '룰렛',
    'slot': '슬롯머신',
    'scratch': '스크래치',
    'gacha': '가챠'
  }
  return labels[type] || type
}

const getDifficultyLabel = (level: number) => {
  const labels: Record<number, string> = { 1: '쉬움', 2: '보통', 3: '어려움' }
  return labels[level] || '보통'
}

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('ko-KR')

watch(scoresPage, fetchScores)
watch(activeTab, () => {
  if (activeTab.value === 'scores') fetchScores()
  else fetchSettings()
})

onMounted(() => fetchAll())
</script>

<style scoped>
.games-management { padding: 0; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 28px; font-weight: 700; color: #1d1d1f; margin: 0 0 8px 0; }
.subtitle { font-size: 15px; color: #86868b; margin: 0; }

.tabs { display: flex; gap: 8px; margin-bottom: 24px; }
.tabs button { padding: 10px 20px; border: none; border-radius: 10px; background: #f0f0f0; font-size: 14px; font-weight: 500; color: #86868b; cursor: pointer; transition: all 0.2s; }
.tabs button.active { background: linear-gradient(135deg, #d4a853, #b8942e); color: white; }

.loading-container { display: flex; justify-content: center; padding: 80px 0; }
.spinner { width: 40px; height: 40px; border: 3px solid #e5e5ea; border-top-color: #d4a853; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.table-container { background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 16px 20px; text-align: left; border-bottom: 1px solid #f0f0f0; }
.data-table th { font-size: 12px; font-weight: 600; color: #86868b; text-transform: uppercase; background: #fafafa; }
.data-table tbody tr:hover { background: #fafafa; }

.game-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #ede9fe; color: #7c3aed; }
.score-value { font-size: 16px; font-weight: 700; color: #d4a853; }

.empty-row { text-align: center !important; color: #86868b; padding: 48px !important; }

.settings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.setting-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); }

.setting-header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px; }
.setting-icon { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.setting-icon :deep(svg) { width: 24px; height: 24px; color: white; }
.setting-info { flex: 1; }
.setting-info h3 { font-size: 18px; font-weight: 600; color: #1d1d1f; margin: 0 0 4px 0; }
.setting-info p { font-size: 13px; color: #86868b; margin: 0; }

.status-badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #fff0f0; color: #ff6b6b; }
.status-badge.active { background: #dcfce7; color: #16a34a; }

.setting-details { display: flex; gap: 24px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-item .label { font-size: 12px; color: #86868b; }
.detail-item .value { font-size: 15px; font-weight: 600; color: #1d1d1f; }

.empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; padding: 80px 0; color: #86868b; }
.empty-icon { width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 20px; border-top: 1px solid #f0f0f0; }
.pagination button { padding: 8px 16px; border: 1px solid #e5e5ea; border-radius: 8px; background: white; font-size: 14px; cursor: pointer; }
.pagination button:hover:not(:disabled) { background: #f0f0f0; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
