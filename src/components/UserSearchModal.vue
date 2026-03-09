<template>
  <Teleport to="body">
    <Transition name="search-fade">
      <div v-if="visible" class="search-overlay" @click.self="close">
        <div class="search-modal">
          <div class="search-header">
            <div class="search-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86868b" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref="searchInput"
                v-model="query"
                type="text"
                placeholder="닉네임 또는 회사명 검색"
                class="search-input"
                @input="onInput"
              />
              <button v-if="query" class="search-clear" @click="query = ''; results = []">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              </button>
            </div>
            <button class="search-cancel" @click="close">취소</button>
          </div>

          <div class="search-body">
            <div v-if="isLoading" class="search-loading">
              <div class="spinner-sm"></div>
            </div>
            <div v-else-if="query && results.length === 0 && searched" class="search-empty">
              <p>검색 결과가 없습니다</p>
            </div>
            <div v-else class="search-results">
              <div
                v-for="user in results"
                :key="user.profileCode"
                class="search-user-item"
                @click="goToProfile(user.profileCode)"
              >
                <div class="search-user-avatar">
                  <img v-if="user.profileImageUrl" :src="user.profileImageUrl" :alt="user.nickname" class="search-avatar-img"/>
                  <div v-else class="search-avatar-placeholder">{{ user.nickname?.charAt(0) || '?' }}</div>
                </div>
                <div class="search-user-info">
                  <span class="search-user-name">{{ user.nickname }}</span>
                  <span v-if="user.companyName" class="search-user-company">{{ user.companyName }}</span>
                </div>
              </div>
              <button v-if="hasMore" class="search-load-more" @click="loadMore" :disabled="isLoading">
                더 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import userSearchService from '@/services/userSearchService'
import type { SearchUserResult } from '@/services/userSearchService'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const router = useRouter()
const searchInput = ref<HTMLInputElement | null>(null)
const query = ref('')
const results = ref<SearchUserResult[]>([])
const isLoading = ref(false)
const hasMore = ref(false)
const searched = ref(false)
const page = ref(1)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.visible, (val) => {
  if (val) {
    query.value = ''
    results.value = []
    searched.value = false
    page.value = 1
    nextTick(() => searchInput.value?.focus())
  }
})

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    page.value = 1
    results.value = []
    search()
  }, 300)
}

async function search() {
  const q = query.value.trim()
  if (!q) {
    results.value = []
    searched.value = false
    return
  }
  isLoading.value = true
  try {
    const data = await userSearchService.search(q, page.value)
    if (page.value === 1) {
      results.value = data.users
    } else {
      results.value.push(...data.users)
    }
    hasMore.value = data.hasMore
    searched.value = true
  } catch { /* silent */ }
  finally { isLoading.value = false }
}

function loadMore() {
  page.value++
  search()
}

function goToProfile(profileCode: string) {
  emit('close')
  window.location.href = `/u/${profileCode}`
}

function close() {
  emit('close')
}
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 10002;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 0;
}
.search-modal {
  width: 100%;
  max-width: 480px;
  background: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.search-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #efefef;
  background: white;
  position: sticky;
  top: 0;
  z-index: 1;
}
.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 8px 12px;
}
.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 15px;
  outline: none;
  color: #1d1d1f;
}
.search-input::placeholder {
  color: #aeaeb2;
}
.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: #86868b;
  display: flex;
  padding: 0;
}
.search-cancel {
  background: none;
  border: none;
  font-size: 15px;
  color: #0095f6;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  padding: 4px;
}
.search-body {
  flex: 1;
  overflow-y: auto;
}
.search-loading {
  display: flex;
  justify-content: center;
  padding: 32px;
}
.spinner-sm {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top-color: #0095f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.search-empty {
  text-align: center;
  padding: 40px 20px;
  color: #86868b;
  font-size: 14px;
}
.search-results {
  display: flex;
  flex-direction: column;
}
.search-user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
}
.search-user-item:hover {
  background: #fafafa;
}
.search-user-item:not(:last-child) {
  border-bottom: 1px solid #f5f5f5;
}
.search-user-avatar {
  flex-shrink: 0;
}
.search-avatar-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}
.search-avatar-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
}
.search-user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.search-user-name {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}
.search-user-company {
  font-size: 13px;
  color: #86868b;
}
.search-load-more {
  padding: 12px;
  background: none;
  border: none;
  border-top: 1px solid #f5f5f5;
  color: #0095f6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.search-load-more:disabled {
  opacity: 0.5;
}
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.2s;
}
.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}
</style>
