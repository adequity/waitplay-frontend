<template>
  <div class="village-theme-management">
    <div class="section-header">
      <div class="header-row">
        <div>
          <h2>빌리지 테마 관리</h2>
          <p class="section-desc">유저가 선택할 수 있는 빌리지 배경 테마를 관리합니다.</p>
        </div>
        <button class="btn btn-primary" @click="openCreateModal">+ 새 테마 추가</button>
      </div>
    </div>

    <!-- 탭 전환 -->
    <div class="tab-bar">
      <button :class="{ active: viewTab === 'all' }" @click="viewTab = 'all'">
        전체 <span class="badge-count">{{ themes.length }}</span>
      </button>
      <button :class="{ active: viewTab === 'color' }" @click="viewTab = 'color'">
        컬러 <span class="badge-count">{{ colorThemes.length }}</span>
      </button>
      <button :class="{ active: viewTab === 'image' }" @click="viewTab = 'image'">
        이미지 <span class="badge-count">{{ imageThemes.length }}</span>
      </button>
    </div>

    <!-- 테마 목록 -->
    <div v-if="isLoading" class="loading-state">불러오는 중...</div>
    <div v-else-if="filteredThemes.length === 0" class="empty-state">테마가 없습니다.</div>
    <div v-else class="theme-grid">
      <div
        v-for="(theme, idx) in filteredThemes"
        :key="theme.id"
        class="theme-card"
        :class="{ inactive: !theme.isActive }"
        draggable="true"
        @dragstart="onDragStart(idx, $event)"
        @dragover.prevent="onDragOver(idx)"
        @drop="onDrop(idx)"
        @dragend="onDragEnd"
      >
        <!-- 프리뷰 -->
        <div class="theme-preview">
          <div
            v-if="theme.themeType === 'color'"
            class="color-swatch"
            :style="{ background: theme.colorValue || '#FFFFFF' }"
          >
            <span class="swatch-key">{{ theme.themeKey }}</span>
          </div>
          <div v-else class="image-preview-wrapper">
            <img
              v-if="theme.imageUrl"
              :src="theme.imageUrl"
              class="image-preview"
              :style="{ backgroundColor: theme.bgColor || '#FFFFFF' }"
              @click="previewUrl = theme.imageUrl"
            />
            <div v-else class="image-placeholder">이미지 없음</div>
          </div>
        </div>

        <!-- 정보 -->
        <div class="theme-info">
          <div class="theme-name-row">
            <span class="theme-display-name">{{ theme.displayName }}</span>
            <span class="theme-type-badge" :class="theme.themeType">
              {{ theme.themeType === 'color' ? '컬러' : '이미지' }}
            </span>
          </div>
          <div class="theme-meta">
            <span class="theme-key-label">{{ theme.themeKey }}</span>
            <span v-if="theme.themeType === 'color'" class="theme-color-value">{{ theme.colorValue }}</span>
            <span class="theme-order">#{{ theme.sortOrder }}</span>
          </div>
        </div>

        <!-- 액션 -->
        <div class="theme-actions">
          <button
            class="btn-toggle"
            :class="{ active: theme.isActive }"
            @click="handleToggle(theme)"
            :title="theme.isActive ? '비활성화' : '활성화'"
          >
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </button>
          <button class="btn-icon" @click="openEditModal(theme)" title="수정">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-icon-danger" @click="handleDelete(theme)" title="삭제">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 생성/수정 모달 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <h3>{{ editingTheme ? '테마 수정' : '새 테마 추가' }}</h3>

          <!-- 타입 선택 (생성 시만) -->
          <div v-if="!editingTheme" class="form-group">
            <label class="form-label">테마 타입</label>
            <div class="type-selector">
              <button
                :class="{ active: modalForm.themeType === 'color' }"
                @click="modalForm.themeType = 'color'"
              >컬러</button>
              <button
                :class="{ active: modalForm.themeType === 'image' }"
                @click="modalForm.themeType = 'image'"
              >이미지</button>
            </div>
          </div>

          <!-- 공통 필드 -->
          <div v-if="!editingTheme" class="form-group">
            <label class="form-label">테마 키 (영문/숫자)</label>
            <input v-model="modalForm.themeKey" type="text" class="form-input" placeholder="예: ocean, sunset" />
          </div>
          <div class="form-group">
            <label class="form-label">표시 이름</label>
            <input v-model="modalForm.displayName" type="text" class="form-input" placeholder="예: 오션, 석양" />
          </div>

          <!-- 컬러 테마 필드 -->
          <div v-if="modalForm.themeType === 'color'" class="form-group">
            <label class="form-label">색상 값</label>
            <div class="color-input-row">
              <input
                v-model="modalForm.colorValue"
                type="text"
                class="form-input"
                placeholder="#FFFFFF"
              />
              <input
                type="color"
                :value="modalForm.colorValue || '#FFFFFF'"
                @input="modalForm.colorValue = ($event.target as HTMLInputElement).value"
                class="color-picker"
              />
              <div class="color-preview-box" :style="{ background: modalForm.colorValue || '#FFFFFF' }"></div>
            </div>
          </div>

          <!-- 이미지 테마 필드 -->
          <template v-if="modalForm.themeType === 'image'">
            <div class="form-group">
              <label class="form-label">배경 이미지</label>
              <div class="file-upload-area" @click="fileInput?.click()">
                <img v-if="modalFilePreview" :src="modalFilePreview" class="upload-preview" />
                <img v-else-if="editingTheme?.imageUrl" :src="editingTheme.imageUrl" class="upload-preview" />
                <div v-else class="upload-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#86868b" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span>PNG 또는 WebP 파일 선택</span>
                </div>
              </div>
              <input ref="fileInput" type="file" accept="image/png,image/webp,image/jpeg" class="hidden-input" @change="onModalFileSelected" />
            </div>
            <div class="form-group">
              <label class="form-label">로딩 배경색</label>
              <div class="color-input-row">
                <input v-model="modalForm.bgColor" type="text" class="form-input" placeholder="#87CEEB" />
                <input
                  type="color"
                  :value="modalForm.bgColor || '#87CEEB'"
                  @input="modalForm.bgColor = ($event.target as HTMLInputElement).value"
                  class="color-picker"
                />
                <div class="color-preview-box" :style="{ background: modalForm.bgColor || '#87CEEB' }"></div>
              </div>
            </div>
          </template>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click="closeModal">취소</button>
            <button class="btn btn-primary" @click="handleSave" :disabled="isSaving">
              {{ isSaving ? '저장 중...' : (editingTheme ? '수정' : '추가') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 이미지 프리뷰 모달 -->
    <Teleport to="body">
      <div v-if="previewUrl" class="preview-overlay" @click="previewUrl = null">
        <img :src="previewUrl" class="preview-image" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  type VillageThemeDTO,
  getAllVillageThemes,
  createVillageTheme,
  updateVillageTheme,
  toggleVillageTheme,
  deleteVillageTheme,
  reorderVillageThemes,
} from '@/services/villageThemeService'

const viewTab = ref<'all' | 'color' | 'image'>('all')
const themes = ref<VillageThemeDTO[]>([])
const isLoading = ref(false)
const previewUrl = ref<string | null>(null)

// Modal state
const showModal = ref(false)
const editingTheme = ref<VillageThemeDTO | null>(null)
const isSaving = ref(false)
const modalForm = ref({
  themeKey: '',
  displayName: '',
  themeType: 'color' as 'color' | 'image',
  colorValue: '',
  bgColor: '',
})
const modalFile = ref<File | null>(null)
const modalFilePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Drag state
const dragIdx = ref<number | null>(null)
const dragOverIdx = ref<number | null>(null)

const colorThemes = computed(() => themes.value.filter(t => t.themeType === 'color'))
const imageThemes = computed(() => themes.value.filter(t => t.themeType === 'image'))
const filteredThemes = computed(() => {
  if (viewTab.value === 'color') return colorThemes.value
  if (viewTab.value === 'image') return imageThemes.value
  return themes.value
})

onMounted(() => loadThemes())

async function loadThemes() {
  isLoading.value = true
  try {
    themes.value = await getAllVillageThemes()
  } catch (e) {
    console.error('Failed to load village themes:', e)
  } finally {
    isLoading.value = false
  }
}

// === Modal ===

function openCreateModal() {
  editingTheme.value = null
  modalForm.value = { themeKey: '', displayName: '', themeType: 'color', colorValue: '#FFFFFF', bgColor: '#87CEEB' }
  modalFile.value = null
  modalFilePreview.value = null
  showModal.value = true
}

function openEditModal(theme: VillageThemeDTO) {
  editingTheme.value = theme
  modalForm.value = {
    themeKey: theme.themeKey,
    displayName: theme.displayName,
    themeType: theme.themeType,
    colorValue: theme.colorValue || '',
    bgColor: theme.bgColor || '',
  }
  modalFile.value = null
  modalFilePreview.value = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingTheme.value = null
  modalFile.value = null
  modalFilePreview.value = null
}

function onModalFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  modalFile.value = file
  modalFilePreview.value = URL.createObjectURL(file)
  input.value = ''
}

async function handleSave() {
  if (!modalForm.value.displayName.trim()) {
    alert('표시 이름을 입력해주세요.')
    return
  }
  if (!editingTheme.value && !modalForm.value.themeKey.trim()) {
    alert('테마 키를 입력해주세요.')
    return
  }

  isSaving.value = true
  try {
    if (editingTheme.value) {
      await updateVillageTheme(
        editingTheme.value.id,
        {
          displayName: modalForm.value.displayName,
          colorValue: modalForm.value.colorValue || undefined,
          bgColor: modalForm.value.bgColor || undefined,
        },
        modalFile.value || undefined,
      )
    } else {
      if (modalForm.value.themeType === 'image' && !modalFile.value) {
        alert('이미지 파일을 선택해주세요.')
        isSaving.value = false
        return
      }
      await createVillageTheme(
        {
          themeKey: modalForm.value.themeKey,
          displayName: modalForm.value.displayName,
          themeType: modalForm.value.themeType,
          colorValue: modalForm.value.colorValue || undefined,
          bgColor: modalForm.value.bgColor || undefined,
        },
        modalFile.value || undefined,
      )
    }
    closeModal()
    await loadThemes()
  } catch (err: any) {
    console.error('Failed to save theme:', err)
    alert(err?.response?.data?.message || '저장에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}

// === Actions ===

async function handleToggle(theme: VillageThemeDTO) {
  try {
    await toggleVillageTheme(theme.id)
    await loadThemes()
  } catch (err) {
    console.error('Failed to toggle theme:', err)
    alert('상태 변경에 실패했습니다.')
  }
}

async function handleDelete(theme: VillageThemeDTO) {
  if (!confirm(`"${theme.displayName}" 테마를 삭제하시겠습니까?`)) return
  try {
    await deleteVillageTheme(theme.id)
    await loadThemes()
  } catch (err) {
    console.error('Failed to delete theme:', err)
    alert('삭제에 실패했습니다.')
  }
}

// === Drag & Drop Reorder ===

function onDragStart(idx: number, e: DragEvent) {
  dragIdx.value = idx
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(idx: number) {
  dragOverIdx.value = idx
}

async function onDrop(idx: number) {
  if (dragIdx.value === null || dragIdx.value === idx) return
  const list = [...filteredThemes.value]
  const removed = list.splice(dragIdx.value, 1)
  if (!removed[0]) return
  list.splice(idx, 0, removed[0])

  const items = list.map((t, i) => ({ id: t.id, sortOrder: i }))
  try {
    await reorderVillageThemes(items)
    await loadThemes()
  } catch (err) {
    console.error('Failed to reorder:', err)
  }
}

function onDragEnd() {
  dragIdx.value = null
  dragOverIdx.value = null
}
</script>

<style scoped>
.village-theme-management {
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
  margin: 0;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
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
.badge-count {
  font-size: 12px;
  opacity: 0.7;
  margin-left: 2px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
  font-size: 15px;
}

/* Theme Grid */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.theme-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  transition: all 0.2s;
  cursor: grab;
}
.theme-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.theme-card.inactive {
  opacity: 0.5;
}
.theme-card:active {
  cursor: grabbing;
}

/* Preview */
.theme-preview {
  height: 120px;
  overflow: hidden;
}
.color-swatch {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 8px 12px;
  border: 1px solid rgba(0,0,0,0.06);
}
.swatch-key {
  font-size: 11px;
  font-weight: 600;
  color: rgba(0,0,0,0.3);
  background: rgba(255,255,255,0.7);
  padding: 2px 8px;
  border-radius: 6px;
}
.image-preview-wrapper {
  width: 100%;
  height: 100%;
}
.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}
.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
  color: #86868b;
  font-size: 13px;
}

/* Info */
.theme-info {
  padding: 12px 16px 8px;
}
.theme-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.theme-display-name {
  font-size: 15px;
  font-weight: 700;
  color: #1d1d1f;
}
.theme-type-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
  text-transform: uppercase;
}
.theme-type-badge.color {
  background: #e8f0fe;
  color: #0071e3;
}
.theme-type-badge.image {
  background: #f0e8f5;
  color: #9b59b6;
}

.theme-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.theme-key-label {
  font-size: 12px;
  color: #86868b;
  font-family: monospace;
}
.theme-color-value {
  font-size: 11px;
  color: #86868b;
  font-family: monospace;
}
.theme-order {
  font-size: 11px;
  color: #c7c7cc;
  margin-left: auto;
}

/* Actions */
.theme-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 12px;
  border-top: 1px solid #f0f0f2;
}

.btn-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
}
.toggle-track {
  display: block;
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: #e5e5e7;
  position: relative;
  transition: background 0.2s;
}
.btn-toggle.active .toggle-track {
  background: #34c759;
}
.toggle-thumb {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.btn-toggle.active .toggle-thumb {
  left: 20px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  color: #86868b;
  transition: all 0.2s;
}
.btn-icon:hover {
  background: #f5f5f7;
  color: #1d1d1f;
}
.btn-icon-danger:hover {
  background: #fff5f5;
  color: #ff3b30;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-primary {
  background: #0071e3;
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background: #0077ed;
}
.btn-secondary {
  background: #f5f5f7;
  color: #1d1d1f;
}
.btn-secondary:hover {
  background: #e5e5e7;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.modal-content {
  background: white;
  border-radius: 24px;
  padding: 32px;
  width: 480px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-content h3 {
  font-size: 22px;
  font-weight: 800;
  color: #1d1d1f;
  margin: 0 0 24px 0;
}

.form-group {
  margin-bottom: 20px;
}
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 6px;
}
.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e5e5e7;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #0071e3;
}

.type-selector {
  display: flex;
  gap: 8px;
}
.type-selector button {
  flex: 1;
  padding: 10px;
  border: 1.5px solid #e5e5e7;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #86868b;
  cursor: pointer;
  transition: all 0.2s;
}
.type-selector button.active {
  border-color: #0071e3;
  color: #0071e3;
  background: #e8f0fe;
}

.color-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.color-input-row .form-input {
  flex: 1;
}
.color-picker {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  padding: 0;
}
.color-preview-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1.5px solid #e5e5e7;
  flex-shrink: 0;
}

.file-upload-area {
  border: 2px dashed #e5e5e7;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.file-upload-area:hover {
  border-color: #0071e3;
  background: #f8fbff;
}
.upload-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 10px;
  object-fit: contain;
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #86868b;
  font-size: 13px;
}

.hidden-input {
  display: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 28px;
}

/* Preview overlay */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  cursor: pointer;
}
.preview-image {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 12px;
  object-fit: contain;
}

@media (max-width: 768px) {
  .header-row {
    flex-direction: column;
    gap: 12px;
  }
  .theme-grid {
    grid-template-columns: 1fr;
  }
  .modal-content {
    padding: 24px;
  }
}
</style>
