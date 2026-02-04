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
              <img v-if="user?.profileImage" :src="user.profileImage" alt="프로필" class="avatar-image" />
              <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            </div>
          </div>

          <!-- Not Logged In Section -->
          <div v-else class="not-logged-in-section">
            <p class="login-message">로그인하고 더 많은 기능을 이용해보세요!</p>
            <button class="login-btn" @click="goToLogin">로그인</button>
            <button class="signup-btn" @click="goToSignup">회원가입</button>
          </div>

          <!-- Menu Tabs (Logged In) -->
          <div v-if="isAuthenticated" class="menu-tabs">
            <button
              :class="['menu-tab', { active: activeTab === 'profile' }]"
              @click="activeTab = 'profile'"
            >
              <span class="tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </span>
              <span class="tab-label">내 프로필</span>
            </button>
            <button
              :class="['menu-tab', { active: activeTab === 'stores' }]"
              @click="activeTab = 'stores'"
            >
              <span class="tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 21H21M3 7V21M21 7V21M6 21V17C6 15.8954 6.89543 15 8 15H10C11.1046 15 12 15.8954 12 17V21M14 11H17M14 15H17M7 11H10M3 7L12 3L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="tab-label">단골 매장</span>
            </button>
            <button
              :class="['menu-tab', { active: activeTab === 'guestbook' }]"
              @click="activeTab = 'guestbook'"
            >
              <span class="tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12M17.5 2.5L12 8L11 12L15 11L20.5 5.5C21.0523 4.94772 21.0523 4.05228 20.5 3.5L19.5 2.5C18.9477 1.94772 18.0523 1.94772 17.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="tab-label">내 방명록</span>
            </button>
          </div>

          <!-- Tab Content -->
          <div v-if="isAuthenticated" class="tab-content">
            <!-- 내 프로필 -->
            <div v-if="activeTab === 'profile'" class="profile-section">
              <div class="profile-item">
                <span class="profile-label">닉네임</span>
                <span class="profile-value">{{ user?.nickname || '-' }}</span>
              </div>
              <div class="profile-item">
                <span class="profile-label">가입일</span>
                <span class="profile-value">{{ formatDate(user?.createdAt) }}</span>
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

            <!-- 단골 매장 -->
            <div v-if="activeTab === 'stores'" class="stores-section">
              <div v-if="isLoadingStores" class="loading">불러오는 중...</div>
              <div v-else-if="followedStores.length === 0" class="empty-message">
                아직 단골 매장이 없습니다.
              </div>
              <div v-else class="stores-list">
                <div
                  v-for="store in followedStores"
                  :key="store.adminId"
                  class="store-item"
                >
                  <div class="store-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 21H21M3 7V21M21 7V21M6 21V17C6 15.8954 6.89543 15 8 15H10C11.1046 15 12 15.8954 12 17V21M14 11H17M14 15H17M7 11H10M3 7L12 3L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="store-details">
                    <p class="store-name">{{ store.storeName || '알 수 없는 매장' }}</p>
                    <p class="store-date">{{ formatDate(store.followedAt) }}부터 단골</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 내 방명록 -->
            <div v-if="activeTab === 'guestbook'" class="guestbook-section">
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
                    <p class="guestbook-store">{{ message.storeName }}</p>
                    <p class="guestbook-date">{{ formatDate(message.createdAt) }}</p>
                    <button class="delete-btn" @click="deleteGuestbook(message.id)">삭제</button>
                  </div>
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
import { ref, computed, onMounted, watch, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import guestbookService from '@/services/guestbookService'
import followService from '@/services/followService'
import gameSettingsService from '@/services/gameSettingsService'
import type { Block, PageTheme } from '@/types/blocks'
import type { MyGuestbookMessageResponse } from '@/services/guestbookService'
import type { FollowedStoreInfo } from '@/services/followService'

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

// Active tab state
const activeTab = ref('profile')

// Followed stores
const followedStores = ref<FollowedStoreInfo[]>([])
const isLoadingStores = ref(false)

// My guestbook messages
const myGuestbookMessages = ref<MyGuestbookMessageResponse[]>([])
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
    loadSidebarData()
  }
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

// Load all sidebar data
const loadSidebarData = async () => {
  if (!isAuthenticated.value) return

  // Load based on active tab or load all
  await Promise.all([
    loadFollowedStores(),
    loadMyGuestbook()
  ])
}

// Load followed stores
const loadFollowedStores = async () => {
  if (!isAuthenticated.value) return

  isLoadingStores.value = true
  try {
    followedStores.value = await followService.getMyFollowedStores()
  } catch (error) {
    console.error('Failed to load followed stores:', error)
  } finally {
    isLoadingStores.value = false
  }
}

// Auth functions
const handleLogout = () => {
  authStore.logout()
  isSidebarOpen.value = false
  router.push('/login')
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
  if (!isAuthenticated.value) return

  isLoadingMyMessages.value = true
  try {
    // Get all messages by current user (across all stores)
    myGuestbookMessages.value = await guestbookService.getMyMessages()
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

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'

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

// Watch for theme changes and update body background
watch(() => pageTheme.value.backgroundColor, (newBgColor) => {
  if (newBgColor) {
    // Update body background color
    document.body.style.backgroundColor = newBgColor

    // Update CSS variables
    document.documentElement.style.setProperty('--bg-primary', newBgColor)
    document.documentElement.style.setProperty('--bg-secondary', newBgColor)
  }
}, { immediate: true })

onMounted(async () => {
  // Get storeId and QR code from route query
  const storeId = route.query.storeId as string
  const qrCode = route.query.qr as string

  // Store QR code for games and guestbook (early assignment)
  if (qrCode) {
    qrCodeId.value = qrCode
    console.log('QR code set for games:', qrCode)
  }

  // API URL
  const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

  // Fetch landing page settings from API
  let logoUrl = ''
  let storeName = '테라스 레스토랑'
  let welcomeMessage = '📶 테라스_Guest / terrace1234\n🕐 매일 10:00 - 22:00\n📞 02-1234-5678'

  // QR 코드 데이터를 저장해서 재사용 (중복 호출 방지)
  let qrData: { id: string } | null = null

  try {
    // If QR code is provided, call QR code API to log scan
    if (qrCode) {
      try {
        // Call QR code API to increment scan count and log analytics
        const qrResponse = await fetch(`${API_URL}/api/qrcode/by-code/${encodeURIComponent(qrCode)}`)
        if (qrResponse.ok) {
          qrData = await qrResponse.json()
          console.log('QR scan logged successfully')
        }
      } catch (err) {
        console.warn('Failed to log QR scan:', err)
      }
    }

    // Fetch landing page settings (only if QR code exists)
    if (qrCode) {
      const endpoint = `${API_URL}/api/landingpage/settings/qr/${encodeURIComponent(qrCode)}`
      const response = await fetch(endpoint)

      if (response.ok) {
        const settings = await response.json()
        if (settings && settings.storeName) {
          logoUrl = settings.logoUrl || ''
          storeName = settings.storeName
          welcomeMessage = settings.welcomeMessage || welcomeMessage
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load landing page settings from API, using defaults:', error)
  }

  // Load layout from API if QR code is provided
  if (qrCode && qrData) {
    try {
    // 이미 위에서 가져온 qrData 재사용 (중복 API 호출 방지)
    const fetchedQrCodeId = qrData.id

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

    // Load game settings and update games_carousel block (using public endpoint - no auth required)
    try {
      const gameSettings = await gameSettingsService.getGameSettingsPublic(fetchedQrCodeId)
      const gamesCarouselBlock = blocks.value.find(b => b.type === 'games_carousel')

      if (gamesCarouselBlock && gamesCarouselBlock.data) {
        // Game definitions for mapping (consistent with GamesTab)
        const gameDefinitions: Record<string, { name: string; icon: string }> = {
          'pinball': { name: '핀볼', icon: '🎯' },
          'brick-breaker': { name: '벽돌깨기', icon: '🧱' },
          'memory': { name: '같은 카드 찾기', icon: '🃏' },
          'spot-difference': { name: '틀린 그림 찾기', icon: '🔍' }
        }

        // Update with API data
        gamesCarouselBlock.data.enabledGames = gameSettings.enabledGames

        // Convert GameOrderDto[] to GameOrderItem[]
        if (gameSettings.gamesOrder) {
          gamesCarouselBlock.data.gamesOrder = gameSettings.gamesOrder.map(order => ({
            type: order.type,
            name: gameDefinitions[order.type]?.name || order.type,
            icon: gameDefinitions[order.type]?.icon || '🎮'
          }))
        }

        console.log('Game settings loaded:', gameSettings)
      }
    } catch (error) {
      console.error('Failed to load game settings:', error)
      // Keep default settings from layout if API fails
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
}

.user-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Menu Tabs */
.menu-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.menu-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-tab:hover {
  background: #eeeeee;
}

.menu-tab.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: #667eea;
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #757575;
}

.menu-tab.active .tab-icon {
  color: #667eea;
}

.tab-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #555;
}

.menu-tab.active .tab-label {
  color: #667eea;
}

/* Tab Content */
.tab-content {
  padding-top: 1rem;
}

/* Profile Section */
.profile-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 12px;
}

.profile-label {
  font-size: 0.875rem;
  color: #757575;
  font-weight: 500;
}

.profile-value {
  font-size: 0.9375rem;
  color: #1a1a1a;
  font-weight: 600;
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

/* Stores Section */
.stores-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stores-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.store-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.store-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
}

.store-details {
  flex: 1;
}

.store-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.store-date {
  font-size: 0.8125rem;
  color: #757575;
  margin: 0;
}

/* Guestbook Section */
.guestbook-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

.guestbook-store {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.guestbook-date {
  font-size: 0.8125rem;
  color: #757575;
  margin: 0 0 0.5rem 0;
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
