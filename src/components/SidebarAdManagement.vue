<template>
  <div class="sidebar-ad-management">
    <div class="section-header">
      <h2>사이드 광고 관리</h2>
      <p class="section-desc">PC 화면 좌우에 표시되는 광고 이미지를 페이지별로 관리합니다.</p>
    </div>

    <!-- Scope Selector: 글로벌 / 매장별 -->
    <div class="scope-selector">
      <button
        class="scope-btn"
        :class="{ active: scope === 'global' }"
        @click="switchScope('global')"
      >
        글로벌 기본
      </button>
      <button
        class="scope-btn"
        :class="{ active: scope === 'store' }"
        @click="switchScope('store')"
      >
        매장별 관리
      </button>
    </div>

    <!-- Store Selector (매장별일 때만) -->
    <div v-if="scope === 'store'" class="store-selector">
      <select v-model="selectedStoreId" class="store-select" @change="onStoreChange">
        <option value="">매장 선택...</option>
        <option v-for="store in stores" :key="store.id" :value="store.id">
          {{ store.name }} ({{ store.code }}) - 광고 {{ store.adCount }}개
        </option>
      </select>
    </div>

    <!-- Section Tabs -->
    <div class="section-tabs">
      <button
        v-for="sec in sections"
        :key="sec.value"
        class="section-tab"
        :class="{ active: activeSection === sec.value }"
        @click="switchSection(sec.value)"
      >
        {{ sec.label }}
        <span class="tab-count" v-if="sectionCounts[sec.value]">{{ sectionCounts[sec.value] }}</span>
      </button>
    </div>

    <!-- Add New Ad -->
    <div class="add-card" v-if="!isAdding && canManage">
      <button class="btn-add" @click="startAdding">
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

      <div class="form-row">
        <div class="form-group form-group-half">
          <label>페이지 섹션</label>
          <select v-model="form.pageSection" class="form-input">
            <option v-for="sec in sections" :key="sec.value" :value="sec.value">
              {{ sec.label }}
            </option>
          </select>
        </div>

        <div class="form-group form-group-half">
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
      </div>

      <div class="form-group">
        <label>링크 URL (선택)</label>
        <input v-model="form.linkUrl" placeholder="https://..." class="form-input" />
      </div>

      <div class="form-actions">
        <button class="btn-cancel" @click="cancelAdd">취소</button>
        <button class="btn-save" @click="saveAd" :disabled="saving || !form.imageUrl">
          {{ saving ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>

    <!-- Ad List with drag sort -->
    <div class="ad-list" v-if="!loading">
      <div v-if="filteredAds.length === 0 && !isAdding" class="empty-state">
        <p>{{ activeSection === 'all' ? '등록된 광고가 없습니다.' : `'${activeSectionLabel}' 섹션에 등록된 광고가 없습니다.` }}</p>
        <p class="empty-hint" v-if="canManage">새 광고를 추가하여 PC 화면 좌우에 광고를 표시하세요.</p>
      </div>

      <div
        v-for="(ad, index) in filteredAds"
        :key="ad.id"
        class="ad-card"
        :class="{ inactive: !ad.isActive, dragging: dragIndex === index }"
        draggable="true"
        @dragstart="onDragStart(index, $event)"
        @dragover.prevent="onDragOver(index)"
        @dragend="onDragEnd"
      >
        <div class="ad-card-drag-handle" title="드래그하여 순서 변경">
          <span class="drag-dots">⋮⋮</span>
        </div>
        <div class="ad-card-image">
          <img :src="ad.imageUrl" :alt="ad.title || '광고'" />
          <div class="ad-badges">
            <span class="ad-position-badge">{{ positionLabel(ad.position) }}</span>
            <span class="ad-section-badge" v-if="ad.pageSection !== 'all'">{{ sectionLabel(ad.pageSection) }}</span>
          </div>
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
          <div class="ad-meta">
            <span class="ad-order">순서: {{ ad.displayOrder }}</span>
            <span class="ad-store" v-if="ad.qrCodeName">매장: {{ ad.qrCodeName }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <p>로딩 중...</p>
    </div>

    <!-- Preview Panel -->
    <div class="preview-panel" v-if="filteredAds.length > 0">
      <h3 class="preview-title">미리보기</h3>
      <div class="preview-container">
        <div class="preview-sidebar preview-left">
          <div v-for="ad in previewLeftAds" :key="ad.id" class="preview-ad-item">
            <img :src="ad.imageUrl" :alt="ad.title || '광고'" />
          </div>
          <div v-if="previewLeftAds.length === 0" class="preview-empty">
            <span>광고 없음</span>
          </div>
        </div>
        <div class="preview-mobile">
          <div class="preview-mobile-header">
            <span>{{ activeSectionLabel }}</span>
          </div>
          <div class="preview-mobile-body">
            <span class="preview-mobile-text">모바일 화면 (480px)</span>
          </div>
        </div>
        <div class="preview-sidebar preview-right">
          <div v-for="ad in previewRightAds" :key="ad.id" class="preview-ad-item">
            <img :src="ad.imageUrl" :alt="ad.title || '광고'" />
          </div>
          <div v-if="previewRightAds.length === 0" class="preview-empty">
            <span>광고 없음</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  getMasterAdminSidebarAds,
  getStoreSidebarAds,
  createSidebarAd,
  deleteSidebarAd as deleteSidebarAdApi,
  toggleSidebarAd as toggleSidebarAdApi,
  reorderSidebarAds,
  getStoresForAds,
  PAGE_SECTIONS,
  type SidebarAd,
  type StoreInfo
} from '@/services/sidebarAdService'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ads = ref<SidebarAd[]>([])
const stores = ref<StoreInfo[]>([])
const loading = ref(true)
const saving = ref(false)
const isAdding = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Scope: global or store
const scope = ref<'global' | 'store'>('global')
const selectedStoreId = ref('')

// Section filter
const activeSection = ref('all')
const sections = PAGE_SECTIONS

// Drag state
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const positions = [
  { value: 'both', label: '양쪽' },
  { value: 'left', label: '왼쪽' },
  { value: 'right', label: '오른쪽' }
]

const form = ref({
  title: '',
  imageUrl: '',
  pageSection: 'all',
  position: 'both',
  linkUrl: ''
})

const canManage = computed(() => {
  return scope.value === 'global' || selectedStoreId.value
})

const activeSectionLabel = computed(() => {
  return sections.find(s => s.value === activeSection.value)?.label || activeSection.value
})

// Filter ads by active section tab
const filteredAds = computed(() => {
  if (activeSection.value === 'all') {
    return ads.value
  }
  return ads.value.filter(ad => ad.pageSection === activeSection.value || ad.pageSection === 'all')
})

// Count ads per section
const sectionCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const sec of sections) {
    if (sec.value === 'all') {
      counts[sec.value] = ads.value.length
    } else {
      counts[sec.value] = ads.value.filter(a => a.pageSection === sec.value || a.pageSection === 'all').length
    }
  }
  return counts
})

// Preview computed
const previewLeftAds = computed(() => {
  return filteredAds.value.filter(ad => ad.isActive && (ad.position === 'left' || ad.position === 'both'))
})

const previewRightAds = computed(() => {
  return filteredAds.value.filter(ad => ad.isActive && (ad.position === 'right' || ad.position === 'both'))
})

function positionLabel(pos: string) {
  return positions.find(p => p.value === pos)?.label || pos
}

function sectionLabel(sec: string) {
  return sections.find(s => s.value === sec)?.label || sec
}

async function loadAds() {
  loading.value = true
  try {
    if (scope.value === 'store' && selectedStoreId.value) {
      ads.value = await getStoreSidebarAds(selectedStoreId.value)
    } else {
      ads.value = await getMasterAdminSidebarAds()
    }
  } catch (e) {
    console.error('Failed to load sidebar ads:', e)
  } finally {
    loading.value = false
  }
}

async function loadStores() {
  try {
    stores.value = await getStoresForAds()
  } catch (e) {
    console.error('Failed to load stores:', e)
  }
}

function switchScope(newScope: 'global' | 'store') {
  scope.value = newScope
  if (newScope === 'global') {
    selectedStoreId.value = ''
  }
  loadAds()
}

function onStoreChange() {
  if (selectedStoreId.value) {
    loadAds()
  }
}

function switchSection(section: string) {
  activeSection.value = section
}

function startAdding() {
  isAdding.value = true
  form.value.pageSection = activeSection.value === 'all' ? 'all' : activeSection.value
}

function triggerUpload() {
  fileInput.value?.click()
}

async function uploadImage(file: File): Promise<string | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/FileUpload/background`, {
      method: 'POST',
      credentials: 'include',
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
    pageSection: 'all',
    position: 'both',
    linkUrl: ''
  }
}

async function saveAd() {
  if (!form.value.imageUrl || saving.value) return
  saving.value = true
  try {
    const request = {
      qrCodeId: scope.value === 'store' ? selectedStoreId.value : null,
      pageSection: form.value.pageSection,
      position: form.value.position,
      imageUrl: form.value.imageUrl,
      linkUrl: form.value.linkUrl || null,
      title: form.value.title || null,
      displayOrder: ads.value.length // append to end
    }

    await createSidebarAd(request)

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
    await toggleSidebarAdApi(ad.id)
    await loadAds()
  } catch (e) {
    console.error('Failed to toggle sidebar ad:', e)
  }
}

async function deleteAd(ad: SidebarAd) {
  if (!confirm('이 광고를 삭제하시겠습니까?')) return
  try {
    await deleteSidebarAdApi(ad.id)
    await loadAds()
  } catch (e) {
    console.error('Failed to delete sidebar ad:', e)
  }
}

// Drag and drop reorder
function onDragStart(index: number, e: DragEvent) {
  dragIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(index: number) {
  if (dragIndex.value === null || dragIndex.value === index) return
  dragOverIndex.value = index

  const list = [...filteredAds.value]
  const dragItem = list[dragIndex.value]
  if (!dragItem) return
  list.splice(dragIndex.value, 1)
  list.splice(index, 0, dragItem)

  // Update the main ads array order
  const draggedIds = new Set(list.map(a => a.id))
  const otherAds = ads.value.filter(a => !draggedIds.has(a.id))
  ads.value = [...list, ...otherAds]

  dragIndex.value = index
}

async function onDragEnd() {
  if (dragIndex.value !== null) {
    // Save new order
    const ids = filteredAds.value.map(a => a.id)
    try {
      await reorderSidebarAds(ids)
    } catch (e) {
      console.error('Failed to reorder:', e)
      await loadAds() // Reload on failure
    }
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

onMounted(() => {
  loadAds()
  loadStores()
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

/* Scope Selector */
.scope-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.scope-btn {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.scope-btn.active {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

/* Store Selector */
.store-selector {
  margin-bottom: 16px;
}

.store-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 10px center;
  background-repeat: no-repeat;
  background-size: 20px;
}

.store-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Section Tabs */
.section-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}

.section-tabs::-webkit-scrollbar {
  display: none;
}

.section-tab {
  white-space: nowrap;
  padding: 7px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.section-tab.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.tab-count {
  background: #e5e7eb;
  color: #6b7280;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.section-tab.active .tab-count {
  background: #dbeafe;
  color: #2563eb;
}

/* Add */
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

.form-row {
  display: flex;
  gap: 12px;
}

.form-group-half {
  flex: 1;
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
  gap: 6px;
}

.position-btn {
  padding: 8px 12px;
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
  gap: 10px;
}

.ad-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  display: flex;
}

.ad-card.inactive {
  opacity: 0.5;
}

.ad-card.dragging {
  opacity: 0.6;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.ad-card-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  min-width: 32px;
  background: #f9fafb;
  cursor: grab;
  color: #9ca3af;
  font-size: 14px;
  border-right: 1px solid #e5e7eb;
  user-select: none;
}

.ad-card-drag-handle:active {
  cursor: grabbing;
}

.drag-dots {
  letter-spacing: 2px;
  line-height: 1;
}

.ad-card-image {
  position: relative;
  width: 100px;
  min-width: 100px;
  height: 80px;
  overflow: hidden;
  background: #f3f4f6;
}

.ad-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ad-badges {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ad-position-badge,
.ad-section-badge {
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  border-radius: 3px;
  text-align: center;
}

.ad-section-badge {
  background: rgba(37, 99, 235, 0.8);
}

.ad-card-info {
  flex: 1;
  padding: 10px 12px;
  min-width: 0;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ad-card-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
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
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ad-meta {
  display: flex;
  gap: 10px;
}

.ad-order,
.ad-store {
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

/* Preview Panel */
.preview-panel {
  margin-top: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #f9fafb;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.preview-container {
  display: flex;
  gap: 8px;
  min-height: 200px;
}

.preview-sidebar {
  flex: 1;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  overflow-y: auto;
  max-height: 300px;
}

.preview-ad-item {
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
}

.preview-ad-item img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  font-size: 12px;
}

.preview-mobile {
  width: 140px;
  min-width: 140px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: -1px 0 0 #e2e8f0, 1px 0 0 #e2e8f0;
  overflow: hidden;
}

.preview-mobile-header {
  padding: 8px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}

.preview-mobile-body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: #94a3b8;
}

.preview-mobile-text {
  font-size: 11px;
}
</style>
