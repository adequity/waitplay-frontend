<template>
  <div class="countdown-block" :class="`countdown-block--${data.style}`">
    <div class="countdown-content">
      <h2 class="countdown-title">{{ data.title }}</h2>
      <p v-if="data.description" class="countdown-description">{{ data.description }}</p>

      <div v-if="!isExpired" class="countdown-timer">
        <div class="time-unit">
          <div class="time-value">{{ timeLeft.days }}</div>
          <div class="time-label">일</div>
        </div>
        <div class="time-separator">:</div>
        <div class="time-unit">
          <div class="time-value">{{ timeLeft.hours }}</div>
          <div class="time-label">시간</div>
        </div>
        <div class="time-separator">:</div>
        <div class="time-unit">
          <div class="time-value">{{ timeLeft.minutes }}</div>
          <div class="time-label">분</div>
        </div>
        <div class="time-separator">:</div>
        <div class="time-unit">
          <div class="time-value">{{ timeLeft.seconds }}</div>
          <div class="time-label">초</div>
        </div>
      </div>

      <div v-else class="countdown-expired">
        <p>이벤트가 종료되었습니다</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CountdownBlockData } from '@/types/blocks'

interface Props {
  data: CountdownBlockData
}

const props = defineProps<Props>()

const now = ref(Date.now())
let interval: number | null = null

const targetTime = computed(() => new Date(props.data.targetDate).getTime())

const isExpired = computed(() => now.value >= targetTime.value)

const timeLeft = computed(() => {
  const diff = targetTime.value - now.value

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  }
})

onMounted(() => {
  interval = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

<style scoped>
.countdown-block {
  padding: 2rem 1.5rem;
  margin-bottom: 1.5rem;
}

.countdown-content {
  text-align: center;
}

.countdown-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.countdown-description {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}

.time-value {
  font-size: 48px;
  font-weight: 700;
  color: #4f46e5;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.time-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 0.5rem;
  font-weight: 500;
}

.time-separator {
  font-size: 48px;
  font-weight: 700;
  color: #d1d5db;
  line-height: 1;
  margin: 0 0.25rem;
}

.countdown-expired {
  padding: 2rem;
  background: #f3f4f6;
  border-radius: 12px;
  font-size: 18px;
  color: #6b7280;
  font-weight: 500;
}

/* Card 스타일 - 카드 형태 */
.countdown-block--card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.countdown-block--card .countdown-title {
  color: white;
}

.countdown-block--card .countdown-description {
  color: rgba(255, 255, 255, 0.9);
}

.countdown-block--card .time-value {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.countdown-block--card .time-label {
  color: rgba(255, 255, 255, 0.8);
}

.countdown-block--card .time-separator {
  color: rgba(255, 255, 255, 0.5);
}

.countdown-block--card .countdown-expired {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Minimal 스타일 - 미니멀 */
.countdown-block--minimal .countdown-title {
  font-size: 20px;
  font-weight: 600;
}

.countdown-block--minimal .time-value {
  font-size: 36px;
}

.countdown-block--minimal .time-separator {
  font-size: 36px;
}

/* Banner 스타일 - 배너 형태 */
.countdown-block--banner {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12px;
  padding: 3rem 2rem;
}

.countdown-block--banner .countdown-title {
  font-size: 28px;
  color: white;
  margin-bottom: 1rem;
}

.countdown-block--banner .countdown-description {
  color: rgba(255, 255, 255, 0.95);
  font-size: 18px;
}

.countdown-block--banner .time-value {
  color: white;
  font-size: 56px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.countdown-block--banner .time-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

.countdown-block--banner .time-separator {
  color: rgba(255, 255, 255, 0.6);
  font-size: 56px;
}

.countdown-block--banner .countdown-expired {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 20px;
}

@media (max-width: 640px) {
  .time-value {
    font-size: 36px;
  }

  .time-separator {
    font-size: 36px;
  }

  .countdown-block--banner .time-value {
    font-size: 40px;
  }

  .countdown-block--banner .time-separator {
    font-size: 40px;
  }
}
</style>
