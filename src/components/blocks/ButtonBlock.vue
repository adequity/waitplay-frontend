<template>
  <div class="button-block">
    <a
      :href="data.url"
      target="_blank"
      class="block-button"
      :class="[`button-${data.style}`]"
    >
      <span v-if="data.icon" class="button-icon">{{ data.icon }}</span>
      <span class="button-text">{{ data.text }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import type { ButtonBlockData } from '@/types/blocks'

interface Props {
  data: ButtonBlockData
}

defineProps<Props>()
</script>

<style scoped>
.button-block {
  padding: 0 1.5rem;
  margin-bottom: 12px;
}

.block-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px 24px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 16px;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.button-primary {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.button-primary:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.2);
}

.button-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.button-secondary:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.08);
}

.button-icon {
  font-size: 20px;
}

.button-text {
  flex: 1;
  text-align: center;
}
</style>
