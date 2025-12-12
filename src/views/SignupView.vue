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

        <!-- SNS 간편 가입 -->
        <div class="social-signup">
          <p class="section-title">SNS 간편 가입</p>
          <div class="social-buttons">
            <button @click="handleSocialSignup('naver')" type="button" class="btn-social btn-naver">
              <span class="social-icon">N</span>
              네이버로 가입하기
            </button>
            <button @click="handleSocialSignup('kakao')" type="button" class="btn-social btn-kakao">
              <span class="social-icon">K</span>
              카카오로 가입하기
            </button>
          </div>
        </div>

        <div class="divider">
          <span>또는 이메일로 가입</span>
        </div>

        <!-- 이메일 회원가입 폼 -->
        <form @submit.prevent="handleEmailSignup" class="auth-form">
          <!-- 회원 유형 선택 -->
          <div class="user-type-section">
            <label class="toggle-label">
              <input
                type="checkbox"
                v-model="formData.isBusinessUser"
                class="toggle-checkbox"
              />
              <span class="toggle-slider"></span>
              <span class="toggle-text">사업자로 가입하기</span>
            </label>
          </div>

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

          <!-- 사업자 정보 (사업자일 경우만 표시) -->
          <div v-if="formData.isBusinessUser" class="business-info-section">
            <div class="form-group">
              <label class="form-label">회사/상호명</label>
              <input
                type="text"
                v-model="formData.companyName"
                class="form-input"
                placeholder="예: WaitPlay 강남점"
                :required="formData.isBusinessUser"
              />
            </div>

            <div class="form-group">
              <label class="form-label">사업자번호</label>
              <input
                type="text"
                v-model="formData.businessNumber"
                class="form-input"
                placeholder="000-00-00000"
                maxlength="12"
                :required="formData.isBusinessUser"
              />
            </div>

            <div class="form-group">
              <label class="form-label">사업자 주소</label>
              <input
                type="text"
                v-model="formData.businessAddress"
                class="form-input"
                placeholder="서울시 강남구 테헤란로 123"
                :required="formData.isBusinessUser"
              />
            </div>

            <div class="form-group">
              <label class="form-label">업종</label>
              <input
                type="text"
                v-model="formData.businessType"
                class="form-input"
                placeholder="예: 음식점업"
                :required="formData.isBusinessUser"
              />
            </div>

            <div class="form-group">
              <label class="form-label">업태</label>
              <input
                type="text"
                v-model="formData.businessCategory"
                class="form-input"
                placeholder="예: 한식"
                :required="formData.isBusinessUser"
              />
            </div>
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
              <input type="checkbox" v-model="formData.agreeTerms" required class="checkbox-input" />
              <span><a href="#" class="terms-link">이용약관</a> 및 <a href="#" class="terms-link">개인정보처리방침</a>에 동의합니다 (필수)</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.agreeMarketing" class="checkbox-input" />
              <span>마케팅 정보 수신에 동의합니다 (선택)</span>
            </label>
          </div>

          <button type="submit" class="btn-primary" :disabled="isLoading || !isFormValid">
            {{ isLoading ? '가입 중...' : '가입하기' }}
          </button>
        </form>

        <!-- Footer Links -->
        <div class="auth-footer">
          <span>이미 계정이 있으신가요?</span>
          <router-link :to="qrCodeId ? `/login?qr=${qrCodeId}` : '/login'" class="footer-link">로그인</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import authService from '@/services/authService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isLoading = ref(false)
const qrCodeId = ref<string | null>(null)

const formData = ref({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  isBusinessUser: false,
  companyName: '',
  businessNumber: '',
  businessAddress: '',
  businessType: '',
  businessCategory: '',
  agreeTerms: false,
  agreeMarketing: false
})

// URL에서 QR 코드 ID 추출
onMounted(() => {
  const qrParam = route.query.qr as string
  if (qrParam) {
    qrCodeId.value = qrParam
    console.log('QR Code ID detected:', qrCodeId.value)
  }
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
      alert('네이버 간편 가입 기능은 준비 중입니다.')
    } else if (provider === 'kakao') {
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

  if (formData.value.isBusinessUser) {
    if (!formData.value.companyName.trim()) {
      alert('회사/상호명을 입력해주세요.')
      return
    }
    if (!formData.value.businessNumber.trim()) {
      alert('사업자번호를 입력해주세요.')
      return
    }
    if (!formData.value.businessAddress.trim()) {
      alert('사업자 주소를 입력해주세요.')
      return
    }
    if (!formData.value.businessType.trim()) {
      alert('업종을 입력해주세요.')
      return
    }
    if (!formData.value.businessCategory.trim()) {
      alert('업태를 입력해주세요.')
      return
    }
  }

  isLoading.value = true

  try {
    // 회원가입 API 호출
    const response = await authService.emailSignup({
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
      qrCodeId: qrCodeId.value || undefined,
      agreeMarketing: formData.value.agreeMarketing,
      isBusinessUser: formData.value.isBusinessUser,
      companyName: formData.value.isBusinessUser ? formData.value.companyName : undefined,
      businessNumber: formData.value.isBusinessUser ? formData.value.businessNumber : undefined,
      businessAddress: formData.value.isBusinessUser ? formData.value.businessAddress : undefined,
      businessType: formData.value.isBusinessUser ? formData.value.businessType : undefined,
      businessCategory: formData.value.isBusinessUser ? formData.value.businessCategory : undefined
    })

    // 자동 로그인 (토큰 저장)
    authStore.setTokens(response)

    alert('회원가입이 완료되었습니다!')

    // 사업자는 Admin 페이지로, 일반 사용자는 QR/홈으로 이동
    if (formData.value.isBusinessUser) {
      router.push('/admin')
    } else if (response.redirectUrl) {
      router.push(response.redirectUrl)
    } else if (qrCodeId.value) {
      router.push(`/customer?qr=${qrCodeId.value}`)
    } else {
      router.push('/')
    }
  } catch (error: any) {
    console.error('Signup failed:', error)
    const errorMessage = error.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해주세요.'
    alert(errorMessage)
  } finally {
    isLoading.value = false
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

/* Section Title */
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
  text-align: center;
}

/* Social Signup */
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

/* Form */
.auth-form {
  margin-bottom: 1.5rem;
}

/* User Type Toggle */
.user-type-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.toggle-checkbox {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  transition: background 0.3s;
  flex-shrink: 0;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-checkbox:checked + .toggle-slider {
  background: #1e88e5;
}

.toggle-checkbox:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-text {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

/* Business Info Section */
.business-info-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 1rem;
}

.business-info-section .form-group {
  margin-bottom: 1rem;
}

.business-info-section .form-group:last-child {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
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

.terms-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 13px;
  color: #616161;
  cursor: pointer;
  line-height: 1.5;
  user-select: none;
}

.checkbox-input {
  margin-top: 2px;
  cursor: pointer;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  accent-color: #1e88e5;
}

.terms-link {
  color: #1e88e5;
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
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
  margin-left: 0.5rem;
}

.footer-link:hover {
  text-decoration: underline;
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
