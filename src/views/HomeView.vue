<template>
  <div class="home">
    <div class="hero-content">
      <div class="logo-container">
        <div class="logo-circle">
          <span class="logo-icon">🎮</span>
        </div>
      </div>
      <h1 class="title">
        <span class="title-wait">Wait</span><span class="title-play">Play</span>
      </h1>
      <p class="subtitle">스마트 대기열 관리 시스템</p>
      <div class="buttons">
        <router-link to="/customer" class="btn btn-customer">
          <span class="btn-icon">👤</span>
          <span class="btn-content">
            <span class="btn-title">고객 페이지</span>
            <span class="btn-desc">게임 선택 및 대기</span>
          </span>
        </router-link>
        <router-link to="/admin" class="btn btn-admin">
          <span class="btn-icon">⚙️</span>
          <span class="btn-content">
            <span class="btn-title">관리자 페이지</span>
            <span class="btn-desc">대기열 관리</span>
          </span>
        </router-link>
      </div>
    </div>
    <div class="decorative-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
}

.logo-container {
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
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

.logo-icon {
  font-size: 4rem;
}

.title {
  font-size: 4.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  letter-spacing: -2px;
}

.title-wait {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  font-size: 1.5rem;
  color: #a0a0b0;
  margin-bottom: 4rem;
  font-weight: 300;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
}

.btn {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 2.5rem;
  text-decoration: none;
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.btn-customer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-admin {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.btn-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.btn-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.3rem;
}

.btn-desc {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
}

/* Decorative Background */
.decorative-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -250px;
  left: -250px;
  animation-delay: 0s;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  bottom: -200px;
  right: -200px;
  animation-delay: -7s;
}

.blob-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -50px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

@media (max-width: 768px) {
  .title {
    font-size: 3rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .btn {
    padding: 1.5rem 2rem;
  }

  .btn-icon {
    font-size: 2.5rem;
  }

  .btn-title {
    font-size: 1.2rem;
  }
}
</style>
