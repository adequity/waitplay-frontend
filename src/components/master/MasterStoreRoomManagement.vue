<template>
  <div class="store-room-management">
    <div class="section-header">
      <h2>매장 룸 관리</h2>
      <p class="section-desc">매장별 게임 클리어 시 유저에게 주어지는 육각형 룸을 관리합니다.</p>
    </div>

    <!-- Add Button -->
    <div class="add-card" v-if="!isAdding">
      <button class="btn-add" @click="startAdding">
        <span class="btn-add-icon">+</span>
        새 매장 룸 템플릿 추가
      </button>
    </div>

    <!-- Add/Edit Form -->
    <div class="form-card" v-if="isAdding || editingId">
      <h3>{{ editingId ? '템플릿 수정' : '새 템플릿 추가' }}</h3>

      <div class="form-group" v-if="!editingId">
        <label>매장 선택</label>
        <select v-model="form.qrCodeId" class="form-input">
          <option value="">매장을 선택하세요...</option>
          <option
            v-for="store in availableStores"
            :key="store.id"
            :value="store.id"
          >
            {{ store.name }} ({{ store.code }})
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>룸 이미지</label>
        <div
          class="upload-area"
          @click="triggerUpload"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <img v-if="form.roomImageUrl" :src="form.roomImageUrl" class="upload-preview" />
          <div v-else class="upload-placeholder">
            <div class="upload-icon">+</div>
            <p>클릭 또는 드래그로 이미지 업로드</p>
          </div>
        </div>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="handleFileSelect" />
      </div>

      <div class="form-group">
        <label>룸 이름</label>
        <input v-model="form.roomName" placeholder="예: 따뜻한 카페" class="form-input" />
      </div>

      <div class="form-group">
        <label>설명 (선택)</label>
        <textarea v-model="form.roomDescription" placeholder="룸 설명" class="form-input form-textarea" rows="2"></textarea>
      </div>

      <div class="form-group">
        <label>룸 색상</label>
        <div class="color-picker-row">
          <input type="color" v-model="form.roomColor" class="color-input" />
          <span class="color-label">{{ form.roomColor }}</span>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-cancel" @click="cancelForm">취소</button>
        <button class="btn-save" :disabled="!canSave || saving" @click="saveTemplate">
          {{ saving ? '저장 중...' : (editingId ? '수정' : '추가') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>로딩 중...</p>
    </div>

    <!-- Template List -->
    <div v-else-if="templates.length > 0" class="template-grid">
      <div v-for="tpl in templates" :key="tpl.id" class="template-card" :class="{ inactive: !tpl.isActive }">
        <div class="template-image-wrapper">
          <div class="hex-preview" :style="{ backgroundColor: tpl.roomColor }">
            <img :src="tpl.roomImageUrl" :alt="tpl.roomName" class="hex-image" />
          </div>
          <span v-if="!tpl.isActive" class="inactive-badge">비활성</span>
        </div>
        <div class="template-info">
          <h4>{{ tpl.roomName }}</h4>
          <p class="template-store">{{ tpl.qrCodeName || tpl.qrCodeCode }}</p>
          <p class="template-desc" v-if="tpl.roomDescription">{{ tpl.roomDescription }}</p>
          <p class="template-stats">수집: {{ tpl.collectedCount }}명</p>
        </div>
        <div class="template-actions">
          <button class="btn-small btn-edit" @click="startEditing(tpl)">수정</button>
          <button class="btn-small" :class="tpl.isActive ? 'btn-deactivate' : 'btn-activate'" @click="toggleActive(tpl)">
            {{ tpl.isActive ? '비활성화' : '활성화' }}
          </button>
          <button class="btn-small btn-delete" v-if="tpl.collectedCount === 0" @click="deleteTemplate(tpl)">삭제</button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>등록된 매장 룸 템플릿이 없습니다.</p>
      <p class="empty-hint">매장별 룸 이미지를 등록하면, 유저가 게임 클리어 시 자동으로 룸이 부여됩니다.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate as deleteTemplateApi,
  getStoresWithTemplateStatus,
  type StoreRoomTemplate,
  type StoreWithTemplateStatus,
} from '@/services/storeRoomService'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const authStore = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const templates = ref<StoreRoomTemplate[]>([])
const stores = ref<StoreWithTemplateStatus[]>([])
const isAdding = ref(false)
const editingId = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const form = ref({
  qrCodeId: '',
  roomImageUrl: '',
  roomName: '',
  roomDescription: '',
  roomColor: '#6366F1',
})

const availableStores = computed(() =>
  stores.value.filter(s => !s.hasTemplate)
)

const canSave = computed(() => {
  if (editingId.value) {
    return form.value.roomImageUrl && form.value.roomName
  }
  return form.value.qrCodeId && form.value.roomImageUrl && form.value.roomName
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const [tpls, storeList] = await Promise.all([
      getAllTemplates(),
      getStoresWithTemplateStatus(),
    ])
    templates.value = tpls
    stores.value = storeList
  } catch (e) {
    console.error('Failed to load store room data:', e)
  } finally {
    loading.value = false
  }
}

function startAdding() {
  editingId.value = null
  resetForm()
  isAdding.value = true
}

function startEditing(tpl: StoreRoomTemplate) {
  isAdding.value = false
  editingId.value = tpl.id
  form.value = {
    qrCodeId: tpl.qrCodeId,
    roomImageUrl: tpl.roomImageUrl,
    roomName: tpl.roomName,
    roomDescription: tpl.roomDescription || '',
    roomColor: tpl.roomColor,
  }
}

function cancelForm() {
  isAdding.value = false
  editingId.value = null
  resetForm()
}

function resetForm() {
  form.value = {
    qrCodeId: '',
    roomImageUrl: '',
    roomName: '',
    roomDescription: '',
    roomColor: '#6366F1',
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
      body: formData,
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
  if (url) form.value.roomImageUrl = url
  target.value = ''
}

async function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const url = await uploadImage(file)
  if (url) form.value.roomImageUrl = url
}

async function saveTemplate() {
  if (!canSave.value || saving.value) return
  saving.value = true
  try {
    if (editingId.value) {
      await updateTemplate(editingId.value, {
        roomImageUrl: form.value.roomImageUrl,
        roomName: form.value.roomName,
        roomDescription: form.value.roomDescription || undefined,
        roomColor: form.value.roomColor,
      })
    } else {
      await createTemplate({
        qrCodeId: form.value.qrCodeId,
        roomImageUrl: form.value.roomImageUrl,
        roomName: form.value.roomName,
        roomDescription: form.value.roomDescription || undefined,
        roomColor: form.value.roomColor,
      })
    }
    cancelForm()
    await loadData()
  } catch (e: any) {
    alert(e?.response?.data?.message || '저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

async function toggleActive(tpl: StoreRoomTemplate) {
  try {
    await updateTemplate(tpl.id, { isActive: !tpl.isActive })
    await loadData()
  } catch (e) {
    alert('상태 변경에 실패했습니다.')
  }
}

async function deleteTemplate(tpl: StoreRoomTemplate) {
  if (!confirm(`"${tpl.roomName}" 템플릿을 삭제하시겠습니까?`)) return
  try {
    await deleteTemplateApi(tpl.id)
    await loadData()
  } catch (e: any) {
    alert(e?.response?.data?.message || '삭제에 실패했습니다.')
  }
}
</script>

<style scoped>
.store-room-management {
  padding: 0;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 6px 0;
}

.section-desc {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.add-card {
  margin-bottom: 20px;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f5f5f7;
  border: 2px dashed #d1d1d6;
  border-radius: 12px;
  color: #86868b;
  font-size: 15px;
  cursor: pointer;
  width: 100%;
  justify-content: center;
  transition: all 0.2s;
}

.btn-add:hover {
  border-color: #6366F1;
  color: #6366F1;
  background: #f0f0ff;
}

.btn-add-icon {
  font-size: 20px;
  font-weight: 600;
}

.form-card {
  background: #fff;
  border: 1px solid #e8e6e1;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
}

.form-card h3 {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #1d1d1f;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 14px;
  color: #1d1d1f;
  background: #fafafa;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #6366F1;
}

.form-textarea {
  resize: vertical;
  min-height: 48px;
}

.upload-area {
  border: 2px dashed #d1d1d6;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #6366F1;
}

.upload-preview {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  object-fit: cover;
}

.upload-placeholder {
  color: #aeaeb2;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-input {
  width: 44px;
  height: 36px;
  border: 1px solid #d1d1d6;
  border-radius: 8px;
  padding: 2px;
  cursor: pointer;
  background: none;
}

.color-label {
  font-size: 14px;
  color: #86868b;
  font-family: monospace;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  background: #fff;
  color: #86868b;
  font-size: 14px;
  cursor: pointer;
}

.btn-save {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: #6366F1;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state {
  text-align: center;
  padding: 48px 0;
  color: #86868b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e8e6e1;
  border-top-color: #6366F1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.template-card {
  background: #fff;
  border: 1px solid #e8e6e1;
  border-radius: 14px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.template-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.template-card.inactive {
  opacity: 0.6;
}

.template-image-wrapper {
  position: relative;
  padding: 16px;
  display: flex;
  justify-content: center;
  background: #f5f5f7;
}

.hex-preview {
  width: 120px;
  height: 104px;
  clip-path: polygon(75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%, 25% 0%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hex-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.inactive-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  background: #ff6b6b;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
}

.template-info {
  padding: 12px 16px;
}

.template-info h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1d1d1f;
}

.template-store {
  font-size: 13px;
  color: #6366F1;
  margin: 0 0 4px 0;
}

.template-desc {
  font-size: 13px;
  color: #86868b;
  margin: 0 0 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-stats {
  font-size: 12px;
  color: #aeaeb2;
  margin: 0;
}

.template-actions {
  padding: 8px 16px 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-small {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-edit {
  background: #e8e6e1;
  color: #555;
}

.btn-edit:hover {
  background: #d1d1d6;
}

.btn-deactivate {
  background: #fff3e0;
  color: #e65100;
}

.btn-activate {
  background: #e8f5e9;
  color: #2e7d32;
}

.btn-delete {
  background: #fde8e8;
  color: #d32f2f;
}

.btn-delete:hover {
  background: #f5c6c6;
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: #86868b;
}

.empty-hint {
  font-size: 13px;
  color: #aeaeb2;
  margin-top: 8px;
}
</style>
