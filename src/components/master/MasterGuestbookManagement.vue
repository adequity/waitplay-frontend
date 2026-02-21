<template>
  <div class="guestbook-management">
    <div class="page-header">
      <div>
        <h1>방명록 관리</h1>
        <p class="subtitle">전체 시스템의 방명록을 모니터링합니다</p>
      </div>
    </div>

    <!-- 탭 메뉴 -->
    <div class="tab-menu">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'messages' }"
        @click="activeTab = 'messages'"
      >
        <IconBase name="message" />
        전체 방명록
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'reports', hasNotification: pendingReportsCount > 0 }"
        @click="activeTab = 'reports'"
      >
        <IconBase name="flag" />
        삭제 요청
        <span v-if="pendingReportsCount > 0" class="notification-badge">{{ pendingReportsCount }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'palette' }"
        @click="activeTab = 'palette'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="13.5" cy="6.5" r="2.5"/>
          <circle cx="17.5" cy="10.5" r="2.5"/>
          <circle cx="8.5" cy="7.5" r="2.5"/>
          <circle cx="6.5" cy="12.5" r="2.5"/>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
        </svg>
        팔레트 관리
      </button>
    </div>

    <!-- 전체 방명록 탭 -->
    <div v-if="activeTab === 'messages'">
      <div class="filters-bar">
        <div class="search-box">
          <IconBase name="search" class="search-icon" />
          <input v-model="searchQuery" type="text" placeholder="매장명, 작성자, 내용 검색..." @input="debouncedSearch" />
        </div>
        <div class="filter-group">
          <select v-model="messageReportFilter" class="filter-select" @change="onReportFilterChange">
            <option value="">전체</option>
            <option value="reported">삭제 요청됨</option>
            <option value="not_reported">요청 없음</option>
          </select>
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
            <th>신고</th>
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
              <div v-if="msg.isReported" class="report-badge-cell">
                <span class="report-badge reported" :title="msg.reportInfo?.reason">
                  <IconBase name="flag" class="badge-icon" />
                  삭제 요청
                </span>
                <div class="report-reason-tooltip" v-if="msg.reportInfo?.reason">
                  <strong>사유:</strong> {{ msg.reportInfo.reason }}
                </div>
              </div>
              <span v-else class="report-badge none">-</span>
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
            <td colspan="7" class="empty-row">방명록이 없습니다</td>
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

    <!-- 삭제 요청 탭 -->
    <div v-if="activeTab === 'reports'">
      <div class="reports-stats">
        <div class="stat-card pending">
          <span class="stat-number">{{ reportStats.pending }}</span>
          <span class="stat-label">대기 중</span>
        </div>
        <div class="stat-card approved">
          <span class="stat-number">{{ reportStats.approved }}</span>
          <span class="stat-label">승인됨</span>
        </div>
        <div class="stat-card rejected">
          <span class="stat-number">{{ reportStats.rejected }}</span>
          <span class="stat-label">반려됨</span>
        </div>
      </div>

      <div class="filters-bar centered">
        <div class="filter-group">
          <select v-model="reportStatusFilter" class="filter-select" @change="fetchReports">
            <option value="">전체 상태</option>
            <option value="pending">대기 중</option>
            <option value="approved">승인됨</option>
            <option value="rejected">반려됨</option>
          </select>
        </div>
      </div>

      <LoadingSpinner v-if="reportsLoading" message="신고 목록을 불러오는 중..." />

      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>상태</th>
              <th>신고자</th>
              <th>방명록</th>
              <th>사유</th>
              <th>처리 코멘트</th>
              <th>요청일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.id">
              <td>
                <span class="status-badge" :class="report.status">
                  {{ getStatusLabel(report.status) }}
                </span>
              </td>
              <td>
                <div class="reporter-cell">
                  <span class="reporter-name">{{ report.reporter?.nickname || '알 수 없음' }}</span>
                  <span class="reporter-company">{{ report.reporter?.company || '' }}</span>
                </div>
              </td>
              <td>
                <div class="report-message-cell" @click="openReportDetailModal(report)">
                  <div v-if="report.guestbookMessage?.imageUrl" class="image-preview small">
                    <img :src="report.guestbookMessage.imageUrl" alt="방명록 이미지" />
                  </div>
                  <div class="message-info">
                    <span class="message-author">{{ report.guestbookMessage?.userName || '삭제됨' }}</span>
                    <span class="message-preview">{{ truncate(report.guestbookMessage?.message || '(이미지)', 20) }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="reason-text">{{ truncate(report.reason, 30) }}</span>
              </td>
              <td>
                <span v-if="report.adminComment" class="admin-comment-text" :title="report.adminComment">
                  {{ truncate(report.adminComment, 20) }}
                </span>
                <span v-else class="no-comment">-</span>
              </td>
              <td>
                <span class="date-text">{{ formatDate(report.createdAt) }}</span>
              </td>
              <td>
                <div class="action-buttons" v-if="report.status === 'pending'">
                  <button class="btn-action approve" @click="openApproveModal(report)" title="승인">
                    <IconBase name="check" />
                  </button>
                  <button class="btn-action reject" @click="openRejectModal(report)" title="반려">
                    <IconBase name="x" />
                  </button>
                </div>
                <span v-else class="handled-info">
                  {{ formatDate(report.handledAt) }}
                </span>
              </td>
            </tr>
            <tr v-if="!reports || reports.length === 0">
              <td colspan="7" class="empty-row">삭제 요청이 없습니다</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" v-if="reportsTotalPages > 1">
          <button @click="reportsPage = reportsPage - 1" :disabled="reportsPage <= 1">이전</button>
          <span>{{ reportsPage }} / {{ reportsTotalPages }}</span>
          <button @click="reportsPage = reportsPage + 1" :disabled="reportsPage >= reportsTotalPages">다음</button>
        </div>
      </div>
    </div>

    <!-- 팔레트 관리 탭 -->
    <div v-if="activeTab === 'palette'" class="palette-section">
      <div class="palette-header">
        <div>
          <h2 class="palette-title">색상 팔레트 설정</h2>
          <p class="palette-desc">방명록 작성 시 사용자에게 표시되는 색상을 관리합니다.</p>
        </div>
        <div class="palette-actions">
          <button class="btn-outline" @click="resetPalette" :disabled="paletteSaving">
            기본값 복원
          </button>
          <button class="btn-primary" @click="savePalette" :disabled="paletteSaving">
            {{ paletteSaving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>

      <div class="palette-card">
        <div class="palette-count">현재 팔레트 ({{ paletteColors.length }}색)</div>

        <!-- 색상 그리드 -->
        <div class="color-grid">
          <div
            v-for="(color, index) in paletteColors"
            :key="index"
            class="color-item"
          >
            <div class="color-swatch-wrapper">
              <div
                class="color-swatch"
                :style="{ backgroundColor: color }"
                :class="{ 'is-white': color.toUpperCase() === '#FFFFFF' }"
                @click="openEditColor(index)"
              ></div>
              <button class="color-remove" @click="removeColor(index)">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <span class="color-hex">{{ color }}</span>
          </div>
        </div>

        <!-- 색상 추가 패널 -->
        <div class="add-color-panel">
          <div class="add-color-title">색상 추가</div>
          <div class="add-color-row">
            <div class="color-picker-wrapper">
              <div class="color-picker-preview" :style="{ backgroundColor: newColorHex }"></div>
              <input
                type="color"
                v-model="newColorHex"
                class="native-picker"
              />
            </div>
            <div class="hex-input-group">
              <span class="hex-prefix">#</span>
              <input
                type="text"
                class="hex-input"
                :value="newColorHex.replace('#', '')"
                @input="onHexInput"
                maxlength="6"
                placeholder="FF0000"
              />
            </div>
            <button class="btn-add-color" @click="addColor">추가</button>
          </div>
        </div>
      </div>

      <!-- 미리보기 -->
      <div class="preview-section">
        <div class="preview-label">에디터 미리보기</div>
        <div class="preview-strip">
          <div class="preview-scroll">
            <div
              v-for="(color, index) in paletteColors"
              :key="'preview-' + index"
              class="preview-dot"
              :style="{ backgroundColor: color }"
              :class="{ 'is-white': color.toUpperCase() === '#FFFFFF' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 색상 편집 모달 -->
    <div v-if="showEditColorModal" class="modal-overlay" @click.self="showEditColorModal = false">
      <div class="reject-modal">
        <div class="reject-modal-header">
          <h3>색상 편집</h3>
          <button class="modal-close" @click="showEditColorModal = false">
            <IconBase name="x" />
          </button>
        </div>
        <div class="reject-modal-body" style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
          <div class="color-picker-wrapper large">
            <div class="color-picker-preview large" :style="{ backgroundColor: editColorHex }"></div>
            <input type="color" v-model="editColorHex" class="native-picker large" />
          </div>
          <div class="hex-input-group">
            <span class="hex-prefix">#</span>
            <input
              type="text"
              class="hex-input"
              :value="editColorHex.replace('#', '')"
              @input="onEditHexInput"
              maxlength="6"
            />
          </div>
        </div>
        <div class="reject-modal-footer">
          <button class="btn-cancel" @click="showEditColorModal = false">취소</button>
          <button class="btn-submit-approve" @click="confirmEditColor">적용</button>
        </div>
      </div>
    </div>

    <!-- 신고 상세 모달 -->
    <div v-if="showReportDetailModal" class="modal-overlay" @click.self="closeReportDetailModal">
      <div class="detail-modal report-detail">
        <button class="modal-close" @click="closeReportDetailModal">
          <IconBase name="x" />
        </button>

        <div class="modal-content" v-if="selectedReport">
          <h3 class="modal-title">삭제 요청 상세</h3>

          <!-- 상태 -->
          <div class="status-section">
            <span class="status-badge large" :class="selectedReport.status">
              {{ getStatusLabel(selectedReport.status) }}
            </span>
          </div>

          <!-- 신고자 정보 -->
          <div class="info-section">
            <h4>신고자 정보</h4>
            <div class="info-row">
              <span class="info-label">이름</span>
              <span class="info-value">{{ selectedReport.reporter?.nickname || '알 수 없음' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">매장</span>
              <span class="info-value">{{ selectedReport.reporter?.company || '-' }}</span>
            </div>
          </div>

          <!-- 삭제 사유 -->
          <div class="info-section">
            <h4>삭제 사유</h4>
            <p class="reason-content">{{ selectedReport.reason }}</p>
          </div>

          <!-- 방명록 내용 -->
          <div class="info-section" v-if="selectedReport.guestbookMessage">
            <h4>방명록 내용</h4>
            <div class="guestbook-preview">
              <div v-if="selectedReport.guestbookMessage.imageUrl" class="preview-image">
                <img :src="selectedReport.guestbookMessage.imageUrl" alt="방명록 이미지" />
              </div>
              <div v-if="selectedReport.guestbookMessage.message" class="preview-message">
                {{ selectedReport.guestbookMessage.message }}
              </div>
              <div class="preview-meta">
                <span>작성자: {{ selectedReport.guestbookMessage.userName }}</span>
                <span>매장: {{ selectedReport.storeName || '알 수 없음' }}</span>
              </div>
            </div>
          </div>
          <div class="info-section" v-else>
            <h4>방명록 내용</h4>
            <p class="deleted-notice">이미 삭제된 방명록입니다.</p>
          </div>

          <!-- 반려 사유 (반려된 경우) -->
          <div class="info-section" v-if="selectedReport.status === 'rejected' && selectedReport.rejectReason">
            <h4>반려 사유</h4>
            <p class="reject-reason">{{ selectedReport.rejectReason }}</p>
          </div>

          <!-- MasterAdmin 코멘트 (처리된 경우) -->
          <div class="info-section" v-if="selectedReport.status !== 'pending' && selectedReport.adminComment">
            <h4>관리자 코멘트</h4>
            <p class="admin-comment-content">{{ selectedReport.adminComment }}</p>
          </div>

          <!-- 액션 버튼 (대기 중인 경우만) -->
          <div class="action-section" v-if="selectedReport.status === 'pending'">
            <button class="btn-approve" @click="openApproveModal(selectedReport)">
              <IconBase name="check" />
              승인 (삭제)
            </button>
            <button class="btn-reject" @click="openRejectModal(selectedReport)">
              <IconBase name="x" />
              반려
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 반려 사유 입력 모달 -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
      <div class="reject-modal">
        <div class="reject-modal-header">
          <h3>삭제 요청 반려</h3>
          <button class="modal-close" @click="closeRejectModal">
            <IconBase name="x" />
          </button>
        </div>
        <div class="reject-modal-body">
          <p class="reject-notice">삭제 요청을 반려하는 사유를 입력해주세요.</p>
          <textarea
            v-model="rejectReason"
            class="reject-textarea"
            placeholder="반려 사유를 입력해주세요..."
            rows="4"
          ></textarea>
          <p class="comment-label">관리자 코멘트 (선택)</p>
          <textarea
            v-model="adminComment"
            class="comment-textarea"
            placeholder="추가 코멘트를 남길 수 있습니다..."
            rows="2"
          ></textarea>
        </div>
        <div class="reject-modal-footer">
          <button class="btn-cancel" @click="closeRejectModal">취소</button>
          <button
            class="btn-submit-reject"
            @click="submitReject"
            :disabled="!rejectReason.trim() || isSubmittingReject"
          >
            {{ isSubmittingReject ? '처리 중...' : '반려' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 승인 확인 모달 -->
    <div v-if="showApproveModal" class="modal-overlay" @click.self="closeApproveModal">
      <div class="approve-modal">
        <div class="approve-modal-header">
          <h3>삭제 요청 승인</h3>
          <button class="modal-close" @click="closeApproveModal">
            <IconBase name="x" />
          </button>
        </div>
        <div class="approve-modal-body">
          <p class="approve-notice">
            <IconBase name="alert-triangle" class="warning-icon" />
            이 삭제 요청을 승인하면 방명록이 삭제됩니다.
          </p>
          <p class="comment-label">관리자 코멘트 (선택)</p>
          <textarea
            v-model="adminComment"
            class="comment-textarea"
            placeholder="추가 코멘트를 남길 수 있습니다..."
            rows="2"
          ></textarea>
        </div>
        <div class="approve-modal-footer">
          <button class="btn-cancel" @click="closeApproveModal">취소</button>
          <button
            class="btn-submit-approve"
            @click="submitApprove"
            :disabled="isSubmittingApprove"
          >
            {{ isSubmittingApprove ? '처리 중...' : '승인 (삭제)' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/IconBase.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

// 탭 관리
const activeTab = ref<'messages' | 'reports' | 'palette'>('messages')

const loading = ref(true)
const messages = ref<any[]>([])
const page = ref(1)
const pageSize = ref(20)
const totalPages = ref(1)
const searchQuery = ref('')
const messageReportFilter = ref('')

// 상세 모달
const showDetailModal = ref(false)
const selectedMessage = ref<any>(null)

// 신고 관련 상태
const reportsLoading = ref(false)
const reports = ref<any[]>([])
const reportsPage = ref(1)
const reportsTotalPages = ref(1)
const reportStatusFilter = ref('')
const reportStats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0
})

// 신고 모달
const showReportDetailModal = ref(false)
const selectedReport = ref<any>(null)
const showRejectModal = ref(false)
const rejectReason = ref('')
const adminComment = ref('')
const isSubmittingReject = ref(false)
const reportToReject = ref<any>(null)

// 승인 모달
const showApproveModal = ref(false)
const isSubmittingApprove = ref(false)
const reportToApprove = ref<any>(null)

// 대기 중인 신고 수 (탭 배지용)
const pendingReportsCount = computed(() => reportStats.value.pending)

let searchTimeout: number | null = null

const fetchMessages = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: page.value.toString(),
      pageSize: pageSize.value.toString()
    })
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (messageReportFilter.value) params.append('reportStatus', messageReportFilter.value)

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

const onReportFilterChange = () => {
  page.value = 1
  fetchMessages()
}

const openDetailModal = async (msg: any) => {
  selectedMessage.value = msg
  showDetailModal.value = true

  // 조회수 증가
  try {
    const response = await fetch(`${API_URL}/api/guestbook/${msg.id}/view`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (response.ok) {
      const data = await response.json()
      // 로컬 상태 업데이트
      msg.viewCount = data.viewCount
      selectedMessage.value = { ...msg, viewCount: data.viewCount }
    }
  } catch (error) {
    console.error('조회수 증가 실패:', error)
  }
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

// 신고 목록 조회
const fetchReports = async () => {
  try {
    reportsLoading.value = true
    const params = new URLSearchParams({
      page: reportsPage.value.toString(),
      pageSize: '20'
    })
    if (reportStatusFilter.value) {
      params.append('status', reportStatusFilter.value)
    }

    const response = await fetch(`${API_URL}/api/masteradmin/guestbook/reports?${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    reports.value = data.data || []
    reportsTotalPages.value = data.totalPages || 1
    reportStats.value = {
      pending: data.stats?.pending || 0,
      approved: data.stats?.approved || 0,
      rejected: data.stats?.rejected || 0,
      total: data.totalCount || 0
    }
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    reports.value = []
    reportsTotalPages.value = 1
  } finally {
    reportsLoading.value = false
  }
}

// 신고 처리 (승인/반려)
const handleReport = async (reportId: string, action: 'approve' | 'reject') => {
  try {
    const body: any = { action }
    if (action === 'reject') {
      body.rejectReason = rejectReason.value
    }
    if (adminComment.value.trim()) {
      body.adminComment = adminComment.value.trim()
    }

    const response = await fetch(`${API_URL}/api/masteradmin/guestbook/reports/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed')
    }

    // 성공 메시지
    if (action === 'approve') {
      alert('삭제 요청이 승인되었습니다. 방명록이 삭제되었습니다.')
    } else {
      alert('삭제 요청이 반려되었습니다.')
    }

    // 모달 닫기 및 데이터 새로고침
    closeRejectModal()
    closeApproveModal()
    closeReportDetailModal()
    fetchReports()
  } catch (error: any) {
    alert(error.message || '처리에 실패했습니다')
  }
}

// 반려 모달 열기
const openRejectModal = (report: any) => {
  reportToReject.value = report
  rejectReason.value = ''
  adminComment.value = ''
  showRejectModal.value = true
}

// 반려 모달 닫기
const closeRejectModal = () => {
  showRejectModal.value = false
  rejectReason.value = ''
  adminComment.value = ''
  reportToReject.value = null
  isSubmittingReject.value = false
}

// 승인 모달 열기
const openApproveModal = (report: any) => {
  reportToApprove.value = report
  adminComment.value = ''
  showApproveModal.value = true
}

// 승인 모달 닫기
const closeApproveModal = () => {
  showApproveModal.value = false
  adminComment.value = ''
  reportToApprove.value = null
  isSubmittingApprove.value = false
}

// 승인 제출
const submitApprove = async () => {
  if (!reportToApprove.value) return

  isSubmittingApprove.value = true
  await handleReport(reportToApprove.value.id, 'approve')
  isSubmittingApprove.value = false
}

// 반려 제출
const submitReject = async () => {
  if (!rejectReason.value.trim()) {
    alert('반려 사유를 입력해주세요.')
    return
  }
  if (!reportToReject.value) return

  isSubmittingReject.value = true
  await handleReport(reportToReject.value.id, 'reject')
  isSubmittingReject.value = false
}

// 신고 상세 모달
const openReportDetailModal = (report: any) => {
  selectedReport.value = report
  showReportDetailModal.value = true
}

const closeReportDetailModal = () => {
  showReportDetailModal.value = false
  selectedReport.value = null
}

// 상태 라벨
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return '대기 중'
    case 'approved': return '승인됨'
    case 'rejected': return '반려됨'
    default: return status
  }
}

// ========== 팔레트 관리 ==========
const DEFAULT_PALETTE = [
  '#FFFFFF', '#000000', '#A6A6A6', '#FF4040', '#FF7B00',
  '#FFD700', '#00E676', '#00BCD4', '#2979FF', '#7C4DFF',
  '#FF4081', '#8D6E63', '#37474F', '#D50000', '#FF6D00',
  '#FFD600', '#00C853', '#00B8D4', '#2962FF', '#6200EA',
  '#C51162', '#3E2723', '#FFAB91', '#B2FF59', '#84FFFF',
  '#B388FF', '#FF80AB'
]

const paletteColors = ref<string[]>([...DEFAULT_PALETTE])
const paletteLoading = ref(false)
const paletteSaving = ref(false)
const newColorHex = ref('#FF0000')

// 색상 편집 모달
const showEditColorModal = ref(false)
const editColorIndex = ref(-1)
const editColorHex = ref('#000000')

const fetchPalette = async () => {
  try {
    paletteLoading.value = true
    const response = await fetch(`${API_URL}/api/masteradmin/guestbook/palette`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    if (data.colors && data.colors.length > 0) {
      paletteColors.value = data.colors
    }
  } catch (error) {
    console.error('Fetch palette error:', error)
  } finally {
    paletteLoading.value = false
  }
}

const savePalette = async () => {
  try {
    paletteSaving.value = true
    const response = await fetch(`${API_URL}/api/masteradmin/guestbook/palette`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ colors: paletteColors.value })
    })
    if (!response.ok) throw new Error('Failed')
    alert('팔레트가 저장되었습니다.')
  } catch (error) {
    console.error('Save palette error:', error)
    alert('팔레트 저장에 실패했습니다.')
  } finally {
    paletteSaving.value = false
  }
}

const addColor = () => {
  const hex = newColorHex.value.toUpperCase()
  if (!/^#[0-9A-F]{6}$/.test(hex)) {
    alert('올바른 HEX 색상을 입력해주세요.')
    return
  }
  if (paletteColors.value.includes(hex)) {
    alert('이미 존재하는 색상입니다.')
    return
  }
  paletteColors.value.push(hex)
}

const removeColor = (index: number) => {
  if (paletteColors.value.length <= 1) {
    alert('최소 1개 이상의 색상이 필요합니다.')
    return
  }
  paletteColors.value.splice(index, 1)
}

const openEditColor = (index: number) => {
  editColorIndex.value = index
  editColorHex.value = paletteColors.value[index] ?? '#000000'
  showEditColorModal.value = true
}

const confirmEditColor = () => {
  if (editColorIndex.value >= 0) {
    paletteColors.value[editColorIndex.value] = editColorHex.value.toUpperCase()
  }
  showEditColorModal.value = false
}

const resetPalette = () => {
  if (confirm('기본 팔레트로 복원하시겠습니까?')) {
    paletteColors.value = [...DEFAULT_PALETTE]
  }
}

const onHexInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
  if (value.length === 6) {
    newColorHex.value = `#${value.toUpperCase()}`
  }
}

const onEditHexInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
  if (value.length === 6) {
    editColorHex.value = `#${value.toUpperCase()}`
  }
}

// 탭 변경 시 데이터 로드
watch(activeTab, (newTab) => {
  if (newTab === 'reports' && reports.value.length === 0) {
    fetchReports()
  }
  if (newTab === 'palette' && paletteColors.value.length === DEFAULT_PALETTE.length && JSON.stringify(paletteColors.value) === JSON.stringify(DEFAULT_PALETTE)) {
    fetchPalette()
  }
})

watch(page, fetchMessages)
watch(reportsPage, fetchReports)

onMounted(() => {
  fetchMessages()
  // 탭 배지용 신고 통계만 먼저 로드
  fetchReports()
})
</script>

<style scoped>
.guestbook-management { padding: 0; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 28px; font-weight: 700; color: #1d1d1f; margin: 0 0 8px 0; }
.subtitle { font-size: 15px; color: #86868b; margin: 0; }

.filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
.filters-bar.centered { justify-content: center; }
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

/* 탭 메뉴 */
.tab-menu {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: #f5f5f7;
  padding: 6px;
  border-radius: 12px;
  width: fit-content;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #86868b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tab-btn:hover {
  color: #1d1d1f;
}

.tab-btn.active {
  background: white;
  color: #1d1d1f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-btn :deep(svg) {
  width: 16px;
  height: 16px;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ff3b30;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 신고 통계 카드 */
.reports-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  padding: 20px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-card .stat-number {
  font-size: 32px;
  font-weight: 700;
}

.stat-card .stat-label {
  font-size: 13px;
  color: #86868b;
}

.stat-card.pending .stat-number { color: #f59e0b; }
.stat-card.approved .stat-number { color: #10b981; }
.stat-card.rejected .stat-number { color: #ef4444; }

/* 필터 */
.filter-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  min-width: 140px;
}

.filter-select:focus {
  outline: none;
  border-color: #d4a853;
}

/* 상태 배지 */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.approved {
  background: #d1fae5;
  color: #059669;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.large {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 8px;
}

/* 신고자 셀 */
.reporter-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reporter-name {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.reporter-company {
  font-size: 12px;
  color: #86868b;
}

/* 신고 방명록 셀 */
.report-message-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.2s;
}

.report-message-cell:hover {
  background: #f5f5f7;
}

.image-preview.small {
  width: 36px;
  height: 36px;
}

.message-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.message-author {
  font-size: 12px;
  color: #86868b;
}

.message-preview {
  font-size: 14px;
  color: #1d1d1f;
}

.reason-text {
  font-size: 14px;
  color: #6b7280;
}

/* 액션 버튼 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action.approve {
  background: #d1fae5;
  color: #059669;
}

.btn-action.approve:hover {
  background: #a7f3d0;
  color: #047857;
}

.btn-action.reject {
  background: #fee2e2;
  color: #dc2626;
}

.btn-action.reject:hover {
  background: #fecaca;
  color: #b91c1c;
}

.handled-info {
  font-size: 12px;
  color: #86868b;
}

/* 신고 상세 모달 */
.report-detail {
  max-width: 560px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 20px 0;
}

.status-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.info-section {
  margin-bottom: 20px;
}

.info-section h4 {
  font-size: 12px;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  margin: 0 0 12px 0;
}

.reason-content {
  font-size: 15px;
  line-height: 1.6;
  color: #1d1d1f;
  margin: 0;
  padding: 16px;
  background: #fef3c7;
  border-radius: 12px;
}

.guestbook-preview {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  overflow: hidden;
}

.preview-image {
  margin: -16px -16px 16px -16px;
  max-height: 200px;
  overflow: hidden;
}

.preview-image img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.preview-message {
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.preview-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.deleted-notice {
  font-size: 14px;
  color: #9ca3af;
  font-style: italic;
  margin: 0;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  text-align: center;
}

.reject-reason {
  font-size: 14px;
  line-height: 1.6;
  color: #dc2626;
  margin: 0;
  padding: 16px;
  background: #fee2e2;
  border-radius: 12px;
}

.action-section {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-approve,
.btn-reject {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve {
  background: #d1fae5;
  color: #059669;
}

.btn-approve:hover {
  background: #a7f3d0;
}

.btn-reject {
  background: #fee2e2;
  color: #dc2626;
}

.btn-reject:hover {
  background: #fecaca;
}

.btn-approve :deep(svg),
.btn-reject :deep(svg) {
  width: 16px;
  height: 16px;
}

/* 반려 모달 */
.reject-modal {
  background: white;
  border-radius: 16px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.reject-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.reject-modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1d1d1f;
}

.reject-modal-body {
  padding: 24px;
}

.reject-notice {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.reject-textarea {
  width: 100%;
  padding: 14px;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.reject-textarea:focus {
  outline: none;
  border-color: #d4a853;
}

.reject-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f9fafb;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f5f5f7;
}

.btn-submit-reject {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: #dc2626;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit-reject:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-submit-reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 코멘트 관련 스타일 */
.comment-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin: 16px 0 8px 0;
}

.comment-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
}

.comment-textarea:focus {
  outline: none;
  border-color: #d4a853;
}

.admin-comment-text {
  font-size: 13px;
  color: #6b7280;
  cursor: help;
}

.no-comment {
  color: #d1d5db;
}

.admin-comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  margin: 0;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 12px;
  border-left: 4px solid #0ea5e9;
}

/* 승인 모달 */
.approve-modal {
  background: white;
  border-radius: 16px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.approve-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.approve-modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1d1d1f;
}

.approve-modal-body {
  padding: 24px;
}

.approve-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #d97706;
  margin: 0 0 16px 0;
  padding: 14px 16px;
  background: #fef3c7;
  border-radius: 10px;
}

.warning-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.approve-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #f9fafb;
}

.btn-submit-approve {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: #059669;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit-approve:hover:not(:disabled) {
  background: #047857;
}

.btn-submit-approve:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 반응형 */
/* 신고 배지 셀 */
.report-badge-cell {
  position: relative;
}

.report-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.report-badge.reported {
  background: #fef3c7;
  color: #d97706;
  cursor: help;
}

.report-badge.none {
  color: #d1d5db;
}

.report-badge .badge-icon {
  width: 12px;
  height: 12px;
}

.report-badge-cell:hover .report-reason-tooltip {
  display: block;
}

.report-reason-tooltip {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 10px 14px;
  background: #1f2937;
  color: white;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 8px;
  white-space: nowrap;
  max-width: 300px;
  white-space: normal;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.report-reason-tooltip strong {
  font-weight: 600;
  color: #fcd34d;
}

/* 팔레트 관리 */
.palette-section { }
.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}
.palette-title { font-size: 20px; font-weight: 700; color: #1d1d1f; margin: 0 0 4px 0; }
.palette-desc { font-size: 14px; color: #86868b; margin: 0; }
.palette-actions { display: flex; gap: 10px; flex-shrink: 0; }

.btn-outline {
  padding: 10px 20px; border: 1px solid #e5e5ea; border-radius: 10px;
  background: white; font-size: 14px; font-weight: 500; color: #6b7280;
  cursor: pointer; transition: all 0.2s;
}
.btn-outline:hover:not(:disabled) { background: #f5f5f7; }
.btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary {
  padding: 10px 20px; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #d4a853, #b8942e); font-size: 14px;
  font-weight: 600; color: white; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.palette-card {
  background: white; border-radius: 16px; padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); margin-bottom: 24px;
}
.palette-count {
  font-size: 13px; font-weight: 600; color: #86868b;
  text-transform: uppercase; margin-bottom: 16px;
}

.color-grid {
  display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px;
}
.color-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.color-swatch-wrapper {
  position: relative; width: 48px; height: 48px;
}
.color-swatch {
  width: 48px; height: 48px; border-radius: 12px; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.color-swatch:hover { transform: scale(1.08); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
.color-swatch.is-white { border: 1px solid #e5e5ea; }

.color-remove {
  position: absolute; top: -6px; right: -6px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #ff3b30; border: 2px solid white; color: white;
  cursor: pointer; display: none; align-items: center; justify-content: center;
  padding: 0; line-height: 1;
}
.color-swatch-wrapper:hover .color-remove { display: flex; }
.color-hex { font-size: 10px; color: #aeaeb2; font-family: monospace; }

/* 색상 추가 패널 */
.add-color-panel {
  padding-top: 20px; border-top: 1px solid #f0f0f0;
}
.add-color-title {
  font-size: 14px; font-weight: 600; color: #1d1d1f; margin-bottom: 12px;
}
.add-color-row {
  display: flex; align-items: center; gap: 12px;
}
.color-picker-wrapper {
  position: relative; width: 44px; height: 44px; flex-shrink: 0;
}
.color-picker-wrapper.large { width: 80px; height: 80px; }
.color-picker-preview {
  width: 44px; height: 44px; border-radius: 10px;
  border: 2px solid #e5e5ea; cursor: pointer;
}
.color-picker-preview.large { width: 80px; height: 80px; border-radius: 16px; }
.native-picker {
  position: absolute; inset: 0; width: 100%; height: 100%;
  opacity: 0; cursor: pointer; border: none; padding: 0;
}
.native-picker.large { width: 80px; height: 80px; }

.hex-input-group {
  display: flex; align-items: center; gap: 2px;
  border: 1px solid #e5e5ea; border-radius: 10px; padding: 0 12px;
  background: white; height: 44px;
}
.hex-prefix { font-size: 14px; color: #aeaeb2; font-weight: 600; }
.hex-input {
  border: none; outline: none; font-size: 14px; font-family: monospace;
  width: 80px; text-transform: uppercase; background: transparent;
}

.btn-add-color {
  padding: 10px 20px; border: none; border-radius: 10px;
  background: #1d1d1f; color: white; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.btn-add-color:hover { background: #3a3a3c; }

/* 미리보기 */
.preview-section { margin-top: 0; }
.preview-label {
  font-size: 13px; font-weight: 600; color: #86868b;
  text-transform: uppercase; margin-bottom: 12px;
}
.preview-strip {
  background: #2c2c2e; border-radius: 16px; padding: 16px;
  overflow: hidden;
}
.preview-scroll {
  display: flex; gap: 8px; overflow-x: auto;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
}
.preview-scroll::-webkit-scrollbar { display: none; }
.preview-dot {
  width: 28px; height: 28px; min-width: 28px; border-radius: 50%;
}
.preview-dot.is-white { border: 1.5px solid rgba(255, 255, 255, 0.4); }

@media (max-width: 768px) {
  .tab-menu {
    width: 100%;
  }

  .tab-btn {
    flex: 1;
    justify-content: center;
  }

  .reports-stats {
    flex-direction: column;
  }

  .action-section {
    flex-direction: column;
  }

  .filters-bar {
    flex-direction: column;
  }

  .search-box {
    max-width: 100%;
  }

  .palette-header {
    flex-direction: column;
  }

  .palette-actions {
    width: 100%;
  }

  .palette-actions button {
    flex: 1;
  }

  .add-color-row {
    flex-wrap: wrap;
  }
}
</style>
