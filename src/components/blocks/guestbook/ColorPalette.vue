<template>
  <div class="color-palette">
    <div class="color-scroll" ref="scrollRef">
      <button
        v-for="c in PRESET_COLORS"
        :key="c"
        class="color-dot"
        :class="{ selected: color === c }"
        :style="{ backgroundColor: c }"
        @click="selectColor(c)"
      >
        <span v-if="c === '#FFFFFF'" class="white-border"></span>
      </button>
      <!-- 커스텀 색상 선택 -->
      <div class="color-dot custom-color-dot">
        <div class="rainbow-ring"></div>
        <input
          type="color"
          :value="color"
          class="custom-color-input"
          @input="onCustomColor"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  color: string
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:color', value: string): void
  (e: 'color-selected'): void
}>()

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#A6A6A6', '#FF4040', '#FF7B00',
  '#FFD700', '#00E676', '#00BCD4', '#2979FF', '#7C4DFF',
  '#FF4081', '#8D6E63', '#37474F', '#D50000', '#FF6D00',
  '#FFD600', '#00C853', '#00B8D4', '#2962FF', '#6200EA',
  '#C51162', '#3E2723', '#FFAB91', '#B2FF59', '#84FFFF',
  '#B388FF', '#FF80AB'
]

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

/* 흰색은 테두리가 없으면 안 보이므로 내부 테두리 추가 */
.white-border {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

/* 커스텀 색상 버튼 */
.custom-color-dot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rainbow-ring {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: conic-gradient(
    #ff0000, #ff8800, #ffff00, #00ff00,
    #00ffff, #0000ff, #8800ff, #ff0088, #ff0000
  );
  pointer-events: none;
}

.custom-color-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
}
</style>
