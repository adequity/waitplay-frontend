<template>
  <Teleport to="body">
    <Transition name="editor-slide">
      <div v-if="visible" class="drawing-editor">

        <!-- ===== 캔버스 영역 (풀스크린) ===== -->
        <div class="editor-canvas-area">
          <div class="canvas-wrapper" :class="{ 'graffiti-mode': displayMode === 'graffiti' }">
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
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, type Ref } from 'vue'
import { useGuestbookCanvas, type DisplayMode } from '@/composables/useGuestbookCanvas'
import { useGuestbookStickers } from '@/composables/useGuestbookStickers'
import guestbookService from '@/services/guestbookService'
import followService from '@/services/followService'
import StickerPickerModal from './StickerPickerModal.vue'
import VerticalBrushSlider from './VerticalBrushSlider.vue'

interface Props {
  visible: boolean
  qrCodeId: string
  displayMode: DisplayMode
  initialMode?: 'camera' | 'draw'
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

// 드로우 도구 패널 상태
const isActivelyDrawing = ref(false)
const drawToolsOpened = ref(false)
const showDrawPanel = computed(() => drawToolsOpened.value && !isActivelyDrawing.value && activeMode.value === 'draw')

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
} = useGuestbookCanvas({ displayMode: displayModeRef })

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
    document.body.style.overflow = 'hidden'
    history.pushState({ modal: 'guestbook' }, '')
    window.addEventListener('popstate', handlePopState)
    await nextTick()
    initCanvas()
    fetchPaletteColors()
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

// ===== 제출 로직 (기존 그대로 보존) =====

const submitDrawing = async () => {
  if (!canvasRef.value || !canSubmit.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const composedImageData = await composeAndResizeImage()

    await guestbookService.createMessage({
      qrCode: props.qrCodeId,
      imageData: composedImageData,
      color: 'yellow'
    })

    emit('close')
    emit('submitted')
    alert('방명록이 등록되었습니다!')
  } catch (error: any) {
    console.error('Failed to submit drawing:', error)

    if (error.response?.data?.requireFollow) {
      const storeName = error.response.data.storeName || '이 매장'
      const shouldFollow = confirm(`방명록 작성을 위해 ${storeName}을(를) 단골 등록해야 합니다.\n단골 등록 후 방명록을 작성하시겠습니까?`)

      if (shouldFollow) {
        try {
          await followService.followAdmin(props.qrCodeId)
          const composedImageData = await composeAndResizeImage()
          await guestbookService.createMessage({
            qrCode: props.qrCodeId,
            imageData: composedImageData,
            color: 'yellow'
          })
          emit('close')
          emit('submitted')
          alert('단골 등록 및 방명록이 등록되었습니다!')
        } catch (followError) {
          console.error('Failed to follow and retry:', followError)
          alert('단골 등록에 실패했습니다. 다시 시도해주세요.')
        }
      }
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
    composedCtx.fillStyle = '#ffffff'
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

/* ===== 숨겨진 파일 입력 ===== */
.hidden-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
