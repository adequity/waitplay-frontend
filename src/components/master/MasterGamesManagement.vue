<template>
  <div class="games-management">
    <div class="page-header">
      <div>
        <h1>게임 관리</h1>
        <p class="subtitle">전체 시스템의 게임 템플릿과 Admin별 게임 할당을 관리합니다</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button :class="{ active: activeTab === 'templates' }" @click="activeTab = 'templates'">게임 템플릿</button>
      <button :class="{ active: activeTab === 'assignments' }" @click="activeTab = 'assignments'">계정별 할당</button>
      <button :class="{ active: activeTab === 'scores' }" @click="activeTab = 'scores'">점수 기록</button>
    </div>

    <LoadingSpinner v-if="loading" message="게임 정보를 불러오는 중..." />

    <!-- Game Templates Tab -->
    <div v-else-if="activeTab === 'templates'" class="templates-section">
      <div class="section-actions">
        <button class="btn-primary" @click="assignDefaultsToAll">
          <IconBase name="users" /> 모든 Admin에 기본 게임 일괄 할당
        </button>
      </div>

      <div class="templates-grid">
        <div v-for="template in templates" :key="template.id" class="template-card">
          <div class="template-header">
            <div class="template-icon" :class="[getIconBgClass(template.gameKey), { 'has-image': template.iconImageUrl }]">
              <img v-if="template.iconImageUrl" :src="template.iconImageUrl" :alt="template.name" class="template-icon-img" />
              <IconBase v-else :name="getGameIcon(template.gameKey)" />
            </div>
            <div class="template-info">
              <h3>{{ template.name }}</h3>
              <p class="template-key">{{ template.gameKey }}</p>
            </div>
            <div class="template-badges">
              <span class="badge" :class="{ active: template.isActive, inactive: !template.isActive }">
                {{ template.isActive ? '활성' : '비활성' }}
              </span>
              <span v-if="template.isDefault" class="badge default">기본 할당</span>
            </div>
          </div>
          <p v-if="template.description" class="template-desc">{{ template.description }}</p>
          <div class="template-actions">
            <button class="btn-action" @click="toggleTemplateActive(template)" :title="template.isActive ? '비활성화' : '활성화'">
              <IconBase :name="template.isActive ? 'eye-off' : 'eye'" />
            </button>
            <button class="btn-action" @click="toggleTemplateDefault(template)" :title="template.isDefault ? '기본 할당 해제' : '기본 할당 설정'">
              <IconBase :name="template.isDefault ? 'star-fill' : 'star'" />
            </button>
            <button class="btn-action" @click="editTemplate(template)" title="수정">
              <IconBase name="edit" />
            </button>
            <button class="btn-action danger" @click="confirmDeleteTemplate(template)" title="삭제">
              <IconBase name="trash" />
            </button>
          </div>
        </div>

        <div v-if="!templates || templates.length === 0" class="empty-state">
          <IconBase name="gamepad" class="empty-icon" />
          <p>게임 템플릿이 없습니다</p>
          <p class="empty-hint">데이터베이스에 게임 템플릿을 추가해주세요</p>
        </div>
      </div>
    </div>

    <!-- Account Assignments Tab -->
    <div v-else-if="activeTab === 'assignments'" class="assignments-section">
      <div class="filters-bar">
        <input v-model="searchAccount" type="text" placeholder="계정 검색 (닉네임, 회사명)" class="search-input" @input="searchAdmins" />
      </div>

      <div class="accounts-list">
        <div v-for="account in adminAccounts" :key="account.id" class="account-row">
          <div class="account-info-row">
            <div class="account-avatar">
              <img v-if="account.profileImage" :src="account.profileImage" alt="" />
              <IconBase v-else name="user" />
            </div>
            <div class="account-details-row">
              <h4>{{ account.nickname }}</h4>
              <p>{{ account.company || '회사 정보 없음' }}</p>
            </div>
            <div class="account-actions-row">
              <button class="btn-secondary" @click="loadAccountGames(account)">
                <IconBase name="gamepad" /> 게임 관리
              </button>
            </div>
          </div>

          <!-- Account Games Panel -->
          <div v-if="selectedAccount?.id === account.id" class="account-games-panel">
            <div class="games-grid">
              <div
                v-for="game in accountGames"
                :key="game.gameTemplateId"
                class="game-chip"
                :class="{ assigned: game.isAssigned }"
                @click="toggleAccountGame(account.id, game.gameTemplateId)"
              >
                <IconBase :name="getGameIcon(game.gameKey)" class="game-chip-icon" />
                <span>{{ game.name }}</span>
                <IconBase :name="game.isAssigned ? 'check' : 'plus'" class="game-chip-status" />
              </div>
            </div>
            <div class="panel-actions">
              <button class="btn-secondary" @click="assignDefaultsToAccount(account.id)">기본 게임 할당</button>
              <button class="btn-text" @click="selectedAccount = null">닫기</button>
            </div>
          </div>
        </div>

        <div v-if="!adminAccounts || adminAccounts.length === 0" class="empty-state">
          <IconBase name="users" class="empty-icon" />
          <p>Admin 계정이 없습니다</p>
        </div>
      </div>

      <div class="pagination" v-if="accountsTotalPages > 1">
        <button @click="accountsPage = accountsPage - 1" :disabled="accountsPage <= 1">이전</button>
        <span>{{ accountsPage }} / {{ accountsTotalPages }}</span>
        <button @click="accountsPage = accountsPage + 1" :disabled="accountsPage >= accountsTotalPages">다음</button>
      </div>
    </div>

    <!-- Scores Tab -->
    <div v-else-if="activeTab === 'scores'" class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>플레이어</th>
            <th>게임</th>
            <th>점수</th>
            <th>플레이 시간</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="score in scores" :key="score.id">
            <td>{{ score.playerName }}</td>
            <td>
              <span class="game-badge">{{ getGameLabel(score.gameType) }}</span>
            </td>
            <td>
              <span class="score-value">{{ score.score.toLocaleString() }}</span>
            </td>
            <td>{{ formatDate(score.playedAt) }}</td>
          </tr>
          <tr v-if="!scores || scores.length === 0">
            <td colspan="4" class="empty-row">게임 기록이 없습니다</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" v-if="scoresTotalPages > 1">
        <button @click="scoresPage = scoresPage - 1" :disabled="scoresPage <= 1">이전</button>
        <span>{{ scoresPage }} / {{ scoresTotalPages }}</span>
        <button @click="scoresPage = scoresPage + 1" :disabled="scoresPage >= scoresTotalPages">다음</button>
      </div>
    </div>

    <!-- Edit Template Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal modal-wide">
        <div class="modal-header">
          <h2>게임 템플릿 수정</h2>
          <button class="btn-close" @click="closeModals"><IconBase name="close" /></button>
        </div>
        <div class="modal-body">
          <!-- 기본 정보 (2열 레이아웃) -->
          <div class="form-section">
            <h3 class="section-title">기본 정보</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>게임 키 (영문)</label>
                <input v-model="templateForm.gameKey" type="text" placeholder="e.g., pinball, roulette" :disabled="showEditModal" />
                <p class="form-hint">영문 소문자, 하이픈만 사용 가능. 수정 불가.</p>
              </div>
              <div class="form-group">
                <label>게임 이름</label>
                <input v-model="templateForm.name" type="text" placeholder="e.g., 핀볼" />
              </div>
              <div class="form-group">
                <label>아이콘 (아이콘명)</label>
                <input v-model="templateForm.icon" type="text" placeholder="e.g., gamepad" />
              </div>
              <div class="form-group">
                <label>표시 순서</label>
                <input v-model.number="templateForm.displayOrder" type="number" min="0" />
              </div>
              <div class="form-group full-width">
                <label>설명</label>
                <textarea v-model="templateForm.description" placeholder="게임 설명 (선택)"></textarea>
              </div>
              <div class="form-group">
                <label>버튼 텍스트</label>
                <input v-model="templateForm.buttonText" type="text" placeholder="지금 도전하기" />
                <p class="form-hint">고객 페이지에 표시되는 버튼 문구</p>
              </div>
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="templateForm.isActive" />
                  활성화
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="templateForm.isDefault" />
                  기본 할당
                </label>
              </div>
            </div>
          </div>

          <!-- 표기 이미지 관리 -->
          <div class="form-section">
            <h3 class="section-title">표기 이미지 관리</h3>
            <div class="form-grid">
              <!-- 게임 아이콘 이미지 -->
              <div class="form-group">
                <label>게임 아이콘 이미지</label>
                <div class="image-upload-area">
                  <div v-if="templateForm.iconImageUrl" class="image-preview">
                    <img :src="templateForm.iconImageUrl" alt="게임 아이콘" />
                    <button class="btn-remove-image" @click="removeIconImage" type="button">
                      <IconBase name="close" />
                    </button>
                  </div>
                  <label v-else class="upload-placeholder" :class="{ uploading: uploadingIcon }">
                    <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleIconImageUpload" :disabled="uploadingIcon" />
                    <IconBase :name="uploadingIcon ? 'refresh' : 'upload'" :class="{ spinning: uploadingIcon }" />
                    <span>{{ uploadingIcon ? '업로드 중...' : 'PNG 이미지 업로드' }}</span>
                  </label>
                </div>
                <p class="form-hint">권장: 200x200px, 투명 PNG</p>
              </div>

              <!-- 배경 이미지 -->
              <div class="form-group">
                <label>배경 이미지</label>
                <div class="image-upload-area">
                  <div v-if="templateForm.backgroundImageUrl" class="image-preview background-preview">
                    <img :src="templateForm.backgroundImageUrl" alt="배경 이미지" />
                    <button class="btn-remove-image" @click="removeBackgroundImage" type="button">
                      <IconBase name="close" />
                    </button>
                  </div>
                  <label v-else class="upload-placeholder" :class="{ uploading: uploadingBackground }">
                    <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleBackgroundImageUpload" :disabled="uploadingBackground" />
                    <IconBase :name="uploadingBackground ? 'refresh' : 'upload'" :class="{ spinning: uploadingBackground }" />
                    <span>{{ uploadingBackground ? '업로드 중...' : 'PNG 이미지 업로드' }}</span>
                  </label>
                </div>
                <p class="form-hint">권장: 400x400px, 그라데이션 배경</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModals">취소</button>
          <button class="btn-primary" @click="saveTemplate">저장</button>
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
const activeTab = ref('templates')

// Templates data
const templates = ref<any[]>([])

// Accounts data
const adminAccounts = ref<any[]>([])
const accountsPage = ref(1)
const accountsTotalPages = ref(1)
const searchAccount = ref('')
const selectedAccount = ref<any>(null)
const accountGames = ref<any[]>([])

// Scores data
const scores = ref<any[]>([])
const scoresPage = ref(1)
const scoresTotalPages = ref(1)

// Modal state
const showEditModal = ref(false)
const editingTemplate = ref<any>(null)
const templateForm = ref({
  gameKey: '',
  name: '',
  icon: '',
  description: '',
  displayOrder: 0,
  isActive: true,
  isDefault: false,
  // 표기 이미지 관리
  iconImageUrl: '',
  backgroundImageUrl: '',
  buttonText: '지금 도전하기'
})

// 이미지 업로드 상태
const uploadingIcon = ref(false)
const uploadingBackground = ref(false)

// Fetch game templates
const fetchTemplates = async () => {
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/game-templates`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    templates.value = data.templates
  } catch (error) {
    console.error(error)
  }
}

// Fetch admin accounts
const fetchAdminAccounts = async () => {
  try {
    const params = new URLSearchParams({
      page: accountsPage.value.toString(),
      pageSize: '20',
      role: 'admin'
    })
    if (searchAccount.value) params.append('search', searchAccount.value)

    const response = await fetch(`${API_URL}/api/masteradmin/accounts?${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    adminAccounts.value = data.data
    accountsTotalPages.value = data.totalPages
  } catch (error) {
    console.error(error)
  }
}

// Fetch scores
const fetchScores = async () => {
  try {
    const params = new URLSearchParams({ page: scoresPage.value.toString(), pageSize: '20' })
    const response = await fetch(`${API_URL}/api/masteradmin/games?${params}`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    scores.value = data.data
    scoresTotalPages.value = data.totalPages
  } catch (error) {
    console.error(error)
  }
}

// Load account's assigned games
const loadAccountGames = async (account: any) => {
  if (selectedAccount.value?.id === account.id) {
    selectedAccount.value = null
    return
  }

  selectedAccount.value = account
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/accounts/${account.id}/games`, {
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    accountGames.value = data.games
  } catch (error) {
    console.error(error)
    accountGames.value = []
  }
}

// Toggle game assignment for account
const toggleAccountGame = async (accountId: string, gameTemplateId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/accounts/${accountId}/games/${gameTemplateId}/toggle`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')

    // Refresh account games
    await loadAccountGames(selectedAccount.value)
  } catch (error) {
    console.error(error)
    alert('게임 할당 변경에 실패했습니다.')
  }
}

// Assign default games to single account
const assignDefaultsToAccount = async (accountId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/accounts/${accountId}/games/assign-defaults`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    alert(data.message)

    // Refresh account games
    await loadAccountGames(selectedAccount.value)
  } catch (error) {
    console.error(error)
    alert('기본 게임 할당에 실패했습니다.')
  }
}

// Assign default games to all admins
const assignDefaultsToAll = async () => {
  if (!confirm('모든 Admin 계정에 기본 게임을 할당하시겠습니까?')) return

  try {
    const response = await fetch(`${API_URL}/api/masteradmin/games/assign-defaults-to-all`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    alert(data.message)
  } catch (error) {
    console.error(error)
    alert('일괄 할당에 실패했습니다.')
  }
}

// Template CRUD
const toggleTemplateActive = async (template: any) => {
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/game-templates/${template.id}/toggle-active`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    await fetchTemplates()
  } catch (error) {
    console.error(error)
    alert('상태 변경에 실패했습니다.')
  }
}

const toggleTemplateDefault = async (template: any) => {
  try {
    const response = await fetch(`${API_URL}/api/masteradmin/game-templates/${template.id}/toggle-default`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    await fetchTemplates()
  } catch (error) {
    console.error(error)
    alert('상태 변경에 실패했습니다.')
  }
}

const editTemplate = (template: any) => {
  editingTemplate.value = template
  templateForm.value = {
    gameKey: template.gameKey,
    name: template.name,
    icon: template.icon || '',
    description: template.description || '',
    displayOrder: template.displayOrder,
    isActive: template.isActive,
    isDefault: template.isDefault,
    iconImageUrl: template.iconImageUrl || '',
    backgroundImageUrl: template.backgroundImageUrl || '',
    buttonText: template.buttonText || '지금 도전하기'
  }
  showEditModal.value = true
}

const confirmDeleteTemplate = async (template: any) => {
  if (!confirm(`"${template.name}" 게임 템플릿을 삭제하시겠습니까?\n관련된 모든 계정 할당도 삭제됩니다.`)) return

  try {
    const response = await fetch(`${API_URL}/api/masteradmin/game-templates/${template.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` }
    })
    if (!response.ok) throw new Error('Failed')
    await fetchTemplates()
  } catch (error) {
    console.error(error)
    alert('삭제에 실패했습니다.')
  }
}

const saveTemplate = async () => {
  if (!templateForm.value.name) {
    alert('게임 이름은 필수입니다.')
    return
  }

  if (!editingTemplate.value) return

  try {
    const response = await fetch(`${API_URL}/api/masteradmin/game-templates/${editingTemplate.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: templateForm.value.name,
        icon: templateForm.value.icon || null,
        description: templateForm.value.description || null,
        displayOrder: templateForm.value.displayOrder,
        isActive: templateForm.value.isActive,
        isDefault: templateForm.value.isDefault,
        iconImageUrl: templateForm.value.iconImageUrl || null,
        backgroundImageUrl: templateForm.value.backgroundImageUrl || null,
        buttonText: templateForm.value.buttonText || null
      })
    })
    if (!response.ok) throw new Error('Failed')

    closeModals()
    await fetchTemplates()
  } catch (error: any) {
    console.error(error)
    alert(error.message || '저장에 실패했습니다.')
  }
}

const closeModals = () => {
  showEditModal.value = false
  editingTemplate.value = null
  templateForm.value = {
    gameKey: '',
    name: '',
    icon: '',
    description: '',
    displayOrder: 0,
    isActive: true,
    isDefault: false,
    iconImageUrl: '',
    backgroundImageUrl: '',
    buttonText: '지금 도전하기'
  }
}

// 이미지 업로드 핸들러
const handleIconImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.')
    return
  }

  uploadingIcon.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/api/fileupload/logo`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` },
      body: formData
    })

    if (!response.ok) throw new Error('Upload failed')
    const data = await response.json()
    templateForm.value.iconImageUrl = data.fileUrl
  } catch (error) {
    console.error(error)
    alert('이미지 업로드에 실패했습니다.')
  } finally {
    uploadingIcon.value = false
  }
}

const handleBackgroundImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.')
    return
  }

  uploadingBackground.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/api/fileupload/background`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.accessToken}` },
      body: formData
    })

    if (!response.ok) throw new Error('Upload failed')
    const data = await response.json()
    templateForm.value.backgroundImageUrl = data.fileUrl
  } catch (error) {
    console.error(error)
    alert('이미지 업로드에 실패했습니다.')
  } finally {
    uploadingBackground.value = false
  }
}

const removeIconImage = () => {
  templateForm.value.iconImageUrl = ''
}

const removeBackgroundImage = () => {
  templateForm.value.backgroundImageUrl = ''
}

const searchAdmins = () => {
  accountsPage.value = 1
  fetchAdminAccounts()
}

// Helper functions
const getGameLabel = (type: string) => {
  const labels: Record<string, string> = {
    'pinball': '핀볼',
    'roulette': '룰렛',
    'slot': '슬롯머신',
    'scratch': '스크래치',
    'gacha': '가챠',
    'memory': '카드 찾기',
    'brick-breaker': '벽돌깨기',
    'spot-difference': '틀린그림찾기'
  }
  return labels[type] || type
}

const getGameIcon = (gameKey: string) => {
  const icons: Record<string, string> = {
    'pinball': 'target',
    'roulette': 'refresh',
    'slot': 'gamepad',
    'scratch': 'ticket',
    'gacha': 'gift',
    'memory': 'clone',
    'brick-breaker': 'utensils',
    'spot-difference': 'magnifying-glass'
  }
  return icons[gameKey] || 'gamepad'
}

const getIconBgClass = (gameKey: string) => {
  const colors: Record<string, string> = {
    'pinball': 'bg-red',
    'roulette': 'bg-purple',
    'slot': 'bg-green',
    'scratch': 'bg-orange',
    'gacha': 'bg-pink',
    'memory': 'bg-blue',
    'brick-breaker': 'bg-indigo',
    'spot-difference': 'bg-cyan'
  }
  return colors[gameKey] || 'bg-gray'
}

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('ko-KR')

const fetchAll = async () => {
  loading.value = true
  await Promise.all([fetchTemplates(), fetchAdminAccounts(), fetchScores()])
  loading.value = false
}

watch(activeTab, () => {
  if (activeTab.value === 'templates') fetchTemplates()
  else if (activeTab.value === 'assignments') fetchAdminAccounts()
  else fetchScores()
})

watch(scoresPage, fetchScores)
watch(accountsPage, fetchAdminAccounts)

onMounted(() => fetchAll())
</script>

<style scoped>
.games-management { padding: 0; }
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 28px; font-weight: 700; color: #1d1d1f; margin: 0 0 8px 0; }
.subtitle { font-size: 15px; color: #86868b; margin: 0; }

.tabs { display: flex; gap: 8px; margin-bottom: 24px; }
.tabs button { padding: 10px 20px; border: none; border-radius: 10px; background: #f0f0f0; font-size: 14px; font-weight: 500; color: #86868b; cursor: pointer; transition: all 0.2s; }
.tabs button.active { background: linear-gradient(135deg, #d4a853, #b8942e); color: white; }

/* Templates Section */
.section-actions { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }

.templates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }

.template-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); transition: all 0.3s; }
.template-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }

.template-header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 12px; }
.template-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.template-icon :deep(svg) { width: 24px; height: 24px; color: white; }
.template-icon.has-image { background: #f5f5f7; }
.template-icon-img { width: 100%; height: 100%; object-fit: contain; padding: 4px; }

.bg-red { background: linear-gradient(135deg, #ff6b6b, #ee5a5a); }
.bg-purple { background: linear-gradient(135deg, #a855f7, #9333ea); }
.bg-green { background: linear-gradient(135deg, #34d399, #10b981); }
.bg-orange { background: linear-gradient(135deg, #fb923c, #f97316); }
.bg-pink { background: linear-gradient(135deg, #f472b6, #ec4899); }
.bg-blue { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
.bg-indigo { background: linear-gradient(135deg, #818cf8, #6366f1); }
.bg-cyan { background: linear-gradient(135deg, #22d3ee, #06b6d4); }
.bg-gray { background: linear-gradient(135deg, #9ca3af, #6b7280); }

.template-info { flex: 1; }
.template-info h3 { font-size: 18px; font-weight: 600; color: #1d1d1f; margin: 0 0 4px 0; }
.template-key { font-size: 13px; color: #86868b; margin: 0; font-family: monospace; }

.template-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
.badge.active { background: #dcfce7; color: #16a34a; }
.badge.inactive { background: #fee2e2; color: #dc2626; }
.badge.default { background: #fef3c7; color: #d97706; }

.template-desc { font-size: 14px; color: #86868b; margin: 0 0 16px 0; line-height: 1.5; }

.template-actions { display: flex; gap: 8px; border-top: 1px solid #f0f0f0; padding-top: 16px; }
.btn-action { flex: 1; padding: 10px; border: 1px solid #e5e5ea; border-radius: 8px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-action:hover { background: #f5f5f7; }
.btn-action.danger:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }
.btn-action :deep(svg) { width: 18px; height: 18px; color: #86868b; }
.btn-action:hover :deep(svg) { color: #1d1d1f; }
.btn-action.danger:hover :deep(svg) { color: #dc2626; }

/* Assignments Section */
.filters-bar { margin-bottom: 20px; }
.search-input { width: 100%; max-width: 400px; padding: 12px 16px; border: 1px solid #e5e5ea; border-radius: 12px; font-size: 14px; }

.accounts-list { display: flex; flex-direction: column; gap: 12px; }

.account-row { background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); overflow: hidden; }
.account-info-row { display: flex; align-items: center; gap: 16px; padding: 20px 24px; }
.account-avatar { width: 48px; height: 48px; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.account-avatar img { width: 100%; height: 100%; object-fit: cover; }
.account-avatar :deep(svg) { width: 24px; height: 24px; color: #86868b; }

.account-details-row { flex: 1; }
.account-details-row h4 { font-size: 16px; font-weight: 600; color: #1d1d1f; margin: 0 0 4px 0; }
.account-details-row p { font-size: 13px; color: #86868b; margin: 0; }

.account-actions-row { display: flex; gap: 8px; }

.account-games-panel { padding: 20px 24px; background: #fafafa; border-top: 1px solid #f0f0f0; }
.games-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.game-chip { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: white; border: 1px solid #e5e5ea; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
.game-chip:hover { border-color: #d4a853; }
.game-chip.assigned { background: linear-gradient(135deg, #d4a853, #b8942e); border-color: #b8942e; color: white; }
.game-chip-icon { width: 18px; height: 18px; }
.game-chip-status { width: 16px; height: 16px; margin-left: 4px; }

.panel-actions { display: flex; gap: 12px; justify-content: flex-end; }

/* Scores Table */
.table-container { background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 16px 20px; text-align: left; border-bottom: 1px solid #f0f0f0; }
.data-table th { font-size: 12px; font-weight: 600; color: #86868b; text-transform: uppercase; background: #fafafa; }
.data-table tbody tr:hover { background: #fafafa; }

.game-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #ede9fe; color: #7c3aed; }
.score-value { font-size: 16px; font-weight: 700; color: #d4a853; }

.empty-row { text-align: center !important; color: #86868b; padding: 48px !important; }

/* Buttons */
.btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: linear-gradient(135deg, #d4a853, #b8942e); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(212, 168, 83, 0.4); }
.btn-primary :deep(svg) { width: 18px; height: 18px; }

.btn-secondary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: white; color: #1d1d1f; border: 1px solid #e5e5ea; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-secondary:hover { background: #f5f5f7; border-color: #d2d2d7; }
.btn-secondary :deep(svg) { width: 18px; height: 18px; color: #86868b; }

.btn-text { padding: 12px 20px; background: transparent; color: #86868b; border: none; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-text:hover { color: #1d1d1f; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; border-radius: 20px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal.modal-wide { max-width: 700px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 24px; border-bottom: 1px solid #f0f0f0; }
.modal-header h2 { font-size: 20px; font-weight: 700; margin: 0; }
.btn-close { width: 36px; height: 36px; border: none; background: #f0f0f0; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-close:hover { background: #e5e5ea; }
.btn-close :deep(svg) { width: 18px; height: 18px; color: #86868b; }

.modal-body { padding: 24px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 14px; font-weight: 600; color: #1d1d1f; margin-bottom: 8px; }
.form-group input, .form-group textarea { width: 100%; padding: 12px 16px; border: 1px solid #e5e5ea; border-radius: 10px; font-size: 14px; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #d4a853; }
.form-group input:disabled { background: #f5f5f7; color: #86868b; }
.form-group textarea { resize: vertical; min-height: 80px; }
.form-hint { font-size: 12px; color: #86868b; margin-top: 6px; }

.form-row { display: flex; gap: 20px; }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #1d1d1f; cursor: pointer; }
.checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: #d4a853; }

.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px; border-top: 1px solid #f0f0f0; }

.empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; padding: 80px 0; color: #86868b; }
.empty-icon { width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }
.empty-hint { font-size: 13px; margin-top: 8px; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; padding: 20px; }
.pagination button { padding: 8px 16px; border: 1px solid #e5e5ea; border-radius: 8px; background: white; font-size: 14px; cursor: pointer; }
.pagination button:hover:not(:disabled) { background: #f0f0f0; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

/* Form Section & Grid */
.form-section { margin-bottom: 24px; }
.form-section:last-child { margin-bottom: 0; }
.section-title { font-size: 15px; font-weight: 600; color: #1d1d1f; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-grid .form-group.full-width { grid-column: 1 / -1; }

.checkbox-group { display: flex; gap: 20px; align-items: center; }

/* Image Upload */
.image-upload-area { margin-top: 8px; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 24px; border: 2px dashed #e5e5ea; border-radius: 12px; background: #fafafa; cursor: pointer; transition: all 0.2s; }
.upload-placeholder:hover { border-color: #d4a853; background: #fef9f0; }
.upload-placeholder.uploading { border-color: #d4a853; background: #fef9f0; cursor: wait; }
.upload-placeholder input[type="file"] { display: none; }
.upload-placeholder :deep(svg) { width: 24px; height: 24px; color: #86868b; }
.upload-placeholder span { font-size: 13px; color: #86868b; }
.upload-placeholder :deep(svg).spinning { animation: spin 1s linear infinite; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.image-preview { position: relative; width: 120px; height: 120px; border-radius: 12px; overflow: hidden; background: #f5f5f7; border: 1px solid #e5e5ea; }
.image-preview.background-preview { width: 160px; height: 120px; }
.image-preview img { width: 100%; height: 100%; object-fit: contain; }
.background-preview img { object-fit: cover; }
.btn-remove-image { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-radius: 50%; background: rgba(0, 0, 0, 0.6); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-remove-image :deep(svg) { width: 14px; height: 14px; color: white; }
.btn-remove-image:hover { background: rgba(220, 38, 38, 0.9); }
</style>
