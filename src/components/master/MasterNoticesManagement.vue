<template>
  <div class="notices-management">
    <div class="page-header">
      <div>
        <h1>공지사항 관리</h1>
        <p class="subtitle">전체 시스템의 공지사항을 관리합니다</p>
      </div>
    </div>

    <LoadingSpinner v-if="loading" message="공지사항을 불러오는 중..." />

    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>제목</th>
            <th>유형</th>
            <th>작성일</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="notice in notices" :key="notice.id" :class="{ pinned: notice.isPinned }">
            <td>
              <div class="title-cell">
                <IconBase v-if="notice.isPinned" name="pin" class="pin-icon" />
                <span>{{ notice.title }}</span>
              </div>
            </td>
            <td>
              <span class="type-badge" :class="notice.type">
                {{ getTypeLabel(notice.type) }}
              </span>
            </td>
            <td>{{ formatDate(notice.createdAt) }}</td>
            <td>
              <span class="status-badge" :class="{ active: notice.isActive }">
                {{ notice.isActive ? '활성' : '비활성' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-action" @click="togglePin(notice)" :title="notice.isPinned ? '고정 해제' : '고정'">
                  <IconBase name="pin" />
                </button>
                <button class="btn-action danger" @click="confirmDelete(notice)" title="삭제">
                  <IconBase name="trash" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="notices.length === 0">
            <td colspan="5" class="empty-row">공지사항이 없습니다</td>
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
const notices = ref<any[]>([])
const page = ref(1)
const pageSize = ref(20)
const totalPages = ref(1)

const fetchNotices = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({ page: page.value.toString(), pageSize: pageSize.value.toString() })
    const response = await fetch(`${API_URL}/api/masteradmin/notices?${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    notices.value = data.notices
    totalPages.value = data.totalPages
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const togglePin = async (notice: any) => {
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/notices/${notice.id}/pin`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    notice.isPinned = !notice.isPinned
  } catch (error) {
    alert('변경에 실패했습니다')
  }
}

const confirmDelete = async (notice: any) => {
  if (!confirm('이 공지사항을 삭제하시겠습니까?')) return
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/notices/${notice.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    fetchNotices()
  } catch (error) {
    alert('삭제에 실패했습니다')
  }
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = { 'notice': '공지', 'event': '이벤트', 'update': '업데이트' }
  return labels[type] || type
}

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ko-KR')

watch(page, fetchNotices)
onMounted(() => fetchNotices())
</script>

<style scoped>
.notices-management { padding: 0; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 28px; font-weight: 700; color: #1d1d1f; margin: 0 0 8px 0; }
.subtitle { font-size: 15px; color: #86868b; margin: 0; }

.table-container { background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 16px 20px; text-align: left; border-bottom: 1px solid #f0f0f0; }
.data-table th { font-size: 12px; font-weight: 600; color: #86868b; text-transform: uppercase; background: #fafafa; }
.data-table tbody tr:hover { background: #fafafa; }
.data-table tbody tr.pinned { background: #fffbeb; }

.title-cell { display: flex; align-items: center; gap: 8px; font-weight: 500; }
.pin-icon { width: 14px; height: 14px; color: #d4a853; }

.type-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #f0f0f0; color: #86868b; }
.type-badge.notice { background: #dbeafe; color: #1d4ed8; }
.type-badge.event { background: #fef3c7; color: #b8942e; }
.type-badge.update { background: #dcfce7; color: #16a34a; }

.status-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #fff0f0; color: #ff6b6b; }
.status-badge.active { background: #dcfce7; color: #16a34a; }

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
