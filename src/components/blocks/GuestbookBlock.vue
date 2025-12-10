<template>
  <div class="guestbook-block" :style="{ '--text-color': data.textColor || '#374151' }">
    <h2 class="guestbook-title">{{ data.title }}</h2>

    <!-- 그림판 작성 영역 (로그인한 사용자만) -->
    <div v-if="isAuthenticated" class="canvas-section">
      <!-- 도구 모음 -->
      <div class="tools-bar">
        <div class="tool-group">
          <button
            v-for="color in colors"
            :key="color"
            @click="selectColor(color)"
            :class="['color-btn', { active: selectedColor === color }]"
            :style="{ backgroundColor: color }"
          ></button>
        </div>

        <div class="tool-group">
          <button
            v-for="size in brushSizes"
            :key="size"
            @click="selectBrushSize(size)"
            :class="['size-btn', { active: brushSize === size }]"
          >
            <div :style="{ width: size + 'px', height: size + 'px' }"></div>
          </button>
        </div>

        <div class="tool-group action-buttons">
          <button @click="clearCanvas" class="action-btn clear-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            지우기
          </button>
          <button @click="submitDrawing" :disabled="!hasDrawing" class="action-btn submit-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            완료
          </button>
        </div>
      </div>

      <!-- 캔버스 -->
      <div class="canvas-container">
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
import type { GuestbookBlockData } from '@/types/blocks'

interface Props {
  data: GuestbookBlockData
  qrCodeId: string
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
const colors = ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F']
const brushSizes = [2, 4, 6, 8]
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

  // 기존 방명록 데이터 로드
  await loadMessages()
})

// 방명록 메시지 로드
const loadMessages = async () => {
  if (!props.qrCodeId) return

  isLoadingMessages.value = true
  try {
    const response = await guestbookService.getMessages(props.qrCodeId)
    messages.value = response
  } catch (error) {
    console.error('Failed to load guestbook messages:', error)
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

const selectColor = (color: string) => {
  selectedColor.value = color
}

const selectBrushSize = (size: number) => {
  brushSize.value = size
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
  } catch (error) {
    console.error('Failed to submit drawing:', error)
    alert('방명록 등록에 실패했습니다.')
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
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 도구 모음 */
.tools-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.tool-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.color-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-btn.active {
  border-color: #4ECDC4;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.size-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.size-btn.active {
  border-color: #4ECDC4;
  background: #f0fffe;
}

.size-btn div {
  background: #333;
  border-radius: 50%;
}

.action-buttons {
  margin-left: auto;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.clear-btn {
  background: #f5f5f5;
  color: #666;
}

.clear-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.submit-btn {
  background: #4ECDC4;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #45b7b8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(78, 205, 196, 0.3);
}

.submit-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 캔버스 컨테이너 */
.canvas-container {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
  background: #fafafa;
}

.drawing-canvas {
  width: 100%;
  height: auto;
  display: block;
  cursor: crosshair;
  touch-action: none;
  background: white;
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

  .tools-bar {
    gap: 0.75rem;
  }

  .action-buttons {
    width: 100%;
    margin-left: 0;
    justify-content: stretch;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
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
