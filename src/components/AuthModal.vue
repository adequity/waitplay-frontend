<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">{{ isLoginMode ? '로그인' : '회원가입' }}</h2>
        <button class="btn-close" @click="close">
          <IconBase name="close" :size="20" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Reward Preview -->
        <div v-if="rewardInfo" class="reward-preview">
          <div class="reward-icon">
            <IconBase name="gift" :size="24" />
          </div>
          <div class="reward-text">
            <p class="reward-title">{{ rewardInfo.title }}</p>
            <p class="reward-desc">로그인하면 쿠폰을 받을 수 있어요!</p>
          </div>
        </div>

        <!-- Social Login Buttons -->
        <div class="social-login-section">
          <button class="btn-social btn-kakao" @click="handleKakaoLogin" :disabled="isLoading">
            <span class="social-icon kakao-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3C5.58 3 2 5.91 2 9.5c0 2.28 1.5 4.28 3.77 5.44l-.97 3.56c-.08.29.25.52.49.35l4.25-2.83c.15.01.3.02.46.02 4.42 0 8-2.91 8-6.5S14.42 3 10 3z" fill="#191919"/>
              </svg>
            </span>
            카카오로 {{ isLoginMode ? '로그인' : '시작하기' }}
          </button>
          <button class="btn-social btn-naver" @click="handleNaverLogin" :disabled="isLoading">
            <span class="social-icon naver-icon">N</span>
            네이버로 {{ isLoginMode ? '로그인' : '시작하기' }}
          </button>
        </div>

        <div class="divider">
          <span>또는</span>
        </div>

        <!-- Standard Login Form -->
        <form @submit.prevent="handleStandardLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">아이디</label>
            <input
              v-model="username"
              type="text"
              class="form-input"
              placeholder="아이디를 입력하세요"
              :disabled="isLoading"
            />
          </div>
          <div class="form-group">
            <label class="form-label">비밀번호</label>
            <input
              v-model="password"
              type="password"
              class="form-input"
              placeholder="비밀번호를 입력하세요"
              :disabled="isLoading"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" class="btn-submit" :disabled="isLoading || !canSubmit">
            {{ isLoading ? '처리 중...' : (isLoginMode ? '로그인' : '회원가입') }}
          </button>
        </form>

        <!-- Toggle Mode -->
        <div class="mode-toggle">
          <template v-if="isLoginMode">
            <span>계정이 없으신가요?</span>
            <button @click="isLoginMode = false" class="btn-toggle">회원가입</button>
          </template>
          <template v-else>
            <span>이미 계정이 있으신가요?</span>
            <button @click="isLoginMode = true" class="btn-toggle">로그인</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'

interface Props {
  isOpen: boolean
  qrCodeId?: string
  rewardInfo?: {
    title: string
    description?: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  success: [userId: string]
}>()

const authStore = useAuthStore()

const isLoginMode = ref(true)
const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const canSubmit = computed(() => {
  return username.value.trim() !== '' && password.value.trim() !== ''
})

async function handleStandardLogin() {
  if (!canSubmit.value) return

  isLoading.value = true
  error.value = ''

  try {
    const data = await authStore.standardLogin(
      username.value,
      password.value,
      props.qrCodeId
    )
    emit('success', data.userId)
  } catch (err: any) {
    console.error('Login failed:', err)
    error.value = err.response?.data?.message || '로그인에 실패했습니다'
  } finally {
    isLoading.value = false
  }
}

async function handleKakaoLogin() {
  // Kakao SDK login
  if (typeof window !== 'undefined' && (window as any).Kakao) {
    const Kakao = (window as any).Kakao
    if (!Kakao.isInitialized()) {
      Kakao.init(import.meta.env.VITE_KAKAO_APP_KEY)
    }

    Kakao.Auth.login({
      success: async (authObj: any) => {
        isLoading.value = true
        try {
          const data = await authStore.login('kakao', authObj.access_token)
          emit('success', data.userId)
        } catch (err: any) {
          error.value = '카카오 로그인에 실패했습니다'
        } finally {
          isLoading.value = false
        }
      },
      fail: (err: any) => {
        console.error('Kakao login failed:', err)
        error.value = '카카오 로그인에 실패했습니다'
      }
    })
  } else {
    error.value = '카카오 SDK가 로드되지 않았습니다'
  }
}

async function handleNaverLogin() {
  // Naver login - typically uses popup or redirect
  error.value = '네이버 로그인은 준비 중입니다'
}

function close() {
  emit('close')
  // Reset state
  username.value = ''
  password.value = ''
  error.value = ''
  isLoading.value = false
  isLoginMode.value = true
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: surfaceRise 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes surfaceRise {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5ea;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #86868b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #1d1d1f;
}

.modal-body {
  padding: 24px;
}

.reward-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  border: 1px solid #cce5ff;
  border-radius: 12px;
  margin-bottom: 24px;
}

.reward-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.reward-text {
  flex: 1;
}

.reward-title {
  font-size: 15px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.reward-desc {
  font-size: 13px;
  color: #3b82f6;
  margin: 0;
}

.social-login-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-social:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.naver-icon {
  font-weight: 800;
  font-size: 14px;
}

.btn-kakao {
  background: #FEE500;
  color: #191919;
}

.btn-kakao:hover:not(:disabled) {
  background: #FADA0A;
}

.btn-naver {
  background: #03C75A;
  color: white;
}

.btn-naver:hover:not(:disabled) {
  background: #02B350;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e5ea;
}

.divider span {
  padding: 0 16px;
  font-size: 13px;
  color: #86868b;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #d2d2d7;
  border-radius: 10px;
  font-size: 15px;
  color: #1d1d1f;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #3b82f6;
}

.form-input:disabled {
  background: #f5f5f7;
  cursor: not-allowed;
}

.error-message {
  padding: 12px 16px;
  background: #fff5f5;
  border: 1px solid #ff3b30;
  border-radius: 10px;
  color: #ff3b30;
  font-size: 14px;
  text-align: center;
}

.btn-submit {
  padding: 14px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.mode-toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e5ea;
  font-size: 14px;
  color: #86868b;
}

.btn-toggle {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.btn-toggle:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .modal-container {
    max-width: 100%;
    margin: 10px;
  }
}
</style>
