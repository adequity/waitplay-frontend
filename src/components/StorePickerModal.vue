<template>
  <Teleport to="body">
    <div class="store-picker-overlay" @click.self="$emit('close')">
      <div class="store-picker-modal">
        <div class="store-picker-header">
          <h3>빌리지 배치</h3>
          <button class="store-picker-close" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- 탭 -->
        <div class="store-picker-tabs">
          <button
            class="store-picker-tab"
            :class="{ active: activeTab === 'store' }"
            @click="activeTab = 'store'"
          >매장</button>
          <button
            class="store-picker-tab"
            :class="{ active: activeTab === 'friend' }"
            @click="activeTab = 'friend'"
          >친구</button>
        </div>

        <div v-if="isLoading" class="store-picker-loading">
          <div class="store-picker-spinner"></div>
          <span>목록 불러오는 중...</span>
        </div>

        <!-- 매장 탭 -->
        <template v-else-if="activeTab === 'store'">
          <div v-if="stores.length === 0" class="store-picker-empty">
            <p>배치할 수 있는 매장이 없습니다</p>
            <p class="store-picker-hint">팔로우한 매장 중 아직 빌리지에 배치하지 않은 매장이 여기 표시됩니다</p>
          </div>
          <div v-else class="store-picker-list">
            <button
              v-for="store in stores"
              :key="store.adminId"
              class="store-picker-item"
              @click="$emit('select', { type: 'store', id: store.adminId })"
            >
              <div class="store-picker-avatar">
                <img v-if="store.storeProfileImage" :src="store.storeProfileImage" :alt="store.storeName" />
                <div v-else class="store-picker-avatar-placeholder store">
                  {{ store.storeName.charAt(0) }}
                </div>
              </div>
              <div class="store-picker-info">
                <span class="store-picker-name">{{ store.storeName }}</span>
                <span v-if="store.storeCode" class="store-picker-code">@{{ store.storeCode }}</span>
              </div>
            </button>
          </div>
        </template>

        <!-- 친구 탭 -->
        <template v-else-if="activeTab === 'friend'">
          <div v-if="friends.length === 0" class="store-picker-empty">
            <p>배치할 수 있는 친구가 없습니다</p>
            <p class="store-picker-hint">맞팔(서로 팔로우) 상태인 친구 중 아직 배치하지 않은 친구가 여기 표시됩니다</p>
          </div>
          <div v-else class="store-picker-list">
            <button
              v-for="friend in friends"
              :key="friend.userId"
              class="store-picker-item"
              @click="$emit('select', { type: 'friend', id: friend.userId })"
            >
              <div class="store-picker-avatar friend-avatar">
                <img v-if="friend.profileImage" :src="friend.profileImage" :alt="friend.nickname" />
                <div v-else class="store-picker-avatar-placeholder friend">
                  {{ friend.nickname.charAt(0) }}
                </div>
              </div>
              <div class="store-picker-info">
                <span class="store-picker-name">{{ friend.nickname }}</span>
                <span v-if="friend.profileCode" class="store-picker-code">@{{ friend.profileCode }}</span>
              </div>
              <div v-if="friend.roomAssetUrl" class="store-picker-room-preview">
                <img :src="friend.roomAssetUrl" alt="room" />
              </div>
            </button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getUnplacedStores, getUnplacedFriends, type UnplacedStore, type UnplacedFriend } from '@/services/storeRoomService'

defineEmits<{
  close: []
  select: [selection: { type: 'store' | 'friend'; id: string }]
}>()

const activeTab = ref<'store' | 'friend'>('store')
const stores = ref<UnplacedStore[]>([])
const friends = ref<UnplacedFriend[]>([])
const isLoading = ref(true)
const storesLoaded = ref(false)
const friendsLoaded = ref(false)

async function loadStores() {
  if (storesLoaded.value) return
  isLoading.value = true
  try {
    stores.value = await getUnplacedStores()
    storesLoaded.value = true
  } catch { /* silent */ } finally {
    isLoading.value = false
  }
}

async function loadFriends() {
  if (friendsLoaded.value) return
  isLoading.value = true
  try {
    friends.value = await getUnplacedFriends()
    friendsLoaded.value = true
  } catch { /* silent */ } finally {
    isLoading.value = false
  }
}

onMounted(() => loadStores())

watch(activeTab, (tab) => {
  if (tab === 'store') loadStores()
  else loadFriends()
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

/* 탭 */
.store-picker-tabs {
  display: flex;
  gap: 0;
  padding: 0 20px;
  border-bottom: 1px solid #f0f0f0;
}

.store-picker-tab {
  flex: 1;
  padding: 10px 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: #86868b;
  cursor: pointer;
  transition: all 0.2s;
}

.store-picker-tab.active {
  color: #6366F1;
  border-bottom-color: #6366F1;
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

.store-picker-avatar.friend-avatar {
  border-radius: 50%;
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
}

.store-picker-avatar-placeholder.store {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
}

.store-picker-avatar-placeholder.friend {
  background: linear-gradient(135deg, #10B981, #34D399);
}

.store-picker-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
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

.store-picker-room-preview {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f7;
}

.store-picker-room-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
