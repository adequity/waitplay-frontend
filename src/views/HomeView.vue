<template>
  <div class="login-page">
    <div class="login-container">
      <div class="logo-section">
        <div class="logo-circle">
          <span class="logo-icon">🎮</span>
        </div>
      </div>
      <h1 class="title">
        <span class="title-wait">Wait</span><span class="title-play">Play</span>
      </h1>
      <p class="subtitle">스마트 대기열 관리 시스템</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input
              v-model="loginForm.username"
              type="text"
              placeholder="아이디"
              class="login-input"
              required
            />
          </div>
        </div>

        <div class="input-group">
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="비밀번호"
              class="login-input"
              required
            />
          </div>
        </div>

        <div class="role-selector">
          <label class="role-option">
            <input type="radio" name="role" value="customer" v-model="loginForm.role" />
            <span class="role-label">
              <span class="role-icon">👤</span>
              <span class="role-text">고객</span>
            </span>
          </label>
          <label class="role-option">
            <input type="radio" name="role" value="admin" v-model="loginForm.role" />
            <span class="role-label">
              <span class="role-icon">⚙️</span>
              <span class="role-text">관리자</span>
            </span>
          </label>
        </div>

        <button type="submit" class="login-submit-btn">
          <span class="btn-text">로그인</span>
          <span class="btn-arrow">→</span>
        </button>

        <div class="login-footer">
          <a href="#" class="footer-link">비밀번호 찾기</a>
          <span class="footer-divider">|</span>
          <a href="#" class="footer-link">회원가입</a>
        </div>
      </form>
    </div>

    <div class="background-gradient">
      <div class="gradient-blob gradient-blob-1"></div>
      <div class="gradient-blob gradient-blob-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loginForm = ref({
  username: '',
  password: '',
  role: 'customer'
})

const handleLogin = () => {
  // TODO: Add actual authentication logic here
  console.log('Login attempt:', loginForm.value)

  // Navigate based on role
  if (loginForm.value.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/customer')
  }
}
</script>

<style scoped>
/* Login Page - Dark Mode Style */
.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow: hidden;
  padding: 2rem;
}

.login-container {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 500px;
  width: 100%;
  animation: fadeInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Logo Section */
.logo-section {
  margin-bottom: 2rem;
}

.logo-circle {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 50px rgba(102, 126, 234, 0.5);
  animation: floatPulse 3s ease-in-out infinite;
}

.logo-icon {
  font-size: 4rem;
}

/* Title */
.title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  letter-spacing: -2px;
}

.title-wait {
  background: linear-gradient(135deg, #667eea 0%, #9198e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-play {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 3rem;
  font-weight: 300;
  letter-spacing: 0.5px;
}

/* Login Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.input-group {
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-wrapper:focus-within {
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.input-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.login-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.login-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* Role Selector */
.role-selector {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.role-option {
  flex: 1;
  cursor: pointer;
}

.role-option input[type="radio"] {
  display: none;
}

.role-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.role-option input[type="radio"]:checked + .role-label {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.role-label:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
}

.role-icon {
  font-size: 1.5rem;
}

.role-text {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
}

/* Submit Button */
.login-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.login-submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.login-submit-btn:hover::before {
  left: 100%;
}

.login-submit-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 48px rgba(102, 126, 234, 0.4);
}

.login-submit-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.btn-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-submit-btn:hover .btn-arrow {
  transform: translateX(4px);
}

/* Footer */
.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.footer-link {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-link:hover {
  color: rgba(255, 255, 255, 0.9);
}

.footer-divider {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.875rem;
}

/* Background Gradient */
.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.gradient-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
  animation: floatRotate 25s ease-in-out infinite;
}

.gradient-blob-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.6) 0%, rgba(102, 126, 234, 0) 70%);
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.gradient-blob-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(240, 147, 251, 0.5) 0%, rgba(240, 147, 251, 0) 70%);
  bottom: -150px;
  left: -150px;
  animation-delay: -12s;
}

/* Animations */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes floatPulse {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

@keyframes floatRotate {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(50px, -50px) rotate(120deg);
  }
  66% {
    transform: translate(-30px, 30px) rotate(240deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-page {
    padding: 1.5rem;
  }

  .logo-circle {
    width: 100px;
    height: 100px;
  }

  .logo-icon {
    font-size: 3rem;
  }

  .title {
    font-size: 3rem;
  }

  .subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  .login-form {
    gap: 1.25rem;
  }

  .input-wrapper {
    padding: 0.875rem 1rem;
  }

  .input-icon {
    font-size: 1.25rem;
    margin-right: 0.75rem;
  }

  .login-input {
    font-size: 0.9375rem;
  }

  .role-label {
    padding: 0.875rem;
  }

  .role-icon {
    font-size: 1.25rem;
  }

  .role-text {
    font-size: 0.9375rem;
  }

  .login-submit-btn {
    padding: 1.125rem 1.75rem;
    font-size: 1rem;
  }

  .btn-arrow {
    font-size: 1.25rem;
  }

  .footer-link {
    font-size: 0.8125rem;
  }
}
</style>
