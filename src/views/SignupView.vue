<template>
  <div class="signup-view">
    <div class="signup-container">
      <div class="signup-card">
        <div class="signup-header">
          <h1 class="signup-title">회원가입</h1>
          <p class="signup-subtitle">WaitPlay와 함께 시작하세요</p>
        </div>

        <!-- SNS 간편 회원가입 -->
        <div class="social-signup">
          <p class="section-title">SNS 간편 가입</p>
          <div class="social-buttons">
            <button @click="handleSocialSignup('naver')" class="btn-social btn-naver">
              <span class="social-icon">N</span>
              네이버로 가입하기
            </button>
            <button @click="handleSocialSignup('kakao')" class="btn-social btn-kakao">
              <span class="social-icon">K</span>
              카카오로 가입하기
            </button>
          </div>
        </div>

        <div class="divider">
          <span>또는 이메일로 가입</span>
        </div>

        <!-- 이메일 회원가입 폼 -->
        <form @submit.prevent="handleEmailSignup" class="signup-form">
          <div class="form-group">
            <label class="form-label">이름</label>
            <input
              type="text"
              v-model="formData.name"
              class="form-input"
              placeholder="홍길동"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">이메일</label>
            <input
              type="email"
              v-model="formData.email"
              class="form-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">비밀번호</label>
            <input
              type="password"
              v-model="formData.password"
              class="form-input"
              placeholder="8자 이상 입력하세요"
              required
              minlength="8"
            />
          </div>

          <div class="form-group">
            <label class="form-label">비밀번호 확인</label>
            <input
              type="password"
              v-model="formData.passwordConfirm"
              class="form-input"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>

          <div class="terms-section">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.agreeTerms" required />
              <span><a href="#" class="terms-link">이용약관</a> 및 <a href="#" class="terms-link">개인정보처리방침</a>에 동의합니다</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.agreeMarketing" />
              <span>마케팅 정보 수신에 동의합니다 (선택)</span>
            </label>
          </div>

          <button type="submit" class="btn-signup" :disabled="isLoading || !isFormValid">
            {{ isLoading ? '가입 중...' : '가입하기' }}
          </button>
        </form>

        <div class="login-prompt">
          <p>이미 계정이 있으신가요?</p>
          <router-link to="/login" class="login-link">로그인</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)

const formData = ref({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  agreeTerms: false,
  agreeMarketing: false
})

const isFormValid = computed(() => {
  return (
    formData.value.name.trim() !== '' &&
    formData.value.email.trim() !== '' &&
    formData.value.password.length >= 8 &&
    formData.value.password === formData.value.passwordConfirm &&
    formData.value.agreeTerms
  )
})

const handleSocialSignup = async (provider: 'naver' | 'kakao') => {
  try {
    // TODO: SNS 회원가입 API 연동
    console.log('Social signup with:', provider)

    if (provider === 'naver') {
      // 네이버 회원가입 처리
      alert('네이버 간편 가입 기능은 준비 중입니다.')
    } else if (provider === 'kakao') {
      // 카카오 회원가입 처리
      alert('카카오 간편 가입 기능은 준비 중입니다.')
    }
  } catch (error) {
    console.error('Social signup failed:', error)
    alert('소셜 회원가입에 실패했습니다.')
  }
}

const handleEmailSignup = async () => {
  if (!isFormValid.value) {
    alert('모든 필드를 올바르게 입력해주세요.')
    return
  }

  if (formData.value.password !== formData.value.passwordConfirm) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  isLoading.value = true

  try {
    // TODO: API 호출하여 회원가입 처리
    console.log('Email signup with:', {
      name: formData.value.name,
      email: formData.value.email,
      agreeMarketing: formData.value.agreeMarketing
    })

    // 임시: 회원가입 성공 후 로그인 페이지로 이동
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('회원가입이 완료되었습니다! 로그인해주세요.')
    router.push('/login')
  } catch (error) {
    console.error('Signup failed:', error)
    alert('회원가입에 실패했습니다. 다시 시도해주세요.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.signup-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.signup-container {
  width: 100%;
  max-width: 480px;
}

.signup-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.signup-header {
  text-align: center;
  margin-bottom: 2rem;
}

.signup-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.signup-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  text-align: center;
}

.social-signup {
  margin-bottom: 1.5rem;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

.signup-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
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

.terms-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  line-height: 1.5;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 2px;
  cursor: pointer;
  flex-shrink: 0;
}

.terms-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
  text-decoration: underline;
}

.btn-signup {
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

.btn-signup:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-signup:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-prompt {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.login-prompt p {
  margin: 0 0 0.5rem 0;
}

.login-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .signup-card {
    padding: 2rem 1.5rem;
  }

  .signup-title {
    font-size: 24px;
  }
}
</style>
