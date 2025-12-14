<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">에셋 관리</h1>
      <p class="page-desc">게임 및 메뉴판에 사용할 이미지 리소스를 관리합니다.</p>
    </div>

    <!-- Main Card -->
    <div class="content-card">
      <div class="card-toolbar">
        <div class="toolbar-left">
          <h2 class="card-label">에셋 라이브러리</h2>
        </div>
        <div class="toolbar-right">
          <button class="btn-primary" @click="openUploadModal">
            에셋 업로드
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="select-group">
          <div class="select-wrapper">
            <select v-model="filterCategory" class="filter-select">
              <option value="all">전체 카테고리</option>
              <option value="음식">음식</option>
              <option value="음료">음료</option>
              <option value="디저트">디저트</option>
              <option value="기타">기타</option>
            </select>
            <IconBase name="chevron-down" class="select-icon" />
          </div>
          <div class="select-wrapper">
            <select v-model="filterGame" class="filter-select">
              <option value="all">전체 게임</option>
              <option value="틀린그림찾기">틀린그림찾기</option>
              <option value="기억력게임">기억력게임</option>
              <option value="같은그림찾기">같은그림찾기</option>
            </select>
            <IconBase name="chevron-down" class="select-icon" />
          </div>
        </div>
        <div class="search-box">
          <IconBase name="search" class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="에셋 검색..."
            class="search-input"
          >
        </div>
      </div>

      <!-- Asset Grid -->
      <div class="asset-grid">
        <div v-for="asset in filteredAssets" :key="asset.id" class="asset-card">
          <div class="asset-preview">
            <img v-if="asset.imageUrl" :src="asset.imageUrl" :alt="asset.name" class="asset-image">
            <div v-else class="no-image">
              <span class="no-image-text">No Image</span>
            </div>
          </div>
          <div class="asset-info">
            <h3 class="asset-name">{{ asset.name }}</h3>
            <div class="asset-tags">
              <span class="tag category">{{ asset.category }}</span>
              <span class="tag game">{{ asset.gameType }}</span>
            </div>
            <div class="asset-meta">
              <span class="usage-count">사용 {{ asset.usageCount }}회</span>
              <span class="date">{{ asset.createdAt }}</span>
            </div>
            <div class="asset-actions">
              <button class="btn-action" @click="viewDetail(asset)">상세</button>
              <button class="btn-action" @click="editAsset(asset)">수정</button>
              <button class="btn-action danger" @click="deleteAsset(asset.id)">삭제</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination (Mock) -->
      <div class="pagination">
        <button class="page-btn prev" disabled>
          <IconBase name="chevron-left" class="page-icon" />
        </button>
        <button class="page-btn active">1</button>
        <button class="page-btn">2</button>
        <button class="page-btn">3</button>
        <button class="page-btn next">
          <IconBase name="chevron-right" class="page-icon" />
        </button>
      </div>
    </div>

    <!-- Upload/Edit Modal -->
    <div v-if="showModal" class="modal-overlay active" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ isEditing ? '에셋 수정' : '에셋 업로드' }}</h2>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">에셋 이름</label>
            <input type="text" v-model="form.name" class="form-input" placeholder="예: 햄버거 세트">
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">카테고리</label>
              <div class="select-wrapper">
                <select v-model="form.category" class="form-select">
                  <option value="음식">음식</option>
                  <option value="음료">음료</option>
                  <option value="디저트">디저트</option>
                  <option value="기타">기타</option>
                </select>
                <IconBase name="chevron-down" class="select-icon" />
              </div>
            </div>
            <div class="form-group half">
              <label class="form-label">사용 게임</label>
              <div class="select-wrapper">
                <select v-model="form.gameType" class="form-select">
                  <option value="틀린그림찾기">틀린그림찾기</option>
                  <option value="기억력게임">기억력게임</option>
                  <option value="같은그림찾기">같은그림찾기</option>
                </select>
                <IconBase name="chevron-down" class="select-icon" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">이미지 업로드</label>
            <div class="upload-area" @click="triggerFileInput">
              <div v-if="form.imageUrl" class="upload-preview">
                <img :src="form.imageUrl" alt="Preview">
                <button class="btn-remove-img" @click.stop="removeImage">✕</button>
              </div>
              <div v-else class="upload-placeholder">
                <div class="upload-icon-wrapper">
                  <IconBase name="image" class="upload-icon" />
                </div>
                <p class="upload-text">이미지를 드래그하거나 클릭하여 업로드</p>
                <p class="upload-hint">PNG, JPG (최대 5MB)</p>
              </div>
              <input
                type="file"
                ref="fileInput"
                class="file-input"
                accept="image/*"
                @change="handleFileUpload"
                hidden
              >
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">취소</button>
          <button class="btn-primary" @click="saveAsset">{{ isEditing ? '수정 완료' : '업로드' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconBase from '@/components/IconBase.vue'

interface Asset {
  id: number
  name: string
  category: string
  gameType: string
  imageUrl: string
  usageCount: number
  createdAt: string
}

// Mock Data
const assets = ref<Asset[]>([
  { id: 1, name: '햄버거 세트', category: '음식', gameType: '틀린그림찾기', imageUrl: '', usageCount: 12, createdAt: '2025-11-15' },
  { id: 2, name: '아이스 아메리카노', category: '음료', gameType: '같은그림찾기', imageUrl: '', usageCount: 8, createdAt: '2025-11-20' },
  { id: 3, name: '초콜릿 케이크', category: '디저트', gameType: '기억력게임', imageUrl: '', usageCount: 15, createdAt: '2025-11-25' },
  { id: 4, name: '파스타', category: '음식', gameType: '틀린그림찾기', imageUrl: '', usageCount: 6, createdAt: '2025-12-01' },
  { id: 5, name: '오렌지 주스', category: '음료', gameType: '같은그림찾기', imageUrl: '', usageCount: 10, createdAt: '2025-12-03' },
])

const filterCategory = ref('all')
const filterGame = ref('all')
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const form = ref<any>({
  id: 0,
  name: '',
  category: '음식',
  gameType: '틀린그림찾기',
  imageUrl: ''
})

const filteredAssets = computed(() => {
  return assets.value.filter(asset => {
    const matchCategory = filterCategory.value === 'all' || asset.category === filterCategory.value
    const matchGame = filterGame.value === 'all' || asset.gameType === filterGame.value
    const matchSearch = asset.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchCategory && matchGame && matchSearch
  })
})

// Modal Actions
const openUploadModal = () => {
  isEditing.value = false
  form.value = { id: 0, name: '', category: '음식', gameType: '틀린그림찾기', imageUrl: '' }
  showModal.value = true
}

const editAsset = (asset: Asset) => {
  isEditing.value = true
  form.value = { ...asset }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    // Mock upload: Create a fake URL
    // In real app: Upload to server/S3/Firebase Storage
    form.value.imageUrl = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(form.value.name || 'Image')
    // Reset input to allow re-selecting same file
    target.value = ''
  }
}

const removeImage = () => {
  form.value.imageUrl = ''
}

const saveAsset = () => {
  if (!form.value.name) {
    alert('에셋 이름을 입력해주세요.')
    return
  }

  if (isEditing.value) {
    const index = assets.value.findIndex(a => a.id === form.value.id)
    if (index !== -1) {
      assets.value[index] = { ...assets.value[index], ...form.value }
    }
  } else {
    assets.value.unshift({
      id: assets.value.length + 1,
      ...form.value,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    })
  }
  closeModal()
}

const deleteAsset = (id: number) => {
  if (confirm('이 에셋을 삭제하시겠습니까?')) {
    assets.value = assets.value.filter(a => a.id !== id)
  }
}

const viewDetail = (asset: Asset) => {
  alert(`${asset.name} 상세 보기 (준비중)`)
}
</script>

<style scoped>
/* Common Variables */
:root {
  --primary-blue: #0071e3;
  --primary-dark: #0056b3;
  --text-dark: #1d1d1f;
  --text-gray: #86868b;
  --bg-body: #f5f5f7;
  --border-light: #e5e5ea;
  --border-color: #d2d2d7;

  /* Tag Colors */
  --tag-orange-bg: #fff4e6; --tag-orange-text: #f59f00;
  --tag-blue-bg: #e7f5ff; --tag-blue-text: #1971c2;
  --tag-purple-bg: #f3f0ff; --tag-purple-text: #7950f2;
}

.tab-content { width: 100%; max-width: 1600px; margin: 0 auto; padding-top: 20px; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 28px; font-weight: 800; color: var(--text-dark); margin-bottom: 8px; letter-spacing: -0.5px; }
.page-desc { color: var(--text-gray); font-size: 15px; }

.content-card { background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02); overflow: hidden; padding-bottom: 24px; }
.card-toolbar { padding: 24px 32px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
.card-label { font-size: 18px; font-weight: 700; color: var(--text-dark); }

/* Filter Bar */
.filter-bar { padding: 20px 32px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; border-bottom: 1px solid var(--border-light); margin-bottom: 24px; }
.select-group { display: flex; gap: 10px; }
.select-wrapper { position: relative; }
.filter-select { padding: 10px 36px 10px 14px; border: 1px solid var(--border-color); border-radius: 10px; font-size: 14px; appearance: none; background: white; cursor: pointer; color: var(--text-dark); min-width: 140px; }
.filter-select:focus { outline: none; border-color: var(--primary-blue); }
.select-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 14px; color: var(--text-gray); pointer-events: none; }

.search-box { flex: 1; position: relative; max-width: 320px; }
.search-input { width: 100%; padding: 10px 12px 10px 36px; border: 1px solid var(--border-color); border-radius: 10px; font-size: 14px; outline: none; }
.search-input:focus { border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(0,113,227,0.1); }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; color: var(--text-gray); pointer-events: none; }

/* Asset Grid */
.asset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 24px; padding: 0 32px; margin-bottom: 32px; }

.asset-card {
  background: white; border: 1px solid var(--border-light); border-radius: 16px;
  overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
}
.asset-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); border-color: var(--primary-blue); }

.asset-preview {
  height: 200px; background: #f9f9fa; display: flex; align-items: center; justify-content: center;
  overflow: hidden; border-bottom: 1px solid var(--border-light); position: relative;
}
.asset-image { width: 100%; height: 100%; object-fit: cover; }
.no-image { color: #d2d2d7; font-size: 14px; font-weight: 500; }

.asset-info { padding: 16px; }
.asset-name { font-size: 16px; font-weight: 700; color: var(--text-dark); margin: 0 0 8px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.asset-tags { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.tag { font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: 600; }
.tag.category { background: var(--tag-orange-bg); color: var(--tag-orange-text); }
.tag.game { background: var(--tag-blue-bg); color: var(--tag-blue-text); }

.asset-meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-gray); margin-bottom: 16px; }

.asset-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.btn-action {
  padding: 8px; border: 1px solid var(--border-light); background: white;
  border-radius: 8px; font-size: 12px; color: var(--text-dark); cursor: pointer; transition: 0.2s;
  font-weight: 500;
}
.btn-action:hover { background: #f5f5f7; border-color: var(--border-color); }
.btn-action.danger:hover { background: #fff5f5; color: #ff3b30; border-color: #ffc9c9; }

/* Pagination */
.pagination { display: flex; justify-content: center; gap: 8px; padding: 24px 0; border-top: 1px solid var(--border-light); margin: 0 32px; }
.page-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-light); background: white; border-radius: 8px; font-size: 14px; color: var(--text-gray); cursor: pointer; transition: all 0.2s; }
.page-btn:hover:not(:disabled) { background: #f5f5f7; color: var(--text-dark); }
.page-btn.active { background: var(--primary-blue); color: white; border-color: var(--primary-blue); }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-icon { width: 16px; height: 16px; }

/* Buttons */
.btn-primary { padding: 10px 24px; background: var(--primary-blue); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 8px rgba(0, 113, 227, 0.25); }
.btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; justify-content: center; align-items: center; }
.modal-card { background: white; width: 600px; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); display: flex; flex-direction: column; max-height: 85vh; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.modal-header { padding: 20px 28px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { font-size: 18px; font-weight: 700; margin: 0; }
.btn-close { background: #f5f5f7; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-gray); }
.btn-close:hover { background: #e5e5ea; color: var(--text-dark); }

.modal-body { padding: 28px; overflow-y: auto; }
.form-group { margin-bottom: 20px; }
.form-row { display: flex; gap: 20px; }
.form-group.half { flex: 1; }
.form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
.form-input, .form-select { width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; font-size: 15px; outline: none; font-family: inherit; }
.form-input:focus, .form-select:focus { border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(0,113,227,0.1); }

/* Upload Area */
.upload-area { position: relative; height: 200px; border: 2px dashed var(--border-color); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; background: #f9f9fa; overflow: hidden; }
.upload-area:hover { border-color: var(--primary-blue); background: #f0f7ff; }
.upload-placeholder { text-align: center; color: var(--text-gray); }
.upload-icon-wrapper { width: 48px; height: 48px; background: #e8f2ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: var(--primary-blue); }
.upload-icon { width: 24px; height: 24px; }
.upload-text { font-size: 14px; font-weight: 600; margin-bottom: 4px; color: var(--text-dark); }
.upload-hint { font-size: 12px; }

.upload-preview { width: 100%; height: 100%; position: relative; }
.upload-preview img { width: 100%; height: 100%; object-fit: contain; background: white; }
.btn-remove-img { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: 0.2s; }
.btn-remove-img:hover { background: rgba(239, 68, 68, 0.9); }

.modal-footer { padding: 20px 28px; border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 10px; }
.btn-secondary { padding: 10px 20px; border-radius: 10px; border: 1px solid var(--border-color); background: white; color: var(--text-dark); font-weight: 600; cursor: pointer; }
.btn-secondary:hover { background: #f5f5f7; }

/* Responsive */
@media (max-width: 1200px) {
  .asset-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .asset-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .asset-grid { grid-template-columns: 1fr; }
  .form-row { flex-direction: column; gap: 0; }
  .filter-bar { flex-direction: column; align-items: stretch; }
  .select-group { flex-direction: column; }
}
</style>
