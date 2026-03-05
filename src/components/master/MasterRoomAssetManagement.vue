<template>
  <div class="room-asset-management">
    <div class="section-header">
      <h2>룸 에셋 관리</h2>
      <p class="section-desc">유저가 제출한 공간 사진을 확인하고, 아이소메트릭 에셋을 제작하여 부여합니다.</p>
    </div>

    <!-- 탭 전환 -->
    <div class="tab-bar">
      <button :class="{ active: viewTab === 'pending' }" @click="viewTab = 'pending'">
        대기중 요청 <span v-if="pendingAssets.length" class="badge">{{ pendingAssets.length }}</span>
      </button>
      <button :class="{ active: viewTab === 'all' }" @click="viewTab = 'all'">전체 에셋</button>
    </div>

    <!-- 대기중 요청 -->
    <div v-if="viewTab === 'pending'">
      <div v-if="isLoading" class="loading-state">불러오는 중...</div>
      <div v-else-if="pendingAssets.length === 0" class="empty-state">대기중인 요청이 없습니다.</div>
      <div v-else class="asset-grid">
        <div v-for="asset in pendingAssets" :key="asset.id" class="asset-card pending-card">
          <div class="card-header">
            <img v-if="asset.userProfileImage" :src="asset.userProfileImage" class="user-avatar" />
            <div v-else class="user-avatar placeholder">{{ asset.userNickname?.charAt(0) || '?' }}</div>
            <div class="user-info">
              <span class="user-name">{{ asset.userNickname }}</span>
              <span class="date">{{ formatDate(asset.createdAt) }}</span>
            </div>
          </div>
          <div class="source-photo">
            <img :src="asset.sourcePhotoUrl" alt="원본 사진" @click="openPreview(asset.sourcePhotoUrl!)" />
          </div>
          <div class="card-actions">
            <div class="upload-section">
              <input
                :id="'asset-file-' + asset.id"
                type="file"
                accept="image/*"
                class="hidden-input"
                @change="(e: Event) => onAssetFileSelected(e, asset)"
              />
              <input
                v-model="assetNames[asset.id]"
                type="text"
                placeholder="에셋 이름 (선택)"
                class="form-input asset-name-input"
              />
              <button class="btn btn-primary" @click="triggerAssetUpload(asset.id)">
                에셋 업로드 & 완료
              </button>
            </div>
            <button class="btn btn-danger-text" @click="handleDelete(asset.id)">삭제</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 전체 에셋 -->
    <div v-if="viewTab === 'all'">
      <div v-if="isLoading" class="loading-state">불러오는 중...</div>
      <div v-else-if="allAssets.length === 0" class="empty-state">에셋이 없습니다.</div>
      <div v-else class="asset-grid">
        <div v-for="asset in allAssets" :key="asset.id" class="asset-card" :class="{ completed: asset.status === 'completed' }">
          <div class="card-header">
            <img v-if="asset.userProfileImage" :src="asset.userProfileImage" class="user-avatar" />
            <div v-else class="user-avatar placeholder">{{ asset.userNickname?.charAt(0) || '?' }}</div>
            <div class="user-info">
              <span class="user-name">{{ asset.userNickname }}</span>
              <span class="status-badge" :class="asset.status">
                {{ asset.status === 'completed' ? '완료' : '대기중' }}
              </span>
            </div>
          </div>
          <div class="asset-images">
            <div v-if="asset.sourcePhotoUrl" class="image-box">
              <span class="image-label">원본</span>
              <img :src="asset.sourcePhotoUrl" alt="원본" @click="openPreview(asset.sourcePhotoUrl!)" />
            </div>
            <div v-if="asset.assetImageUrl" class="image-box">
              <span class="image-label">에셋</span>
              <div class="hex-preview">
                <img :src="asset.assetImageUrl" alt="에셋" @click="openPreview(asset.assetImageUrl!)" />
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span v-if="asset.assetName" class="asset-name">{{ asset.assetName }}</span>
            <span v-if="asset.isSelected" class="selected-badge">선택됨</span>
            <button class="btn btn-danger-text btn-sm" @click="handleDelete(asset.id)">삭제</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 이미지 프리뷰 모달 -->
    <Teleport to="body">
      <div v-if="previewUrl" class="preview-overlay" @click="previewUrl = null">
        <img :src="previewUrl" class="preview-image" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  type RoomAssetAdmin,
  getPendingRoomAssets,
  getAllRoomAssets,
  completeRoomAsset,
  deleteRoomAsset,
} from '@/services/roomService'

const viewTab = ref<'pending' | 'all'>('pending')
const pendingAssets = ref<RoomAssetAdmin[]>([])
const allAssets = ref<RoomAssetAdmin[]>([])
const isLoading = ref(false)
const assetNames = ref<Record<string, string>>({})
const previewUrl = ref<string | null>(null)

onMounted(() => {
  loadAssets()
})

async function loadAssets() {
  isLoading.value = true
  try {
    const [pending, all] = await Promise.all([getPendingRoomAssets(), getAllRoomAssets()])
    pendingAssets.value = pending
    allAssets.value = all
  } catch (e) {
    console.error('Failed to load room assets:', e)
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function openPreview(url: string) {
  previewUrl.value = url
}

function triggerAssetUpload(assetId: string) {
  document.getElementById('asset-file-' + assetId)?.click()
}

async function onAssetFileSelected(e: Event, asset: RoomAssetAdmin) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    await completeRoomAsset(asset.id, file, assetNames.value[asset.id] || '')
    alert('에셋이 완성되었습니다!')
    await loadAssets()
  } catch (err) {
    console.error('Failed to complete asset:', err)
    alert('에셋 완성에 실패했습니다.')
  } finally {
    input.value = ''
  }
}

async function handleDelete(assetId: string) {
  if (!confirm('이 에셋을 삭제하시겠습니까?')) return
  try {
    await deleteRoomAsset(assetId)
    await loadAssets()
  } catch (err) {
    console.error('Failed to delete asset:', err)
    alert('삭제에 실패했습니다.')
  }
}
</script>

<style scoped>
.room-asset-management {
  max-width: 1200px;
}

.section-header h2 {
  font-size: 28px;
  font-weight: 800;
  color: #1d1d1f;
  margin: 0 0 6px 0;
}
.section-desc {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 24px 0;
}

.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.tab-bar button {
  padding: 8px 20px;
  border-radius: 20px;
  border: 1.5px solid #e5e5e7;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #86868b;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-bar button.active {
  background: #1d1d1f;
  color: white;
  border-color: #1d1d1f;
}
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #ff3b30;
  color: white;
  font-size: 11px;
  font-weight: 700;
  margin-left: 4px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
  font-size: 15px;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.asset-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.asset-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 12px;
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.user-avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e5e7;
  color: #86868b;
  font-size: 14px;
  font-weight: 700;
}
.user-info {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}
.date {
  font-size: 12px;
  color: #86868b;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 8px;
  width: fit-content;
}
.status-badge.completed {
  background: #e8f5e9;
  color: #2e7d32;
}
.status-badge.pending {
  background: #fff3e0;
  color: #e65100;
}

.source-photo {
  padding: 0 16px;
}
.source-photo img {
  width: 100%;
  border-radius: 10px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.source-photo img:hover {
  opacity: 0.85;
}

.card-actions {
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hidden-input {
  display: none;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1.5px solid #e5e5e7;
  border-radius: 10px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #0071e3;
}

.btn {
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-primary {
  background: #0071e3;
  color: white;
}
.btn-primary:hover {
  background: #0077ed;
}
.btn-danger-text {
  background: none;
  color: #ff3b30;
  padding: 4px 8px;
}
.btn-danger-text:hover {
  background: #fff5f5;
}
.btn-sm {
  font-size: 12px;
  padding: 4px 10px;
}

.asset-images {
  display: flex;
  gap: 12px;
  padding: 0 16px 12px;
}
.image-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.image-label {
  font-size: 11px;
  font-weight: 600;
  color: #86868b;
}
.image-box img {
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.image-box img:hover {
  opacity: 0.85;
}

.hex-preview {
  background: #f5f5f7;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hex-preview img {
  width: 100%;
  border-radius: 4px;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 14px;
  border-top: 1px solid #f0f0f2;
}
.asset-name {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
  flex: 1;
}
.selected-badge {
  font-size: 11px;
  font-weight: 700;
  color: #0071e3;
  background: #e8f0fe;
  padding: 2px 8px;
  border-radius: 8px;
}

.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  cursor: pointer;
}
.preview-image {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 12px;
  object-fit: contain;
}

@media (max-width: 768px) {
  .asset-grid {
    grid-template-columns: 1fr;
  }
}
</style>
