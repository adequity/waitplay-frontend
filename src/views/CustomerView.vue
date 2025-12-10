<template>
  <div
    class="customer-view"
    :style="{
      backgroundColor: pageTheme.backgroundColor,
      color: pageTheme.textColor
    }"
  >
    <!-- Dynamic Block Rendering -->
    <component
      v-for="block in visibleBlocks"
      :key="block.id"
      :is="getBlockComponent(block.type)"
      :data="block.data"
      :qrCodeId="qrCodeId"
    />

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text" :style="{ color: pageTheme.textColor, opacity: 0.4 }">
        Powered by WaitPlay
      </p>
    </div>

    <!-- Floating Navigation Button -->
    <button class="floating-nav-btn" @click="toggleSidebar" aria-label="사이드바 열기/닫기">
      <svg
        v-if="!isSidebarOpen"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 12h18M3 6h18M3 18h18"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>

    <!-- Sidebar Overlay -->
    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>

    <!-- Sidebar -->
    <transition name="sidebar">
      <div v-if="isSidebarOpen" class="sidebar">
        <div class="sidebar-header">
          <h2>메뉴</h2>
          <button class="close-btn" @click="closeSidebar" aria-label="닫기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="sidebar-content">
          <!-- User Info Section -->
          <div v-if="isAuthenticated" class="user-section">
            <div class="user-avatar">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="user-info">
              <p class="user-name">{{ user?.nickname || '사용자' }}</p>
              <p class="user-email">{{ user?.company || '회사 정보 없음' }}</p>
            </div>
            <button class="logout-btn" @click="handleLogout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              로그아웃
            </button>
          </div>

          <!-- Not Logged In Section -->
          <div v-else class="not-logged-in-section">
            <p class="login-message">로그인하고 더 많은 기능을 이용해보세요!</p>
            <button class="login-btn" @click="goToLogin">로그인</button>
            <button class="signup-btn" @click="goToSignup">회원가입</button>
          </div>

          <!-- My Guestbook Section -->
          <div v-if="isAuthenticated" class="my-guestbook-section">
            <h3 class="section-title">내가 남긴 방명록</h3>
            <div v-if="isLoadingMyMessages" class="loading">불러오는 중...</div>
            <div v-else-if="myGuestbookMessages.length === 0" class="empty-message">
              아직 남긴 방명록이 없습니다.
            </div>
            <div v-else class="guestbook-list">
              <div
                v-for="message in myGuestbookMessages"
                :key="message.id"
                class="guestbook-item"
              >
                <img
                  v-if="message.imageUrl"
                  :src="message.imageUrl"
                  alt="방명록 이미지"
                  class="guestbook-thumbnail"
                />
                <div class="guestbook-info">
                  <p class="guestbook-date">{{ formatDate(message.createdAt) }}</p>
                  <button class="delete-btn" @click="deleteGuestbook(message.id)">삭제</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import guestbookService from '@/services/guestbookService'
import type { Block, PageTheme } from '@/types/blocks'
import type { GuestbookMessageResponse } from '@/services/guestbookService'

// Import block components
import HeaderBlock from '@/components/blocks/HeaderBlock.vue'
import ButtonBlock from '@/components/blocks/ButtonBlock.vue'
import SocialLinksBlock from '@/components/blocks/SocialLinksBlock.vue'
import VideoGridBlock from '@/components/blocks/VideoGridBlock.vue'
import GamesCarouselBlock from '@/components/blocks/GamesCarouselBlock.vue'
import PopularMenuBlock from '@/components/blocks/PopularMenuBlock.vue'
import TextBlock from '@/components/blocks/TextBlock.vue'
import ImageBlock from '@/components/blocks/ImageBlock.vue'
import CountdownBlock from '@/components/blocks/CountdownBlock.vue'
import GuestbookBlock from '@/components/blocks/GuestbookBlock.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Blocks data (실제로는 API에서 가져와야 함)
const blocks = ref<Block[]>([])

// Page theme - Default values (will be loaded from API)
const pageTheme = ref<PageTheme>({
  backgroundColor: '#121212',
  textColor: '#ffffff'
})

// QR Code ID
const qrCodeId = ref<string>('')

// Sidebar state
const isSidebarOpen = ref(false)

// User state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// My guestbook messages
const myGuestbookMessages = ref<GuestbookMessageResponse[]>([])
const isLoadingMyMessages = ref(false)

const visibleBlocks = computed(() => {
  return blocks.value
    .filter(block => block.isVisible)
    .sort((a, b) => a.order - b.order)
})

function getBlockComponent(type: string): Component | string {
  const components: Record<string, Component> = {
    header: HeaderBlock,
    button: ButtonBlock,
    social_links: SocialLinksBlock,
    video_grid: VideoGridBlock,
    games_carousel: GamesCarouselBlock,
    popular_menu: PopularMenuBlock,
    text: TextBlock,
    image: ImageBlock,
    countdown: CountdownBlock,
    guestbook: GuestbookBlock
  }
  return components[type] || 'div'
}

// Sidebar functions
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  if (isSidebarOpen.value && isAuthenticated.value) {
    loadMyGuestbook()
  }
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

// Auth functions
const handleLogout = () => {
  authStore.logout()
  isSidebarOpen.value = false
  alert('로그아웃되었습니다.')
}

const goToLogin = () => {
  const qrParam = route.query.qr as string
  if (qrParam) {
    router.push(`/login?qr=${qrParam}`)
  } else {
    router.push('/login')
  }
}

const goToSignup = () => {
  const qrParam = route.query.qr as string
  if (qrParam) {
    router.push(`/signup?qr=${qrParam}`)
  } else {
    router.push('/signup')
  }
}

// Guestbook functions
const loadMyGuestbook = async () => {
  if (!qrCodeId.value || !isAuthenticated.value) return

  isLoadingMyMessages.value = true
  try {
    // Get all messages for this QR code
    const allMessages = await guestbookService.getMessages(qrCodeId.value)

    // Filter to show only messages from current user
    myGuestbookMessages.value = allMessages.filter(
      msg => msg.userId === authStore.user?.id
    )
  } catch (error) {
    console.error('Failed to load my guestbook messages:', error)
  } finally {
    isLoadingMyMessages.value = false
  }
}

const deleteGuestbook = async (messageId: string) => {
  if (!confirm('이 방명록을 삭제하시겠습니까?')) return

  try {
    await guestbookService.deleteMessage(messageId)
    myGuestbookMessages.value = myGuestbookMessages.value.filter(msg => msg.id !== messageId)
    alert('방명록이 삭제되었습니다.')
  } catch (error) {
    console.error('Failed to delete guestbook message:', error)
    alert('방명록 삭제에 실패했습니다.')
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7) return `${days}일 전`

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  // Get storeId and QR code from route query
  const storeId = route.query.storeId as string
  const qrCode = route.query.qr as string

  // Store QR code for guestbook

  // API URL
  const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

  // Fetch landing page settings from API
  let logoUrl = ''
  let storeName = '테라스 레스토랑'
  let welcomeMessage = '📶 테라스_Guest / terrace1234\n🕐 매일 10:00 - 22:00\n📞 02-1234-5678'

  try {

    // If QR code is provided, call QR code API to log scan
    if (qrCode) {
      try {
        // Call QR code API to increment scan count and log analytics
        const qrResponse = await fetch(`${API_URL}/api/qrcode/by-code/${encodeURIComponent(qrCode)}`)
        if (qrResponse.ok) {
          console.log('QR scan logged successfully')
        }
      } catch (err) {
        console.warn('Failed to log QR scan:', err)
      }
    }

    // Fetch landing page settings
    const endpoint = qrCode
      ? `${API_URL}/api/landingpage/settings/qr/${encodeURIComponent(qrCode)}`
      : `${API_URL}/api/landingpage/settings`

    const response = await fetch(endpoint)
    const settings = await response.json()

    if (settings && settings.storeName) {
      logoUrl = settings.logoUrl || ''
      storeName = settings.storeName
      welcomeMessage = settings.welcomeMessage || welcomeMessage
    }
  } catch (error) {
    console.warn('Failed to load landing page settings from API, using defaults:', error)
  }

  // Load layout from API if QR code is provided
  if (qrCode) {
    try {
    // Extract QR code ID from the QR code
    const qrResponse = await fetch(`${API_URL}/api/qrcode/by-code/${encodeURIComponent(qrCode)}`)
    if (!qrResponse.ok) {
      console.error('Failed to fetch QR code data')
      return
    }

    const qrData = await qrResponse.json()
    const fetchedQrCodeId = qrData.id

    // Store QR code (Code 문자열) for guestbook
    qrCodeId.value = qrCode  // QR Code 문자열 저장 (예: "5YWF8V2X")

    // Fetch layout from API
    const layoutResponse = await fetch(`${API_URL}/api/landingpage/layout/${fetchedQrCodeId}`)
    if (!layoutResponse.ok) {
      console.error('Failed to fetch layout data')
      return
    }

    const layoutData = await layoutResponse.json()

    // Parse blocks from API response
    if (layoutData.blocksJson) {
      blocks.value = JSON.parse(layoutData.blocksJson)
      console.log('Layout loaded from API')
    } else {
      console.warn('No layout data found')
      blocks.value = []
    }

    // Parse theme from API response
    if (layoutData.themeJson) {
      pageTheme.value = JSON.parse(layoutData.themeJson)
    }

    // Update header block with latest API data
    const headerBlock = blocks.value.find(b => b.type === 'header')
    if (headerBlock && headerBlock.data) {
      headerBlock.data.logoUrl = logoUrl
      headerBlock.data.storeName = storeName
      headerBlock.data.welcomeMessage = welcomeMessage
    }
    } catch (error) {
      console.error('Error loading layout from API:', error)
    }
  }
})
</script>

<style scoped>
.customer-view {
  min-height: 100vh;
  transition: background-color 0.3s ease;
  position: relative;
}

/* Footer */
.footer {
  padding: 2rem 1.5rem;
  text-align: center;
  background: transparent;
}

.footer-text {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 12px;
  transition: color 0.3s ease;
}

/* Floating Navigation Button */
.floating-nav-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 999;
}

.floating-nav-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
}

.floating-nav-btn:active {
  transform: scale(0.95);
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(4px);
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 90%;
  max-width: 400px;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* User Section */
.user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1rem;
}

.user-info {
  text-align: center;
  margin-bottom: 1.5rem;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.user-email {
  font-size: 0.875rem;
  color: #757575;
  margin: 0;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #d32f2f;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #ffebee;
  border-color: #d32f2f;
}

/* Not Logged In Section */
.not-logged-in-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.login-message {
  font-size: 0.9375rem;
  color: #757575;
  text-align: center;
  margin: 0 0 1.5rem 0;
}

.login-btn,
.signup-btn {
  width: 100%;
  padding: 0.875rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.75rem;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.signup-btn {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.signup-btn:hover {
  background: #f5f7ff;
}

/* My Guestbook Section */
.my-guestbook-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
}

.loading,
.empty-message {
  text-align: center;
  padding: 2rem;
  color: #757575;
  font-size: 0.9375rem;
}

.guestbook-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.guestbook-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.guestbook-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.guestbook-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.guestbook-date {
  font-size: 0.875rem;
  color: #757575;
  margin: 0;
}

.delete-btn {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d32f2f;
  border-radius: 6px;
  color: #d32f2f;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #ffebee;
}

/* Sidebar Transition */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(100%);
}

@media (max-width: 640px) {
  .floating-nav-btn {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 48px;
    height: 48px;
  }

  .sidebar {
    width: 100%;
    max-width: 100%;
  }
}
</style>
