<template>
  <div class="sidebar-ad-management">
    <div class="section-header">
      <h2>사이드 광고 관리</h2>
      <p class="section-desc">PC 화면 좌우에 표시되는 광고 이미지를 관리합니다.</p>
    </div>

    <!-- Add New Ad -->
    <div class="add-card" v-if="!isAdding">
      <button class="btn-add" @click="isAdding = true">
        <span class="btn-add-icon">+</span>
        새 광고 추가
      </button>
    </div>

    <!-- Add Form -->
    <div class="ad-form-card" v-if="isAdding">
      <h3>새 광고 추가</h3>

      <div class="form-group">
        <label>제목 (관리용)</label>
        <input v-model="form.title" placeholder="광고 제목" class="form-input" />
      </div>

      <div class="form-group">
        <label>이미지</label>
        <div
          class="upload-area"
          @click="triggerUpload"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <img v-if="form.imageUrl" :src="form.imageUrl" class="upload-preview" />
          <div v-else class="upload-placeholder">
            <div class="upload-icon">+</div>
            <p>클릭 또는 드래그로 이미지 업로드</p>
          </div>
        </div>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="handleFileSelect" />
      </div>

      <div class="form-group">
        <label>위치</label>
        <div class="position-select">
          <button
            v-for="pos in positions"
            :key="pos.value"
            class="position-btn"
            :class="{ active: form.position === pos.value }"
            @click="form.position = pos.value"
          >
            {{ pos.label }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>링크 URL (선택)</label>
        <input v-model="form.linkUrl" placeholder="https://..." class="form-input" />
      </div>

      <div class="form-group">
        <label>표시 순서</label>
        <input v-model.number="form.displayOrder" type="number" min="0" class="form-input form-input-sm" />
      </div>

      <div class="form-actions">
        <button class="btn-cancel" @click="cancelAdd">취소</button>
        <button class="btn-save" @click="saveAd" :disabled="saving || !form.imageUrl">
          {{ saving ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>

    <!-- Ad List -->
    <div class="ad-list" v-if="!loading">
      <div v-if="ads.length === 0 && !isAdding" class="empty-state">
        <p>등록된 광고가 없습니다.</p>
        <p class="empty-hint">새 광고를 추가하여 PC 화면 좌우에 광고를 표시하세요.</p>
      </div>

      <div v-for="ad in ads" :key="ad.id" class="ad-card" :class="{ inactive: !ad.isActive }">
        <div class="ad-card-image">
          <img :src="ad.imageUrl" :alt="ad.title || '광고'" />
          <span class="ad-position-badge">{{ positionLabel(ad.position) }}</span>
        </div>
        <div class="ad-card-info">
          <div class="ad-card-header">
            <h4>{{ ad.title || '(제목 없음)' }}</h4>
            <div class="ad-card-actions">
              <button
                class="btn-toggle"
                :class="{ on: ad.isActive }"
                @click="toggleAd(ad)"
                :title="ad.isActive ? '비활성화' : '활성화'"
              >
                {{ ad.isActive ? 'ON' : 'OFF' }}
              </button>
              <button class="btn-delete" @click="deleteAd(ad)" title="삭제">×</button>
            </div>
          </div>
          <p class="ad-link" v-if="ad.linkUrl">{{ ad.linkUrl }}</p>
          <span class="ad-order">순서: {{ ad.displayOrder }}</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <p>로딩 중...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getMasterAdminSidebarAds,
  createDefaultSidebarAd,
  deleteMasterAdminSidebarAd,
  toggleMasterAdminSidebarAd,
  type SidebarAd
} from '@/services/sidebarAdService'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ads = ref<SidebarAd[]>([])
const loading = ref(true)
const saving = ref(false)
const isAdding = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const positions = [
  { value: 'both', label: '양쪽' },
  { value: 'left', label: '왼쪽만' },
  { value: 'right', label: '오른쪽만' }
]

const form = ref({
  title: '',
  imageUrl: '',
  position: 'both',
  linkUrl: '',
  displayOrder: 0
})

function positionLabel(pos: string) {
  return positions.find(p => p.value === pos)?.label || pos
}

async function loadAds() {
  loading.value = true
  try {
    ads.value = await getMasterAdminSidebarAds()
  } catch (e) {
    console.error('Failed to load sidebar ads:', e)
  } finally {
    loading.value = false
  }
}

function triggerUpload() {
  fileInput.value?.click()
}

async function uploadImage(file: File): Promise<string | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const token = authStore.accessToken
    const response = await fetch(`${API_BASE_URL}/api/FileUpload/background`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    })

    if (!response.ok) throw new Error('Upload failed')
    const data = await response.json()
    return data.url || data.fileUrl || null
  } catch (e) {
    console.error('Image upload failed:', e)
    alert('이미지 업로드에 실패했습니다.')
    return null
  }
}

async function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const url = await uploadImage(file)
  if (url) form.value.imageUrl = url
  target.value = ''
}

async function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const url = await uploadImage(file)
  if (url) form.value.imageUrl = url
}

function cancelAdd() {
  isAdding.value = false
  resetForm()
}

function resetForm() {
  form.value = {
    title: '',
    imageUrl: '',
    position: 'both',
    linkUrl: '',
    displayOrder: 0
  }
}

async function saveAd() {
  if (!form.value.imageUrl || saving.value) return
  saving.value = true
  try {
    const request = {
      position: form.value.position,
      imageUrl: form.value.imageUrl,
      linkUrl: form.value.linkUrl || null,
      title: form.value.title || null,
      displayOrder: form.value.displayOrder
    }

    await createDefaultSidebarAd(request)

    isAdding.value = false
    resetForm()
    await loadAds()
  } catch (e) {
    console.error('Failed to save sidebar ad:', e)
    alert('저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

async function toggleAd(ad: SidebarAd) {
  try {
    await toggleMasterAdminSidebarAd(ad.id)
    await loadAds()
  } catch (e) {
    console.error('Failed to toggle sidebar ad:', e)
  }
}

async function deleteAd(ad: SidebarAd) {
  if (!confirm('이 광고를 삭제하시겠습니까?')) return
  try {
    await deleteMasterAdminSidebarAd(ad.id)
    await loadAds()
  } catch (e) {
    console.error('Failed to delete sidebar ad:', e)
  }
}

onMounted(() => {
  loadAds()
})
</script>

<style scoped>
.sidebar-ad-management {
  padding: 20px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.section-desc {
  font-size: 13px;
  color: #86868b;
}

.add-card {
  margin-bottom: 16px;
}

.btn-add {
  width: 100%;
  padding: 14px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #f0f7ff;
}

.btn-add-icon {
  font-size: 18px;
  font-weight: 700;
}

/* Form */
.ad-form-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.ad-form-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1d1d1f;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input-sm {
  max-width: 100px;
}

/* Upload */
.upload-area {
  height: 180px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: 0.2s;
  background: #f9fafb;
}

.upload-area:hover {
  border-color: #2563eb;
  background: #f0f7ff;
}

.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-placeholder {
  text-align: center;
  color: #9ca3af;
}

.upload-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #6b7280;
  margin: 0 auto 8px;
}

.upload-placeholder p {
  font-size: 13px;
}

/* Position Select */
.position-select {
  display: flex;
  gap: 8px;
}

.position-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  color: #374151;
}

.position-btn.active {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
}

.btn-save {
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Ad List */
.ad-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ad-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: 0.2s;
}

.ad-card.inactive {
  opacity: 0.5;
}

.ad-card-image {
  position: relative;
  height: 120px;
  overflow: hidden;
  background: #f3f4f6;
}

.ad-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ad-position-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 11px;
  border-radius: 4px;
}

.ad-card-info {
  padding: 12px;
}

.ad-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.ad-card-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.ad-card-actions {
  display: flex;
  gap: 6px;
}

.btn-toggle {
  padding: 3px 10px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  background: #e5e7eb;
  color: #6b7280;
}

.btn-toggle.on {
  background: #dcfce7;
  color: #16a34a;
}

.btn-delete {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ad-link {
  font-size: 12px;
  color: #2563eb;
  word-break: break-all;
  margin-bottom: 4px;
}

.ad-order {
  font-size: 11px;
  color: #9ca3af;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state p {
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 13px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}
</style>
