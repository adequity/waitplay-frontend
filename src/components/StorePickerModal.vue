<template>
  <Teleport to="body">
    <div class="store-picker-overlay" @click.self="$emit('close')">
      <div class="store-picker-modal">
        <div class="store-picker-header">
          <h3>매장 배치</h3>
          <button class="store-picker-close" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div v-if="isLoading" class="store-picker-loading">
          <div class="store-picker-spinner"></div>
          <span>매장 목록 불러오는 중...</span>
        </div>

        <div v-else-if="stores.length === 0" class="store-picker-empty">
          <p>배치할 수 있는 매장이 없습니다</p>
          <p class="store-picker-hint">팔로우한 매장 중 아직 빌리지에 배치하지 않은 매장이 여기 표시됩니다</p>
        </div>

        <div v-else class="store-picker-list">
          <button
            v-for="store in stores"
            :key="store.adminId"
            class="store-picker-item"
            @click="$emit('select', store.adminId)"
          >
            <div class="store-picker-avatar">
              <img
                v-if="store.storeProfileImage"
                :src="store.storeProfileImage"
                :alt="store.storeName"
              />
              <div v-else class="store-picker-avatar-placeholder">
                {{ store.storeName.charAt(0) }}
              </div>
            </div>
            <div class="store-picker-info">
              <span class="store-picker-name">{{ store.storeName }}</span>
              <span v-if="store.storeCode" class="store-picker-code">@{{ store.storeCode }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUnplacedStores, type UnplacedStore } from '@/services/storeRoomService'

defineEmits<{
  close: []
  select: [adminId: string]
}>()

const stores = ref<UnplacedStore[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    stores.value = await getUnplacedStores()
  } catch { /* silent */ } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.store-picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.store-picker-modal {
  background: #fff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.store-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.store-picker-header h3 {
  font-size: 17px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.store-picker-close {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #86868b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.store-picker-close:active {
  background: #f0f0f0;
}

.store-picker-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: #86868b;
  font-size: 14px;
}

.store-picker-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #6366F1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.store-picker-empty {
  padding: 40px 20px;
  text-align: center;
  color: #86868b;
}

.store-picker-empty p {
  margin: 0;
  font-size: 15px;
}

.store-picker-hint {
  margin-top: 8px !important;
  font-size: 13px !important;
  color: #aeaeb2 !important;
}

.store-picker-list {
  overflow-y: auto;
  padding: 8px 0;
  -webkit-overflow-scrolling: touch;
}

.store-picker-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 20px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.store-picker-item:active {
  background: #f5f5f7;
}

.store-picker-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0f0f0;
}

.store-picker-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.store-picker-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
}

.store-picker-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.store-picker-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-picker-code {
  font-size: 13px;
  color: #86868b;
}
</style>
