<template>
  <div class="bgm-management">
    <div class="page-header">
      <div>
        <h1>BGM 관리</h1>
        <p class="subtitle">배경음악 라이브러리를 관리합니다. Admin들이 이 목록에서 배경음악을 선택할 수 있습니다.</p>
      </div>
      <button class="btn-add" @click="showUploadModal = true">
        <IconBase name="plus" />
        BGM 추가
      </button>
    </div>

    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">전체 트랙</span>
        <span class="stat-value">{{ tracks.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">활성 트랙</span>
        <span class="stat-value">{{ tracks.filter(t => t.isActive).length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">카테고리</span>
        <span class="stat-value">{{ categories.length }}</span>
      </div>
    </div>

    <div class="filters-bar">
      <select v-model="categoryFilter" @change="fetchTracks">
        <option value="">전체 카테고리</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <select v-model="statusFilter" @change="applyFilters">
        <option value="">전체 상태</option>
        <option value="active">활성</option>
        <option value="inactive">비활성</option>
      </select>
    </div>

    <LoadingSpinner v-if="loading" message="BGM 목록을 불러오는 중..." />

    <div v-else class="tracks-grid">
      <div v-for="track in filteredTracks" :key="track.id" class="track-card" :class="{ inactive: !track.isActive }">
        <div class="track-icon">
          <IconBase name="music" />
        </div>
        <div class="track-info">
          <h3>{{ track.title }}</h3>
          <p class="track-artist" v-if="track.artist">{{ track.artist }}</p>
          <div class="track-meta">
            <span class="category-badge" v-if="track.category">{{ track.category }}</span>
            <span class="duration" v-if="track.durationSeconds">{{ formatDuration(track.durationSeconds) }}</span>
            <span class="status-badge" :class="track.isActive ? 'active' : 'inactive'">
              {{ track.isActive ? '활성' : '비활성' }}
            </span>
          </div>
          <p class="track-date">{{ formatDate(track.createdAt) }}</p>
        </div>
        <div class="track-actions">
          <button class="btn-action" @click="playPreview(track)" :title="isPlaying === track.id ? '정지' : '미리듣기'">
            <IconBase :name="isPlaying === track.id ? 'pause' : 'play'" />
          </button>
          <button class="btn-action" @click="toggleActive(track)" :title="track.isActive ? '비활성화' : '활성화'">
            <IconBase :name="track.isActive ? 'eye-off' : 'eye'" />
          </button>
          <button class="btn-action danger" @click="confirmDelete(track)" title="삭제">
            <IconBase name="trash" />
          </button>
        </div>
      </div>

      <div v-if="filteredTracks.length === 0" class="empty-state">
        <IconBase name="music" class="empty-icon" />
        <p>BGM이 없습니다</p>
        <button class="btn-add-empty" @click="showUploadModal = true">BGM 추가하기</button>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>BGM 추가</h2>
          <button class="btn-close" @click="closeUploadModal">
            <IconBase name="close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>제목 *</label>
            <input v-model="newTrack.title" type="text" placeholder="트랙 제목" />
          </div>
          <div class="form-group">
            <label>아티스트</label>
            <input v-model="newTrack.artist" type="text" placeholder="아티스트명 (선택)" />
          </div>
          <div class="form-group">
            <label>카테고리</label>
            <select v-model="newTrack.category">
              <option value="">선택하세요</option>
              <option value="잔잔한">잔잔한</option>
              <option value="활기찬">활기찬</option>
              <option value="감성적">감성적</option>
              <option value="신나는">신나는</option>
              <option value="클래식">클래식</option>
              <option value="재즈">재즈</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div class="form-group">
            <label>파일 업로드 *</label>
            <div class="upload-zone" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileDrop">
              <input ref="fileInput" type="file" accept="audio/*" @change="handleFileSelect" hidden />
              <IconBase name="upload" class="upload-icon" />
              <p v-if="!selectedFile">클릭하거나 파일을 드래그하세요</p>
              <p v-else class="selected-file">{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</p>
            </div>
          </div>
          <div class="form-group">
            <label>또는 URL 직접 입력</label>
            <input v-model="newTrack.fileUrl" type="url" placeholder="https://example.com/music.mp3" :disabled="!!selectedFile" />
          </div>
          <div class="form-group">
            <label>표시 순서</label>
            <input v-model.number="newTrack.displayOrder" type="number" min="0" placeholder="0" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeUploadModal">취소</button>
          <button class="btn-submit" @click="submitTrack" :disabled="uploading">
            <LoadingSpinner v-if="uploading" :size="16" />
            {{ uploading ? '업로드 중...' : 'BGM 추가' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Hidden audio element for preview -->
    <audio ref="audioPlayer" @ended="isPlaying = null"></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import bgmService, { type BgmTrackAdmin, type CreateBgmTrackRequest } from '@/services/bgmService'
import IconBase from '@/components/IconBase.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const loading = ref(true)
const tracks = ref<BgmTrackAdmin[]>([])
const categories = ref<string[]>([])
const categoryFilter = ref('')
const statusFilter = ref('')
const showUploadModal = ref(false)
const uploading = ref(false)
const isPlaying = ref<string | null>(null)
const audioPlayer = ref<HTMLAudioElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

const newTrack = ref<CreateBgmTrackRequest>({
  title: '',
  artist: '',
  fileUrl: '',
  category: '',
  displayOrder: 0
})

const filteredTracks = computed(() => {
  let result = tracks.value
  if (categoryFilter.value) {
    result = result.filter(t => t.category === categoryFilter.value)
  }
  if (statusFilter.value === 'active') {
    result = result.filter(t => t.isActive)
  } else if (statusFilter.value === 'inactive') {
    result = result.filter(t => !t.isActive)
  }
  return result
})

const fetchTracks = async () => {
  try {
    loading.value = true
    tracks.value = await bgmService.getAllTracksForAdmin()
    categories.value = await bgmService.getCategories()
  } catch (error) {
    console.error('Failed to fetch BGM tracks:', error)
    tracks.value = []
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  // Filters are applied via computed property
}

const playPreview = (track: BgmTrackAdmin) => {
  if (!audioPlayer.value) return

  if (isPlaying.value === track.id) {
    audioPlayer.value.pause()
    isPlaying.value = null
  } else {
    audioPlayer.value.src = track.fileUrl
    audioPlayer.value.play()
    isPlaying.value = track.id
  }
}

const toggleActive = async (track: BgmTrackAdmin) => {
  try {
    const userId = authStore.user?.id
    if (!userId) return

    await bgmService.updateTrack(track.id, { isActive: !track.isActive }, userId)
    track.isActive = !track.isActive
  } catch (error) {
    console.error('Failed to toggle track status:', error)
    alert('상태 변경에 실패했습니다')
  }
}

const confirmDelete = async (track: BgmTrackAdmin) => {
  if (!confirm(`"${track.title}" BGM을 삭제하시겠습니까?`)) return

  try {
    const userId = authStore.user?.id
    if (!userId) return

    await bgmService.deleteTrack(track.id, userId)
    tracks.value = tracks.value.filter(t => t.id !== track.id)
  } catch (error) {
    console.error('Failed to delete track:', error)
    alert('삭제에 실패했습니다')
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    newTrack.value.fileUrl = '' // Clear URL when file is selected
  }
}

const handleFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    if (file.type.startsWith('audio/')) {
      selectedFile.value = file
      newTrack.value.fileUrl = ''
    } else {
      alert('오디오 파일만 업로드할 수 있습니다')
    }
  }
}

const uploadAudioFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/api/FileUpload/audio`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('File upload failed')
  }

  const data = await response.json()
  return data.url
}

const submitTrack = async () => {
  if (!newTrack.value.title.trim()) {
    alert('제목을 입력해주세요')
    return
  }

  if (!selectedFile.value && !newTrack.value.fileUrl) {
    alert('파일을 업로드하거나 URL을 입력해주세요')
    return
  }

  const userId = authStore.user?.id
  if (!userId) {
    alert('로그인이 필요합니다')
    return
  }

  try {
    uploading.value = true

    let fileUrl = newTrack.value.fileUrl

    // Upload file if selected
    if (selectedFile.value) {
      fileUrl = await uploadAudioFile(selectedFile.value)
    }

    const request: CreateBgmTrackRequest = {
      title: newTrack.value.title.trim(),
      artist: newTrack.value.artist?.trim() || undefined,
      fileUrl: fileUrl,
      category: newTrack.value.category || undefined,
      displayOrder: newTrack.value.displayOrder || 0,
      fileSize: selectedFile.value?.size
    }

    const created = await bgmService.createTrack(request, userId)
    tracks.value.unshift(created)

    closeUploadModal()
    alert('BGM이 추가되었습니다')
  } catch (error) {
    console.error('Failed to create track:', error)
    alert('BGM 추가에 실패했습니다')
  } finally {
    uploading.value = false
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false
  newTrack.value = {
    title: '',
    artist: '',
    fileUrl: '',
    category: '',
    displayOrder: 0
  }
  selectedFile.value = null
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

onMounted(() => {
  fetchTracks()
})

onUnmounted(() => {
  // Stop audio on unmount
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
})
</script>

<style scoped>
.bgm-management {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 15px;
  color: #86868b;
  margin: 0;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #d4a853 0%, #b8942e 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(212, 168, 83, 0.3);
}

.btn-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(212, 168, 83, 0.4);
}

.btn-add :deep(svg) {
  width: 18px;
  height: 18px;
}

/* Stats Bar */
.stats-bar {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86868b;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
}

/* Filters */
.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.filters-bar select {
  padding: 12px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  min-width: 150px;
  cursor: pointer;
}

/* Tracks Grid */
.tracks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.track-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.track-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.track-card.inactive {
  opacity: 0.6;
}

.track-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.track-icon :deep(svg) {
  width: 28px;
  height: 28px;
  color: white;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 13px;
  color: #86868b;
  margin: 0 0 8px 0;
}

.track-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.category-badge {
  padding: 2px 8px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.duration {
  font-size: 11px;
  color: #86868b;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background: #fce4ec;
  color: #c62828;
}

.track-date {
  font-size: 11px;
  color: #aeaeb2;
  margin: 0;
}

.track-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-action {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #f0f0f0;
}

.btn-action.danger:hover {
  background: #fff0f0;
  border-color: #ffcdd2;
}

.btn-action :deep(svg) {
  width: 16px;
  height: 16px;
  color: #86868b;
}

.btn-action.danger:hover :deep(svg) {
  color: #ff3b30;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
  color: #86868b;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.btn-add-empty {
  margin-top: 16px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #d4a853 0%, #b8942e 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5ea;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close :deep(svg) {
  width: 18px;
  height: 18px;
  color: #86868b;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #d4a853;
}

.form-group input:disabled {
  background: #f5f5f5;
  color: #86868b;
}

.upload-zone {
  border: 2px dashed #d4a853;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-zone:hover {
  background: #fef7e6;
}

.upload-icon {
  width: 40px;
  height: 40px;
  color: #d4a853;
  margin-bottom: 12px;
}

.upload-zone p {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.selected-file {
  color: #2e7d32 !important;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e5ea;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-submit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #d4a853 0%, #b8942e 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .stats-bar {
    flex-wrap: wrap;
  }

  .tracks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
