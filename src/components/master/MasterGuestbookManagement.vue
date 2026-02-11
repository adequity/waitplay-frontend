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
              <div class="message-preview">
                <span v-if="msg.hasImage" class="image-badge">
                  <IconBase name="image" class="badge-icon" />
                  이미지
                </span>
                <span v-if="msg.message" :class="{ 'with-image': msg.hasImage }">{{ truncate(msg.message, 40) }}</span>
                <span v-else-if="!msg.hasImage" class="empty-text">-</span>
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

const confirmDelete = async (msg: any) => {
  if (!confirm(`이 방명록을 삭제하시겠습니까?\n\n매장: ${msg.storeName || '알 수 없음'}\n작성자: ${msg.userName}`)) return
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/guestbook/${msg.id}`, {
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

.message-preview { display: flex; align-items: center; gap: 8px; max-width: 280px; }
.message-preview span.with-image { margin-left: 4px; }
.image-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; background: #e0e7ff; color: #4f46e5;
  border-radius: 4px; font-size: 11px; font-weight: 500;
  white-space: nowrap;
}
.badge-icon { width: 12px; height: 12px; }
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
</style>
