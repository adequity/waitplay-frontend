<template>
  <div class="settings-view">
    <!-- 헤더 -->
    <header class="page-header">
      <button @click="goBack" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="page-title">설정</h1>
      <div class="header-spacer"></div>
    </header>

    <div class="settings-body">
      <!-- 계정 정보 섹션 -->
      <section class="settings-section">
        <h3 class="section-title">계정 정보</h3>

        <div class="setting-item">
          <span class="setting-label">이메일</span>
          <span class="setting-value">{{ user?.kakaoId ? '카카오 로그인' : user?.naverId ? '네이버 로그인' : (user as any)?.username || '-' }}</span>
        </div>

        <div class="setting-item">
          <span class="setting-label">가입일</span>
          <span class="setting-value">{{ formatDate(user?.createdAt) }}</span>
        </div>
      </section>

      <!-- 비밀번호 변경 섹션 (이메일 가입자만) -->
      <section v-if="hasPassword" class="settings-section">
        <h3 class="section-title">비밀번호 변경</h3>

        <div class="form-field">
          <label class="form-label">현재 비밀번호</label>
          <input v-model="passwordForm.current" type="password" class="form-input" placeholder="현재 비밀번호"/>
        </div>

        <div class="form-field">
          <label class="form-label">새 비밀번호</label>
          <input v-model="passwordForm.newPw" type="password" class="form-input" placeholder="8자 이상"/>
        </div>

        <div class="form-field">
          <label class="form-label">새 비밀번호 확인</label>
          <input v-model="passwordForm.confirm" type="password" class="form-input" placeholder="새 비밀번호 확인"/>
        </div>

        <button class="settings-btn" :disabled="isChangingPassword" @click="handleChangePassword">
          {{ isChangingPassword ? '변경 중...' : '비밀번호 변경' }}
        </button>
      </section>

      <!-- 로그아웃 -->
      <section class="settings-section">
        <button class="settings-btn logout-btn" @click="handleLogout">로그아웃</button>
      </section>

      <!-- 계정 삭제 -->
      <section class="settings-section danger-section">
        <h3 class="section-title danger">계정 삭제</h3>
        <p class="danger-text">계정을 삭제하면 모든 방명록, 좋아요, 알림 데이터가 영구적으로 삭제되며 복구할 수 없습니다.</p>
        <button class="settings-btn danger-btn" @click="showDeleteConfirm = true">계정 삭제</button>
      </section>
    </div>

    <!-- 계정 삭제 확인 모달 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal-content delete-modal">
        <h3 class="delete-modal-title">정말 계정을 삭제하시겠습니까?</h3>
        <p class="delete-modal-desc">이 작업은 되돌릴 수 없습니다. 모든 데이터가 삭제됩니다.</p>

        <div v-if="hasPassword" class="form-field" style="margin-top: 1rem;">
          <label class="form-label">비밀번호를 입력하세요</label>
          <input v-model="deletePassword" type="password" class="form-input" placeholder="비밀번호 확인"/>
        </div>

        <div class="delete-modal-actions">
          <button class="modal-action-btn cancel" @click="showDeleteConfirm = false">취소</button>
          <button class="modal-action-btn delete" :disabled="isDeletingAccount || (hasPassword && !deletePassword)" @click="handleDeleteAccount">
            {{ isDeletingAccount ? '삭제 중...' : '삭제' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 토스트 -->
    <Transition name="toast">
      <div v-if="showToast" class="toast" :class="toastType">{{ toastMessage }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/authService'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

// SNS 가입자는 비밀번호가 없음
const hasPassword = computed(() => {
  if (!user.value) return false
  return !user.value.kakaoId && !user.value.naverId
})

const passwordForm = ref({ current: '', newPw: '', confirm: '' })
const isChangingPassword = ref(false)

const showDeleteConfirm = ref(false)
const deletePassword = ref('')
const isDeletingAccount = ref(false)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchUser()
  }
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function toast(msg: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = msg
  toastType.value = type
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2500)
}

async function handleChangePassword() {
  if (!passwordForm.value.current || !passwordForm.value.newPw) {
    toast('모든 필드를 입력해주세요.', 'error')
    return
  }
  if (passwordForm.value.newPw.length < 8) {
    toast('새 비밀번호는 8자 이상이어야 합니다.', 'error')
    return
  }
  if (passwordForm.value.newPw !== passwordForm.value.confirm) {
    toast('새 비밀번호가 일치하지 않습니다.', 'error')
    return
  }

  isChangingPassword.value = true
  try {
    await authService.changePassword(passwordForm.value.current, passwordForm.value.newPw)
    passwordForm.value = { current: '', newPw: '', confirm: '' }
    toast('비밀번호가 변경되었습니다.')
  } catch (e: any) {
    toast(e?.response?.data?.message || '비밀번호 변경에 실패했습니다.', 'error')
  } finally {
    isChangingPassword.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

async function handleDeleteAccount() {
  isDeletingAccount.value = true
  try {
    await authService.deleteAccount(hasPassword.value ? deletePassword.value : undefined)
    authStore.logout()
    router.push('/login')
  } catch (e: any) {
    toast(e?.response?.data?.message || '계정 삭제에 실패했습니다.', 'error')
  } finally {
    isDeletingAccount.value = false
  }
}
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  background: #fafafa;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: white;
  border-bottom: 1px solid #efefef;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #262626;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

.settings-body {
  padding: 0 0 2rem;
}

.settings-section {
  background: white;
  padding: 1.25rem 1rem;
  margin-bottom: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #262626;
  margin: 0 0 1rem;
}

.section-title.danger {
  color: #ed4956;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.setting-item:not(:last-child) {
  border-bottom: 1px solid #f5f5f5;
}

.setting-label {
  font-size: 14px;
  color: #8e8e8e;
}

.setting-value {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

.form-field {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #8e8e8e;
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  font-size: 15px;
  color: #262626;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #262626;
}

.settings-btn {
  width: 100%;
  padding: 12px;
  background: #262626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.settings-btn:hover {
  background: #363636;
}

.settings-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.logout-btn {
  background: white;
  color: #262626;
  border: 1px solid #dbdbdb;
}

.logout-btn:hover {
  background: #fafafa;
}

.danger-section {
  border-top: 1px solid #fce4e4;
}

.danger-text {
  font-size: 13px;
  color: #8e8e8e;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.danger-btn {
  background: #ed4956;
}

.danger-btn:hover {
  background: #d63742;
}

/* 삭제 확인 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 360px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.delete-modal {
  padding: 1.5rem;
  text-align: center;
}

.delete-modal-title {
  font-size: 17px;
  font-weight: 700;
  color: #262626;
  margin: 0 0 0.5rem;
}

.delete-modal-desc {
  font-size: 14px;
  color: #8e8e8e;
  margin: 0;
  line-height: 1.5;
}

.delete-modal-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.modal-action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.modal-action-btn.cancel {
  background: #efefef;
  color: #262626;
}

.modal-action-btn.delete {
  background: #ed4956;
  color: white;
}

.modal-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 토스트 */
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.toast.success {
  background: #262626;
  color: white;
}

.toast.error {
  background: #ed4956;
  color: white;
}

.toast-enter-active { animation: toastIn 0.3s ease; }
.toast-leave-active { animation: toastIn 0.3s ease reverse; }
@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
