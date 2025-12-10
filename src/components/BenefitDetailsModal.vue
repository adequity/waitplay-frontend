<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <span class="game-icon">{{ gameIcon }}</span>
          <div class="header-text">
            <h2 class="modal-title">{{ gameName }}</h2>
            <p class="modal-subtitle">혜택 상세 관리</p>
          </div>
        </div>
        <button class="btn-close" @click="close">✕</button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Compact Stats Summary -->
        <div class="stats-summary">
          <div class="stat-item">
            <div class="stat-number">{{ stats.todayPlays }}</div>
            <div class="stat-text">오늘 플레이</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.avgScore }}</div>
            <div class="stat-text">평균 점수</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.couponsIssued }}</div>
            <div class="stat-text">발급 쿠폰</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.highestScore }}</div>
            <div class="stat-text">최고 점수</div>
          </div>
        </div>

        <!-- Benefits Accordion -->
        <div class="benefits-section">
          <div class="section-header">
            <h3 class="section-title">혜택 단계 설정</h3>
            <button class="btn-add-benefit" @click="addNewBenefit">
              <span class="plus-icon">+</span> 혜택 추가
            </button>
          </div>

          <div v-if="benefits.length > 0" class="accordion-list">
            <div
              v-for="(benefit, index) in benefits"
              :key="benefit.id"
              class="accordion-item"
              :class="{ 'is-expanded': expandedBenefitId === benefit.id, 'is-editing': editingBenefitId === benefit.id }"
            >
              <!-- Accordion Header -->
              <div class="accordion-header" @click="toggleAccordion(benefit.id)">
                <div class="header-left">
                  <div class="step-badge">{{ index + 1 }}</div>
                  <div class="benefit-summary">
                    <div class="benefit-title-row">
                      <span class="game-icon-small">{{ gameIcon }}</span>
                      <span class="benefit-name">{{ benefit.title }}</span>
                    </div>
                    <div class="benefit-score-range">
                      {{ benefit.requiredScore }}점 이상 달성 시
                    </div>
                  </div>
                </div>
                <div class="header-right">
                  <div class="usage-stats">
                    <span class="usage-rate">사용률 {{ benefit.usageRate }}%</span>
                    <span class="usage-count">{{ benefit.usedCount }}/{{ benefit.issuedCount }}</span>
                  </div>
                  <button class="accordion-toggle" :class="{ 'is-expanded': expandedBenefitId === benefit.id }">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Accordion Content -->
              <div class="accordion-content" v-show="expandedBenefitId === benefit.id">
                <!-- View Mode -->
                <div v-if="editingBenefitId !== benefit.id" class="view-mode">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>혜택 이름</label>
                      <div class="detail-value">{{ benefit.title }}</div>
                    </div>
                    <div class="detail-item">
                      <label>설명</label>
                      <div class="detail-value">{{ benefit.description || '-' }}</div>
                    </div>
                    <div class="detail-item">
                      <label>필요 점수</label>
                      <div class="detail-value highlight">{{ benefit.requiredScore }}점</div>
                    </div>
                    <div class="detail-item">
                      <label>쿠폰 접두사</label>
                      <div class="detail-value">{{ benefit.couponPrefix || '-' }}</div>
                    </div>
                    <div class="detail-item">
                      <label>유효기간</label>
                      <div class="detail-value">{{ benefit.expiryDays }}일</div>
                    </div>
                    <div class="detail-item">
                      <label>최대 발급</label>
                      <div class="detail-value">{{ benefit.maxIssuance || '무제한' }}</div>
                    </div>
                    <div class="detail-item">
                      <label>상태</label>
                      <div class="detail-value">
                        <span class="status-badge" :class="benefit.isActive ? 'active' : 'inactive'">
                          {{ benefit.isActive ? '활성화' : '비활성화' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="action-buttons">
                    <button class="btn-edit" @click.stop="startEdit(benefit)">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M10 1L13 4L5 12H2V9L10 1Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      수정
                    </button>
                    <button class="btn-delete" @click.stop="deleteBenefit(benefit.id)">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 4H12M5 4V2H9V4M3 4V12H11V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      삭제
                    </button>
                  </div>
                </div>

                <!-- Edit Mode -->
                <div v-else class="edit-mode">
                  <div class="form-grid">
                    <div class="form-group">
                      <label>혜택 이름 *</label>
                      <input v-model="editForm.title" type="text" class="form-input" placeholder="예: 아메리카노 1잔" />
                    </div>
                    <div class="form-group full-width">
                      <label>설명</label>
                      <input v-model="editForm.description" type="text" class="form-input" placeholder="혜택 설명을 입력하세요" />
                    </div>
                    <div class="form-group">
                      <label>필요 점수 *</label>
                      <input v-model.number="editForm.requiredScore" type="number" class="form-input" min="0" />
                    </div>
                    <div class="form-group">
                      <label>쿠폰 접두사</label>
                      <input v-model="editForm.couponPrefix" type="text" class="form-input" placeholder="예: DRINK" />
                    </div>
                    <div class="form-group">
                      <label>유효기간 (일)</label>
                      <input v-model.number="editForm.expiryDays" type="number" class="form-input" min="1" />
                    </div>
                    <div class="form-group">
                      <label>최대 발급 수</label>
                      <input v-model.number="editForm.maxIssuance" type="number" class="form-input" placeholder="무제한은 비워두세요" />
                    </div>
                    <div class="form-group full-width">
                      <label class="checkbox-label">
                        <input v-model="editForm.isActive" type="checkbox" class="form-checkbox" />
                        <span>활성화</span>
                      </label>
                    </div>
                  </div>

                  <div class="action-buttons">
                    <button class="btn-cancel" @click.stop="cancelEdit">취소</button>
                    <button class="btn-save" @click.stop="saveBenefit">저장</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-benefits">
            <div class="empty-icon">🎁</div>
            <p class="empty-text">설정된 혜택이 없습니다</p>
            <button class="btn-add-first" @click="addNewBenefit">첫 혜택 추가하기</button>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="btn-close-modal" @click="close">완료</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import benefitsService, { type BenefitDto } from '@/services/benefitsService'

interface Props {
  isOpen: boolean
  gameType: string
  gameName: string
  gameIcon: string
  qrCodeId: string
  stats: {
    todayPlays: number
    avgScore: number
    participants: number
    couponsIssued: number
    highestScore: number
    avgPlayTime: number
  }
}

interface EditForm {
  title: string
  description: string
  requiredScore: number
  couponPrefix: string
  expiryDays: number
  maxIssuance: number | undefined
  isActive: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  refresh: []
}>()

const benefits = ref<BenefitDto[]>([])
const expandedBenefitId = ref<string | null>(null)
const editingBenefitId = ref<string | null>(null)
const editForm = ref<EditForm>({
  title: '',
  description: '',
  requiredScore: 0,
  couponPrefix: '',
  expiryDays: 30,
  maxIssuance: undefined,
  isActive: true
})

// Load benefits when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await loadBenefits()
    expandedBenefitId.value = null
    editingBenefitId.value = null
  }
})

async function loadBenefits() {
  try {
    benefits.value = await benefitsService.getBenefitsByGame(props.qrCodeId, props.gameType)
  } catch (error) {
    console.error('Failed to load benefits:', error)
  }
}

function toggleAccordion(benefitId: string) {
  if (editingBenefitId.value === benefitId) {
    return // Don't toggle while editing
  }
  expandedBenefitId.value = expandedBenefitId.value === benefitId ? null : benefitId
}

function addNewBenefit() {
  // Emit event to open BenefitSettingModal for creating new benefit
  emit('close')
  // Trigger create modal in parent
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('open-benefit-modal', {
      detail: { gameType: props.gameType }
    }))
  }, 100)
}

function startEdit(benefit: BenefitDto) {
  editingBenefitId.value = benefit.id
  editForm.value = {
    title: benefit.title,
    description: benefit.description || '',
    requiredScore: benefit.requiredScore,
    couponPrefix: benefit.couponPrefix || '',
    expiryDays: benefit.expiryDays,
    maxIssuance: benefit.maxIssuance,
    isActive: benefit.isActive
  }
}

function cancelEdit() {
  editingBenefitId.value = null
  editForm.value = {
    title: '',
    description: '',
    requiredScore: 0,
    couponPrefix: '',
    expiryDays: 30,
    maxIssuance: undefined,
    isActive: true
  }
}

async function saveBenefit() {
  if (!editingBenefitId.value) return

  try {
    await benefitsService.updateBenefit(editingBenefitId.value, {
      title: editForm.value.title,
      description: editForm.value.description,
      requiredScore: editForm.value.requiredScore,
      couponPrefix: editForm.value.couponPrefix,
      expiryDays: editForm.value.expiryDays,
      maxIssuance: editForm.value.maxIssuance,
      isActive: editForm.value.isActive
    })

    await loadBenefits()
    editingBenefitId.value = null
    emit('refresh')
  } catch (error) {
    console.error('Failed to update benefit:', error)
    alert('혜택 수정에 실패했습니다')
  }
}

async function deleteBenefit(benefitId: string) {
  if (!confirm('정말 이 혜택을 삭제하시겠습니까?')) return

  try {
    await benefitsService.deleteBenefit(benefitId)
    await loadBenefits()
    expandedBenefitId.value = null
    emit('refresh')
  } catch (error) {
    console.error('Failed to delete benefit:', error)
    alert('혜택 삭제에 실패했습니다')
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
/* Modal Base */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.game-icon {
  font-size: 40px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.modal-subtitle {
  font-size: 13px;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 20px;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  background: #f8f9fc;
}

/* Compact Stats Summary */
.stats-summary {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #e5e7eb;
}

/* Benefits Section */
.benefits-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.btn-add-benefit {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add-benefit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.plus-icon {
  font-size: 16px;
  font-weight: 700;
}

/* Accordion */
.accordion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.accordion-item {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.accordion-item.is-expanded {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.accordion-item.is-editing {
  border-color: #f59e0b;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  background: white;
  transition: all 0.2s ease;
}

.accordion-header:hover {
  background: #f9fafb;
}

.accordion-item.is-editing .accordion-header {
  cursor: default;
  background: #fffbeb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.step-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.benefit-summary {
  flex: 1;
  min-width: 0;
}

.benefit-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.game-icon-small {
  font-size: 18px;
}

.benefit-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.benefit-score-range {
  font-size: 13px;
  color: #667eea;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.usage-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.usage-rate {
  font-size: 14px;
  font-weight: 700;
  color: #10b981;
}

.usage-count {
  font-size: 12px;
  color: #6b7280;
}

.accordion-toggle {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.accordion-toggle.is-expanded {
  transform: rotate(180deg);
  color: #667eea;
}

/* Accordion Content */
.accordion-content {
  padding: 0 16px 16px 16px;
  background: #f9fafb;
}

/* View Mode */
.view-mode {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.detail-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.detail-value.highlight {
  color: #667eea;
  font-weight: 700;
  border-color: #667eea;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

/* Edit Mode */
.edit-mode {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 12px;
  color: #374151;
  font-weight: 600;
}

.form-input {
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-edit,
.btn-delete,
.btn-cancel,
.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit {
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-edit:hover {
  background: #667eea;
  color: white;
}

.btn-delete {
  background: white;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn-delete:hover {
  background: #ef4444;
  color: white;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Empty State */
.empty-benefits {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.btn-add-first {
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add-first:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Footer */
.modal-footer {
  padding: 16px 28px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  background: white;
}

.btn-close-modal {
  padding: 10px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-modal:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    max-height: 95vh;
  }

  .stats-summary {
    flex-wrap: wrap;
    padding: 16px;
  }

  .stat-item {
    flex-basis: 50%;
    margin-bottom: 12px;
  }

  .stat-divider {
    display: none;
  }

  .detail-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .accordion-header {
    padding: 12px;
  }

  .header-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .benefit-title-row {
    flex-wrap: wrap;
  }
}
</style>
