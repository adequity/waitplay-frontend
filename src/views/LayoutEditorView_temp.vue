<template>
  <div class="layout-editor">
    <!-- 1. Header (Apple Style) -->
    <header class="editor-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div class="header-title">
          <h1>랜딩 페이지 디자인</h1>
          <p class="header-subtitle">블록을 드래그하여 순서를 변경하고 스타일을 편집하세요</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-action btn-secondary" @click="goBack">
          취소
        </button>
        <button class="btn-action btn-primary" @click="saveLayout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
          저장하기
        </button>
      </div>
    </header>

    <div class="editor-container">
      <!-- 2. Left Panel: Block List & Editor -->
      <aside class="editor-panel">
        <div class="panel-header">
          <div class="panel-title">
            <h2>블록 레이어</h2>
            <span class="block-count">{{ blocks.length }}개</span>
          </div>
          <button class="btn-add-block" @click="showAddBlockModal = true">
            + 블록 추가
          </button>
        </div>

        <div class="blocks-list" v-if="blocks.length > 0">
          <draggable
            v-model="blocks"
            item-key="id"
            handle=".drag-handle"
            animation="300"
            ghost-class="sortable-ghost"
            chosen-class="sortable-chosen"
            drag-class="sortable-drag"
            @end="onDragEnd"
          >
            <template #item="{ element, index }">
              <div
                class="block-item"
                :class="{
                  fixed: element.type === 'header',
                  hidden: !element.isVisible
                }"
              >
                <!-- Drag Handle -->
                <div class="drag-handle" v-if="element.type !== 'header'">
                  <div class="drag-dot"></div><div class="drag-dot"></div><div class="drag-dot"></div>
                </div>

                <!-- Icon -->
                <div class="block-icon">
                  {{ getBlockIcon(element.type) }}
                </div>

                <!-- Info -->
                <div class="block-info">
                  <div class="block-header">
                    <span class="block-title">{{ getBlockTitle(element.type) }}</span>
                    <span v-if="element.type === 'header'" class="badge fixed">고정</span>
                    <span v-if="!element.isVisible" class="badge hidden">숨김</span>
                  </div>
                  <div class="block-preview">
                    {{ getBlockPreview(element) }}
                  </div>
                </div>

                <!-- Actions -->
                <div class="block-actions">
                  <button class="btn-icon" @click="editBlock(element)" title="편집">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    v-if="element.type !== 'header'"
                    class="btn-icon"
                    @click="toggleBlockVisibility(element)"
                    :title="element.isVisible ? '숨기기' : '표시하기'"
                  >
                    <svg v-if="element.isVisible" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                  <button
                    v-if="element.type !== 'header'"
                    class="btn-icon delete"
                    @click="deleteBlock(index)"
                    title="삭제"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>블록이 없습니다</h3>
          <p>첫 번째 블록을 추가하여 페이지를 구성하세요</p>
          <button class="btn-add-large" @click="showAddBlockModal = true">
            블록 추가하기
          </button>
        </div>
      </aside>

      <!-- 3. Right Panel: Preview (iPhone Frame) -->
      <main class="preview-panel">
        <div class="preview-toolbar">
          <div class="segmented-control">
            <button class="segment-btn" :class="{ active: previewDevice === 'mobile' }" @click="previewDevice = 'mobile'">모바일</button>
            <button class="segment-btn" :class="{ active: previewDevice === 'desktop' }" @click="previewDevice = 'desktop'">데스크톱</button>
          </div>
          <div class="theme-picker">
            <span style="font-size:12px; font-weight:600; color:#666;">배경색</span>
            <input type="color" v-model="pageTheme.backgroundColor" class="color-dot-input" />
          </div>
        </div>

        <div class="preview-container" :class="previewDevice">
          <div class="phone-frame">
            <div class="notch" v-if="previewDevice === 'mobile'"></div>
            <div
              class="preview-screen"
              :style="{
                backgroundColor: pageTheme.backgroundColor,
                color: pageTheme.textColor
              }"
            >
              <!-- Dynamic Block Component Rendering (Logic Preserved) -->
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
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 4. Modals (Add / Edit) -->

    <!-- Add Block Modal -->
    <div v-if="showAddBlockModal" class="modal-overlay active" @click="showAddBlockModal = false">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h2>블록 추가하기</h2>
          <button class="btn-icon-close" @click="showAddBlockModal = false">✕</button>
        </div>
        <div class="modal-grid">
          <div
            v-for="blockType in availableBlockTypes"
            :key="blockType.type"
            class="block-type-card"
            @click="addBlock(blockType.type as BlockType)"
          >
            <div class="type-icon">{{ blockType.icon }}</div>
            <div class="type-info">
              <div class="type-name">{{ blockType.name }}</div>
              <div class="type-desc">{{ blockType.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Block Modal -->
    <div v-if="editingBlock" class="modal-overlay active" @click="cancelEdit">
      <div class="modal-card large" @click.stop>
        <div class="modal-header">
          <h2>{{ getBlockTitle(editingBlock.type) }} 편집</h2>
          <button class="btn-icon-close" @click="cancelEdit">✕</button>
        </div>

        <div class="edit-form-content">
          <!-- Example: Header Edit -->
          <template v-if="editingBlock.type === 'header'">
            <div class="form-group">
              <label class="form-label">매장 이름</label>
              <input type="text" class="form-input" v-model="editForm.storeName" placeholder="매장명 입력" />
            </div>
            <div class="form-group">
              <label class="form-label">환영 메시지</label>
              <textarea class="form-textarea" v-model="editForm.welcomeMessage" placeholder="환영 메시지 입력"></textarea>
            </div>
          </template>

          <!-- Example: Button Edit -->
          <div v-if="editingBlock.type === 'button'" class="form-group">
            <label class="form-label">버튼 텍스트</label>
            <input type="text" class="form-input" v-model="editForm.text" placeholder="버튼명 입력">
            <label class="form-label mt-2">링크 URL</label>
            <input type="text" class="form-input" v-model="editForm.url" placeholder="https://...">
          </div>

          <!-- Other blocks placeholder -->
          <div v-if="!['header', 'button'].includes(editingBlock.type)" class="form-hint-box">
            선택한 블록의 세부 설정 옵션이 여기에 표시됩니다.
          </div>

        </div>

        <div class="modal-actions">
          <button class="btn-action btn-secondary" @click="cancelEdit">취소</button>
          <button class="btn-action btn-primary" @click="saveBlockEdit">저장</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, type Component } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import draggable from 'vuedraggable'
import type { Block, BlockType } from '@/types/blocks'
import gameSettingsService from '@/services/gameSettingsService'

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

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Get QR Code ID from authenticated user (not from URL parameter)
const qrCodeId = ref<string>('')
const isLoading = ref(true)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Landing page settings (from QR management)
const landingPageSettings = ref<any>(null)

// Blocks data - will be loaded from API
const blocks = ref<Block[]>([])

const showAddBlockModal = ref(false)
const editingBlock = ref<Block | null>(null)
const editForm = ref<any>({})
const previewDevice = ref<'mobile' | 'desktop'>('mobile')

// File upload state
const backgroundImageInput = ref<HTMLInputElement | null>(null)
const backgroundImageUploading = ref(false)

// Page theme settings - will be loaded from API
const pageTheme = ref({
  backgroundColor: '#121212',
  textColor: '#ffffff'
})

// Available block types
const availableBlockTypes = [
  { type: 'button', icon: 'B', name: '버튼', description: '링크 버튼 추가' },
  { type: 'social_links', icon: 'S', name: 'SNS 링크', description: '소셜 미디어 링크' },
  { type: 'video_grid', icon: 'V', name: '영상', description: 'YouTube Shorts' },
  { type: 'games_carousel', icon: 'G', name: '게임', description: '게임 캐러셀' },
  { type: 'popular_menu', icon: 'M', name: '메뉴', description: '인기 메뉴' },
  { type: 'text', icon: 'T', name: '텍스트', description: '자유 텍스트' },
  { type: 'image', icon: 'I', name: '이미지', description: '이미지 추가' },
  { type: 'countdown', icon: '⏱', name: '카운트다운', description: '이벤트 타이머' },
  { type: 'guestbook', icon: '✍', name: '방명록', description: '손글씨 방명록' }
]

// Load layout from API on mount
onMounted(async () => {
  // Router navigation guard already handles authentication and admin role check
  // User data should already be loaded by router guard

  // Get QR code ID from authenticated user
  if (!authStore.user?.qrCodeId) {
    console.error('[LayoutEditor] No QR code ID found for user')
    alert('QR 코드를 찾을 수 없습니다. QR 관리에서 QR 코드를 먼저 생성해주세요.')
    // Use router.replace instead of push to prevent infinite loop
    router.replace('/admin')
    return
  }

  qrCodeId.value = authStore.user.qrCodeId
  console.log('[LayoutEditor] Loading layout for QR code:', qrCodeId.value)

  await loadLandingPageSettings()
  await loadLayout()
})

// Load landing page settings first
async function loadLandingPageSettings() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/landingpage/settings`)
    if (response.ok) {
      landingPageSettings.value = await response.json()
      console.log('Loaded landing page settings:', landingPageSettings.value)
    }
  } catch (error) {
    console.error('Error loading landing page settings:', error)
  }
}

// Get default blocks for new layouts
function getDefaultBlocks(): Block[] {
  // Use landing page settings if available
  const storeName = landingPageSettings.value?.storeName || '매장명을 입력하세요'
  const welcomeMessage = landingPageSettings.value?.welcomeMessage || '환영합니다!\n\n📶 WiFi 정보\n🕐 영업시간\n📞 연락처'
  const logoUrl = landingPageSettings.value?.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'

  return [
    {
      id: 'header-001',
      type: 'header',
      order: 0,
      isVisible: true,
      fixed: true,
      data: {
        storeName: storeName,
        backgroundImage: logoUrl,
        welcomeMessage: welcomeMessage,
        gradientOverlay: {
          enabled: true,
          startOpacity: 0,
          endOpacity: 100,
          color: pageTheme.value.backgroundColor
        }
      }
    }
  ]
}

// Load layout from API
async function loadLayout() {
  if (!qrCodeId.value) {
    console.error('QR Code ID is required')
    alert('QR 코드 ID가 필요합니다')
    router.back()
    return
  }

  try {
    isLoading.value = true
    const response = await fetch(`${API_BASE_URL}/api/landingpage/layout/${qrCodeId.value}`)

    if (response.ok) {
      const layout = await response.json()

      // Parse blocks from JSON
      if (layout.blocksJson) {
        const parsedBlocks = JSON.parse(layout.blocksJson)
        // If blocks exist and have content, use them; otherwise use default blocks with header
        if (parsedBlocks && parsedBlocks.length > 0) {
          // Ensure header block exists (some old layouts might not have it)
          const hasHeader = parsedBlocks.some((block: Block) => block.type === 'header')
          if (!hasHeader) {
            // Add header block at the beginning
            const defaultBlocks = getDefaultBlocks()
            blocks.value = [...defaultBlocks, ...parsedBlocks]
          } else {
            blocks.value = parsedBlocks
          }
        } else {
          // Empty layout - add default header block
          blocks.value = getDefaultBlocks()
        }
      } else {
        // Use default blocks if no blocksJson
        blocks.value = getDefaultBlocks()
      }

      // Parse theme from JSON if exists
      if (layout.themeJson) {
        pageTheme.value = JSON.parse(layout.themeJson)
      }
    } else if (response.status === 404) {
      // Layout doesn't exist yet, use default blocks
      console.log('No layout found for this QR code, using default blocks')
      blocks.value = getDefaultBlocks()
    } else {
      throw new Error('Failed to load layout')
    }
  } catch (error) {
    console.error('Error loading layout:', error)
    // On error, use default blocks instead of showing alert
    console.log('Using default blocks due to error')
    blocks.value = getDefaultBlocks()
  } finally {
    isLoading.value = false
  }
}

// Computed
const visibleBlocks = computed(() => {
  return blocks.value
    .filter(block => block.isVisible)
    .sort((a, b) => a.order - b.order)
})

// Methods
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

function getBlockIcon(type: string): string {
  const icons: Record<string, string> = {
    header: 'H',
    button: 'B',
    social_links: 'S',
    video_grid: 'V',
    games_carousel: 'G',
    popular_menu: 'M',
    text: 'T',
    image: 'I',
    countdown: '⏱',
    guestbook: '✍'
  }
  return icons[type] || '□'
}

function getBlockTitle(type: string): string {
  const titles: Record<string, string> = {
    header: '헤더',
    button: '버튼',
    social_links: 'SNS 링크',
    video_grid: '영상 그리드',
    games_carousel: '게임 캐러셀',
    popular_menu: '인기 메뉴',
    text: '텍스트',
    image: '이미지',
    countdown: '카운트다운',
    guestbook: '방명록'
  }
  return titles[type] || '블록'
}

function getBlockPreview(block: Block): string {
  switch (block.type) {
    case 'header':
      return (block.data as any).storeName || '매장명 없음'
    case 'button':
      return (block.data as any).text || '버튼 텍스트 없음'
    case 'social_links':
      return `${(block.data as any).links?.length || 0}개 링크`
    case 'video_grid':
      return `${(block.data as any).videos?.length || 0}개 영상`
    case 'games_carousel':
      return `${(block.data as any).enabledGames?.length || 0}개 게임`
    case 'popular_menu':
      return `${(block.data as any).items?.length || 0}개 메뉴`
    default:
      return ''
  }
}

function onDragEnd() {
  blocks.value.forEach((block, index) => {
    block.order = index
  })
}

function addBlock(type: BlockType) {
  const newBlock: any = {
    id: `${type}-${Date.now()}`,
    type,
    order: blocks.value.length,
    isVisible: true,
    data: getDefaultBlockData(type)
  }
  blocks.value.push(newBlock)
  showAddBlockModal.value = false
}

function getDefaultBlockData(type: BlockType): any {
  switch (type) {
    case 'header':
      return {
        storeName: '',
        backgroundImage: '',
        welcomeMessage: '',
        gradientOverlay: {
          enabled: true,
          startOpacity: 0,
          endOpacity: 100,
          color: pageTheme.value.backgroundColor
        }
      }
    case 'button':
      return { text: '새 버튼', url: '', style: 'primary' }
    case 'social_links':
      return { links: [] }
    case 'video_grid':
      return { videos: [], layout: 'grid-2' }
    case 'games_carousel':
      return {
        enabledGames: ['pinball', 'memory', 'spot-difference'],
        showLeaderboard: true,
        gamesOrder: [
          { type: 'pinball', name: '핀볼', icon: '🎯' },
          { type: 'brick-breaker', name: '벽돌깨기', icon: '🧱' },
          { type: 'memory', name: '같은 카드 찾기', icon: '🃏' },
          { type: 'spot-difference', name: '틀린 그림 찾기', icon: '🔍' }
        ]
      }
    case 'popular_menu':
      return { title: '인기 메뉴', subtitle: '', items: [] }
    case 'text':
      return { content: '', style: 'normal' }
    case 'image':
      return { imageUrl: '', caption: '', aspectRatio: '16:9' }
    case 'countdown':
      return {
        title: '이벤트 카운트다운',
        description: '곧 특별한 이벤트가 시작됩니다!',
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        style: 'card'
      }
    case 'guestbook':
      return {
        title: '방명록',
        messages: [],
        maxMessageLength: 200,
        textColor: '#374151'
      }
    default:
      return {}
  }
}

async function editBlock(block: Block) {
  editingBlock.value = block
  editForm.value = JSON.parse(JSON.stringify(block.data))

  // Ensure gradientOverlay exists for header blocks
  if (block.type === 'header' && !editForm.value.gradientOverlay) {
    editForm.value.gradientOverlay = {
      enabled: true,
      startOpacity: 0,
      endOpacity: 100,
      color: pageTheme.value.backgroundColor
    }
  }

  // Load game settings from API for games_carousel blocks
  if (block.type === 'games_carousel') {
    try {
      const settings = await gameSettingsService.getGameSettings(qrCodeId.value)

      // Game definitions matching GamesTab
      const gameDefinitions: Record<string, { name: string; icon: string }> = {
        'pinball': { name: '핀볼', icon: '🎯' },
        'brick-breaker': { name: '벽돌깨기', icon: '🧱' },
        'memory': { name: '같은 카드 찾기', icon: '🃏' },
        'spot-difference': { name: '틀린 그림 찾기', icon: '🔍' }
      }

      // Update enabled games from API
      editForm.value.enabledGames = settings.enabledGames

      // Update games order from API or create from enabled games
      if (settings.gamesOrder && settings.gamesOrder.length > 0) {
        editForm.value.gamesOrder = settings.gamesOrder.map(order => ({
          type: order.type,
          name: gameDefinitions[order.type]?.name || order.type,
          icon: gameDefinitions[order.type]?.icon || '🎮'
        }))
      } else {
        // Create games order from enabled games
        editForm.value.gamesOrder = settings.enabledGames.map(gameId => ({
          type: gameId,
          name: gameDefinitions[gameId]?.name || gameId,
          icon: gameDefinitions[gameId]?.icon || '🎮'
        }))
      }

      console.log('Game settings loaded for carousel:', settings)
    } catch (error) {
      console.error('Failed to load game settings:', error)
      // Fallback to default games if API fails
      if (!editForm.value.gamesOrder || editForm.value.gamesOrder.length === 0) {
        editForm.value.gamesOrder = [
          { type: 'pinball', name: '핀볼', icon: '🎯' },
          { type: 'memory', name: '같은 카드 찾기', icon: '🃏' },
          { type: 'spot-difference', name: '틀린 그림 찾기', icon: '🔍' }
        ]
      }
      if (!editForm.value.enabledGames || editForm.value.enabledGames.length === 0) {
        editForm.value.enabledGames = ['pinball', 'memory', 'spot-difference']
      }
    }
  }

  // Convert ISO date to datetime-local format for countdown blocks
  if (block.type === 'countdown' && editForm.value.targetDate) {
    // ISO format: 2024-12-17T12:00:00.000Z
    // datetime-local format: 2024-12-17T12:00
    const date = new Date(editForm.value.targetDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    editForm.value.targetDate = `${year}-${month}-${day}T${hours}:${minutes}`
  }
}

function getGradientPreview(overlay: any): string {
  const color = overlay.color || '#121212'
  const startOpacity = (overlay.startOpacity ?? 0) / 100
  const endOpacity = (overlay.endOpacity ?? 100) / 100

  // Convert hex to rgb
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  return `linear-gradient(
    to bottom,
    rgba(${r}, ${g}, ${b}, ${startOpacity}) 0%,
    rgba(${r}, ${g}, ${b}, ${startOpacity + (endOpacity - startOpacity) * 0.4}) 40%,
    rgba(${r}, ${g}, ${b}, ${startOpacity + (endOpacity - startOpacity) * 0.7}) 70%,
    rgba(${r}, ${g}, ${b}, ${startOpacity + (endOpacity - startOpacity) * 0.95}) 90%,
    rgba(${r}, ${g}, ${b}, ${endOpacity}) 100%
  )`
}

function cancelEdit() {
  editingBlock.value = null
  editForm.value = {}
}

function saveBlockEdit() {
  if (editingBlock.value) {
    const formData = JSON.parse(JSON.stringify(editForm.value))

    // Convert datetime-local back to ISO format for countdown blocks
    if (editingBlock.value.type === 'countdown' && formData.targetDate) {
      // datetime-local format: 2024-12-17T12:00
      // ISO format: 2024-12-17T12:00:00.000Z
      formData.targetDate = new Date(formData.targetDate).toISOString()
    }

    editingBlock.value.data = formData
    editingBlock.value = null
    editForm.value = {}
  }
}

function deleteBlock(index: number) {
  if (confirm('이 블록을 삭제하시겠습니까?')) {
    blocks.value.splice(index, 1)
    // 삭제 후 order 재정렬
    blocks.value.forEach((block, idx) => {
      block.order = idx
    })
  }
}

function toggleBlockVisibility(block: Block) {
  block.isVisible = !block.isVisible
}

function goBack() {
  router.back()
}

async function saveLayout() {
  if (!qrCodeId.value) {
    alert('QR 코드 ID가 필요합니다')
    return
  }

  try {
    isLoading.value = true

    // 저장하기 전에 블록 순서 재정렬
    blocks.value.forEach((block, index) => {
      block.order = index
    })

    const payload = {
      qrCodeId: qrCodeId.value,
      blocksJson: JSON.stringify(blocks.value),
      themeJson: JSON.stringify(pageTheme.value)
    }

    const response = await fetch(`${API_BASE_URL}/api/landingpage/layout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('Failed to save layout')
    }

    alert('레이아웃이 저장되었습니다!')
  } catch (error) {
    console.error('Error saving layout:', error)
    alert('레이아웃 저장 중 오류가 발생했습니다')
  } finally {
    isLoading.value = false
  }
}

// Social Links helpers
function addSocialLink() {
  if (!editForm.value.links) editForm.value.links = []
  editForm.value.links.push({ platform: 'instagram', url: '' })
}

function removeSocialLink(index: number) {
  editForm.value.links.splice(index, 1)
}

// Background image upload functions
async function handleBackgroundImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    alert('파일 크기는 2MB 이하여야 합니다.')
    return
  }

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    alert('PNG, JPG, SVG 파일만 업로드 가능합니다.')
    return
  }

  try {
    backgroundImageUploading.value = true

    // Create FormData and upload
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/fileupload/background`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const data = await response.json()

    if (data.success && data.fileUrl) {
      editForm.value.backgroundImage = data.fileUrl
    } else {
      throw new Error(data.message || 'Upload failed')
    }
  } catch (error) {
    console.error('Error uploading background image:', error)
    alert('이미지 업로드 중 오류가 발생했습니다.')
  } finally {
    backgroundImageUploading.value = false
    // Reset file input
    if (backgroundImageInput.value) {
      backgroundImageInput.value.value = ''
    }
  }
}

function removeBackgroundImage() {
  if (confirm('배경 이미지를 삭제하시겠습니까?')) {
    editForm.value.backgroundImage = ''
  }
}

// YouTube helper functions
function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null

  // Handle various YouTube URL formats including Shorts
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

function updateVideoThumbnail(video: any) {
  if (!video.url) {
    video.thumbnail = ''
    return
  }

  const videoId = extractYoutubeVideoId(video.url)
  if (videoId) {
    video.thumbnail = getYoutubeThumbnail(videoId)
  }
}

// Video helpers
function addVideo() {
  if (!editForm.value.videos) editForm.value.videos = []
  editForm.value.videos.push({ url: '', thumbnail: '' })
}

function removeVideo(index: number) {
  editForm.value.videos.splice(index, 1)
}

// Menu helpers
function addMenuItem() {
  if (!editForm.value.items) editForm.value.items = []
  editForm.value.items.push({ rank: editForm.value.items.length + 1, name: '', price: 0 })
}

function removeMenuItem(index: number) {
  editForm.value.items.splice(index, 1)
}
</script>
