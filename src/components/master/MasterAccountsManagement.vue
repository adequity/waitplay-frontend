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
    <LoadingSpinner v-if="loading" message="계정 정보를 불러오는 중..." />

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
          <tr
            v-for="account in accounts"
            :key="account.id"
            @click="openDetailModal(account)"
            class="clickable-row"
          >
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
            <td @click.stop>
              <div class="action-buttons">
                <button class="btn-action" @click="openEditModal(account)" title="수정">
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
          <tr v-if="!accounts || accounts.length === 0">
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

    <!-- Account Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h2>계정 상세 정보</h2>
          <button class="btn-close" @click="showDetailModal = false">&times;</button>
        </div>
        <div class="modal-body compact" v-if="detailAccount">
          <div class="detail-grid-compact">
            <div class="detail-row">
              <span class="detail-label">ID</span>
              <span class="detail-value monospace">{{ detailAccount.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">이메일</span>
              <span class="detail-value">{{ detailAccount.username || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">닉네임</span>
              <span class="detail-value">{{ detailAccount.nickname || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">역할</span>
              <span class="detail-value"><span class="role-badge" :class="detailAccount.userRole">{{ getRoleLabel(detailAccount.userRole) }}</span></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">회사</span>
              <span class="detail-value">{{ detailAccount.company || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">승인 상태</span>
              <span class="detail-value"><span class="status-badge" :class="{ active: detailAccount.approvalStatus === 'approved' || !detailAccount.approvalStatus }">{{ detailAccount.approvalStatus === 'approved' || !detailAccount.approvalStatus ? '활성' : '대기' }}</span></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">가입일</span>
              <span class="detail-value">{{ formatDateTime(detailAccount.createdAt) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">프로필 이미지</span>
              <span class="detail-value">{{ detailAccount.profileImage ? '있음' : '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">카카오 ID</span>
              <span class="detail-value monospace">{{ detailAccount.kakaoId || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">네이버 ID</span>
              <span class="detail-value monospace">{{ detailAccount.naverId || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">초대 코드</span>
              <span class="detail-value monospace">{{ detailAccount.inviteCode || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">상위 관리자 ID</span>
              <span class="detail-value monospace">{{ detailAccount.superAdminId || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">가입 경유 매장</span>
              <span class="detail-value monospace">{{ detailAccount.registeredViaAdminId || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">승인일</span>
              <span class="detail-value">{{ detailAccount.approvedAt ? formatDateTime(detailAccount.approvedAt) : '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">사업자 번호</span>
              <span class="detail-value">{{ detailAccount.businessNumber || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">사업장 주소</span>
              <span class="detail-value">{{ detailAccount.businessAddress || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">업종</span>
              <span class="detail-value">{{ detailAccount.businessType || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">업태</span>
              <span class="detail-value">{{ detailAccount.businessCategory || '-' }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDetailModal = false">닫기</button>
          <button class="btn-primary" @click="openEditModalFromDetail">수정</button>
        </div>
      </div>
    </div>

    <!-- Edit Account Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h2>계정 수정</h2>
          <button class="btn-close" @click="showEditModal = false">&times;</button>
        </div>
        <div class="modal-body compact">
          <div class="edit-grid-compact">
            <div class="form-group-compact">
              <label>사용자명 (이메일)</label>
              <input v-model="editAccount.username" type="text" placeholder="email@example.com" />
            </div>
            <div class="form-group-compact">
              <label>새 비밀번호</label>
              <input v-model="editAccount.password" type="password" placeholder="변경 시에만 입력" />
            </div>
            <div class="form-group-compact">
              <label>닉네임</label>
              <input v-model="editAccount.nickname" type="text" placeholder="닉네임" />
            </div>
            <div class="form-group-compact">
              <label>회사</label>
              <input v-model="editAccount.company" type="text" placeholder="회사명" />
            </div>
          </div>
          <div class="edit-grid-compact" style="margin-top: 12px;">
            <div class="form-group-compact full-width">
              <label>역할</label>
              <select v-model="editAccount.userRole" :disabled="editAccount.userRole === 'masteradmin'">
                <option value="user">사용자</option>
                <option value="admin">관리자</option>
                <option value="superadmin">슈퍼관리자</option>
                <option value="masteradmin" v-if="editAccount.userRole === 'masteradmin'">마스터관리자</option>
              </select>
            </div>
          </div>

          <!-- 사업자 정보 (admin 또는 superadmin 역할인 경우) -->
          <div v-if="editAccount.userRole === 'admin' || editAccount.userRole === 'superadmin'" class="business-info-section compact">
            <h4>사업자 정보</h4>
            <div class="edit-grid-compact">
              <div class="form-group-compact">
                <label>사업자 번호</label>
                <input v-model="editAccount.businessNumber" type="text" placeholder="000-00-00000" />
              </div>
              <div class="form-group-compact">
                <label>사업장 주소</label>
                <input v-model="editAccount.businessAddress" type="text" placeholder="사업장 주소" />
              </div>
              <div class="form-group-compact">
                <label>업종</label>
                <input v-model="editAccount.businessType" type="text" placeholder="업종" />
              </div>
              <div class="form-group-compact">
                <label>업태</label>
                <input v-model="editAccount.businessCategory" type="text" placeholder="업태" />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showEditModal = false">취소</button>
          <button class="btn-primary" @click="updateAccount" :disabled="updating">
            {{ updating ? '저장 중...' : '저장' }}
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
import LoadingSpinner from '@/components/LoadingSpinner.vue'

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

const showDetailModal = ref(false)
const detailAccount = ref<any>(null)
const detailLoading = ref(false)

const showEditModal = ref(false)
const editAccount = ref({
  id: '',
  username: '',
  password: '',
  nickname: '',
  company: '',
  userRole: '',
  businessNumber: '',
  businessAddress: '',
  businessType: '',
  businessCategory: ''
})
const updating = ref(false)

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
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Failed to fetch accounts')

    const data = await response.json()
    accounts.value = data.data ?? []
    totalPages.value = data.totalPages ?? 1
  } catch (error) {
    console.error('Fetch accounts error:', error)
    accounts.value = []
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

const fetchAccountDetail = async (accountId: string) => {
  try {
    detailLoading.value = true
    const response = await fetch(`${API_URL}/api/masteradmin/accounts/${accountId}`, {
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Failed to fetch account detail')

    detailAccount.value = await response.json()
  } catch (error) {
    console.error('Fetch account detail error:', error)
    alert('계정 정보를 불러오는데 실패했습니다')
  } finally {
    detailLoading.value = false
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
      credentials: 'include',
      headers: {
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

const openDetailModal = async (account: any) => {
  showDetailModal.value = true
  await fetchAccountDetail(account.id)
}

const openEditModal = (account: any) => {
  editAccount.value = {
    id: account.id,
    username: account.username || '',
    password: '',
    nickname: account.nickname || '',
    company: account.company || '',
    userRole: account.userRole,
    businessNumber: account.businessNumber || '',
    businessAddress: account.businessAddress || '',
    businessType: account.businessType || '',
    businessCategory: account.businessCategory || ''
  }
  showEditModal.value = true
}

const openEditModalFromDetail = () => {
  if (detailAccount.value) {
    openEditModal(detailAccount.value)
    showDetailModal.value = false
  }
}

const updateAccount = async () => {
  try {
    updating.value = true

    // Update account info
    const updateData: any = {}
    if (editAccount.value.username) updateData.username = editAccount.value.username
    if (editAccount.value.password) updateData.password = editAccount.value.password
    if (editAccount.value.nickname) updateData.nickname = editAccount.value.nickname
    if (editAccount.value.company !== undefined) updateData.company = editAccount.value.company
    if (editAccount.value.businessNumber !== undefined) updateData.businessNumber = editAccount.value.businessNumber
    if (editAccount.value.businessAddress !== undefined) updateData.businessAddress = editAccount.value.businessAddress
    if (editAccount.value.businessType !== undefined) updateData.businessType = editAccount.value.businessType
    if (editAccount.value.businessCategory !== undefined) updateData.businessCategory = editAccount.value.businessCategory

    const response = await fetch(`${API_URL}/api/masteradmin/accounts/${editAccount.value.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update account')
    }

    // Update role if changed
    const originalAccount = accounts.value.find(a => a.id === editAccount.value.id)
    if (originalAccount && originalAccount.userRole !== editAccount.value.userRole && editAccount.value.userRole !== 'masteradmin') {
      const roleResponse = await fetch(`${API_URL}/api/masteradmin/accounts/${editAccount.value.id}/role`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: editAccount.value.userRole })
      })

      if (!roleResponse.ok) {
        console.warn('Role update failed')
      }
    }

    showEditModal.value = false
    fetchAccounts()
    alert('계정이 수정되었습니다')
  } catch (error: any) {
    alert(error.message || '계정 수정에 실패했습니다')
  } finally {
    updating.value = false
  }
}

const confirmDelete = async (account: any) => {
  if (account.userRole === 'masteradmin') {
    alert('마스터관리자 계정은 삭제할 수 없습니다')
    return
  }

  if (!confirm(`${account.nickname || account.username} 계정을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return

  try {
    const response = await fetch(`${API_URL}/api/masteradmin/accounts/${account.id}`, {
      method: 'DELETE',
      credentials: 'include'
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

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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

.data-table tbody tr.clickable-row {
  cursor: pointer;
  transition: background 0.2s;
}

.data-table tbody tr.clickable-row:hover {
  background: #f8f8f8;
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
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal.modal-wide {
  max-width: 720px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
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

/* Detail Grid */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.detail-section {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
}

.detail-section h3 {
  font-size: 13px;
  font-weight: 600;
  color: #86868b;
  margin: 0 0 12px 0;
  text-transform: uppercase;
}

.detail-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 12px;
  color: #86868b;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  color: #1d1d1f;
  word-break: break-all;
}

.detail-value.monospace {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
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

.form-group select:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
}

.business-info-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e5ea;
}

.business-info-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f0f0f0;
  position: sticky;
  bottom: 0;
  background: white;
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

/* Compact Detail Grid (2-column continuous layout) */
.modal-body.compact {
  padding: 16px 24px;
}

.detail-grid-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 24px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
}

.detail-row .detail-label {
  flex: 0 0 90px;
  font-size: 12px;
  color: #86868b;
  margin: 0;
}

.detail-row .detail-value {
  flex: 1;
  font-size: 13px;
  color: #1d1d1f;
  word-break: break-all;
}

.detail-row .detail-value.monospace {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.detail-row .role-badge,
.detail-row .status-badge {
  padding: 2px 8px;
  font-size: 11px;
}

/* Compact Edit Grid */
.edit-grid-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 20px;
}

.form-group-compact {
  margin-bottom: 0;
}

.form-group-compact.full-width {
  grid-column: 1 / -1;
}

.form-group-compact label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.form-group-compact input,
.form-group-compact select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.2s;
}

.form-group-compact input:focus,
.form-group-compact select:focus {
  outline: none;
  border-color: #d4a853;
  box-shadow: 0 0 0 3px rgba(212, 168, 83, 0.1);
}

.form-group-compact select:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
}

.business-info-section.compact {
  margin-top: 16px;
  padding-top: 16px;
}

.business-info-section.compact h4 {
  font-size: 13px;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid-compact {
    grid-template-columns: 1fr;
  }

  .edit-grid-compact {
    grid-template-columns: 1fr;
  }
}
</style>
