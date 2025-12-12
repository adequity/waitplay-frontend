<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">가맹점 관리</h1>
      <p class="page-desc">등록된 가맹점 현황을 조회하고 관리할 수 있습니다.</p>
    </div>

    <!-- Main Card -->
    <div class="content-card">
      <!-- Toolbar -->
      <div class="card-toolbar">
        <div class="toolbar-left">
          <h2 class="card-label">가맹점 목록</h2>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="search-box">
          <IconBase name="search" class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="가맹점명, 사업주 검색..."
            class="search-input"
          >
        </div>
        <div class="select-wrapper">
          <select v-model="statusFilter" class="filter-select">
            <option value="all">전체 상태</option>
            <option value="active">운영중</option>
            <option value="pending">승인대기</option>
          </select>
          <IconBase name="chevron-down" class="select-icon" />
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th width="100">상태</th>
              <th>가맹점명</th>
              <th>지역</th>
              <th>사업주</th>
              <th>연락처</th>
              <th>가입일</th>
              <th width="100">이용자 수</th>
              <th width="140">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="loading-state">
                <div class="spinner"></div>
                <p>데이터를 불러오는 중...</p>
              </td>
            </tr>
            <tr v-else-if="filteredFranchises.length === 0">
              <td colspan="8" class="empty-state">
                검색 결과가 없습니다.
              </td>
            </tr>
            <tr v-for="store in filteredFranchises" :key="store.id" class="data-row">
              <td>
                <span class="badge" :class="store.status">
                  {{ getStatusLabel(store.status) }}
                </span>
              </td>
              <td>
                <span class="text-link">
                  {{ store.name }}
                </span>
              </td>
              <td class="text-gray">{{ store.location }}</td>
              <td class="text-dark">{{ store.owner }}</td>
              <td class="text-gray">{{ store.phone }}</td>
              <td class="text-gray">{{ formatDate(store.joinedAt) }}</td>
              <td class="text-number">{{ store.users.toLocaleString() }}</td>
              <td>
                <div class="action-group">
                  <button v-if="store.status === 'pending'" class="btn-action success" @click="approveStore(store.id)">승인</button>
                  <button v-if="store.status === 'pending'" class="btn-action danger" @click="rejectStore(store.id)">거부</button>
                  <button v-if="store.status === 'active'" class="btn-action danger" @click="removeStore(store.id)">해제</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'

interface Franchise {
  id: string
  status: 'active' | 'pending'
  name: string
  location: string
  owner: string
  phone: string
  joinedAt: string
  users: number
}

const authStore = useAuthStore()
const searchQuery = ref('')
const statusFilter = ref('all')
const loading = ref(false)
const franchises = ref<Franchise[]>([])

const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

// Computed
const filteredFranchises = computed(() => {
  let result = franchises.value

  // Status Filter
  if (statusFilter.value !== 'all') {
    result = result.filter(f => f.status === statusFilter.value)
  }

  // Search Filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.owner.toLowerCase().includes(query)
    )
  }

  return result
})

// Methods
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: '운영중',
    pending: '승인대기'
  }
  return labels[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// API Calls
const fetchAdmins = async () => {
  loading.value = true
  try {
    // 승인된 Admin 조회
    const approvedResponse = await fetch(`${API_URL}/api/superadmin/admins`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    // 승인 대기 Admin 조회
    const pendingResponse = await fetch(`${API_URL}/api/superadmin/admins/pending`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!approvedResponse.ok || !pendingResponse.ok) {
      throw new Error('Failed to fetch admins')
    }

    const approvedData = await approvedResponse.json()
    const pendingData = await pendingResponse.json()

    franchises.value = [...approvedData, ...pendingData]
  } catch (error) {
    console.error('Failed to fetch admins:', error)
    alert('Admin 목록을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const approveStore = async (id: string) => {
  if (!confirm('이 가맹점을 승인하시겠습니까?')) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/api/superadmin/admins/${id}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to approve admin')

    alert('가맹점이 승인되었습니다.')
    fetchAdmins()
  } catch (error) {
    console.error('Failed to approve admin:', error)
    alert('가맹점 승인에 실패했습니다.')
  }
}

const rejectStore = async (id: string) => {
  if (!confirm('이 가맹점을 거부하시겠습니까?')) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/api/superadmin/admins/${id}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to reject admin')

    alert('가맹점이 거부되었습니다.')
    fetchAdmins()
  } catch (error) {
    console.error('Failed to reject admin:', error)
    alert('가맹점 거부에 실패했습니다.')
  }
}

const removeStore = async (id: string) => {
  if (!confirm('이 가맹점을 소속에서 해제하시겠습니까?')) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/api/superadmin/admins/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to remove admin')

    alert('가맹점이 소속에서 해제되었습니다.')
    fetchAdmins()
  } catch (error) {
    console.error('Failed to remove admin:', error)
    alert('가맹점 해제에 실패했습니다.')
  }
}

onMounted(() => {
  fetchAdmins()
})
</script>

<style scoped>
/* Common Variables */
.tab-content {
  --primary-purple: #8b5cf6;
  --primary-purple-dark: #7c3aed;
  --text-dark: #1d1d1f;
  --text-gray: #86868b;
  --bg-body: #f5f5f7;
  --border-light: #e5e5ea;
  --border-color: #d2d2d7;
  --success-green: #34c759;
  --warning-orange: #ff9f0a;

  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding-top: 20px;
}

/* Page Header */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.page-desc {
  color: var(--text-gray);
  font-size: 15px;
}

/* Content Card */
.content-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.02);
  overflow: hidden;
}

/* Toolbar */
.card-toolbar {
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-label {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-dark);
}

/* Filter Bar */
.filter-bar {
  padding: 20px 32px;
  background: #f9f9fa;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  gap: 12px;
}

.search-box {
  position: relative;
  width: 320px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-gray);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: var(--primary-purple);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  background: white;
}

.select-wrapper {
  position: relative;
  width: 160px;
}

.filter-select {
  width: 100%;
  padding: 12px 36px 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-dark);
  background: white;
  cursor: pointer;
  appearance: none;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-purple);
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-gray);
  pointer-events: none;
}

/* Table */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 16px 32px;
  background: white;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 600;
}

.data-table td {
  padding: 16px 32px;
  border-bottom: 1px solid #f5f5f7;
  font-size: 14px;
  vertical-align: middle;
}

.data-row {
  transition: background 0.2s;
}

.data-row:hover {
  background: #fbfbfd;
}

/* Status Badge */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge.active {
  background: #dcfce7;
  color: #166534;
}

.badge.pending {
  background: #ffedd5;
  color: #9a3412;
}

/* Text Styles */
.text-link {
  color: var(--primary-purple);
  font-weight: 600;
}

.text-dark { color: var(--text-dark); font-weight: 500; }
.text-gray { color: var(--text-gray); }
.text-number { font-family: monospace; font-size: 14px; color: var(--text-dark); }

/* Actions */
.action-group {
  display: flex;
  gap: 6px;
}

.btn-action {
  padding: 6px 12px;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-dark);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #f5f5f7;
  border-color: var(--border-color);
}

.btn-action.success {
  color: #16a34a;
  border-color: #dcfce7;
}
.btn-action.success:hover {
  background: #dcfce7;
}

.btn-action.danger {
  color: #dc2626;
}
.btn-action.danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-gray);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: var(--primary-purple);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
