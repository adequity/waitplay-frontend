<template>
  <div class="guestbook-management">
    <div class="page-header">
      <div>
        <h1>방명록 관리</h1>
        <p class="subtitle">전체 시스템의 방명록을 관리합니다</p>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <IconBase name="search" class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="사용자명, 메시지 검색..." @input="debouncedSearch" />
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>작성자</th>
            <th>메시지</th>
            <th>색상</th>
            <th>작성일</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="msg in messages" :key="msg.id" :class="{ pinned: msg.isPinned }">
            <td>
              <div class="user-cell">
                <div class="user-avatar" :style="{ background: getColorGradient(msg.color) }">
                  {{ getInitial(msg.userName) }}
                </div>
                <span>{{ msg.userName }}</span>
              </div>
            </td>
            <td>
              <div class="message-preview">
                <span v-if="msg.message">{{ truncate(msg.message, 50) }}</span>
                <span v-else-if="msg.imageUrl" class="image-badge">이미지</span>
                <span v-else class="empty-text">-</span>
              </div>
            </td>
            <td>
              <span class="color-badge" :style="{ background: getColorValue(msg.color) }"></span>
            </td>
            <td>{{ formatDate(msg.createdAt) }}</td>
            <td>
              <span class="pin-badge" v-if="msg.isPinned">
                <IconBase name="pin" class="pin-icon" />
                고정
              </span>
              <span v-else class="normal-badge">일반</span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-action" @click="togglePin(msg)" :title="msg.isPinned ? '고정 해제' : '고정'">
                  <IconBase name="pin" />
                </button>
                <button class="btn-action danger" @click="confirmDelete(msg)" title="삭제">
                  <IconBase name="trash" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="messages.length === 0">
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
    messages.value = data.messages
    totalPages.value = data.totalPages
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { page.value = 1; fetchMessages() }, 300) as any
}

const togglePin = async (msg: any) => {
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/guestbook/${msg.id}/pin`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    msg.isPinned = !msg.isPinned
  } catch (error) {
    alert('변경에 실패했습니다')
  }
}

const confirmDelete = async (msg: any) => {
  if (!confirm('이 방명록을 삭제하시겠습니까?')) return
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
const truncate = (text: string, len: number) => text.length > len ? text.slice(0, len) + '...' : text
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ko-KR')

const colorMap: Record<string, string> = {
  yellow: '#fef3c7',
  pink: '#fce7f3',
  blue: '#dbeafe',
  green: '#dcfce7',
  purple: '#ede9fe'
}

const getColorValue = (color: string) => colorMap[color] || '#fef3c7'
const getColorGradient = (color: string) => {
  const base = getColorValue(color)
  return `linear-gradient(135deg, ${base}, ${base})`
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

.loading-container { display: flex; justify-content: center; padding: 80px 0; }
.spinner { width: 40px; height: 40px; border: 3px solid #e5e5ea; border-top-color: #d4a853; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.table-container { background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 16px 20px; text-align: left; border-bottom: 1px solid #f0f0f0; }
.data-table th { font-size: 12px; font-weight: 600; color: #86868b; text-transform: uppercase; background: #fafafa; }
.data-table tbody tr:hover { background: #fafafa; }
.data-table tbody tr.pinned { background: #fffbeb; }

.user-cell { display: flex; align-items: center; gap: 12px; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #1d1d1f; }

.message-preview { max-width: 300px; }
.image-badge { display: inline-block; padding: 2px 8px; background: #e0e7ff; color: #4f46e5; border-radius: 4px; font-size: 12px; }
.empty-text { color: #aeaeb2; }

.color-badge { display: inline-block; width: 24px; height: 24px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.1); }

.pin-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: #fef3c7; color: #b8942e; border-radius: 6px; font-size: 12px; font-weight: 600; }
.pin-icon { width: 12px; height: 12px; }
.normal-badge { color: #86868b; font-size: 12px; }

.action-buttons { display: flex; gap: 8px; }
.btn-action { width: 36px; height: 36px; border: none; border-radius: 8px; background: #f0f0f0; color: #86868b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-action:hover { background: #e5e5ea; color: #1d1d1f; }
.btn-action.danger:hover { background: #fff0f0; color: #ff3b30; }
.btn-action :deep(svg) { width: 16px; height: 16px; }

.empty-row { text-align: center !important; color: #86868b; padding: 48px !important; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 20px; border-top: 1px solid #f0f0f0; }
.pagination button { padding: 8px 16px; border: 1px solid #e5e5ea; border-radius: 8px; background: white; font-size: 14px; cursor: pointer; }
.pagination button:hover:not(:disabled) { background: #f0f0f0; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
