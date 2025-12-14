<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">시스템 설정</h1>
      <p class="page-desc">WaitPlay 본사 관리 시스템</p>
    </div>

    <!-- Main Card -->
    <div class="content-card">
      <!-- Toolbar -->
      <div class="card-toolbar">
        <div class="toolbar-left">
          <h2 class="card-label">시스템 설정</h2>
        </div>
        <div class="toolbar-right">
          <button class="btn-secondary" @click="resetSettings">초기화</button>
          <button class="btn-primary" @click="saveSettings">설정 저장</button>
        </div>
      </div>

      <!-- Settings Body -->
      <div class="settings-body">

        <!-- 1. Brand Management -->
        <div class="settings-section">
          <div class="section-header">
            <div class="title-group">
              <span class="section-icon">🎨</span>
              <h3 class="section-title">브랜드 관리</h3>
            </div>
            <button class="btn-text-blue">전체 가맹점 적용</button>
          </div>

          <div class="brand-grid">
            <!-- Logo Upload -->
            <div class="form-group logo-group">
              <label class="form-label">브랜드 로고</label>
              <div class="logo-upload-area" @click="triggerLogoUpload">
                <div v-if="form.logoUrl" class="logo-preview">
                  <img :src="form.logoUrl" alt="Brand Logo">
                  <button class="btn-remove-logo" @click.stop="removeLogo">✕</button>
                </div>
                <div v-else class="upload-placeholder">
                  <IconBase name="camera" class="camera-icon" />
                  <span>로고 없음</span>
                </div>
              </div>
              <button class="btn-upload" @click="triggerLogoUpload">
                <IconBase name="upload" class="upload-icon-small" /> 업로드
              </button>
              <input type="file" ref="logoInput" accept="image/*" hidden @change="handleLogoChange">
            </div>

            <!-- Brand Info Inputs -->
            <div class="brand-inputs">
              <div class="form-group">
                <label class="form-label">회사명</label>
                <input type="text" v-model="form.companyName" class="form-input" placeholder="회사명을 입력하세요">
              </div>

              <div class="form-group">
                <label class="form-label">브랜드 컬러</label>
                <div class="color-picker-wrapper">
                  <div class="color-preview" :style="{ backgroundColor: form.brandColor }"></div>
                  <button class="btn-pick-color" @click="triggerColorPicker">컬러 선택</button>
                  <input type="text" v-model="form.brandColor" class="form-input color-text">
                  <input type="color" ref="colorInput" v-model="form.brandColor" hidden>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Notification Settings -->
        <div class="settings-section">
          <div class="section-header">
            <div class="title-group">
              <span class="section-icon">🔔</span>
              <h3 class="section-title">알림 설정</h3>
            </div>
          </div>

          <div class="toggle-list">
            <div class="toggle-item">
              <div class="toggle-info">
                <h4 class="toggle-title">신규 가맹점 승인 요청</h4>
                <p class="toggle-desc">새로운 가맹점 가입 신청 시 알림</p>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="form.notifications.newFranchise">
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div class="toggle-info">
                <h4 class="toggle-title">CS 문의 등록</h4>
                <p class="toggle-desc">고객센터 문의 등록 시 알림</p>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="form.notifications.csInquiry">
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div class="toggle-info">
                <h4 class="toggle-title">일일 리포트 자동 발송</h4>
                <p class="toggle-desc">매일 운영 현황 리포트 이메일 발송</p>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="form.notifications.dailyReport">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- 3. Data Management -->
        <div class="settings-section">
          <div class="section-header">
            <div class="title-group">
              <span class="section-icon">💾</span>
              <h3 class="section-title">데이터 관리</h3>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">자동 백업 주기</label>
            <div class="select-wrapper">
              <select v-model="form.backupFrequency" class="form-select full-width">
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
              </select>
              <IconBase name="chevron-down" class="select-icon" />
            </div>
            <p class="form-hint">시스템 데이터를 자동으로 백업합니다</p>
          </div>

          <div class="backup-action">
            <button class="btn-download-backup">
              <div class="icon-box">⬇</div>
              <div class="btn-content">
                <span class="btn-title">데이터 백업 다운로드</span>
                <span class="btn-desc">현재 시스템 데이터를 백업합니다</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconBase from '@/components/IconBase.vue'

const logoInput = ref<HTMLInputElement | null>(null)
const colorInput = ref<HTMLInputElement | null>(null)

const form = ref({
  logoUrl: '',
  companyName: '웨잇플레이',
  brandColor: '#007AFF',
  notifications: {
    newFranchise: true,
    csInquiry: true,
    dailyReport: false
  },
  backupFrequency: 'weekly'
})

// Mock initial data for reset functionality
const initialForm = JSON.parse(JSON.stringify(form.value))

const triggerLogoUpload = () => {
  logoInput.value?.click()
}

const handleLogoChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    // Mock upload preview using FileReader
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.logoUrl = e.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  }
}

const removeLogo = () => {
  form.value.logoUrl = ''
  if (logoInput.value) logoInput.value.value = ''
}

const triggerColorPicker = () => {
  colorInput.value?.click()
}

const resetSettings = () => {
  if (confirm('모든 설정을 초기화하시겠습니까?')) {
    form.value = JSON.parse(JSON.stringify(initialForm))
  }
}

const saveSettings = () => {
  // In a real app, you would make an API call here
  console.log('Saving settings:', form.value)
  alert('시스템 설정이 저장되었습니다.')
}
</script>

<style>
/* Global CSS Variables */
:root {
  --primary-blue: #0071e3;
  --primary-dark: #0056b3;
  --text-dark: #1d1d1f;
  --text-gray: #86868b;
  --bg-body: #f5f5f7;
  --border-light: #e5e5ea;
  --border-color: #d2d2d7;

  /* Toggle Colors */
  --toggle-on: #34c759;
  --toggle-off: #e5e5ea;
}
</style>

<style scoped>
.tab-content { width: 100%; max-width: 1000px; margin: 0 auto; padding-top: 20px; }

/* Page Header */
.page-header { margin-bottom: 24px; }
.page-title { font-size: 28px; font-weight: 800; color: var(--text-dark); margin-bottom: 8px; letter-spacing: -0.5px; }
.page-desc { color: var(--text-gray); font-size: 15px; }

/* Content Card */
.content-card { background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02); overflow: hidden; margin-bottom: 40px; }
.card-toolbar { padding: 20px 32px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
.card-label { font-size: 18px; font-weight: 700; color: var(--text-dark); }
.toolbar-right { display: flex; gap: 10px; }

/* Buttons */
.btn-primary { padding: 10px 24px; background: var(--primary-blue); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 8px rgba(0, 113, 227, 0.25); }
.btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }
.btn-secondary { padding: 10px 20px; border: 1px solid var(--border-color); background: white; color: var(--text-dark); border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; transition: 0.2s; }
.btn-secondary:hover { background: #f5f5f7; }

/* Settings Body */
.settings-body { padding: 32px; display: flex; flex-direction: column; gap: 32px; }

/* Sections */
.settings-section { border: 1px solid var(--border-light); border-radius: 16px; padding: 24px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.title-group { display: flex; align-items: center; gap: 10px; }
.section-icon { font-size: 20px; }
.section-title { font-size: 16px; font-weight: 700; color: var(--text-dark); margin: 0; }
.btn-text-blue { background: var(--primary-blue); color: white; font-size: 13px; font-weight: 600; cursor: pointer; border: none; padding: 8px 14px; border-radius: 8px; transition: 0.2s; box-shadow: 0 2px 6px rgba(0, 113, 227, 0.2); }
.btn-text-blue:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0, 113, 227, 0.3); }

/* Brand Grid */
.brand-grid { display: grid; grid-template-columns: 240px 1fr; gap: 40px; }

/* Logo Upload */
.logo-group { display: flex; flex-direction: column; gap: 12px; }
.logo-upload-area { width: 100%; height: 160px; background: #f5f5f7; border: 2px dashed var(--border-color); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; overflow: hidden; transition: 0.2s; }
.logo-upload-area:hover { border-color: var(--primary-blue); background: #f0f7ff; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-gray); font-size: 13px; }
.camera-icon { font-size: 24px; opacity: 0.5; width: 24px; height: 24px; }

.logo-preview { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: white; }
.logo-preview img { max-width: 80%; max-height: 80%; object-fit: contain; }
.btn-remove-logo { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; }

.btn-upload { width: 100%; padding: 12px; background: var(--primary-blue); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 8px rgba(0, 113, 227, 0.2); }
.btn-upload:hover { background: var(--primary-dark); }
.upload-icon-small { width: 16px; height: 16px; }

/* Brand Inputs */
.brand-inputs { display: flex; flex-direction: column; gap: 24px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--text-dark); }
.form-input { padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; font-size: 15px; outline: none; transition: 0.2s; width: 100%; }
.form-input:focus { border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(0,113,227,0.1); }

/* Color Picker */
.color-picker-wrapper { display: flex; align-items: center; gap: 10px; }
.color-preview { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--border-color); box-shadow: 0 2px 4px rgba(0,0,0,0.1); background-color: #007AFF; }
.btn-pick-color { padding: 10px 16px; border: 1px solid var(--primary-blue); background: var(--primary-blue); border-radius: 10px; font-weight: 600; color: white; cursor: pointer; font-size: 13px; transition: 0.2s; box-shadow: 0 2px 6px rgba(0, 113, 227, 0.2); }
.btn-pick-color:hover { background: var(--primary-dark); border-color: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0, 113, 227, 0.3); }
.color-text { width: 120px; font-family: monospace; }

/* Notification Toggles */
.toggle-list { display: flex; flex-direction: column; gap: 16px; }
.toggle-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #f9f9fb; border-radius: 12px; border: 1px solid var(--border-light); }
.toggle-title { font-size: 15px; font-weight: 700; margin: 0 0 4px 0; color: var(--text-dark); }
.toggle-desc { font-size: 13px; color: var(--text-gray); margin: 0; }

/* iOS Switch */
.switch { position: relative; display: inline-block; width: 52px; height: 30px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--toggle-off); transition: .3s; border-radius: 34px; }
.slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
input:checked + .slider { background-color: var(--toggle-on); }
input:checked + .slider:before { transform: translateX(22px); }

/* Data Management */
.select-wrapper { position: relative; }
.form-select { width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 10px; font-size: 15px; appearance: none; background: white; cursor: pointer; color: var(--text-dark); }
.form-select:focus { outline: none; border-color: var(--primary-blue); }
.select-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-gray); pointer-events: none; }
.form-hint { font-size: 13px; color: var(--text-gray); margin-top: 6px; }

/* Backup Button */
.btn-download-backup { width: 100%; display: flex; align-items: center; gap: 16px; padding: 20px; background: #f9f9fb; border: 1px solid var(--border-light); border-radius: 12px; cursor: pointer; transition: 0.2s; text-align: left; margin-top: 10px; }
.btn-download-backup:hover { border-color: var(--primary-blue); background: #f0f7ff; }
.icon-box { font-size: 20px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.05); border: 1px solid var(--border-light); }
.btn-content { display: flex; flex-direction: column; gap: 2px; }
.btn-title { font-weight: 700; font-size: 15px; color: var(--text-dark); }
.btn-desc { font-size: 13px; color: var(--text-gray); }

/* Responsive */
@media (max-width: 768px) {
  .brand-grid { grid-template-columns: 1fr; }
  .logo-upload-area { height: 120px; }
  .content-card { margin-bottom: 20px; }
}
</style>
