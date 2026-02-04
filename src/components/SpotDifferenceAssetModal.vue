<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2><IconBase name="search" :size="20" /> 틀린그림찾기 에셋 설정</h2>
        <button class="btn-close" @click="close">
          <IconBase name="close" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Tabs & Counter -->
        <div class="tabs-container">
          <div class="tabs">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'list' }"
              @click="activeTab = 'list'"
            >
              에셋 목록
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'create' }"
              @click="activeTab = 'create'"
              :disabled="totalAssets >= assetLimit"
            >
              새 에셋 만들기
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'bulk' }"
              @click="activeTab = 'bulk'"
              :disabled="totalAssets >= assetLimit"
            >
              <IconBase name="clone" :size="14" />
              다중 추가
            </button>
          </div>
          <div class="asset-counter" :class="{ full: totalAssets >= assetLimit }">
            {{ totalAssets }} / {{ assetLimit }} 세트
          </div>
        </div>

        <!-- List Tab -->
        <div v-if="activeTab === 'list'" class="tab-content">
          <!-- Loading -->
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>에셋을 불러오는 중...</p>
          </div>

          <!-- Empty -->
          <div v-else-if="assets.length === 0" class="empty-state">
            <div class="empty-icon"><IconBase name="image" :size="48" /></div>
            <p>등록된 틀린그림찾기 에셋이 없습니다.</p>
            <button class="btn-create" @click="activeTab = 'create'">
              새 에셋 만들기
            </button>
          </div>

          <!-- Asset List -->
          <div v-else class="asset-list-container">
            <!-- Selection Bar -->
            <div class="selection-bar" :class="{ active: selectedAssets.size > 0 }">
              <label class="select-all-checkbox">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="isPartiallySelected"
                  @change="toggleSelectAll"
                />
                <span>전체 선택</span>
              </label>
              <div v-if="selectedAssets.size > 0" class="selection-actions">
                <span class="selection-count">{{ selectedAssets.size }}개 선택됨</span>
                <button
                  class="btn-delete-selected"
                  @click="deleteSelectedAssets"
                  :disabled="isDeleting"
                >
                  <IconBase :name="isDeleting ? 'loader' : 'trash'" :size="14" />
                  {{ isDeleting ? '삭제 중...' : '선택 삭제' }}
                </button>
              </div>
            </div>

            <!-- Asset Cards -->
            <div class="asset-list">
              <div
                v-for="asset in assets"
                :key="asset.id"
                class="asset-card"
                :class="{ inactive: !asset.isActive, selected: selectedAssets.has(asset.id) }"
              >
                <label class="asset-checkbox" @click.stop>
                  <input
                    type="checkbox"
                    :checked="selectedAssets.has(asset.id)"
                    @change="toggleAssetSelection(asset.id)"
                  />
                </label>
                <div class="asset-images">
                  <div class="image-box">
                    <img :src="asset.originalImageUrl" alt="원본" />
                    <span class="image-label">원본</span>
                  </div>
                  <div class="image-box">
                    <img :src="asset.modifiedImageUrl" alt="차이점" />
                    <span class="image-label">차이점</span>
                  </div>
                </div>
                <div class="asset-info">
                  <div class="asset-name">{{ asset.name }}</div>
                  <div class="asset-meta">
                    <span>차이점 {{ asset.differences.length }}개</span>
                    <span>•</span>
                    <span>난이도 {{ ['쉬움', '보통', '어려움'][asset.difficulty - 1] }}</span>
                    <span>•</span>
                    <span>{{ asset.usageCount }}회 사용</span>
                  </div>
                </div>
                <div class="asset-actions">
                  <button
                    class="btn-toggle"
                    :class="{ active: asset.isActive }"
                    @click="toggleAsset(asset)"
                  >
                    {{ asset.isActive ? 'ON' : 'OFF' }}
                  </button>
                  <button class="btn-delete" @click="deleteAsset(asset.id)">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Tab -->
        <div v-if="activeTab === 'create'" class="tab-content">
          <div class="create-form">
            <!-- Image Size Recommendation -->
            <div class="size-recommendation">
              <div class="recommendation-icon">💡</div>
              <div class="recommendation-content">
                <strong>권장 이미지 크기</strong>
                <p>세로로 긴 이미지 권장 (9:16 비율, 예: 1080×1920px)</p>
                <p class="recommendation-note">모바일 화면에 최적화되며, 가로가 넓은 이미지는 좌우가 잘릴 수 있습니다.</p>
              </div>
            </div>

            <!-- Name -->
            <div class="form-group">
              <label class="form-label">에셋 이름</label>
              <input
                type="text"
                v-model="form.name"
                class="form-input"
                placeholder="예: 카페 인테리어"
              />
            </div>

            <!-- Images Side by Side -->
            <div class="images-row">
              <!-- Original Image -->
              <div class="image-upload-box">
                <label class="form-label">원본 이미지</label>
                <div
                  class="upload-area"
                  @click="triggerFileInput('original')"
                  @dragover.prevent
                  @drop.prevent="handleDrop($event, 'original')"
                >
                  <template v-if="form.originalImageUrl">
                    <img :src="form.originalImageUrl" alt="원본" ref="originalPreviewImg" @load="updateVisibleAreaOverlay('original')" />
                    <div class="visible-area-overlay" :style="originalVisibleAreaStyle">
                      <div class="visible-area-label">게임 화면</div>
                    </div>
                  </template>
                  <div v-else class="upload-placeholder">
                    <IconBase name="camera" :size="32" class="upload-icon-svg" />
                    <p>클릭 또는 드래그</p>
                  </div>
                </div>
                <input
                  ref="originalFileInput"
                  type="file"
                  accept="image/*"
                  hidden
                  @change="handleFileChange($event, 'original')"
                />
              </div>

              <!-- Modified Image -->
              <div class="image-upload-box">
                <label class="form-label">차이점 이미지</label>
                <div
                  class="upload-area"
                  @click="triggerFileInput('modified')"
                  @dragover.prevent
                  @drop.prevent="handleDrop($event, 'modified')"
                >
                  <template v-if="form.modifiedImageUrl">
                    <img :src="form.modifiedImageUrl" alt="차이점" ref="modifiedPreviewImg" @load="updateVisibleAreaOverlay('modified')" />
                    <div class="visible-area-overlay" :style="modifiedVisibleAreaStyle">
                      <div class="visible-area-label">게임 화면</div>
                    </div>
                  </template>
                  <div v-else class="upload-placeholder">
                    <IconBase name="image" :size="32" class="upload-icon-svg" />
                    <p>클릭 또는 드래그</p>
                  </div>
                </div>
                <input
                  ref="modifiedFileInput"
                  type="file"
                  accept="image/*"
                  hidden
                  @change="handleFileChange($event, 'modified')"
                />
              </div>
            </div>

            <!-- Auto Detection Button -->
            <div v-if="form.originalImageUrl && form.modifiedImageUrl" class="auto-detect-section">
              <button
                class="btn-auto-detect"
                @click="autoDetectDifferences"
                :disabled="isDetecting"
              >
                <IconBase :name="isDetecting ? 'loader' : 'sparkles'" :size="16" />
                {{ isDetecting ? '분석 중...' : '차이점 자동 감지' }}
              </button>
              <p class="auto-detect-hint">
                두 이미지를 비교하여 차이점을 자동으로 찾습니다.
              </p>
            </div>

            <!-- Difference Points Editor -->
            <div class="form-group">
              <label class="form-label">
                차이점 위치 ({{ form.differences.length }}개)
                <span v-if="form.differences.length > 0" class="label-hint">
                  - 클릭하여 삭제, 드래그하여 수정
                </span>
              </label>

              <!-- Preview Mode Toggle -->
              <div v-if="form.differences.length > 0" class="preview-toggle">
                <button
                  class="btn-preview"
                  :class="{ active: showPreview }"
                  @click="showPreview = !showPreview"
                >
                  <IconBase name="eye" :size="14" />
                  {{ showPreview ? '미리보기 ON' : '미리보기' }}
                </button>
              </div>

              <!-- Click Area -->
              <div v-if="form.modifiedImageUrl" class="difference-editor">
                <!-- Side by Side Preview -->
                <div v-if="showPreview && form.originalImageUrl" class="preview-container">
                  <div class="preview-image-box">
                    <span class="preview-label">원본</span>
                    <div class="preview-image-wrapper">
                      <img :src="form.originalImageUrl" alt="원본" />
                      <div
                        v-for="(point, idx) in form.differences"
                        :key="'orig-' + idx"
                        class="preview-marker"
                        :style="{
                          left: `${point.x * 100}%`,
                          top: `${point.y * 100}%`,
                          width: `${point.radius * 200}%`,
                          height: `${point.radius * 200}%`
                        }"
                      >
                        <span class="marker-number">{{ idx + 1 }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="preview-image-box">
                    <span class="preview-label">차이점</span>
                    <div class="preview-image-wrapper">
                      <img :src="form.modifiedImageUrl" alt="차이점" />
                      <div
                        v-for="(point, idx) in form.differences"
                        :key="'mod-' + idx"
                        class="preview-marker"
                        :style="{
                          left: `${point.x * 100}%`,
                          top: `${point.y * 100}%`,
                          width: `${point.radius * 200}%`,
                          height: `${point.radius * 200}%`
                        }"
                      >
                        <span class="marker-number">{{ idx + 1 }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Editor (when not in preview mode) -->
                <div v-else class="editor-image-container" ref="editorContainer">
                  <img
                    :src="form.modifiedImageUrl"
                    alt="차이점 지정"
                    ref="editorImage"
                    @click="addDifferencePoint"
                  />
                  <!-- Markers -->
                  <div
                    v-for="(point, idx) in form.differences"
                    :key="idx"
                    class="diff-marker"
                    :style="{
                      left: `${point.x * 100}%`,
                      top: `${point.y * 100}%`,
                      width: `${point.radius * 200}%`,
                      height: `${point.radius * 200}%`
                    }"
                    @click.stop="removeDifferencePoint(idx)"
                  >
                    <span class="marker-number">{{ idx + 1 }}</span>
                    <span class="marker-remove">×</span>
                  </div>
                </div>

                <div class="editor-controls">
                  <span v-if="!showPreview" class="editor-hint">
                    이미지를 클릭하여 차이점 추가
                  </span>
                  <button class="btn-clear-points" @click="form.differences = []" v-if="form.differences.length > 0">
                    모두 지우기
                  </button>
                </div>
              </div>
              <div v-else class="no-image-hint">
                이미지를 먼저 업로드하세요.
              </div>
            </div>

            <!-- Settings Row -->
            <div class="settings-row">
              <div class="form-group small">
                <label class="form-label">난이도</label>
                <select v-model="form.difficulty" class="form-select">
                  <option :value="1">쉬움</option>
                  <option :value="2">보통</option>
                  <option :value="3">어려움</option>
                </select>
              </div>
              <div class="form-group small">
                <label class="form-label">제한시간 (초)</label>
                <input
                  type="number"
                  v-model.number="form.timeLimit"
                  class="form-input"
                  min="0"
                  placeholder="0 = 무제한"
                />
              </div>
              <div class="form-group small">
                <label class="form-label">힌트 횟수</label>
                <input
                  type="number"
                  v-model.number="form.hintsAllowed"
                  class="form-input"
                  min="0"
                  max="10"
                />
              </div>
            </div>

            <!-- Create Button -->
            <button
              class="btn-submit"
              @click="createAsset"
              :disabled="!canSubmit || isCreating"
            >
              {{ isCreating ? '생성 중...' : '에셋 생성' }}
            </button>
          </div>
        </div>

        <!-- Bulk Upload Tab -->
        <div v-if="activeTab === 'bulk'" class="tab-content">
          <div class="bulk-upload-container">
            <!-- Instructions -->
            <div class="bulk-instructions">
              <h3><IconBase name="clone" :size="18" /> 다중 에셋 추가</h3>
              <p>여러 이미지 쌍을 한 번에 업로드하여 에셋을 생성합니다.</p>
              <ul>
                <li>원본 이미지와 차이점 이미지를 쌍으로 추가하세요</li>
                <li>각 쌍에 대해 자동 감지를 실행하거나 수동으로 차이점을 지정할 수 있습니다</li>
                <li>최대 {{ Math.min(10, assetLimit - totalAssets) }}개까지 한 번에 추가 가능</li>
                <li><strong>권장 크기:</strong> 세로로 긴 이미지 (9:16 비율, 예: 1080×1920px)</li>
              </ul>
            </div>

            <!-- Bulk Items List -->
            <div class="bulk-items-list">
              <div
                v-for="(item, index) in bulkItems"
                :key="index"
                class="bulk-item"
                :class="{ 'has-error': item.error, 'is-ready': item.isReady }"
              >
                <div class="bulk-item-header">
                  <span class="bulk-item-number">{{ index + 1 }}</span>
                  <input
                    type="text"
                    v-model="item.name"
                    class="bulk-item-name"
                    :placeholder="`에셋 ${index + 1}`"
                  />
                  <button class="btn-remove-item" @click="removeBulkItem(index)">
                    <IconBase name="close" :size="14" />
                  </button>
                </div>

                <div class="bulk-item-images">
                  <!-- Original Image -->
                  <div
                    class="bulk-upload-box"
                    @click="triggerBulkFileInput(index, 'original')"
                    @dragover.prevent
                    @drop.prevent="handleBulkDrop($event, index, 'original')"
                  >
                    <img v-if="item.originalImageUrl" :src="item.originalImageUrl" alt="원본" />
                    <div v-else class="bulk-placeholder">
                      <IconBase name="camera" :size="24" />
                      <span>원본</span>
                    </div>
                  </div>

                  <!-- Modified Image -->
                  <div
                    class="bulk-upload-box"
                    @click="triggerBulkFileInput(index, 'modified')"
                    @dragover.prevent
                    @drop.prevent="handleBulkDrop($event, index, 'modified')"
                  >
                    <img v-if="item.modifiedImageUrl" :src="item.modifiedImageUrl" alt="차이점" />
                    <div v-else class="bulk-placeholder">
                      <IconBase name="image" :size="24" />
                      <span>차이점</span>
                    </div>
                  </div>

                  <!-- Status / Actions -->
                  <div class="bulk-item-status">
                    <template v-if="item.isDetecting">
                      <IconBase name="loader" :size="16" />
                      <span>분석 중...</span>
                    </template>
                    <template v-else-if="item.differences.length > 0">
                      <span class="status-ready">
                        <IconBase name="check" :size="14" />
                        {{ item.differences.length }}개 감지
                      </span>
                    </template>
                    <template v-else-if="item.originalImageUrl && item.modifiedImageUrl">
                      <button class="btn-detect-single" @click="detectSingleItem(index)">
                        <IconBase name="sparkles" :size="14" />
                        감지
                      </button>
                    </template>
                    <template v-else>
                      <span class="status-pending">이미지 필요</span>
                    </template>
                  </div>
                </div>

                <div v-if="item.error" class="bulk-item-error">
                  {{ item.error }}
                </div>
              </div>

              <!-- Add More Button -->
              <button
                v-if="bulkItems.length < Math.min(10, assetLimit - totalAssets)"
                class="btn-add-bulk-item"
                @click="addBulkItem"
              >
                <IconBase name="plus" :size="20" />
                이미지 쌍 추가
              </button>
            </div>

            <!-- Hidden file inputs for bulk upload -->
            <input
              ref="bulkFileInput"
              type="file"
              accept="image/*"
              hidden
              @change="handleBulkFileChange"
            />

            <!-- Bulk Actions -->
            <div class="bulk-actions">
              <button
                class="btn-detect-all"
                @click="detectAllItems"
                :disabled="!canDetectAll || isBulkDetecting"
              >
                <IconBase :name="isBulkDetecting ? 'loader' : 'sparkles'" :size="16" />
                {{ isBulkDetecting ? '분석 중...' : '전체 자동 감지' }}
              </button>
              <button
                class="btn-create-all"
                @click="createAllAssets"
                :disabled="!canCreateAll || isBulkCreating"
              >
                <IconBase :name="isBulkCreating ? 'loader' : 'check'" :size="16" />
                {{ isBulkCreating ? `생성 중 (${bulkProgress}/${readyItemsCount})...` : `${readyItemsCount}개 에셋 생성` }}
              </button>
            </div>

            <!-- Progress Bar -->
            <div v-if="isBulkCreating" class="bulk-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${(bulkProgress / readyItemsCount) * 100}%` }"></div>
              </div>
              <span class="progress-text">{{ bulkProgress }} / {{ readyItemsCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="btn-secondary" @click="close">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'
import {
  getMySpotDifferenceAssets,
  createSpotDifferenceAsset,
  updateSpotDifferenceAsset,
  deleteSpotDifferenceAsset,
  type SpotDifferenceAsset,
  type DifferencePoint
} from '@/services/spotDifferenceService'
import { detectDifferences } from '@/utils/imageDiffDetector'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const authStore = useAuthStore()

// State
const activeTab = ref<'list' | 'create' | 'bulk'>('list')
const isLoading = ref(false)
const isCreating = ref(false)
const isDetecting = ref(false)
const showPreview = ref(false)
const assets = ref<SpotDifferenceAsset[]>([])
const assetLimit = ref(20)
const totalAssets = ref(0)

// Multi-select delete state
const selectedAssets = ref<Set<string>>(new Set())
const isDeleting = ref(false)

// Bulk upload state
interface BulkItem {
  name: string
  originalImageUrl: string
  modifiedImageUrl: string
  differences: DifferencePoint[]
  isDetecting: boolean
  isReady: boolean
  error: string
}

const bulkItems = ref<BulkItem[]>([])
const bulkFileInput = ref<HTMLInputElement | null>(null)
const currentBulkIndex = ref(-1)
const currentBulkType = ref<'original' | 'modified'>('original')
const isBulkDetecting = ref(false)
const isBulkCreating = ref(false)
const bulkProgress = ref(0)

// File inputs
const originalFileInput = ref<HTMLInputElement | null>(null)
const modifiedFileInput = ref<HTMLInputElement | null>(null)
const editorContainer = ref<HTMLDivElement | null>(null)
const editorImage = ref<HTMLImageElement | null>(null)
const originalPreviewImg = ref<HTMLImageElement | null>(null)
const modifiedPreviewImg = ref<HTMLImageElement | null>(null)

// Visible area overlay styles for game preview
const originalVisibleAreaStyle = ref<Record<string, string>>({})
const modifiedVisibleAreaStyle = ref<Record<string, string>>({})

// Game screen dimensions (mobile: 390x844 typical)
const GAME_SCREEN_WIDTH = 390
const GAME_SCREEN_HEIGHT = 844
const GAME_IMAGE_AREA_TOP = 90
const GAME_IMAGE_AREA_BOTTOM = 10
const GAME_IMAGE_GAP = 20
const GAME_PADDING = 12

// Calculate visible area overlay position
function updateVisibleAreaOverlay(type: 'original' | 'modified') {
  const imgRef = type === 'original' ? originalPreviewImg.value : modifiedPreviewImg.value
  const styleRef = type === 'original' ? originalVisibleAreaStyle : modifiedVisibleAreaStyle

  if (!imgRef) return

  // Get the actual displayed size in the preview container
  const containerWidth = 180 // upload-area width minus padding
  const containerHeight = 180 // upload-area height

  // Get the original image dimensions
  const imgNaturalWidth = imgRef.naturalWidth
  const imgNaturalHeight = imgRef.naturalHeight

  if (imgNaturalWidth === 0 || imgNaturalHeight === 0) return

  // Calculate how image is displayed in container (object-fit: contain)
  const containerAspect = containerWidth / containerHeight
  const imageAspect = imgNaturalWidth / imgNaturalHeight

  let displayedWidth: number
  let displayedHeight: number
  let offsetX: number
  let offsetY: number

  if (imageAspect > containerAspect) {
    // Image is wider - fit by width
    displayedWidth = containerWidth
    displayedHeight = containerWidth / imageAspect
    offsetX = 0
    offsetY = (containerHeight - displayedHeight) / 2
  } else {
    // Image is taller - fit by height
    displayedHeight = containerHeight
    displayedWidth = containerHeight * imageAspect
    offsetX = (containerWidth - displayedWidth) / 2
    offsetY = 0
  }

  // Calculate game's visible area ratio
  // Game uses: maxImageWidth = W - padding * 2, maxImageHeight = (H - 90 - 10 - 20) / 2
  const gameMaxWidth = GAME_SCREEN_WIDTH - GAME_PADDING * 2
  const gameMaxHeight = (GAME_SCREEN_HEIGHT - GAME_IMAGE_AREA_TOP - GAME_IMAGE_AREA_BOTTOM - GAME_IMAGE_GAP) / 2

  // How the game would scale this image
  const gameScaleByWidth = gameMaxWidth / imgNaturalWidth
  const gameScaleByHeight = gameMaxHeight / imgNaturalHeight
  const gameScale = Math.min(gameScaleByWidth, gameScaleByHeight)

  // The visible portion in original image coordinates
  const visibleWidth = Math.min(imgNaturalWidth, gameMaxWidth / gameScale)
  const visibleHeight = Math.min(imgNaturalHeight, gameMaxHeight / gameScale)

  // If image fits completely, no overlay needed (show full border)
  const fitsCompletely = gameScale === gameScaleByWidth && gameScale === gameScaleByHeight

  // Convert to preview display coordinates
  const scaleToDisplay = displayedWidth / imgNaturalWidth
  const overlayWidth = visibleWidth * scaleToDisplay
  const overlayHeight = visibleHeight * scaleToDisplay
  const overlayX = offsetX + (displayedWidth - overlayWidth) / 2
  const overlayY = offsetY + (displayedHeight - overlayHeight) / 2

  styleRef.value = {
    left: `${overlayX}px`,
    top: `${overlayY}px`,
    width: `${overlayWidth}px`,
    height: `${overlayHeight}px`,
    display: fitsCompletely ? 'none' : 'block'
  }
}

// Form
const form = ref({
  name: '',
  originalImageUrl: '',
  modifiedImageUrl: '',
  differences: [] as DifferencePoint[],
  difficulty: 2,
  timeLimit: 60,
  hintsAllowed: 3
})

const canSubmit = computed(() => {
  return (
    form.value.name.trim() !== '' &&
    form.value.originalImageUrl !== '' &&
    form.value.modifiedImageUrl !== '' &&
    form.value.differences.length > 0
  )
})

// Bulk computed
const readyItemsCount = computed(() => {
  return bulkItems.value.filter(item => item.isReady).length
})

const canDetectAll = computed(() => {
  return bulkItems.value.some(
    item => item.originalImageUrl && item.modifiedImageUrl && item.differences.length === 0
  )
})

const canCreateAll = computed(() => {
  return readyItemsCount.value > 0
})

// Multi-select computed
const isAllSelected = computed(() => {
  return assets.value.length > 0 && selectedAssets.value.size === assets.value.length
})

const isPartiallySelected = computed(() => {
  return selectedAssets.value.size > 0 && selectedAssets.value.size < assets.value.length
})

// Watch for modal open
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    activeTab.value = 'list'
    resetForm()
    resetBulkItems()
    await loadAssets()
  }
})

const loadAssets = async () => {
  isLoading.value = true
  try {
    const token = authStore.accessToken
    if (!token) return

    const result = await getMySpotDifferenceAssets(token)
    assets.value = result.assets
    totalAssets.value = result.total
    assetLimit.value = result.limit
  } catch (error) {
    console.error('Failed to load assets:', error)
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    originalImageUrl: '',
    modifiedImageUrl: '',
    differences: [],
    difficulty: 2,
    timeLimit: 60,
    hintsAllowed: 3
  }
}

const triggerFileInput = (type: 'original' | 'modified') => {
  if (type === 'original') {
    originalFileInput.value?.click()
  } else {
    modifiedFileInput.value?.click()
  }
}

const handleFileChange = (event: Event, type: 'original' | 'modified') => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (type === 'original') {
        form.value.originalImageUrl = dataUrl
      } else {
        form.value.modifiedImageUrl = dataUrl
        // Clear existing points when new image is uploaded
        form.value.differences = []
      }
    }
    reader.readAsDataURL(file)
    target.value = ''
  }
}

const handleDrop = (event: DragEvent, type: 'original' | 'modified') => {
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    const file = files[0]
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (type === 'original') {
        form.value.originalImageUrl = dataUrl
      } else {
        form.value.modifiedImageUrl = dataUrl
        form.value.differences = []
      }
    }
    reader.readAsDataURL(file)
  }
}

const addDifferencePoint = (event: MouseEvent) => {
  if (!editorImage.value) return

  const rect = editorImage.value.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height

  // Clamp values
  const clampedX = Math.max(0, Math.min(1, x))
  const clampedY = Math.max(0, Math.min(1, y))

  form.value.differences.push({
    x: clampedX,
    y: clampedY,
    radius: 0.05 // Default radius (5% of image size)
  })
}

const removeDifferencePoint = (index: number) => {
  form.value.differences.splice(index, 1)
}

const autoDetectDifferences = async () => {
  if (!form.value.originalImageUrl || !form.value.modifiedImageUrl) {
    alert('원본 이미지와 차이점 이미지를 먼저 업로드하세요.')
    return
  }

  isDetecting.value = true
  try {
    const detected = await detectDifferences(
      form.value.originalImageUrl,
      form.value.modifiedImageUrl,
      {
        threshold: 25,       // 픽셀 차이 임계값
        minGroupSize: 50,    // 최소 그룹 크기
        maxDifferences: 10,  // 최대 차이점 개수
        radiusPadding: 1.8   // 반경 패딩
      }
    )

    if (detected.length === 0) {
      alert('차이점을 찾을 수 없습니다. 두 이미지가 동일하거나 차이가 너무 작습니다.')
      return
    }

    form.value.differences = detected
    showPreview.value = true
    alert(`${detected.length}개의 차이점을 자동으로 감지했습니다. 미리보기에서 확인하세요.`)
  } catch (error) {
    console.error('Auto detection failed:', error)
    alert('차이점 감지 중 오류가 발생했습니다.')
  } finally {
    isDetecting.value = false
  }
}

const createAsset = async () => {
  if (!canSubmit.value) return

  isCreating.value = true
  try {
    const token = authStore.accessToken
    if (!token) {
      alert('인증이 필요합니다.')
      return
    }

    const result = await createSpotDifferenceAsset(token, {
      name: form.value.name,
      originalImageUrl: form.value.originalImageUrl,
      modifiedImageUrl: form.value.modifiedImageUrl,
      differences: form.value.differences,
      difficulty: form.value.difficulty,
      timeLimit: form.value.timeLimit,
      hintsAllowed: form.value.hintsAllowed
    })

    if (result) {
      alert('에셋이 생성되었습니다!')
      resetForm()
      activeTab.value = 'list'
      await loadAssets()
      emit('saved')
    } else {
      alert('에셋 생성에 실패했습니다.')
    }
  } catch (error) {
    console.error('Failed to create asset:', error)
    alert('에셋 생성 중 오류가 발생했습니다.')
  } finally {
    isCreating.value = false
  }
}

const toggleAsset = async (asset: SpotDifferenceAsset) => {
  try {
    const token = authStore.accessToken
    if (!token) return

    const success = await updateSpotDifferenceAsset(token, asset.id, {
      isActive: !asset.isActive
    })

    if (success) {
      asset.isActive = !asset.isActive
    }
  } catch (error) {
    console.error('Failed to toggle asset:', error)
  }
}

const deleteAsset = async (assetId: string) => {
  if (!confirm('이 에셋을 삭제하시겠습니까?')) return

  try {
    const token = authStore.accessToken
    if (!token) return

    const success = await deleteSpotDifferenceAsset(token, assetId)
    if (success) {
      assets.value = assets.value.filter(a => a.id !== assetId)
      selectedAssets.value.delete(assetId)
    }
  } catch (error) {
    console.error('Failed to delete asset:', error)
  }
}

// ==================== Multi-Select Functions ====================

const toggleAssetSelection = (assetId: string) => {
  if (selectedAssets.value.has(assetId)) {
    selectedAssets.value.delete(assetId)
  } else {
    selectedAssets.value.add(assetId)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedAssets.value.clear()
  } else {
    assets.value.forEach(asset => {
      selectedAssets.value.add(asset.id)
    })
  }
}

const deleteSelectedAssets = async () => {
  const count = selectedAssets.value.size
  if (count === 0) return

  if (!confirm(`선택한 ${count}개의 에셋을 삭제하시겠습니까?`)) return

  isDeleting.value = true
  try {
    const token = authStore.accessToken
    if (!token) return

    const idsToDelete = Array.from(selectedAssets.value)
    let deletedCount = 0

    for (const assetId of idsToDelete) {
      try {
        const success = await deleteSpotDifferenceAsset(token, assetId)
        if (success) {
          assets.value = assets.value.filter(a => a.id !== assetId)
          selectedAssets.value.delete(assetId)
          deletedCount++
        }
      } catch (error) {
        console.error(`Failed to delete asset ${assetId}:`, error)
      }
    }

    if (deletedCount > 0) {
      totalAssets.value -= deletedCount
      alert(`${deletedCount}개의 에셋이 삭제되었습니다.`)
    }
  } catch (error) {
    console.error('Failed to delete selected assets:', error)
  } finally {
    isDeleting.value = false
  }
}

const close = () => {
  emit('close')
}

// ==================== Bulk Upload Functions ====================

const resetBulkItems = () => {
  bulkItems.value = []
  addBulkItem() // Start with one empty item
  addBulkItem() // Add second item
  bulkProgress.value = 0
}

const createEmptyBulkItem = (): BulkItem => ({
  name: '',
  originalImageUrl: '',
  modifiedImageUrl: '',
  differences: [],
  isDetecting: false,
  isReady: false,
  error: ''
})

const addBulkItem = () => {
  const maxItems = Math.min(10, assetLimit.value - totalAssets.value)
  if (bulkItems.value.length < maxItems) {
    bulkItems.value.push(createEmptyBulkItem())
  }
}

const removeBulkItem = (index: number) => {
  bulkItems.value.splice(index, 1)
  if (bulkItems.value.length === 0) {
    addBulkItem()
  }
}

const triggerBulkFileInput = (index: number, type: 'original' | 'modified') => {
  currentBulkIndex.value = index
  currentBulkType.value = type
  bulkFileInput.value?.click()
}

const handleBulkFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    processBulkFile(file, currentBulkIndex.value, currentBulkType.value)
    target.value = ''
  }
}

const handleBulkDrop = (event: DragEvent, index: number, type: 'original' | 'modified') => {
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    const file = files[0]
    if (!file.type.startsWith('image/')) return
    processBulkFile(file, index, type)
  }
}

const processBulkFile = (file: File, index: number, type: 'original' | 'modified') => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    const item = bulkItems.value[index]
    if (!item) return

    if (type === 'original') {
      item.originalImageUrl = dataUrl
    } else {
      item.modifiedImageUrl = dataUrl
      // Clear differences when modified image changes
      item.differences = []
      item.isReady = false
    }
    item.error = ''
    updateBulkItemReadyState(index)
  }
  reader.readAsDataURL(file)
}

const updateBulkItemReadyState = (index: number) => {
  const item = bulkItems.value[index]
  if (!item) return

  item.isReady = !!(
    item.originalImageUrl &&
    item.modifiedImageUrl &&
    item.differences.length > 0
  )
}

const detectSingleItem = async (index: number) => {
  const item = bulkItems.value[index]
  if (!item || !item.originalImageUrl || !item.modifiedImageUrl) return

  item.isDetecting = true
  item.error = ''

  try {
    const detected = await detectDifferences(
      item.originalImageUrl,
      item.modifiedImageUrl,
      {
        threshold: 25,
        minGroupSize: 50,
        maxDifferences: 10,
        radiusPadding: 1.8
      }
    )

    if (detected.length === 0) {
      item.error = '차이점을 찾을 수 없습니다'
      item.differences = []
    } else {
      item.differences = detected
    }
    updateBulkItemReadyState(index)
  } catch (error) {
    item.error = '감지 실패'
    console.error('Detection failed for item', index, error)
  } finally {
    item.isDetecting = false
  }
}

const detectAllItems = async () => {
  isBulkDetecting.value = true

  for (let i = 0; i < bulkItems.value.length; i++) {
    const item = bulkItems.value[i]
    if (item && item.originalImageUrl && item.modifiedImageUrl && item.differences.length === 0) {
      await detectSingleItem(i)
    }
  }

  isBulkDetecting.value = false
}

const createAllAssets = async () => {
  const readyItems = bulkItems.value.filter(item => item.isReady)
  if (readyItems.length === 0) return

  isBulkCreating.value = true
  bulkProgress.value = 0

  const token = authStore.accessToken
  if (!token) {
    alert('인증이 필요합니다.')
    isBulkCreating.value = false
    return
  }

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < bulkItems.value.length; i++) {
    const item = bulkItems.value[i]
    if (!item || !item.isReady) continue

    try {
      const result = await createSpotDifferenceAsset(token, {
        name: item.name || `에셋 ${i + 1}`,
        originalImageUrl: item.originalImageUrl,
        modifiedImageUrl: item.modifiedImageUrl,
        differences: item.differences,
        difficulty: 2,
        timeLimit: 60,
        hintsAllowed: 3
      })

      if (result) {
        successCount++
        // Mark as created by clearing ready state
        item.isReady = false
        item.originalImageUrl = ''
        item.modifiedImageUrl = ''
        item.differences = []
        item.name = ''
      } else {
        failCount++
        item.error = '생성 실패'
      }
    } catch (error) {
      failCount++
      item.error = '생성 중 오류'
      console.error('Failed to create asset', i, error)
    }

    bulkProgress.value++
  }

  isBulkCreating.value = false

  if (successCount > 0) {
    alert(`${successCount}개 에셋이 생성되었습니다.${failCount > 0 ? ` (${failCount}개 실패)` : ''}`)
    await loadAssets()
    emit('saved')

    // Clean up empty items and add new ones
    bulkItems.value = bulkItems.value.filter(
      item => item.originalImageUrl || item.modifiedImageUrl
    )
    if (bulkItems.value.length === 0) {
      addBulkItem()
      addBulkItem()
    }
  } else {
    alert('에셋 생성에 실패했습니다.')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.modal-card {
  background: white;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5ea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f5f5f7;
  color: #86868b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e5ea;
  color: #1d1d1f;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Tabs */
.tabs-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e5ea;
  padding-bottom: 12px;
}

.tabs {
  display: flex;
  gap: 8px;
}

.asset-counter {
  font-size: 14px;
  font-weight: 600;
  color: #86868b;
  padding: 6px 12px;
  background: #f5f5f7;
  border-radius: 20px;
}

.asset-counter.full {
  background: #fee2e2;
  color: #ef4444;
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: #f5f5f7;
  color: #86868b;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e5e5ea;
  color: #1d1d1f;
}

.tab-btn.active {
  background: #0071e3;
  color: white;
}

/* Loading / Empty */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #86868b;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e5ea;
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #1d1d1f;
}

.btn-create {
  padding: 10px 24px;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Asset List Container */
.asset-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Selection Bar */
.selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #f5f5f7;
  border-radius: 10px;
  transition: all 0.2s;
}

.selection-bar.active {
  background: #e8f4fd;
  border: 1px solid #0071e3;
}

.select-all-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.select-all-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #0071e3;
  cursor: pointer;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selection-count {
  font-size: 14px;
  font-weight: 600;
  color: #0071e3;
}

.btn-delete-selected {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #ff3b30;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete-selected:hover:not(:disabled) {
  background: #e0332b;
}

.btn-delete-selected:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Asset List */
.asset-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.asset-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  transition: all 0.2s;
}

.asset-card.selected {
  border-color: #0071e3;
  background: #f0f7ff;
}

.asset-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.asset-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #0071e3;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
}

.asset-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.asset-card.inactive {
  opacity: 0.6;
  background: #f9f9fa;
}

.asset-images {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.image-box {
  position: relative;
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f7;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-label {
  position: absolute;
  bottom: 2px;
  left: 2px;
  font-size: 9px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
}

.asset-info {
  flex: 1;
  min-width: 0;
}

.asset-name {
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.asset-meta {
  font-size: 12px;
  color: #86868b;
  display: flex;
  gap: 6px;
}

.asset-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-toggle {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: #e5e5ea;
  color: #86868b;
}

.btn-toggle.active {
  background: #10b981;
  color: white;
}

.btn-delete {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: #fee2e2;
  color: #ef4444;
}

.btn-delete:hover {
  background: #fecaca;
}

/* Create Form */
.create-form {
  max-width: 700px;
  margin: 0 auto;
}

/* Image Size Recommendation */
.size-recommendation {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
  border: 1px solid #fcd34d;
  border-radius: 12px;
  margin-bottom: 20px;
}

.recommendation-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.recommendation-content {
  flex: 1;
}

.recommendation-content strong {
  font-size: 14px;
  color: #92400e;
  display: block;
  margin-bottom: 4px;
}

.recommendation-content p {
  font-size: 13px;
  color: #a16207;
  margin: 0;
  line-height: 1.4;
}

.recommendation-content .recommendation-note {
  font-size: 12px;
  color: #b45309;
  margin-top: 4px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group.small {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.form-hint {
  font-size: 13px;
  color: #86868b;
  margin: 0 0 12px 0;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  color: #1d1d1f;
  background: white;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
}

/* Images Row */
.images-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.image-upload-box {
  flex: 1;
}

.upload-area {
  position: relative;
  height: 180px;
  border: 2px dashed #d2d2d7;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #0071e3;
  background: #f0f7ff;
}

.upload-area img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Visible area overlay for game preview */
.visible-area-overlay {
  position: absolute;
  border: 2px solid #10b981;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.1);
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
}

.visible-area-label {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.upload-placeholder {
  text-align: center;
  color: #86868b;
}

.upload-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.upload-placeholder p {
  font-size: 13px;
  margin: 0;
}

/* Difference Editor */
.difference-editor {
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  overflow: hidden;
}

.editor-image-container {
  position: relative;
  background: #1d1d1f;
  display: flex;
  justify-content: center;
}

.editor-image-container img {
  max-width: 100%;
  max-height: 400px;
  cursor: crosshair;
  display: block;
}

.diff-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  border: 3px solid #ef4444;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.2);
  transition: all 0.2s;
}

.diff-marker:hover {
  background: rgba(239, 68, 68, 0.4);
}

.marker-number {
  font-size: 14px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.marker-remove {
  display: none;
  font-size: 18px;
  color: white;
}

.diff-marker:hover .marker-number {
  display: none;
}

.diff-marker:hover .marker-remove {
  display: block;
}

.editor-controls {
  padding: 12px;
  background: #f5f5f7;
  display: flex;
  justify-content: flex-end;
}

.btn-clear-points {
  padding: 8px 16px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.no-image-hint {
  padding: 40px;
  text-align: center;
  color: #86868b;
  background: #f5f5f7;
  border-radius: 12px;
}

/* Auto Detect Section */
.auto-detect-section {
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  border-radius: 12px;
  border: 1px solid #cce5ff;
  text-align: center;
}

.btn-auto-detect {
  padding: 12px 24px;
  background: linear-gradient(135deg, #0071e3 0%, #0077ed 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
}

.btn-auto-detect:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.4);
}

.btn-auto-detect:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.auto-detect-hint {
  font-size: 12px;
  color: #5a9cff;
  margin: 8px 0 0 0;
}

/* Preview Toggle */
.preview-toggle {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-end;
}

.btn-preview {
  padding: 8px 16px;
  border: 1px solid #d2d2d7;
  background: white;
  color: #86868b;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview:hover {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-preview.active {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

/* Preview Container */
.preview-container {
  display: flex;
  gap: 16px;
  background: #1d1d1f;
  border-radius: 12px 12px 0 0;
  padding: 16px;
}

.preview-image-box {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-label {
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-align: center;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.preview-image-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2d2d2f;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image-wrapper img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.preview-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  border: 2px solid #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.2);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
}

.preview-marker .marker-number {
  font-size: 12px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Editor Hint */
.editor-hint {
  font-size: 13px;
  color: #86868b;
  margin-right: auto;
}

.label-hint {
  font-weight: 400;
  color: #86868b;
  font-size: 12px;
}

/* Settings Row */
.settings-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

/* Submit Button */
.btn-submit {
  width: 100%;
  padding: 14px;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #0077ed;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Footer */
.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e5ea;
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 12px 24px;
  border-radius: 10px;
  border: 1px solid #d2d2d7;
  background: white;
  color: #1d1d1f;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f5f5f7;
}

/* ==================== Bulk Upload Styles ==================== */
.bulk-upload-container {
  max-width: 800px;
  margin: 0 auto;
}

.bulk-instructions {
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  border: 1px solid #cce5ff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.bulk-instructions h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-instructions p {
  font-size: 14px;
  color: #424245;
  margin: 0 0 12px 0;
}

.bulk-instructions ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #86868b;
}

.bulk-instructions li {
  margin-bottom: 4px;
}

.bulk-items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.bulk-item {
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  padding: 16px;
  background: white;
  transition: all 0.2s;
}

.bulk-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.bulk-item.has-error {
  border-color: #fecaca;
  background: #fef2f2;
}

.bulk-item.is-ready {
  border-color: #86efac;
  background: #f0fdf4;
}

.bulk-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.bulk-item-number {
  width: 28px;
  height: 28px;
  background: #0071e3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.bulk-item.is-ready .bulk-item-number {
  background: #10b981;
}

.bulk-item-name {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  color: #1d1d1f;
  outline: none;
}

.bulk-item-name:focus {
  border-color: #0071e3;
}

.btn-remove-item {
  width: 28px;
  height: 28px;
  border: none;
  background: #f5f5f7;
  color: #86868b;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-item:hover {
  background: #fee2e2;
  color: #ef4444;
}

.bulk-item-images {
  display: flex;
  gap: 12px;
  align-items: center;
}

.bulk-upload-box {
  width: 120px;
  height: 90px;
  border: 2px dashed #d2d2d7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
  overflow: hidden;
  flex-shrink: 0;
}

.bulk-upload-box:hover {
  border-color: #0071e3;
  background: #f0f7ff;
}

.bulk-upload-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bulk-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #86868b;
}

.bulk-placeholder span {
  font-size: 11px;
  font-weight: 600;
}

.bulk-item-status {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #86868b;
}

.status-ready {
  color: #10b981;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-pending {
  color: #86868b;
}

.btn-detect-single {
  padding: 8px 16px;
  background: linear-gradient(135deg, #0071e3 0%, #0077ed 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-detect-single:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
}

.bulk-item-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 6px;
  font-size: 12px;
  color: #ef4444;
}

.btn-add-bulk-item {
  width: 100%;
  padding: 16px;
  border: 2px dashed #d2d2d7;
  border-radius: 12px;
  background: transparent;
  color: #86868b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-add-bulk-item:hover {
  border-color: #0071e3;
  color: #0071e3;
  background: #f0f7ff;
}

.bulk-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-detect-all,
.btn-create-all {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-detect-all {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-detect-all:hover:not(:disabled) {
  background: #e5e5ea;
}

.btn-create-all {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-create-all:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-detect-all:disabled,
.btn-create-all:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.bulk-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e5ea;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 13px;
  font-weight: 600;
  color: #86868b;
  min-width: 60px;
  text-align: right;
}

/* Responsive */
@media (max-width: 600px) {
  .images-row {
    flex-direction: column;
  }

  .settings-row {
    flex-direction: column;
  }

  .asset-card {
    flex-direction: column;
    align-items: stretch;
  }

  .asset-images {
    justify-content: center;
  }

  .asset-actions {
    justify-content: flex-end;
  }

  .bulk-item-images {
    flex-wrap: wrap;
  }

  .bulk-upload-box {
    width: calc(50% - 6px);
  }

  .bulk-item-status {
    width: 100%;
    margin-top: 12px;
    justify-content: flex-start;
  }

  .bulk-actions {
    flex-direction: column;
  }

  .tabs {
    flex-wrap: wrap;
  }
}
</style>
