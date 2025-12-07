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
@import '../assets/admin-styles.css';
</style>
