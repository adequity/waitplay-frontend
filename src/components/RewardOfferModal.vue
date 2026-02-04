<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <!-- Confetti Effect -->
      <div class="confetti-container">
        <div v-for="i in 20" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
      </div>

      <!-- Modal Content -->
      <div class="modal-content">
        <!-- Score Section -->
        <div class="score-section">
          <div class="score-badge">
            <span class="score-label">획득 점수</span>
            <span class="score-value">{{ score.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Reward Info -->
        <div class="reward-section">
          <div class="reward-icon">
            <IconBase name="gift" :size="48" />
          </div>
          <h2 class="reward-title">{{ reward.title }}</h2>
          <p v-if="reward.description" class="reward-description">
            {{ reward.description }}
          </p>
          <div class="required-score">
            필요 점수: {{ reward.requiredScore.toLocaleString() }}점
          </div>
        </div>

        <!-- Question -->
        <div class="question-section">
          <p class="question-text">이 혜택을 쿠폰으로 받으시겠습니까?</p>
          <p class="warning-text">
            <IconBase name="triangle-exclamation" :size="14" />
            쿠폰은 즉시 사용해야 하며, 5분 후 만료됩니다
          </p>
        </div>

        <!-- Buttons -->
        <div class="button-section">
          <button class="btn-secondary" @click="handleDecline">
            아니오, 괜찮아요
          </button>
          <button class="btn-primary" @click="handleAccept">
            네, 받을게요!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconBase from '@/components/IconBase.vue'

interface Props {
  isOpen: boolean
  score: number
  reward: {
    id: string
    title: string
    description?: string
    requiredScore: number
  }
}

defineProps<Props>()
const emit = defineEmits<{
  accept: []
  decline: []
  close: []
}>()

function handleAccept() {
  emit('accept')
}

function handleDecline() {
  emit('decline')
  emit('close')
}

function close() {
  emit('close')
}

function getConfettiStyle(index: number) {
  const colors = ['#667eea', '#764ba2', '#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1']
  return {
    '--delay': `${index * 0.1}s`,
    '--left': `${Math.random() * 100}%`,
    '--color': colors[index % colors.length]
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  position: relative;
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  overflow: hidden;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--color);
  left: var(--left);
  top: -20px;
  border-radius: 2px;
  animation: confettiFall 3s ease-out var(--delay) infinite;
}

@keyframes confettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(150px) rotate(720deg);
    opacity: 0;
  }
}

.modal-content {
  padding: 32px 24px;
  text-align: center;
}

.score-section {
  margin-bottom: 24px;
}

.score-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.score-label {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.9;
}

.score-value {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.2;
}

.reward-section {
  margin-bottom: 24px;
}

.reward-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #f39c12;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.reward-title {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.reward-description {
  font-size: 15px;
  color: #6e6e73;
  margin: 0 0 12px 0;
}

.required-score {
  display: inline-block;
  padding: 6px 16px;
  background: #f5f5f7;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
}

.question-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f5f7;
  border-radius: 12px;
}

.question-text {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.warning-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #ff9500;
  margin: 0;
}

.button-section {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
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
  color: #6e6e73;
}

.btn-secondary:hover {
  background: #e5e5ea;
}

@media (max-width: 480px) {
  .modal-container {
    max-width: 100%;
    margin: 10px;
  }

  .score-value {
    font-size: 28px;
  }

  .reward-title {
    font-size: 20px;
  }

  .button-section {
    flex-direction: column;
  }
}
</style>
