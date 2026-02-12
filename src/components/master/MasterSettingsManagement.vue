<template>
  <div class="settings-management">
    <header class="page-header">
      <h1>설정</h1>
      <p class="subtitle">서비스 정책 및 약관을 관리합니다</p>
    </header>

    <div class="settings-grid">
      <!-- 개인정보처리방침 카드 -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon privacy">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="card-title">
            <h2>개인정보처리방침</h2>
            <p>개인정보 수집, 이용, 보관에 관한 정책</p>
          </div>
        </div>

        <div class="card-info">
          <div class="info-row">
            <span class="label">최종 수정일</span>
            <span class="value">{{ privacyLastModified }}</span>
          </div>
          <div class="info-row">
            <span class="label">상태</span>
            <span class="status active">게시중</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-secondary" @click="previewPrivacy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            미리보기
          </button>
          <button class="btn-primary" @click="openPrivacyEditor">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            수정하기
          </button>
        </div>
      </div>

      <!-- 이용약관 카드 -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon terms">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <div class="card-title">
            <h2>이용약관</h2>
            <p>서비스 이용에 관한 조건 및 규정</p>
          </div>
        </div>

        <div class="card-info">
          <div class="info-row">
            <span class="label">최종 수정일</span>
            <span class="value">{{ termsLastModified }}</span>
          </div>
          <div class="info-row">
            <span class="label">상태</span>
            <span class="status active">게시중</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-secondary" @click="previewTerms">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            미리보기
          </button>
          <button class="btn-primary" @click="openTermsEditor">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            수정하기
          </button>
        </div>
      </div>
    </div>

    <!-- 에디터 모달 -->
    <div v-if="showEditor" class="modal-overlay" @click.self="closeEditor">
      <div class="modal-content editor-modal">
        <div class="modal-header">
          <h2>{{ editorType === 'privacy' ? '개인정보처리방침 수정' : '이용약관 수정' }}</h2>
          <button class="close-btn" @click="closeEditor">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="editor-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>정책 내용을 수정하려면 <code>src/views/{{ editorType === 'privacy' ? 'PrivacyPolicyView.vue' : 'TermsOfServiceView.vue' }}</code> 파일을 직접 수정해주세요.</p>
          </div>

          <div class="quick-links">
            <h3>빠른 링크</h3>
            <div class="link-buttons">
              <a :href="editorType === 'privacy' ? '/privacy' : '/terms'" target="_blank" class="link-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15,3 21,3 21,9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                새 탭에서 열기
              </a>
            </div>
          </div>

          <div class="version-history">
            <h3>수정 이력</h3>
            <div class="history-list">
              <div class="history-item">
                <span class="date">2024.01.01</span>
                <span class="desc">초기 버전 작성</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeEditor">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const privacyLastModified = ref('2024.01.01')
const termsLastModified = ref('2024.01.01')

const showEditor = ref(false)
const editorType = ref<'privacy' | 'terms'>('privacy')

function previewPrivacy() {
  window.open('/privacy', '_blank')
}

function previewTerms() {
  window.open('/terms', '_blank')
}

function openPrivacyEditor() {
  editorType.value = 'privacy'
  showEditor.value = true
}

function openTermsEditor() {
  editorType.value = 'terms'
  showEditor.value = true
}

function closeEditor() {
  showEditor.value = false
}
</script>

<style scoped>
.settings-management {
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

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.settings-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e8e6e1;
  transition: all 0.2s;
}

.settings-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon.privacy {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
}

.card-icon.terms {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.card-title h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.card-title p {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.card-info {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-row + .info-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e6e1;
}

.info-row .label {
  font-size: 14px;
  color: #86868b;
}

.info-row .value {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.status.active {
  background: #dcfce7;
  color: #16a34a;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: linear-gradient(135deg, #d4a853 0%, #b8942e 100%);
  border: none;
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 168, 83, 0.4);
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

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e6e1;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.editor-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fef3c7;
  border-radius: 12px;
  margin-bottom: 24px;
}

.editor-notice svg {
  flex-shrink: 0;
  color: #d97706;
  margin-top: 2px;
}

.editor-notice p {
  font-size: 14px;
  color: #92400e;
  margin: 0;
  line-height: 1.5;
}

.editor-notice code {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.quick-links h3,
.version-history h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

.link-buttons {
  display: flex;
  gap: 12px;
}

.link-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 14px;
  color: #475569;
  text-decoration: none;
  transition: all 0.2s;
}

.link-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.version-history {
  margin-top: 24px;
}

.history-list {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 16px;
}

.history-item {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.history-item .date {
  color: #64748b;
  font-weight: 500;
}

.history-item .desc {
  color: #334155;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e8e6e1;
}

.btn-cancel {
  padding: 10px 20px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>
