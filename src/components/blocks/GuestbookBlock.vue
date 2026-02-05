<template>
  <div class="guestbook-block" :style="{ '--text-color': data.textColor || '#374151' }">
    <h2 class="guestbook-title">{{ data.title }}</h2>

    <!-- 그림판 작성 영역 (로그인한 사용자만) -->
    <div v-if="isAuthenticated" class="canvas-section">
      <!-- 캔버스 (상단) -->
      <div class="canvas-container">
        <div v-if="!hasDrawing" class="canvas-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
            <path d="M2 2l7.586 7.586"/>
            <circle cx="11" cy="11" r="2"/>
          </svg>
          <span>여기에 그려주세요</span>
        </div>
        <canvas
          ref="canvasRef"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart.prevent="handleTouchStart"
          @touchmove.prevent="handleTouchMove"
          @touchend.prevent="stopDrawing"
          class="drawing-canvas"
        ></canvas>
      </div>

      <!-- 도구 모음 (하단) -->
      <div class="tools-bar">
        <div class="tools-row">
          <!-- 색상 피커 -->
          <div class="color-picker-wrapper">
            <input
              type="color"
              v-model="selectedColor"
              class="color-picker-input"
              title="색상 선택"
            />
            <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
          </div>

          <!-- 브러시 크기 슬라이더 -->
          <div class="brush-slider-wrapper">
            <input
              type="range"
              v-model.number="brushSize"
              :min="minBrushSize"
              :max="maxBrushSize"
              step="1"
              class="brush-slider"
              title="브러시 크기"
            />
            <div class="brush-size-preview" :style="{ width: `${brushSize}px`, height: `${brushSize}px` }"></div>
          </div>

          <!-- 지우기 버튼 -->
          <button @click="clearCanvas" class="icon-btn clear-btn" title="지우기">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- 완료 버튼 (전체 너비) -->
        <button @click="submitDrawing" :disabled="!hasDrawing" class="submit-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          완료
        </button>
      </div>
    </div>

    <!-- 로그인 유도 -->
    <div v-else class="login-prompt">
      <p>로그인하고 손글씨로 방명록을 남겨보세요!</p>
      <div class="auth-buttons">
        <button class="btn-login" @click="goToLogin">로그인</button>
        <button class="btn-signup" @click="goToSignup">회원가입</button>
      </div>
    </div>

    <!-- 방명록 슬라이더 -->
    <div v-if="isLoadingMessages" class="loading-state">
      <p>방명록을 불러오는 중...</p>
    </div>

    <div v-else-if="messages.length === 0" class="empty-state">
      <p>아직 남겨진 메시지가 없습니다. 첫 메시지를 남겨보세요!</p>
    </div>

    <div v-else class="drawings-slider-container">
      <div class="drawings-slider" ref="sliderRef">
        <div
          v-for="message in messages"
          :key="message.id"
          class="post-it-slide"
        >
          <div
            class="post-it"
            :class="`post-it--${message.color}`"
            :style="{ transform: `rotate(${message.rotation}deg)` }"
          >
            <div class="post-it-content">
              <img
                v-if="message.imageUrl"
                :src="message.imageUrl"
                :alt="`${message.userName}의 방명록`"
                class="drawing-image"
              />
              <div class="message-footer">
                <span class="message-author">- {{ message.userName }}</span>
                <span class="message-date">{{ formatDate(message.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import guestbookService from '@/services/guestbookService'
import followService from '@/services/followService'
import type { GuestbookBlockData } from '@/types/blocks'

interface Props {
  data: GuestbookBlockData
  qrCodeId: string
  isPreview?: boolean // 편집기 미리보기 모드
}

const props = defineProps<Props>()
const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

// Canvas 관련
const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const isDrawing = ref(false)
const hasDrawing = ref(false)

// 도구 설정
const minBrushSize = 1
const maxBrushSize = 20
const selectedColor = ref('#000000')
const brushSize = ref(4)

// 터치 이벤트 처리
let lastX = 0
let lastY = 0

// 방명록 메시지 목록
const messages = ref<any[]>([])
const isLoadingMessages = ref(false)
const sliderRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (canvasRef.value && isAuthenticated.value) {
    initCanvas()
  }

  // 미리보기 모드에서는 API 호출 스킵 (404 에러 방지)
  if (!props.isPreview) {
    await loadMessages()
  }
})

// 방명록 메시지 로드
const loadMessages = async () => {
  if (!props.qrCodeId) return

  isLoadingMessages.value = true
  try {
    const response = await guestbookService.getMessages(props.qrCodeId)
    messages.value = response
  } catch {
    // API가 아직 구현되지 않았거나 네트워크 에러 시 조용히 처리
    messages.value = []
  } finally {
    isLoadingMessages.value = false
  }
}

const initCanvas = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const container = canvas.parentElement

  if (container) {
    // 모바일 최적화: 컨테이너 너비에 맞춤
    const width = container.clientWidth
    const height = Math.min(width * 0.75, 400) // 3:4 비율, 최대 400px

    canvas.width = width
    canvas.height = height

    ctx.value = canvas.getContext('2d')

    if (ctx.value) {
      // Canvas 초기 설정
      ctx.value.fillStyle = '#FFFFFF'
      ctx.value.fillRect(0, 0, canvas.width, canvas.height)
      ctx.value.lineCap = 'round'
      ctx.value.lineJoin = 'round'
    }
  }
}

const startDrawing = (e: MouseEvent) => {
  if (!ctx.value || !canvasRef.value) return

  isDrawing.value = true
  hasDrawing.value = true

  const rect = canvasRef.value.getBoundingClientRect()
  lastX = e.clientX - rect.left
  lastY = e.clientY - rect.top

  ctx.value.beginPath()
  ctx.value.moveTo(lastX, lastY)
}

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx.value || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  ctx.value.strokeStyle = selectedColor.value
  ctx.value.lineWidth = brushSize.value
  ctx.value.lineTo(x, y)
  ctx.value.stroke()

  lastX = x
  lastY = y
}

const handleTouchStart = (e: TouchEvent) => {
  if (!ctx.value || !canvasRef.value) return

  const touch = e.touches[0]
  if (!touch) return

  isDrawing.value = true
  hasDrawing.value = true

  const rect = canvasRef.value.getBoundingClientRect()
  lastX = touch.clientX - rect.left
  lastY = touch.clientY - rect.top

  ctx.value.beginPath()
  ctx.value.moveTo(lastX, lastY)
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDrawing.value || !ctx.value || !canvasRef.value) return

  const touch = e.touches[0]
  if (!touch) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top

  ctx.value.strokeStyle = selectedColor.value
  ctx.value.lineWidth = brushSize.value
  ctx.value.lineTo(x, y)
  ctx.value.stroke()

  lastX = x
  lastY = y
}

const stopDrawing = () => {
  isDrawing.value = false
}

const clearCanvas = () => {
  if (!ctx.value || !canvasRef.value) return

  ctx.value.fillStyle = '#FFFFFF'
  ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  hasDrawing.value = false
}

const submitDrawing = async () => {
  if (!canvasRef.value || !hasDrawing.value) return

  try {
    // 이미지 리사이징 및 압축
    const resizedImageData = await resizeAndCompressImage(canvasRef.value)

    // API 호출하여 이미지 저장
    await guestbookService.createMessage({
      qrCode: props.qrCodeId,  // QR Code 문자열 전달
      imageData: resizedImageData,
      color: 'yellow' // 기본 색상
    })

    // 성공 후 캔버스 초기화
    clearCanvas()
    alert('방명록이 등록되었습니다!')

    // 방명록 목록 새로고침
    await loadMessages()
  } catch (error: any) {
    console.error('Failed to submit drawing:', error)

    // 팔로우가 필요한 경우 자동 팔로우 후 재시도
    if (error.response?.data?.requireFollow) {
      const storeName = error.response.data.storeName || '이 매장'
      const shouldFollow = confirm(`방명록 작성을 위해 ${storeName}을(를) 단골 등록해야 합니다.\n단골 등록 후 방명록을 작성하시겠습니까?`)

      if (shouldFollow) {
        try {
          // 팔로우 시도
          await followService.followAdmin(props.qrCodeId)

          // 팔로우 성공 후 방명록 다시 제출
          const resizedImageData = await resizeAndCompressImage(canvasRef.value!)
          await guestbookService.createMessage({
            qrCode: props.qrCodeId,
            imageData: resizedImageData,
            color: 'yellow'
          })

          clearCanvas()
          alert('단골 등록 및 방명록이 등록되었습니다!')
          await loadMessages()
        } catch (followError) {
          console.error('Failed to follow and retry:', followError)
          alert('단골 등록에 실패했습니다. 다시 시도해주세요.')
        }
      }
    } else {
      alert('방명록 등록에 실패했습니다.')
    }
  }
}

// 이미지 리사이징 및 압축 함수
const resizeAndCompressImage = async (canvas: HTMLCanvasElement): Promise<string> => {
  // 최대 크기 설정 (방명록 카드 크기에 맞춤)
  const MAX_WIDTH = 400
  const MAX_HEIGHT = 400
  const QUALITY = 0.75 // JPEG 품질 (0.0 - 1.0)

  let width = canvas.width
  let height = canvas.height

  // 비율 유지하면서 리사이징
  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
    width = Math.floor(width * ratio)
    height = Math.floor(height * ratio)
  }

  // 새 캔버스 생성
  const resizedCanvas = document.createElement('canvas')
  resizedCanvas.width = width
  resizedCanvas.height = height

  const ctx = resizedCanvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')

  // 흰색 배경 추가 (투명 배경 방지)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  // 이미지 리사이징 (부드러운 스케일링)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(canvas, 0, 0, width, height)

  // JPEG로 압축 (PNG보다 파일 크기 훨씬 작음)
  return resizedCanvas.toDataURL('image/jpeg', QUALITY)
}

const goToLogin = () => {
  const currentQr = router.currentRoute.value.query.qr
  if (currentQr) {
    router.push(`/login?qr=${currentQr}`)
  } else {
    router.push('/login')
  }
}

const goToSignup = () => {
  const currentQr = router.currentRoute.value.query.qr
  if (currentQr) {
    router.push(`/signup?qr=${currentQr}`)
  } else {
    router.push('/signup')
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return '방금 전'
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }
}
</script>

<style scoped>
.guestbook-block {
  padding: 2rem 1rem;
  margin-bottom: 1.5rem;
}

.guestbook-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color, #1f2937);
  margin-bottom: 2rem;
  text-align: center;
}

/* 캔버스 작성 섹션 */
.canvas-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 캔버스 컨테이너 (상단) */
.canvas-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #fafafa;
  position: relative;
  margin-bottom: 1rem;
  border: 2px solid #f0f0f0;
}

.canvas-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 14px;
  pointer-events: none;
  z-index: 1;
}

.drawing-canvas {
  width: 100%;
  height: auto;
  display: block;
  cursor: crosshair;
  touch-action: none;
  background: white;
  position: relative;
  z-index: 2;
}

/* 도구 모음 (하단) */
.tools-bar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tools-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* 색상 피커 */
.color-picker-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
}

.color-picker-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid #e5e7eb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  transition: all 0.2s;
}

.color-picker-wrapper:hover .color-preview {
  border-color: #4ECDC4;
  transform: scale(1.05);
}

/* 브러시 크기 슬라이더 */
.brush-slider-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.brush-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.brush-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #4ECDC4;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(78, 205, 196, 0.4);
  transition: all 0.2s;
}

.brush-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(78, 205, 196, 0.5);
}

.brush-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #4ECDC4;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(78, 205, 196, 0.4);
}

.brush-size-preview {
  min-width: 20px;
  min-height: 20px;
  max-width: 20px;
  max-height: 20px;
  background: currentColor;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.brush-size-preview::after {
  content: '';
  width: 100%;
  height: 100%;
  background: #374151;
  border-radius: 50%;
}

/* 아이콘 버튼 */
.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn.clear-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.icon-btn.clear-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* 완료 버튼 */
.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: #4ECDC4;
  color: white;
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.submit-btn:hover:not(:disabled) {
  background: #3dbdb5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(78, 205, 196, 0.4);
}

.submit-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  box-shadow: none;
}

/* 로그인 유도 */
.login-prompt {
  background: #f3f4f6;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
}

.login-prompt p {
  color: #6b7280;
  font-size: 15px;
  margin: 0 0 1.25rem 0;
  font-weight: 500;
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-login,
.btn-signup {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-login {
  background: #4ECDC4;
  color: white;
}

.btn-login:hover {
  background: #45b7b8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(78, 205, 196, 0.3);
}

.btn-signup {
  background: white;
  color: #4ECDC4;
  border: 2px solid #4ECDC4;
}

.btn-signup:hover {
  background: #f0fffe;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(78, 205, 196, 0.2);
}

/* 방명록 슬라이더 */
.drawings-slider-container {
  width: 100%;
  margin-top: 2rem;
  position: relative;
}

.drawings-slider {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 1rem 0.5rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.drawings-slider::-webkit-scrollbar {
  display: none;
}

.post-it-slide {
  flex: 0 0 280px;
  scroll-snap-align: center;
}

.post-it {
  position: relative;
  padding: 1rem;
  min-height: 200px;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: default;
  width: 100%;
}

.post-it::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 25px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.05) 0%,
    transparent 100%
  );
  border-radius: 4px 4px 0 0;
}

.post-it:hover {
  transform: scale(1.03) !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.post-it--yellow {
  background: #fef3c7;
  border-top: 3px solid #fbbf24;
}

.post-it--pink {
  background: #fce7f3;
  border-top: 3px solid #f472b6;
}

.post-it--blue {
  background: #dbeafe;
  border-top: 3px solid #60a5fa;
}

.post-it--green {
  background: #d1fae5;
  border-top: 3px solid #34d399;
}

.post-it-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 0.5rem;
}

.drawing-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-footer {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.message-author {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.message-date {
  font-size: 12px;
  color: #9ca3af;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
  font-size: 16px;
  font-style: italic;
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .guestbook-block {
    padding: 1.5rem 0.75rem;
  }

  .canvas-section {
    padding: 0.875rem;
  }

  .tools-row {
    gap: 0.5rem;
  }

  .color-picker-wrapper,
  .color-preview {
    width: 36px;
    height: 36px;
  }

  .brush-slider {
    height: 5px;
  }

  .brush-slider::-webkit-slider-thumb {
    width: 18px;
    height: 18px;
  }

  .brush-size-preview {
    min-width: 18px;
    min-height: 18px;
    max-width: 18px;
    max-height: 18px;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
  }

  .post-it-slide {
    flex: 0 0 85vw;
  }

  .post-it {
    transform: none !important;
  }

  .post-it:hover {
    transform: scale(1.02) !important;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .post-it-slide {
    flex: 0 0 320px;
  }
}
</style>
