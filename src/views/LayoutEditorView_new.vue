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
            <!-- Dynamic Block Rendering (same as CustomerView) -->
            <component
              v-for="block in visibleBlocks"
              :key="block.id"
              :is="getBlockComponent(block.type)"
              :data="block.data"
              :qrCodeId="qrCodeId"
            />

            <!-- Footer (same as CustomerView) -->
            <div class="footer">
              <p class="footer-text" :style="{ color: pageTheme.textColor, opacity: 0.4 }">
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
            <div class="block-type-info">
              <div class="block-type-name">{{ blockType.name }}</div>
              <div class="block-type-desc">{{ blockType.description }}</div>
            </div>
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
              <label class="form-label">배경 이미지</label>
              <div v-if="editForm.backgroundImage" class="image-preview-container">
                <img :src="editForm.backgroundImage" alt="배경 이미지 미리보기" class="image-preview" />
                <button type="button" class="btn-remove-image" @click="removeBackgroundImage">
                  ✕ 삭제
                </button>
              </div>
              <div v-else class="upload-placeholder">
                <input
                  type="file"
                  ref="backgroundImageInput"
                  @change="handleBackgroundImageUpload"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  class="file-input"
                  id="background-image-upload"
                />
                <label for="background-image-upload" class="upload-label">
                  <span class="upload-icon">📷</span>
                  <span class="upload-text">배경 이미지 업로드</span>
                  <span class="upload-hint">PNG, JPG, SVG (최대 2MB)</span>
                </label>
              </div>
              <div v-if="backgroundImageUploading" class="upload-progress">
                업로드 중...
              </div>
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
              <div v-for="(link, index) in editForm.links" :key="index" class="social-link-item">
                <div class="social-link-row">
                  <select class="form-select-compact" v-model="link.platform">
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="naver">Naver</option>
                    <option value="threads">Threads</option>
                  </select>
                  <input
                    type="url"
                    class="form-input-compact"
                    v-model="link.url"
                    placeholder="https://..."
                  />
                  <button class="btn-icon-small danger" @click="removeSocialLink(index)" title="삭제">
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
                <option value="grid-1">1열 (가로 영상)</option>
                <option value="grid-2">2열 (Shorts)</option>
                <option value="carousel">캐러셀 (가로 스크롤)</option>
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
                    @input="updateVideoThumbnail(video)"
                    placeholder="YouTube Shorts 공유 링크 (공유하기 버튼 사용)"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">썸네일 URL (자동 생성)</label>
                  <input
                    type="url"
                    class="form-input"
                    v-model="video.thumbnail"
                    readonly
                    placeholder="YouTube URL 입력 시 자동으로 생성됩니다"
                    style="background-color: #f3f4f6; cursor: not-allowed;"
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
              <label class="form-label">게임 선택 및 순서</label>
              <p class="form-hint">체크한 게임만 표시되며, 드래그하여 순서를 변경할 수 있습니다</p>
              <draggable
                v-model="editForm.gamesOrder"
                item-key="type"
                handle=".game-drag-handle"
                animation="200"
                class="games-order-list"
              >
                <template #item="{ element }">
                  <div class="game-order-item">
                    <div class="game-drag-handle">
                      <span>⋮⋮</span>
                    </div>
                    <label class="checkbox-label-inline">
                      <input
                        type="checkbox"
                        :value="element.type"
                        v-model="editForm.enabledGames"
                      />
                      <span class="game-icon">{{ element.icon }}</span>
                      <span class="game-name">{{ element.name }}</span>
                    </label>
                  </div>
                </template>
              </draggable>
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

          <!-- Countdown Block Edit Form -->
          <template v-if="editingBlock.type === 'countdown'">
            <div class="form-group">
              <label class="form-label">제목</label>
              <input
                type="text"
                class="form-input"
                v-model="editForm.title"
                placeholder="이벤트 카운트다운"
              />
            </div>

            <div class="form-group">
              <label class="form-label">설명 (선택사항)</label>
              <textarea
                class="form-textarea"
                v-model="editForm.description"
                placeholder="이벤트 설명을 입력하세요"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">목표 날짜</label>
              <input
                type="datetime-local"
                class="form-input"
                v-model="editForm.targetDate"
              />
            </div>

            <div class="form-group">
              <label class="form-label">스타일</label>
              <select class="form-select" v-model="editForm.style">
                <option value="card">카드</option>
                <option value="minimal">미니멀</option>
                <option value="banner">배너</option>
              </select>
            </div>
          </template>

          <!-- Guestbook Block Edit Form -->
          <template v-if="editingBlock.type === 'guestbook'">
            <div class="form-group">
              <label class="form-label">제목</label>
              <input
                type="text"
                class="form-input"
                v-model="editForm.title"
                placeholder="방명록"
              />
            </div>

            <div class="form-group">
              <label class="form-label">최대 메시지 길이</label>
              <input
                type="number"
                class="form-input"
                v-model.number="editForm.maxMessageLength"
                min="50"
                max="500"
                placeholder="200"
              />
              <small class="form-hint">손글씨로 작성할 메시지의 최대 글자 수 (50-500자)</small>
            </div>

            <div class="form-group">
              <label class="form-label">텍스트 색상</label>
              <input
                type="color"
                class="form-input-color"
                v-model="editForm.textColor"
              />
              <small class="form-hint">방명록 텍스트의 색상을 선택하세요</small>
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

