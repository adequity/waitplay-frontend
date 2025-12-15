<template>
  <div class="forgot-password-view">
    <div class="forgot-password-container">
      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo">
          <svg class="logo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h1 class="app-name">WaitPlay</h1>
        <p class="page-title">비밀번호 찾기</p>
      </div>

      <!-- Step 1: Email Input -->
      <div v-if="step === 1" class="form-section">
        <p class="form-description">
          가입 시 사용한 이메일을 입력해주세요.<br>
          인증 코드를 발송해드립니다.
        </p>

        <form @submit.prevent="handleRequestCode" class="form">
          <div class="input-group">
            <label class="input-label">이메일</label>
            <div class="input-wrapper">
              <svg class="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                v-model="email"
                type="email"
                placeholder="이메일을 입력하세요"
                class="input"
                required
              />
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <button type="submit" class="btn-primary" :disabled="isLoading">
            <span v-if="!isLoading">인증 코드 받기</span>
            <span v-else>발송 중...</span>
          </button>
        </form>
      </div>

      <!-- Step 2: Verification Code Input -->
      <div v-if="step === 2" class="form-section">
        <p class="form-description">
          <strong>{{ maskedEmail }}</strong>으로<br>
          발송된 인증 코드를 입력해주세요.
        </p>

        <form @submit.prevent="handleVerifyCode" class="form">
          <div class="input-group">
            <label class="input-label">인증 코드</label>
            <div class="input-wrapper">
              <svg class="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                v-model="verificationCode"
                type="text"
                placeholder="6자리 인증 코드"
                class="input"
                maxlength="6"
                required
              />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">새 비밀번호</label>
            <div class="input-wrapper">
              <svg class="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                v-model="newPassword"
                type="password"
                placeholder="새 비밀번호 (8자 이상)"
                class="input"
                minlength="8"
                required
              />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">새 비밀번호 확인</label>
            <div class="input-wrapper">
              <svg class="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="새 비밀번호 확인"
                class="input"
                minlength="8"
                required
              />
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-primary" :disabled="isLoading">
            <span v-if="!isLoading">비밀번호 변경</span>
            <span v-else>변경 중...</span>
          </button>

          <button type="button" class="btn-secondary" @click="resendCode" :disabled="isLoading">
            인증 코드 재발송
          </button>
        </form>
      </div>

      <!-- Step 3: Success -->
      <div v-if="step === 3" class="form-section success-section">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 class="success-title">비밀번호 변경 완료</h2>
        <p class="success-description">
          비밀번호가 성공적으로 변경되었습니다.<br>
          새 비밀번호로 로그인해주세요.
        </p>
        <router-link to="/login" class="btn-primary">로그인하기</router-link>
      </div>

      <!-- Back to Login -->
      <div class="footer-section">
        <router-link to="/login" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          로그인으로 돌아가기
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const step = ref(1)
const email = ref('')
const maskedEmail = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRequestCode = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || '인증 코드 발송에 실패했습니다.'
      return
    }

    maskedEmail.value = data.maskedEmail || email.value
    successMessage.value = data.message

    // 2초 후 다음 단계로 이동
    setTimeout(() => {
      step.value = 2
      successMessage.value = ''
    }, 2000)

  } catch (error) {
    console.error('Failed to request code:', error)
    errorMessage.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}

const handleVerifyCode = async () => {
  errorMessage.value = ''

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = '새 비밀번호가 일치하지 않습니다.'
    return
  }

  if (newPassword.value.length < 8) {
    errorMessage.value = '비밀번호는 8자 이상이어야 합니다.'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        verificationCode: verificationCode.value,
        newPassword: newPassword.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || '비밀번호 변경에 실패했습니다.'
      return
    }

    // 성공 화면으로 이동
    step.value = 3

  } catch (error) {
    console.error('Failed to reset password:', error)
    errorMessage.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}

const resendCode = async () => {
  verificationCode.value = ''
  await handleRequestCode()
}
</script>

<style scoped>
.forgot-password-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.forgot-password-container {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

/* Logo Section */
.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007aff 0%, #005ecb 100%);
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
}

.logo-icon-svg {
  width: 36px;
  height: 36px;
  color: white;
}

.app-name {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.page-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 16px;
  color: #8e8e93;
  margin: 0;
  font-weight: 500;
}

/* Form Section */
.form-section {
  margin-bottom: 24px;
}

.form-description {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  color: #6e6e73;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.6;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.01em;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  padding: 12px 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-wrapper:focus-within {
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.input-icon-svg {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  color: #8e8e93;
  flex-shrink: 0;
}

.input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 16px;
  color: #1d1d1f;
  font-weight: 400;
}

.input::placeholder {
  color: #c7c7cc;
}

/* Messages */
.error-message {
  padding: 12px 16px;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 10px;
  color: #ff4d4f;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.success-message {
  padding: 12px 16px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 10px;
  color: #52c41a;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

/* Buttons */
.btn-primary {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #007aff 0%, #005ecb 100%);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  text-decoration: none;
  text-align: center;
  display: block;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 122, 255, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  width: 100%;
  padding: 14px 24px;
  background: transparent;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  color: #007aff;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-secondary:hover:not(:disabled) {
  background: #f5f5f7;
  border-color: #007aff;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Success Section */
.success-section {
  text-align: center;
}

.success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6ffed;
  border-radius: 50%;
}

.success-icon svg {
  width: 32px;
  height: 32px;
  color: #52c41a;
}

.success-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

.success-description {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  color: #6e6e73;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

/* Footer */
.footer-section {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #e5e5ea;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  color: #007aff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.back-link:hover {
  color: #005ecb;
}

/* Responsive */
@media (max-width: 480px) {
  .forgot-password-container {
    padding: 36px 28px;
  }

  .logo {
    width: 56px;
    height: 56px;
  }

  .app-name {
    font-size: 22px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 12px 20px;
    font-size: 15px;
  }
}
</style>
