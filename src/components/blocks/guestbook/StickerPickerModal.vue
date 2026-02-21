<template>
  <Teleport to="body">
    <Transition name="modal-fade">
    <div v-if="visible" class="sticker-picker-overlay" @click.self="close">
      <div class="sticker-picker-modal">
        <div class="sticker-picker-header">
          <div class="sticker-picker-header-row">
            <h4>스티커</h4>
            <button @click="close" class="sticker-picker-close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        <!-- 탭 메뉴 -->
        <div class="sticker-tabs">
          <button
            class="sticker-tab"
            :class="{ active: activeTab === 'emoji' }"
            @click="activeTab = 'emoji'"
          >
            이모지
          </button>
          <button
            class="sticker-tab"
            :class="{ active: activeTab === 'deco' }"
            @click="activeTab = 'deco'"
          >
            다꾸
          </button>
          <button
            class="sticker-tab"
            :class="{ active: activeTab === 'store' }"
            @click="activeTab = 'store'; loadStickerAssets()"
          >
            매장
          </button>
        </div>
        <!-- 이모지 탭 -->
        <div v-if="activeTab === 'emoji'" class="sticker-grid">
          <button
            v-for="emoji in emojiList"
            :key="emoji"
            class="sticker-option"
            @click="selectSticker('emoji', emoji)"
          >
            {{ emoji }}
          </button>
        </div>
        <!-- 다꾸 스티커팩 탭 -->
        <div v-else-if="activeTab === 'deco'" class="sticker-content">
          <div class="deco-category-tabs">
            <button
              v-for="(stickers, category) in decoStickerPacks"
              :key="category"
              class="deco-category-btn"
              :class="{ active: selectedDecoCategory === category }"
              @click="selectedDecoCategory = category as keyof typeof decoStickerPacks"
            >
              {{ stickers[0] }}
            </button>
          </div>
          <div class="sticker-grid deco-grid">
            <button
              v-for="sticker in decoStickerPacks[selectedDecoCategory]"
              :key="sticker"
              class="sticker-option deco-sticker"
              @click="selectSticker('emoji', sticker)"
            >
              {{ sticker }}
            </button>
          </div>
        </div>
        <!-- 매장 스티커 탭 -->
        <div v-else-if="activeTab === 'store'" class="sticker-content">
          <div v-if="isLoadingStickerAssets" class="sticker-loading">
            <span class="loading-spinner"></span>
            불러오는 중...
          </div>
          <div v-else-if="stickerAssets.length === 0" class="sticker-empty">
            <span>사용 가능한 스티커가 없습니다</span>
          </div>
          <template v-else>
            <div v-if="logoAssets.length > 0" class="sticker-section">
              <div class="sticker-section-title">매장 로고</div>
              <div class="sticker-asset-grid">
                <button
                  v-for="asset in logoAssets"
                  :key="asset.id"
                  class="sticker-asset-option"
                  @click="selectSticker(asset.type, asset.imageUrl)"
                >
                  <img :src="asset.imageUrl" :alt="asset.name" class="sticker-asset-img" />
                </button>
              </div>
            </div>
            <div v-if="gameAssets.length > 0" class="sticker-section">
              <div class="sticker-section-title">게임 에셋</div>
              <div class="sticker-asset-grid">
                <button
                  v-for="asset in gameAssets"
                  :key="asset.id"
                  class="sticker-asset-option"
                  @click="selectSticker(asset.type, asset.imageUrl)"
                >
                  <img :src="asset.imageUrl" :alt="asset.name" class="sticker-asset-img" />
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import guestbookService, { type StickerAsset } from '@/services/guestbookService'

interface Props {
  visible: boolean
  qrCodeId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add-sticker', payload: { type: string; content: string }): void
}>()

const activeTab = ref<'emoji' | 'store' | 'deco'>('emoji')
const selectedDecoCategory = ref<keyof typeof decoStickerPacks>('hearts')

// 스티커 에셋 (매장 탭)
const stickerAssets = ref<StickerAsset[]>([])
const isLoadingStickerAssets = ref(false)
const stickerAssetsLoaded = ref(false)

// 이모지 목록
const emojiList = ['😊', '❤️', '👍', '🎉', '✨', '🔥', '💯', '🌟', '💕', '😍', '🥰', '😘', '🤩', '👏', '💪', '🙌']

// 다꾸 스티커팩
const decoStickerPacks = {
  hearts: ['💖', '💗', '💓', '💞', '💕', '💘', '💝', '❤️‍🔥'],
  stars: ['⭐', '🌟', '✨', '💫', '🌠', '⚡', '🔆', '✴️'],
  flowers: ['🌸', '🌺', '🌹', '🌷', '🌻', '🌼', '💐', '🪻'],
  animals: ['🐰', '🐱', '🐶', '🦋', '🐻', '🦊', '🐼', '🦄'],
  food: ['🍰', '🧁', '🍩', '🍪', '🍭', '🍬', '☕', '🧋'],
  weather: ['☀️', '🌈', '☁️', '🌙', '⛅', '🌤️', '💧', '❄️'],
  objects: ['📷', '🎀', '🎈', '🎁', '💌', '📝', '🔮', '💎'],
  faces: ['😆', '🥹', '😋', '🤗', '😇', '🥳', '😎', '🤭']
} as const

// 스티커 에셋 분류
const logoAssets = computed(() => stickerAssets.value.filter(a => a.type === 'logo'))
const gameAssets = computed(() => stickerAssets.value.filter(a => a.type === 'asset'))

// 모달이 열릴 때 매장 스티커 미리 로드
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadStickerAssets()
  } else {
    // 닫힐 때 탭 초기화
    activeTab.value = 'emoji'
  }
})

const loadStickerAssets = async () => {
  if (stickerAssetsLoaded.value || isLoadingStickerAssets.value || !props.qrCodeId) return

  isLoadingStickerAssets.value = true
  try {
    const response = await guestbookService.getStickerAssets(props.qrCodeId)
    stickerAssets.value = response.assets
    stickerAssetsLoaded.value = true
  } catch {
    stickerAssets.value = []
    stickerAssetsLoaded.value = true
  } finally {
    isLoadingStickerAssets.value = false
  }
}

const close = () => {
  emit('close')
}

const selectSticker = (type: string, content: string) => {
  emit('add-sticker', { type, content })
  close()
}
</script>

<style scoped>
/* ===== 스티커 피커 오버레이 ===== */
.sticker-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* ===== 모바일 우선 하단 시트 ===== */
.sticker-picker-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 20px 20px 0 0;
  max-height: 70vh;
  max-height: 70dvh;
  width: 100%;
  max-width: 100%;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: sheetSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

@keyframes sheetSlideUp {
  from {
    opacity: 0;
    transform: translateY(100%) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 드래그 핸들 */
.sticker-picker-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.sticker-picker-header::before {
  content: '';
  width: 36px;
  height: 5px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  margin-bottom: 14px;
}

.sticker-picker-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.sticker-picker-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.3px;
}

.sticker-picker-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.06);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #86868b;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.sticker-picker-close:active {
  transform: scale(0.9);
  background: rgba(0, 0, 0, 0.12);
}

/* 스티커 탭 - 모바일 터치 최적화 */
.sticker-tabs {
  display: flex;
  gap: 0;
  margin: 0 16px 12px;
  background: rgba(118, 118, 128, 0.12);
  border-radius: 12px;
  padding: 3px;
}

.sticker-tab {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #3c3c43;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.sticker-tab.active {
  background: white;
  color: #1d1d1f;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.sticker-tab:active:not(.active) {
  background: rgba(0, 0, 0, 0.04);
}

/* 스티커 콘텐츠 영역 - 모바일 스크롤 최적화 */
.sticker-content {
  min-height: 180px;
  max-height: calc(70vh - 180px);
  max-height: calc(70dvh - 180px);
  overflow-y: auto;
  padding: 0 16px 20px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.sticker-content::-webkit-scrollbar {
  display: none;
}

.sticker-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 180px;
  color: #86868b;
  font-size: 14px;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(0, 0, 0, 0.08);
  border-top-color: #007aff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sticker-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 180px;
  color: #86868b;
  font-size: 15px;
  text-align: center;
  padding: 24px;
}

.sticker-empty::before {
  content: '🏪';
  font-size: 40px;
  margin-bottom: 6px;
}

/* 스티커 섹션 */
.sticker-section {
  margin-bottom: 20px;
}

.sticker-section:last-child {
  margin-bottom: 0;
}

.sticker-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-left: 4px;
}

/* 에셋 스티커 그리드 - 모바일 최적화 */
.sticker-asset-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.sticker-asset-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 8px;
  background: #f5f5f7;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.sticker-asset-option:active:not(:disabled) {
  transform: scale(0.92);
  background: rgba(0, 122, 255, 0.12);
}

.sticker-asset-option:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.sticker-asset-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 12px;
}

.sticker-asset-label {
  font-size: 11px;
  font-weight: 500;
  color: #3c3c43;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 이모지 스티커 그리드 - 모바일 터치 최적화 */
.sticker-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  padding: 0 16px 20px;
}

.sticker-option {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: #f5f5f7;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  min-height: 54px;
}

.sticker-option:active:not(:disabled) {
  transform: scale(0.88);
  background: rgba(255, 149, 0, 0.15);
}

.sticker-option:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 다꾸 스티커 그리드 */
.sticker-grid.deco-grid {
  gap: 8px;
}

.sticker-option.deco-sticker {
  font-size: 26px;
  border-radius: 14px;
}

.sticker-option.deco-sticker:active:not(:disabled) {
  background: rgba(255, 45, 85, 0.15);
}

/* 다꾸 카테고리 탭 - 모바일 스와이프 최적화 */
.deco-category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  padding: 4px;
  background: #f5f5f7;
  border-radius: 14px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.deco-category-tabs::-webkit-scrollbar {
  display: none;
}

.deco-category-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.deco-category-btn:active {
  transform: scale(0.9);
}

.deco-category-btn.active {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 모달 트랜지션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
