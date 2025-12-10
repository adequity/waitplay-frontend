<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">
          <IconBase :name="gameIconName" class="game-icon" />
          {{ gameName }} 혜택 설정
        </h2>
        <button class="btn-close" @click="close">✕</button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Existing Benefits List -->
        <div v-if="benefits.length > 0" class="benefits-section">
          <h3 class="section-title">현재 혜택 목록</h3>
          <div class="benefits-grid">
            <div
              v-for="benefit in benefits"
              :key="benefit.id"
              class="benefit-item"
              :class="{ inactive: !benefit.isActive }"
            >
              <div class="benefit-item-header">
                <span class="benefit-title">{{ benefit.title }}</span>
                <span class="benefit-score">{{ benefit.requiredScore }}점 이상</span>
              </div>
              <p v-if="benefit.description" class="benefit-desc">{{ benefit.description }}</p>
              <div class="benefit-stats">
                <span>발급: {{ benefit.issuedCount }}회</span>
                <span>사용: {{ benefit.usedCount }}회</span>
                <span>사용률: {{ benefit.usageRate }}%</span>
              </div>
              <div class="benefit-actions">
                <button class="btn-edit-small" @click="editBenefit(benefit)">수정</button>
                <button class="btn-delete-small" @click="deleteBenefit(benefit.id)">삭제</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add New Benefit Form -->
        <div class="form-section">
          <h3 class="section-title">
            {{ editingBenefitId ? '혜택 수정' : '새 혜택 추가' }}
          </h3>

          <div class="form-grid">
            <!-- Title -->
            <div class="form-group">
              <label class="form-label">혜택 제목 *</label>
              <input
                v-model="form.title"
                type="text"
                class="form-input"
                placeholder="예: 음료 1잔 무료"
              />
            </div>

            <!-- Required Score -->
            <div class="form-group">
              <label class="form-label">필요 점수 *</label>
              <input
                v-model.number="form.requiredScore"
                type="number"
                class="form-input"
                placeholder="8"
                min="0"
                max="10"
              />
            </div>

            <!-- Description -->
            <div class="form-group full-width">
              <label class="form-label">설명</label>
              <textarea
                v-model="form.description"
                class="form-textarea"
                placeholder="예: 아메리카노, 카페라떼 중 선택 가능"
                rows="3"
              />
            </div>

            <!-- Coupon Prefix -->
            <div class="form-group">
              <label class="form-label">쿠폰 접두사</label>
              <input
                v-model="form.couponPrefix"
                type="text"
                class="form-input"
                placeholder="DRINK"
                maxlength="20"
              />
            </div>

            <!-- Expiry Days -->
            <div class="form-group">
              <label class="form-label">유효 기간 (일)</label>
              <input
                v-model.number="form.expiryDays"
                type="number"
                class="form-input"
                placeholder="30"
                min="1"
              />
            </div>

            <!-- Max Issuance -->
            <div class="form-group">
              <label class="form-label">최대 발급 수</label>
              <input
                v-model.number="form.maxIssuance"
                type="number"
                class="form-input"
                placeholder="제한 없음"
                min="1"
              />
            </div>

            <!-- Is Active -->
            <div class="form-group">
              <label class="form-checkbox">
                <input v-model="form.isActive" type="checkbox" />
                <span>혜택 활성화</span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-cancel" @click="resetForm">취소</button>
            <button class="btn-save" @click="saveBenefit" :disabled="!isFormValid">
              {{ editingBenefitId ? '수정' : '추가' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import benefitsService, { type BenefitDto } from '@/services/benefitsService'
import IconBase from '@/components/IconBase.vue'

interface Props {
  isOpen: boolean
  gameType: string
  gameName: string
  gameIcon: string
  qrCodeId: string
}

const props = defineProps<Props>()

// Map FontAwesome class names to our icon names
const iconMapping: Record<string, string> = {
  'fa-solid fa-gamepad': 'gamepad',
  'fa-solid fa-dice': 'dice',
  'fa-solid fa-puzzle-piece': 'puzzle-piece'
}

const gameIconName = computed(() => {
  return iconMapping[props.gameIcon] || 'gamepad'
})
const emit = defineEmits<{
  close: []
  saved: []
}>()

const benefits = ref<BenefitDto[]>([])
const editingBenefitId = ref<string | null>(null)

// Form state
const form = ref({
  title: '',
  description: '',
  requiredScore: 8,
  couponPrefix: '',
  expiryDays: 30,
  maxIssuance: undefined as number | undefined,
  isActive: true
})

const isFormValid = computed(() => {
  return form.value.title.trim() !== '' && form.value.requiredScore >= 0 && form.value.requiredScore <= 10
})

// Load benefits when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await loadBenefits()
  } else {
    resetForm()
  }
})

async function loadBenefits() {
  try {
    benefits.value = await benefitsService.getBenefitsByGame(props.qrCodeId, props.gameType)
  } catch (error) {
    console.error('Failed to load benefits:', error)
  }
}

function editBenefit(benefit: BenefitDto) {
  editingBenefitId.value = benefit.id
  form.value = {
    title: benefit.title,
    description: benefit.description || '',
    requiredScore: benefit.requiredScore,
    couponPrefix: benefit.couponPrefix || '',
    expiryDays: benefit.expiryDays,
    maxIssuance: benefit.maxIssuance || undefined,
    isActive: benefit.isActive
  }
}

async function saveBenefit() {
  if (!isFormValid.value) return

  try {
    if (editingBenefitId.value) {
      // Update existing benefit
      await benefitsService.updateBenefit(editingBenefitId.value, {
        title: form.value.title,
        description: form.value.description || undefined,
        requiredScore: form.value.requiredScore,
        couponPrefix: form.value.couponPrefix || undefined,
        expiryDays: form.value.expiryDays,
        maxIssuance: form.value.maxIssuance,
        isActive: form.value.isActive
      })
    } else {
      // Create new benefit
      await benefitsService.createBenefit(props.qrCodeId, {
        gameType: props.gameType,
        title: form.value.title,
        description: form.value.description || undefined,
        requiredScore: form.value.requiredScore,
        couponPrefix: form.value.couponPrefix || undefined,
        expiryDays: form.value.expiryDays,
        maxIssuance: form.value.maxIssuance,
        isActive: form.value.isActive
      })
    }

    // Reload benefits and emit saved event
    await loadBenefits()
    resetForm()
    emit('saved')
  } catch (error) {
    console.error('Failed to save benefit:', error)
    alert('혜택 저장에 실패했습니다')
  }
}

async function deleteBenefit(benefitId: string) {
  if (!confirm('이 혜택을 삭제하시겠습니까?')) return

  try {
    await benefitsService.deleteBenefit(benefitId)
    await loadBenefits()
    emit('saved')
  } catch (error: any) {
    console.error('Failed to delete benefit:', error)
    if (error.response?.data?.message) {
      alert(error.response.data.message)
    } else {
      alert('혜택 삭제에 실패했습니다')
    }
  }
}

function resetForm() {
  editingBenefitId.value = null
  form.value = {
    title: '',
    description: '',
    requiredScore: 8,
    couponPrefix: '',
    expiryDays: 30,
    maxIssuance: undefined,
    isActive: true
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  border-bottom: 1px solid #e5e5ea;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.game-icon {
  font-size: 32px;
  width: 32px;
  height: 32px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #86868b;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.btn-close:hover {
  background: #f5f5f7;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

.benefits-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 20px 0;
}

.benefits-grid {
  display: grid;
  gap: 16px;
}

.benefit-item {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.benefit-item.inactive {
  opacity: 0.6;
}

.benefit-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.benefit-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.benefit-score {
  padding: 4px 10px;
  background: #0071e3;
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.benefit-desc {
  font-size: 14px;
  color: #6e6e73;
  margin: 0 0 12px 0;
}

.benefit-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #86868b;
  margin-bottom: 12px;
}

.benefit-actions {
  display: flex;
  gap: 8px;
}

.btn-edit-small,
.btn-delete-small {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit-small {
  background: #0071e3;
  color: white;
}

.btn-edit-small:hover {
  background: #0077ed;
}

.btn-delete-small {
  background: #e5e5ea;
  color: #1d1d1f;
}

.btn-delete-small:hover {
  background: #d1d1d6;
}

.form-section {
  background: #f5f5f7;
  border-radius: 16px;
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 1px solid #d2d2d7;
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0071e3;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #1d1d1f;
  cursor: pointer;
  user-select: none;
}

.form-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-save {
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: white;
  color: #1d1d1f;
}

.btn-cancel:hover {
  background: #e5e5ea;
}

.btn-save {
  background: #0071e3;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #0077ed;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
