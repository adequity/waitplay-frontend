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

    <!-- 게임별 점수 가이드 -->
    <div class="score-guide-container">
      <button class="score-guide-toggle" @click="showScoreGuide = !showScoreGuide">
        <IconBase name="chart" class="guide-icon" />
        <span>게임별 점수 가이드</span>
        <span class="toggle-arrow">{{ showScoreGuide ? '▲' : '▼' }}</span>
      </button>

      <div v-if="showScoreGuide" class="score-guide-content">
        <div class="score-guide-grid">
          <!-- 핀볼 -->
          <div class="score-guide-card">
            <div class="guide-header">
              <IconBase name="target" class="guide-game-icon pinball" />
              <h4>핀볼</h4>
            </div>
            <div class="guide-body">
              <p class="guide-desc">범퍼/타겟 점수 누적, 콤보 보너스</p>
              <div class="score-range">
                <div class="range-item">
                  <span class="range-label">일반</span>
                  <span class="range-value">0 ~ 500점</span>
                </div>
                <div class="range-item">
                  <span class="range-label">중급</span>
                  <span class="range-value">500 ~ 1,000점</span>
                </div>
                <div class="range-item highlight">
                  <span class="range-label">상급</span>
                  <span class="range-value">1,000점+</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 같은 카드 찾기 -->
          <div class="score-guide-card">
            <div class="guide-header">
              <IconBase name="clone" class="guide-game-icon memory" />
              <h4>같은 카드 찾기</h4>
            </div>
            <div class="guide-body">
              <p class="guide-desc">기본 1000점 - 시간/이동 패널티 + 콤보 보너스 (제한시간 2분)</p>
              <div class="score-range">
                <div class="range-item">
                  <span class="range-label">🍬 캔디</span>
                  <span class="range-value">0 ~ 449점</span>
                </div>
                <div class="range-item">
                  <span class="range-label">🍪 쿠키</span>
                  <span class="range-value">450 ~ 599점</span>
                </div>
                <div class="range-item">
                  <span class="range-label">🧁 컵케이크</span>
                  <span class="range-value">600 ~ 749점</span>
                </div>
                <div class="range-item">
                  <span class="range-label">🍰 케이크</span>
                  <span class="range-value">750 ~ 899점</span>
                </div>
                <div class="range-item highlight">
                  <span class="range-label">🏆 마스터</span>
                  <span class="range-value">900점+</span>
                </div>
              </div>
              <p class="guide-tip">💡 빠른 클리어 시 시간 보너스 추가</p>
            </div>
          </div>

          <!-- 틀린 그림 찾기 -->
          <div class="score-guide-card">
            <div class="guide-header">
              <IconBase name="magnifying-glass" class="guide-game-icon spot" />
              <h4>틀린 그림 찾기</h4>
            </div>
            <div class="guide-body">
              <p class="guide-desc">성공 시 1000점 + 시간 보너스 + 난이도 보너스 - 힌트 사용 감점</p>
              <div class="score-range">
                <div class="range-item">
                  <span class="range-label">👀 초보</span>
                  <span class="range-value">0 ~ 600점</span>
                </div>
                <div class="range-item">
                  <span class="range-label">🔍 관찰자</span>
                  <span class="range-value">600 ~ 900점</span>
                </div>
                <div class="range-item">
                  <span class="range-label">🎯 명탐정</span>
                  <span class="range-value">900 ~ 1,200점</span>
                </div>
                <div class="range-item highlight">
                  <span class="range-label">🦅 독수리눈</span>
                  <span class="range-value">1,200점+</span>
                </div>
              </div>
              <p class="guide-tip">💡 힌트 미사용 + 빠른 클리어 = 고득점</p>
            </div>
          </div>

          <!-- 벽돌깨기 -->
          <div class="score-guide-card">
            <div class="guide-header">
              <IconBase name="utensils" class="guide-game-icon brick" />
              <h4>벽돌깨기</h4>
            </div>
            <div class="guide-body">
              <p class="guide-desc">벽돌 파괴 점수 누적, 스테이지 보너스</p>
              <div class="score-range">
                <div class="range-item">
                  <span class="range-label">일반</span>
                  <span class="range-value">0 ~ 300점</span>
                </div>
                <div class="range-item">
                  <span class="range-label">중급</span>
                  <span class="range-value">300 ~ 600점</span>
                </div>
                <div class="range-item highlight">
                  <span class="range-label">상급</span>
                  <span class="range-value">600점+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          <div v-for="(step, idx) in game.steps.slice(0, 3)" :key="idx" class="medal-box" :class="getMedalBoxBg(idx)">
            <!-- 커스텀 아이콘 -->
            <img v-if="step.iconType === 'custom' && step.customIconUrl"
                 :src="step.customIconUrl"
                 class="medal-icon custom-icon" />
            <!-- 프리셋 아이콘 -->
            <IconBase v-else :name="step.iconName || getMedalIconName(idx)"
                      class="medal-icon"
                      :style="{ color: getIconColor(step.iconName || getMedalIconName(idx)) }" />
            <span class="medal-name">{{ step.name || '미설정' }}</span>
            <span class="medal-score">{{ step.minScore }}-{{ step.maxScore }}점</span>
          </div>
          <!-- 빈 슬롯 표시 (3개 미만일 때) -->
          <div v-for="i in Math.max(0, 3 - game.steps.length)" :key="'empty-' + i" class="medal-box medal-box-empty">
            <IconBase name="plus" class="medal-icon empty-icon" />
            <span class="medal-name">미설정</span>
            <span class="medal-score">-</span>
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
                  <!-- 아이콘 선택 버튼 -->
                  <button class="icon-select-btn" @click="openIconPicker(game, index)" type="button">
                    <img v-if="step.iconType === 'custom' && step.customIconUrl"
                         :src="step.customIconUrl"
                         class="selected-icon custom" />
                    <IconBase v-else :name="step.iconName || getMedalIconName(index)"
                              class="selected-icon"
                              :style="{ color: getIconColor(step.iconName || getMedalIconName(index)) }" />
                    <span class="icon-change-text">변경</span>
                  </button>
                  <!-- Medal Name Input -->
                  <div class="input-group-medal">
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
            <button
              class="btn-save"
              @click="saveGameBenefits(game)"
              :disabled="saving[game.type]"
            >
              {{ saving[game.type] ? '저장 중...' : '저장' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  <!-- Icon Picker Modal -->
    <Teleport to="body">
      <div v-if="showIconPicker" class="icon-picker-overlay" @click.self="showIconPicker = false">
        <div class="icon-picker-modal">
          <div class="icon-picker-header">
            <h3>아이콘 선택</h3>
            <button class="close-btn" @click="showIconPicker = false">
              <IconBase name="close" />
            </button>
          </div>

          <div class="icon-picker-content">
            <!-- 프리셋 아이콘 -->
            <div class="icon-section">
              <h4>프리셋 아이콘</h4>
              <div class="icon-grid">
                <button
                  v-for="preset in iconPresets"
                  :key="preset.name"
                  class="icon-option"
                  :class="{ active: currentEditingStep?.game.steps[currentEditingStep?.stepIndex]?.iconName === preset.name }"
                  @click="selectPresetIcon(preset.name)"
                >
                  <IconBase :name="preset.name" :style="{ color: preset.color }" />
                  <span>{{ preset.label }}</span>
                </button>
              </div>
            </div>

            <!-- 커스텀 업로드 -->
            <div class="icon-section">
              <h4>커스텀 아이콘 업로드</h4>
              <p class="upload-hint">PNG, JPG, SVG (최대 10MB, 자동 리사이즈)</p>
              <label class="upload-btn">
                <IconBase name="image" />
                <span>이미지 업로드</span>
                <input type="file" accept="image/*" @change="handleIconUpload" hidden />
              </label>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
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
  id?: string
  name: string
  minScore: number
  maxScore: number
  reward: string
  iconType: 'preset' | 'custom'  // 아이콘 타입
  iconName: string               // 프리셋 아이콘 이름
  customIconUrl: string          // 커스텀 업로드 이미지 URL
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
const saving = ref<Record<string, boolean>>({})
const collapsedCards = ref<Record<string, boolean>>({})
const showScoreGuide = ref(false)

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

// 아이콘 프리셋 목록
const iconPresets = [
  { name: 'medal-bronze', label: '동메달', color: '#cd7f32' },
  { name: 'medal-silver', label: '은메달', color: '#a8a8a8' },
  { name: 'medal-gold', label: '금메달', color: '#ffd700' },
  { name: 'trophy', label: '트로피', color: '#ffd700' },
  { name: 'star', label: '별', color: '#ffc107' },
  { name: 'gift', label: '선물', color: '#e91e63' },
  { name: 'ticket', label: '티켓', color: '#9c27b0' },
  { name: 'sparkles', label: '반짝임', color: '#00bcd4' },
  { name: 'party-horn', label: '파티', color: '#ff5722' },
]

// 아이콘 선택 팝업 상태
const showIconPicker = ref(false)
const currentEditingStep = ref<{ game: GameBenefit; stepIndex: number } | null>(null)

// Default steps template
const defaultSteps: BenefitStep[] = [
  { name: '동메달', minScore: 6, maxScore: 7, reward: '아메리카노 1잔', iconType: 'preset', iconName: 'medal-bronze', customIconUrl: '' },
  { name: '은메달', minScore: 8, maxScore: 9, reward: '음료 2잔', iconType: 'preset', iconName: 'medal-silver', customIconUrl: '' },
  { name: '금메달', minScore: 10, maxScore: 10, reward: '디저트 세트', iconType: 'preset', iconName: 'medal-gold', customIconUrl: '' }
]

async function loadGameSettings() {
  loading.value = true
  try {
    const qrCodeId = authStore.user?.qrCodeId
    if (!qrCodeId) return

    // Load game settings and existing benefits in parallel
    const [settings, existingBenefits] = await Promise.all([
      gameSettingsService.getGameSettings(qrCodeId),
      benefitsService.getBenefits(qrCodeId)
    ])

    // 활성화된 게임 중 혜택이 없는 게임에 대해 기본 혜택 자동 생성
    const gamesNeedingDefaults: string[] = []

    gamesList.value = Object.entries(gameDefinitions).map(([type, def]) => {
      // Find existing benefits for this game type
      const gameBenefits = existingBenefits
        .filter(b => b.gameType === type)
        .sort((a, b) => a.requiredScore - b.requiredScore)

      const isEnabled = settings.enabledGames.includes(type)

      // 활성화된 게임인데 혜택이 없으면 자동 생성 목록에 추가
      if (isEnabled && gameBenefits.length === 0) {
        gamesNeedingDefaults.push(type)
      }

      // Convert API benefits to steps format
      const steps: BenefitStep[] = gameBenefits.length > 0
        ? gameBenefits.map((b, index, arr) => {
            const nextBenefit = arr[index + 1]
            return {
              id: b.id,
              name: b.title,
              minScore: b.requiredScore,
              maxScore: nextBenefit?.requiredScore
                ? nextBenefit.requiredScore - 1
                : b.requiredScore + 3,
              reward: b.description || '',
              // 아이콘 정보 (API에서 가져오거나 기본값)
              iconType: (b as any).iconType || 'preset',
              iconName: (b as any).iconName || getMedalIconName(index),
              customIconUrl: (b as any).customIconUrl || ''
            }
          })
        : JSON.parse(JSON.stringify(defaultSteps))

      return {
        type,
        name: def.name,
        icon: def.icon,
        enabled: isEnabled,
        steps
      }
    })

    // 기본 혜택이 필요한 게임들에 대해 자동 생성
    if (gamesNeedingDefaults.length > 0) {
      console.log('[BenefitsTab] Auto-creating default benefits for games:', gamesNeedingDefaults)
      await createDefaultBenefitsForGames(qrCodeId, gamesNeedingDefaults)
    }

  } catch (error) {
    console.error('Failed to load game settings:', error)
  } finally {
    loading.value = false
  }
}

// 기본 혜택을 자동으로 생성하는 함수
async function createDefaultBenefitsForGames(qrCodeId: string, gameTypes: string[]) {
  for (const gameType of gameTypes) {
    try {
      console.log(`[BenefitsTab] Creating default benefits for ${gameType}`)

      for (const step of defaultSteps) {
        const newBenefit = await benefitsService.createBenefit(qrCodeId, {
          gameType,
          title: step.name,
          description: step.reward,
          requiredScore: step.minScore,
          isActive: true,
          iconType: step.iconType,
          iconName: step.iconName,
          customIconUrl: step.customIconUrl
        })

        // 해당 게임의 steps에 ID 업데이트
        const game = gamesList.value.find(g => g.type === gameType)
        if (game) {
          const matchingStep = game.steps.find(s => s.name === step.name && s.minScore === step.minScore)
          if (matchingStep) {
            matchingStep.id = newBenefit.id
          }
        }
      }

      console.log(`[BenefitsTab] Default benefits created for ${gameType}`)
    } catch (error) {
      console.error(`[BenefitsTab] Failed to create default benefits for ${gameType}:`, error)
    }
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
    reward: '',
    iconType: 'preset',
    iconName: 'star',
    customIconUrl: ''
  })
}

// 아이콘 선택 팝업 열기
function openIconPicker(game: GameBenefit, stepIndex: number) {
  currentEditingStep.value = { game, stepIndex }
  showIconPicker.value = true
}

// 프리셋 아이콘 선택
function selectPresetIcon(iconName: string) {
  if (currentEditingStep.value) {
    const step = currentEditingStep.value.game.steps[currentEditingStep.value.stepIndex]
    if (step) {
      step.iconType = 'preset'
      step.iconName = iconName
      step.customIconUrl = ''
    }
  }
  showIconPicker.value = false
}

// 이미지 리사이즈 함수
function resizeImage(file: File, maxSize: number = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Canvas 생성
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        // 비율 유지하면서 리사이즈
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // 고품질 리사이즈
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // JPEG로 변환 (품질 0.9)
        const resizedBase64 = canvas.toDataURL('image/png', 0.9)
        resolve(resizedBase64)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// 커스텀 아이콘 업로드
async function handleIconUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length || !currentEditingStep.value) return

  const file = input.files[0]
  if (!file) return

  // 파일 크기 체크 (10MB 이하)
  if (file.size > 10 * 1024 * 1024) {
    alert('파일 크기는 10MB 이하여야 합니다.')
    return
  }

  // 이미지 타입 체크
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.')
    return
  }

  try {
    // 이미지를 128x128로 리사이즈
    const resizedBase64 = await resizeImage(file, 128)

    if (currentEditingStep.value) {
      const step = currentEditingStep.value.game.steps[currentEditingStep.value.stepIndex]
      if (step) {
        step.iconType = 'custom'
        step.customIconUrl = resizedBase64
        step.iconName = ''
      }
    }
    showIconPicker.value = false
  } catch (error) {
    console.error('Image resize failed:', error)
    alert('이미지 처리 중 오류가 발생했습니다.')
  }

  // 인풋 리셋
  input.value = ''
}

// 현재 단계의 아이콘 정보 가져오기
function getStepIcon(step: BenefitStep) {
  if (step.iconType === 'custom' && step.customIconUrl) {
    return { type: 'custom', url: step.customIconUrl }
  }
  return { type: 'preset', name: step.iconName || 'star' }
}

// 아이콘 프리셋의 색상 가져오기
function getIconColor(iconName: string): string {
  const preset = iconPresets.find(p => p.name === iconName)
  return preset?.color || '#86868b'
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
  const qrCodeId = authStore.user?.qrCodeId
  console.log('[BenefitsTab] Saving benefits for game:', game.type, 'qrCodeId:', qrCodeId)

  if (!qrCodeId) {
    alert('QR 코드 정보를 찾을 수 없습니다.')
    return
  }

  saving.value[game.type] = true

  try {
    // Get existing benefits for this game to compare
    const existingBenefits = await benefitsService.getBenefitsByGame(qrCodeId, game.type)
    console.log('[BenefitsTab] Existing benefits:', existingBenefits.length)
    const existingIds = new Set(existingBenefits.map(b => b.id))
    const currentIds = new Set(game.steps.filter(s => s.id).map(s => s.id))

    // Delete benefits that were removed
    for (const existing of existingBenefits) {
      if (!currentIds.has(existing.id)) {
        await benefitsService.deleteBenefit(existing.id)
      }
    }

    // Create or update each step
    for (const step of game.steps) {
      if (step.id && existingIds.has(step.id)) {
        // Update existing benefit
        await benefitsService.updateBenefit(step.id, {
          title: step.name,
          description: step.reward,
          requiredScore: step.minScore,
          iconType: step.iconType,
          iconName: step.iconName,
          customIconUrl: step.customIconUrl
        })
      } else {
        // Create new benefit
        console.log('[BenefitsTab] Creating new benefit:', step.name, step.minScore)
        const newBenefit = await benefitsService.createBenefit(qrCodeId, {
          gameType: game.type,
          title: step.name,
          description: step.reward,
          requiredScore: step.minScore,
          isActive: true,
          iconType: step.iconType,
          iconName: step.iconName,
          customIconUrl: step.customIconUrl
        })
        console.log('[BenefitsTab] Created benefit:', newBenefit)
        // Update local step with new ID
        step.id = newBenefit.id
      }
    }

    console.log('[BenefitsTab] All benefits saved successfully')
    alert(`${game.name} 혜택 설정이 저장되었습니다.`)
  } catch (error) {
    console.error('Failed to save benefits:', error)
    alert('혜택 저장에 실패했습니다. 다시 시도해주세요.')
  } finally {
    saving.value[game.type] = false
  }
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

// 메달 박스 배경색 클래스
function getMedalBoxBg(index: number): string {
  if (index === 0) return 'medal-box-bronze'
  if (index === 1) return 'medal-box-silver'
  if (index === 2) return 'medal-box-gold'
  return ''
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

/* Score Guide */
.score-guide-container {
  margin-bottom: 30px;
}

.score-guide-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 16px 20px;
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s;
}
.score-guide-toggle:hover {
  background: #f9f9fb;
  border-color: #d2d2d7;
}
.guide-icon {
  width: 20px;
  height: 20px;
  color: #0071e3;
}
.toggle-arrow {
  margin-left: auto;
  font-size: 12px;
  color: #86868b;
}

.score-guide-content {
  margin-top: 16px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.score-guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.score-guide-card {
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s;
}
.score-guide-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border-color: #d2d2d7;
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f5;
}
.guide-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
}

.guide-game-icon {
  width: 32px;
  height: 32px;
  padding: 6px;
  border-radius: 10px;
}
.guide-game-icon.pinball { background: #fff0f2; color: #ff3b30; }
.guide-game-icon.memory { background: #f0f7ff; color: #007aff; }
.guide-game-icon.spot { background: #f5f0ff; color: #5856d6; }
.guide-game-icon.brick { background: #fff5f0; color: #ff9500; }

.guide-body {}

.guide-desc {
  font-size: 13px;
  color: #86868b;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.score-range {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.range-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9f9fb;
  border-radius: 8px;
  font-size: 13px;
}
.range-item.highlight {
  background: linear-gradient(135deg, #fff8e6 0%, #fff3cc 100%);
  border: 1px solid #ffe066;
}
.range-label {
  font-weight: 600;
  color: #1d1d1f;
}
.range-value {
  color: #86868b;
  font-weight: 500;
}
.range-item.highlight .range-value {
  color: #f59e0b;
  font-weight: 700;
}

.guide-tip {
  margin: 12px 0 0 0;
  font-size: 12px;
  color: #0071e3;
  background: #f0f7ff;
  padding: 8px 12px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .score-guide-grid {
    grid-template-columns: 1fr;
  }
}

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
.card-content { display: block; animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.card.collapsed .card-content { display: none; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
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
.btn-save:hover:not(:disabled) { background: #0077ed; transform: translateY(-1px); }
.btn-save:disabled { background: #86868b; cursor: not-allowed; box-shadow: none; }

/* 아이콘 선택 버튼 */
.icon-select-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border: 2px dashed #d2d2d7;
  border-radius: 12px;
  background: #f9f9fb;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.icon-select-btn:hover {
  border-color: #0071e3;
  background: #f0f7ff;
}
.icon-select-btn .selected-icon {
  font-size: 28px;
  width: 28px;
  height: 28px;
}
.icon-select-btn .selected-icon.custom {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
}
.icon-select-btn .icon-change-text {
  font-size: 10px;
  color: #86868b;
  margin-top: 2px;
}

/* 커스텀 아이콘 이미지 */
.custom-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
}

/* 빈 메달 박스 */
.medal-box-empty {
  background: #f5f5f7;
  border: 2px dashed #d2d2d7;
}
.empty-icon {
  color: #aeaeb2;
}

/* 아이콘 피커 모달 */
.icon-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.icon-picker-modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 420px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: surfaceRise 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes surfaceRise {
  from { opacity: 0; transform: translateY(30px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.icon-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5ea;
}

.icon-picker-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #86868b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}
.close-btn:hover { color: #1d1d1f; }

.icon-picker-content {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
}

.icon-section {
  margin-bottom: 28px;
}
.icon-section:last-child { margin-bottom: 0; }

.icon-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.icon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border: 2px solid #e5e5ea;
  border-radius: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}
.icon-option:hover {
  border-color: #0071e3;
  background: #f0f7ff;
}
.icon-option.active {
  border-color: #0071e3;
  background: #e8f2ff;
}
.icon-option :deep(svg) {
  font-size: 32px;
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
}
.icon-option span {
  font-size: 12px;
  color: #1d1d1f;
  font-weight: 500;
}

.upload-hint {
  font-size: 13px;
  color: #86868b;
  margin: 0 0 12px 0;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  border: 2px dashed #d2d2d7;
  border-radius: 14px;
  background: #f9f9fb;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 600;
  color: #0071e3;
}
.upload-btn:hover {
  border-color: #0071e3;
  background: #f0f7ff;
}
.upload-btn :deep(svg) {
  font-size: 20px;
  width: 20px;
  height: 20px;
}

/* Responsive */
@media (max-width: 1200px) {
  .grid-container { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .tab-content { padding: 30px 20px; }
  .grid-container { grid-template-columns: 1fr; }
  .card-footer { flex-direction: column-reverse; gap: 10px; }
  .btn-add, .btn-save { width: 100%; justify-content: center; }
  .icon-grid { grid-template-columns: repeat(3, 1fr); }
  .icon-picker-modal { width: 95%; }
}
</style>