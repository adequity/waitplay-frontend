<template>
  <div class="vertical-brush-slider">
    <!-- 브러시 미리보기 원 -->
    <div
      class="brush-preview"
      :style="{
        width: `${previewSize}px`,
        height: `${previewSize}px`,
        backgroundColor: color
      }"
    ></div>

    <!-- 세로 트랙 -->
    <div
      class="slider-track"
      ref="trackRef"
      @mousedown="onTrackDown"
      @touchstart.prevent="onTrackTouchStart"
    >
      <div class="slider-fill" :style="{ height: fillPercent + '%' }"></div>
      <div class="slider-thumb" :style="{ bottom: fillPercent + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  size: number
  min: number
  max: number
  color: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:size', value: number): void
}>()

const trackRef = ref<HTMLElement | null>(null)

const fillPercent = computed(() => {
  return ((props.size - props.min) / (props.max - props.min)) * 100
})

const previewSize = computed(() => {
  // 미리보기 원 크기: 8~32px 범위로 매핑
  const ratio = (props.size - props.min) / (props.max - props.min)
  return 8 + ratio * 24
})

const updateFromY = (clientY: number) => {
  if (!trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  // 위=max, 아래=min이므로 Y 반전
  const ratio = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
  const value = Math.round(props.min + ratio * (props.max - props.min))
  emit('update:size', value)
}

// 마우스
const onTrackDown = (e: MouseEvent) => {
  updateFromY(e.clientY)
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
const onMouseMove = (e: MouseEvent) => { updateFromY(e.clientY) }
const onMouseUp = () => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

// 터치
const onTrackTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0]
  if (touch) updateFromY(touch.clientY)
  document.addEventListener('touchmove', onTouchMove, { passive: false })
  document.addEventListener('touchend', onTouchEnd)
}
const onTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  const touch = e.touches[0]
  if (touch) updateFromY(touch.clientY)
}
const onTouchEnd = () => {
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
}
</script>

<style scoped>
.vertical-brush-slider {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 20;
  padding: 14px 10px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.brush-preview {
  border-radius: 50%;
  transition: width 0.1s, height 0.1s;
  flex-shrink: 0;
}

.slider-track {
  position: relative;
  width: 4px;
  height: 160px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
  touch-action: none;
}

.slider-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 2px;
  transition: height 0.05s;
}

.slider-thumb {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 50%);
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: bottom 0.05s;
}
</style>
