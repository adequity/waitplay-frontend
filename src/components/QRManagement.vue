<template>
  <div class="qr-management">
    <!-- Greeting -->
    <div class="apple-greeting">
      <h1 class="greeting-title">QR 코드 관리</h1>
      <p class="greeting-subtitle">고객 대기열용 QR 코드를 생성하고 관리하세요</p>
    </div>

    <!-- Create QR Section -->
    <div class="qr-create-section">
      <h2 class="section-title">새 QR 코드 생성</h2>

      <div class="create-form">
        <div class="form-group">
          <label>QR 이름</label>
          <input
            v-model="newQR.name"
            type="text"
            placeholder="예: 1층 테이블 1"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>설명 (선택)</label>
          <input
            v-model="newQR.description"
            type="text"
            placeholder="예: 창가 자리"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>매장 ID (선택)</label>
            <input
              v-model="newQR.storeId"
              type="text"
              placeholder="예: store-01"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>테이블 ID (선택)</label>
            <input
              v-model="newQR.tableId"
              type="text"
              placeholder="예: T01"
              class="form-input"
            />
          </div>
        </div>

        <button @click="createQRCode" class="btn-create" :disabled="!newQR.name || isCreating">
          <span v-if="isCreating">생성 중...</span>
          <span v-else>QR 코드 생성</span>
        </button>
      </div>
    </div>

    <!-- QR List -->
    <div class="qr-list-section">
      <div class="section-header">
        <h2 class="section-title">생성된 QR 코드 ({{ qrCodes.length }})</h2>
        <button @click="fetchQRCodes" class="btn-refresh">새로고침</button>
      </div>

      <div v-if="isLoading" class="loading">로딩 중...</div>

      <div v-else-if="qrCodes.length === 0" class="empty-state">
        <p>생성된 QR 코드가 없습니다</p>
        <p class="empty-hint">위에서 새 QR 코드를 생성해보세요</p>
      </div>

      <div v-else class="qr-grid">
        <div v-for="qr in qrCodes" :key="qr.id" class="qr-card">
          <div class="qr-card-header">
            <h3 class="qr-name">{{ qr.name }}</h3>
            <span :class="['qr-status', { active: qr.isActive }]">
              {{ qr.isActive ? '활성' : '비활성' }}
            </span>
          </div>

          <p v-if="qr.description" class="qr-description">{{ qr.description }}</p>

          <div class="qr-meta">
            <div class="meta-item" v-if="qr.storeId">
              <span class="meta-label">매장:</span>
              <span class="meta-value">{{ qr.storeId }}</span>
            </div>
            <div class="meta-item" v-if="qr.tableId">
              <span class="meta-label">테이블:</span>
              <span class="meta-value">{{ qr.tableId }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">스캔 횟수:</span>
              <span class="meta-value">{{ qr.scanCount }}회</span>
            </div>
          </div>

          <div class="qr-code-display">
            <div class="qr-placeholder">
              <div class="qr-code-text">{{ qr.code }}</div>
            </div>
          </div>

          <div class="qr-url">
            <input
              :value="qr.qrCodeUrl"
              readonly
              class="url-input"
              @click="copyToClipboard(qr.qrCodeUrl)"
            />
          </div>

          <div class="qr-actions">
            <button @click="copyToClipboard(qr.qrCodeUrl)" class="btn-action btn-copy">
              링크 복사
            </button>
            <button @click="downloadQR(qr)" class="btn-action btn-download">
              QR 다운로드
            </button>
            <button @click="deleteQRCode(qr.id)" class="btn-action btn-delete">
              삭제
            </button>
          </div>

          <div class="qr-footer">
            <span class="qr-date">생성: {{ formatDate(qr.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

interface QRCode {
  id: string
  code: string
  name: string
  description: string | null
  storeId: string | null
  tableId: string | null
  isActive: boolean
  scanCount: number
  createdAt: string
  updatedAt: string | null
  createdBy: string | null
  creatorName: string | null
  qrCodeUrl: string
}

const qrCodes = ref<QRCode[]>([])
const isLoading = ref(false)
const isCreating = ref(false)

const newQR = ref({
  name: '',
  description: '',
  storeId: '',
  tableId: ''
})

const fetchQRCodes = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(`${API_URL}/api/qrcode`)
    qrCodes.value = response.data
  } catch (error) {
    console.error('Failed to fetch QR codes:', error)
    alert('QR 코드 목록을 불러오는데 실패했습니다')
  } finally {
    isLoading.value = false
  }
}

const createQRCode = async () => {
  if (!newQR.value.name) return

  isCreating.value = true
  try {
    const response = await axios.post(`${API_URL}/api/qrcode`, {
      name: newQR.value.name,
      description: newQR.value.description || null,
      storeId: newQR.value.storeId || null,
      tableId: newQR.value.tableId || null
    })

    qrCodes.value.unshift(response.data)

    // Reset form
    newQR.value = {
      name: '',
      description: '',
      storeId: '',
      tableId: ''
    }

    alert('QR 코드가 생성되었습니다!')
  } catch (error) {
    console.error('Failed to create QR code:', error)
    alert('QR 코드 생성에 실패했습니다')
  } finally {
    isCreating.value = false
  }
}

const deleteQRCode = async (id: string) => {
  if (!confirm('이 QR 코드를 삭제하시겠습니까?')) return

  try {
    await axios.delete(`${API_URL}/api/qrcode/${id}`)
    qrCodes.value = qrCodes.value.filter(qr => qr.id !== id)
    alert('QR 코드가 삭제되었습니다')
  } catch (error) {
    console.error('Failed to delete QR code:', error)
    alert('QR 코드 삭제에 실패했습니다')
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  alert('링크가 복사되었습니다!')
}

const downloadQR = (qr: QRCode) => {
  // TODO: Implement QR code image generation and download
  alert(`QR 코드 다운로드 기능은 곧 추가됩니다.\n코드: ${qr.code}`)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchQRCodes()
})
</script>

<style scoped>
.qr-management {
  padding: 20px;
}

.apple-greeting {
  margin-bottom: 40px;
}

.greeting-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1d1d1f;
}

.greeting-subtitle {
  font-size: 16px;
  color: #6e6e73;
  margin: 0;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #1d1d1f;
}

.qr-create-section {
  background: #ffffff;
  border-radius: 18px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.create-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1d1d1f;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #0071e3;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.btn-create {
  background: #0071e3;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-create:hover:not(:disabled) {
  background: #0077ed;
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qr-list-section {
  background: #ffffff;
  border-radius: 18px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-refresh {
  background: #f5f5f7;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-refresh:hover {
  background: #e8e8ed;
}

.loading, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6e6e73;
}

.empty-hint {
  font-size: 14px;
  margin-top: 8px;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.qr-card {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.qr-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.qr-card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.qr-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1d1d1f;
}

.qr-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #d2d2d7;
  color: #1d1d1f;
}

.qr-status.active {
  background: #34c759;
  color: white;
}

.qr-description {
  font-size: 14px;
  color: #6e6e73;
  margin: 0 0 12px 0;
}

.qr-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.meta-item {
  font-size: 13px;
}

.meta-label {
  color: #6e6e73;
  margin-right: 4px;
}

.meta-value {
  color: #1d1d1f;
  font-weight: 500;
}

.qr-code-display {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-placeholder {
  width: 150px;
  height: 150px;
  background: #f5f5f7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-code-text {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  text-align: center;
  word-break: break-all;
  padding: 12px;
}

.qr-url {
  margin-bottom: 16px;
}

.url-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  font-size: 12px;
  background: white;
  cursor: pointer;
}

.url-input:focus {
  outline: none;
  border-color: #0071e3;
}

.qr-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.btn-action {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-copy {
  background: #0071e3;
  color: white;
}

.btn-copy:hover {
  background: #0077ed;
}

.btn-download {
  background: #34c759;
  color: white;
}

.btn-download:hover {
  background: #30d158;
}

.btn-delete {
  background: #ff3b30;
  color: white;
}

.btn-delete:hover {
  background: #ff453a;
}

.qr-footer {
  padding-top: 12px;
  border-top: 1px solid #d2d2d7;
}

.qr-date {
  font-size: 12px;
  color: #6e6e73;
}
</style>
