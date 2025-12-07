<template>
  <div class="login-view">
    <div class="login-container-apple">
      <!-- Logo Section -->
      <div class="logo-section-apple">
        <div class="logo-apple">
          <svg class="logo-icon-svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h1 class="app-name-apple">WaitPlay</h1>
        <p class="app-subtitle-apple">고객의 경험을 브랜드의 가치로</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form-apple">
        <!-- Username Input -->
        <div class="input-group-apple">
          <label class="input-label-apple">아이디</label>
          <div class="input-wrapper-apple">
            <svg class="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input
              v-model="loginForm.username"
              type="text"
              placeholder="아이디를 입력하세요"
              class="input-apple"
              required
            />
          </div>
        </div>

        <!-- Password Input -->
        <div class="input-group-apple">
          <label class="input-label-apple">비밀번호</label>
          <div class="input-wrapper-apple">
            <svg class="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              class="input-apple"
              required
            />
          </div>
        </div>

        <!-- Remember Username Checkbox -->
        <div class="remember-section-apple">
          <label class="remember-label-apple">
            <input
              type="checkbox"
              v-model="rememberUsername"
              class="remember-checkbox-apple"
            />
            <span class="remember-text-apple">아이디 저장</span>
          </label>
        </div>

        <!-- Error Message -->
        <div v-if="loginError" class="error-message-apple">
          {{ loginError }}
        </div>

        <!-- Login Button -->
        <button type="submit" class="login-btn-apple" :disabled="isLoading">
          <span v-if="!isLoading">로그인</span>
          <span v-else>로그인 중...</span>
        </button>

        <!-- Footer Links -->
        <div class="login-footer-apple">
          <a href="#" class="footer-link-apple">비밀번호 찾기</a>
          <span class="footer-divider-apple">·</span>
          <a href="#" class="footer-link-apple">회원가입</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginForm = ref({
  username: '',
  password: ''
})

const rememberUsername = ref(false)
const loginError = ref('')
const isLoading = ref(false)

// Load saved username on component mount
onMounted(() => {
  const savedUsername = localStorage.getItem('waitplay_saved_username')
  if (savedUsername) {
    loginForm.value.username = savedUsername
    rememberUsername.value = true
  }
})

const handleLogin = async () => {
  loginError.value = ''
  isLoading.value = true

  try {
    // Save or remove username from localStorage
    if (rememberUsername.value) {
      localStorage.setItem('waitplay_saved_username', loginForm.value.username)
    } else {
      localStorage.removeItem('waitplay_saved_username')
    }

    // Call backend login API
    const response = await authStore.standardLogin(
      loginForm.value.username,
      loginForm.value.password
    )

    // Navigate based on user_role from backend response
    // Possible roles: admin, superadmin, company, user
    switch (response.userRole) {
      case 'admin':
      case 'superadmin':
        router.push('/admin')
        break
      case 'company':
        router.push('/admin') // or specific company dashboard
        break
      case 'user':
      default:
        router.push('/customer')
        break
    }
  } catch (error: any) {
    console.error('Login failed:', error)
    loginError.value = error.response?.data?.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Login View - Apple Design System */
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.login-container-apple {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

/* Logo Section */
.logo-section-apple {
  text-align: center;
  margin-bottom: 40px;
}

.logo-apple {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007aff 0%, #005ecb 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
}

.logo-icon-svg {
  width: 48px;
  height: 48px;
  color: white;
}

.app-name-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.app-subtitle-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  color: #8e8e93;
  margin: 0;
  font-weight: 400;
}

/* Login Form */
.login-form-apple {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group-apple {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.01em;
}

.input-wrapper-apple {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  padding: 12px 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-wrapper-apple:focus-within {
  background: #ffffff;
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

.input-apple {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 16px;
  color: #1d1d1f;
  font-weight: 400;
}

.input-apple::placeholder {
  color: #c7c7cc;
}

/* Remember Username Section */
.remember-section-apple {
  display: flex;
  align-items: center;
  margin-top: -8px;
}

.remember-label-apple {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.remember-checkbox-apple {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #007aff;
}

.remember-text-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  color: #8e8e93;
  font-weight: 500;
}

/* Error Message */
.error-message-apple {
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

/* Login Button */
.login-btn-apple {
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
}

.login-btn-apple:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 122, 255, 0.4);
}

.login-btn-apple:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
}

.login-btn-apple:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Footer */
.login-footer-apple {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.footer-link-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  color: #007aff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.footer-link-apple:hover {
  color: #005ecb;
  text-decoration: underline;
}

.footer-divider-apple {
  font-size: 14px;
  color: #d1d1d6;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-container-apple {
    padding: 36px 28px;
  }

  .logo-apple {
    width: 70px;
    height: 70px;
  }

  .app-name-apple {
    font-size: 28px;
  }

  .app-subtitle-apple {
    font-size: 14px;
  }

  .input-wrapper-apple {
    padding: 10px 14px;
  }

  .login-btn-apple {
    padding: 12px 20px;
    font-size: 15px;
  }
}
</style>
