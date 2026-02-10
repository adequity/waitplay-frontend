<template>
  <div class="accounts-management">
    <div class="page-header">
      <div>
        <h1>계정 관리</h1>
        <p class="subtitle">모든 사용자 계정을 관리합니다</p>
      </div>
      <button class="btn-primary" @click="showCreateModal = true">
        <IconBase name="plus" class="btn-icon" />
        새 계정 생성
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <IconBase name="search" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="사용자명, 닉네임, 회사 검색..."
          @input="debouncedSearch"
        />
      </div>
      <select v-model="roleFilter" @change="fetchAccounts">
        <option value="">전체 역할</option>
        <option value="masteradmin">마스터관리자</option>
        <option value="superadmin">슈퍼관리자</option>
        <option value="admin">관리자</option>
        <option value="user">사용자</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <!-- Accounts Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>사용자</th>
            <th>역할</th>
            <th>회사</th>
            <th>가입일</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accounts" :key="account.id">
            <td>
              <div class="user-cell">
                <div class="user-avatar" :class="account.userRole">
                  {{ getInitial(account.nickname || account.username) }}
                </div>
                <div class="user-info">
                  <p class="user-name">{{ account.nickname || account.username }}</p>
                  <p class="user-email">{{ account.username }}</p>
                </div>
              </div>
            </td>
            <td>
              <span class="role-badge" :class="account.userRole">
                {{ getRoleLabel(account.userRole) }}
              </span>
            </td>
            <td>{{ account.company || '-' }}</td>
            <td>{{ formatDate(account.createdAt) }}</td>
            <td>
              <span class="status-badge" :class="{ active: account.approvalStatus === 'approved' || !account.approvalStatus }">
                {{ account.approvalStatus === 'approved' || !account.approvalStatus ? '활성' : '대기' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-action" @click="openRoleModal(account)" title="역할 변경">
                  <IconBase name="edit" />
                </button>
                <button
                  class="btn-action danger"
                  @click="confirmDelete(account)"
                  title="삭제"
                  :disabled="account.userRole === 'masteradmin'"
                >
                  <IconBase name="trash" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="accounts.length === 0">
            <td colspan="6" class="empty-row">
              검색 결과가 없습니다
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button @click="page = page - 1" :disabled="page <= 1">이전</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button @click="page = page + 1" :disabled="page >= totalPages">다음</button>
      </div>
    </div>

    <!-- Create Account Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>새 계정 생성</h2>
          <button class="btn-close" @click="showCreateModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>사용자명 (이메일)</label>
            <input v-model="newAccount.username" type="text" placeholder="email@example.com" />
          </div>
          <div class="form-group">
            <label>비밀번호</label>
            <input v-model="newAccount.password" type="password" placeholder="비밀번호" />
          </div>
          <div class="form-group">
            <label>닉네임</label>
            <input v-model="newAccount.nickname" type="text" placeholder="닉네임" />
          </div>
          <div class="form-group">
            <label>회사</label>
            <input v-model="newAccount.company" type="text" placeholder="회사명" />
          </div>
          <div class="form-group">
            <label>역할</label>
            <select v-model="newAccount.userRole">
              <option value="admin">관리자</option>
              <option value="superadmin">슈퍼관리자</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCreateModal = false">취소</button>
          <button class="btn-primary" @click="createAccount" :disabled="creating">
            {{ creating ? '생성 중...' : '생성' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Change Role Modal -->
    <div v-if="showRoleModal" class="modal-overlay" @click.self="showRoleModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>역할 변경</h2>
          <button class="btn-close" @click="showRoleModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-info">
            <strong>{{ selectedAccount?.nickname || selectedAccount?.username }}</strong>의 역할을 변경합니다
          </p>
          <div class="form-group">
            <label>새 역할</label>
            <select v-model="newRole">
              <option value="user">사용자</option>
              <option value="admin">관리자</option>
              <option value="superadmin">슈퍼관리자</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showRoleModal = false">취소</button>
          <button class="btn-primary" @click="changeRole" :disabled="changing">
            {{ changing ? '변경 중...' : '변경' }}
          </button>
        </div>
      </div>
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
const accounts = ref<any[]>([])
const page = ref(1)
const pageSize = ref(20)
const totalPages = ref(1)
const searchQuery = ref('')
const roleFilter = ref('')

const showCreateModal = ref(false)
const creating = ref(false)
const newAccount = ref({
  username: '',
  password: '',
  nickname: '',
  company: '',
  userRole: 'admin'
})

const showRoleModal = ref(false)
const selectedAccount = ref<any>(null)
const newRole = ref('')
const changing = ref(false)

let searchTimeout: number | null = null

const fetchAccounts = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: page.value.toString(),
      pageSize: pageSize.value.toString()
    })

    if (searchQuery.value) params.append('search', searchQuery.value)
    if (roleFilter.value) params.append('role', roleFilter.value)

    const response = await fetch(`${API_URL}/api/masteradmin/accounts?${params}`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch accounts')

    const data = await response.json()
    accounts.value = data.accounts
    totalPages.value = data.totalPages
  } catch (error) {
    console.error('Fetch accounts error:', error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchAccounts()
  }, 300) as any
}

const createAccount = async () => {
  try {
    creating.value = true
    const response = await fetch(`${API_URL}/api/masteradmin/accounts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newAccount.value)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create account')
    }

    showCreateModal.value = false
    newAccount.value = { username: '', password: '', nickname: '', company: '', userRole: 'admin' }
    fetchAccounts()
    alert('계정이 생성되었습니다')
  } catch (error: any) {
    alert(error.message || '계정 생성에 실패했습니다')
  } finally {
    creating.value = false
  }
}

const openRoleModal = (account: any) => {
  selectedAccount.value = account
  newRole.value = account.userRole
  showRoleModal.value = true
}

const changeRole = async () => {
  if (!selectedAccount.value) return

  try {
    changing.value = true
    const response = await fetch(`${API_URL}/api/masteradmin/accounts/${selectedAccount.value.id}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newRole: newRole.value })
    })

    if (!response.ok) throw new Error('Failed to change role')

    showRoleModal.value = false
    fetchAccounts()
    alert('역할이 변경되었습니다')
  } catch (error) {
    alert('역할 변경에 실패했습니다')
  } finally {
    changing.value = false
  }
}

const confirmDelete = async (account: any) => {
  if (account.userRole === 'masteradmin') {
    alert('마스터관리자 계정은 삭제할 수 없습니다')
    return
  }

  if (!confirm(`${account.nickname || account.username} 계정을 삭제하시겠습니까?`)) return

  try {
    const response = await fetch(`${API_URL}/api/masteradmin/accounts/${account.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to delete account')

    fetchAccounts()
    alert('계정이 삭제되었습니다')
  } catch (error) {
    alert('계정 삭제에 실패했습니다')
  }
}

const getInitial = (name: string) => {
  return name ? name.charAt(0).toUpperCase() : '?'
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    'masteradmin': '마스터',
    'superadmin': '슈퍼',
    'admin': '관리자',
    'user': '사용자'
  }
  return labels[role] || role
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

watch(page, fetchAccounts)

onMounted(() => {
  fetchAccounts()
})
</script>

<style scoped>
.accounts-management {
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

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #d4a853, #b8942e);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(212, 168, 83, 0.4);
}

.btn-icon {
  width: 18px;
  height: 18px;
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

/* Table */
.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.data-table th {
  font-size: 12px;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  background: #fafafa;
}

.data-table tbody tr:hover {
  background: #fafafa;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: #86868b;
}

.user-avatar.masteradmin { background: linear-gradient(135deg, #d4a853, #b8942e); }
.user-avatar.superadmin { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.user-avatar.admin { background: linear-gradient(135deg, #0071e3, #0058b0); }

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.user-email {
  font-size: 12px;
  color: #86868b;
  margin: 0;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #f0f0f0;
  color: #86868b;
}

.role-badge.masteradmin { background: #fef3c7; color: #b8942e; }
.role-badge.superadmin { background: #ede9fe; color: #7c3aed; }
.role-badge.admin { background: #dbeafe; color: #1d4ed8; }

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

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #f0f0f0;
  color: #86868b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #e5e5ea;
  color: #1d1d1f;
}

.btn-action.danger:hover {
  background: #fff0f0;
  color: #ff3b30;
}

.btn-action:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-action :deep(svg) {
  width: 16px;
  height: 16px;
}

.empty-row {
  text-align: center !important;
  color: #86868b;
  padding: 48px !important;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
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
}

.modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f0f0f0;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e5ea;
}

.modal-body {
  padding: 24px;
}

.modal-info {
  margin: 0 0 20px 0;
  color: #86868b;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #d4a853;
  box-shadow: 0 0 0 3px rgba(212, 168, 83, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f0f0f0;
}

.btn-secondary {
  padding: 12px 24px;
  background: #f0f0f0;
  color: #1d1d1f;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e5ea;
}

.modal-footer .btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
