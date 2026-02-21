<template>
  <div class="color-palette">
    <div class="color-scroll">
      <!-- 컬러 피커 버튼 (맨 앞) -->
      <div class="color-picker-btn">
        <div class="picker-icon" :style="{ backgroundColor: color }">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <input
          type="color"
          :value="color"
          class="native-color-input"
          @input="onCustomColor"
        />
      </div>

      <!-- 프리셋 색상들 -->
      <button
        v-for="c in displayColors"
        :key="c"
        class="color-dot"
        :class="{ selected: color === c }"
        :style="{ backgroundColor: c }"
        @click="selectColor(c)"
      >
        <span v-if="c === '#FFFFFF'" class="white-border"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  color: string
  colors?: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:color', value: string): void
  (e: 'color-selected'): void
}>()

const DEFAULT_COLORS = [
  '#FFFFFF', '#000000', '#A6A6A6', '#FF4040', '#FF7B00',
  '#FFD700', '#00E676', '#00BCD4', '#2979FF', '#7C4DFF',
  '#FF4081', '#8D6E63', '#37474F', '#D50000', '#FF6D00',
  '#FFD600', '#00C853', '#00B8D4', '#2962FF', '#6200EA',
  '#C51162', '#3E2723', '#FFAB91', '#B2FF59', '#84FFFF',
  '#B388FF', '#FF80AB'
]

const displayColors = computed(() =>
  props.colors && props.colors.length > 0 ? props.colors : DEFAULT_COLORS
)

const selectColor = (c: string) => {
  emit('update:color', c)
  emit('color-selected')
}

const onCustomColor = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  emit('update:color', value)
  emit('color-selected')
}
</script>

<style scoped>
.color-palette {
  flex: 1;
  overflow: hidden;
}

.color-scroll {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.color-scroll::-webkit-scrollbar {
  display: none;
}

/* 컬러 피커 버튼 */
.color-picker-btn {
  position: relative;
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
}

.picker-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: border-color 0.15s;
}
.color-picker-btn:hover .picker-icon {
  border-color: rgba(255, 255, 255, 0.6);
}

.native-color-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
}

/* 프리셋 색상 */
.color-dot {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  position: relative;
  transition: transform 0.15s ease;
  padding: 0;
  outline: none;
}
.color-dot:active {
  transform: scale(0.85);
}

.color-dot.selected {
  box-shadow: 0 0 0 2.5px rgba(0, 0, 0, 0.95), 0 0 0 4.5px rgba(255, 255, 255, 0.9);
}

.white-border {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  pointer-events: none;
}
</style>
