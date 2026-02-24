<template>
  <div class="carousel-view">
    <!-- 0건: 빈 상태 -->
    <div v-if="messages.length === 0" class="carousel-empty">
      <div class="empty-card">
        <div class="empty-icon">📝</div>
        <p class="empty-text">매장의 첫 방명록을<br/>작성해보세요!</p>
        <button v-if="isAuthenticated" class="empty-cta" @click="$emit('write')">방명록 남기기</button>
        <button v-else class="empty-cta" @click="$emit('go-to-login')">로그인하고 작성하기</button>
      </div>
    </div>

    <!-- 캐러셀 -->
    <template v-else>
      <!-- 카운터 -->
      <div class="carousel-counter">
        <span class="counter-current">{{ activeIndex + 1 }}</span>
        <span class="counter-sep">/</span>
        <span class="counter-total">{{ messages.length }}</span>
      </div>

      <div class="carousel-track" ref="trackRef">
        <div class="carousel-spacer"></div>

        <div
          v-for="(card, index) in messages"
          :key="card.id"
          class="carousel-card"
          :class="{
            active: activeId === card.id,
            'card-postit': displayMode === 'postit',
            'card-graffiti': displayMode === 'graffiti'
          }"
          :style="displayMode === 'postit' ? { background: getCardBg(card.color) } : {}"
          :data-id="card.id"
          :data-index="index"
          @click="$emit('open-detail', card)"
        >
          <!-- Postit 모드 -->
          <template v-if="displayMode === 'postit'">
            <div v-if="card.imageUrl" class="card-image-area">
              <img :src="card.imageUrl" :alt="`${card.userName}의 방명록`" class="card-img" loading="lazy" decoding="async" />
            </div>
            <div v-else-if="card.message" class="card-text-only">
              <p class="card-text">{{ card.message }}</p>
              <span class="card-author">{{ card.userName }}</span>
            </div>
          </template>

          <!-- Graffiti 모드 -->
          <template v-else>
            <div class="card-graffiti-img">
              <img v-if="card.imageUrl" :src="card.imageUrl" :alt="`${card.userName}의 방명록`" loading="lazy" decoding="async" />
            </div>
            <div class="card-graffiti-overlay">
              <span class="card-author">{{ card.userName }}</span>
              <span v-if="card.audioUrl" class="card-audio-badge" title="배경음악 있음">🎵</span>
            </div>
          </template>
        </div>

        <div class="carousel-spacer"></div>
      </div>

      <!-- 플로팅 작성 버튼 -->
      <div class="carousel-write-btn-wrapper">
        <button
          v-if="isAuthenticated"
          class="carousel-write-btn"
          @click="$emit('write')"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
            <path d="M2 2l7.586 7.586"/>
          </svg>
          <span>방명록 남기기</span>
        </button>
        <button
          v-else
          class="carousel-write-btn"
          @click="$emit('go-to-login')"
        >
          <span>로그인하고 작성하기</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { getCardBg } from '@/constants/guestbookColors'
import type { GuestbookBlockData } from '@/types/blocks'

interface Props {
  messages: any[]
  isAuthenticated: boolean
  qrCodeId: string
  displayMode: 'postit' | 'graffiti'
  data: GuestbookBlockData
}

const props = defineProps<Props>()
defineEmits<{
  'open-detail': [message: any]
  'write': []
  'go-to-login': []
}>()

const trackRef = ref<HTMLElement | null>(null)
const activeId = ref<string>('')
let observer: IntersectionObserver | null = null

const activeIndex = computed(() => {
  if (!activeId.value) return 0
  const idx = props.messages.findIndex(m => m.id === activeId.value)
  return idx >= 0 ? idx : 0
})

function setupObserver() {
  if (!trackRef.value || props.messages.length === 0) return

  cleanupObserver()

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          const id = (entry.target as HTMLElement).dataset.id
          if (id) activeId.value = id
        }
      }
    },
    {
      root: trackRef.value,
      threshold: 0.6,
      rootMargin: '0px -30% 0px -30%'
    }
  )

  const cards = trackRef.value.querySelectorAll('.carousel-card')
  cards.forEach(card => observer!.observe(card))

  // 초기 active 설정
  if (props.messages.length > 0 && !activeId.value) {
    activeId.value = props.messages[0].id
  }
}

function cleanupObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

// 자동 스크롤
let autoScrollRaf: number | null = null
let autoScrollPaused = false
let lastTimestamp: number | null = null
const AUTO_SCROLL_SPEED = 30 // px/sec

function startAutoScroll() {
  if (autoScrollRaf !== null) return
  lastTimestamp = null

  function step(timestamp: number) {
    if (!trackRef.value) { autoScrollRaf = null; return }
    if (lastTimestamp === null) { lastTimestamp = timestamp }

    if (!autoScrollPaused) {
      const delta = (timestamp - lastTimestamp) / 1000
      const track = trackRef.value
      const maxScroll = track.scrollWidth - track.clientWidth

      track.scrollLeft += AUTO_SCROLL_SPEED * delta

      if (track.scrollLeft >= maxScroll - 1) {
        track.scrollLeft = 0
      }
    }

    lastTimestamp = timestamp
    autoScrollRaf = requestAnimationFrame(step)
  }

  autoScrollRaf = requestAnimationFrame(step)
}

function stopAutoScroll() {
  if (autoScrollRaf !== null) {
    cancelAnimationFrame(autoScrollRaf)
    autoScrollRaf = null
  }
  lastTimestamp = null
}

function pauseAutoScroll() {
  autoScrollPaused = true
}

function resumeAutoScroll() {
  autoScrollPaused = false
  lastTimestamp = null
}

let listenersAttached = false

function setupAutoScrollListeners() {
  if (listenersAttached) return
  const track = trackRef.value
  if (!track) return
  listenersAttached = true
  track.addEventListener('pointerdown', pauseAutoScroll)
  track.addEventListener('pointerup', () => setTimeout(resumeAutoScroll, 500))
  track.addEventListener('pointerleave', () => setTimeout(resumeAutoScroll, 500))
  track.addEventListener('wheel', () => {
    pauseAutoScroll()
    setTimeout(resumeAutoScroll, 500)
  }, { passive: true })
}

onMounted(() => {
  nextTick(() => {
    setupObserver()
    if (props.messages.length > 0) {
      startAutoScroll()
      setupAutoScrollListeners()
    }
  })
})

onBeforeUnmount(() => {
  cleanupObserver()
  stopAutoScroll()
})

watch(() => props.messages.length, () => {
  nextTick(() => {
    setupObserver()
    if (props.messages.length > 0) {
      startAutoScroll()
      setupAutoScrollListeners()
    }
  })
})
</script>

<style scoped>
.carousel-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  min-height: 320px;
  position: relative;
  width: 100%;
}

/* Counter */
.carousel-counter {
  margin-bottom: 12px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  user-select: none;
}
.counter-current {
  font-weight: 700;
  color: rgba(0, 0, 0, 0.7);
}
.counter-sep {
  margin: 0 2px;
}

/* Track */
.carousel-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 20px 0;
  width: 100%;
}
.carousel-track::-webkit-scrollbar {
  display: none;
}

/* Spacer: 첫/마지막 카드를 센터에 정렬 */
.carousel-spacer {
  flex-shrink: 0;
  width: calc(50vw - 156px); /* 280/2 + gap/2 = 140 + 8 = 148 → 약간 여유 156 */
}

/* Card */
.carousel-card {
  flex-shrink: 0;
  width: 280px;
  aspect-ratio: 9 / 13;
  scroll-snap-align: center;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: scale(0.9);
  opacity: 0.7;
}
.carousel-card.active {
  transform: scale(1);
  opacity: 1;
}

/* Postit Card */
.card-postit {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-image-area {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

/* 텍스트만 있는 카드 */
.card-text-only {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}
.card-text {
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  margin: 0 0 12px;
}
.card-author {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.4);
}

/* Graffiti Card */
.card-graffiti {
  background: #1a1a1a;
}
.card-graffiti-img {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
.card-graffiti-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.card-graffiti-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-graffiti-overlay .card-author {
  color: rgba(255, 255, 255, 0.85);
}
.card-graffiti-overlay .card-audio-badge {
  font-size: 14px;
}

/* Empty State */
.carousel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0 24px;
}
.empty-card {
  text-align: center;
  padding: 40px 24px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 300px;
}
.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}
.empty-text {
  font-size: 16px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.6);
  margin: 0 0 20px;
}
.empty-cta {
  display: inline-block;
  padding: 12px 28px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.empty-cta:active {
  background: #1d4ed8;
}

/* Floating Write Button */
.carousel-write-btn-wrapper {
  margin-top: 20px;
}
.carousel-write-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 28px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: none;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.carousel-write-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.98);
}
.carousel-write-btn svg {
  opacity: 0.9;
}
</style>
