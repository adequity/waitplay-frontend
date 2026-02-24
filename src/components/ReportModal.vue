<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="report-overlay" @click.self="close">
        <div class="report-container">
          <div class="report-header">
            <h3 class="report-title">신고하기</h3>
            <button class="btn-close" @click="close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="report-body">
            <p class="report-desc">부적절한 콘텐츠나 문제를 발견하셨다면 알려주세요.</p>
            <textarea
              ref="textareaRef"
              v-model="content"
              class="report-textarea"
              placeholder="신고 내용을 입력해주세요 (5자 이상)"
              rows="5"
              maxlength="1000"
              :disabled="isSubmitting || isSubmitted"
            ></textarea>
            <div class="char-count">{{ content.length }} / 1000</div>

            <div v-if="error" class="report-error">{{ error }}</div>

            <div v-if="isSubmitted" class="report-success">
              신고가 접수되었습니다. 검토 후 조치하겠습니다.
            </div>

            <button
              v-if="!isSubmitted"
              class="btn-submit"
              :disabled="content.trim().length < 5 || isSubmitting"
              @click="submit"
            >
              {{ isSubmitting ? '접수 중...' : '신고 접수' }}
            </button>
            <button v-else class="btn-submit btn-done" @click="close">
              확인
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import apiClient from '@/services/api'

interface Props {
  isOpen: boolean
  qrCodeId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const content = ref('')
const error = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

watch(() => props.isOpen, async (open) => {
  if (open) {
    content.value = ''
    error.value = ''
    isSubmitted.value = false
    await nextTick()
    textareaRef.value?.focus()
  }
})

async function submit() {
  if (content.value.trim().length < 5) return

  isSubmitting.value = true
  error.value = ''

  try {
    await apiClient.post('/api/reports', {
      content: content.value.trim(),
      qrCodeId: props.qrCodeId,
      pageUrl: window.location.href
    })
    isSubmitted.value = true
  } catch (err: any) {
    error.value = err.response?.data?.message || '신고 접수에 실패했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
.report-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
  padding: 20px;
}

.report-container {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.report-title {
  font-size: 17px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #86868b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.report-body {
  padding: 20px;
}

.report-desc {
  font-size: 14px;
  color: #6e6e73;
  margin: 0 0 12px;
}

.report-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d2d2d7;
  border-radius: 10px;
  font-size: 14px;
  color: #1d1d1f;
  resize: none;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.report-textarea:focus {
  border-color: #3b82f6;
}

.report-textarea:disabled {
  background: #f5f5f7;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #aeaeb2;
  margin-top: 4px;
}

.report-error {
  margin-top: 12px;
  padding: 10px;
  background: #fff5f5;
  border: 1px solid #ff3b30;
  border-radius: 8px;
  color: #ff3b30;
  font-size: 13px;
}

.report-success {
  margin-top: 12px;
  padding: 10px;
  background: #f0fdf4;
  border: 1px solid #22c55e;
  border-radius: 8px;
  color: #16a34a;
  font-size: 13px;
  text-align: center;
}

.btn-submit {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  background: #ff3b30;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-done {
  background: #3b82f6;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
