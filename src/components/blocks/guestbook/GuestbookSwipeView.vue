<template>
  <div class="swipe-view">
    <!-- 0건: 빈 상태 -->
    <div v-if="messages.length === 0" class="swipe-empty">
      <div class="empty-card">
        <div class="empty-icon">📝</div>
        <p class="empty-text">매장의 첫 방명록을<br/>작성해보세요!</p>
        <button v-if="isAuthenticated" class="empty-cta" @click="$emit('write')">방명록 남기기</button>
        <button v-else class="empty-cta" @click="$emit('go-to-login')">로그인하고 작성하기</button>
      </div>
    </div>

    <!-- 전부 본 상태 -->
    <div v-else-if="isAllRead" class="swipe-empty">
      <div class="empty-card">
        <div class="empty-icon">✨</div>
        <p class="empty-text">모든 방명록을<br/>확인했어요!</p>
        <div class="done-actions">
          <button class="done-btn secondary" @click="resetIndex">처음부터 다시 보기</button>
          <button v-if="isAuthenticated" class="done-btn primary" @click="$emit('write')">방명록 남기기</button>
          <button v-else class="done-btn primary" @click="$emit('go-to-login')">로그인하고 작성하기</button>
        </div>
      </div>
    </div>

    <!-- 스와이프 카드 스택 -->
    <template v-else>
      <!-- 카운터 -->
      <div class="swipe-counter">
        <span class="counter-current">{{ currentIndex + 1 }}</span>
        <span class="counter-sep">/</span>
        <span class="counter-total">{{ messages.length }}</span>
      </div>

      <div class="card-stack">
        <!-- 뒤 카드들 (역순으로 렌더링, 맨 앞이 마지막) -->
        <div
          v-for="(card, i) in visibleCards"
          :key="card.id"
          class="stack-card"
          :class="{
            'card-front': i === 0,
            'card-postit': displayMode === 'postit',
            'card-graffiti': displayMode === 'graffiti'
          }"
          :style="i === 0 ? frontCardStyle : getBackCardStyle(i)"
          v-bind="i === 0 ? pointerHandlers : {}"
        >
          <!-- Postit 모드 -->
          <template v-if="displayMode === 'postit'">
            <div v-if="card.imageUrl" class="card-image-area">
              <img :src="card.imageUrl" :alt="`${card.userName}의 방명록`" class="card-img" />
            </div>
            <div v-if="card.message" class="card-text">{{ card.message }}</div>
            <div class="card-footer">
              <span class="card-author">{{ card.userName }}</span>
              <div class="card-meta">
                <span v-if="card.audioUrl" class="card-audio-badge" title="배경음악 있음">🎵</span>
                <span class="card-date">{{ formatDate(card.createdAt) }}</span>
              </div>
            </div>
          </template>

          <!-- Graffiti 모드 -->
          <template v-else>
            <div class="card-graffiti-img">
              <img v-if="card.imageUrl" :src="card.imageUrl" :alt="`${card.userName}의 방명록`" />
            </div>
            <div class="card-graffiti-overlay">
              <span class="card-author">{{ card.userName }}</span>
              <span v-if="card.audioUrl" class="card-audio-badge" title="배경음악 있음">🎵</span>
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- 플로팅 작성 버튼 -->
    <div v-if="messages.length > 0 && !isAllRead" class="swipe-write-btn-wrapper">
      <button
        v-if="isAuthenticated"
        class="swipe-write-btn"
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
        class="swipe-write-btn"
        @click="$emit('go-to-login')"
      >
        <span>로그인하고 작성하기</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSwipeGesture } from '@/composables/useSwipeGesture'
import type { GuestbookBlockData } from '@/types/blocks'

interface Props {
  messages: any[]
  isAuthenticated: boolean
  qrCodeId: string
  displayMode: 'postit' | 'graffiti'
  data: GuestbookBlockData
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'open-detail': [message: any]
  'write': []
  'go-to-login': []
}>()

const currentIndex = ref(0)

const isAllRead = computed(() => currentIndex.value >= props.messages.length)

const visibleCards = computed(() => {
  return props.messages.slice(currentIndex.value, currentIndex.value + 3)
})

const handleDismiss = () => {
  swipe.reset()
  currentIndex.value++
}

const handleClick = () => {
  const msg = visibleCards.value[0]
  if (msg) {
    emit('open-detail', msg)
  }
}

const swipe = useSwipeGesture({
  threshold: 120,
  onDismiss: handleDismiss,
  onClick: handleClick,
})

const frontCardStyle = computed(() => {
  return {
    ...swipe.cardStyle.value,
    zIndex: 3,
  }
})

const getBackCardStyle = (stackIndex: number) => {
  const scale = 1 - stackIndex * 0.05
  const translateY = stackIndex * 8
  const opacity = 1 - stackIndex * 0.3
  return {
    transform: `scale(${scale}) translateY(${translateY}px)`,
    zIndex: 3 - stackIndex,
    opacity: Math.max(opacity, 0.2),
    pointerEvents: 'none' as const,
  }
}

const pointerHandlers = {
  onPointerdown: swipe.onPointerDown,
  onPointermove: swipe.onPointerMove,
  onPointerup: swipe.onPointerUp,
}

const resetIndex = () => {
  currentIndex.value = 0
  swipe.reset()
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}.${day}`
}
</script>

<style scoped>
.swipe-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  min-height: 320px;
  position: relative;
}

/* Counter */
.swipe-counter {
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

/* Card Stack */
.card-stack {
  position: relative;
  width: 280px;
  height: 360px;
}

.stack-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  user-select: none;
  will-change: transform, opacity;
  -webkit-user-select: none;
}

.card-front {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Postit Card */
.card-postit {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-postit .card-image-area {
  background: #ffffff;
}

.card-image-area {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  background: #ffffff;
}

.card-text {
  padding: 14px 16px 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.card-footer {
  padding: 8px 16px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-author {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-audio-badge {
  font-size: 12px;
  line-height: 1;
}

.card-date {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.35);
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

/* Empty / Done State */
.swipe-empty {
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

.done-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.done-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.done-btn.primary {
  background: #2563eb;
  color: white;
}

.done-btn.primary:active {
  background: #1d4ed8;
}

.done-btn.secondary {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.6);
}

.done-btn.secondary:active {
  background: rgba(0, 0, 0, 0.1);
}

/* Floating Write Button */
.swipe-write-btn-wrapper {
  margin-top: 20px;
}

.swipe-write-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.65);
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.swipe-write-btn:active {
  background: rgba(0, 0, 0, 0.1);
}

.swipe-write-btn svg {
  opacity: 0.7;
}
</style>
