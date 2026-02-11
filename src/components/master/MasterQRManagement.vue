<template>
  <div class="qr-management">
    <div class="page-header">
      <div>
        <h1>QR 코드 관리</h1>
        <p class="subtitle">전체 시스템의 QR 코드를 관리합니다</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <IconBase name="search" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="QR 이름 검색..."
          @input="debouncedSearch"
        />
      </div>
      <select v-model="statusFilter" @change="fetchQRCodes">
        <option value="">전체 상태</option>
        <option value="active">활성</option>
        <option value="inactive">비활성</option>
      </select>
    </div>

    <!-- Loading -->
    <LoadingSpinner v-if="loading" />

    <!-- QR Cards Grid -->
    <div v-else class="qr-grid">
      <div v-for="qr in qrcodes" :key="qr.id" class="qr-card clickable" :class="{ inactive: !qr.isActive }" @click="openDetailModal(qr)">
        <div class="qr-card-header">
          <div class="qr-info">
            <h3>{{ qr.name }}</h3>
            <p class="qr-owner">{{ qr.adminName || qr.adminCompany || '알 수 없음' }}</p>
          </div>
          <span class="status-badge" :class="{ active: qr.isActive }">
            {{ qr.isActive ? '활성' : '비활성' }}
          </span>
        </div>
        <div class="qr-card-body">
          <div class="qr-stats">
            <div class="stat-item">
              <span class="stat-label">조회수</span>
              <span class="stat-value">{{ qr.scanCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">생성일</span>
              <span class="stat-value">{{ formatDate(qr.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div class="qr-card-actions" @click.stop>
          <button class="btn-action primary" @click="goToQR(qr)" title="바로가기">
            <IconBase name="external-link" />
            바로가기
          </button>
          <button class="btn-action" @click="toggleActive(qr)" :title="qr.isActive ? '비활성화' : '활성화'">
            <IconBase :name="qr.isActive ? 'eye-off' : 'eye'" />
            {{ qr.isActive ? '비활성화' : '활성화' }}
          </button>
          <button class="btn-action danger" @click="confirmDelete(qr)">
            <IconBase name="trash" />
            삭제
          </button>
        </div>
      </div>

      <div v-if="!qrcodes || qrcodes.length === 0" class="empty-state">
        <IconBase name="qr" class="empty-icon" />
        <p>QR 코드가 없습니다</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="page = page - 1" :disabled="page <= 1">이전</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button @click="page = page + 1" :disabled="page >= totalPages">다음</button>
    </div>

    <!-- QR Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h2>QR 코드 상세 정보</h2>
          <button class="btn-close" @click="showDetailModal = false">&times;</button>
        </div>
        <div class="modal-body compact" v-if="detailLoading">
          <div class="loading-container">
            <div class="spinner"></div>
          </div>
        </div>
        <div class="modal-body compact" v-else-if="detailData">
          <!-- 기본 정보 -->
          <div class="detail-section">
            <h4>기본 정보</h4>
            <div class="detail-grid-compact">
              <div class="detail-row">
                <span class="detail-label">QR 이름</span>
                <span class="detail-value">{{ detailData.name || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">상태</span>
                <span class="detail-value">
                  <span class="status-badge" :class="{ active: detailData.isActive }">
                    {{ detailData.isActive ? '활성' : '비활성' }}
                  </span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">조회수</span>
                <span class="detail-value">{{ detailData.scanCount?.toLocaleString() || 0 }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">생성일</span>
                <span class="detail-value">{{ formatDateTime(detailData.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- 관리자 정보 -->
          <div class="detail-section">
            <h4>관리자 정보</h4>
            <div class="detail-grid-compact">
              <div class="detail-row">
                <span class="detail-label">닉네임</span>
                <span class="detail-value">{{ detailData.admin?.nickname || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">이메일</span>
                <span class="detail-value">{{ detailData.admin?.username || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">회사</span>
                <span class="detail-value">{{ detailData.admin?.company || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">관리자 ID</span>
                <span class="detail-value monospace">{{ detailData.admin?.id || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 통계 정보 -->
          <div class="detail-section">
            <h4>통계 요약</h4>
            <div class="stats-summary">
              <div class="stat-box">
                <span class="stat-number">{{ detailData.benefitsCount || 0 }}</span>
                <span class="stat-name">혜택</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ detailData.guestbookCount || 0 }}</span>
                <span class="stat-name">방명록</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ getEnabledGamesCount() }}</span>
                <span class="stat-name">활성 게임</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ getTotalPlays() }}</span>
                <span class="stat-name">총 플레이</span>
              </div>
            </div>
          </div>

          <!-- 일자별 추이 차트 -->
          <div class="detail-section" v-if="detailData.dailyStats?.length > 0">
            <h4>최근 14일 활동 추이</h4>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot game-plays"></span> 게임 플레이</span>
              <span class="legend-item"><span class="legend-dot guestbook"></span> 방명록</span>
              <span class="legend-item"><span class="legend-dot benefits"></span> 혜택 발급</span>
            </div>
            <div class="chart-container">
              <div class="chart-y-axis">
                <span>{{ getMaxChartValue() }}</span>
                <span>{{ Math.floor(getMaxChartValue() / 2) }}</span>
                <span>0</span>
              </div>
              <div class="chart-area">
                <div class="chart-bars">
                  <div
                    v-for="(day, index) in detailData.dailyStats"
                    :key="index"
                    class="chart-bar-group"
                  >
                    <div class="bar-stack">
                      <div
                        class="bar game-plays"
                        :style="{ height: getBarHeight(day.gamePlays) + '%' }"
                        :title="`게임: ${day.gamePlays}회`"
                      ></div>
                      <div
                        class="bar guestbook"
                        :style="{ height: getBarHeight(day.guestbook) + '%' }"
                        :title="`방명록: ${day.guestbook}개`"
                      ></div>
                      <div
                        class="bar benefits"
                        :style="{ height: getBarHeight(day.benefits) + '%' }"
                        :title="`혜택: ${day.benefits}건`"
                      ></div>
                    </div>
                    <span class="bar-label">{{ day.date.split('-')[1] }}</span>
                  </div>
                </div>
                <div class="chart-grid-lines">
                  <div class="grid-line"></div>
                  <div class="grid-line"></div>
                  <div class="grid-line"></div>
                </div>
              </div>
            </div>
            <div class="chart-summary">
              <div class="summary-item">
                <span class="summary-label">14일 총 게임</span>
                <span class="summary-value">{{ getTotalFromDaily('gamePlays') }}회</span>
                <span class="summary-trend" :class="getTrendClass('gamePlays')">
                  {{ getTrendText('gamePlays') }}
                </span>
              </div>
              <div class="summary-item">
                <span class="summary-label">14일 총 방명록</span>
                <span class="summary-value">{{ getTotalFromDaily('guestbook') }}개</span>
                <span class="summary-trend" :class="getTrendClass('guestbook')">
                  {{ getTrendText('guestbook') }}
                </span>
              </div>
              <div class="summary-item">
                <span class="summary-label">14일 총 혜택</span>
                <span class="summary-value">{{ getTotalFromDaily('benefits') }}건</span>
                <span class="summary-trend" :class="getTrendClass('benefits')">
                  {{ getTrendText('benefits') }}
                </span>
              </div>
            </div>
          </div>

          <!-- 게임 현황 -->
          <div class="detail-section" v-if="hasAnyGameStats()">
            <div class="section-header-with-filter">
              <h4>게임 운영 현황</h4>
              <div class="period-filter">
                <button
                  :class="{ active: gameStatsPeriod === '7d' }"
                  @click="gameStatsPeriod = '7d'"
                >7일</button>
                <button
                  :class="{ active: gameStatsPeriod === '30d' }"
                  @click="gameStatsPeriod = '30d'"
                >30일</button>
                <button
                  :class="{ active: gameStatsPeriod === 'all' }"
                  @click="gameStatsPeriod = 'all'"
                >전체</button>
              </div>
            </div>
            <div class="game-stats-grid" v-if="getFilteredGameStats().length > 0">
              <div v-for="game in getFilteredGameStats()" :key="game.gameType" class="game-stat-card">
                <span class="game-name">{{ getGameName(game.gameType) }}</span>
                <div class="game-stats-row">
                  <span class="game-plays">{{ game.totalPlays }}회</span>
                  <span class="game-avg">평균 {{ Math.round(game.avgScore) }}점</span>
                </div>
              </div>
            </div>
            <div v-else class="no-data-message">
              해당 기간에 게임 기록이 없습니다
            </div>
          </div>

          <!-- 최근 방명록 -->
          <div class="detail-section" v-if="detailData.recentGuestbook?.length > 0">
            <div class="section-header-with-filter">
              <h4>최근 방명록</h4>
              <button class="btn-link" @click="goToGuestbook">
                전체 보기
                <IconBase name="external-link" />
              </button>
            </div>
            <div class="guestbook-grid">
              <div v-for="msg in detailData.recentGuestbook" :key="msg.id" class="guestbook-card">
                <div class="guestbook-header">
                  <span class="guestbook-author">{{ msg.userName }}</span>
                  <span class="guestbook-date">{{ formatDate(msg.createdAt) }}</span>
                </div>
                <p class="guestbook-message">{{ msg.message || '(이미지)' }}</p>
              </div>
            </div>
          </div>

          <!-- 랜딩 페이지 설정 -->
          <div class="detail-section" v-if="detailData.landingPage">
            <h4>랜딩 페이지 설정</h4>
            <div class="detail-grid-compact">
              <div class="detail-row">
                <span class="detail-label">환영 메시지</span>
                <span class="detail-value">{{ detailData.landingPage.welcomeMessage || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">배경 이미지</span>
                <span class="detail-value">{{ detailData.landingPage.backgroundImage ? '있음' : '없음' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDetailModal = false">닫기</button>
          <button class="btn-primary" @click="goToQRFromDetail">
            <IconBase name="external-link" />
            바로가기
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
const qrcodes = ref<any[]>([])
const page = ref(1)
const pageSize = ref(12)
const totalPages = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')

// Detail modal state
const showDetailModal = ref(false)
const gameStatsPeriod = ref<'7d' | '30d' | 'all'>('30d')
const detailData = ref<any>(null)
const detailLoading = ref(false)

let searchTimeout: number | null = null

const fetchQRCodes = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: page.value.toString(),
      pageSize: pageSize.value.toString()
    })

    if (searchQuery.value) params.append('search', searchQuery.value)
    if (statusFilter.value) params.append('isActive', statusFilter.value === 'active' ? 'true' : 'false')

    const response = await fetch(`${API_URL}/api/masteradmin/qrcodes?${params}`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch QR codes')

    const data = await response.json()
    qrcodes.value = data.data ?? []
    totalPages.value = data.totalPages ?? 1
  } catch (error) {
    console.error('Fetch QR codes error:', error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchQRCodes()
  }, 300) as any
}

const toggleActive = async (qr: any) => {
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/qrcodes/${qr.id}/toggle-active`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to toggle QR status')

    qr.isActive = !qr.isActive
  } catch (error) {
    alert('상태 변경에 실패했습니다')
  }
}

const confirmDelete = async (qr: any) => {
  if (!confirm(`"${qr.name}" QR 코드를 삭제하시겠습니까? 관련 데이터도 모두 삭제됩니다.`)) return

  try {
    const response = await fetch(`${API_URL}/api/masteradmin/qrcodes/${qr.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to delete QR code')

    fetchQRCodes()
    alert('QR 코드가 삭제되었습니다')
  } catch (error) {
    alert('QR 코드 삭제에 실패했습니다')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

const goToQR = (qr: any) => {
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'https://waitplay.co.kr'
  window.open(`${frontendUrl}/customer?qr=${qr.code}`, '_blank')
}

const openDetailModal = async (qr: any) => {
  showDetailModal.value = true
  detailLoading.value = true
  detailData.value = null

  try {
    const response = await fetch(`${API_URL}/api/masteradmin/qrcodes/${qr.id}`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    if (!response.ok) throw new Error('Failed to fetch QR detail')

    detailData.value = await response.json()
  } catch (error) {
    console.error('Fetch QR detail error:', error)
    alert('QR 코드 상세 정보를 불러오는데 실패했습니다')
    showDetailModal.value = false
  } finally {
    detailLoading.value = false
  }
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.toLocaleDateString('ko-KR')} ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
}

const getGameName = (gameType: string) => {
  const gameNames: Record<string, string> = {
    'roulette': '룰렛',
    'slot': '슬롯머신',
    'racing': '레이싱'
  }
  return gameNames[gameType] || gameType
}

const getTotalPlays = () => {
  if (!detailData.value?.gameStats) return 0
  return detailData.value.gameStats.reduce((sum: number, g: any) => sum + (g.totalPlays || 0), 0)
}

const getEnabledGamesCount = () => {
  if (!detailData.value?.enabledGames) return 0
  try {
    const games = JSON.parse(detailData.value.enabledGames)
    return Array.isArray(games) ? games.length : 0
  } catch {
    return 0
  }
}

const goToQRFromDetail = () => {
  if (detailData.value?.code) {
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'https://waitplay.co.kr'
    window.open(`${frontendUrl}/customer?qr=${detailData.value.code}`, '_blank')
  }
}

const goToAdminPage = () => {
  if (detailData.value?.admin?.id) {
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'https://waitplay.co.kr'
    window.open(`${frontendUrl}/admin/dashboard`, '_blank')
  }
}

const goToGuestbook = () => {
  if (detailData.value?.code) {
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'https://waitplay.co.kr'
    window.open(`${frontendUrl}/customer?qr=${detailData.value.code}&tab=guestbook`, '_blank')
  }
}

// 게임 통계 필터 함수들
const hasAnyGameStats = () => {
  return detailData.value?.gameStats?.length > 0 ||
         detailData.value?.gameStats7Days?.length > 0 ||
         detailData.value?.gameStats30Days?.length > 0
}

const getFilteredGameStats = () => {
  if (!detailData.value) return []
  switch (gameStatsPeriod.value) {
    case '7d':
      return detailData.value.gameStats7Days || []
    case '30d':
      return detailData.value.gameStats30Days || []
    case 'all':
    default:
      return detailData.value.gameStats || []
  }
}

// 차트 관련 함수들
const getMaxChartValue = () => {
  if (!detailData.value?.dailyStats) return 10
  const maxValue = Math.max(
    ...detailData.value.dailyStats.map((d: any) =>
      Math.max(d.gamePlays || 0, d.guestbook || 0, d.benefits || 0)
    )
  )
  return maxValue > 0 ? Math.ceil(maxValue * 1.2) : 10
}

const getBarHeight = (value: number) => {
  const max = getMaxChartValue()
  return max > 0 ? (value / max) * 100 : 0
}

const getTotalFromDaily = (field: string) => {
  if (!detailData.value?.dailyStats) return 0
  return detailData.value.dailyStats.reduce((sum: number, d: any) => sum + (d[field] || 0), 0)
}

const getTrendClass = (field: string) => {
  if (!detailData.value?.dailyStats || detailData.value.dailyStats.length < 7) return 'neutral'
  const stats = detailData.value.dailyStats
  const firstWeek = stats.slice(0, 7).reduce((sum: number, d: any) => sum + (d[field] || 0), 0)
  const secondWeek = stats.slice(7, 14).reduce((sum: number, d: any) => sum + (d[field] || 0), 0)
  if (secondWeek > firstWeek) return 'up'
  if (secondWeek < firstWeek) return 'down'
  return 'neutral'
}

const getTrendText = (field: string) => {
  if (!detailData.value?.dailyStats || detailData.value.dailyStats.length < 7) return '-'
  const stats = detailData.value.dailyStats
  const firstWeek = stats.slice(0, 7).reduce((sum: number, d: any) => sum + (d[field] || 0), 0)
  const secondWeek = stats.slice(7, 14).reduce((sum: number, d: any) => sum + (d[field] || 0), 0)
  if (firstWeek === 0) {
    return secondWeek > 0 ? '↑ 상승' : '-'
  }
  const change = ((secondWeek - firstWeek) / firstWeek) * 100
  if (change > 0) return `↑ ${Math.round(change)}%`
  if (change < 0) return `↓ ${Math.round(Math.abs(change))}%`
  return '→ 유지'
}

watch(page, fetchQRCodes)

onMounted(() => {
  fetchQRCodes()
})
</script>

<style scoped>
.qr-management {
  padding: 0;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 15px;
  color: #86868b;
  margin: 0;
}

/* Filters */
.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-box {
  flex: 1;
  max-width: 400px;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #d4a853;
  box-shadow: 0 0 0 3px rgba(212, 168, 83, 0.1);
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #86868b;
}

.filters-bar select {
  padding: 12px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 150px;
}

/* QR Grid */
.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.qr-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.qr-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.qr-card.inactive {
  opacity: 0.7;
  border-color: #e5e5ea;
}

.qr-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.qr-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.qr-owner {
  font-size: 13px;
  color: #86868b;
  margin: 0;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #fff0f0;
  color: #ff6b6b;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

.qr-card-body {
  margin-bottom: 20px;
}

.qr-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #86868b;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.qr-card-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #f0f0f0;
}

.btn-action.primary {
  background: linear-gradient(135deg, #d4a853, #b8942e);
  color: white;
  border-color: transparent;
}

.btn-action.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 168, 83, 0.3);
}

.btn-action.danger:hover {
  background: #fff0f0;
  color: #ff3b30;
  border-color: #ffcdd2;
}

.btn-action :deep(svg) {
  width: 16px;
  height: 16px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #86868b;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 32px 0;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: #f0f0f0;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Clickable Card */
.qr-card.clickable {
  cursor: pointer;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal.modal-wide {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5ea;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #1d1d1f;
}

.btn-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #86868b;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.btn-close:hover {
  color: #1d1d1f;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-body.compact {
  padding: 16px 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e5ea;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f0f0f0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #d4a853, #b8942e);
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 168, 83, 0.3);
}

.btn-primary :deep(svg) {
  width: 16px;
  height: 16px;
}

/* Detail Section */
.detail-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

/* Detail Grid Compact */
.detail-grid-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 11px;
  color: #86868b;
  font-weight: 500;
}

.detail-value {
  font-size: 13px;
  color: #1d1d1f;
  word-break: break-all;
}

.detail-value.monospace {
  font-family: monospace;
  font-size: 11px;
  color: #666;
}

/* Stats Summary */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-box {
  background: linear-gradient(135deg, #f8f5f0, #fff);
  border: 1px solid #e5e0d5;
  border-radius: 12px;
  padding: 16px 12px;
  text-align: center;
}

.stat-box .stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #d4a853;
  line-height: 1.2;
}

.stat-box .stat-name {
  display: block;
  font-size: 11px;
  color: #86868b;
  margin-top: 4px;
}

/* Section Header with Filter */
.section-header-with-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header-with-filter h4 {
  margin: 0;
}

.period-filter {
  display: flex;
  gap: 4px;
  background: #f0f0f0;
  padding: 3px;
  border-radius: 8px;
}

.period-filter button {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 11px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.period-filter button.active {
  background: white;
  color: #1d1d1f;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-link {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 12px;
  color: #d4a853;
  cursor: pointer;
  padding: 0;
}

.btn-link:hover {
  text-decoration: underline;
}

.btn-link :deep(svg) {
  width: 12px;
  height: 12px;
}

.no-data-message {
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 20px;
}

/* Game Stats Grid - 3 columns */
.game-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.game-stat-card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}

.game-stat-card .game-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.game-stat-card .game-stats-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
}

.game-stat-card .game-plays {
  font-weight: 600;
  color: #d4a853;
}

.game-stat-card .game-avg {
  color: #86868b;
}

/* Guestbook Grid - 3 columns */
.guestbook-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.guestbook-card {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 10px;
}

.guestbook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.guestbook-author {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}

.guestbook-date {
  font-size: 11px;
  color: #86868b;
}

.guestbook-message {
  font-size: 13px;
  color: #333;
  margin: 0;
  line-height: 1.5;
}

/* Chart Styles */
.chart-legend {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #666;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-dot.game-plays {
  background: #d4a853;
}

.legend-dot.guestbook {
  background: #5c9eff;
}

.legend-dot.benefits {
  background: #52c41a;
}

.chart-container {
  display: flex;
  gap: 8px;
  height: 150px;
  margin-bottom: 16px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  width: 30px;
  font-size: 10px;
  color: #999;
  padding: 0 4px;
}

.chart-area {
  flex: 1;
  position: relative;
  border-left: 1px solid #e5e5ea;
  border-bottom: 1px solid #e5e5ea;
}

.chart-grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.grid-line {
  border-top: 1px dashed #f0f0f0;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  padding: 0 4px;
  position: relative;
  z-index: 1;
}

.chart-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 40px;
}

.bar-stack {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 130px;
}

.bar {
  width: 8px;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
  cursor: pointer;
}

.bar:hover {
  opacity: 0.8;
}

.bar.game-plays {
  background: linear-gradient(180deg, #d4a853, #b8942e);
}

.bar.guestbook {
  background: linear-gradient(180deg, #5c9eff, #3a7bd5);
}

.bar.benefits {
  background: linear-gradient(180deg, #52c41a, #389e0d);
}

.bar-label {
  font-size: 9px;
  color: #999;
  margin-top: 4px;
}

.chart-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 10px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.summary-label {
  font-size: 10px;
  color: #86868b;
}

.summary-value {
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
}

.summary-trend {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.summary-trend.up {
  color: #52c41a;
  background: #f6ffed;
}

.summary-trend.down {
  color: #ff4d4f;
  background: #fff1f0;
}

.summary-trend.neutral {
  color: #666;
  background: #f5f5f5;
}
</style>
