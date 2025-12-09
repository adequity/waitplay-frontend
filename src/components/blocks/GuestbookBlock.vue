<template>
  <div class="guestbook-block" :style="{ '--text-color': data.textColor || '#374151' }">
    <h2 class="guestbook-title">{{ data.title }}</h2>

    <!-- 메시지 작성 폼 (로그인한 사용자만) -->
    <div v-if="isAuthenticated" class="write-section">
      <textarea
        v-model="newMessage"
        :maxlength="data.maxMessageLength"
        placeholder="손글씨로 메시지를 남겨보세요..."
        class="message-input"
        @input="updateCharCount"
      ></textarea>
      <div class="write-actions">
        <span class="char-count">{{ charCount }} / {{ data.maxMessageLength }}</span>
        <button @click="submitMessage" :disabled="!newMessage.trim()" class="submit-button">
          메시지 남기기
        </button>
      </div>
    </div>

    <div v-else class="login-prompt">
      <p>로그인하고 방명록을 남겨보세요!</p>
      <div class="auth-buttons">
        <button class="btn-login" @click="goToLogin">로그인</button>
        <button class="btn-signup" @click="goToSignup">회원가입</button>
      </div>
    </div>

    <!-- 메시지 목록 -->
    <div class="messages-grid">
      <div
        v-for="message in data.messages"
        :key="message.id"
        class="post-it"
        :class="`post-it--${message.color}`"
        :style="{ transform: `rotate(${message.rotation}deg)` }"
      >
        <div class="post-it-content">
          <p class="message-text">{{ message.message }}</p>
          <div class="message-footer">
            <span class="message-author">- {{ message.userName }}</span>
            <span class="message-date">{{ formatDate(message.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="data.messages.length === 0" class="empty-state">
      <p>아직 남겨진 메시지가 없습니다. 첫 메시지를 남겨보세요!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GuestbookBlockData } from '@/types/blocks'

interface Props {
  data: GuestbookBlockData
}

const props = defineProps<Props>()

// TODO: 실제 인증 상태는 store나 composable에서 가져와야 함
const isAuthenticated = ref(false)
const newMessage = ref('')
const charCount = ref(0)

const updateCharCount = () => {
  charCount.value = newMessage.value.length
}

const submitMessage = () => {
  if (!newMessage.value.trim()) return

  // TODO: API 호출하여 메시지 저장
  console.log('Submitting message:', newMessage.value)

  // 메시지 초기화
  newMessage.value = ''
  charCount.value = 0
}

const goToLogin = () => {
  window.location.href = '/login'
}

const goToSignup = () => {
  window.location.href = '/signup'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return '방금 전'
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }
}
</script>

<style scoped>
.guestbook-block {
  padding: 2rem 1.5rem;
  margin-bottom: 1.5rem;
}

.guestbook-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color, #1f2937);
  margin-bottom: 2rem;
  text-align: center;
}

/* 메시지 작성 섹션 */
.write-section {
  background: #fef3c7;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-input {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: none;
  background: transparent;
  font-family: 'Nanum Pen Script', cursive, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 20px;
  color: #374151;
  resize: vertical;
  outline: none;
  line-height: 1.8;
}

.message-input::placeholder {
  color: #9ca3af;
  font-style: italic;
}

.write-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.char-count {
  font-size: 14px;
  color: #6b7280;
}

.submit-button {
  padding: 0.75rem 1.5rem;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-button:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.submit-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  opacity: 0.6;
}

.login-prompt {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
}

.login-prompt p {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 1rem 0;
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-login,
.btn-signup {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-login {
  background: #3b82f6;
  color: white;
}

.btn-login:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-signup {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.btn-signup:hover {
  background: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 포스트잇 그리드 */
.messages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.post-it {
  position: relative;
  padding: 1.5rem;
  min-height: 180px;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: default;
}

.post-it::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.05) 0%,
    transparent 100%
  );
  border-radius: 4px 4px 0 0;
}

.post-it:hover {
  transform: scale(1.05) !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.post-it--yellow {
  background: #fef3c7;
  border-top: 3px solid #fbbf24;
}

.post-it--pink {
  background: #fce7f3;
  border-top: 3px solid #f472b6;
}

.post-it--blue {
  background: #dbeafe;
  border-top: 3px solid #60a5fa;
}

.post-it--green {
  background: #d1fae5;
  border-top: 3px solid #34d399;
}

.post-it-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.message-text {
  flex: 1;
  font-family: 'Nanum Pen Script', cursive, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 18px;
  line-height: 1.8;
  color: var(--text-color, #374151);
  margin: 0 0 1rem 0;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.message-footer {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.message-author {
  font-family: 'Nanum Pen Script', cursive, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  color: #6b7280;
  font-style: italic;
}

.message-date {
  font-size: 12px;
  color: #9ca3af;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
  font-size: 16px;
  font-style: italic;
}

@media (max-width: 640px) {
  .messages-grid {
    grid-template-columns: 1fr;
  }

  .post-it {
    transform: none !important;
  }
}

/* 손글씨 폰트 로드 (Google Fonts - Nanum Pen Script) */
@import url('https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap');
</style>
