<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2>{{ gameLabel }} 에셋 설정</h2>
        <button class="btn-close" @click="close">
          <IconBase name="close" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Info Banner -->
        <div class="info-banner">
          <IconBase name="info" class="info-icon" />
          <p>게임에서 사용할 이미지를 선택하세요. 선택한 이미지가 게임 카드로 표시됩니다.</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>에셋을 불러오는 중...</p>
        </div>

        <!-- No Assets -->
        <div v-else-if="assets.length === 0" class="empty-state">
          <IconBase name="image" class="empty-icon" />
          <p>등록된 에셋이 없습니다.</p>
          <span class="empty-hint">SuperAdmin에게 에셋 등록을 요청하세요.</span>
        </div>

        <!-- Asset Grid -->
        <div v-else class="asset-grid">
          <div
            v-for="asset in assets"
            :key="asset.id"
            class="asset-item"
            :class="{ selected: selectedIds.includes(asset.id) }"
            @click="toggleAsset(asset.id)"
          >
            <div class="asset-checkbox">
              <IconBase v-if="selectedIds.includes(asset.id)" name="check" />
            </div>
            <div class="asset-preview">
              <img v-if="asset.imageUrl" :src="asset.imageUrl" :alt="asset.name" />
              <div v-else class="no-image">
                <IconBase name="image" />
              </div>
            </div>
            <div class="asset-name">{{ asset.name }}</div>
            <div class="asset-category">{{ asset.category }}</div>
          </div>
        </div>

        <!-- Selection Info -->
        <div v-if="assets.length > 0" class="selection-info">
          <span class="selected-count">{{ selectedIds.length }}개 선택됨</span>
          <button v-if="selectedIds.length > 0" class="btn-clear" @click="clearSelection">
            선택 초기화
          </button>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="btn-secondary" @click="close">취소</button>
        <button class="btn-primary" @click="save" :disabled="isSaving">
          {{ isSaving ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'
import {
  getSuperAdminAssets,
  selectGameAssets,
  getGameTypeLabel,
  type AdminAsset
} from '@/services/adminAssetService'

const props = defineProps<{
  isOpen: boolean
  gameId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const authStore = useAuthStore()

const isLoading = ref(false)
const isSaving = ref(false)
const assets = ref<AdminAsset[]>([])
const selectedIds = ref<string[]>([])

const gameLabel = computed(() => {
  const labels: Record<string, string> = {
    'memory': '같은 카드 찾기',
    'spot-difference': '틀린 그림 찾기',
    'pinball': '핀볼',
    'brick-breaker': '벽돌깨기'
  }
  return labels[props.gameId] || props.gameId
})

const gameType = computed(() => getGameTypeLabel(props.gameId))

// Watch for modal open
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    await loadAssets()
  }
})

const loadAssets = async () => {
  isLoading.value = true
  selectedIds.value = []

  try {
    const token = authStore.accessToken
    if (!token) {
      console.error('No access token')
      return
    }

    const result = await getSuperAdminAssets(token, gameType.value)
    assets.value = result.assets

    // Mark already selected assets
    selectedIds.value = result.assets
      .filter(a => a.isSelected)
      .map(a => a.id)
  } catch (error) {
    console.error('Failed to load assets:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleAsset = (assetId: string) => {
  const idx = selectedIds.value.indexOf(assetId)
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(assetId)
  }
}

const clearSelection = () => {
  selectedIds.value = []
}

const close = () => {
  emit('close')
}

const save = async () => {
  isSaving.value = true

  try {
    const token = authStore.accessToken
    if (!token) {
      alert('인증이 필요합니다.')
      return
    }

    const result = await selectGameAssets(token, gameType.value, selectedIds.value)

    if (result.success) {
      emit('saved')
      emit('close')
    } else {
      alert(result.message)
    }
  } catch (error) {
    console.error('Failed to save:', error)
    alert('저장에 실패했습니다.')
  } finally {
    isSaving.value = false
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
  max-width: 800px;
  max-height: 85vh;
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

.info-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #e8f2ff;
  border-radius: 12px;
  margin-bottom: 24px;
}

.info-icon {
  width: 20px;
  height: 20px;
  color: #0071e3;
  flex-shrink: 0;
}

.info-banner p {
  font-size: 14px;
  color: #0071e3;
  margin: 0;
}

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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #d2d2d7;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #aeaeb2;
}

/* Asset Grid */
.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.asset-item {
  position: relative;
  border: 2px solid #e5e5ea;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.asset-item:hover {
  border-color: #d2d2d7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.asset-item.selected {
  border-color: #0071e3;
  background: #f0f7ff;
}

.asset-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #d2d2d7;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.asset-item.selected .asset-checkbox {
  border-color: #0071e3;
  background: #0071e3;
  color: white;
}

.asset-preview {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f7;
  margin-bottom: 8px;
}

.asset-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d2d2d7;
}

.asset-name {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.asset-category {
  font-size: 11px;
  color: #86868b;
}

/* Selection Info */
.selection-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e5ea;
}

.selected-count {
  font-size: 14px;
  font-weight: 600;
  color: #0071e3;
}

.btn-clear {
  font-size: 13px;
  color: #86868b;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.btn-clear:hover {
  color: #1d1d1f;
}

/* Modal Footer */
.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e5ea;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.btn-primary {
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  background: #0071e3;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: #0077ed;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 600px) {
  .modal-card {
    max-height: 90vh;
  }

  .asset-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .modal-header h2 {
    font-size: 18px;
  }
}
</style>
