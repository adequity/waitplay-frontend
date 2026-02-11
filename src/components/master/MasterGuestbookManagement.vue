<template>
  <div class="guestbook-management">
    <div class="page-header">
      <div>
        <h1>방명록 관리</h1>
        <p class="subtitle">전체 시스템의 방명록을 모니터링합니다</p>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <IconBase name="search" class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="매장명, 작성자, 내용 검색..." @input="debouncedSearch" />
      </div>
    </div>

    <LoadingSpinner v-if="loading" message="방명록을 불러오는 중..." />

    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>매장</th>
            <th>작성자</th>
            <th>내용</th>
            <th>반응</th>
            <th>작성일</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="msg in messages" :key="msg.id">
            <td>
              <span class="store-name">{{ msg.storeName || '(알 수 없음)' }}</span>
            </td>
            <td>
              <div class="user-cell">
                <div class="user-avatar">
                  {{ getInitial(msg.userName) }}
                </div>
                <span>{{ msg.userName }}</span>
              </div>
            </td>
            <td>
              <div class="content-cell" @click="openDetailModal(msg)">
                <!-- 이미지 미리보기 -->
                <div v-if="msg.imageUrl" class="image-preview">
                  <img :src="msg.imageUrl" alt="방명록 이미지" />
                </div>
                <!-- 텍스트 메시지 -->
                <span v-if="msg.message" class="message-text">{{ truncate(msg.message, 30) }}</span>
                <span v-else-if="!msg.imageUrl" class="empty-text">-</span>
              </div>
            </td>
            <td>
              <div class="stats-cell">
                <span class="stat-item" title="조회수">
                  <IconBase name="eye" class="stat-icon" />
                  {{ msg.viewCount || 0 }}
                </span>
                <span class="stat-item" title="좋아요">
                  <IconBase name="heart" class="stat-icon" />
                  {{ msg.likeCount || 0 }}
                </span>
              </div>
            </td>
            <td>
              <span class="date-text">{{ formatDate(msg.createdAt) }}</span>
            </td>
            <td>
              <button class="btn-action danger" @click="confirmDelete(msg)" title="삭제">
                <IconBase name="trash" />
              </button>
            </td>
          </tr>
          <tr v-if="!messages || messages.length === 0">
            <td colspan="6" class="empty-row">방명록이 없습니다</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" v-if="totalPages > 1">
        <button @click="page = page - 1" :disabled="page <= 1">이전</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button @click="page = page + 1" :disabled="page >= totalPages">다음</button>
      </div>
    </div>

    <!-- 상세 보기 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
      <div class="detail-modal">
        <button class="modal-close" @click="closeDetailModal">
          <IconBase name="x" />
        </button>

        <div class="modal-content" v-if="selectedMessage">
          <!-- 이미지 -->
          <div v-if="selectedMessage.imageUrl" class="modal-image">
            <img :src="selectedMessage.imageUrl" alt="방명록 이미지" />
          </div>

          <!-- 메시지 -->
          <div v-if="selectedMessage.message" class="modal-message">
            {{ selectedMessage.message }}
          </div>

          <!-- 정보 -->
          <div class="modal-info">
            <div class="info-row">
              <span class="info-label">매장</span>
              <span class="info-value">{{ selectedMessage.storeName || '(알 수 없음)' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">작성자</span>
              <span class="info-value">{{ selectedMessage.userName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">작성일</span>
              <span class="info-value">{{ formatFullDate(selectedMessage.createdAt) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">조회수</span>
              <span class="info-value">{{ selectedMessage.viewCount || 0 }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">좋아요</span>
              <span class="info-value">{{ selectedMessage.likeCount || 0 }}</span>
            </div>
          </div>

          <!-- 삭제 버튼 -->
          <button class="btn-delete" @click="confirmDeleteFromModal">
            <IconBase name="trash" />
            이 방명록 삭제
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const loading = ref(true)
const messages = ref<any[]>([])
const page = ref(1)
const pageSize = ref(20)
const totalPages = ref(1)
const searchQuery = ref('')

// 상세 모달
const showDetailModal = ref(false)
const selectedMessage = ref<any>(null)

let searchTimeout: number | null = null

const fetchMessages = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: page.value.toString(),
      pageSize: pageSize.value.toString()
    })
    if (searchQuery.value) params.append('search', searchQuery.value)

    const response = await fetch(`${API_URL}/api/masteradmin/guestbook?${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    messages.value = data.data || []
    totalPages.value = data.totalPages || 1
  } catch (error) {
    console.error(error)
    messages.value = []
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { page.value = 1; fetchMessages() }, 300) as any
}

const openDetailModal = (msg: any) => {
  selectedMessage.value = msg
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedMessage.value = null
}

const confirmDelete = async (msg: any) => {
  if (!confirm(`이 방명록을 삭제하시겠습니까?\n\n매장: ${msg.storeName || '알 수 없음'}\n작성자: ${msg.userName}`)) return
  await deleteMessage(msg.id)
}

const confirmDeleteFromModal = async () => {
  if (!selectedMessage.value) return
  if (!confirm(`이 방명록을 삭제하시겠습니까?`)) return
  await deleteMessage(selectedMessage.value.id)
  closeDetailModal()
}

const deleteMessage = async (messageId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/guestbook/${messageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    fetchMessages()
  } catch (error) {
    alert('삭제에 실패했습니다')
  }
}

const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : '?'
const truncate = (text: string, len: number) => text && text.length > len ? text.slice(0, len) + '...' : text

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 1) return '방금 전'
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return date.toLocaleDateString('ko-KR')
}

const formatFullDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

watch(page, fetchMessages)
onMounted(() => fetchMessages())
</script>

<style scoped>
.guestbook-management { padding: 0; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 28px; font-weight: 700; color: #1d1d1f; margin: 0 0 8px 0; }
.subtitle { font-size: 15px; color: #86868b; margin: 0; }

.filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
.search-box { flex: 1; max-width: 400px; position: relative; }
.search-box input { width: 100%; padding: 12px 16px 12px 44px; border: 1px solid #e5e5ea; border-radius: 12px; font-size: 14px; background: white; }
.search-box input:focus { outline: none; border-color: #d4a853; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #86868b; }

.table-container { background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; }
.data-table th { font-size: 12px; font-weight: 600; color: #86868b; text-transform: uppercase; background: #fafafa; }
.data-table tbody tr:hover { background: #fafafa; }

.store-name { font-size: 14px; font-weight: 500; color: #1d1d1f; }

.user-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; color: white;
  background: linear-gradient(135deg, #d4a853, #b8942e);
}

/* 내용 셀 - 클릭 가능 */
.content-cell {
  display: flex; align-items: center; gap: 12px;
  max-width: 300px; cursor: pointer;
  padding: 4px; border-radius: 8px;
  transition: background 0.2s;
}
.content-cell:hover { background: #f5f5f7; }

/* 이미지 미리보기 */
.image-preview {
  width: 48px; height: 48px; border-radius: 8px;
  overflow: hidden; flex-shrink: 0;
  border: 1px solid #e5e5ea;
}
.image-preview img {
  width: 100%; height: 100%; object-fit: cover;
}

.message-text { font-size: 14px; color: #1d1d1f; line-height: 1.4; }
.empty-text { color: #aeaeb2; }

.stats-cell { display: flex; gap: 12px; }
.stat-item {
  display: flex; align-items: center; gap: 4px;
  font-size: 13px; color: #86868b;
}
.stat-icon { width: 14px; height: 14px; }

.date-text { font-size: 13px; color: #86868b; }

.btn-action {
  width: 32px; height: 32px; border: none; border-radius: 8px;
  background: #f0f0f0; color: #86868b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.btn-action:hover { background: #e5e5ea; color: #1d1d1f; }
.btn-action.danger:hover { background: #fff0f0; color: #ff3b30; }
.btn-action :deep(svg) { width: 15px; height: 15px; }

.empty-row { text-align: center !important; color: #86868b; padding: 48px !important; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 20px; border-top: 1px solid #f0f0f0; }
.pagination button { padding: 8px 16px; border: 1px solid #e5e5ea; border-radius: 8px; background: white; font-size: 14px; cursor: pointer; }
.pagination button:hover:not(:disabled) { background: #f0f0f0; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

/* 상세 모달 */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}

.detail-modal {
  background: white; border-radius: 20px;
  max-width: 500px; width: 100%;
  max-height: 90vh; overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: absolute; top: 16px; right: 16px;
  width: 36px; height: 36px; border: none; border-radius: 50%;
  background: rgba(0, 0, 0, 0.05); color: #86868b;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; z-index: 10;
}
.modal-close:hover { background: rgba(0, 0, 0, 0.1); color: #1d1d1f; }
.modal-close :deep(svg) { width: 20px; height: 20px; }

.modal-content { padding: 24px; }

.modal-image {
  margin: -24px -24px 24px -24px;
  background: #f5f5f7;
  display: flex; align-items: center; justify-content: center;
  max-height: 400px; overflow: hidden;
}
.modal-image img {
  width: 100%; height: auto; max-height: 400px; object-fit: contain;
}

.modal-message {
  font-size: 16px; line-height: 1.6; color: #1d1d1f;
  padding: 20px; background: #fef3c7; border-radius: 12px;
  margin-bottom: 20px; white-space: pre-wrap;
}

.modal-info {
  background: #f9fafb; border-radius: 12px; padding: 16px;
  margin-bottom: 20px;
}

.info-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}
.info-row:last-child { border-bottom: none; }

.info-label { font-size: 13px; color: #6b7280; }
.info-value { font-size: 14px; color: #1d1d1f; font-weight: 500; }

.btn-delete {
  width: 100%; padding: 14px;
  background: #fff0f0; border: 1px solid #fecaca;
  border-radius: 12px; color: #dc2626;
  font-size: 14px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 8px;
  transition: all 0.2s;
}
.btn-delete:hover { background: #fecaca; }
.btn-delete :deep(svg) { width: 16px; height: 16px; }
</style>
