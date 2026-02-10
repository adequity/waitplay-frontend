<template>
  <div class="assets-management">
    <div class="page-header">
      <div>
        <h1>에셋 관리</h1>
        <p class="subtitle">전체 시스템의 에셋을 관리합니다</p>
      </div>
    </div>

    <div class="filters-bar">
      <select v-model="typeFilter" @change="fetchAssets">
        <option value="">전체 유형</option>
        <option value="image">이미지</option>
        <option value="icon">아이콘</option>
        <option value="logo">로고</option>
      </select>
    </div>

    <LoadingSpinner v-if="loading" message="에셋을 불러오는 중..." />

    <div v-else class="assets-grid">
      <div v-for="asset in assets" :key="asset.id" class="asset-card">
        <div class="asset-preview">
          <img v-if="asset.url" :src="asset.url" :alt="asset.name" @error="handleImageError" />
          <div v-else class="no-image">
            <IconBase name="image" />
          </div>
        </div>
        <div class="asset-info">
          <h3>{{ asset.name }}</h3>
          <p class="asset-meta">
            <span class="type-badge">{{ getTypeLabel(asset.type) }}</span>
            <span>{{ formatDate(asset.createdAt) }}</span>
          </p>
        </div>
        <div class="asset-actions">
          <button class="btn-action" @click="copyUrl(asset.url)" title="URL 복사">
            <IconBase name="copy" />
          </button>
          <button class="btn-action danger" @click="confirmDelete(asset)" title="삭제">
            <IconBase name="trash" />
          </button>
        </div>
      </div>

      <div v-if="assets.length === 0" class="empty-state">
        <IconBase name="image" class="empty-icon" />
        <p>에셋이 없습니다</p>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button @click="page = page - 1" :disabled="page <= 1">이전</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button @click="page = page + 1" :disabled="page >= totalPages">다음</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const loading = ref(true)
const assets = ref<any[]>([])
const page = ref(1)
const pageSize = ref(24)
const totalPages = ref(1)
const typeFilter = ref('')

const fetchAssets = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({ page: page.value.toString(), pageSize: pageSize.value.toString() })
    if (typeFilter.value) params.append('type', typeFilter.value)

    const response = await fetch(`${API_URL}/api/masteradmin/assets?${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    assets.value = data.assets
    totalPages.value = data.totalPages
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('URL이 복사되었습니다')
  } catch (error) {
    alert('복사에 실패했습니다')
  }
}

const confirmDelete = async (asset: any) => {
  if (!confirm(`"${asset.name}" 에셋을 삭제하시겠습니까?`)) return
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/assets/${asset.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    fetchAssets()
  } catch (error) {
    alert('삭제에 실패했습니다')
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = { 'image': '이미지', 'icon': '아이콘', 'logo': '로고' }
  return labels[type] || type
}

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ko-KR')

watch(page, fetchAssets)
onMounted(() => fetchAssets())
</script>

<style scoped>
.assets-management { padding: 0; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 28px; font-weight: 700; color: #1d1d1f; margin: 0 0 8px 0; }
.subtitle { font-size: 15px; color: #86868b; margin: 0; }

.filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
.filters-bar select { padding: 12px 16px; border: 1px solid #e5e5ea; border-radius: 12px; font-size: 14px; background: white; min-width: 150px; }

.assets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }

.asset-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); transition: all 0.3s; }
.asset-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }

.asset-preview { height: 140px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.asset-preview img { width: 100%; height: 100%; object-fit: cover; }
.no-image { color: #aeaeb2; }
.no-image :deep(svg) { width: 40px; height: 40px; }

.asset-info { padding: 16px; }
.asset-info h3 { font-size: 14px; font-weight: 600; color: #1d1d1f; margin: 0 0 8px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.asset-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #86868b; margin: 0; }
.type-badge { padding: 2px 8px; background: #f0f0f0; border-radius: 4px; font-weight: 500; }

.asset-actions { display: flex; gap: 8px; padding: 0 16px 16px; }
.btn-action { flex: 1; padding: 8px; border: 1px solid #e5e5ea; border-radius: 8px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-action:hover { background: #f0f0f0; }
.btn-action.danger:hover { background: #fff0f0; color: #ff3b30; border-color: #ffcdd2; }
.btn-action :deep(svg) { width: 16px; height: 16px; color: #86868b; }

.empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; padding: 80px 0; color: #86868b; }
.empty-icon { width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 32px 0; }
.pagination button { padding: 8px 16px; border: 1px solid #e5e5ea; border-radius: 8px; background: white; font-size: 14px; cursor: pointer; }
.pagination button:hover:not(:disabled) { background: #f0f0f0; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
