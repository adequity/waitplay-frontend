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

      <div class="button-group">
        <router-link to="/customer" class="login-btn customer-btn">
          <span class="btn-icon">👤</span>
          <div class="btn-text">
            <span class="btn-title">고객 페이지</span>
            <span class="btn-subtitle">게임 선택 및 대기</span>
          </div>
        </router-link>

        <router-link to="/admin" class="login-btn admin-btn">
          <span class="btn-icon">⚙️</span>
          <div class="btn-text">
            <span class="btn-title">관리자 페이지</span>
            <span class="btn-subtitle">대기열 관리</span>
          </div>
        </router-link>
      </div>
    </div>

    <div class="background-gradient">
      <div class="gradient-blob gradient-blob-1"></div>
      <div class="gradient-blob gradient-blob-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Login page
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

/* Button Group */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.75rem 2rem;
  text-decoration: none;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  transition: left 0.6s;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover {
  transform: translateY(-3px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.2);
}

.customer-btn {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
}

.customer-btn:hover {
  box-shadow: 0 12px 48px rgba(102, 126, 234, 0.3);
}

.admin-btn {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.2) 100%);
  box-shadow: 0 8px 32px rgba(245, 87, 108, 0.15);
}

.admin-btn:hover {
  box-shadow: 0 12px 48px rgba(245, 87, 108, 0.3);
}

.btn-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  flex: 1;
}

.btn-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
  letter-spacing: -0.5px;
}

.btn-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
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

  .login-btn {
    padding: 1.5rem 1.75rem;
  }

  .btn-icon {
    font-size: 2rem;
  }

  .btn-title {
    font-size: 1.125rem;
  }

  .btn-subtitle {
    font-size: 0.8rem;
  }
}
</style>
