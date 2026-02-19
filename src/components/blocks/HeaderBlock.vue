<template>
  <div class="header-block" :class="{ 'banner-mode': isBannerStyle }">
    <!-- ========== DEFAULT 스타일 ========== -->
    <template v-if="!isBannerStyle">
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
    </template>

    <!-- ========== BANNER 스타일 ========== -->
    <template v-else>
      <!-- 배너 슬라이더 영역 -->
      <div
        class="banner-slider"
        :style="{ height: `${bannerHeight}vh` }"
        ref="bannerSliderRef"
      >
        <div
          class="banner-track"
          ref="bannerTrackRef"
          @scroll="onBannerScroll"
        >
          <div
            v-for="(slide, index) in bannerSlides"
            :key="index"
            class="banner-slide"
            @click="onSlideClick(slide)"
          >
            <div
              class="banner-slide-bg"
              :class="{ 'bg-loaded': slideLoadStates[index] }"
              :style="slideLoadStates[index] ? { backgroundImage: `url(${slide.imageUrl})` } : {}"
            ></div>
            <!-- 하단 페이드 그라데이션 -->
            <div class="banner-slide-gradient" :style="bannerGradientStyle"></div>
            <!-- 슬라이드 텍스트 (선택사항) -->
            <div v-if="slide.title || slide.subtitle" class="banner-slide-content">
              <h2 v-if="slide.title" class="banner-slide-title">{{ slide.title }}</h2>
              <p v-if="slide.subtitle" class="banner-slide-subtitle">{{ slide.subtitle }}</p>
            </div>
            <!-- 링크 아이콘 표시 -->
            <div v-if="slide.linkUrl" class="banner-link-indicator">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 도트 인디케이터 -->
        <div v-if="bannerSlides.length > 1" class="banner-dots">
          <button
            v-for="(_, index) in bannerSlides"
            :key="index"
            class="banner-dot"
            :class="{ active: currentSlideIndex === index }"
            @click="goToSlide(index)"
          ></button>
        </div>
      </div>

      <!-- 매장 정보 영역 (배너 아래) -->
      <div class="banner-store-info">
        <div class="banner-store-info-inner">
          <img
            v-if="data.logoUrl"
            :src="data.logoUrl"
            alt="매장 로고"
            class="banner-store-logo"
            loading="lazy"
            decoding="async"
            @load="onLogoLoad"
            :class="{ 'logo-loaded': isLogoLoaded }"
          />
          <div class="banner-store-text">
            <h1 class="banner-store-name" :style="titleStyle">{{ data.storeName }}</h1>
            <div class="banner-store-welcome">
              <p v-for="(line, index) in welcomeLines" :key="index" class="banner-welcome-line" :style="descStyle">
                {{ line }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { HeaderBlockData, BannerSlide } from '@/types/blocks'

interface Props {
  data: HeaderBlockData
}

const props = defineProps<Props>()

// ========== 공통 상태 ==========
const isLogoLoaded = ref(false)

const onLogoLoad = () => {
  isLogoLoaded.value = true
}

const welcomeLines = computed(() => {
  return props.data.welcomeMessage.split('\n').filter(line => line.trim())
})

// 폰트 패밀리 매핑
const fontFamilyMap: Record<string, string> = {
  'default': '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  'serif': '"Noto Serif KR", Georgia, serif',
  'rounded': '"Nanum Gothic", "Apple SD Gothic Neo", sans-serif',
  'handwriting': '"Gamja Flower", "Nanum Pen Script", cursive'
}

const titleStyle = computed(() => {
  const fontFamily = props.data.titleFontFamily || 'default'
  const fontSize = props.data.titleFontSize || 32
  return {
    fontFamily: fontFamilyMap[fontFamily],
    fontSize: `${fontSize}px`
  }
})

const descStyle = computed(() => {
  const fontSize = props.data.descFontSize || 15
  return {
    fontSize: `${fontSize}px`
  }
})

const gradientEnabled = computed(() => {
  return props.data.gradientOverlay?.enabled ?? true
})

const gradientStyle = computed(() => {
  const overlay = props.data.gradientOverlay
  const color = overlay?.color || '#121212'
  const startOpacity = (overlay?.startOpacity ?? 0) / 100
  const endOpacity = (overlay?.endOpacity ?? 100) / 100

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

// ========== DEFAULT 스타일 전용 ==========
const isBgLoaded = ref(false)
const bgRef = ref<HTMLElement | null>(null)

const bgStyle = computed(() => {
  if (!isBgLoaded.value) return {}
  return { backgroundImage: `url(${props.data.backgroundImage})` }
})

let observer: IntersectionObserver | null = null

// ========== BANNER 스타일 전용 ==========
const isBannerStyle = computed(() => props.data.headerStyle === 'banner')
const bannerHeight = computed(() => props.data.bannerHeight || 80)
const bannerSlides = computed<BannerSlide[]>(() => props.data.bannerSlides || [])
const currentSlideIndex = ref(0)
const bannerTrackRef = ref<HTMLElement | null>(null)
const bannerSliderRef = ref<HTMLElement | null>(null)
const slideLoadStates = ref<boolean[]>([])

let autoPlayTimer: ReturnType<typeof setInterval> | null = null

// 배너 하단 그라데이션
const bannerGradientStyle = computed(() => {
  const overlay = props.data.gradientOverlay
  const color = overlay?.color || '#121212'
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  return {
    background: `linear-gradient(
      to bottom,
      rgba(${r}, ${g}, ${b}, 0) 50%,
      rgba(${r}, ${g}, ${b}, 0.6) 80%,
      rgba(${r}, ${g}, ${b}, 0.95) 100%
    )`
  }
})

// 슬라이드 이미지 프리로드
const preloadSlideImages = () => {
  slideLoadStates.value = bannerSlides.value.map(() => false)
  bannerSlides.value.forEach((slide, index) => {
    if (!slide.imageUrl) {
      slideLoadStates.value[index] = true
      return
    }
    const img = new Image()
    img.onload = () => {
      slideLoadStates.value[index] = true
    }
    img.onerror = () => {
      slideLoadStates.value[index] = true
    }
    img.src = slide.imageUrl
  })
}

// 스크롤 이벤트로 현재 슬라이드 인덱스 추적
const onBannerScroll = () => {
  const track = bannerTrackRef.value
  if (!track) return
  const slideWidth = track.clientWidth
  if (slideWidth === 0) return
  const index = Math.round(track.scrollLeft / slideWidth)
  currentSlideIndex.value = Math.max(0, Math.min(index, bannerSlides.value.length - 1))
}

// 특정 슬라이드로 이동
const goToSlide = (index: number) => {
  const track = bannerTrackRef.value
  if (!track) return
  track.scrollTo({
    left: index * track.clientWidth,
    behavior: 'smooth'
  })
  currentSlideIndex.value = index
  resetAutoPlay()
}

// 슬라이드 클릭 시 링크 이동
const onSlideClick = (slide: BannerSlide) => {
  if (slide.linkUrl) {
    window.open(slide.linkUrl, '_blank', 'noopener,noreferrer')
  }
}

// 자동 재생
const startAutoPlay = () => {
  if (autoPlayTimer) clearInterval(autoPlayTimer)
  const autoPlay = props.data.bannerAutoPlay !== false
  if (!autoPlay || bannerSlides.value.length <= 1) return

  const interval = (props.data.bannerInterval || 5) * 1000
  autoPlayTimer = setInterval(() => {
    const next = (currentSlideIndex.value + 1) % bannerSlides.value.length
    goToSlide(next)
  }, interval)
}

const resetAutoPlay = () => {
  if (autoPlayTimer) clearInterval(autoPlayTimer)
  startAutoPlay()
}

// ========== Lifecycle ==========
onMounted(() => {
  if (isBannerStyle.value) {
    // 배너 모드
    preloadSlideImages()
    nextTick(() => {
      startAutoPlay()
    })
  } else {
    // 기본 모드
    if (!props.data.backgroundImage) {
      isBgLoaded.value = true
      return
    }

    const preloadBg = () => {
      const img = new Image()
      img.onload = () => { isBgLoaded.value = true }
      img.onerror = () => { isBgLoaded.value = true }
      img.src = props.data.backgroundImage
    }

    if ('IntersectionObserver' in window && bgRef.value) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            preloadBg()
            observer?.disconnect()
          }
        },
        { rootMargin: '100px' }
      )
      observer.observe(bgRef.value)
    } else {
      preloadBg()
    }
  }
})

onUnmounted(() => {
  observer?.disconnect()
  if (autoPlayTimer) clearInterval(autoPlayTimer)
})

// 슬라이드 변경 감지
watch(() => props.data.bannerSlides, () => {
  if (isBannerStyle.value) {
    preloadSlideImages()
  }
}, { deep: true })
</script>

<style scoped>
/* ========== DEFAULT 스타일 ========== */
.header-block {
  position: relative;
  padding: 3rem 1.5rem 2rem;
  text-align: center;
  min-height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.header-block.banner-mode {
  padding: 0;
  min-height: auto;
  display: block;
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
  background-color: #1a1a1a;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-bg.bg-loaded {
  opacity: 1;
}

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

/* ========== BANNER 스타일 ========== */
.banner-slider {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.banner-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  height: 100%;
}

.banner-track::-webkit-scrollbar {
  display: none;
}

.banner-slide {
  flex: 0 0 100%;
  position: relative;
  scroll-snap-align: start;
  cursor: default;
  height: 100%;
}

.banner-slide-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-color: #1a1a1a;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.banner-slide-bg.bg-loaded {
  opacity: 1;
}

.banner-slide-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.banner-slide-content {
  position: absolute;
  bottom: 40px;
  left: 24px;
  right: 24px;
  z-index: 2;
  text-align: left;
}

.banner-slide-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6), 0 4px 24px rgba(0, 0, 0, 0.4);
  line-height: 1.2;
}

.banner-slide-subtitle {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.4;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
}

.banner-link-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
}

/* 링크가 있는 슬라이드에 커서 변경 */
.banner-slide:has(.banner-link-indicator) {
  cursor: pointer;
}

/* 도트 인디케이터 */
.banner-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  gap: 6px;
}

.banner-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.banner-dot.active {
  background: #ffffff;
  width: 18px;
  border-radius: 3px;
}

/* 매장 정보 영역 */
.banner-store-info {
  padding: 20px 20px 16px;
}

.banner-store-info-inner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.banner-store-logo {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.banner-store-logo.logo-loaded {
  opacity: 1;
}

.banner-store-text {
  flex: 1;
  min-width: 0;
}

.banner-store-name {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 5px 0;
  letter-spacing: -0.01em;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-store-welcome {
  margin: 0;
}

.banner-welcome-line {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 768px) {
  .store-name {
    font-size: 36px;
  }

  .info-line {
    font-size: 17px;
  }

  .banner-slide-title {
    font-size: 36px;
  }

  .banner-slide-subtitle {
    font-size: 17px;
  }
}
</style>
