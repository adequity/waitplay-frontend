<template>
  <div class="benefits-management">
    <div class="page-header">
      <div>
        <h1>혜택 관리</h1>
        <p class="subtitle">전체 시스템의 혜택을 관리합니다</p>
      </div>
      <button class="btn-generate" @click="generateDefaultBenefits" :disabled="generating">
        <IconBase name="wand" />
        {{ generating ? '생성 중...' : '기본 혜택 일괄 생성' }}
      </button>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <IconBase name="search" class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="혜택 이름 검색..." @input="debouncedSearch" />
      </div>
      <select v-model="statusFilter" @change="fetchBenefits">
        <option value="">전체 상태</option>
        <option value="active">활성</option>
        <option value="inactive">비활성</option>
      </select>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else class="benefits-grid">
      <div v-for="benefit in benefits" :key="benefit.id" class="benefit-card" :class="{ inactive: !benefit.isActive }">
        <div class="benefit-header">
          <div class="benefit-type" :class="benefit.gameType">
            <IconBase :name="getTypeIcon(benefit.gameType)" />
          </div>
          <span class="status-badge" :class="{ active: benefit.isActive }">
            {{ benefit.isActive ? '활성' : '비활성' }}
          </span>
        </div>
        <h3>{{ benefit.title }}</h3>
        <p class="benefit-desc">{{ benefit.description || '설명 없음' }}</p>
        <div class="benefit-meta">
          <span>{{ getGameLabel(benefit.gameType) }}</span>
          <span>{{ formatDate(benefit.createdAt) }}</span>
        </div>
        <div class="benefit-actions">
          <button class="btn-action" @click="toggleActive(benefit)">
            <IconBase :name="benefit.isActive ? 'eye-off' : 'eye'" />
          </button>
          <button class="btn-action danger" @click="confirmDelete(benefit)">
            <IconBase name="trash" />
          </button>
        </div>
      </div>

      <div v-if="!benefits || benefits.length === 0" class="empty-state">
        <IconBase name="gift" class="empty-icon" />
        <p>혜택이 없습니다</p>
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
const generating = ref(false)
const benefits = ref<any[]>([])
const page = ref(1)
const pageSize = ref(12)
const totalPages = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')

let searchTimeout: number | null = null

const generateDefaultBenefits = async () => {
  if (!confirm('활성화된 모든 게임에 기본 혜택(동/은/금메달)을 생성하시겠습니까?\n이미 혜택이 있는 게임은 건너뜁니다.')) return

  generating.value = true
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/benefits/generate-defaults`, {
      method: 'POST',
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    alert(`${data.message}\n생성된 혜택: ${data.totalCreated}개\n처리된 QR코드: ${data.qrCodesProcessed}개`)
    fetchBenefits()
  } catch (error) {
    console.error(error)
    alert('기본 혜택 생성에 실패했습니다')
  } finally {
    generating.value = false
  }
}

const fetchBenefits = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: page.value.toString(),
      pageSize: pageSize.value.toString()
    })
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (statusFilter.value) params.append('isActive', statusFilter.value === 'active' ? 'true' : 'false')

    console.log('Fetching benefits from:', `${API_URL}/api/masteradmin/benefits?${params}`)
    const response = await fetch(`${API_URL}/api/masteradmin/benefits?${params}`, {
      credentials: 'include'
    })
    if (!response.ok) {
      console.error('Benefits API error:', response.status, response.statusText)
      throw new Error('Failed')
    }
    const data = await response.json()
    console.log('Benefits API response:', data)
    benefits.value = data.data || []
    totalPages.value = data.totalPages || 1
    console.log('Loaded benefits count:', benefits.value.length)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { page.value = 1; fetchBenefits() }, 300) as any
}

const toggleActive = async (benefit: any) => {
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/benefits/${benefit.id}/toggle-active`, {
      method: 'PATCH',
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed')
    benefit.isActive = !benefit.isActive
  } catch (error) {
    alert('상태 변경에 실패했습니다')
  }
}

const confirmDelete = async (benefit: any) => {
  if (!confirm(`"${benefit.title}" 혜택을 삭제하시겠습니까?`)) return
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/benefits/${benefit.id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed')
    fetchBenefits()
  } catch (error) {
    alert('삭제에 실패했습니다')
  }
}

const getTypeIcon = (gameType: string) => {
  const icons: Record<string, string> = {
    'pinball': 'target',
    'brick-breaker': 'grid',
    'memory': 'clone',
    'spot-difference': 'magnifying-glass',
    'roulette': 'target',
    'slot': 'grid',
    'racing': 'zap'
  }
  return icons[gameType] || 'gift'
}

const getGameLabel = (gameType: string) => {
  const labels: Record<string, string> = {
    'pinball': '핀볼',
    'brick-breaker': '벽돌깨기',
    'memory': '같은 카드 찾기',
    'spot-difference': '틀린 그림 찾기',
    'roulette': '룰렛',
    'slot': '슬롯머신',
    'racing': '레이싱'
  }
  return labels[gameType] || gameType || '전체'
}

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ko-KR')

watch(page, fetchBenefits)
onMounted(() => fetchBenefits())
</script>

<style scoped>
.benefits-management { padding: 0; }
.page-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h1 { font-size: 28px; font-weight: 700; color: #1d1d1f; margin: 0 0 8px 0; }
.subtitle { font-size: 15px; color: #86868b; margin: 0; }

.btn-generate { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: linear-gradient(135deg, #d4a853, #b8942e); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(212, 168, 83, 0.3); }
.btn-generate:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(212, 168, 83, 0.4); }
.btn-generate:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-generate :deep(svg) { width: 18px; height: 18px; }

.filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
.search-box { flex: 1; max-width: 400px; position: relative; }
.search-box input { width: 100%; padding: 12px 16px 12px 44px; border: 1px solid #e5e5ea; border-radius: 12px; font-size: 14px; background: white; }
.search-box input:focus { outline: none; border-color: #d4a853; box-shadow: 0 0 0 3px rgba(212, 168, 83, 0.1); }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #86868b; }
.filters-bar select { padding: 12px 16px; border: 1px solid #e5e5ea; border-radius: 12px; font-size: 14px; background: white; min-width: 150px; }

.benefits-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.benefit-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); transition: all 0.3s; }
.benefit-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }
.benefit-card.inactive { opacity: 0.6; }

.benefit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.benefit-type { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #d4a853, #b8942e); }
.benefit-type :deep(svg) { width: 22px; height: 22px; color: white; }

.status-badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #fff0f0; color: #ff6b6b; }
.status-badge.active { background: #dcfce7; color: #16a34a; }

.benefit-card h3 { font-size: 18px; font-weight: 600; color: #1d1d1f; margin: 0 0 8px 0; }
.benefit-desc { font-size: 14px; color: #86868b; margin: 0 0 16px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.benefit-meta { display: flex; gap: 16px; font-size: 12px; color: #aeaeb2; margin-bottom: 16px; }

.benefit-actions { display: flex; gap: 8px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.btn-action { flex: 1; padding: 10px; border: 1px solid #e5e5ea; border-radius: 10px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-action:hover { background: #f0f0f0; }
.btn-action.danger:hover { background: #fff0f0; color: #ff3b30; border-color: #ffcdd2; }
.btn-action :deep(svg) { width: 18px; height: 18px; color: #86868b; }

.empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; padding: 80px 0; color: #86868b; }
.empty-icon { width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 32px 0; }
.pagination button { padding: 8px 16px; border: 1px solid #e5e5ea; border-radius: 8px; background: white; font-size: 14px; cursor: pointer; }
.pagination button:hover:not(:disabled) { background: #f0f0f0; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
