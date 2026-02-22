<template>
  <Teleport to="body">
    <Transition name="editor-slide">
      <div v-if="visible" class="drawing-editor">

        <!-- ===== 캔버스 영역 (풀스크린) ===== -->
        <div class="editor-canvas-area">
          <div class="canvas-wrapper" :class="{ 'graffiti-mode': displayMode === 'graffiti' }" :style="displayMode !== 'graffiti' ? { backgroundColor: selectedCardColor } : {}">
            <!-- 안내 플레이스홀더 -->
            <div v-if="!canSubmit" class="canvas-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
              </svg>
              <span>{{ displayMode === 'graffiti' ? '벽에 낙서를 남겨보세요!' : '여기에 그려주세요' }}</span>
            </div>

            <!-- 캔버스 -->
            <canvas
              ref="canvasRef"
              class="drawing-canvas"
              :class="{ 'graffiti-canvas': displayMode === 'graffiti' }"
              @mousedown="onCanvasMouseDown"
              @mousemove="onCanvasMouseMove"
              @mouseup="onCanvasDrawEnd"
              @mouseleave="onCanvasDrawEnd"
              @touchstart.prevent="onCanvasTouchStart"
              @touchmove.prevent="onCanvasTouchMove"
              @touchend.prevent="onCanvasDrawEnd"
            ></canvas>

            <!-- 스티커 레이어 -->
            <div class="canvas-stickers-layer" v-if="editingStickers.length > 0">
              <div
                v-for="(sticker, index) in editingStickers"
                :key="index"
                class="editing-sticker"
                :class="{ selected: selectedEditingStickerIndex === index }"
                :style="{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`
                }"
                @mousedown.stop="selectSticker(index, $event)"
                @touchstart.stop.prevent="selectStickerTouch(index, $event)"
              >
                <img
                  v-if="sticker.type === 'logo' || sticker.type === 'asset'"
                  :src="sticker.content"
                  class="editing-sticker-img"
                />
                <span v-else class="editing-sticker-emoji">{{ sticker.content }}</span>
                <button
                  v-if="selectedEditingStickerIndex === index"
                  class="sticker-delete-btn"
                  @click.stop="deleteSticker(index)"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 템플릿(액자) 오버레이 -->
            <img
              v-if="templateOverlayUrl"
              :src="templateOverlayUrl"
              crossorigin="anonymous"
              class="template-overlay"
              @load="onTemplateOverlayLoad"
            />
          </div>
        </div>

        <!-- ===== 왼쪽 상단: X 닫기 ===== -->
        <button class="floating-close-btn" @click="closeModal">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <!-- ===== 오른쪽 도구 컨테이너 ===== -->
        <div class="right-side-container">
          <!-- 드로우 도구 패널 (색상 팔레트 + 브러시 슬라이더) -->
          <Transition name="draw-panel">
            <div v-if="showDrawPanel" class="draw-tools-panel">
              <!-- 세로 색상 팔레트 -->
              <div class="vertical-palette">
                <div class="vertical-palette-scroll">
                  <!-- 컬러 피커 -->
                  <div class="v-color-picker-btn">
                    <div class="v-picker-icon" :style="{ backgroundColor: selectedColor }">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                    </div>
                    <input
                      type="color"
                      :value="selectedColor"
                      class="v-native-color-input"
                      @input="onVerticalCustomColor"
                    />
                  </div>
                  <!-- 프리셋 색상들 -->
                  <button
                    v-for="c in verticalDisplayColors"
                    :key="c"
                    class="v-color-dot"
                    :class="{ selected: selectedColor === c }"
                    :style="{ backgroundColor: c }"
                    @click="onVerticalColorSelect(c)"
                  >
                    <span v-if="c === '#FFFFFF'" class="v-white-border"></span>
                  </button>
                </div>
              </div>

              <!-- 브러시 슬라이더 -->
              <VerticalBrushSlider
                v-model:size="brushSize"
                :min="minBrushSize"
                :max="maxBrushSize"
                :color="isEraser ? '#888888' : selectedColor"
              />
            </div>
          </Transition>

          <!-- 도구 버튼 열 -->
          <div class="right-tools">
            <!-- 그리기 모드 -->
            <button
              class="tool-btn"
              :class="{ active: activeMode === 'draw' && !isEraser }"
              @click="activateDrawMode"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
              </svg>
            </button>

            <!-- 지우개 -->
            <button
              class="tool-btn"
              :class="{ active: activeMode === 'draw' && isEraser }"
              @click="activateEraser"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8l10-10c.8-.8 2-.8 2.8 0l5.2 5.2c.8.8.8 2 0 2.8L13 19"/>
              </svg>
            </button>

            <!-- 스티커 -->
            <button
              class="tool-btn"
              :class="{ active: activeMode === 'sticker' }"
              @click="activateStickerMode"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </button>

            <!-- 카메라 촬영 -->
            <button class="tool-btn" @click="openCamera">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>

            <!-- 갤러리 -->
            <button class="tool-btn" @click="openGallery">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>

            <!-- Undo -->
            <button
              class="tool-btn"
              :disabled="!canUndo"
              @click="undo"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
            </button>

            <!-- 전체 지우기 -->
            <button
              class="tool-btn"
              @click="handleClear"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- ===== BOTTOM BAR ===== -->
        <div class="editor-bottom-bar">
          <!-- draw 모드: 음악 / 배경색 / 프레임 버튼 -->
          <div v-if="activeMode === 'draw'" class="bottom-tool-btns">
            <!-- 음악 버튼 -->
            <button class="bottom-tool-btn" :class="{ active: !!selectedBgm }" @click="openBgmPicker">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
              <span>음악</span>
            </button>
            <!-- 배경색 버튼 -->
            <button class="bottom-tool-btn" @click="showBgColorSheet = !showBgColorSheet">
              <span class="btn-color-dot" :style="{ backgroundColor: selectedCardColor }"></span>
              <span>배경색</span>
            </button>
            <!-- 프레임 버튼 -->
            <button class="bottom-tool-btn" :class="{ active: !!templateOverlayUrl }" @click="showFrameSheet = !showFrameSheet">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <rect x="7" y="7" width="10" height="10" rx="1"/>
              </svg>
              <span>프레임</span>
            </button>
          </div>

          <!-- 스티커 모드: 스티커 추가/지우기 -->
          <Transition name="tools-crossfade" mode="out-in">
            <div v-if="activeMode === 'sticker'" key="sticker" class="bottom-sticker-tools">
              <button class="add-sticker-btn" @click="isStickerPickerOpen = true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                스티커 추가
              </button>
              <button
                v-if="editingStickers.length > 0"
                class="clear-stickers-btn"
                @click="handleClearStickers"
              >
                모두 지우기
              </button>
            </div>
          </Transition>

          <!-- 완료 버튼 -->
          <button
            class="done-btn"
            :disabled="!canSubmit || isSubmitting"
            @click="submitDrawing"
          >
            <template v-if="isSubmitting">
              <span class="spinner"></span>
            </template>
            <template v-else>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </template>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 숨겨진 파일 입력 -->
  <input
    ref="cameraInputRef"
    type="file"
    accept="image/*"
    capture="environment"
    class="hidden-file-input"
    @change="onFileSelected"
  />
  <input
    ref="galleryInputRef"
    type="file"
    accept="image/*"
    class="hidden-file-input"
    @change="onFileSelected"
  />
  <!-- 스티커 피커 -->
  <StickerPickerModal
    :visible="isStickerPickerOpen"
    :qr-code-id="qrCodeId"
    @close="isStickerPickerOpen = false"
    @add-sticker="onAddSticker"
  />

  <!-- 배경색 선택 하단 시트 -->
  <Teleport to="body">
    <Transition name="bgm-picker">
      <div v-if="showBgColorSheet" class="bgm-picker-overlay" @click.self="showBgColorSheet = false">
        <div class="bgm-picker-sheet bg-color-sheet">
          <div class="bgm-picker-header">
            <h3>배경색 선택</h3>
            <button class="bgm-picker-close" @click="showBgColorSheet = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="bg-color-grid">
            <!-- 컬러 피커 -->
            <div class="bg-grid-picker-btn">
              <div class="bg-grid-picker-icon" :style="{ backgroundColor: selectedCardColor }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <input
                type="color"
                :value="selectedCardColor"
                class="bg-grid-native-input"
                @input="(e) => { selectedCardColor = (e.target as HTMLInputElement).value }"
              />
            </div>
            <!-- 팔레트 색상 -->
            <button
              v-for="hex in verticalDisplayColors"
              :key="hex"
              class="bg-grid-dot"
              :class="{ selected: selectedCardColor === hex }"
              :style="{ backgroundColor: hex }"
              @click="selectedCardColor = hex"
            >
              <svg v-if="selectedCardColor === hex" class="bg-grid-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 프레임 선택 하단 시트 -->
  <Teleport to="body">
    <Transition name="bgm-picker">
      <div v-if="showFrameSheet" class="bgm-picker-overlay" @click.self="showFrameSheet = false">
        <div class="bgm-picker-sheet frame-sheet">
          <div class="bgm-picker-header">
            <h3>프레임 선택</h3>
            <button class="bgm-picker-close" @click="showFrameSheet = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="frame-grid">
            <div v-if="isLoadingFrames" class="frame-loading">
              <span class="spinner"></span>
            </div>
            <template v-else>
              <!-- 없음 -->
              <button
                class="frame-card"
                :class="{ selected: !templateOverlayUrl }"
                @click="selectFrame(null)"
              >
                <div class="frame-preview none-frame">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                </div>
                <span class="frame-name">없음</span>
              </button>
              <!-- 프레임 목록 -->
              <button
                v-for="tmpl in frameTemplates"
                :key="tmpl.id"
                class="frame-card"
                :class="{ selected: selectedFrameId === tmpl.id }"
                @click="selectFrame(tmpl)"
              >
                <div class="frame-preview">
                  <img :src="tmpl.thumbnailUrl || tmpl.imageUrl" :alt="tmpl.name" />
                </div>
                <span class="frame-name">{{ tmpl.name }}</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- BGM 선택 피커 -->
  <Teleport to="body">
    <Transition name="bgm-picker">
      <div v-if="showBgmPicker" class="bgm-picker-overlay" @click.self="closeBgmPicker">
        <div class="bgm-picker-sheet">
          <div class="bgm-picker-header">
            <h3>배경 음악 선택</h3>
            <button class="bgm-picker-close" @click="closeBgmPicker">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- 카테고리 필터 -->
          <div v-if="bgmCategories.length > 0" class="bgm-category-filter">
            <button
              class="bgm-category-chip"
              :class="{ active: !bgmCategoryFilter }"
              @click="bgmCategoryFilter = ''"
            >전체</button>
            <button
              v-for="cat in bgmCategories"
              :key="cat"
              class="bgm-category-chip"
              :class="{ active: bgmCategoryFilter === cat }"
              @click="bgmCategoryFilter = cat"
            >{{ cat }}</button>
          </div>

          <!-- 트랙 목록 -->
          <div class="bgm-track-list">
            <div v-if="bgmLoading" class="bgm-loading">
              <span class="spinner"></span>
            </div>
            <div v-else-if="filteredBgmTracks.length === 0" class="bgm-empty">
              등록된 배경 음악이 없습니다
            </div>
            <button
              v-for="track in filteredBgmTracks"
              :key="track.id"
              class="bgm-track-item"
              :class="{ selected: selectedBgm?.id === track.id, playing: previewingTrackId === track.id }"
              @click="selectBgmTrack(track)"
            >
              <button class="bgm-track-play" @click.stop="previewBgmTrack(track)">
                <svg v-if="previewingTrackId !== track.id" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              </button>
              <div class="bgm-track-info">
                <span class="bgm-track-title">{{ track.title }}</span>
                <span v-if="track.artist" class="bgm-track-artist">{{ track.artist }}</span>
              </div>
              <span v-if="track.category" class="bgm-track-category">{{ track.category }}</span>
              <svg v-if="selectedBgm?.id === track.id" class="bgm-track-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          </div>

          <!-- 선택 없이 닫기 -->
          <div class="bgm-picker-footer">
            <button class="bgm-none-btn" @click="removeBgm(); closeBgmPicker()">
              음악 없이 진행
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 팔로우(단골등록) 모달 -->
  <Teleport to="body">
    <Transition name="follow-modal">
      <div v-if="showFollowModal" class="follow-modal-overlay" @click.self="showFollowModal = false">
        <div class="follow-modal-card">
          <div class="follow-modal-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
              <path d="M16 11l2 2 4-4"/>
            </svg>
          </div>
          <h3 class="follow-modal-title">단골 등록이 필요해요</h3>
          <p class="follow-modal-desc">
            <strong>{{ followStoreName }}</strong>의 방명록을 작성하려면<br/>
            먼저 단골 등록이 필요합니다.
          </p>
          <div class="follow-modal-actions">
            <button
              class="follow-modal-confirm"
              :disabled="followLoading"
              @click="followAndRetry"
            >
              <span v-if="followLoading" class="spinner small"></span>
              <template v-else>단골 등록 후 방명록 남기기</template>
            </button>
            <button
              class="follow-modal-cancel"
              :disabled="followLoading"
              @click="showFollowModal = false"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, type Ref } from 'vue'
import { useGuestbookCanvas, type DisplayMode } from '@/composables/useGuestbookCanvas'
import { useGuestbookStickers } from '@/composables/useGuestbookStickers'
import guestbookService from '@/services/guestbookService'
import followService from '@/services/followService'
import bgmService, { type BgmTrack } from '@/services/bgmService'
import StickerPickerModal from './StickerPickerModal.vue'
import VerticalBrushSlider from './VerticalBrushSlider.vue'
import { DEFAULT_BG_COLOR, getCardBgHex } from '@/constants/guestbookColors'

interface Props {
  visible: boolean
  qrCodeId: string
  displayMode: DisplayMode
  initialMode?: 'camera' | 'draw'
  selectedTemplate?: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submitted'): void
}>()

const isSubmitting = ref(false)
const isStickerPickerOpen = ref(false)
const activeMode = ref<'draw' | 'sticker'>('draw')
const cameraInputRef = ref<HTMLInputElement | null>(null)
const galleryInputRef = ref<HTMLInputElement | null>(null)

// BGM 선택 상태
const showBgmPicker = ref(false)
const bgmTracks = ref<BgmTrack[]>([])
const bgmCategories = ref<string[]>([])
const bgmCategoryFilter = ref('')
const bgmLoading = ref(false)
const selectedBgm = ref<BgmTrack | null>(null)
const isBgmPlaying = ref(false)
const previewingTrackId = ref<string | null>(null)
const bgmPreviewAudio = ref<HTMLAudioElement | null>(null)

// 배경색 선택 상태
const selectedCardColor = ref(DEFAULT_BG_COLOR)
const showBgColorSheet = ref(false)

// 프레임 선택 상태
const showFrameSheet = ref(false)
const frameTemplates = ref<any[]>([])
const isLoadingFrames = ref(false)
const selectedFrameId = ref<number | null>(null)

// 팔로우(단골등록) 모달 상태
const showFollowModal = ref(false)
const followStoreName = ref('')
const followLoading = ref(false)

// 드로우 도구 패널 상태
const isActivelyDrawing = ref(false)
const drawToolsOpened = ref(false)
const showDrawPanel = computed(() => drawToolsOpened.value && !isActivelyDrawing.value && activeMode.value === 'draw')

// 템플릿(액자) 상태 - prop에서 전달받음
const templateOverlayUrl = ref<string | null>(null)
const templateOverlayImage = ref<HTMLImageElement | null>(null)

// 팔레트 색상
const paletteColors = ref<string[]>([])
const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const DEFAULT_COLORS = [
  '#FFFFFF', '#000000', '#A6A6A6', '#FF4040', '#FF7B00',
  '#FFD700', '#00E676', '#00BCD4', '#2979FF', '#7C4DFF',
  '#FF4081', '#8D6E63', '#37474F', '#D50000', '#FF6D00',
  '#FFD600', '#00C853', '#00B8D4', '#2962FF', '#6200EA',
  '#C51162', '#3E2723', '#FFAB91', '#B2FF59', '#84FFFF',
  '#B388FF', '#FF80AB'
]

const verticalDisplayColors = computed(() =>
  paletteColors.value.length > 0 ? paletteColors.value : DEFAULT_COLORS
)

const fetchPaletteColors = async () => {
  try {
    const response = await fetch(`${API_URL}/api/guestbook/palette`)
    if (!response.ok) return
    const data = await response.json()
    if (data.colors?.length > 0) {
      paletteColors.value = data.colors
    }
  } catch {
    // fallback: ColorPalette 내부 기본값 사용
  }
}

const applySelectedTemplate = () => {
  if (props.selectedTemplate) {
    templateOverlayUrl.value = props.selectedTemplate.imageUrl
    selectedFrameId.value = props.selectedTemplate.id
  } else {
    templateOverlayUrl.value = null
    templateOverlayImage.value = null
    selectedFrameId.value = null
  }
}

const onTemplateOverlayLoad = (e: Event) => {
  templateOverlayImage.value = e.target as HTMLImageElement
}

// ===== 프레임 선택 로직 =====
const fetchFrames = async () => {
  if (frameTemplates.value.length > 0) return
  isLoadingFrames.value = true
  try {
    const response = await fetch(`${API_URL}/api/guestbook/templates`)
    if (!response.ok) return
    const data = await response.json()
    frameTemplates.value = data.templates || []
  } catch {
    // 로드 실패해도 진행 가능
  } finally {
    isLoadingFrames.value = false
  }
}

const selectFrame = (tmpl: any) => {
  if (tmpl) {
    templateOverlayUrl.value = tmpl.imageUrl
    selectedFrameId.value = tmpl.id
  } else {
    templateOverlayUrl.value = null
    templateOverlayImage.value = null
    selectedFrameId.value = null
  }
  showFrameSheet.value = false
}

const closeModal = () => {
  emit('close')
}

// displayMode를 Ref로 변환하여 composable에 전달
const displayModeRef = ref(props.displayMode) as Ref<DisplayMode>
watch(() => props.displayMode, (v) => { displayModeRef.value = v })

// Canvas composable
const {
  canvasRef,
  hasDrawing,
  selectedColor,
  brushSize,
  minBrushSize,
  maxBrushSize,
  initCanvas,
  startDrawing,
  draw,
  handleTouchStart,
  handleTouchMove,
  stopDrawing,
  clearCanvas,
  setOnCanvasTouch,
  isEraser,
  toggleEraser,
  undo,
  redo,
  canUndo,
  canRedo,
  setBackgroundImage,
  clearBackgroundImage,
  repaintBgColor,
} = useGuestbookCanvas({ displayMode: displayModeRef, bgColor: selectedCardColor })

// Sticker composable
const {
  editingStickers,
  selectedEditingStickerIndex,
  addSticker,
  deleteSticker,
  deselectAll,
  clearAll: clearAllStickers,
  selectSticker,
  selectStickerTouch,
} = useGuestbookStickers(() => canvasRef.value?.parentElement)

// 캔버스 터치 시 스티커 선택 해제 연결
setOnCanvasTouch(deselectAll)

// 제출 가능 여부
const canSubmit = computed(() => hasDrawing.value || editingStickers.value.length > 0)

// 배경색 변경 시 캔버스 배경 실시간 갱신
watch(selectedCardColor, (newColor, oldColor) => {
  if (props.displayMode !== 'graffiti' && oldColor && newColor !== oldColor) {
    repaintBgColor(oldColor, newColor)
  }
})

// 모드 전환 시 상태 정리
watch(activeMode, (newMode) => {
  if (newMode === 'sticker') {
    stopDrawing()
    isEraser.value = false
  }
  if (newMode === 'draw') {
    deselectAll()
  }
})

// 우측 도구 버튼 액션
const activateDrawMode = () => {
  if (activeMode.value === 'draw' && !isEraser.value) {
    // 이미 그리기 모드면 패널 토글
    drawToolsOpened.value = !drawToolsOpened.value
  } else {
    activeMode.value = 'draw'
    isEraser.value = false
    drawToolsOpened.value = true
  }
}

const activateEraser = () => {
  activeMode.value = 'draw'
  isEraser.value = true
  drawToolsOpened.value = false
}

const activateStickerMode = () => {
  activeMode.value = 'sticker'
  drawToolsOpened.value = false
  isStickerPickerOpen.value = true
}

const onColorSelected = () => {
  isEraser.value = false
}

// 세로 색상 팔레트 이벤트
const onVerticalColorSelect = (c: string) => {
  selectedColor.value = c
  isEraser.value = false
}

const onVerticalCustomColor = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  selectedColor.value = value
  isEraser.value = false
}

// 카메라/갤러리
const openCamera = () => {
  cameraInputRef.value?.click()
}

const openGallery = () => {
  galleryInputRef.value?.click()
}

const onFileSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await setBackgroundImage(file)
  input.value = ''
}

// 캔버스 이벤트 래퍼
const onCanvasMouseDown = (e: MouseEvent) => {
  if (activeMode.value !== 'draw') return
  isActivelyDrawing.value = true
  startDrawing(e)
}
const onCanvasMouseMove = (e: MouseEvent) => {
  if (activeMode.value !== 'draw') return
  draw(e)
}
const onCanvasTouchStart = (e: TouchEvent) => {
  if (activeMode.value !== 'draw') {
    deselectAll()
    return
  }
  isActivelyDrawing.value = true
  handleTouchStart(e)
}
const onCanvasTouchMove = (e: TouchEvent) => {
  if (activeMode.value !== 'draw') return
  handleTouchMove(e)
}

const onCanvasDrawEnd = () => {
  isActivelyDrawing.value = false
  stopDrawing()
}

// 뒤로가기(popstate) 처리
let closedByPopState = false

const handlePopState = () => {
  if (props.visible) {
    closedByPopState = true
    emit('close')
  }
}

watch(() => props.visible, async (newVal) => {
  if (newVal) {
    closedByPopState = false
    activeMode.value = 'draw'
    drawToolsOpened.value = false
    isActivelyDrawing.value = false
    selectedCardColor.value = DEFAULT_BG_COLOR
    document.body.style.overflow = 'hidden'
    history.pushState({ modal: 'guestbook' }, '')
    window.addEventListener('popstate', handlePopState)
    await nextTick()
    initCanvas()
    fetchPaletteColors()
    fetchFrames()
    applySelectedTemplate()
    // 촬영하기로 진입한 경우 카메라 자동 실행
    if (props.initialMode === 'camera') {
      cameraInputRef.value?.click()
    }
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('popstate', handlePopState)
    hasDrawing.value = false
    clearAllStickers()
    clearBackgroundImage()
    templateOverlayUrl.value = null
    templateOverlayImage.value = null
    // BGM 상태 정리
    if (bgmPreviewAudio.value) {
      bgmPreviewAudio.value.pause()
      bgmPreviewAudio.value.currentTime = 0
      bgmPreviewAudio.value = null
    }
    previewingTrackId.value = null
    isBgmPlaying.value = false
    selectedBgm.value = null
    showBgmPicker.value = false
    showBgColorSheet.value = false
    showFrameSheet.value = false
    selectedFrameId.value = null
    showFollowModal.value = false
    if (!closedByPopState && history.state?.modal === 'guestbook') {
      history.back()
    }
    closedByPopState = false
  }
}, { immediate: true })

const onAddSticker = (payload: { type: string; content: string }) => {
  addSticker(payload.type, payload.content)
  hasDrawing.value = true
}

const handleClear = () => {
  clearCanvas()
  clearAllStickers()
  clearBackgroundImage()
}

const handleClearStickers = () => {
  clearAllStickers()
}

// ===== BGM 선택 로직 =====
const filteredBgmTracks = computed(() => {
  if (!bgmCategoryFilter.value) return bgmTracks.value
  return bgmTracks.value.filter(t => t.category === bgmCategoryFilter.value)
})

const openBgmPicker = async () => {
  showBgmPicker.value = true
  if (bgmTracks.value.length === 0) {
    bgmLoading.value = true
    try {
      const [tracks, categories] = await Promise.all([
        bgmService.getActiveTracks(),
        bgmService.getCategories()
      ])
      bgmTracks.value = tracks
      bgmCategories.value = categories
    } catch (e) {
      console.error('Failed to load BGM tracks:', e)
    } finally {
      bgmLoading.value = false
    }
  }
}

const closeBgmPicker = () => {
  showBgmPicker.value = false
  stopBgmPreview()
}

const selectBgmTrack = (track: BgmTrack) => {
  selectedBgm.value = track
  stopBgmPreview()
  showBgmPicker.value = false
}

const removeBgm = () => {
  selectedBgm.value = null
  stopBgmPreview()
}

const previewBgmTrack = (track: BgmTrack) => {
  if (previewingTrackId.value === track.id) {
    stopBgmPreview()
    return
  }
  stopBgmPreview()
  const audio = new Audio(track.fileUrl)
  audio.play().catch(() => {})
  audio.addEventListener('ended', () => {
    previewingTrackId.value = null
  })
  bgmPreviewAudio.value = audio
  previewingTrackId.value = track.id
}

const stopBgmPreview = () => {
  if (bgmPreviewAudio.value) {
    bgmPreviewAudio.value.pause()
    bgmPreviewAudio.value.currentTime = 0
    bgmPreviewAudio.value = null
  }
  previewingTrackId.value = null
  isBgmPlaying.value = false
}

const toggleBgmPreview = () => {
  if (!selectedBgm.value) return
  if (isBgmPlaying.value) {
    bgmPreviewAudio.value?.pause()
    isBgmPlaying.value = false
  } else {
    if (!bgmPreviewAudio.value || bgmPreviewAudio.value.src !== selectedBgm.value.fileUrl) {
      bgmPreviewAudio.value?.pause()
      bgmPreviewAudio.value = new Audio(selectedBgm.value.fileUrl)
      bgmPreviewAudio.value.addEventListener('ended', () => { isBgmPlaying.value = false })
    }
    bgmPreviewAudio.value.play().catch(() => {})
    isBgmPlaying.value = true
  }
}

// ===== 팔로우 후 재시도 로직 =====
const followAndRetry = async () => {
  followLoading.value = true
  try {
    await followService.followAdmin(props.qrCodeId)
    showFollowModal.value = false
    // 팔로우 성공 후 방명록 재제출
    const composedImageData = await composeAndResizeImage()
    await guestbookService.createMessage({
      qrCode: props.qrCodeId,
      imageData: composedImageData,
      audioUrl: selectedBgm.value?.fileUrl || undefined,
      color: selectedCardColor.value
    })
    emit('close')
    emit('submitted')
    alert('단골 등록 및 방명록이 등록되었습니다!')
  } catch (e) {
    console.error('Failed to follow and retry:', e)
    alert('단골 등록에 실패했습니다. 다시 시도해주세요.')
  } finally {
    followLoading.value = false
  }
}

// ===== 제출 로직 =====

const submitDrawing = async () => {
  if (!canvasRef.value || !canSubmit.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const composedImageData = await composeAndResizeImage()

    await guestbookService.createMessage({
      qrCode: props.qrCodeId,
      imageData: composedImageData,
      audioUrl: selectedBgm.value?.fileUrl || undefined,
      color: selectedCardColor.value
    })

    stopBgmPreview()
    emit('close')
    emit('submitted')
    alert('방명록이 등록되었습니다!')
  } catch (error: any) {
    console.error('Failed to submit drawing:', error)

    if (error.response?.data?.requireFollow) {
      followStoreName.value = error.response.data.storeName || '이 매장'
      showFollowModal.value = true
    } else {
      alert('방명록 등록에 실패했습니다.')
    }
  } finally {
    isSubmitting.value = false
  }
}

const composeAndResizeImage = async (): Promise<string> => {
  if (!canvasRef.value) throw new Error('Canvas not found')

  const MAX_SIZE = 500
  const JPEG_QUALITY = 0.7
  const PNG_COMPRESSION = 0.8
  const MAX_FILE_SIZE = 150000

  const sourceCanvas = canvasRef.value
  let width = sourceCanvas.width
  let height = sourceCanvas.height

  if (width > MAX_SIZE || height > MAX_SIZE) {
    const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height)
    width = Math.floor(width * ratio)
    height = Math.floor(height * ratio)
  }

  const composedCanvas = document.createElement('canvas')
  composedCanvas.width = width
  composedCanvas.height = height
  const composedCtx = composedCanvas.getContext('2d')
  if (!composedCtx) throw new Error('Failed to get canvas context')

  if (props.displayMode !== 'graffiti') {
    composedCtx.fillStyle = getCardBgHex(selectedCardColor.value)
    composedCtx.fillRect(0, 0, width, height)
  }

  composedCtx.imageSmoothingEnabled = true
  composedCtx.imageSmoothingQuality = 'high'
  composedCtx.drawImage(sourceCanvas, 0, 0, width, height)

  const scaleRatio = width / sourceCanvas.width

  for (const sticker of editingStickers.value) {
    const x = (sticker.x / 100) * width
    const y = (sticker.y / 100) * height

    composedCtx.save()
    composedCtx.translate(x, y)
    composedCtx.rotate((sticker.rotation * Math.PI) / 180)
    composedCtx.scale(sticker.scale * scaleRatio, sticker.scale * scaleRatio)

    if (sticker.type === 'logo' || sticker.type === 'asset') {
      try {
        const img = await loadImage(sticker.content)
        const imgSize = 60
        composedCtx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize)
      } catch (e) {
        console.error('Failed to load sticker image:', e)
      }
    } else {
      composedCtx.font = '32px sans-serif'
      composedCtx.textAlign = 'center'
      composedCtx.textBaseline = 'middle'
      composedCtx.fillText(sticker.content, 0, 0)
    }

    composedCtx.restore()
  }

  // 템플릿(액자) 오버레이 합성
  if (templateOverlayImage.value) {
    composedCtx.drawImage(templateOverlayImage.value, 0, 0, width, height)
  }

  if (props.displayMode === 'graffiti') {
    return composedCanvas.toDataURL('image/png', PNG_COMPRESSION)
  }

  let quality = JPEG_QUALITY
  let result = composedCanvas.toDataURL('image/jpeg', quality)

  while (result.length > MAX_FILE_SIZE && quality > 0.4) {
    quality -= 0.1
    result = composedCanvas.toDataURL('image/jpeg', quality)
  }

  console.log(`Image optimized: ${Math.round(result.length / 1024)}KB, quality: ${Math.round(quality * 100)}%`)
  return result
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
</script>

<style scoped>
/* ===== 풀스크린 다크 에디터 ===== */
.drawing-editor {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000000;
  display: flex;
  flex-direction: column;
  color: #ffffff;
  -webkit-user-select: none;
  user-select: none;
}

/* ===== 슬라이드 업 트랜지션 ===== */
.editor-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.editor-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}
.editor-slide-enter-from,
.editor-slide-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* ===== 캔버스 영역 (풀스크린) ===== */
.editor-canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 60px 16px 8px;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.canvas-wrapper.graffiti-mode {
  background:
    linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
    linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
    linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
  background-color: #222222;
}

.drawing-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: crosshair;
  touch-action: none;
  background: white;
}
.graffiti-canvas {
  background: transparent;
}

.canvas-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(156, 163, 175, 0.6);
  font-size: 14px;
  pointer-events: none;
  z-index: 1;
}

/* ===== 왼쪽 상단 X 닫기 ===== */
.floating-close-btn {
  position: absolute;
  top: max(12px, env(safe-area-inset-top));
  left: 12px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(38, 38, 38, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 30;
  transition: all 0.15s;
}
.floating-close-btn:active {
  transform: scale(0.9);
  background: rgba(38, 38, 38, 0.9);
}

/* ===== 오른쪽 도구 컨테이너 ===== */
.right-side-container {
  position: absolute;
  top: max(12px, env(safe-area-inset-top));
  right: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  z-index: 30;
}

/* 드로우 도구 패널 (색상 팔레트 + 브러시 슬라이더) */
.draw-tools-panel {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

/* 세로 색상 팔레트 */
.vertical-palette {
  background: rgba(38, 38, 38, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 6px;
  max-height: 320px;
  overflow: hidden;
}

.vertical-palette-scroll {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  max-height: 304px;
  overflow-y: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.vertical-palette-scroll::-webkit-scrollbar {
  display: none;
}

.v-color-picker-btn {
  position: relative;
  width: 28px;
  height: 28px;
  min-height: 28px;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
}

.v-picker-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: border-color 0.15s;
}
.v-color-picker-btn:hover .v-picker-icon {
  border-color: rgba(255, 255, 255, 0.6);
}

.v-native-color-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
}

.v-color-dot {
  width: 24px;
  height: 24px;
  min-height: 24px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  position: relative;
  transition: transform 0.15s ease;
  padding: 0;
  outline: none;
  flex-shrink: 0;
}
.v-color-dot:active {
  transform: scale(0.85);
}

.v-color-dot.selected {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.95), 0 0 0 3.5px rgba(255, 255, 255, 0.9);
}

.v-white-border {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

/* 패널 슬라이드 트랜지션 */
.draw-panel-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.draw-panel-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}
.draw-panel-enter-from,
.draw-panel-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

/* 오른쪽 세로 도구 버튼 (인스타 스타일) */
.right-tools {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(38, 38, 38, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.tool-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}
.tool-btn:active:not(:disabled) {
  transform: scale(0.9);
}
.tool-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

/* ===== 스티커 레이어 ===== */
.canvas-stickers-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  pointer-events: none;
}

.editing-sticker {
  position: absolute;
  cursor: move;
  pointer-events: auto;
  user-select: none;
  transition: box-shadow 0.2s;
}

.editing-sticker.selected {
  box-shadow: 0 0 0 2px #4ECDC4, 0 0 16px rgba(78, 205, 196, 0.5);
  border-radius: 4px;
}

.editing-sticker-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  pointer-events: none;
}

.editing-sticker-emoji {
  font-size: 32px;
  line-height: 1;
  pointer-events: none;
}

.sticker-delete-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 22px;
  height: 22px;
  background: #ff4757;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  z-index: 5;
  padding: 0;
}
.sticker-delete-btn:active {
  transform: scale(1.1);
  background: #e84050;
}

/* ===== BOTTOM BAR ===== */
.editor-bottom-bar {
  flex-shrink: 0;
  padding: 10px 16px;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.bottom-sticker-tools {
  flex: 1;
  display: flex;
  gap: 10px;
}

.add-sticker-btn {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}
.add-sticker-btn:active {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(0.98);
}

.clear-stickers-btn {
  padding: 12px 16px;
  background: rgba(255, 68, 68, 0.12);
  border: 1px solid rgba(255, 68, 68, 0.18);
  border-radius: 12px;
  color: #ff6b6b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.clear-stickers-btn:active {
  background: rgba(255, 68, 68, 0.25);
  transform: scale(0.98);
}

/* 완료(전송) 버튼 - 인스타 스타일 원형 화살표 */
.done-btn {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  background: #4ECDC4;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}
.done-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.done-btn:active:not(:disabled) {
  transform: scale(0.9);
}

.tools-crossfade-enter-active,
.tools-crossfade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tools-crossfade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.tools-crossfade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ===== 스피너 ===== */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== BGM 피커 모달 ===== */
.bgm-picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bgm-picker-sheet {
  width: 100%;
  max-width: 480px;
  max-height: 70vh;
  background: #1a1a1a;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bgm-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.bgm-picker-header h3 {
  font-size: 17px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.bgm-picker-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.bgm-category-filter {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.bgm-category-filter::-webkit-scrollbar { display: none; }

.bgm-category-chip {
  padding: 6px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.bgm-category-chip.active {
  background: rgba(78, 205, 196, 0.2);
  border-color: rgba(78, 205, 196, 0.4);
  color: #4ECDC4;
}

.bgm-track-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
  -webkit-overflow-scrolling: touch;
}

.bgm-loading,
.bgm-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

.bgm-track-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.bgm-track-item:active {
  background: rgba(255, 255, 255, 0.06);
}
.bgm-track-item.selected {
  background: rgba(78, 205, 196, 0.1);
  border-color: rgba(78, 205, 196, 0.2);
}
.bgm-track-item.playing {
  background: rgba(78, 205, 196, 0.08);
}

.bgm-track-play {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.bgm-track-play:active {
  transform: scale(0.9);
}
.bgm-track-item.playing .bgm-track-play {
  background: rgba(78, 205, 196, 0.2);
  color: #4ECDC4;
}

.bgm-track-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.bgm-track-title {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bgm-track-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bgm-track-category {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.bgm-track-check {
  flex-shrink: 0;
}

.bgm-picker-footer {
  padding: 12px 20px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.bgm-none-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.bgm-none-btn:active {
  background: rgba(255, 255, 255, 0.12);
}

/* BGM 피커 트랜지션 */
.bgm-picker-enter-active {
  transition: opacity 0.2s ease;
}
.bgm-picker-enter-active .bgm-picker-sheet {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.bgm-picker-leave-active {
  transition: opacity 0.2s ease;
}
.bgm-picker-leave-active .bgm-picker-sheet {
  transition: transform 0.2s ease-in;
}
.bgm-picker-enter-from,
.bgm-picker-leave-to {
  opacity: 0;
}
.bgm-picker-enter-from .bgm-picker-sheet,
.bgm-picker-leave-to .bgm-picker-sheet {
  transform: translateY(100%);
}

/* ===== 팔로우(단골등록) 모달 ===== */
.follow-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10002;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.follow-modal-card {
  width: 100%;
  max-width: 340px;
  background: #1e1e1e;
  border-radius: 20px;
  padding: 32px 24px 24px;
  text-align: center;
}

.follow-modal-icon {
  margin-bottom: 16px;
}

.follow-modal-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0 0 10px;
}

.follow-modal-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin: 0 0 24px;
}
.follow-modal-desc strong {
  color: #4ECDC4;
  font-weight: 600;
}

.follow-modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.follow-modal-confirm {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: #4ECDC4;
  border: none;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}
.follow-modal-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.follow-modal-confirm:active:not(:disabled) {
  transform: scale(0.98);
  background: #3dbdb5;
}

.follow-modal-cancel {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.follow-modal-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.follow-modal-cancel:active:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}

/* 팔로우 모달 트랜지션 */
.follow-modal-enter-active {
  transition: opacity 0.2s ease;
}
.follow-modal-enter-active .follow-modal-card {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.follow-modal-leave-active {
  transition: opacity 0.15s ease;
}
.follow-modal-leave-active .follow-modal-card {
  transition: transform 0.15s ease-in;
}
.follow-modal-enter-from,
.follow-modal-leave-to {
  opacity: 0;
}
.follow-modal-enter-from .follow-modal-card,
.follow-modal-leave-to .follow-modal-card {
  transform: scale(0.9);
}

/* 스피너 small 변형 */
.spinner.small {
  width: 18px;
  height: 18px;
  border-width: 2px;
}

/* ===== 하단 도구 버튼 (음악/배경색/프레임) ===== */
.bottom-tool-btns {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bottom-tool-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.bottom-tool-btn:active {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(0.97);
}
.bottom-tool-btn.active {
  background: rgba(78, 205, 196, 0.15);
  border-color: rgba(78, 205, 196, 0.3);
  color: #4ECDC4;
}

.btn-color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

/* ===== 배경색 하단 시트 그리드 ===== */
.bg-color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 20px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

.bg-grid-picker-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
}

.bg-grid-picker-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: border-color 0.15s;
}
.bg-grid-picker-btn:hover .bg-grid-picker-icon {
  border-color: rgba(255, 255, 255, 0.6);
}

.bg-grid-native-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
}

.bg-grid-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
  padding: 0;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-grid-dot:active {
  transform: scale(0.9);
}
.bg-grid-dot.selected {
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.bg-grid-check {
  stroke: rgba(0, 0, 0, 0.5);
}

/* ===== 프레임 하단 시트 ===== */
.frame-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 16px 20px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  overflow-y: auto;
  max-height: 50vh;
  -webkit-overflow-scrolling: touch;
}

.frame-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.frame-card:active {
  transform: scale(0.95);
}
.frame-card.selected {
  border-color: #4ECDC4;
  background: rgba(78, 205, 196, 0.1);
}

.frame-preview {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}
.frame-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.none-frame {
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.15);
}

.frame-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.frame-loading {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

/* ===== 템플릿(액자) 오버레이 ===== */
.template-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  z-index: 15;
}

/* ===== 숨겨진 파일 입력 ===== */
.hidden-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
