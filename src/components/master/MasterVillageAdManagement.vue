<template>
  <div class="tab-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">빌리지 광고</h1>
        <p class="page-desc">유저 빌리지에 노출되는 광고 캠페인 관리</p>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="stats-grid" v-if="stats">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalAds }}</div>
        <div class="stat-label">전체 광고</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.activeAds }}</div>
        <div class="stat-label">활성 광고</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ formatNumber(stats.totalImpressions) }}</div>
        <div class="stat-label">총 노출수</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ formatNumber(stats.totalClicks) }}</div>
        <div class="stat-label">총 클릭수</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.overallCtr }}%</div>
        <div class="stat-label">전체 CTR</div>
      </div>
    </div>

    <!-- Section: Ad Slots -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">광고 슬롯 좌표</h2>
      </div>
      <div class="slot-form">
        <input v-model.number="newSlotQ" type="number" class="form-input slot-input" placeholder="Q" />
        <input v-model.number="newSlotR" type="number" class="form-input slot-input" placeholder="R" />
        <button class="btn-primary btn-sm" @click="addSlot" :disabled="newSlotQ === null || newSlotR === null">추가</button>
      </div>
      <div class="slot-chips" v-if="slots.length > 0">
        <div v-for="slot in slots" :key="slot.id" class="slot-chip" :class="{ inactive: !slot.isActive }">
          <span>({{ slot.slotQ }}, {{ slot.slotR }})</span>
          <button class="chip-toggle" @click="toggleSlot(slot.id)" :title="slot.isActive ? '비활성화' : '활성화'">
            {{ slot.isActive ? 'ON' : 'OFF' }}
          </button>
          <button class="chip-delete" @click="deleteSlot(slot.id)">&times;</button>
        </div>
      </div>
      <p v-else class="empty-text">등록된 광고 슬롯이 없습니다.</p>
    </div>

    <!-- Section: Ads List -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">광고 크리에이티브</h2>
        <button class="btn-action" @click="openCreateModal">+ 광고 추가</button>
      </div>

      <div v-if="ads.length === 0" class="empty-state">
        <div class="empty-icon">📢</div>
        <p class="empty-title">등록된 광고가 없습니다</p>
        <p class="empty-desc">상단의 '광고 추가' 버튼으로 첫 광고를 만들어보세요.</p>
      </div>

      <div class="ads-grid" v-else>
        <div v-for="ad in ads" :key="ad.id" class="ad-card">
          <div class="ad-image-wrap">
            <img :src="ad.roomImageUrl" :alt="ad.roomName" class="ad-image" />
            <span class="status-badge" :class="'badge-' + ad.status">{{ statusLabel(ad.status) }}</span>
          </div>
          <div class="ad-body">
            <h3 class="ad-name">{{ ad.roomName }}</h3>
            <div class="ad-meta">
              <span>{{ ad.linkType === 'internal_store' ? '매장 링크' : '외부 링크' }}</span>
              <span>&middot;</span>
              <span>가중치 {{ ad.weight }}</span>
            </div>
            <div class="ad-dates">
              {{ formatDate(ad.startDate) }} ~ {{ formatDate(ad.endDate) }}
            </div>
            <div class="ad-stats-row">
              <div class="mini-stat">
                <span class="mini-val">{{ formatNumber(ad.totalImpressions) }}</span>
                <span class="mini-label">노출</span>
              </div>
              <div class="mini-stat">
                <span class="mini-val">{{ formatNumber(ad.totalClicks) }}</span>
                <span class="mini-label">클릭</span>
              </div>
              <div class="mini-stat">
                <span class="mini-val">{{ ad.ctr }}%</span>
                <span class="mini-label">CTR</span>
              </div>
            </div>
            <!-- Progress bar for impression target -->
            <div v-if="ad.totalImpressionTarget > 0" class="progress-wrap">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: Math.min(100, ad.totalImpressions / ad.totalImpressionTarget * 100) + '%' }"></div>
              </div>
              <span class="progress-text">{{ formatNumber(ad.totalImpressions) }} / {{ formatNumber(ad.totalImpressionTarget) }}</span>
            </div>
            <div class="ad-actions">
              <button v-if="ad.status === 'active'" class="btn-small" @click="pauseAd(ad.id)">일시정지</button>
              <button v-if="ad.status === 'paused'" class="btn-small btn-resume" @click="resumeAd(ad.id)">재개</button>
              <button class="btn-small" @click="openEditModal(ad)">수정</button>
              <button class="btn-small btn-del" @click="removeAd(ad.id)">삭제</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ editingAd ? '광고 수정' : '광고 추가' }}</h2>
          <button class="btn-close" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">룸 이름 *</label>
            <input v-model="form.roomName" class="form-input" placeholder="광고 룸 이름" />
          </div>
          <div class="form-group">
            <label class="form-label">룸 이미지 URL *</label>
            <input v-model="form.roomImageUrl" class="form-input" placeholder="https://..." />
            <div v-if="form.roomImageUrl" class="image-preview">
              <img :src="form.roomImageUrl" alt="preview" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">룸 색상</label>
            <input v-model="form.roomColor" type="color" class="form-color" />
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">링크 타입</label>
              <select v-model="form.linkType" class="form-input">
                <option value="external">외부 URL</option>
                <option value="internal_store">매장 링크</option>
              </select>
            </div>
            <div class="form-group flex-1" v-if="form.linkType === 'external'">
              <label class="form-label">외부 URL</label>
              <input v-model="form.linkUrl" class="form-input" placeholder="https://..." />
            </div>
            <div class="form-group flex-1" v-else>
              <label class="form-label">매장 코드</label>
              <input v-model="form.linkStoreCode" class="form-input" placeholder="매장 QR 코드" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">시작일 *</label>
              <input v-model="form.startDate" type="datetime-local" class="form-input" />
            </div>
            <div class="form-group flex-1">
              <label class="form-label">종료일 *</label>
              <input v-model="form.endDate" type="datetime-local" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">총 노출 목표 (0=무제한)</label>
              <input v-model.number="form.totalImpressionTarget" type="number" class="form-input" min="0" />
            </div>
            <div class="form-group flex-1">
              <label class="form-label">가중치</label>
              <input v-model.number="form.weight" type="number" class="form-input" min="1" max="100" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showModal = false">취소</button>
          <button class="btn-primary" @click="submitForm" :disabled="!form.roomName || !form.roomImageUrl">
            {{ editingAd ? '저장' : '생성' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  type VillageAd,
  type VillageAdSlot,
  type VillageAdStats,
  getAllAds,
  createAd,
  updateAd,
  deleteAd,
  toggleAdStatus,
  getAdSlots,
  createAdSlot,
  deleteAdSlot,
  toggleAdSlot,
  getAdStats,
} from '@/services/villageAdService'

const ads = ref<VillageAd[]>([])
const slots = ref<VillageAdSlot[]>([])
const stats = ref<VillageAdStats | null>(null)
const showModal = ref(false)
const editingAd = ref<VillageAd | null>(null)

const newSlotQ = ref<number | null>(null)
const newSlotR = ref<number | null>(null)

const form = ref({
  roomName: '',
  roomImageUrl: '',
  roomColor: '#FF6B35',
  linkType: 'external',
  linkUrl: '',
  linkStoreCode: '',
  startDate: '',
  endDate: '',
  totalImpressionTarget: 0,
  weight: 1,
})

onMounted(async () => {
  await loadAll()
})

async function loadAll() {
  try {
    const [adsData, slotsData, statsData] = await Promise.all([
      getAllAds(),
      getAdSlots(),
      getAdStats(),
    ])
    ads.value = adsData
    slots.value = slotsData
    stats.value = statsData
  } catch (err) {
    console.error('Failed to load village ad data', err)
  }
}

// Slots
async function addSlot() {
  if (newSlotQ.value === null || newSlotR.value === null) return
  try {
    await createAdSlot(newSlotQ.value, newSlotR.value)
    newSlotQ.value = null
    newSlotR.value = null
    await loadAll()
  } catch (err: any) {
    alert(err?.response?.data?.message || '슬롯 추가 실패')
  }
}

async function deleteSlot(id: string) {
  if (!confirm('이 광고 슬롯을 삭제할까요?')) return
  try {
    await deleteAdSlot(id)
    await loadAll()
  } catch { /* silent */ }
}

async function toggleSlot(id: string) {
  try {
    await toggleAdSlot(id)
    await loadAll()
  } catch { /* silent */ }
}

// Ads
function openCreateModal() {
  editingAd.value = null
  form.value = {
    roomName: '',
    roomImageUrl: '',
    roomColor: '#FF6B35',
    linkType: 'external',
    linkUrl: '',
    linkStoreCode: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
    totalImpressionTarget: 0,
    weight: 1,
  }
  showModal.value = true
}

function openEditModal(ad: VillageAd) {
  editingAd.value = ad
  form.value = {
    roomName: ad.roomName,
    roomImageUrl: ad.roomImageUrl,
    roomColor: ad.roomColor,
    linkType: ad.linkType,
    linkUrl: ad.linkUrl || '',
    linkStoreCode: ad.linkStoreCode || '',
    startDate: ad.startDate.slice(0, 16),
    endDate: ad.endDate.slice(0, 16),
    totalImpressionTarget: ad.totalImpressionTarget,
    weight: ad.weight,
  }
  showModal.value = true
}

async function submitForm() {
  try {
    const payload: any = {
      roomName: form.value.roomName,
      roomImageUrl: form.value.roomImageUrl,
      roomColor: form.value.roomColor,
      linkType: form.value.linkType,
      linkUrl: form.value.linkType === 'external' ? form.value.linkUrl : undefined,
      linkStoreCode: form.value.linkType === 'internal_store' ? form.value.linkStoreCode : undefined,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      totalImpressionTarget: form.value.totalImpressionTarget,
      weight: form.value.weight,
    }
    if (editingAd.value) {
      await updateAd(editingAd.value.id, payload)
    } else {
      await createAd(payload)
    }
    showModal.value = false
    await loadAll()
  } catch (err: any) {
    alert(err?.response?.data?.message || '저장 실패')
  }
}

async function removeAd(id: string) {
  if (!confirm('이 광고를 삭제할까요?')) return
  try {
    await deleteAd(id)
    await loadAll()
  } catch { /* silent */ }
}

async function pauseAd(id: string) {
  await toggleAdStatus(id, 'paused')
  await loadAll()
}

async function resumeAd(id: string) {
  await toggleAdStatus(id, 'active')
  await loadAll()
}

// Helpers
function statusLabel(status: string) {
  const map: Record<string, string> = { active: '활성', paused: '일시정지', completed: '완료', expired: '만료' }
  return map[status] || status
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #1d1d1f;
}

.stat-label {
  font-size: 13px;
  color: #86868b;
  margin-top: 4px;
}

/* Section */
.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
}

/* Slot Form */
.slot-form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  align-items: center;
}

.slot-input {
  width: 80px;
  text-align: center;
}

.slot-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.slot-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
}

.slot-chip.inactive {
  opacity: 0.5;
  background: #f5f5f7;
}

.chip-toggle {
  background: #e8f2ff;
  color: #0071e3;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  cursor: pointer;
}

.chip-delete {
  background: none;
  border: none;
  color: #ff3b30;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.empty-text {
  color: #86868b;
  font-size: 14px;
}

/* Ads Grid */
.ads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.ad-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
  overflow: hidden;
  transition: transform 0.2s;
}

.ad-card:hover {
  transform: translateY(-3px);
}

.ad-image-wrap {
  position: relative;
  height: 180px;
  background: #f5f5f7;
  overflow: hidden;
}

.ad-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge-active { background: #e8fff0; color: #22c55e; }
.badge-paused { background: #fff9e6; color: #d97706; }
.badge-completed { background: #e8f2ff; color: #0071e3; }
.badge-expired { background: #f0f0f2; color: #6e6e73; }

.ad-body {
  padding: 20px;
}

.ad-name {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 8px;
}

.ad-meta {
  font-size: 13px;
  color: #86868b;
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}

.ad-dates {
  font-size: 13px;
  color: #aeaeb2;
  margin-bottom: 12px;
}

.ad-stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.mini-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mini-val {
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
}

.mini-label {
  font-size: 11px;
  color: #86868b;
}

/* Progress bar */
.progress-wrap {
  margin-bottom: 12px;
}

.progress-bar {
  height: 6px;
  background: #f0f0f2;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0071e3, #34c759);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 11px;
  color: #86868b;
}

.ad-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Buttons */
.btn-primary {
  padding: 12px 24px;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover { transform: translateY(-1px); }
.btn-primary:disabled { background: #86868b; cursor: not-allowed; }

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 8px;
}

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

.btn-secondary:hover { background: #f5f5f7; }

.btn-action {
  padding: 10px 20px;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-small {
  background: #f5f5f7;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #86868b;
  cursor: pointer;
}

.btn-small:hover { background: #e5e5ea; color: #1d1d1f; }

.btn-resume { color: #22c55e; }
.btn-del { color: #ff3b30; }
.btn-del:hover { background: #fff0f3; }

/* Empty State */
.empty-state {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
}

.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.empty-desc { font-size: 14px; color: #86868b; }

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
  width: 600px;
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
  align-items: center;
}

.modal-header h2 {
  font-size: 22px;
  font-weight: 800;
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

.btn-close:hover { background: rgba(0,0,0,0.08); }

/* Form */
.form-group { margin-bottom: 20px; }

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e5e5ea;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  background: #fafafa;
  box-sizing: border-box;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
  background: white;
}

.form-color {
  width: 48px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.form-row {
  display: flex;
  gap: 16px;
}

.flex-1 { flex: 1; }

.image-preview {
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  max-height: 120px;
}

.image-preview img {
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
}

/* Responsive */
@media (max-width: 768px) {
  .tab-content { padding: 30px 20px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .ads-grid { grid-template-columns: 1fr; }
  .form-row { flex-direction: column; }
  .modal-card { width: 95%; }
}
</style>
