<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-card">
        <!-- Logo & Title -->
        <div class="auth-header">
          <div class="logo-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="auth-title">WaitPlay</h1>
          <p class="auth-subtitle">고객의 경험을 브랜드의 가치로</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="form-label">아이디</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input
                type="text"
                v-model="username"
                class="form-input"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">비밀번호</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input
                type="password"
                v-model="password"
                class="form-input"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
          </div>

          <div class="form-actions">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" class="checkbox-input" />
              <span>아이디 저장</span>
            </label>
            <router-link :to="qrCodeId ? `/signup?qr=${qrCodeId}` : '/signup'" class="link-text">회원가입</router-link>
          </div>

          <button type="submit" class="btn-primary" :disabled="isLoading">
            {{ isLoading ? '로그인 중...' : '로그인' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span>또는</span>
        </div>

        <!-- Social Login -->
        <div class="social-login">
          <button @click="handleSocialLogin('naver')" type="button" class="btn-social btn-naver">
            <span class="social-icon">N</span>
            네이버로 로그인
          </button>
          <button @click="handleSocialLogin('kakao')" type="button" class="btn-social btn-kakao">
            <span class="social-icon">K</span>
            카카오로 로그인
          </button>
        </div>

        <!-- Footer Links -->
        <div class="auth-footer">
          <span>계정이 없으신가요?</span>
          <router-link :to="qrCodeId ? `/signup?qr=${qrCodeId}` : '/signup'" class="footer-link">회원가입</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const qrCodeId = ref<string | null>(null)

// URL에서 QR 코드 ID 추출
onMounted(() => {
  const qrParam = route.query.qr as string
  if (qrParam) {
    qrCodeId.value = qrParam
    console.log('QR Code ID detected for login:', qrCodeId.value)
  }
})

const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert('아이디와 비밀번호를 입력해주세요.')
    return
  }

  isLoading.value = true

  try {
    const response = await authStore.standardLogin(
      username.value,
      password.value,
      qrCodeId.value || undefined
    )

    alert('로그인 성공!')

    // 역할에 따른 리다이렉션
    if (response.redirectUrl) {
      router.push(response.redirectUrl)
    } else if (response.userRole === 'superadmin') {
      router.push('/superadmin')
    } else if (response.userRole === 'admin') {
      router.push('/admin')
    } else if (qrCodeId.value) {
      router.push(`/customer?qr=${qrCodeId.value}`)
    } else {
      router.push('/')
    }
  } catch (error: any) {
    console.error('Login failed:', error)
    const errorMessage = error.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.'
    alert(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const handleSocialLogin = async (provider: 'naver' | 'kakao') => {
  try {
    // TODO: SNS 로그인 API 연동
    console.log('Social login with:', provider)

    if (provider === 'naver') {
      alert('네이버 로그인 기능은 준비 중입니다.')
    } else if (provider === 'kakao') {
      alert('카카오 로그인 기능은 준비 중입니다.')
    }
  } catch (error) {
    console.error('Social login failed:', error)
    alert('소셜 로그인에 실패했습니다.')
  }
}
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 2rem 1rem;
}

.auth-container {
  width: 100%;
  max-width: 480px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 3rem 2.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

/* Header */
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(30, 136, 229, 0.3);
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.auth-subtitle {
  font-size: 14px;
  color: #757575;
  margin: 0;
  font-weight: 400;
}

/* Form */
.auth-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #9e9e9e;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #1a1a1a;
  transition: all 0.2s;
  box-sizing: border-box;
  background: white;
}

.form-input::placeholder {
  color: #bdbdbd;
}

.form-input:focus {
  outline: none;
  border-color: #1e88e5;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: #616161;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #1e88e5;
}

.link-text {
  font-size: 14px;
  color: #1e88e5;
  text-decoration: none;
  font-weight: 500;
}

.link-text:hover {
  text-decoration: underline;
}

.btn-primary {
  width: 100%;
  padding: 0.875rem;
  background: #1e88e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1976d2;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  position: relative;
  display: inline-block;
  padding: 0 1rem;
  background: white;
  color: #9e9e9e;
  font-size: 13px;
}

/* Social Login */
.social-login {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.social-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 700;
  font-size: 14px;
}

.btn-naver {
  background: #03c75a;
  color: white;
}

.btn-naver:hover {
  background: #02b351;
}

.btn-naver .social-icon {
  background: white;
  color: #03c75a;
}

.btn-kakao {
  background: #fee500;
  color: #3c1e1e;
}

.btn-kakao:hover {
  background: #fdd835;
}

.btn-kakao .social-icon {
  background: #3c1e1e;
  color: #fee500;
}

/* Footer */
.auth-footer {
  text-align: center;
  font-size: 13px;
  color: #757575;
}

.footer-link {
  color: #1e88e5;
  text-decoration: none;
  font-weight: 500;
}

.footer-link:hover {
  text-decoration: underline;
}

.footer-divider {
  margin: 0 0.5rem;
  color: #bdbdbd;
}

@media (max-width: 640px) {
  .auth-card {
    padding: 2.5rem 2rem;
  }

  .auth-title {
    font-size: 24px;
  }
}
</style>
