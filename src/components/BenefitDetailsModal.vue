<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="game-icon">{{ gameIcon }}</span>
          {{ gameName }} 상세 통계
        </h2>
        <button class="btn-close" @click="close">✕</button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Game Statistics -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎮</div>
            <div class="stat-content">
              <p class="stat-label">오늘 플레이</p>
              <p class="stat-value">{{ stats.todayPlays }}회</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <p class="stat-label">평균 점수</p>
              <p class="stat-value">{{ stats.avgScore }}점</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <p class="stat-label">총 참여자</p>
              <p class="stat-value">{{ stats.participants }}명</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🎁</div>
            <div class="stat-content">
              <p class="stat-label">발급된 쿠폰</p>
              <p class="stat-value">{{ stats.couponsIssued }}장</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-content">
              <p class="stat-label">최고 점수</p>
              <p class="stat-value">{{ stats.highestScore }}점</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <p class="stat-label">평균 플레이 시간</p>
              <p class="stat-value">{{ stats.avgPlayTime }}초</p>
            </div>
          </div>
        </div>

        <!-- Benefits List -->
        <div v-if="benefits.length > 0" class="benefits-section">
          <h3 class="section-title">설정된 혜택</h3>
          <div class="benefits-list">
            <div v-for="benefit in benefits" :key="benefit.id" class="benefit-row">
              <div class="benefit-info">
                <span class="benefit-name">{{ benefit.title }}</span>
                <span class="benefit-requirement">{{ benefit.requiredScore }}점 이상</span>
              </div>
              <div class="benefit-metrics">
                <span class="metric">
                  발급: <strong>{{ benefit.issuedCount }}</strong>
                </span>
                <span class="metric">
                  사용: <strong>{{ benefit.usedCount }}</strong>
                </span>
                <span class="metric">
                  사용률: <strong>{{ benefit.usageRate }}%</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>설정된 혜택이 없습니다</p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="btn-close-modal" @click="close">닫기</button>
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

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const benefits = ref<BenefitDto[]>([])

// Load benefits when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await loadBenefits()
  }
})

async function loadBenefits() {
  try {
    benefits.value = await benefitsService.getBenefitsByGame(props.qrCodeId, props.gameType)
  } catch (error) {
    console.error('Failed to load benefits:', error)
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
  max-width: 700px;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 30px;
}

.stat-card {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 28px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #86868b;
  margin: 0 0 4px 0;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.benefits-section {
  margin-top: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.benefit-row {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.benefit-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.benefit-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.benefit-requirement {
  font-size: 13px;
  color: #0071e3;
  font-weight: 600;
}

.benefit-metrics {
  display: flex;
  gap: 16px;
}

.metric {
  font-size: 13px;
  color: #86868b;
}

.metric strong {
  color: #1d1d1f;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #86868b;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #e5e5ea;
  display: flex;
  justify-content: flex-end;
}

.btn-close-modal {
  padding: 12px 28px;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-modal:hover {
  background: #0077ed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .benefit-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
