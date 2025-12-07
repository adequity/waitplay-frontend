<template>
  <div class="header-block">
    <div
      class="profile-bg"
      :style="{ backgroundImage: `url(${data.backgroundImage})` }"
    >
      <div
        v-if="gradientEnabled"
        class="gradient-overlay"
        :style="gradientStyle"
      ></div>
    </div>

    <div class="header-content">
      <!-- Logo (if provided) -->
      <div v-if="data.logoUrl" class="store-logo-container">
        <img :src="data.logoUrl" alt="매장 로고" class="store-logo" />
      </div>

      <h1 class="store-name">{{ data.storeName }}</h1>
      <div class="store-info-text">
        <p v-for="(line, index) in welcomeLines" :key="index" class="info-line">
          {{ line }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HeaderBlockData } from '@/types/blocks'

interface Props {
  data: HeaderBlockData
}

const props = defineProps<Props>()

const welcomeLines = computed(() => {
  return props.data.welcomeMessage.split('\n').filter(line => line.trim())
})

const gradientEnabled = computed(() => {
  return props.data.gradientOverlay?.enabled ?? true
})

const gradientStyle = computed(() => {
  const overlay = props.data.gradientOverlay
  const color = overlay?.color || '#121212'
  const startOpacity = (overlay?.startOpacity ?? 0) / 100
  const endOpacity = (overlay?.endOpacity ?? 100) / 100

  // Convert hex to rgb
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  return {
    background: `linear-gradient(
      to bottom,
      rgba(${r}, ${g}, ${b}, ${startOpacity}) 0%,
      rgba(${r}, ${g}, ${b}, ${startOpacity + (endOpacity - startOpacity) * 0.4}) 40%,
      rgba(${r}, ${g}, ${b}, ${startOpacity + (endOpacity - startOpacity) * 0.7}) 70%,
      rgba(${r}, ${g}, ${b}, ${startOpacity + (endOpacity - startOpacity) * 0.95}) 90%,
      rgba(${r}, ${g}, ${b}, ${endOpacity}) 100%
    )`
  }
})
</script>

<style scoped>
.header-block {
  position: relative;
  padding: 3rem 1.5rem 2rem;
  text-align: center;
  min-height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.profile-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 450px;
  background-size: cover;
  background-position: center;
  border-radius: 0;
}

/* Gradient overlay effect - 사진에서 배경색으로 자연스럽게 페이드 */
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 10;
}

.store-logo-container {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.store-logo {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.store-name {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.02em;
  color: #ffffff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6), 0 4px 24px rgba(0, 0, 0, 0.4);
}

.store-info-text {
  margin: 0 0 2rem 0;
}

.info-line {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0.4rem 0;
  line-height: 1.5;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.75), 0 4px 24px rgba(0, 0, 0, 0.45);
}

@media (min-width: 768px) {
  .store-name {
    font-size: 36px;
  }

  .info-line {
    font-size: 17px;
  }
}
</style>
