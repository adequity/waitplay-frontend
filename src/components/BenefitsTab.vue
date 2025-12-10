<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">혜택 설정</h1>
      <p class="page-desc">게임별 리워드를 설정하고 고객 만족도를 높이세요.</p>
    </div>

    <!-- Info Box -->
    <div class="info-box">
      <IconBase name="lightbulb" class="info-icon" />
      <div>
        <strong>기본 설정:</strong> 게임별로 점수 구간을 설정하고 각 구간마다 제공할 쿠폰 혜택을 자유롭게 설정할 수 있습니다.
        혜택은 자동으로 게임 완료 시 제공되며, 고객은 즉시 사용하거나 나중에 사용할 수 있습니다.
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="enabledGames.length === 0" class="empty-state">
      <div class="empty-icon-wrapper">
        <IconBase name="gamepad" />
      </div>
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
              <IconBase :name="getIconName(game.icon)" />
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
            <IconBase name="medal" class="medal-bronze medal-icon" />
            <span class="medal-name">동메달</span>
            <span class="medal-score">6-7점</span>
          </div>
          <div class="medal-box">
            <IconBase name="medal" class="medal-silver medal-icon" />
            <span class="medal-name">은메달</span>
            <span class="medal-score">8-9점</span>
          </div>
          <div class="medal-box">
            <IconBase name="medal" class="medal-gold medal-icon" />
            <span class="medal-name">금메달</span>
            <span class="medal-score">10점</span>
          </div>
        </div>

        <!-- Card Content (Collapsible & Editable) -->
        <div class="card-content">
          <button class="btn-template">
            <IconBase name="wand" /> 템플릿 적용
          </button>

          <!-- Step Container (Editable Forms) -->
          <div class="step-container">
            <div v-for="(step, index) in game.steps" :key="index" class="step-box">
              <button class="close-step" @click="removeStep(game, index)">
                <IconBase name="close" />
              </button>
              <div class="step-badge">{{ index + 1 }}</div>
              
              <div class="input-row">
                <!-- Medal Name Input -->
                <div class="input-group-medal">
                  <IconBase name="medal" :class="getMedalClass(index)" />
                  <input type="text" v-model="step.name" placeholder="메달 이름">
                </div>
                <!-- Score Range Input -->
                <div class="input-group-score">
                  <input type="number" class="input-score" v-model="step.minScore">
                  <span>~</span>
                  <input type="number" class="input-score" v-model="step.maxScore">
                </div>
              </div>
              <!-- Reward Input -->
              <input type="text" class="input-full" v-model="step.reward" placeholder="제공할 혜택 입력 (예: 아메리카노 1잔)">
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="card-footer">
            <button class="btn-add" @click="addStep(game)">
              <IconBase name="plus" /> 단계 추가
            </button>
            <button class="btn-save" @click="saveGameBenefits(game)">
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import gameSettingsService from '@/services/gameSettingsService'
import benefitsService from '@/services/benefitsService'
import IconBase from '@/components/IconBase.vue'

// Interfaces
interface BenefitStep {
  name: string
  minScore: number
  maxScore: number
  reward: string
}

interface GameBenefit {
  type: string
  name: string
  icon: string
  enabled: boolean
  steps: BenefitStep[]
}

const authStore = useAuthStore()
const gamesList = ref<GameBenefit[]>([])
const loading = ref(false)
const collapsedCards = ref<Record<string, boolean>>({})

// Computed property for enabled games only
const enabledGames = computed(() => {
  return gamesList.value.filter(game => game.enabled)
})

// Game definitions
const gameDefinitions: Record<string, { name: string; icon: string }> = {
  'pinball': { name: '브랜드 퀴즈', icon: 'fa-solid fa-bullseye' },
  'brick-breaker': { name: '메뉴 픽 맞추기', icon: 'fa-solid fa-utensils' },
  'memory': { name: '같은 카드 찾기', icon: 'fa-solid fa-clone' },
  'spot-difference': { name: '틀린 그림 찾기', icon: 'fa-solid fa-magnifying-glass' }
}

// Default steps template
const defaultSteps: BenefitStep[] = [
  { name: '동메달', minScore: 6, maxScore: 7, reward: '아메리카노 1잔' },
  { name: '은메달', minScore: 8, maxScore: 9, reward: '음료 2잔' },
  { name: '금메달', minScore: 10, maxScore: 10, reward: '디저트 세트' }
]

async function loadGameSettings() {
  loading.value = true
  try {
    const qrCodeId = authStore.user?.qrCodeId
    if (!qrCodeId) return

    // Load actual settings
    const settings = await gameSettingsService.getGameSettings(qrCodeId)
    // Note: In a real app, you would verify if specific benefit steps exist from the API.
    // For now, we initialize with default steps or empty arrays.

    gamesList.value = Object.entries(gameDefinitions).map(([type, def]) => ({
      type,
      name: def.name,
      icon: def.icon,
      enabled: settings.enabledGames.includes(type),
      // Clone default steps to ensure reactivity and independence
      steps: JSON.parse(JSON.stringify(defaultSteps)) 
    }))

  } catch (error) {
    console.error('Failed to load game settings:', error)
  } finally {
    loading.value = false
  }
}

// UI Helpers
function toggleCard(gameType: string) {
  collapsedCards.value[gameType] = !collapsedCards.value[gameType]
}

function addStep(game: GameBenefit) {
  game.steps.push({
    name: '새 단계',
    minScore: 0,
    maxScore: 0,
    reward: ''
  })
}

function removeStep(game: GameBenefit, index: number) {
  game.steps.splice(index, 1)
}

async function saveGameBenefits(game: GameBenefit) {
  // TODO: Call API to save steps
  console.log('Saving benefits for', game.type, game.steps)
  alert(`${game.name} 혜택 설정이 저장되었습니다.`)
}

function goToGamesTab() {
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

function getIconName(faClass: string): string {
  const iconMapping: Record<string, string> = {
    'fa-solid fa-bullseye': 'target',
    'fa-solid fa-utensils': 'utensils',
    'fa-solid fa-clone': 'clone',
    'fa-solid fa-magnifying-glass': 'magnifying-glass'
  }
  return iconMapping[faClass] || 'gamepad'
}

function getMedalClass(index: number): string {
  if (index === 0) return 'medal-bronze'
  if (index === 1) return 'medal-silver'
  if (index === 2) return 'medal-gold'
  return 'medal-default' // Fallback color
}

onMounted(() => {
  loadGameSettings()
})
</script>

<style scoped>
/* CSS Variables */
:root {
  --primary-blue: #007bff;
  --primary-dark: #0056b3;
  --primary-light: #e7f1ff;
  --bg-gray: #f4f6f9;
  --box-bg: #f8f9fa;
  --border-color: #e9ecef;
  --text-dark: #212529;
  --text-gray: #868e96;
  --card-radius: 16px;
}

* { box-sizing: border-box; font-family: 'Noto Sans KR', sans-serif; }

.tab-content { padding: 40px 50px; background-color: var(--bg-gray); min-height: 100vh; }

/* Page Header */
.page-header { margin-bottom: 30px; }
.page-title { font-size: 28px; font-weight: 800; margin-bottom: 10px; color: var(--text-dark); letter-spacing: -0.5px; }
.page-desc { color: var(--text-gray); font-size: 15px; }

/* Info Box */
.info-box {
  background-color: var(--primary-light); border: 1px solid #b6d4fe; color: #004085;
  padding: 20px; border-radius: 12px; font-size: 14px; display: flex; align-items: center;
  gap: 15px; margin-bottom: 40px; line-height: 1.6;
}
.info-icon { font-size: 20px; width: 20px; height: 20px; color: #ffc107; flex-shrink: 0; }

/* Empty State */
.empty-state {
  background: #ffffff; border-radius: 20px; padding: 60px 40px; text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); margin-bottom: 30px;
}
.empty-icon-wrapper {
  width: 100px; height: 100px; background: var(--primary-light); border-radius: 50%;
  display: flex; justify-content: center; align-items: center; margin: 0 auto 20px;
}
.empty-icon-wrapper :deep(svg) { font-size: 48px; width: 48px; height: 48px; color: var(--primary-blue); }
.empty-title { font-size: 24px; font-weight: 600; color: #1d1d1f; margin: 0 0 12px 0; }
.empty-subtitle { font-size: 16px; color: #6e6e73; margin: 0 0 28px 0; }
.btn-go-to-games {
  padding: 14px 32px; background: linear-gradient(135deg, #007aff 0%, #005ecb 100%);
  color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600;
  cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}
.btn-go-to-games:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4); }

/* Grid Layout */
.grid-container {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; align-items: start;
}

/* Card Styles */
.card {
  background: white; border-radius: var(--card-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05); display: flex; flex-direction: column;
  transition: all 0.3s ease;
}
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.card-title-group { display: flex; align-items: center; gap: 12px; }
.icon-box {
  width: 40px; height: 40px; border-radius: 50%; display: flex;
  justify-content: center; align-items: center; font-size: 18px;
}
.icon-box.brand { background-color: #ffeef0; color: #ff6b6b; }
.icon-box.menu { background-color: #f3f0ff; color: #845ef7; }
.icon-box.find { background-color: #e7f5ff; color: #339af0; }
.card-title { font-weight: 700; font-size: 18px; color: var(--text-dark); }
.btn-collapse {
  border: 1px solid #dee2e6; background: white; padding: 6px 12px;
  border-radius: 6px; font-size: 12px; font-weight: 600;
  color: var(--primary-blue); cursor: pointer; transition: 0.2s;
}
.btn-collapse:hover { background: var(--primary-light); }

/* Summary Medals */
.summary-medals { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 20px; }
.medal-box {
  background: var(--box-bg); padding: 16px 10px; border-radius: 8px; flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.medal-icon { font-size: 20px; width: 20px; height: 20px; margin-bottom: 8px; }
.medal-bronze { color: #cd7f32; }
.medal-silver { color: #adb5bd; }
.medal-gold { color: #fab005; }
.medal-default { color: #868e96; }
.medal-name { font-size: 13px; font-weight: 700; margin-bottom: 4px; color: var(--text-dark); }
.medal-score { font-size: 12px; color: var(--text-gray); font-weight: 500; }

/* Card Content & Steps */
.card-content { display: block; }
.card.collapsed .card-content { display: none; }

.btn-template {
  width: 100%; padding: 12px; background: white; border: 1px solid #dee2e6;
  border-radius: 8px; color: var(--primary-blue); font-size: 13px; font-weight: 600;
  cursor: pointer; margin-bottom: 24px; display: flex; justify-content: center;
  align-items: center; gap: 8px; transition: 0.2s;
}
.btn-template:hover { background: var(--primary-light); border-color: #b6d4fe; }

/* Step Box Styling (New) */
.step-container { display: flex; flex-direction: column; gap: 16px; }
.step-box {
  border: 1px solid #dee2e6; border-radius: 12px; padding: 20px;
  position: relative; background: #fff;
}
.step-badge {
  background: var(--primary-blue); color: white; width: 28px; height: 28px;
  border-radius: 8px; font-size: 14px; font-weight: 700; display: inline-flex;
  align-items: center; justify-content: center; margin-bottom: 16px;
}
.close-step {
  position: absolute; top: 15px; right: 15px; color: #adb5bd;
  cursor: pointer; background: none; border: none; font-size: 18px;
  width: 24px; height: 24px; display: flex; justify-content: center; align-items: center;
}
.close-step:hover { color: #dc3545; }

/* Input Styles */
.input-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }

.input-group-medal {
  display: flex; align-items: center; border: 1px solid #dee2e6;
  border-radius: 8px; padding: 0 12px; height: 44px; background: white; flex: 1.5;
  transition: border-color 0.2s;
}
.input-group-medal:focus-within { border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(0,123,255,0.1); }
.input-group-medal :deep(svg) { margin-right: 10px; font-size: 16px; width: 16px; height: 16px; }
.input-group-medal input { border: none; outline: none; width: 100%; font-size: 14px; font-weight: 500; }

.input-group-score { display: flex; align-items: center; gap: 6px; flex: 1.2; }
.input-score {
  width: 100%; height: 44px; border: 1px solid #dee2e6; border-radius: 8px;
  text-align: center; font-size: 14px; outline: none; font-weight: 500; transition: border-color 0.2s;
}
.input-score:focus { border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(0,123,255,0.1); }

.input-full {
  width: 100%; height: 44px; border: 1px solid #dee2e6; border-radius: 8px;
  padding: 0 14px; font-size: 14px; outline: none; background: var(--bg-gray); transition: all 0.2s;
}
.input-full:focus { background: white; border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(0,123,255,0.1); }


/* Card Footer */
.card-footer { margin-top: 24px; display: flex; justify-content: space-between; align-items: center; }
.btn-add {
  background: white; border: 1px solid var(--primary-blue); color: var(--primary-blue);
  padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s;
}
.btn-add:hover { background: var(--primary-light); }

.btn-save {
  background: var(--primary-blue); color: white; border: none; padding: 10px 30px;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3); transition: 0.2s;
}
.btn-save:hover { background: var(--primary-dark); }

/* Responsive */
@media (max-width: 1200px) {
  .grid-container { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .grid-container { grid-template-columns: 1fr; }
  .card-footer { flex-direction: row; }
}
</style>