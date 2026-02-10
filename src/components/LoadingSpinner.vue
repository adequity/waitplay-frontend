<template>
  <div class="loading-container" :class="{ 'full-page': fullPage }">
    <video
      v-if="hasVideo"
      ref="videoRef"
      autoplay
      loop
      muted
      playsinline
      class="loading-video"
      :style="{ width: size + 'px', height: size + 'px' }"
      @error="onVideoError"
    >
      <source :src="videoSrc" type="video/webm" />
      <source :src="videoSrcMp4" type="video/mp4" />
    </video>
    <!-- 영상 로드 실패 시 폴백 스피너 -->
    <div v-else class="spinner" :style="{ width: size + 'px', height: size + 'px' }"></div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  // 로딩 메시지
  message: {
    type: String,
    default: ''
  },
  // 영상 크기 (px)
  size: {
    type: Number,
    default: 100
  },
  // 전체 페이지 모드 (중앙 정렬)
  fullPage: {
    type: Boolean,
    default: false
  },
  // 비디오 사용 여부 (false면 기본 스피너)
  useVideo: {
    type: Boolean,
    default: true
  }
})

const videoRef = ref<HTMLVideoElement | null>(null)
const videoError = ref(false)

// 영상 파일 경로 (public 폴더에 위치)
const videoSrc = '/loading-character.webm'
const videoSrcMp4 = '/loading-character.mp4'

const hasVideo = computed(() => props.useVideo && !videoError.value)

const onVideoError = () => {
  videoError.value = true
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 0;
}

.loading-container.full-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.loading-video {
  object-fit: contain;
  border-radius: 12px;
}

/* 영상이 없을 때 폴백 스피너 */
.spinner {
  border: 3px solid #e5e5ea;
  border-top-color: #d4a853;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-message {
  font-size: 15px;
  color: #86868b;
  margin: 0;
  font-weight: 500;
}
</style>
