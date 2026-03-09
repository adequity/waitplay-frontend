<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible && message" class="detail-modal-overlay" @click.self="close">
        <div class="detail-modal">
          <!-- 닫기 버튼 -->
          <button @click="close" class="detail-modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <!-- 메시지 내용 -->
          <div
            class="detail-post-it"
            :class="`detail-post-it--${message.color || 'white'}`"
          >
            <div class="detail-image-container">
              <img
                v-if="message.imageUrl"
                :src="message.imageUrl"
                :alt="`${message.userName}의 방명록`"
                class="detail-image"
              />
            </div>
          </div>

          <!-- 오디오 플레이어 (BGM이 첨부된 경우) -->
          <div v-if="message.audioUrl" class="detail-audio-player">
            <button class="detail-audio-btn" @click="toggleAudio">
              <svg v-if="!isAudioPlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            </button>
            <div class="detail-audio-progress" @click="seekAudio">
              <div class="detail-audio-bar">
                <div class="detail-audio-fill" :style="{ width: audioProgress + '%' }"></div>
              </div>
            </div>
            <span class="detail-audio-time">{{ audioTimeDisplay }}</span>
          </div>

          <!-- 하단 정보 -->
          <div class="detail-footer">
            <div class="detail-info">
              <div class="detail-author-row" @click="goToUserFeed" role="button" tabindex="0">
                <img
                  v-if="message.userProfileImage"
                  :src="message.userProfileImage"
                  :alt="message.userName"
                  class="detail-profile-img"
                />
                <div v-else class="detail-profile-placeholder">
                  {{ message.userName?.charAt(0) || '?' }}
                </div>
                <span class="detail-author">{{ message.userName }}</span>
              </div>
              <span class="detail-date">{{ formatDate(message.createdAt) }}</span>
            </div>
            <div class="detail-actions">
              <button
                class="detail-like-btn"
                :class="{ 'liked': message.isLikedByMe }"
                @click="onLike"
                :disabled="isLiking"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" :fill="message.isLikedByMe ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{{ message.likeCount || 0 }}</span>
              </button>
              <button class="detail-share-btn" @click="onShare">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
              <button class="detail-mention-btn" @click="toggleMentionPanel" :class="{ active: showMentionPanel }">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 이모지 반응 -->
          <div class="detail-reactions">
            <button
              v-for="r in reactionTypes"
              :key="r.type"
              class="reaction-btn"
              :class="{ active: myReactions.includes(r.type) }"
              @click="toggleReaction(r.type)"
            >
              <span class="reaction-emoji">{{ r.emoji }}</span>
              <span v-if="getReactionCount(r.type) > 0" class="reaction-count">{{ getReactionCount(r.type) }}</span>
            </button>
          </div>

          <!-- 멘션 패널 -->
          <Transition name="mention-slide">
            <div v-if="showMentionPanel" class="mention-panel">
              <div class="mention-search-box">
                <svg class="mention-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  v-model="mentionQuery"
                  class="mention-search-input"
                  placeholder="팔로우한 유저/매장 검색..."
                  @input="onMentionSearch"
                />
              </div>
              <div v-if="isLoadingMention" class="mention-loading">
                <span class="loading-spinner-small"></span>
              </div>
              <div v-else-if="mentionResults.length === 0 && mentionSearched" class="mention-empty">
                검색 결과가 없습니다
              </div>
              <div v-else class="mention-results">
                <button
                  v-for="user in mentionResults"
                  :key="user.userId"
                  class="mention-user-item"
                  @click="sendMention(user)"
                  :disabled="mentionSentIds.has(user.userId)"
                >
                  <img
                    v-if="user.profileImage"
                    :src="user.profileImage"
                    class="mention-user-avatar"
                    alt=""
                  />
                  <div v-else class="mention-user-avatar mention-avatar-placeholder">
                    {{ user.isStore ? '🏪' : '👤' }}
                  </div>
                  <div class="mention-user-info">
                    <span class="mention-user-name">{{ user.nickname }}</span>
                    <span v-if="user.companyName" class="mention-user-company">{{ user.companyName }}</span>
                    <span v-if="user.isStore" class="mention-store-badge">매장</span>
                  </div>
                  <span v-if="mentionSentIds.has(user.userId)" class="mention-sent-label">전송됨</span>
                </button>
              </div>
            </div>
          </Transition>

          <!-- 사장님 답글 -->
          <div v-if="isLoadingReplies" class="detail-replies-loading">
            <span class="loading-spinner-small"></span>
          </div>
          <div v-else-if="replies.length > 0" class="detail-replies">
            <div
              v-for="reply in replies"
              :key="reply.id"
              class="detail-reply"
            >
              <div class="reply-header">
                <span class="reply-badge">사장님</span>
                <span class="reply-date">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <p class="reply-content">{{ reply.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import guestbookService from '@/services/guestbookService'

interface Props {
  visible: boolean
  message: any | null
}

const router = useRouter()
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'like-toggled', payload: { id: string; isLiked: boolean; likeCount: number }): void
  (e: 'share', message: any): void
}>()

const replies = ref<any[]>([])
const isLoadingReplies = ref(false)
const isLiking = ref(false)

// 이모지 반응
const reactionTypes = [
  { type: 'heart', emoji: '❤️' },
  { type: 'laugh', emoji: '😂' },
  { type: 'wow', emoji: '😮' },
  { type: 'sad', emoji: '😢' },
  { type: 'clap', emoji: '👏' },
  { type: 'fire', emoji: '🔥' },
]
const reactionCounts = ref<Record<string, number>>({})
const myReactions = ref<string[]>([])

function getReactionCount(type: string): number {
  return reactionCounts.value[type] || 0
}

async function loadReactions(messageId: string) {
  try {
    const data = await guestbookService.getReactions(messageId)
    const counts: Record<string, number> = {}
    for (const r of data.reactions) {
      counts[r.type] = r.count
    }
    reactionCounts.value = counts
    myReactions.value = data.myReactions
  } catch { /* silent */ }
}

async function toggleReaction(type: string) {
  if (!props.message) return
  try {
    const result = await guestbookService.toggleReaction(props.message.id, type)
    if (result.toggled) {
      reactionCounts.value[type] = (reactionCounts.value[type] || 0) + 1
      myReactions.value.push(type)
    } else {
      reactionCounts.value[type] = Math.max(0, (reactionCounts.value[type] || 0) - 1)
      myReactions.value = myReactions.value.filter(r => r !== type)
    }
  } catch { /* silent */ }
}

// 멘션
const showMentionPanel = ref(false)
const mentionQuery = ref('')
const mentionResults = ref<import('@/services/guestbookService').MentionableUser[]>([])
const isLoadingMention = ref(false)
const mentionSearched = ref(false)
const mentionSentIds = ref<Set<string>>(new Set())
let mentionDebounce: ReturnType<typeof setTimeout> | null = null

function toggleMentionPanel() {
  showMentionPanel.value = !showMentionPanel.value
  if (showMentionPanel.value) {
    mentionQuery.value = ''
    mentionResults.value = []
    mentionSearched.value = false
    loadMentionUsers()
  }
}

async function loadMentionUsers(q = '') {
  isLoadingMention.value = true
  try {
    mentionResults.value = await guestbookService.searchMentionableUsers(q)
    mentionSearched.value = true
  } catch {
    mentionResults.value = []
  } finally {
    isLoadingMention.value = false
  }
}

function onMentionSearch() {
  if (mentionDebounce) clearTimeout(mentionDebounce)
  mentionDebounce = setTimeout(() => {
    loadMentionUsers(mentionQuery.value)
  }, 300)
}

async function sendMention(user: import('@/services/guestbookService').MentionableUser) {
  if (!props.message || mentionSentIds.value.has(user.userId)) return
  try {
    await guestbookService.sendMention(props.message.id, user.userId)
    mentionSentIds.value = new Set([...mentionSentIds.value, user.userId])
  } catch {
    alert('멘션 전송에 실패했습니다')
  }
}

// 오디오 플레이어 상태
const audioEl = ref<HTMLAudioElement | null>(null)
const isAudioPlaying = ref(false)
const audioProgress = ref(0)
const audioTimeDisplay = ref('0:00')
let audioTimerInterval: ReturnType<typeof setInterval> | null = null

// 오디오 제어 함수
const toggleAudio = () => {
  if (!props.message?.audioUrl) return

  if (!audioEl.value) {
    audioEl.value = new Audio(props.message.audioUrl)
    audioEl.value.addEventListener('ended', () => {
      isAudioPlaying.value = false
      audioProgress.value = 0
      stopAudioTimer()
    })
  }

  if (isAudioPlaying.value) {
    audioEl.value.pause()
    isAudioPlaying.value = false
    stopAudioTimer()
  } else {
    audioEl.value.play().catch(() => {})
    isAudioPlaying.value = true
    startAudioTimer()
  }
}

const seekAudio = (e: MouseEvent) => {
  if (!audioEl.value || !audioEl.value.duration) return
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  audioEl.value.currentTime = ratio * audioEl.value.duration
  audioProgress.value = ratio * 100
}

const startAudioTimer = () => {
  stopAudioTimer()
  audioTimerInterval = setInterval(() => {
    if (audioEl.value && audioEl.value.duration) {
      audioProgress.value = (audioEl.value.currentTime / audioEl.value.duration) * 100
      const cur = Math.floor(audioEl.value.currentTime)
      const min = Math.floor(cur / 60)
      const sec = cur % 60
      audioTimeDisplay.value = `${min}:${sec.toString().padStart(2, '0')}`
    }
  }, 250)
}

const stopAudioTimer = () => {
  if (audioTimerInterval) {
    clearInterval(audioTimerInterval)
    audioTimerInterval = null
  }
}

const cleanupAudio = () => {
  if (audioEl.value) {
    audioEl.value.pause()
    audioEl.value.currentTime = 0
    audioEl.value = null
  }
  isAudioPlaying.value = false
  audioProgress.value = 0
  audioTimeDisplay.value = '0:00'
  stopAudioTimer()
}

// 모달이 열릴 때 조회수 증가 + 답글 로드
watch(() => props.visible, async (newVal) => {
  if (newVal && props.message) {
    // BGM 자동 재생 (유저 인터랙션 컨텍스트가 유효할 때 즉시 실행)
    if (props.message.audioUrl) {
      audioEl.value = new Audio(props.message.audioUrl)
      audioEl.value.addEventListener('ended', () => {
        isAudioPlaying.value = false
        audioProgress.value = 0
        stopAudioTimer()
      })
      audioEl.value.play().then(() => {
        isAudioPlaying.value = true
        startAudioTimer()
      }).catch(() => {})
    }

    // 조회수 증가 (실패 시 무시)
    guestbookService.incrementViewCount(props.message.id).catch(() => {})

    // 답글 + 반응 로드
    await loadReplies(props.message.id)
    await loadReactions(props.message.id)
  } else {
    replies.value = []
    reactionCounts.value = {}
    myReactions.value = []
    showMentionPanel.value = false
    mentionSentIds.value = new Set()
    cleanupAudio()
  }
})

onBeforeUnmount(() => {
  cleanupAudio()
})

const loadReplies = async (messageId: string) => {
  isLoadingReplies.value = true
  try {
    replies.value = await guestbookService.getReplies(messageId)
  } catch {
    replies.value = []
  } finally {
    isLoadingReplies.value = false
  }
}

const close = () => {
  emit('close')
}

const onLike = async () => {
  if (!props.message || isLiking.value) return

  isLiking.value = true
  try {
    const response = await guestbookService.toggleLike(props.message.id)
    // 부모에 알려서 목록도 동기화 (부모가 같은 object를 수정하므로 template도 반영됨)
    emit('like-toggled', {
      id: props.message.id,
      isLiked: response.isLiked,
      likeCount: response.likeCount
    })
  } catch {
    alert('좋아요 처리에 실패했습니다.')
  } finally {
    isLiking.value = false
  }
}

const onShare = () => {
  if (props.message) {
    emit('share', props.message)
  }
}

const goToUserFeed = () => {
  const code = props.message?.userProfileCode || props.message?.userId
  if (code) {
    emit('close')
    router.push({ name: 'user-feed', params: { code } })
  }
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
.detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.detail-modal {
  position: relative;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-modal-close {
  position: absolute;
  top: -50px;
  right: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  z-index: 10;
}

.detail-modal-close:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.detail-post-it {
  background: #fff9c4;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleIn {
  from { opacity: 0; transform: translateY(30px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* 포스트잇 색상 */
.detail-post-it--white { background: #ffffff; }
.detail-post-it--yellow { background: #fff9c4; }
.detail-post-it--pink { background: #fce4ec; }
.detail-post-it--blue { background: #e3f2fd; }
.detail-post-it--green { background: #e8f5e9; }
.detail-post-it--orange { background: #fff3e0; }
.detail-post-it--purple { background: #f3e5f5; }

.detail-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-image {
  max-width: 80vw;
  max-height: 60vh;
  width: auto;
  height: auto;
  object-fit: contain;
}

.detail-footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-top: 12px;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-author-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 8px;
  padding: 4px 8px 4px 4px;
  margin: -4px -8px -4px -4px;
  transition: background 0.2s;
}
.detail-author-row:hover {
  background: rgba(255, 255, 255, 0.1);
}

.detail-profile-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.detail-profile-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.detail-author {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.detail-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.detail-like-btn,
.detail-share-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 24px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-like-btn:hover,
.detail-share-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.detail-like-btn.liked {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.detail-like-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 오디오 플레이어 */
.detail-audio-player {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.detail-audio-btn {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  background: rgba(78, 205, 196, 0.25);
  border: none;
  color: #4ECDC4;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.detail-audio-btn:active {
  transform: scale(0.9);
  background: rgba(78, 205, 196, 0.4);
}

.detail-audio-progress {
  flex: 1;
  height: 32px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.detail-audio-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.detail-audio-fill {
  height: 100%;
  background: #4ECDC4;
  border-radius: 2px;
  transition: width 0.2s linear;
}

.detail-audio-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 36px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* 이모지 반응 */
.detail-reactions {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.reaction-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}
.reaction-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
.reaction-btn.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}
.reaction-emoji {
  font-size: 16px;
  line-height: 1;
}
.reaction-count {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

/* 답글 섹션 */
.detail-replies-loading {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.detail-replies {
  width: 100%;
  max-width: 90vw;
  margin-top: 8px;
}

.detail-reply {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 8px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.reply-badge {
  background: #4ECDC4;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.reply-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.reply-content {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  word-break: break-word;
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .detail-modal {
    max-width: 95vw;
    max-height: 90vh;
  }

  .detail-modal-close {
    top: -48px;
    right: -4px;
  }

  .detail-image {
    max-width: 90vw;
    max-height: 55vh;
  }

  .detail-footer {
    padding: 12px 0;
  }

  .detail-author {
    font-size: 15px;
  }

  .detail-like-btn,
  .detail-share-btn {
    padding: 8px 14px;
    font-size: 13px;
  }
}

/* 멘션 버튼 */
.detail-mention-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 20px;
  padding: 8px 14px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
}
.detail-mention-btn:hover,
.detail-mention-btn.active {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

/* 멘션 패널 */
.mention-panel {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 12px;
  margin-top: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.mention-search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 8px 12px;
  gap: 8px;
  margin-bottom: 8px;
}
.mention-search-icon {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.5);
}
.mention-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
}
.mention-search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.mention-loading,
.mention-empty {
  text-align: center;
  padding: 16px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.mention-results {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mention-user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
  width: 100%;
  text-align: left;
}
.mention-user-item:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
}
.mention-user-item:disabled {
  opacity: 0.6;
  cursor: default;
}

.mention-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.mention-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  font-size: 18px;
}

.mention-user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.mention-user-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mention-user-company {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mention-store-badge {
  font-size: 10px;
  background: #4ECDC4;
  color: #fff;
  padding: 1px 6px;
  border-radius: 8px;
  flex-shrink: 0;
}

.mention-sent-label {
  font-size: 12px;
  color: #4ECDC4;
  flex-shrink: 0;
}

/* 멘션 패널 트랜지션 */
.mention-slide-enter-active,
.mention-slide-leave-active {
  transition: all 0.2s ease;
}
.mention-slide-enter-from,
.mention-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding: 0 12px;
  margin-top: 0;
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
