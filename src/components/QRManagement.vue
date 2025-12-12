<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">QR 코드 관리</h1>
      <p class="page-desc">매장의 디지털 입간판(랜딩페이지)을 설정하고 QR 코드를 관리하세요.</p>
    </div>

    <!-- Main QR Management Grid (2-column layout) -->
    <div class="qr-grid">
      <!-- Left: Landing Page Settings Card -->
      <div class="card settings-card">
        <div class="card-title">
          <IconBase name="gear" class="text-blue icon-svg" />
          랜딩페이지 설정
        </div>

        <div class="settings-form">
          <!-- Store Name -->
          <div class="form-group">
            <label class="form-label">매장 이름</label>
            <input
              type="text"
              class="form-input"
              v-model="storeName"
              placeholder="예: 스타벅스 강남점"
            />
          </div>

          <!-- Logo Upload -->
          <div class="form-group">
            <label class="form-label">매장 로고</label>
            <div class="logo-upload-container">
              <div v-if="logoUrl" class="logo-preview-wrapper">
                <div class="logo-preview">
                  <img :src="logoUrl" alt="매장 로고" class="logo-image" />
                </div>
                <div class="logo-actions">
                  <button type="button" class="btn-logo-change" @click="triggerLogoUpload">
                    변경
                  </button>
                  <button type="button" class="btn-logo-remove" @click="removeLogo">
                    삭제
                  </button>
                </div>
              </div>
              <div v-else class="logo-upload-box" @click="triggerLogoUpload">
                <div class="upload-icon">+</div>
                <p class="upload-text">로고 이미지 업로드</p>
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

          <!-- Welcome Message -->
          <div class="form-group">
            <label class="form-label">환영 메시지</label>
            <textarea
              class="form-textarea"
              v-model="welcomeMessage"
              placeholder="고객에게 표시될 환영 메시지를 입력하세요..."
              rows="3"
            ></textarea>
          </div>

          <!-- Active Games Info -->
          <div class="form-group">
            <label class="form-label">활성화된 게임</label>
            <div class="active-games-summary">
              <span
                v-for="game in games"
                :key="game.id"
                class="game-chip"
                :class="{ 'game-chip-disabled': !game.enabled }"
              >
                {{ game.name }}{{ !game.enabled ? ' (비활성)' : '' }}
              </span>
            </div>
            <p class="settings-hint">게임 관리 탭에서 활성화/비활성화 할 수 있습니다.</p>
          </div>

          <!-- Save Button -->
          <button class="btn-save-settings" @click="saveSettings">
            설정 저장
          </button>
        </div>
      </div>

      <!-- Right Column: QR Preview & Actions -->
      <div class="right-column">
        <!-- QR Code Preview Card -->
        <div class="card">
          <div class="card-title">
            <IconBase name="qr" class="text-blue icon-svg" />
            QR 코드 미리보기
          </div>

          <p class="qr-subtitle">
            {{ selectedQR ? selectedQR.name : '왼쪽에서 QR 코드를 선택하세요' }}
          </p>

          <!-- QR Code Display -->
          <div class="qr-preview-container">
            <div class="qr-frame">
              <img v-if="selectedQR && qrImageUrl" :src="qrImageUrl" alt="QR Code" class="qr-image" />
              <svg v-else viewBox="0 0 200 200" class="qr-placeholder-svg">
                <rect width="200" height="200" fill="#f5f5f7" />
                <rect x="10" y="10" width="60" height="60" fill="#000000" />
                <rect x="130" y="10" width="60" height="60" fill="#000000" />
                <rect x="10" y="130" width="60" height="60" fill="#000000" />
                <rect x="20" y="20" width="20" height="20" fill="#ffffff" />
                <rect x="140" y="20" width="20" height="20" fill="#ffffff" />
                <rect x="20" y="140" width="20" height="20" fill="#ffffff" />
                <rect x="80" y="80" width="40" height="40" fill="#000000" />
              </svg>
            </div>
          </div>

          <!-- QR Actions -->
          <div v-if="selectedQR" class="qr-actions">
            <button class="btn-qr-download" @click="downloadQR(selectedQR)">
              <IconBase name="download" class="btn-icon" />
              이미지 다운로드
            </button>
            <button class="btn-qr-print" @click="printQR(selectedQR)">
              <IconBase name="file" class="btn-icon" />
              인쇄하기
            </button>
          </div>

          <!-- QR Info -->
          <div v-if="selectedQR" class="qr-info-box">
            <div class="info-item">
              <span class="info-label">생성일</span>
              <span class="info-value">{{ formatDate(selectedQR.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">URL</span>
              <a :href="selectedQR.qrCodeUrl" target="_blank" class="info-value qr-url-link">
                {{ selectedQR.qrCodeUrl }}
              </a>
            </div>
            <div class="info-item">
              <span class="info-label">스캔 횟수</span>
              <span class="info-value">{{ selectedQR.scanCount }}회</span>
            </div>
          </div>
        </div>

        <!-- Advanced Settings Section -->
        <div class="card advanced-card">
          <div class="card-title">
            <IconBase name="wand" class="text-blue icon-svg" />
            고급 설정
          </div>
          <p class="advanced-desc">
            랜딩페이지를 블록 단위로 편집하고 커스터마이징할 수 있습니다.
          </p>
          <button class="btn-layout-manager" @click="openLayoutEditor">
            레이아웃 편집기 열기
            <IconBase name="arrow-right" class="btn-icon-right" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import apiClient from '@/services/api'
import QRCode from 'qrcode'
import IconBase from '@/components/IconBase.vue'
import { useAuthStore } from '@/stores/auth'
import gameSettingsService from '@/services/gameSettingsService'

const authStore = useAuthStore()

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

interface Game {
  id: string
  name: string
  enabled: boolean
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

// Game settings
const games = ref<Game[]>([])

// Game definitions matching GamesTab
const gameDefinitions = [
  { id: 'pinball', name: '핀볼' },
  { id: 'brick-breaker', name: '벽돌깨기' },
  { id: 'memory', name: '같은 카드 찾기' },
  { id: 'spot-difference', name: '틀린 그림 찾기' }
]

// Load game settings from API
const loadGameSettings = async () => {
  try {
    const qrCodeId = authStore.user?.qrCodeId
    if (!qrCodeId) {
      console.warn('No QR code ID found for user')
      // Set all games as disabled by default
      games.value = gameDefinitions.map(def => ({
        id: def.id,
        name: def.name,
        enabled: false
      }))
      return
    }

    const settings = await gameSettingsService.getGameSettings(qrCodeId)

    // Map all games with their enabled status
    games.value = gameDefinitions.map(def => ({
      id: def.id,
      name: def.name,
      enabled: settings.enabledGames.includes(def.id)
    }))
  } catch (error) {
    console.error('Failed to load game settings:', error)
    // Fallback: show all games as disabled
    games.value = gameDefinitions.map(def => ({
      id: def.id,
      name: def.name,
      enabled: false
    }))
  }
}

// Open Layout Editor
const openLayoutEditor = () => {
  if (!selectedQR.value) {
    alert('QR 코드를 먼저 선택해주세요')
    return
  }
  window.open('/admin/layout-editor', '_blank')
}

// Load settings from backend API for specific QR code
const loadSettings = async () => {
  if (!selectedQR.value) {
    console.warn('No QR code selected, cannot load settings')
    return
  }

  try {
    const response = await apiClient.get(`/api/landingpage/settings/${selectedQR.value.id}`)
    if (response.data && response.data.storeName) {
      storeName.value = response.data.storeName
      logoUrl.value = response.data.logoUrl || ''
      welcomeMessage.value = response.data.welcomeMessage || ''
      landingPageUrl.value = response.data.landingPageUrl || 'waitplay.io/store/demo123'

      localStorage.setItem('waitplay_landing_settings', JSON.stringify(response.data))
      return
    }
  } catch (error) {
    console.warn('Failed to load settings from backend, trying localStorage:', error)
  }

  // Fallback to localStorage
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
    storeName.value = 'WaitPlay 데모 매장'
    welcomeMessage.value = '환영합니다! QR 코드를 스캔하여 대기열에 참여하세요.'
  }
}

const fetchQRCodes = async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get('/api/qrcode')
    console.log('QR codes fetched:', response.data)
    qrCodes.value = response.data

    if (qrCodes.value.length > 0 && !selectedQR.value) {
      selectedQR.value = qrCodes.value[0] || null
      console.log('Selected first QR code:', selectedQR.value)
    }
  } catch (error) {
    console.error('Failed to fetch QR codes:', error)
    alert('QR 코드 목록을 불러오는데 실패했습니다')
  } finally {
    isLoading.value = false
  }
}

// Save settings for specific QR code
const saveSettings = async () => {
  if (!selectedQR.value) {
    alert('QR 코드를 먼저 선택해주세요.')
    return
  }

  try {
    const settingsData = {
      storeName: storeName.value,
      logoUrl: logoUrl.value,
      welcomeMessage: welcomeMessage.value
    }

    const response = await apiClient.post(`/api/landingpage/settings/${selectedQR.value.id}`, settingsData)

    if (response.data.landingPageUrl) {
      landingPageUrl.value = response.data.landingPageUrl
    }

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
    if (file.size > 2 * 1024 * 1024) {
      alert('파일 크기는 2MB 이하여야 합니다.')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/api/fileupload/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        logoUrl.value = response.data.fileUrl
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

// Generate QR code image
const generateQRImage = async (url: string) => {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 4,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    qrImageUrl.value = dataUrl
  } catch (error) {
    console.error('Failed to generate QR code:', error)
  }
}

// Watch for selectedQR changes
watch(selectedQR, (newQR) => {
  console.log('selectedQR changed:', newQR)
  if (newQR && newQR.qrCodeUrl) {
    console.log('Generating QR code for URL:', newQR.qrCodeUrl)
    generateQRImage(newQR.qrCodeUrl)
  } else {
    console.log('No QR code URL available')
    qrImageUrl.value = ''
  }
}, { immediate: true })

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
              font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
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

// Watch for QR code selection changes and reload settings
watch(selectedQR, (newQR, oldQR) => {
  if (newQR && newQR.id !== oldQR?.id) {
    console.log('QR code selection changed, loading settings for:', newQR.id)
    loadSettings()
  }
})

onMounted(async () => {
  await fetchQRCodes()
  // loadSettings will be called automatically when selectedQR is set in fetchQRCodes
  loadGameSettings()
})
</script>

<style scoped>
/* --- Apple Style Design System --- */
:root {
  --primary-blue: #0071e3;
  --primary-dark: #0077ed;
  --bg-gray: #f5f5f7;
  --box-bg: #ffffff;
  --border-color: #d2d2d7;
  --border-light: #e5e5ea;
  --text-dark: #1d1d1f;
  --text-gray: #86868b;
  --text-light-gray: #aeaeb2;
  --card-radius: 20px;
  --btn-radius: 12px;
}

* {
  box-sizing: border-box;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
}

.tab-content {
  padding: 50px 60px;
  background-color: #f5f5f7;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 10px;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

.page-desc {
  color: #86868b;
  font-size: 16px;
}

/* Main Grid Layout */
.qr-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 30px;
  align-items: start;
}

/* Card Styles */
.card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  padding: 30px;
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-svg {
  width: 24px;
  height: 24px;
}

.text-blue {
  color: #0071e3;
}

/* Settings Form */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d2d2d7;
  border-radius: 10px;
  font-size: 14px;
  color: #1d1d1f;
  background: white;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

/* Logo Upload */
.logo-upload-container {
  width: 100%;
}

.logo-preview-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-preview {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: 2px solid #e5e5ea;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-actions {
  display: flex;
  gap: 8px;
}

.btn-logo-change,
.btn-logo-remove {
  padding: 8px 16px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logo-change:hover {
  background: #f5f5f7;
  border-color: #0071e3;
  color: #0071e3;
}

.btn-logo-remove {
  color: #ff3b30;
  border-color: #ff3b30;
}

.btn-logo-remove:hover {
  background: #fff0f2;
}

.logo-upload-box {
  width: 100%;
  height: 140px;
  border: 2px dashed #d2d2d7;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #f5f5f7;
  transition: all 0.2s;
}

.logo-upload-box:hover {
  border-color: #0071e3;
  background: #e8f2ff;
}

.upload-icon {
  font-size: 32px;
  color: #86868b;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.upload-hint {
  font-size: 12px;
  color: #86868b;
  margin: 4px 0 0 0;
}

/* Active Games Summary */
.active-games-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.game-chip {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: #e8f2ff;
  color: #0071e3;
}

.game-chip-disabled {
  background: #f5f5f7;
  color: #86868b;
}

.settings-hint {
  font-size: 12px;
  color: #86868b;
  margin: 4px 0 0 0;
}

/* Save Button */
.btn-save-settings {
  width: 100%;
  padding: 14px;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
}

.btn-save-settings:hover {
  background: #0077ed;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 113, 227, 0.4);
}

/* Right Column */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* QR Preview */
.qr-subtitle {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 20px 0;
}

.qr-preview-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.qr-frame {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 1;
  background: #f5f5f7;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-placeholder-svg {
  width: 100%;
  height: 100%;
}

/* QR Actions */
.qr-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.btn-qr-download,
.btn-qr-print {
  padding: 12px;
  border: 1px solid #d2d2d7;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-qr-download:hover,
.btn-qr-print:hover {
  background: #f5f5f7;
  border-color: #0071e3;
  color: #0071e3;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* QR Info Box */
.qr-info-box {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: #86868b;
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
  text-align: right;
  word-break: break-all;
}

.qr-url-link {
  color: #0071e3;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.qr-url-link:hover {
  text-decoration: underline;
}

/* Advanced Settings Card */
.advanced-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.advanced-card .card-title {
  color: white;
}

.advanced-card .text-blue {
  color: white;
}

.advanced-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.btn-layout-manager {
  width: 100%;
  background: white;
  color: #667eea;
  border: none;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-layout-manager:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.btn-icon-right {
  width: 16px;
  height: 16px;
}

/* Responsive */
@media (max-width: 1200px) {
  .qr-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .tab-content {
    padding: 30px 20px;
  }

  .qr-actions {
    grid-template-columns: 1fr;
  }
}
</style>
