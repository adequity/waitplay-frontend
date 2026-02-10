<template>
  <div class="qr-management">
    <div class="page-header">
      <div>
        <h1>QR 코드 관리</h1>
        <p class="subtitle">전체 시스템의 QR 코드를 관리합니다</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <IconBase name="search" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="QR 이름 검색..."
          @input="debouncedSearch"
        />
      </div>
      <select v-model="statusFilter" @change="fetchQRCodes">
        <option value="">전체 상태</option>
        <option value="active">활성</option>
        <option value="inactive">비활성</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <!-- QR Cards Grid -->
    <div v-else class="qr-grid">
      <div v-for="qr in qrcodes" :key="qr.id" class="qr-card" :class="{ inactive: !qr.isActive }">
        <div class="qr-card-header">
          <div class="qr-info">
            <h3>{{ qr.name }}</h3>
            <p class="qr-owner">{{ qr.user?.nickname || qr.user?.username || '알 수 없음' }}</p>
          </div>
          <span class="status-badge" :class="{ active: qr.isActive }">
            {{ qr.isActive ? '활성' : '비활성' }}
          </span>
        </div>
        <div class="qr-card-body">
          <div class="qr-stats">
            <div class="stat-item">
              <span class="stat-label">조회수</span>
              <span class="stat-value">{{ qr.scanCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">생성일</span>
              <span class="stat-value">{{ formatDate(qr.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div class="qr-card-actions">
          <button class="btn-action" @click="toggleActive(qr)" :title="qr.isActive ? '비활성화' : '활성화'">
            <IconBase :name="qr.isActive ? 'eye-off' : 'eye'" />
            {{ qr.isActive ? '비활성화' : '활성화' }}
          </button>
          <button class="btn-action danger" @click="confirmDelete(qr)">
            <IconBase name="trash" />
            삭제
          </button>
        </div>
      </div>

      <div v-if="qrcodes.length === 0" class="empty-state">
        <IconBase name="qr" class="empty-icon" />
        <p>QR 코드가 없습니다</p>
      </div>
    </div>

    <!-- Pagination -->
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

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const loading = ref(true)
const qrcodes = ref<any[]>([])
const page = ref(1)
const pageSize = ref(12)
const totalPages = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')

let searchTimeout: number | null = null

const fetchQRCodes = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: page.value.toString(),
      pageSize: pageSize.value.toString()
    })

    if (searchQuery.value) params.append('search', searchQuery.value)
    if (statusFilter.value) params.append('isActive', statusFilter.value === 'active' ? 'true' : 'false')

    const response = await fetch(`${API_URL}/api/masteradmin/qrcodes?${params}`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch QR codes')

    const data = await response.json()
    qrcodes.value = data.qrcodes
    totalPages.value = data.totalPages
  } catch (error) {
    console.error('Fetch QR codes error:', error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchQRCodes()
  }, 300) as any
}

const toggleActive = async (qr: any) => {
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/qrcodes/${qr.id}/toggle-active`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to toggle QR status')

    qr.isActive = !qr.isActive
  } catch (error) {
    alert('상태 변경에 실패했습니다')
  }
}

const confirmDelete = async (qr: any) => {
  if (!confirm(`"${qr.name}" QR 코드를 삭제하시겠습니까? 관련 데이터도 모두 삭제됩니다.`)) return

  try {
    const response = await fetch(`${API_URL}/api/masteradmin/qrcodes/${qr.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to delete QR code')

    fetchQRCodes()
    alert('QR 코드가 삭제되었습니다')
  } catch (error) {
    alert('QR 코드 삭제에 실패했습니다')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

watch(page, fetchQRCodes)

onMounted(() => {
  fetchQRCodes()
})
</script>

<style scoped>
.qr-management {
  padding: 0;
}

.page-header {
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

/* Filters */
.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-box {
  flex: 1;
  max-width: 400px;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #d4a853;
  box-shadow: 0 0 0 3px rgba(212, 168, 83, 0.1);
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #86868b;
}

.filters-bar select {
  padding: 12px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 150px;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e5ea;
  border-top-color: #d4a853;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* QR Grid */
.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.qr-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.qr-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.qr-card.inactive {
  opacity: 0.7;
  border-color: #e5e5ea;
}

.qr-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.qr-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.qr-owner {
  font-size: 13px;
  color: #86868b;
  margin: 0;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #fff0f0;
  color: #ff6b6b;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

.qr-card-body {
  margin-bottom: 20px;
}

.qr-stats {
  display: flex;
  gap: 24px;
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
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.qr-card-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #f0f0f0;
}

.btn-action.danger:hover {
  background: #fff0f0;
  color: #ff3b30;
  border-color: #ffcdd2;
}

.btn-action :deep(svg) {
  width: 16px;
  height: 16px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #86868b;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 32px 0;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #f0f0f0;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
