<template>
  <div class="header-block">
    <!-- ✅ 배경 이미지 지연 로딩 적용 -->
    <div
      class="profile-bg"
      :class="{ 'bg-loaded': isBgLoaded }"
      :style="bgStyle"
      ref="bgRef"
    >
      <div
        v-if="gradientEnabled"
        class="gradient-overlay"
        :style="gradientStyle"
      ></div>
    </div>

    <div class="header-content">
      <!-- Logo (if provided) - 지연 로딩 적용 -->
      <div v-if="data.logoUrl" class="store-logo-container">
        <img
          :src="data.logoUrl"
          alt="매장 로고"
          class="store-logo"
          loading="lazy"
          decoding="async"
          @load="onLogoLoad"
          :class="{ 'logo-loaded': isLogoLoaded }"
        />
      </div>

      <h1 class="store-name" :style="titleStyle">{{ data.storeName }}</h1>
      <div class="store-info-text">
        <p v-for="(line, index) in welcomeLines" :key="index" class="info-line" :style="descStyle">
          {{ line }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { HeaderBlockData } from '@/types/blocks'

interface Props {
  data: HeaderBlockData
}

const props = defineProps<Props>()

// ✅ 이미지 로딩 상태 관리
const isBgLoaded = ref(false)
const isLogoLoaded = ref(false)
const bgRef = ref<HTMLElement | null>(null)

// 배경 이미지 스타일 (지연 로딩 후 적용)
const bgStyle = computed(() => {
  if (!isBgLoaded.value) return {}
  return { backgroundImage: `url(${props.data.backgroundImage})` }
})

// 로고 로드 완료 핸들러
const onLogoLoad = () => {
  isLogoLoaded.value = true
}

// Intersection Observer로 배경 이미지 지연 로딩
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!props.data.backgroundImage) {
    isBgLoaded.value = true
    return
  }

  // 배경 이미지 사전 로드
  const preloadBg = () => {
    const img = new Image()
    img.onload = () => {
      isBgLoaded.value = true
    }
    img.onerror = () => {
      isBgLoaded.value = true // 에러 시에도 표시
    }
    img.src = props.data.backgroundImage
  }

  // Intersection Observer로 뷰포트에 들어오면 로드
  if ('IntersectionObserver' in window && bgRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          preloadBg()
          observer?.disconnect()
        }
      },
      { rootMargin: '100px' } // 100px 전에 미리 로드
    )
    observer.observe(bgRef.value)
  } else {
    // Fallback: 즉시 로드
    preloadBg()
  }
})

onUnmounted(() => {
  observer?.disconnect()
})

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

// 폰트 패밀리 매핑
const fontFamilyMap: Record<string, string> = {
  'default': '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  'serif': '"Noto Serif KR", Georgia, serif',
  'rounded': '"Nanum Gothic", "Apple SD Gothic Neo", sans-serif',
  'handwriting': '"Gamja Flower", "Nanum Pen Script", cursive'
}

// 제목 스타일
const titleStyle = computed(() => {
  const fontFamily = props.data.titleFontFamily || 'default'
  const fontSize = props.data.titleFontSize || 32
  return {
    fontFamily: fontFamilyMap[fontFamily],
    fontSize: `${fontSize}px`
  }
})

// 설명 스타일
const descStyle = computed(() => {
  const fontSize = props.data.descFontSize || 15
  return {
    fontSize: `${fontSize}px`
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
  z-index: 1;
  background-color: #1a1a1a; /* 로딩 전 플레이스홀더 색상 */
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-bg.bg-loaded {
  opacity: 1;
}

/* Gradient overlay effect - 사진에서 배경색으로 자연스럽게 페이드 */
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 2;
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
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.store-logo.logo-loaded {
  opacity: 1;
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
