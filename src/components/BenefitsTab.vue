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
        <strong>기본 설정:</strong> 게임별로 점수 구간(메달)을 설정하고 각 구간마다 제공할 쿠폰 혜택을 자유롭게 입력하세요. 
        설정된 혜택은 고객이 게임을 완료했을 때 자동으로 지급됩니다.
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="enabledGames.length === 0" class="empty-state">
      <div class="empty-icon-wrapper">
        <IconBase name="gamepad" />
      </div>
      <h3 class="empty-title">활성화된 게임이 없습니다</h3>
      <p class="empty-subtitle">게임 설정 탭에서 먼저 게임을 활성화해주세요.</p>
      <button class="btn-primary" @click="goToGamesTab">게임 설정으로 이동</button>
    </div>

    <!-- Benefits Grid -->
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
              <!-- icon name logic restored to match original -->
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

        <!-- Summary Medals (Read Only, Always Visible) -->
        <div class="summary-medals">
          <div class="medal-box medal-box-bronze">
            <IconBase name="medal-bronze" class="medal-icon medal-bronze" />
            <span class="medal-name">{{ getStepName(game, 0) || '미설정' }}</span>
            <span class="medal-score">{{ getStepRange(game, 0) }}</span>
          </div>
          <div class="medal-box medal-box-silver">
            <IconBase name="medal-silver" class="medal-icon medal-silver" />
            <span class="medal-name">{{ getStepName(game, 1) || '미설정' }}</span>
            <span class="medal-score">{{ getStepRange(game, 1) }}</span>
          </div>
          <div class="medal-box medal-box-gold">
            <IconBase name="medal-gold" class="medal-icon medal-gold" />
            <span class="medal-name">{{ getStepName(game, 2) || '미설정' }}</span>
            <span class="medal-score">{{ getStepRange(game, 2) }}</span>
          </div>
        </div>

        <!-- Card Content (Collapsible & Editable) -->
        <div class="card-content">
          <button class="btn-template" @click="applyTemplate(game)">
            <IconBase name="wand" /> 기본 템플릿 적용 (초기화)
          </button>

          <!-- Step Container (Editable Forms) -->
          <div class="step-container">
            <template v-if="game.steps.length > 0">
              <div v-for="(step, index) in game.steps" :key="index" class="step-box">
                <button class="close-step" @click="removeStep(game, index)">
                  <IconBase name="close" />
                </button>
                
                <div class="step-badge">{{ index + 1 }}</div>
                
                <div class="input-row">
                  <!-- Medal Name Input -->
                  <div class="input-group-medal" :class="getMedalBoxClass(index)">
                    <IconBase :name="getMedalIconName(index)" :class="getMedalClass(index)" />
                    <input type="text" v-model="step.name" placeholder="등급 이름 (예: 동메달)">
                  </div>
                  <!-- Score Range Input -->
                  <div class="input-group-score">
                    <input type="number" class="input-score" v-model="step.minScore" placeholder="0">
                    <span>~</span>
                    <input type="number" class="input-score" v-model="step.maxScore" placeholder="10">
                  </div>
                </div>
                <!-- Reward Input -->
                <input type="text" class="input-full" v-model="step.reward" placeholder="제공할 혜택 입력 (예: 아메리카노 1잔)">
              </div>
            </template>
            <div v-else class="empty-steps">
              등록된 혜택 단계가 없습니다. '단계 추가'를 눌러주세요.
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
  'pinball': { name: '핀볼', icon: 'fa-solid fa-bullseye' },
  'brick-breaker': { name: '벽돌깨기', icon: 'fa-solid fa-utensils' },
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
    
    gamesList.value = Object.entries(gameDefinitions).map(([type, def]) => ({
      type,
      name: def.name,
      icon: def.icon,
      enabled: settings.enabledGames.includes(type),
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
  if (confirm('이 혜택 단계를 삭제하시겠습니까?')) {
    game.steps.splice(index, 1)
  }
}

function applyTemplate(game: GameBenefit) {
  if (confirm('기존 내용을 지우고 기본 템플릿으로 초기화하시겠습니까?')) {
    game.steps = JSON.parse(JSON.stringify(defaultSteps))
  }
}

async function saveGameBenefits(game: GameBenefit) {
  // TODO: Call API to save steps
  console.log('Saving benefits for', game.type, game.steps)
  // Here you would typically call benefitsService.updateBenefits(...)
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
  // Restored: Mapping logic to match your original file's expectations
  const iconMapping: Record<string, string> = {
    'fa-solid fa-bullseye': 'target',           // Was 'bullseye', restored to 'target'
    'fa-solid fa-utensils': 'utensils',
    'fa-solid fa-clone': 'clone',
    'fa-solid fa-magnifying-glass': 'magnifying-glass' // Was 'magnify', restored to 'magnifying-glass'
  }
  return iconMapping[faClass] || 'gamepad'
}

function getMedalClass(index: number): string {
  if (index === 0) return 'medal-bronze'
  if (index === 1) return 'medal-silver'
  if (index === 2) return 'medal-gold'
  return 'medal-default'
}

function getMedalIconName(index: number): string {
  if (index === 0) return 'medal-bronze'
  if (index === 1) return 'medal-silver'
  if (index === 2) return 'medal-gold'
  return 'medal'
}

function getMedalBoxClass(index: number): string {
  if (index === 0) return 'input-medal-bronze'
  if (index === 1) return 'input-medal-silver'
  if (index === 2) return 'input-medal-gold'
  return ''
}

// Helpers for Read-only Summary
function getStepName(game: GameBenefit, index: number) {
  return game.steps[index]?.name
}

function getStepRange(game: GameBenefit, index: number) {
  const s = game.steps[index]
  return s ? `${s.minScore}-${s.maxScore}점` : '-'
}

onMounted(() => {
  loadGameSettings()
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

.tab-content { padding: 50px 60px; background-color: #f5f5f7; min-height: 100vh; }

/* Page Header */
.page-header { margin-bottom: 40px; }
.page-title { font-size: 32px; font-weight: 800; margin-bottom: 10px; letter-spacing: -0.5px; color: #1d1d1f; }
.page-desc { color: #86868b; font-size: 16px; }

/* Info Box */
.info-box {
  background-color: #e8f2ff; border: 1px solid #b6d4fe; color: #004085;
  padding: 20px; border-radius: 14px; font-size: 14px; display: flex; align-items: flex-start;
  gap: 15px; margin-bottom: 40px; line-height: 1.6;
}
.info-icon { font-size: 20px; width: 20px; height: 20px; color: #ffc107; flex-shrink: 0; margin-top: 2px; }

/* Empty State */
.empty-state {
  background: white; border-radius: 20px; padding: 80px 40px; text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04); margin-bottom: 30px;
}
.empty-icon-wrapper {
  width: 80px; height: 80px; background: #f5f5f7; border-radius: 50%;
  display: flex; justify-content: center; align-items: center; margin: 0 auto 24px;
  color: #86868b;
}
.empty-icon-wrapper :deep(svg) { font-size: 36px; width: 36px; height: 36px; }
.empty-title { font-size: 20px; font-weight: 700; color: #1d1d1f; margin: 0 0 10px 0; }
.empty-subtitle { font-size: 15px; color: #86868b; margin: 0 0 30px 0; }
.btn-primary {
  padding: 12px 28px; background: #0071e3; color: white; border: none;
  border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
}
.btn-primary:hover { background: #0077ed; transform: translateY(-1px); }

/* Grid Layout */
.grid-container {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 30px; align-items: start;
}

/* Card Styles */
.card {
  background: white; border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04); padding: 28px;
  border: 1px solid rgba(0,0,0,0.02); display: flex; flex-direction: column;
  transition: all 0.3s ease;
}
.card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.card-title-group { display: flex; align-items: center; gap: 14px; }
.card-title { font-weight: 700; font-size: 18px; color: #1d1d1f; }

.icon-box {
  width: 44px; height: 44px; border-radius: 50%; display: flex;
  justify-content: center; align-items: center; font-size: 20px;
}
.icon-box.brand { background-color: #fff0f2; color: #ff3b30; }
.icon-box.menu { background-color: #f2f2ff; color: #5856d6; }
.icon-box.find { background-color: #f0f8ff; color: #007aff; }

.btn-collapse {
  border: none; background: #f5f5f7; padding: 8px 14px;
  border-radius: 8px; font-size: 12px; font-weight: 600; color: #86868b;
  cursor: pointer; transition: 0.2s;
}
.btn-collapse:hover { background: #e5e5ea; color: #1d1d1f; }

/* Summary Medals - 3D 리본 스타일 */
.summary-medals { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 24px; }
.medal-box {
  padding: 16px 8px; border-radius: 14px; flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}
.medal-box:hover { transform: translateY(-2px); }

/* 동메달 박스 스타일 */
.medal-box-bronze {
  background: linear-gradient(145deg, #fdf4f0 0%, #f5e6df 100%);
  border-color: #e8cfc4;
}
.medal-box-bronze:hover { box-shadow: 0 6px 20px rgba(205, 127, 50, 0.2); }

/* 은메달 박스 스타일 */
.medal-box-silver {
  background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
  border-color: #dee2e6;
}
.medal-box-silver:hover { box-shadow: 0 6px 20px rgba(192, 192, 192, 0.25); }

/* 금메달 박스 스타일 */
.medal-box-gold {
  background: linear-gradient(145deg, #fffdf0 0%, #fff8d6 100%);
  border-color: #ffe066;
}
.medal-box-gold:hover { box-shadow: 0 6px 20px rgba(255, 215, 0, 0.25); }

.medal-icon { font-size: 32px; width: 32px; height: 32px; margin-bottom: 10px; }

/* 메달 색상 - 그라데이션 효과 */
.medal-bronze { color: #cd7f32; filter: drop-shadow(0 2px 3px rgba(205, 127, 50, 0.3)); }
.medal-silver { color: #a8a8a8; filter: drop-shadow(0 2px 3px rgba(168, 168, 168, 0.3)); }
.medal-gold { color: #ffd700; filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.4)); }
.medal-default { color: #86868b; }

.medal-name { font-size: 14px; font-weight: 700; margin-bottom: 4px; color: #1d1d1f; }
.medal-score { font-size: 12px; color: #86868b; font-weight: 500; }

/* Card Content & Animation */
.card-content { display: block; animation: fadeIn 0.3s ease; }
.card.collapsed .card-content { display: none; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.btn-template {
  width: 100%; padding: 12px; background: white; border: 1px solid #d2d2d7;
  border-radius: 12px; color: #0071e3; font-size: 14px; font-weight: 600;
  cursor: pointer; margin-bottom: 20px; display: flex; justify-content: center;
  align-items: center; gap: 8px; transition: 0.2s;
}
.btn-template:hover { background: #f5f5f7; border-color: #0071e3; }

/* Step Box Styling */
.step-container { display: flex; flex-direction: column; gap: 16px; }
.step-box {
  border: 1px solid #d2d2d7; border-radius: 14px; padding: 20px;
  position: relative; background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.empty-steps { text-align: center; color: #86868b; padding: 20px; }

.step-badge {
  background: #1d1d1f; color: white; width: 24px; height: 24px;
  border-radius: 6px; font-size: 12px; font-weight: 700; display: inline-flex;
  align-items: center; justify-content: center; margin-bottom: 16px;
}

.close-step {
  position: absolute; top: 16px; right: 16px; color: #aeaeb2;
  cursor: pointer; background: none; border: none; font-size: 18px;
  width: 24px; height: 24px; display: flex; justify-content: center; align-items: center;
  transition: 0.2s;
}
.close-step:hover { color: #ff3b30; }

/* Unified Input Styles */
.input-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }

.input-group-medal {
  display: flex; align-items: center; border: 1px solid #d2d2d7;
  border-radius: 10px; padding: 0 12px; height: 44px; background: white; flex: 1.5;
  transition: all 0.2s;
}
.input-group-medal:focus-within { border-color: #0071e3; }
.input-group-medal :deep(svg) { margin-right: 10px; font-size: 22px; width: 22px; height: 22px; }
.input-group-medal input {
  border: none; outline: none; width: 100%; font-size: 14px; font-weight: 600; color: #1d1d1f;
}

/* 입력 필드 메달 스타일 */
.input-medal-bronze {
  border-color: #e8cfc4;
  background: linear-gradient(90deg, #fdf4f0 0%, white 30%);
}
.input-medal-bronze :deep(svg) { color: #cd7f32; filter: drop-shadow(0 1px 2px rgba(205, 127, 50, 0.3)); }

.input-medal-silver {
  border-color: #dee2e6;
  background: linear-gradient(90deg, #f8f9fa 0%, white 30%);
}
.input-medal-silver :deep(svg) { color: #a8a8a8; filter: drop-shadow(0 1px 2px rgba(168, 168, 168, 0.3)); }

.input-medal-gold {
  border-color: #ffe066;
  background: linear-gradient(90deg, #fffdf0 0%, white 30%);
}
.input-medal-gold :deep(svg) { color: #ffd700; filter: drop-shadow(0 1px 2px rgba(255, 215, 0, 0.4)); }

.input-group-score { display: flex; align-items: center; gap: 8px; flex: 1.2; }
.input-score { 
  width: 100%; height: 44px; text-align: center; border: 1px solid #d2d2d7;
  border-radius: 10px; outline: none; font-weight: 600; color: #1d1d1f;
  transition: border-color 0.2s;
}
.input-score:focus { border-color: #0071e3; }

.input-full { 
  width: 100%; height: 44px; background: #f5f5f7; border: 1px solid transparent; 
  padding: 0 14px; border-radius: 10px; font-size: 14px; outline: none; 
  color: #1d1d1f; transition: all 0.2s;
}
.input-full:focus { background: white; border-color: #0071e3; }
.input-full::placeholder { color: #aeaeb2; }

/* Card Footer */
.card-footer { margin-top: 24px; display: flex; justify-content: space-between; align-items: center; }

.btn-add {
  background: white; border: 1px solid #0071e3; color: #0071e3;
  padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s;
}
.btn-add:hover { background: #e8f2ff; }

.btn-save {
  background: #0071e3; color: white; border: none; padding: 10px 32px;
  border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 113, 227, 0.3); transition: 0.2s;
}
.btn-save:hover { background: #0077ed; transform: translateY(-1px); }

/* Responsive */
@media (max-width: 1200px) {
  .grid-container { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .tab-content { padding: 30px 20px; }
  .grid-container { grid-template-columns: 1fr; }
  .card-footer { flex-direction: column-reverse; gap: 10px; }
  .btn-add, .btn-save { width: 100%; justify-content: center; }
}
</style>