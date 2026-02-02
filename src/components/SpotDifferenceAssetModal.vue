<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2>🔍 틀린그림찾기 에셋 설정</h2>
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
            <div class="empty-icon">🖼️</div>
            <p>등록된 틀린그림찾기 에셋이 없습니다.</p>
            <button class="btn-create" @click="activeTab = 'create'">
              새 에셋 만들기
            </button>
          </div>

          <!-- Asset List -->
          <div v-else class="asset-list">
            <div
              v-for="asset in assets"
              :key="asset.id"
              class="asset-card"
              :class="{ inactive: !asset.isActive }"
            >
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

        <!-- Create Tab -->
        <div v-if="activeTab === 'create'" class="tab-content">
          <div class="create-form">
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
                  <img v-if="form.originalImageUrl" :src="form.originalImageUrl" alt="원본" />
                  <div v-else class="upload-placeholder">
                    <span class="upload-icon">📷</span>
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
                  <img v-if="form.modifiedImageUrl" :src="form.modifiedImageUrl" alt="차이점" />
                  <div v-else class="upload-placeholder">
                    <span class="upload-icon">🖼️</span>
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

            <!-- Difference Points Editor -->
            <div class="form-group">
              <label class="form-label">
                차이점 위치 지정 ({{ form.differences.length }}개)
              </label>
              <p class="form-hint">
                차이점 이미지를 클릭하여 차이점 위치를 지정하세요.
              </p>

              <!-- Click Area -->
              <div v-if="form.modifiedImageUrl" class="difference-editor">
                <div class="editor-image-container" ref="editorContainer">
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
                  <button class="btn-clear-points" @click="form.differences = []">
                    모두 지우기
                  </button>
                </div>
              </div>
              <div v-else class="no-image-hint">
                차이점 이미지를 먼저 업로드하세요.
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

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const authStore = useAuthStore()

// State
const activeTab = ref<'list' | 'create'>('list')
const isLoading = ref(false)
const isCreating = ref(false)
const assets = ref<SpotDifferenceAsset[]>([])
const assetLimit = ref(20)
const totalAssets = ref(0)

// File inputs
const originalFileInput = ref<HTMLInputElement | null>(null)
const modifiedFileInput = ref<HTMLInputElement | null>(null)
const editorContainer = ref<HTMLDivElement | null>(null)
const editorImage = ref<HTMLImageElement | null>(null)

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

// Watch for modal open
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    activeTab.value = 'list'
    resetForm()
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
    }
  } catch (error) {
    console.error('Failed to delete asset:', error)
  }
}

const close = () => {
  emit('close')
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
}
</style>
