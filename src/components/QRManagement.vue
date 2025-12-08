<template>
  <div class="tab-content">
    <!-- Apple-Style Greeting -->
    <div class="apple-greeting">
      <h1 class="greeting-title">QR 코드 관리</h1>
      <p class="greeting-subtitle">고객 대기열용 QR 코드를 생성하고 관리하세요</p>
    </div>

    <!-- Main QR Management Grid (Horizontal Layout) -->
    <div class="qr-management-grid">
      <!-- Left: Landing Page Settings -->
      <div class="landing-settings-section">
        <h2 class="settings-section-title">랜딩페이지 설정</h2>

        <div class="settings-form-apple">
          <div class="settings-form-group">
            <label class="settings-label">매장 이름</label>
            <input
              type="text"
              class="settings-input-apple"
              v-model="storeName"
              placeholder="예: 스타벅스 강남점"
            />
          </div>

          <!-- Logo Upload Section -->
          <div class="settings-form-group">
            <label class="settings-label">매장 로고</label>
            <div class="logo-upload-container">
              <div v-if="logoUrl" class="logo-preview-wrapper">
                <div class="logo-preview">
                  <img :src="logoUrl" alt="매장 로고" class="logo-image" />
                </div>
                <div class="logo-actions">
                  <button type="button" class="btn-logo-change" @click="triggerLogoUpload">
                    <span>변경</span>
                  </button>
                  <button type="button" class="btn-logo-remove" @click="removeLogo">
                    <span>삭제</span>
                  </button>
                </div>
              </div>
              <div v-else class="logo-upload-box" @click="triggerLogoUpload">
                <div class="upload-icon">+</div>
                <p class="upload-text">로고 이미지를 업로드하세요</p>
                <p class="upload-hint">PNG, JPG, SVG (최대 2MB)</p>
              </div>
              <input
                ref="logoFileInput"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                @change="handleLogoUpload"
                class="logo-file-input"
                hidden
              />
            </div>
          </div>

          <div class="settings-form-group">
            <label class="settings-label">환영 메시지</label>
            <textarea
              class="settings-textarea-apple"
              v-model="welcomeMessage"
              placeholder="고객에게 표시될 환영 메시지를 입력하세요..."
              rows="3"
            ></textarea>
          </div>

          <div class="settings-form-group">
            <label class="settings-label">활성화된 게임</label>
            <div class="active-games-summary">
              <span class="game-chip">브랜드 퀴즈</span>
              <span class="game-chip">메뉴 픽 맞추기</span>
              <span class="game-chip game-chip-disabled">틀린 그림 찾기 (비활성)</span>
            </div>
            <p class="settings-hint">게임 관리 탭에서 활성화/비활성화 할 수 있습니다.</p>
          </div>

          <div class="settings-form-actions">
            <button class="btn-settings-save" @click="saveSettings">
              <span>설정 저장</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Right: QR Code Preview Card -->
      <div class="qr-code-card">
        <h3 class="qr-code-title">QR 코드 미리보기</h3>
        <p class="qr-code-subtitle">
          {{ selectedQR ? selectedQR.name : '왼쪽에서 QR 코드를 선택하세요' }}
        </p>

        <!-- QR Code Preview -->
        <div class="qr-code-display">
          <div class="qr-placeholder">
            <img v-if="selectedQR && qrImageUrl" :src="qrImageUrl" alt="QR Code" class="qr-image" />
            <svg v-else viewBox="0 0 200 200" class="qr-svg">
              <!-- Simple QR code representation -->
              <rect width="200" height="200" fill="#ffffff" />
              <rect x="10" y="10" width="60" height="60" fill="#000000" />
              <rect x="130" y="10" width="60" height="60" fill="#000000" />
              <rect x="10" y="130" width="60" height="60" fill="#000000" />
              <rect x="20" y="20" width="20" height="20" fill="#ffffff" />
              <rect x="140" y="20" width="20" height="20" fill="#ffffff" />
              <rect x="20" y="140" width="20" height="20" fill="#ffffff" />
              <rect x="80" y="80" width="40" height="40" fill="#000000" />
              <rect x="90" y="10" width="10" height="10" fill="#000000" />
              <rect x="110" y="10" width="10" height="10" fill="#000000" />
              <rect x="90" y="30" width="10" height="10" fill="#000000" />
              <rect x="110" y="30" width="10" height="10" fill="#000000" />
            </svg>
          </div>
        </div>

        <div v-if="selectedQR" class="qr-actions">
          <button class="btn-qr-download" @click="downloadQR(selectedQR)">
            <span>이미지 다운로드</span>
          </button>
          <button class="btn-qr-print" @click="printQR(selectedQR)">
            <span>인쇄하기</span>
          </button>
        </div>

        <!-- QR Info -->
        <div v-if="selectedQR" class="qr-info-box">
          <div class="info-item-qr">
            <span class="info-label-qr">생성일</span>
            <span class="info-value-qr">{{ formatDate(selectedQR.createdAt) }}</span>
          </div>
          <div class="info-item-qr">
            <span class="info-label-qr">URL</span>
            <a :href="selectedQR.qrCodeUrl" target="_blank" class="info-value-qr qr-url-link">
              {{ selectedQR.qrCodeUrl }}
            </a>
          </div>
          <div class="info-item-qr">
            <span class="info-label-qr">스캔 횟수</span>
            <span class="info-value-qr">{{ selectedQR.scanCount }}회</span>
          </div>
        </div>

        <!-- Advanced Settings Section -->
        <div class="advanced-settings-section">
          <button class="btn-layout-manager" @click="openLayoutEditor">
            <span class="btn-text">고급 설정 (레이아웃 편집기)</span>
            <span class="btn-icon">→</span>
          </button>
          <p class="advanced-hint">랜딩페이지를 블록 단위로 편집하고 커스터마이징할 수 있습니다</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import QRCode from 'qrcode'

const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

interface QRCodeData {
  id: string
  code: string
  name: string
  description: string | null
  userId: string
  ownerUsername: string | null
  ownerNickname: string | null
  company: string | null
  tableId: string | null
  isActive: boolean
  scanCount: number
  createdAt: string
  updatedAt: string | null
  createdBy: string | null
  creatorName: string | null
  qrCodeUrl: string
}

const qrCodes = ref<QRCodeData[]>([])
const selectedQR = ref<QRCodeData | null>(null)
const qrImageUrl = ref<string>('')
const isLoading = ref(false)

// Landing page settings
const storeName = ref('')
const logoUrl = ref<string>('')
const logoFileInput = ref<HTMLInputElement | null>(null)
const welcomeMessage = ref('')
const landingPageUrl = ref('waitplay.io/store/demo123')

// Open Layout Editor
const openLayoutEditor = () => {
  // Open the layout editor in a new tab/window or navigate to it
  window.open('/admin/layout-editor', '_blank')
}

// Load settings from backend API
const loadSettings = async () => {
  try {
    // Try to load from backend first
    const response = await axios.get(`${API_URL}/api/landingpage/settings`)
    if (response.data && response.data.storeName) {
      storeName.value = response.data.storeName
      logoUrl.value = response.data.logoUrl || ''
      welcomeMessage.value = response.data.welcomeMessage || ''
      landingPageUrl.value = response.data.landingPageUrl || 'waitplay.io/store/demo123'

      // Also update localStorage for offline access
      localStorage.setItem('waitplay_landing_settings', JSON.stringify(response.data))
      return
    }
  } catch (error) {
    console.warn('Failed to load settings from backend, trying localStorage:', error)
  }

  // Fallback to localStorage if backend fails
  const savedSettings = localStorage.getItem('waitplay_landing_settings')
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings)
      storeName.value = settings.storeName || 'WaitPlay 데모 매장'
      logoUrl.value = settings.logoUrl || ''
      welcomeMessage.value = settings.welcomeMessage || '환영합니다! QR 코드를 스캔하여 대기열에 참여하세요.'
      landingPageUrl.value = settings.landingPageUrl || 'waitplay.io/store/demo123'
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error)
    }
  } else {
    // Set defaults if no saved settings
    storeName.value = 'WaitPlay 데모 매장'
    welcomeMessage.value = '환영합니다! QR 코드를 스캔하여 대기열에 참여하세요.'
  }
}

const fetchQRCodes = async () => {
  isLoading.value = true
  try {
    const response = await axios.get(`${API_URL}/api/qrcode`)
    qrCodes.value = response.data

    // Auto-select first QR code if available
    if (qrCodes.value.length > 0 && !selectedQR.value) {
      selectedQR.value = qrCodes.value[0] || null
    }
  } catch (error) {
    console.error('Failed to fetch QR codes:', error)
    alert('QR 코드 목록을 불러오는데 실패했습니다')
  } finally {
    isLoading.value = false
  }
}

// Landing page settings functions
const saveSettings = async () => {
  try {
    const settingsData = {
      storeName: storeName.value,
      logoUrl: logoUrl.value,
      welcomeMessage: welcomeMessage.value
    }

    const response = await axios.post(`${API_URL}/api/landingpage/settings`, settingsData)

    if (response.data.landingPageUrl) {
      landingPageUrl.value = response.data.landingPageUrl
    }

    // Also save to localStorage for backward compatibility
    localStorage.setItem('waitplay_landing_settings', JSON.stringify({
      ...settingsData,
      landingPageUrl: landingPageUrl.value
    }))

    alert('설정이 저장되었습니다!')
  } catch (error) {
    console.error('Failed to save settings:', error)
    alert('설정 저장에 실패했습니다.')
  }
}

const triggerLogoUpload = () => {
  logoFileInput.value?.click()
}

const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('파일 크기는 2MB 이하여야 합니다.')
      return
    }

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Upload file to backend
      const response = await axios.post(`${API_URL}/api/fileupload/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        // Set the logo URL from the response
        logoUrl.value = response.data.fileUrl

        // Auto-save settings after logo upload
        await saveSettings()
      } else {
        alert(response.data.message || '파일 업로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to upload logo:', error)
      alert('파일 업로드 중 오류가 발생했습니다.')
    }
  }
}

const removeLogo = () => {
  logoUrl.value = ''
  if (logoFileInput.value) {
    logoFileInput.value.value = ''
  }
}

const selectQRCode = (qr: QRCodeData) => {
  selectedQR.value = qr
}

// Generate QR code image when selectedQR changes
const generateQRImage = async (url: string) => {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: qrSettings.value.size,
      margin: qrSettings.value.margin,
      errorCorrectionLevel: qrSettings.value.errorCorrectionLevel,
      color: {
        dark: qrSettings.value.foregroundColor,
        light: qrSettings.value.backgroundColor
      }
    })
    qrImageUrl.value = dataUrl
  } catch (error) {
    console.error('Failed to generate QR code:', error)
  }
}

// Apply QR settings
const applyQRSettings = () => {
  if (selectedQR.value && selectedQR.value.qrCodeUrl) {
    generateQRImage(selectedQR.value.qrCodeUrl)
  }
}

// Reset QR settings to default
const resetQRSettings = () => {
  qrSettings.value = {
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    errorCorrectionLevel: 'M',
    size: 400,
    margin: 4
  }
  applyQRSettings()
}

// Watch for selectedQR changes
watch(selectedQR, (newQR) => {
  if (newQR && newQR.qrCodeUrl) {
    generateQRImage(newQR.qrCodeUrl)
  } else {
    qrImageUrl.value = ''
  }
}, { immediate: true })

const deleteQRCode = async (id: string) => {
  if (!confirm('이 QR 코드를 삭제하시겠습니까?')) return

  try {
    await axios.delete(`${API_URL}/api/qrcode/${id}`)
    qrCodes.value = qrCodes.value.filter(qr => qr.id !== id)

    // Clear selection if deleted QR was selected
    if (selectedQR.value?.id === id) {
      selectedQR.value = qrCodes.value.length > 0 ? (qrCodes.value[0] || null) : null
    }

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

const downloadQR = (qr: QRCodeData) => {
  if (!qrImageUrl.value) {
    alert('QR 코드 이미지를 생성 중입니다. 잠시 후 다시 시도해주세요.')
    return
  }

  const link = document.createElement('a')
  link.download = `QR_${qr.name}_${qr.code}.png`
  link.href = qrImageUrl.value
  link.click()
}

const printQR = (qr: QRCodeData) => {
  if (!qrImageUrl.value) {
    alert('QR 코드 이미지를 생성 중입니다. 잠시 후 다시 시도해주세요.')
    return
  }

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>QR 코드 - ${qr.name}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
              color: #1d1d1f;
            }
            p {
              font-size: 14px;
              color: #6e6e73;
              margin: 5px 0;
            }
            img {
              margin: 20px 0;
              border: 2px solid #e1e4e8;
              border-radius: 12px;
              padding: 20px;
            }
            .code {
              font-family: 'Courier New', monospace;
              font-size: 18px;
              color: #007aff;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${qr.name}</h1>
            ${qr.description ? `<p>${qr.description}</p>` : ''}
            <img src="${qrImageUrl.value}" alt="QR Code" />
            <p class="code">코드: ${qr.code}</p>
            ${qr.company ? `<p>업체: ${qr.company}</p>` : ''}
            ${qr.tableId ? `<p>테이블: ${qr.tableId}</p>` : ''}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
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
  loadSettings()
  fetchQRCodes()
})
</script>

<style scoped>
@import '../assets/admin-styles.css';

/* Additional QR-specific styles */
.qr-image {
  width: 100%;
  max-width: 280px;
  height: auto;
  border-radius: 12px;
  border: 2px solid #e1e4e8;
  padding: 10px;
  background: white;
  display: block;
  margin: 0 auto;
}

.qr-list-container {
  margin-top: 30px;
}

.qr-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.qr-list-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.loading-state,
.empty-state-qr {
  text-align: center;
  padding: 40px 20px;
  color: #6e6e73;
  font-size: 14px;
}

.qr-list-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qr-list-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e1e4e8;
  transition: all 0.2s;
}

.qr-list-item:hover {
  border-color: #007aff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
}

.qr-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.qr-item-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.qr-item-status {
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  background: #d2d2d7;
  color: #1d1d1f;
}

.qr-item-status.active {
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
  color: white;
}

.qr-item-description {
  font-size: 13px;
  color: #6e6e73;
  margin: 0 0 8px 0;
}

.qr-item-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #86868b;
  margin-bottom: 8px;
}

.qr-item-code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #007aff;
  margin-bottom: 12px;
  padding: 6px 10px;
  background: #f5f7fa;
  border-radius: 6px;
  display: inline-block;
}

.qr-item-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.btn-qr-select,
.btn-qr-copy,
.btn-qr-delete {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-qr-select {
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: white;
}

.btn-qr-select:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-qr-copy {
  background: #f5f7fa;
  color: #1d1d1f;
  border: 1px solid #d2d2d7;
}

.btn-qr-copy:hover {
  background: #e8ebed;
}

.btn-qr-delete {
  background: #ff3b30;
  color: white;
}

.btn-qr-delete:hover {
  background: #ff453a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
}

.qr-url-link {
  color: #007aff;
  text-decoration: none;
  word-break: break-all;
  transition: all 0.2s ease;
  cursor: pointer;
}

.qr-url-link:hover {
  color: #0051d5;
  text-decoration: underline;
}

/* Advanced Settings Section */
.advanced-settings-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-layout-manager {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.btn-layout-manager:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.35);
}

.btn-layout-manager:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

/* Advanced Settings Panel */
.advanced-settings-panel {
  margin-top: 16px;
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.settings-group {
  margin-bottom: 20px;
}

.settings-group:last-child {
  margin-bottom: 0;
}

.settings-label-small {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.color-picker-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.color-input:hover {
  border-color: #667eea;
}

.color-text-input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #1f2937;
  transition: all 0.2s ease;
}

.color-text-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.settings-select {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.settings-hint-small {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
}

.size-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, #e5e7eb 0%, #667eea 100%);
  outline: none;
  -webkit-appearance: none;
  margin: 8px 0;
}

.size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.size-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.size-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.size-display {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  margin-top: 4px;
}

.settings-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-apply-settings,
.btn-reset-settings {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-apply-settings {
  background: #667eea;
  color: white;
}

.btn-apply-settings:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.25);
}

.btn-reset-settings {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-reset-settings:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Slide Down Transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>
