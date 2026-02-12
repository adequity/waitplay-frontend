<template>
  <div class="settings-management">
    <header class="page-header">
      <h1>설정</h1>
      <p class="subtitle">서비스 정책 및 약관을 관리합니다</p>
    </header>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>정책 정보를 불러오는 중...</p>
    </div>

    <template v-else>
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
              <span class="label">현재 버전</span>
              <span class="value">{{ activePrivacyPolicy?.version || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">시행일</span>
              <span class="value">{{ formatDate(activePrivacyPolicy?.effectiveDate) }}</span>
            </div>
            <div class="info-row">
              <span class="label">상태</span>
              <span :class="['status', activePrivacyPolicy?.isActive ? 'active' : 'inactive']">
                {{ activePrivacyPolicy?.isActive ? '게시중' : '미게시' }}
              </span>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-secondary" @click="previewPolicy('privacy')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              미리보기
            </button>
            <button class="btn-primary" @click="openEditor('privacy')">
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
              <span class="label">현재 버전</span>
              <span class="value">{{ activeTermsPolicy?.version || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">시행일</span>
              <span class="value">{{ formatDate(activeTermsPolicy?.effectiveDate) }}</span>
            </div>
            <div class="info-row">
              <span class="label">상태</span>
              <span :class="['status', activeTermsPolicy?.isActive ? 'active' : 'inactive']">
                {{ activeTermsPolicy?.isActive ? '게시중' : '미게시' }}
              </span>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-secondary" @click="previewPolicy('terms')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              미리보기
            </button>
            <button class="btn-primary" @click="openEditor('terms')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              수정하기
            </button>
          </div>
        </div>
      </div>

      <!-- 버전 이력 섹션 -->
      <section class="version-history-section">
        <div class="section-header">
          <h2>버전 이력</h2>
          <div class="tab-buttons">
            <button
              :class="['tab-btn', { active: historyTab === 'privacy' }]"
              @click="historyTab = 'privacy'"
            >
              개인정보처리방침
            </button>
            <button
              :class="['tab-btn', { active: historyTab === 'terms' }]"
              @click="historyTab = 'terms'"
            >
              이용약관
            </button>
          </div>
        </div>

        <div class="history-table-container">
          <table class="history-table">
            <thead>
              <tr>
                <th>버전</th>
                <th>제목</th>
                <th>시행일</th>
                <th>변경 내용</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="policy in currentHistoryList" :key="policy.id">
                <td class="version-cell">{{ policy.version }}</td>
                <td>{{ policy.title }}</td>
                <td>{{ formatDate(policy.effectiveDate) }}</td>
                <td class="summary-cell">{{ policy.changeSummary || '-' }}</td>
                <td>
                  <span :class="['status-badge', policy.isActive ? 'active' : 'inactive']">
                    {{ policy.isActive ? '활성' : '비활성' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="action-btn" @click="viewPolicyDetail(policy)" title="상세보기">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button
                    v-if="!policy.isActive"
                    class="action-btn activate"
                    @click="activatePolicy(policy)"
                    title="활성화"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                  </button>
                  <button
                    v-if="!policy.isActive"
                    class="action-btn delete"
                    @click="confirmDeletePolicy(policy)"
                    title="삭제"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr v-if="currentHistoryList.length === 0">
                <td colspan="6" class="empty-row">등록된 정책이 없습니다</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- 에디터 모달 -->
    <div v-if="showEditor" class="modal-overlay" @click.self="closeEditor">
      <div class="modal-content editor-modal">
        <div class="modal-header">
          <h2>{{ isNewVersion ? '새 버전 작성' : '정책 수정' }} - {{ editorType === 'privacy' ? '개인정보처리방침' : '이용약관' }}</h2>
          <button class="close-btn" @click="closeEditor">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>제목 <span class="required">*</span></label>
            <input
              v-model="editorForm.title"
              type="text"
              placeholder="정책 제목을 입력하세요"
              class="form-input"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>버전 <span class="required">*</span></label>
              <input
                v-model="editorForm.version"
                type="text"
                placeholder="예: 1.0, 2.0"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>시행일</label>
              <input
                v-model="editorForm.effectiveDate"
                type="date"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>변경 요약</label>
            <input
              v-model="editorForm.changeSummary"
              type="text"
              placeholder="주요 변경 내용을 간략히 입력하세요"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>내용 <span class="required">*</span></label>
            <div class="editor-toolbar">
              <button type="button" @click="insertTag('h2')" title="제목">H2</button>
              <button type="button" @click="insertTag('h3')" title="소제목">H3</button>
              <button type="button" @click="insertTag('p')" title="단락">P</button>
              <button type="button" @click="insertTag('ul')" title="목록">UL</button>
              <button type="button" @click="insertTag('strong')" title="굵게">B</button>
            </div>
            <textarea
              ref="contentTextarea"
              v-model="editorForm.content"
              placeholder="HTML 형식으로 정책 내용을 입력하세요"
              class="form-textarea"
              rows="15"
            ></textarea>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input v-model="editorForm.isActive" type="checkbox" />
              <span>즉시 활성화 (현재 활성화된 정책을 대체합니다)</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeEditor">취소</button>
          <button class="btn-preview" @click="previewEditorContent">미리보기</button>
          <button class="btn-save" @click="savePolicy" :disabled="saving">
            {{ saving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 미리보기 모달 -->
    <div v-if="showPreview" class="modal-overlay" @click.self="closePreview">
      <div class="modal-content preview-modal">
        <div class="modal-header">
          <h2>{{ previewTitle }}</h2>
          <button class="close-btn" @click="closePreview">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body preview-body">
          <div class="preview-meta" v-if="previewMeta">
            <span class="meta-item">버전: {{ previewMeta.version }}</span>
            <span class="meta-item">시행일: {{ formatDate(previewMeta.effectiveDate) }}</span>
          </div>
          <div class="preview-content" v-html="previewContent"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closePreview">닫기</button>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h2>정책 삭제</h2>
        </div>
        <div class="modal-body">
          <p>정말로 이 정책을 삭제하시겠습니까?</p>
          <p class="warning-text">버전 {{ policyToDelete?.version }} - {{ policyToDelete?.title }}</p>
          <p class="note">※ 삭제된 정책은 복구할 수 없습니다.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="cancelDelete">취소</button>
          <button class="btn-delete" @click="deletePolicy" :disabled="deleting">
            {{ deleting ? '삭제 중...' : '삭제' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import policyService, { type PolicyDocument, type CreatePolicyRequest, type UpdatePolicyRequest } from '@/services/policyService'

// 상태
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)

// 정책 데이터
const privacyPolicies = ref<PolicyDocument[]>([])
const termsPolicies = ref<PolicyDocument[]>([])

// 활성화된 정책
const activePrivacyPolicy = computed(() => privacyPolicies.value.find(p => p.isActive))
const activeTermsPolicy = computed(() => termsPolicies.value.find(p => p.isActive))

// 버전 이력 탭
const historyTab = ref<'privacy' | 'terms'>('privacy')
const currentHistoryList = computed(() =>
  historyTab.value === 'privacy' ? privacyPolicies.value : termsPolicies.value
)

// 에디터 모달
const showEditor = ref(false)
const editorType = ref<'privacy' | 'terms'>('privacy')
const isNewVersion = ref(true)
const editingPolicyId = ref<string | null>(null)
const editorForm = ref({
  title: '',
  version: '',
  effectiveDate: '',
  changeSummary: '',
  content: '',
  isActive: false
})
const contentTextarea = ref<HTMLTextAreaElement | null>(null)

// 미리보기 모달
const showPreview = ref(false)
const previewTitle = ref('')
const previewContent = ref('')
const previewMeta = ref<{ version: string; effectiveDate: string } | null>(null)

// 삭제 확인 모달
const showDeleteConfirm = ref(false)
const policyToDelete = ref<PolicyDocument | null>(null)

// 데이터 로드
async function loadPolicies() {
  try {
    loading.value = true
    const allPolicies = await policyService.getPolicies()
    privacyPolicies.value = allPolicies
      .filter(p => p.policyType === 'privacy')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    termsPolicies.value = allPolicies
      .filter(p => p.policyType === 'terms')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error('정책 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 날짜 포맷
function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 에디터 열기
function openEditor(type: 'privacy' | 'terms') {
  editorType.value = type
  isNewVersion.value = true
  editingPolicyId.value = null

  const activePolicy = type === 'privacy' ? activePrivacyPolicy.value : activeTermsPolicy.value
  const nextVersion = getNextVersion(type === 'privacy' ? privacyPolicies.value : termsPolicies.value)

  editorForm.value = {
    title: activePolicy?.title ?? (type === 'privacy' ? '개인정보처리방침' : '이용약관'),
    version: nextVersion,
    effectiveDate: new Date().toISOString().split('T')[0] as string,
    changeSummary: '',
    content: activePolicy?.content ?? getDefaultContent(type),
    isActive: false
  }

  showEditor.value = true
}

// 다음 버전 계산
function getNextVersion(policies: PolicyDocument[]): string {
  if (policies.length === 0) return '1.0'
  const versions = policies.map(p => {
    const versionStr = p.version || '1.0'
    const parts = versionStr.split('.')
    const major = parts[0] ? parseFloat(parts[0]) : 1
    const minor = parts[1] ? parseFloat(parts[1]) / 10 : 0
    return major + minor
  })
  const maxVersion = Math.max(...versions)
  return (Math.floor(maxVersion) + 1) + '.0'
}

// 기본 내용
function getDefaultContent(type: 'privacy' | 'terms'): string {
  if (type === 'privacy') {
    return `<h2>개인정보처리방침</h2>
<p>WaitPlay(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보보호법」을 준수하고 있습니다.</p>

<h3>1. 수집하는 개인정보 항목</h3>
<p>회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다.</p>
<ul>
  <li>필수항목: 이름, 이메일 주소, 연락처</li>
  <li>선택항목: 프로필 이미지</li>
</ul>

<h3>2. 개인정보의 수집 및 이용목적</h3>
<p>수집한 개인정보는 다음의 목적을 위해 이용됩니다.</p>

<h3>3. 개인정보의 보유 및 이용기간</h3>
<p>회사는 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.</p>`
  } else {
    return `<h2>이용약관</h2>

<h3>제1조 (목적)</h3>
<p>본 약관은 WaitPlay(이하 "회사")가 제공하는 서비스의 이용조건 및 절차, 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>

<h3>제2조 (정의)</h3>
<p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
<ul>
  <li>"서비스"란 회사가 제공하는 모든 서비스를 의미합니다.</li>
  <li>"이용자"란 본 약관에 따라 서비스를 이용하는 자를 의미합니다.</li>
</ul>

<h3>제3조 (약관의 효력 및 변경)</h3>
<p>본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.</p>`
  }
}

// 에디터 닫기
function closeEditor() {
  showEditor.value = false
}

// HTML 태그 삽입
function insertTag(tag: string) {
  const textarea = contentTextarea.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = editorForm.value.content.substring(start, end)

  let insertText = ''
  if (tag === 'ul') {
    insertText = `<ul>\n  <li>${selectedText || '항목'}</li>\n</ul>`
  } else {
    insertText = `<${tag}>${selectedText || ''}</${tag}>`
  }

  editorForm.value.content =
    editorForm.value.content.substring(0, start) +
    insertText +
    editorForm.value.content.substring(end)

  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + insertText.length, start + insertText.length)
  }, 0)
}

// 정책 저장
async function savePolicy() {
  if (!editorForm.value.title || !editorForm.value.version || !editorForm.value.content) {
    alert('필수 항목을 모두 입력해주세요.')
    return
  }

  try {
    saving.value = true

    const request: CreatePolicyRequest = {
      policyType: editorType.value,
      title: editorForm.value.title,
      version: editorForm.value.version,
      content: editorForm.value.content,
      isActive: editorForm.value.isActive,
      effectiveDate: editorForm.value.effectiveDate || undefined,
      changeSummary: editorForm.value.changeSummary || undefined
    }

    await policyService.createPolicy(request)
    await loadPolicies()
    closeEditor()
    alert('정책이 저장되었습니다.')
  } catch (error: any) {
    console.error('정책 저장 실패:', error)
    alert(error.response?.data?.message || '정책 저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

// 미리보기
function previewPolicy(type: 'privacy' | 'terms') {
  const policy = type === 'privacy' ? activePrivacyPolicy.value : activeTermsPolicy.value
  if (!policy) {
    alert('활성화된 정책이 없습니다.')
    return
  }

  previewTitle.value = policy.title
  previewContent.value = policy.content
  previewMeta.value = {
    version: policy.version,
    effectiveDate: policy.effectiveDate
  }
  showPreview.value = true
}

// 에디터 내용 미리보기
function previewEditorContent() {
  previewTitle.value = editorForm.value.title || '미리보기'
  previewContent.value = editorForm.value.content
  previewMeta.value = {
    version: editorForm.value.version,
    effectiveDate: editorForm.value.effectiveDate
  }
  showPreview.value = true
}

// 정책 상세 보기
function viewPolicyDetail(policy: PolicyDocument) {
  previewTitle.value = policy.title
  previewContent.value = policy.content
  previewMeta.value = {
    version: policy.version,
    effectiveDate: policy.effectiveDate
  }
  showPreview.value = true
}

// 미리보기 닫기
function closePreview() {
  showPreview.value = false
  previewMeta.value = null
}

// 정책 활성화
async function activatePolicy(policy: PolicyDocument) {
  if (!confirm(`버전 ${policy.version}을 활성화하시겠습니까?\n현재 활성화된 정책은 비활성화됩니다.`)) {
    return
  }

  try {
    await policyService.togglePolicyActive(policy.id)
    await loadPolicies()
    alert('정책이 활성화되었습니다.')
  } catch (error: any) {
    console.error('정책 활성화 실패:', error)
    alert(error.response?.data?.message || '정책 활성화에 실패했습니다.')
  }
}

// 삭제 확인
function confirmDeletePolicy(policy: PolicyDocument) {
  policyToDelete.value = policy
  showDeleteConfirm.value = true
}

// 삭제 취소
function cancelDelete() {
  policyToDelete.value = null
  showDeleteConfirm.value = false
}

// 정책 삭제
async function deletePolicy() {
  if (!policyToDelete.value) return

  try {
    deleting.value = true
    await policyService.deletePolicy(policyToDelete.value.id)
    await loadPolicies()
    cancelDelete()
    alert('정책이 삭제되었습니다.')
  } catch (error: any) {
    console.error('정책 삭제 실패:', error)
    alert(error.response?.data?.message || '정책 삭제에 실패했습니다.')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadPolicies()
})
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e8e6e1;
  border-top-color: #d4a853;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
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

.status.inactive {
  background: #fef3c7;
  color: #d97706;
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

/* 버전 이력 섹션 */
.version-history-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e8e6e1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.tab-buttons {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #1d1d1f;
  border-color: #1d1d1f;
  color: white;
}

.history-table-container {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e8e6e1;
}

.history-table th {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
}

.history-table td {
  font-size: 14px;
  color: #1d1d1f;
}

.version-cell {
  font-weight: 600;
  color: #6366f1 !important;
}

.summary-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.inactive {
  background: #f1f5f9;
  color: #64748b;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.action-btn.activate:hover {
  background: #dcfce7;
  color: #16a34a;
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

.empty-row {
  text-align: center;
  color: #86868b;
  padding: 40px 16px !important;
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
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.editor-modal {
  max-width: 800px;
}

.preview-modal {
  max-width: 700px;
}

.confirm-modal {
  max-width: 400px;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.required {
  color: #dc2626;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #d4a853;
  box-shadow: 0 0 0 3px rgba(212, 168, 83, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.editor-toolbar button {
  padding: 6px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.editor-toolbar button:hover {
  background: #e2e8f0;
  color: #334155;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', monospace;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #d4a853;
  box-shadow: 0 0 0 3px rgba(212, 168, 83, 0.1);
}

.checkbox-group {
  margin-top: 24px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: #d4a853;
}

.checkbox-label span {
  font-size: 14px;
  color: #475569;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e8e6e1;
}

.btn-cancel,
.btn-preview,
.btn-save,
.btn-delete {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-preview {
  background: white;
  border: 1px solid #d4a853;
  color: #d4a853;
}

.btn-preview:hover {
  background: #fef7e6;
}

.btn-save {
  background: linear-gradient(135deg, #d4a853 0%, #b8942e 100%);
  border: none;
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 168, 83, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-delete {
  background: #dc2626;
  border: none;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Preview styles */
.preview-body {
  max-height: 60vh;
}

.preview-meta {
  display: flex;
  gap: 20px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 20px;
}

.meta-item {
  font-size: 13px;
  color: #64748b;
}

.preview-content {
  line-height: 1.8;
  color: #1d1d1f;
}

.preview-content :deep(h2) {
  font-size: 20px;
  font-weight: 600;
  margin: 24px 0 12px;
}

.preview-content :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 10px;
}

.preview-content :deep(p) {
  margin: 12px 0;
}

.preview-content :deep(ul) {
  margin: 12px 0;
  padding-left: 24px;
}

.preview-content :deep(li) {
  margin: 6px 0;
}

/* Confirm modal */
.confirm-modal .modal-body p {
  margin: 0 0 12px;
  color: #1d1d1f;
}

.warning-text {
  font-weight: 600;
  color: #dc2626 !important;
}

.note {
  font-size: 13px;
  color: #86868b !important;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-wrap: wrap;
  }
}
</style>
