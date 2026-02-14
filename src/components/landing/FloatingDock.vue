<template>
  <div class="floating-dock-container">
    <!-- 글래스모피즘 독 -->
    <div class="floating-dock" :class="{ 'dark-theme': isDarkTheme }">
      <!-- 음악 버튼 -->
      <button
        v-if="showMusic"
        class="dock-item"
        :class="{ active: isMusicPlaying }"
        @click.stop="toggleMusic"
        @touchstart.prevent="onMusicTouchStart"
        @touchend.prevent="onMusicTouchEnd"
      >
        <div class="dock-icon">
          <svg v-if="isMusicPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 4h2v16H9zM13 4h2v16h-2z"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <span class="dock-label">음악</span>
      </button>

      <!-- 홈 버튼 -->
      <button class="dock-item" @click="scrollToTop">
        <div class="dock-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        </div>
        <span class="dock-label">홈</span>
      </button>

      <!-- 공유 버튼 -->
      <button class="dock-item share-item" @click="openShareSheet">
        <div class="dock-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </div>
        <span class="dock-label">공유</span>
      </button>

      <!-- 마이페이지 버튼 -->
      <button v-if="showMyPage" class="dock-item" @click="openMyPage">
        <div class="dock-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <span class="dock-label">마이</span>
      </button>
    </div>

    <!-- 공유 시트 -->
    <Transition name="sheet">
      <div v-if="showShareSheet" class="share-sheet-overlay" @click.self="closeShareSheet">
        <div class="share-sheet">
          <div class="share-sheet-header">
            <h3>공유하기</h3>
            <button class="close-btn" @click="closeShareSheet">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="share-options">
            <button class="share-option kakao" @click="shareToKakao">
              <div class="share-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#3C1E1E">
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.86 5.26 4.64 6.68-.14.53-.92 3.37-.95 3.58 0 0-.02.16.08.22.1.06.22.01.22.01.29-.04 3.37-2.2 3.9-2.57.7.1 1.42.15 2.16.15 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
                </svg>
              </div>
              <span>카카오톡</span>
            </button>

            <button class="share-option link" @click="copyLink">
              <div class="share-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <span>링크 복사</span>
            </button>

            <button class="share-option instagram" @click="shareToInstagram">
              <div class="share-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
                  <defs>
                    <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#FFDC80"/>
                      <stop offset="50%" style="stop-color:#F56040"/>
                      <stop offset="100%" style="stop-color:#833AB4"/>
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="url(#instagram-gradient)" stroke-width="2"/>
                  <circle cx="12" cy="12" r="4" fill="none" stroke="url(#instagram-gradient)" stroke-width="2"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="url(#instagram-gradient)"/>
                </svg>
              </div>
              <span>인스타그램</span>
            </button>

            <button class="share-option twitter" @click="shareToTwitter">
              <div class="share-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span>X</span>
            </button>
          </div>

          <!-- 복사 완료 토스트 -->
          <Transition name="toast">
            <div v-if="showCopyToast" class="copy-toast">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              링크가 복사되었습니다
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import shareService from '@/services/shareService'

const props = defineProps<{
  qrCodeId: string
  qrCode: string
  landingTitle?: string
  landingDescription?: string
  landingImage?: string
  showMusic?: boolean
  showMyPage?: boolean
  isMusicPlaying?: boolean
  themeBackgroundColor?: string
}>()

// 배경색이 어두운지 판단하는 함수
function isDarkColor(color: string): boolean {
  if (!color) return false

  // hex 색상을 RGB로 변환
  let hex = color.replace('#', '')
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // 밝기 계산 (YIQ 공식)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 128
}

// 테마 배경색에 따라 다크모드 여부 결정
const isDarkTheme = computed(() => isDarkColor(props.themeBackgroundColor || ''))

const emit = defineEmits<{
  (e: 'toggleMusic'): void
  (e: 'openMyPage'): void
  (e: 'showVolumeControl'): void
}>()

const showShareSheet = ref(false)
const showCopyToast = ref(false)
let musicTouchTimer: number | null = null

// 음악 토글
function toggleMusic() {
  emit('toggleMusic')
}

// 음악 롱프레스 (볼륨 조절)
function onMusicTouchStart() {
  musicTouchTimer = window.setTimeout(() => {
    emit('showVolumeControl')
  }, 1000)
}

function onMusicTouchEnd() {
  if (musicTouchTimer) {
    // 롱프레스가 아닌 일반 터치 → 토글
    clearTimeout(musicTouchTimer)
    musicTouchTimer = null
    toggleMusic()
  }
  // 롱프레스였으면 (타이머가 이미 실행되어 null) 토글하지 않음
}

// 홈으로 스크롤
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 공유 시트 열기/닫기
function openShareSheet() {
  showShareSheet.value = true
}

function closeShareSheet() {
  showShareSheet.value = false
}

// 마이페이지 열기
function openMyPage() {
  emit('openMyPage')
}

// 카카오톡 공유
async function shareToKakao() {
  try {
    await shareService.shareToKakao(
      props.qrCodeId,
      props.landingTitle || '이벤트에 참여해보세요!',
      props.landingDescription || 'WaitPlay에서 다양한 이벤트가 진행중입니다.',
      props.landingImage,
      'landing'
    )
    closeShareSheet()
  } catch (error) {
    console.error('카카오톡 공유 실패:', error)
  }
}

// 링크 복사
async function copyLink() {
  try {
    await shareService.copyLink(props.qrCodeId, 'landing')
    showCopyToast.value = true
    setTimeout(() => {
      showCopyToast.value = false
    }, 2000)
  } catch (error) {
    console.error('링크 복사 실패:', error)
    // 클립보드 API 실패 시에도 토스트 표시 (폴백)
    showCopyToast.value = true
    setTimeout(() => {
      showCopyToast.value = false
    }, 2000)
  }
}

// 인스타그램 공유
async function shareToInstagram() {
  try {
    await shareService.shareToInstagram(props.qrCodeId, 'landing')
    closeShareSheet()
  } catch (error) {
    console.error('인스타그램 공유 실패:', error)
  }
}

// X(Twitter) 공유
async function shareToTwitter() {
  try {
    await shareService.shareToTwitter(
      props.qrCodeId,
      `${props.landingTitle || '이벤트에 참여해보세요!'} 🎉`,
      'landing'
    )
    closeShareSheet()
  } catch (error) {
    console.error('X 공유 실패:', error)
  }
}

</script>

<style scoped>
.floating-dock-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
}

.floating-dock {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
  pointer-events: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-dock.dock-hidden {
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
}

.dock-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 56px;
}

.dock-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dock-item:active {
  transform: scale(0.95);
}

.dock-item.active .dock-icon {
  color: #d4a853;
}

.dock-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  transition: color 0.2s;
}

.dock-label {
  font-size: 10px;
  font-weight: 500;
  color: #666;
}

.share-item .dock-icon {
  color: #d4a853;
}

/* 공유 시트 */
.share-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1001;
  pointer-events: auto;
}

.share-sheet {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 20px 20px 40px;
  position: relative;
}

.share-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.share-sheet-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: #f8f8f8;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.share-option:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.share-option:active {
  transform: scale(0.95);
}

.share-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.share-option.kakao .share-icon {
  background: #FEE500;
}

.share-option.link .share-icon {
  background: #e8e8e8;
  color: #333;
}

.share-option.instagram .share-icon {
  background: linear-gradient(135deg, #FFDC80 0%, #F56040 50%, #833AB4 100%);
}

.share-option.twitter .share-icon {
  background: #000;
}

.share-option.twitter .share-icon svg {
  fill: white;
}

.share-option span {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

/* 복사 완료 토스트 */
.copy-toast {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #1d1d1f;
  color: white;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  z-index: 10001;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 트랜지션 */
.sheet-enter-active,
.sheet-leave-active {
  transition: all 0.3s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .share-sheet,
.sheet-leave-to .share-sheet {
  transform: translateY(100%);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

/* 다크 테마 (배경색 기반) */
.floating-dock.dark-theme {
  background: rgba(30, 30, 30, 0.6);
  border-color: rgba(255, 255, 255, 0.15);
}

.floating-dock.dark-theme .dock-icon {
  color: #fff;
}

.floating-dock.dark-theme .dock-label {
  color: #ccc;
}

/* 반응형 */
@media (max-width: 400px) {
  .share-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
