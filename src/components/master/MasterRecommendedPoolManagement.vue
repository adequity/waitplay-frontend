<template>
  <div class="tab-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">추천 유저 풀</h1>
        <p class="page-desc">빌리지 빈 슬롯에 우선 표시될 유저/매장을 관리합니다</p>
      </div>
      <button class="btn-action" @click="openAddModal">+ 유저 추가</button>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-number">{{ pool.length }}</div>
        <div class="stat-label">전체</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ pool.filter(p => p.isActive).length }}</div>
        <div class="stat-label">활성</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ pool.filter(p => p.hasCompletedRoomAsset).length }}</div>
        <div class="stat-label">에셋 보유</div>
      </div>
    </div>

    <!-- User List -->
    <div v-if="pool.length > 0" class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>유저</th>
            <th>룸 에셋</th>
            <th>우선순위</th>
            <th>상태</th>
            <th>메모</th>
            <th>추가일</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pool" :key="item.id">
            <td>
              <div class="user-cell">
                <img v-if="item.userProfileImage" :src="item.userProfileImage" class="user-avatar" />
                <div v-else class="user-avatar-placeholder">{{ (item.userNickname || '?')[0] }}</div>
                <div>
                  <div class="user-name">{{ item.userNickname }}</div>
                  <div class="user-sub">{{ item.userCompany || item.userRole }}</div>
                </div>
              </div>
            </td>
            <td>
              <img v-if="item.roomAssetUrl" :src="item.roomAssetUrl" class="asset-thumb" />
              <span v-else class="badge badge-gray">에셋 없음</span>
            </td>
            <td>
              <input
                type="number" min="1" max="100"
                :value="item.priority"
                class="priority-input"
                @change="updatePriority(item, ($event.target as HTMLInputElement).valueAsNumber)"
              />
            </td>
            <td>
              <button
                class="toggle-btn"
                :class="{ active: item.isActive }"
                @click="handleToggle(item)"
              >
                {{ item.isActive ? '활성' : '비활성' }}
              </button>
            </td>
            <td>
              <span class="note-text">{{ item.note || '-' }}</span>
            </td>
            <td>
              <span class="date-text">{{ formatDate(item.addedAt) }}</span>
            </td>
            <td>
              <button class="btn-danger-small" @click="handleDelete(item)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <div class="empty-title">추천 유저가 없습니다</div>
      <div class="empty-desc">유저를 추가하면 빌리지 빈 슬롯에 우선 표시됩니다</div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>추천 유저 추가</h2>
          <button class="btn-close" @click="showAddModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">유저 검색</label>
            <input
              v-model="searchQuery"
              class="form-input"
              placeholder="닉네임 또는 회사명으로 검색 (2글자 이상)"
              @input="handleSearch"
            />
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div
              v-for="user in searchResults"
              :key="user.id"
              class="search-item"
              :class="{ selected: selectedUser?.id === user.id }"
              @click="selectedUser = user"
            >
              <img v-if="user.profileImage" :src="user.profileImage" class="search-avatar" />
              <div v-else class="search-avatar-placeholder">{{ (user.nickname || '?')[0] }}</div>
              <div class="search-info">
                <div class="search-name">{{ user.nickname }}</div>
                <div class="search-sub">{{ user.company || user.userRole }}</div>
              </div>
              <div class="search-asset">
                <img v-if="user.roomAssetUrl" :src="user.roomAssetUrl" class="search-asset-thumb" />
                <span v-else class="badge badge-gray">에셋 없음</span>
              </div>
            </div>
          </div>
          <div v-else-if="searchQuery.length >= 2 && !isSearching" class="search-empty">
            검색 결과가 없습니다
          </div>

          <template v-if="selectedUser">
            <div class="form-group" style="margin-top: 20px;">
              <label class="form-label">우선순위 (높을수록 우선)</label>
              <input v-model.number="addPriority" type="number" min="1" max="100" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">메모 (선택)</label>
              <textarea v-model="addNote" class="form-textarea" placeholder="관리용 메모" rows="2"></textarea>
            </div>
          </template>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddModal = false">취소</button>
          <button class="btn-primary" :disabled="!selectedUser" @click="handleAdd">추가</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  type RecommendedVillageUser,
  type UserSearchResult,
  getRecommendedUsers,
  addRecommendedUser,
  updateRecommendedUser,
  removeRecommendedUser,
  toggleRecommendedUser,
  searchUsersForPool,
} from '@/services/recommendedVillageService'

const pool = ref<RecommendedVillageUser[]>([])
const showAddModal = ref(false)
const searchQuery = ref('')
const searchResults = ref<UserSearchResult[]>([])
const selectedUser = ref<UserSearchResult | null>(null)
const addPriority = ref(1)
const addNote = ref('')
const isSearching = ref(false)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function loadPool() {
  try {
    pool.value = await getRecommendedUsers()
  } catch (e) {
    console.error('Failed to load recommended pool:', e)
  }
}

onMounted(loadPool)

function openAddModal() {
  searchQuery.value = ''
  searchResults.value = []
  selectedUser.value = null
  addPriority.value = 1
  addNote.value = ''
  showAddModal.value = true
}

function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    try {
      searchResults.value = await searchUsersForPool(searchQuery.value)
    } catch (e) {
      console.error('Search failed:', e)
    } finally {
      isSearching.value = false
    }
  }, 300)
}

async function handleAdd() {
  if (!selectedUser.value) return
  try {
    await addRecommendedUser(selectedUser.value.id, addPriority.value, addNote.value || undefined)
    showAddModal.value = false
    await loadPool()
  } catch (e: any) {
    alert(e.response?.data?.message || '추가 실패')
  }
}

async function handleToggle(item: RecommendedVillageUser) {
  try {
    await toggleRecommendedUser(item.id)
    item.isActive = !item.isActive
  } catch (e) {
    console.error('Toggle failed:', e)
  }
}

async function updatePriority(item: RecommendedVillageUser, newVal: number) {
  if (!newVal || newVal < 1) return
  try {
    await updateRecommendedUser(item.id, { priority: newVal })
    item.priority = newVal
  } catch (e) {
    console.error('Update failed:', e)
  }
}

async function handleDelete(item: RecommendedVillageUser) {
  if (!confirm(`${item.userNickname}님을 추천 풀에서 제거하시겠습니까?`)) return
  try {
    await removeRecommendedUser(item.id)
    pool.value = pool.value.filter(p => p.id !== item.id)
  } catch (e) {
    console.error('Delete failed:', e)
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.tab-content {
  padding: 50px 60px;
  background-color: #f5f5f7;
  min-height: 100vh;
  color: #1d1d1f;
  font-family: 'Noto Sans KR', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: #1d1d1f;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
}

.page-desc {
  color: #86868b;
  font-size: 16px;
}

.btn-action {
  padding: 12px 24px;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
  transition: all 0.2s;
}
.btn-action:hover { transform: translateY(-1px); }

/* Stats */
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px 28px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.02);
  flex: 1;
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  color: #0071e3;
}

.stat-label {
  font-size: 13px;
  color: #86868b;
  margin-top: 4px;
}

/* Table */
.table-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.02);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 16px 24px;
  background: #fafafa;
  color: #86868b;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid #e5e5ea;
}

td {
  padding: 16px 24px;
  border-bottom: 1px solid #f5f5f7;
  font-size: 14px;
  color: #1d1d1f;
  vertical-align: middle;
}

tr:hover { background: #f9f9f9; }

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e5ea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #86868b;
  font-size: 16px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
}

.user-sub {
  font-size: 12px;
  color: #86868b;
}

.asset-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: contain;
  background: #f5f5f7;
}

.priority-input {
  width: 60px;
  padding: 6px 8px;
  border: 2px solid #e5e5ea;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  outline: none;
  font-family: inherit;
}
.priority-input:focus { border-color: #0071e3; }

.toggle-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: #f0f0f2;
  color: #6e6e73;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: #e8fff0;
  color: #22c55e;
}

.note-text {
  font-size: 13px;
  color: #86868b;
  max-width: 120px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-text {
  font-size: 13px;
  color: #86868b;
}

.btn-danger-small {
  background: none;
  border: none;
  color: #ff3b30;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
}
.btn-danger-small:hover { background: #fff0f3; }

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge-gray {
  background: #f0f0f2;
  color: #6e6e73;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 20px;
  padding: 80px 40px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f5f5f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #86868b;
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 15px;
  color: #86868b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  border-radius: 24px;
  width: 560px;
  max-height: 90vh;
  box-shadow: 0 24px 64px rgba(0,0,0,0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: surfaceRise 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes surfaceRise {
  from { opacity: 0; transform: translateY(30px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  padding: 28px 32px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header h2 {
  font-size: 22px;
  font-weight: 800;
  color: #1d1d1f;
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
}

.modal-footer {
  padding: 20px 32px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fafafa;
}

.btn-close {
  background: rgba(0,0,0,0.05);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #86868b;
  font-size: 20px;
}
.btn-close:hover { background: rgba(0,0,0,0.08); color: #1d1d1f; }

.btn-primary {
  padding: 12px 24px;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
  transition: all 0.2s;
}
.btn-primary:hover { transform: translateY(-1px); }
.btn-primary:disabled { background: #86868b; cursor: not-allowed; opacity: 0.7; box-shadow: none; }

.btn-secondary {
  padding: 10px 16px;
  background: white;
  border: 2px solid #e5e5ea;
  border-radius: 12px;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover { background: #f5f5f7; border-color: #d2d2d7; }

.form-group { margin-bottom: 24px; }
.form-label { display: block; font-size: 14px; font-weight: 600; color: #1d1d1f; margin-bottom: 10px; }

.form-input,
.form-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e5ea;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
  font-family: inherit;
  background: #fafafa;
  transition: all 0.2s;
  box-sizing: border-box;
}
.form-input:focus, .form-textarea:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
  background: white;
}
.form-textarea { resize: vertical; min-height: 60px; line-height: 1.6; }

/* Search Results */
.search-results {
  max-height: 240px;
  overflow-y: auto;
  border: 2px solid #e5e5ea;
  border-radius: 12px;
  margin-top: 8px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f5f5f7;
}
.search-item:last-child { border-bottom: none; }
.search-item:hover { background: #f9f9f9; }
.search-item.selected { background: #e8f2ff; }

.search-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.search-avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e5e5ea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #86868b;
  font-size: 14px;
}

.search-info { flex: 1; }
.search-name { font-weight: 600; font-size: 14px; }
.search-sub { font-size: 12px; color: #86868b; }

.search-asset-thumb {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: contain;
  background: #f5f5f7;
}

.search-empty {
  text-align: center;
  padding: 20px;
  color: #86868b;
  font-size: 14px;
}

@media (max-width: 768px) {
  .tab-content { padding: 30px 20px; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .stats-row { flex-direction: column; }
  .table-wrapper { overflow-x: auto; }
  .modal-card { width: 95%; }
}
</style>
