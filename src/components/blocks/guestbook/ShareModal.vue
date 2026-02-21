<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="share-modal-overlay" @click.self="close">
        <div class="share-modal">
          <div class="share-modal-header">
            <h4>공유하기</h4>
            <button @click="close" class="share-modal-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="share-options">
            <button class="share-option" @click="copyLink">
              <div class="share-icon copy-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </div>
              <span>링크 복사</span>
            </button>
            <button class="share-option" @click="shareKakao">
              <div class="share-icon kakao-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.5 3 2 6.58 2 11c0 2.85 1.86 5.35 4.64 6.78-.14.53-.54 1.97-.62 2.27-.1.37.14.36.29.26.12-.08 1.87-1.27 2.63-1.79.67.1 1.36.15 2.06.15 5.5 0 10-3.58 10-8S17.5 3 12 3z"/>
                </svg>
              </div>
              <span>카카오</span>
            </button>
            <button class="share-option" @click="shareTwitter">
              <div class="share-icon twitter-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span>X</span>
            </button>
            <button class="share-option" @click="shareFacebook">
              <div class="share-icon facebook-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span>페이스북</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  qrCodeId: string
  messageId: string | null
  userName?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const getShareUrl = (): string => {
  if (!props.messageId) return window.location.href
  return `${window.location.origin}/guestbook?qr=${props.qrCodeId}&highlight=${props.messageId}`
}

const getShareText = (): string => {
  if (props.userName) {
    return `${props.userName}님의 방명록을 확인해보세요!`
  }
  return '방명록을 확인해보세요!'
}

const close = () => {
  emit('close')
}

const copyLink = async () => {
  const shareUrl = getShareUrl()
  try {
    await navigator.clipboard.writeText(shareUrl)
    alert('링크가 복사되었습니다!')
    close()
  } catch {
    prompt('이 링크를 복사하세요:', shareUrl)
  }
}

const shareKakao = () => {
  const shareUrl = getShareUrl()
  const kakaoShareUrl = `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`
  window.open(kakaoShareUrl, '_blank', 'width=600,height=400')
  close()
}

const shareTwitter = () => {
  const shareUrl = getShareUrl()
  const text = getShareText()
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
  window.open(twitterShareUrl, '_blank', 'width=600,height=400')
  close()
}

const shareFacebook = () => {
  const shareUrl = getShareUrl()
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  window.open(facebookShareUrl, '_blank', 'width=600,height=400')
  close()
}

</script>

<style scoped>
.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.share-modal {
  background: white;
  border-radius: 16px;
  padding: 1rem;
  max-width: 320px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.share-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.share-modal-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.share-modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.share-modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.share-option:hover {
  background: #f3f4f6;
}

.share-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-icon { background: #e5e7eb; color: #374151; }
.kakao-icon { background: #FEE500; color: #3A1D1D; }
.twitter-icon { background: #000000; color: white; }
.facebook-icon { background: #1877F2; color: white; }

.share-option span {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

/* 모달 트랜지션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
