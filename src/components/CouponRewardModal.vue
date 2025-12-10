<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="celebration-icon">
            <IconBase name="party-horn" />
          </div>
          <h2 class="modal-title">축하합니다!</h2>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Benefit Info -->
        <div class="benefit-info">
          <div class="benefit-icon-wrapper">
            <IconBase name="gift" />
          </div>
          <h3 class="benefit-title">{{ benefit.title }}</h3>
          <p v-if="benefit.description" class="benefit-description">
            {{ benefit.description }}
          </p>
          <div class="score-badge">
            {{ benefit.requiredScore }}점 달성!
          </div>
        </div>

        <!-- Coupon Display (after generation) -->
        <div v-if="couponCode" class="coupon-section">
          <div class="coupon-code-box">
            <p class="coupon-label">쿠폰 코드</p>
            <p class="coupon-code">{{ couponCode }}</p>
            <p class="expiry-warning">
              <IconBase name="clock" class="warning-icon" /> {{ expiryMinutes }}분 내에 직원에게 제시하세요
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isGenerating" class="loading-section">
          <div class="spinner"></div>
          <p>쿠폰 생성 중...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="error-section">
          <p class="error-message">{{ error }}</p>
        </div>

        <!-- Instructions -->
        <div v-if="!couponCode && !isGenerating" class="instructions">
          <p>이 혜택을 지금 받으시겠습니까?</p>
          <p class="warning-text">
            <IconBase name="triangle-exclamation" class="warning-icon" /> 쿠폰은 즉시 사용해야 하며, 나중에 사용할 수 없습니다
          </p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <template v-if="!couponCode && !isGenerating">
          <button class="btn-secondary" @click="close">나중에</button>
          <button class="btn-primary" @click="generateCoupon">지금 받기</button>
        </template>
        <template v-else-if="couponCode">
          <button class="btn-primary-full" @click="close">확인</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import couponsService from '@/services/couponsService'
import IconBase from '@/components/IconBase.vue'

interface Props {
  isOpen: boolean
  benefit: {
    id: string
    title: string
    description?: string
    requiredScore: number
  }
  userId: string
  gameScoreId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const couponCode = ref<string>('')
const expiryMinutes = ref<number>(5)
const isGenerating = ref(false)
const error = ref<string>('')

async function generateCoupon() {
  isGenerating.value = true
  error.value = ''

  try {
    const response = await couponsService.generateCoupon({
      benefitId: props.benefit.id,
      userId: props.userId,
      gameScoreId: props.gameScoreId
    })

    couponCode.value = response.couponCode
    expiryMinutes.value = response.expiresInMinutes
  } catch (err: any) {
    console.error('Failed to generate coupon:', err)
    error.value = err.response?.data?.message || '쿠폰 생성에 실패했습니다'
  } finally {
    isGenerating.value = false
  }
}

function close() {
  emit('close')
  // Reset state
  couponCode.value = ''
  error.value = ''
  isGenerating.value = false
}
</script>

<style scoped>
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
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
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

.modal-header {
  padding: 30px 30px 20px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.celebration-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  color: white;
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.modal-body {
  padding: 30px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.benefit-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.benefit-icon-wrapper {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.benefit-icon-wrapper i {
  font-size: 48px;
  color: white;
}

.benefit-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.benefit-description {
  font-size: 16px;
  color: #6e6e73;
  margin: 0;
  max-width: 80%;
}

.score-badge {
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
}

.coupon-section {
  margin-top: 8px;
}

.coupon-code-box {
  background: #f5f5f7;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.coupon-label {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.coupon-code {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  letter-spacing: 4px;
  font-family: 'Courier New', monospace;
  margin: 0 0 12px 0;
}

.expiry-warning {
  font-size: 14px;
  color: #ff3b30;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.warning-icon {
  width: 14px;
  height: 14px;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f5f5f7;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-section {
  background: #fff5f5;
  border: 1px solid #ff3b30;
  border-radius: 12px;
  padding: 16px;
}

.error-message {
  color: #ff3b30;
  font-size: 14px;
  margin: 0;
  text-align: center;
}

.instructions {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.instructions p {
  font-size: 16px;
  color: #1d1d1f;
  margin: 0;
}

.warning-text {
  font-size: 14px !important;
  color: #ff9500 !important;
  font-weight: 600;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid #e5e5ea;
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary,
.btn-primary-full {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-secondary:hover {
  background: #e5e5ea;
}

.btn-primary-full {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary-full:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    margin: 20px;
  }

  .benefit-icon-wrapper {
    width: 80px;
    height: 80px;
  }

  .benefit-icon-wrapper i {
    font-size: 36px;
  }

  .benefit-title {
    font-size: 20px;
  }

  .coupon-code {
    font-size: 24px;
    letter-spacing: 2px;
  }
}
</style>
