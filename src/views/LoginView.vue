<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">로그인</h1>
          <p class="login-subtitle">WaitPlay에 오신 것을 환영합니다</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">이메일</label>
            <input
              type="email"
              v-model="email"
              class="form-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">비밀번호</label>
            <input
              type="password"
              v-model="password"
              class="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <div class="form-actions">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" />
              <span>로그인 상태 유지</span>
            </label>
            <a href="#" class="forgot-link">비밀번호 찾기</a>
          </div>

          <button type="submit" class="btn-login" :disabled="isLoading">
            {{ isLoading ? '로그인 중...' : '로그인' }}
          </button>
        </form>

        <div class="divider">
          <span>또는</span>
        </div>

        <div class="social-login">
          <button @click="handleSocialLogin('naver')" class="btn-social btn-naver">
            <span class="social-icon">N</span>
            네이버로 로그인
          </button>
          <button @click="handleSocialLogin('kakao')" class="btn-social btn-kakao">
            <span class="social-icon">K</span>
            카카오로 로그인
          </button>
        </div>

        <div class="signup-prompt">
          <p>아직 계정이 없으신가요?</p>
          <router-link to="/signup" class="signup-link">회원가입</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true

  try {
    // TODO: API 호출하여 로그인 처리
    console.log('Login with:', { email: email.value, password: password.value, rememberMe: rememberMe.value })

    // 임시: 로그인 성공 후 홈으로 이동
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
    alert('로그인에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isLoading.value = false
  }
}

const handleSocialLogin = async (provider: 'naver' | 'kakao') => {
  try {
    // TODO: SNS 로그인 API 연동
    console.log('Social login with:', provider)

    if (provider === 'naver') {
      // 네이버 로그인 처리
      alert('네이버 로그인 기능은 준비 중입니다.')
    } else if (provider === 'kakao') {
      // 카카오 로그인 처리
      alert('카카오 로그인 기능은 준비 중입니다.')
    }
  } catch (error) {
    console.error('Social login failed:', error)
    alert('소셜 로그인에 실패했습니다.')
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

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
  background: #e5e7eb;
}

.divider span {
  position: relative;
  display: inline-block;
  padding: 0 1rem;
  background: white;
  color: #9ca3af;
  font-size: 14px;
}

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
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.social-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 700;
  font-size: 16px;
}

.btn-naver {
  background: #03c75a;
  color: white;
}

.btn-naver:hover {
  background: #02b351;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(3, 199, 90, 0.3);
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
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(254, 229, 0, 0.3);
}

.btn-kakao .social-icon {
  background: #3c1e1e;
  color: #fee500;
}

.signup-prompt {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.signup-prompt p {
  margin: 0 0 0.5rem 0;
}

.signup-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.signup-link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 24px;
  }
}
</style>
