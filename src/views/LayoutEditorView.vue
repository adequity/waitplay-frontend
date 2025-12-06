<template>
  <div class="layout-editor">
    <!-- Top Header -->
    <div class="editor-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">
          <span class="icon">←</span>
        </button>
        <div class="header-title">
          <h1>랜딩 페이지 레이아웃 관리</h1>
          <p class="header-subtitle">블록을 드래그하여 순서를 변경하고 내용을 편집하세요</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="goBack">
          <span class="icon">✕</span>
          <span>취소</span>
        </button>
        <button class="btn-primary" @click="saveLayout">
          <span class="icon">✓</span>
          <span>저장하기</span>
        </button>
      </div>
    </div>

    <div class="editor-container">
      <!-- Left Panel: Block Editor -->
      <div class="editor-panel">
        <div class="panel-header">
          <div class="panel-title">
            <h2>블록 목록</h2>
            <span class="block-count">{{ blocks.length }}개</span>
          </div>
          <button class="btn-add" @click="showAddBlockModal = true">
            <span class="icon">+</span>
            <span>블록 추가</span>
          </button>
        </div>

        <div class="blocks-list" v-if="blocks.length > 0">
          <draggable
            v-model="blocks"
            item-key="id"
            handle=".drag-handle"
            animation="200"
            ghost-class="ghost"
            chosen-class="chosen"
            drag-class="dragging"
            @end="onDragEnd"
          >
            <template #item="{ element, index }">
              <div class="block-item" :class="{
                fixed: element.type === 'header',
                hidden: !element.isVisible
              }">
                <div class="block-content">
                  <div class="block-left">
                    <div class="drag-handle" v-if="element.type !== 'header'" title="드래그하여 순서 변경">
                      <span class="drag-icon">⋮⋮</span>
                    </div>
                    <div class="block-info">
                      <div class="block-header-row">
                        <span class="block-icon">{{ getBlockIcon(element.type) }}</span>
                        <span class="block-title">{{ getBlockTitle(element.type) }}</span>
                        <span v-if="element.type === 'header'" class="fixed-badge">고정</span>
                        <span v-if="!element.isVisible" class="hidden-badge">숨김</span>
                      </div>
                      <div class="block-preview">
                        {{ getBlockPreview(element) }}
                      </div>
                    </div>
                  </div>
                  <div class="block-actions">
                    <button class="btn-icon" @click="editBlock(element)" title="편집">
                      <span>✏️</span>
                    </button>
                    <button
                      v-if="element.type !== 'header'"
                      class="btn-icon"
                      @click="toggleBlockVisibility(element)"
                      :title="element.isVisible ? '숨기기' : '표시하기'"
                    >
                      <span>{{ element.isVisible ? '👁️' : '🔒' }}</span>
                    </button>
                    <button
                      v-if="element.type !== 'header'"
                      class="btn-icon danger"
                      @click="deleteBlock(index)"
                      title="삭제"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>블록이 없습니다</h3>
          <p>블록 추가 버튼을 클릭하여 첫 번째 블록을 추가하세요</p>
          <button class="btn-add-large" @click="showAddBlockModal = true">
            <span class="icon">+</span>
            <span>블록 추가하기</span>
          </button>
        </div>
      </div>

      <!-- Right Panel: Preview -->
      <div class="preview-panel">
        <div class="panel-header">
          <h2>미리보기</h2>
          <div class="device-toggle">
            <button
              class="device-btn"
              :class="{ active: previewDevice === 'mobile' }"
              @click="previewDevice = 'mobile'"
            >
              모바일
            </button>
            <button
              class="device-btn"
              :class="{ active: previewDevice === 'desktop' }"
              @click="previewDevice = 'desktop'"
            >
              데스크톱
            </button>
          </div>
        </div>

        <!-- Theme Settings -->
        <div class="theme-settings">
          <div class="theme-control">
            <label class="theme-label">페이지 배경색</label>
            <div class="color-input-group-mini">
              <input
                type="color"
                v-model="pageTheme.backgroundColor"
                class="form-color-picker-mini"
              />
              <input
                type="text"
                v-model="pageTheme.backgroundColor"
                class="form-input-mini"
                placeholder="#121212"
              />
            </div>
          </div>
        </div>

        <div class="preview-container" :class="previewDevice">
          <div
            class="preview-content"
            :style="{
              backgroundColor: pageTheme.backgroundColor,
              color: pageTheme.textColor
            }"
          >
            <component
              v-for="block in visibleBlocks"
              :key="block.id"
              :is="getBlockComponent(block.type)"
              :data="block.data"
            />
            <div class="preview-footer">
              <p :style="{ color: pageTheme.textColor, opacity: 0.4 }">
                Powered by WaitPlay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Block Modal -->
    <div v-if="showAddBlockModal" class="modal-overlay" @click="showAddBlockModal = false">
      <div class="modal-content" @click.stop>
        <h2>블록 추가하기</h2>
        <div class="block-types-grid">
          <div
            v-for="blockType in availableBlockTypes"
            :key="blockType.type"
            class="block-type-card"
            @click="addBlock(blockType.type as BlockType)"
          >
            <div class="block-type-icon">{{ blockType.icon }}</div>
            <div class="block-type-name">{{ blockType.name }}</div>
            <div class="block-type-desc">{{ blockType.description }}</div>
          </div>
        </div>
        <button class="btn-close" @click="showAddBlockModal = false">닫기</button>
      </div>
    </div>

    <!-- Edit Block Modal -->
    <div v-if="editingBlock" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h2>{{ getBlockTitle(editingBlock.type) }} 편집</h2>
          <button class="btn-icon-close" @click="cancelEdit">✕</button>
        </div>

        <div class="edit-form">
          <!-- Header Block Edit Form -->
          <template v-if="editingBlock.type === 'header'">
            <div class="form-group">
              <label class="form-label">매장 이름</label>
              <input
                type="text"
                class="form-input"
                v-model="editForm.storeName"
                placeholder="예: 테라스 레스토랑"
              />
            </div>

            <div class="form-group">
              <label class="form-label">배경 이미지 URL</label>
              <input
                type="text"
                class="form-input"
                v-model="editForm.backgroundImage"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div class="form-group">
              <label class="form-label">환영 메시지</label>
              <textarea
                class="form-textarea"
                v-model="editForm.welcomeMessage"
                rows="5"
                placeholder="📶 WiFi 정보&#10;🕐 영업시간&#10;📞 연락처"
              ></textarea>
            </div>

            <!-- Gradient Overlay Settings -->
            <div class="form-section gradient-section">
              <div class="section-header">
                <h3 class="section-title">🎨 그라데이션 오버레이</h3>
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="editForm.gradientOverlay.enabled"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div v-if="editForm.gradientOverlay.enabled" class="gradient-controls">
                <div class="form-group">
                  <label class="form-label">
                    그라데이션 색상
                    <span class="label-hint">배경 페이지 색상과 일치시키세요</span>
                  </label>
                  <div class="color-input-group">
                    <input
                      type="color"
                      class="form-color-picker"
                      v-model="editForm.gradientOverlay.color"
                    />
                    <input
                      type="text"
                      class="form-input"
                      v-model="editForm.gradientOverlay.color"
                      placeholder="#121212"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    시작 투명도 (상단)
                    <span class="label-value">{{ editForm.gradientOverlay.startOpacity }}%</span>
                  </label>
                  <input
                    type="range"
                    class="form-range"
                    min="0"
                    max="100"
                    v-model.number="editForm.gradientOverlay.startOpacity"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    끝 투명도 (하단)
                    <span class="label-value">{{ editForm.gradientOverlay.endOpacity }}%</span>
                  </label>
                  <input
                    type="range"
                    class="form-range"
                    min="0"
                    max="100"
                    v-model.number="editForm.gradientOverlay.endOpacity"
                  />
                </div>

                <div class="gradient-preview">
                  <div class="preview-label">미리보기</div>
                  <div
                    class="gradient-demo"
                    :style="{
                      background: getGradientPreview(editForm.gradientOverlay)
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </template>

          <!-- Button Block Edit Form -->
          <template v-if="editingBlock.type === 'button'">
            <div class="form-group">
              <label class="form-label">버튼 텍스트</label>
              <input
                type="text"
                class="form-input"
                v-model="editForm.text"
                placeholder="예: 메뉴 보기"
              />
            </div>

            <div class="form-group">
              <label class="form-label">링크 URL</label>
              <input
                type="url"
                class="form-input"
                v-model="editForm.url"
                placeholder="https://"
              />
            </div>

            <div class="form-group">
              <label class="form-label">버튼 스타일</label>
              <select class="form-select" v-model="editForm.style">
                <option value="primary">기본</option>
                <option value="secondary">보조</option>
                <option value="outline">테두리</option>
              </select>
            </div>
          </template>

          <!-- Social Links Block Edit Form -->
          <template v-if="editingBlock.type === 'social_links'">
            <div class="form-section">
              <h3 class="section-title">소셜 미디어 링크</h3>
              <div v-for="(link, index) in editForm.links" :key="index" class="link-item">
                <div class="link-row">
                  <select class="form-select" v-model="link.platform">
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="naver">Naver Blog</option>
                  </select>
                  <input
                    type="url"
                    class="form-input flex-1"
                    v-model="link.url"
                    placeholder="https://"
                  />
                  <button class="btn-icon danger" @click="removeSocialLink(index)">
                    🗑️
                  </button>
                </div>
              </div>
              <button class="btn-add-item" @click="addSocialLink">
                + 링크 추가
              </button>
            </div>
          </template>

          <!-- Video Grid Block Edit Form -->
          <template v-if="editingBlock.type === 'video_grid'">
            <div class="form-group">
              <label class="form-label">레이아웃</label>
              <select class="form-select" v-model="editForm.layout">
                <option value="grid-1">1열 (세로)</option>
                <option value="grid-2">2열</option>
                <option value="grid-3">3열</option>
              </select>
            </div>

            <div class="form-section">
              <h3 class="section-title">영상 목록</h3>
              <div v-for="(video, index) in editForm.videos" :key="index" class="video-item">
                <div class="form-group">
                  <label class="form-label">영상 URL</label>
                  <input
                    type="url"
                    class="form-input"
                    v-model="video.url"
                    placeholder="YouTube Shorts URL"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">썸네일 URL</label>
                  <input
                    type="url"
                    class="form-input"
                    v-model="video.thumbnail"
                    placeholder="썸네일 이미지 URL"
                  />
                </div>
                <button class="btn-remove-item" @click="removeVideo(index)">
                  영상 삭제
                </button>
              </div>
              <button class="btn-add-item" @click="addVideo">
                + 영상 추가
              </button>
            </div>
          </template>

          <!-- Games Carousel Block Edit Form -->
          <template v-if="editingBlock.type === 'games_carousel'">
            <div class="form-group">
              <label class="form-label">활성화된 게임</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" value="pinball" v-model="editForm.enabledGames" />
                  <span>🎯 핀볼 게임</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="memory" v-model="editForm.enabledGames" />
                  <span>🃏 기억력 게임</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="spot-difference" v-model="editForm.enabledGames" />
                  <span>🔍 틀린그림찾기</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="editForm.showLeaderboard" />
                <span>리더보드 표시</span>
              </label>
            </div>
          </template>

          <!-- Popular Menu Block Edit Form -->
          <template v-if="editingBlock.type === 'popular_menu'">
            <div class="form-group">
              <label class="form-label">제목</label>
              <input
                type="text"
                class="form-input"
                v-model="editForm.title"
                placeholder="예: 인기 메뉴"
              />
            </div>

            <div class="form-group">
              <label class="form-label">부제목</label>
              <input
                type="text"
                class="form-input"
                v-model="editForm.subtitle"
                placeholder="예: 사람들이 많이 받아간 메뉴"
              />
            </div>

            <div class="form-section">
              <h3 class="section-title">메뉴 목록</h3>
              <div v-for="(item, index) in editForm.items" :key="index" class="menu-item">
                <div class="menu-row">
                  <input
                    type="number"
                    class="form-input rank-input"
                    v-model.number="item.rank"
                    placeholder="#"
                  />
                  <input
                    type="text"
                    class="form-input flex-1"
                    v-model="item.name"
                    placeholder="메뉴명"
                  />
                  <input
                    type="number"
                    class="form-input price-input"
                    v-model.number="item.price"
                    placeholder="가격"
                  />
                  <button class="btn-icon danger" @click="removeMenuItem(index)">
                    🗑️
                  </button>
                </div>
              </div>
              <button class="btn-add-item" @click="addMenuItem">
                + 메뉴 추가
              </button>
            </div>
          </template>

          <!-- Text Block Edit Form -->
          <template v-if="editingBlock.type === 'text'">
            <div class="form-group">
              <label class="form-label">텍스트 내용</label>
              <textarea
                class="form-textarea"
                v-model="editForm.content"
                rows="8"
                placeholder="자유롭게 텍스트를 입력하세요..."
              ></textarea>
            </div>
          </template>

          <!-- Image Block Edit Form -->
          <template v-if="editingBlock.type === 'image'">
            <div class="form-group">
              <label class="form-label">이미지 URL</label>
              <input
                type="url"
                class="form-input"
                v-model="editForm.imageUrl"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div class="form-group">
              <label class="form-label">대체 텍스트</label>
              <input
                type="text"
                class="form-input"
                v-model="editForm.alt"
                placeholder="이미지 설명"
              />
            </div>

            <div class="form-group">
              <label class="form-label">링크 URL (선택사항)</label>
              <input
                type="url"
                class="form-input"
                v-model="editForm.link"
                placeholder="https://"
              />
            </div>
          </template>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" @click="cancelEdit">취소</button>
          <button class="btn-primary" @click="saveBlockEdit">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type Component } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import type { Block, BlockType } from '@/types/blocks'

// Import block components
import HeaderBlock from '@/components/blocks/HeaderBlock.vue'
import ButtonBlock from '@/components/blocks/ButtonBlock.vue'
import SocialLinksBlock from '@/components/blocks/SocialLinksBlock.vue'
import VideoGridBlock from '@/components/blocks/VideoGridBlock.vue'
import GamesCarouselBlock from '@/components/blocks/GamesCarouselBlock.vue'
import PopularMenuBlock from '@/components/blocks/PopularMenuBlock.vue'

const router = useRouter()

// Demo blocks data
const blocks = ref<Block[]>([
  {
    id: 'header-001',
    type: 'header',
    order: 0,
    isVisible: true,
    fixed: true,
    data: {
      storeName: '테라스 레스토랑',
      backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      welcomeMessage: '📶 테라스_Guest / terrace1234\n🕐 매일 10:00 - 22:00\n📞 02-1234-5678',
      gradientOverlay: {
        enabled: true,
        startOpacity: 0,
        endOpacity: 100,
        color: '#121212'
      }
    }
  },
  {
    id: 'button-001',
    type: 'button',
    order: 1,
    isVisible: true,
    data: {
      text: '메뉴 보기',
      url: 'https://example.com/menu',
      style: 'primary'
    }
  },
  {
    id: 'games-001',
    type: 'games_carousel',
    order: 2,
    isVisible: true,
    data: {
      enabledGames: ['pinball', 'memory', 'spot-difference'],
      showLeaderboard: true,
      gamesOrder: ['pinball', 'memory', 'spot-difference']
    }
  }
])

const showAddBlockModal = ref(false)
const editingBlock = ref<Block | null>(null)
const editForm = ref<any>({})
const previewDevice = ref<'mobile' | 'desktop'>('mobile')

// Page theme settings - Load from localStorage or use defaults
const savedTheme = localStorage.getItem('waitplay-page-theme')
const pageTheme = ref(
  savedTheme
    ? JSON.parse(savedTheme)
    : {
        backgroundColor: '#121212',
        textColor: '#ffffff'
      }
)

// Available block types
const availableBlockTypes = [
  { type: 'button', icon: 'B', name: '버튼', description: '링크 버튼 추가' },
  { type: 'social_links', icon: 'S', name: 'SNS 링크', description: '소셜 미디어 링크' },
  { type: 'video_grid', icon: 'V', name: '영상', description: 'YouTube Shorts' },
  { type: 'games_carousel', icon: 'G', name: '게임', description: '게임 캐러셀' },
  { type: 'popular_menu', icon: 'M', name: '메뉴', description: '인기 메뉴' },
  { type: 'text', icon: 'T', name: '텍스트', description: '자유 텍스트' },
  { type: 'image', icon: 'I', name: '이미지', description: '이미지 추가' }
]

// Watch pageTheme and save to localStorage
watch(
  pageTheme,
  (newTheme) => {
    localStorage.setItem('waitplay-page-theme', JSON.stringify(newTheme))
  },
  { deep: true }
)

// Watch blocks and save to localStorage
watch(
  blocks,
  (newBlocks) => {
    localStorage.setItem('waitplay-blocks', JSON.stringify(newBlocks))
  },
  { deep: true }
)

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
    popular_menu: PopularMenuBlock
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
    image: 'I'
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
    image: '이미지'
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
      return { enabledGames: [], showLeaderboard: true, gamesOrder: [] }
    case 'popular_menu':
      return { title: '인기 메뉴', subtitle: '', items: [] }
    case 'text':
      return { content: '' }
    case 'image':
      return { imageUrl: '', alt: '', link: '' }
    default:
      return {}
  }
}

function editBlock(block: Block) {
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
    editingBlock.value.data = JSON.parse(JSON.stringify(editForm.value))
    editingBlock.value = null
    editForm.value = {}
  }
}

function deleteBlock(index: number) {
  if (confirm('이 블록을 삭제하시겠습니까?')) {
    blocks.value.splice(index, 1)
  }
}

function toggleBlockVisibility(block: Block) {
  block.isVisible = !block.isVisible
}

function goBack() {
  router.back()
}

function saveLayout() {
  console.log('Saving layout:', blocks.value)
  alert('레이아웃이 저장되었습니다!')
}

// Social Links helpers
function addSocialLink() {
  if (!editForm.value.links) editForm.value.links = []
  editForm.value.links.push({ platform: 'instagram', url: '' })
}

function removeSocialLink(index: number) {
  editForm.value.links.splice(index, 1)
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

<style scoped>
/* Layout */
.layout-editor {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

/* Header */
.editor-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e5e7eb;
}

.btn-back .icon {
  font-size: 20px;
}

.header-title h1 {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.header-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transform: translateY(-1px);
}

/* Container */
.editor-container {
  display: grid;
  grid-template-columns: 450px 1fr;
  gap: 24px;
  padding: 24px;
  max-width: 1800px;
  margin: 0 auto;
}

/* Panels */
.editor-panel,
.preview-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-title h2 {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.block-count {
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.btn-add {
  padding: 10px 18px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-add:hover {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

/* Blocks List */
.blocks-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.block-item {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.block-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.block-item.fixed {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
}

.block-item.hidden {
  opacity: 0.5;
}

.block-item.ghost {
  opacity: 0.4;
}

.block-item.chosen {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.block-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 16px;
  gap: 12px;
}

.block-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.drag-handle {
  cursor: grab;
  padding: 8px 4px;
  color: #9ca3af;
  transition: color 0.2s;
  user-select: none;
}

.drag-handle:hover {
  color: #6b7280;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-icon {
  font-size: 16px;
}

.block-info {
  flex: 1;
  min-width: 0;
}

.block-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.block-icon {
  font-size: 18px;
}

.block-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.fixed-badge,
.hidden-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fixed-badge {
  background: rgba(251, 191, 36, 0.3);
  color: #92400e;
}

.hidden-badge {
  background: #e5e7eb;
  color: #6b7280;
}

.block-preview {
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.block-actions {
  display: flex;
  gap: 6px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: white;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 16px;
}

.btn-icon:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-icon.danger:hover {
  background: #fef2f2;
  border-color: #ef4444;
}

/* Empty State */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 300px;
}

.btn-add-large {
  padding: 14px 28px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.btn-add-large:hover {
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

/* Preview */
.device-toggle {
  display: flex;
  gap: 8px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 8px;
}

.device-btn {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.2s;
}

.device-btn.active {
  background: white;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.preview-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f3f4f6;
}

.preview-container.mobile .preview-content {
  max-width: 375px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.preview-container.desktop .preview-content {
  max-width: 1200px;
  margin: 0 auto;
}

.preview-content {
  border-radius: 16px;
  overflow: hidden;
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

.preview-footer {
  padding: 32px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content.large {
  max-width: 800px;
}

.modal-content h2 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 24px 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
}

.btn-icon-close {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-icon-close:hover {
  background: #e5e7eb;
  color: #111827;
}

/* Block Types Grid */
.block-types-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.block-type-card {
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.block-type-card:hover {
  border-color: #6366f1;
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.block-type-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.block-type-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.block-type-desc {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.btn-close {
  width: 100%;
  padding: 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
}

/* Edit Form */
.edit-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  color: #111827;
  font-family: inherit;
  transition: all 0.2s;
  background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 15px;
  color: #374151;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.form-section {
  margin-bottom: 28px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
}

.link-item,
.video-item,
.menu-item {
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.link-row,
.menu-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.flex-1 {
  flex: 1;
}

.rank-input {
  width: 60px;
}

.price-input {
  width: 120px;
}

.btn-add-item {
  width: 100%;
  padding: 10px;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-add-item:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #f9fafb;
}

.btn-remove-item {
  width: 100%;
  padding: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #dc2626;
  margin-top: 12px;
  transition: all 0.2s;
}

.btn-remove-item:hover {
  background: #fee2e2;
  border-color: #ef4444;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-actions .btn-secondary,
.modal-actions .btn-primary {
  padding: 12px 24px;
}

/* Scrollbar */
.blocks-list::-webkit-scrollbar,
.preview-container::-webkit-scrollbar,
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.blocks-list::-webkit-scrollbar-track,
.preview-container::-webkit-scrollbar-track,
.modal-content::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.blocks-list::-webkit-scrollbar-thumb,
.preview-container::-webkit-scrollbar-thumb,
.modal-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.blocks-list::-webkit-scrollbar-thumb:hover,
.preview-container::-webkit-scrollbar-thumb:hover,
.modal-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Theme Settings */
.theme-settings {
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.theme-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.theme-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.color-input-group-mini {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-color-picker-mini {
  width: 40px;
  height: 40px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-color-picker-mini:hover {
  border-color: #6366f1;
}

.form-input-mini {
  width: 110px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: monospace;
  transition: all 0.2s;
}

.form-input-mini:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Gradient Section Styling */
.gradient-section {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 2px solid #e5e7eb;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.label-hint {
  display: block;
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
  margin-top: 4px;
}

.label-value {
  float: right;
  font-size: 14px;
  color: #6366f1;
  font-weight: 700;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-color-picker {
  width: 60px;
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-color-picker:hover {
  border-color: #6366f1;
}

.form-range {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #e5e7eb 0%, #6366f1 100%);
  border-radius: 10px;
  outline: none;
  cursor: pointer;
}

.form-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: #6366f1;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  transition: all 0.2s;
}

.form-range::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
}

.form-range::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: #6366f1;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  transition: all 0.2s;
}

.form-range::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
}

.gradient-controls {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gradient-preview {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.preview-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gradient-demo {
  height: 120px;
  border-radius: 8px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.toggle-switch input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.3s;
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #6366f1;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-slider:hover {
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

/* Block Icon Styling */
.block-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}
</style>
