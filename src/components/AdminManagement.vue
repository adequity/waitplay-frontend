<template>
  <div class="admin-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Admin 계정 관리</h1>
        <p class="header-subtitle">WaitPlay Admin 계정을 생성하고 관리합니다</p>
      </div>
      <button class="btn-create" @click="showCreateModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Admin 생성
      </button>
    </div>

    <!-- Admin List -->
    <div class="admin-list">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Admin 목록을 불러오는 중...</p>
      </div>

      <div v-else-if="admins.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <p>등록된 Admin이 없습니다</p>
      </div>

      <div v-else class="admin-cards">
        <div v-for="admin in admins" :key="admin.id" class="admin-card">
          <div class="admin-avatar">
            <img v-if="admin.profileImage" :src="admin.profileImage" alt="프로필" />
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="admin-info">
            <h3>{{ admin.nickname }}</h3>
            <p class="admin-username">{{ admin.username }}</p>
            <p class="admin-company">{{ admin.company }}</p>
            <p class="admin-date">생성일: {{ formatDate(admin.createdAt) }}</p>
          </div>
          <button class="btn-delete" @click="deleteAdmin(admin)" title="계정 삭제">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Create Admin Modal -->
    <div v-if="showCreateModal" class="modal-overlay active" @click.self="closeCreateModal">
      <div class="modal-card create-modal">
        <div class="modal-header">
          <div class="header-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <div class="header-text">
            <h2>새 Admin 계정 생성</h2>
            <p class="header-subtitle">관리자 계정 정보를 입력해주세요</p>
          </div>
          <button class="btn-close" @click="closeCreateModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">사용자명 (이메일)</label>
            <input
              type="email"
              v-model="createForm.username"
              class="form-input"
              placeholder="admin@example.com"
              maxlength="100"
            >
          </div>

          <div class="form-group">
            <label class="form-label">비밀번호</label>
            <input
              type="password"
              v-model="createForm.password"
              class="form-input"
              placeholder="8자 이상의 안전한 비밀번호"
              maxlength="100"
            >
          </div>

          <div class="form-group">
            <label class="form-label">닉네임</label>
            <input
              type="text"
              v-model="createForm.nickname"
              class="form-input"
              placeholder="관리자 이름"
              maxlength="50"
            >
          </div>

          <div class="form-group">
            <label class="form-label">업체명</label>
            <input
              type="text"
              v-model="createForm.company"
              class="form-input"
              placeholder="업체명"
              maxlength="100"
            >
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeCreateModal">취소</button>
          <button class="btn-primary" @click="createAdmin" :disabled="creating">
            <div v-if="creating" class="spinner-small"></div>
            <span v-else>생성하기</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface Admin {
  id: string
  username: string
  nickname: string
  company: string
  userRole: string
  createdAt: string
  profileImage?: string
}

const authStore = useAuthStore()
const loading = ref(false)
const creating = ref(false)
const admins = ref<Admin[]>([])
const showCreateModal = ref(false)

const createForm = ref({
  username: '',
  password: '',
  nickname: '',
  company: ''
})

const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const fetchAdmins = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_URL}/api/superadmin/admins`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch admins')

    const data = await response.json()
    admins.value = data
  } catch (error) {
    console.error('Failed to fetch admins:', error)
    alert('Admin 목록을 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const createAdmin = async () => {
  if (!createForm.value.username || !createForm.value.password) {
    alert('사용자명과 비밀번호는 필수입니다.')
    return
  }

  creating.value = true
  try {
    const response = await fetch(`${API_URL}/api/superadmin/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: JSON.stringify(createForm.value)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create admin')
    }

    alert('Admin 계정이 생성되었습니다.')
    closeCreateModal()
    fetchAdmins()
  } catch (error: any) {
    console.error('Failed to create admin:', error)
    alert(error.message || 'Admin 생성에 실패했습니다.')
  } finally {
    creating.value = false
  }
}

const deleteAdmin = async (admin: Admin) => {
  if (!confirm(`${admin.nickname} (${admin.username}) 계정을 삭제하시겠습니까?`)) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/api/superadmin/admins/${admin.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to delete admin')

    alert('Admin 계정이 삭제되었습니다.')
    fetchAdmins()
  } catch (error) {
    console.error('Failed to delete admin:', error)
    alert('Admin 삭제에 실패했습니다.')
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  createForm.value = {
    username: '',
    password: '',
    nickname: '',
    company: ''
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchAdmins()
})
</script>

<style scoped>
.admin-management {
  padding: 40px;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e5ea;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 800;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.header-subtitle {
  font-size: 15px;
  color: #86868b;
  margin: 0;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  transition: all 0.2s;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

/* Admin List */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #86868b;
}

.loading-state p,
.empty-state p {
  margin-top: 16px;
  font-size: 15px;
}

.empty-state svg {
  color: #d2d2d7;
}

.admin-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.admin-card {
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  transition: all 0.2s;
  position: relative;
}

.admin-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.admin-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid #e5e5ea;
}

.admin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-avatar svg {
  color: white;
}

.admin-info {
  flex: 1;
  min-width: 0;
}

.admin-info h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 6px 0;
}

.admin-username {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 4px 0;
  font-family: 'SF Mono', 'Monaco', monospace;
}

.admin-company {
  font-size: 14px;
  color: #8b5cf6;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.admin-date {
  font-size: 12px;
  color: #aeaeb2;
  margin: 0;
}

.btn-delete {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e5ea;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-delete:hover {
  background: #fff0f3;
  border-color: #ff3b30;
  color: #ff3b30;
}

.btn-delete svg {
  color: #86868b;
  transition: color 0.2s;
}

.btn-delete:hover svg {
  color: #ff3b30;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.modal-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.modal-card {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.modal-overlay.active .modal-card {
  transform: scale(1);
}

.modal-header {
  padding: 32px 32px 24px 32px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.header-icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
}

.header-text {
  flex: 1;
}

.header-text h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-close:hover {
  background: #e5e5ea;
}

.modal-body {
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e5ea;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
  background: #fafafa;
  box-sizing: border-box;
}

.form-input:hover {
  border-color: #d2d2d7;
  background: #ffffff;
}

.form-input:focus {
  border-color: #8b5cf6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.modal-footer {
  padding: 20px 32px 32px 32px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f7;
  color: #1d1d1f;
}

.btn-secondary:hover {
  background: #e5e5ea;
}

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
