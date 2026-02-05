<template>
  <div
    class="marquee-block"
    :style="{
      backgroundColor: data.backgroundColor || '#ff6b6b',
      color: data.textColor || '#ffffff',
      marginTop: `${data.paddingTop ?? 5}px`,
      marginBottom: `${data.paddingBottom ?? 5}px`,
      padding: `${data.innerPadding ?? 8}px 0`
    }"
  >
    <div class="marquee-container">
      <div
        class="marquee-content"
        :style="{
          animationDuration: `${data.speed || 15}s`
        }"
      >
        <!-- 첫 번째 콘텐츠 -->
        <span class="marquee-item">
          <!-- 이미지 (image 또는 both 모드) -->
          <img
            v-if="showImage && data.imageUrl"
            :src="data.imageUrl"
            alt="배너"
            class="marquee-image"
          />
          <!-- 텍스트 (text 또는 both 모드) -->
          <span
            v-if="showText"
            class="marquee-text"
            :style="{ fontSize: `${data.fontSize || 14}px` }"
          >
            <span v-if="data.emoji" class="marquee-emoji">{{ data.emoji }}</span>
            {{ data.text || '공지사항을 입력하세요' }}
          </span>
        </span>
        <!-- 무한 스크롤을 위한 복제 -->
        <span class="marquee-item">
          <img
            v-if="showImage && data.imageUrl"
            :src="data.imageUrl"
            alt="배너"
            class="marquee-image"
          />
          <span
            v-if="showText"
            class="marquee-text"
            :style="{ fontSize: `${data.fontSize || 14}px` }"
          >
            <span v-if="data.emoji" class="marquee-emoji">{{ data.emoji }}</span>
            {{ data.text || '공지사항을 입력하세요' }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface MarqueeData {
  text?: string
  emoji?: string
  backgroundColor?: string
  textColor?: string
  speed?: number // 초 단위 (낮을수록 빠름)
  imageUrl?: string
  contentType?: 'text' | 'image' | 'both'
  paddingTop?: number // 블록 간 위 여백 (px)
  paddingBottom?: number // 블록 간 아래 여백 (px)
  fontSize?: number // 글자 크기 (px)
  innerPadding?: number // 내부 상하 여백 (px)
}

const props = defineProps<{
  data: MarqueeData
}>()

// 콘텐츠 타입에 따른 표시 여부
const contentType = computed(() => props.data.contentType || 'text')
const showText = computed(() => contentType.value === 'text' || contentType.value === 'both')
const showImage = computed(() => contentType.value === 'image' || contentType.value === 'both')
</script>

<style scoped>
.marquee-block {
  width: 100%;
  overflow: hidden;
  position: sticky;
  top: 0;
  z-index: 100;
}

.marquee-container {
  display: flex;
  width: 100%;
  overflow: hidden;
}

.marquee-content {
  display: flex;
  white-space: nowrap;
  animation: marquee-scroll linear infinite;
  align-items: center;
}

.marquee-item {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 0 40px;
}

.marquee-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.marquee-emoji {
  font-size: 16px;
}

.marquee-image {
  height: 40px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}

@keyframes marquee-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* 호버 시 일시정지 */
.marquee-block:hover .marquee-content {
  animation-play-state: paused;
}

/* 반응형 */
@media (max-width: 640px) {
  .marquee-item {
    padding: 0 30px;
    gap: 12px;
  }

  .marquee-image {
    height: 32px;
  }
}
</style>
