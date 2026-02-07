<template>
  <div
    class="guestbook-block"
    :style="{
      '--text-color': data.textColor || '#374151',
      backgroundImage: data.backgroundImageUrl ? `url(${data.backgroundImageUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }"
  >
    <h2 class="guestbook-title">{{ data.title }}</h2>

    <!-- 방명록 작성 버튼 (로그인한 사용자만) -->
    <div v-if="isAuthenticated" class="write-section">
      <!-- 커스텀 버튼 이미지가 있는 경우 -->
      <button v-if="data.buttonImageUrl" @click="openDrawingModal" class="write-btn-custom">
        <img
          :src="data.buttonImageUrl"
          alt="방명록 남기기"
          class="custom-button-image"
          :style="{ transform: `scale(${data.buttonImageScale || 1})` }"
        />
      </button>
      <!-- 기본 버튼 -->
      <button v-else @click="openDrawingModal" class="write-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 19l7-7 3 3-7 7-3-3z"/>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
          <path d="M2 2l7.586 7.586"/>
        </svg>
        방명록 남기기
      </button>
    </div>

    <!-- 로그인 유도 -->
    <div v-else class="login-prompt">
      <p>로그인하고 손글씨로 방명록을 남겨보세요!</p>
      <div class="auth-buttons">
        <button class="btn-login" @click="goToLogin">로그인</button>
        <button class="btn-signup" @click="goToSignup">회원가입</button>
      </div>
    </div>

    <!-- 방명록 슬라이더 -->
    <div v-if="isLoadingMessages" class="loading-state">
      <p>방명록을 불러오는 중...</p>
    </div>

    <div v-else-if="messages.length === 0" class="empty-state">
      <p>아직 남겨진 메시지가 없습니다. 첫 메시지를 남겨보세요!</p>
    </div>

    <template v-else>
      <!-- 포스트잇 모드 -->
      <template v-if="displayMode === 'postit'">
        <div class="drawings-slider-container">
          <div class="drawings-slider" ref="sliderRef">
            <div
              v-for="message in previewMessages"
              :key="message.id"
              class="post-it-slide"
            >
              <div
                class="post-it"
                :class="`post-it--${message.color}`"
                :style="{ transform: `rotate(${message.rotation}deg)` }"
              >
                <div class="post-it-content">
                  <div class="post-it-image-container">
                    <img
                      v-if="message.imageUrl"
                      :src="message.imageUrl"
                      :alt="`${message.userName}의 방명록`"
                      class="drawing-image"
                      loading="lazy"
                      decoding="async"
                    />
                    <!-- 스티커 레이어 -->
                    <div class="stickers-layer">
                      <div
                        v-for="sticker in message.stickers || []"
                        :key="sticker.id"
                        class="sticker-item"
                        :class="{ 'sticker-item--image': sticker.stickerType === 'logo' || sticker.stickerType === 'asset' }"
                        :style="{
                          left: `${sticker.positionX}%`,
                          top: `${sticker.positionY}%`,
                          transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`
                        }"
                      >
                        <!-- 이미지 타입 스티커 (로고/에셋) -->
                        <img
                          v-if="sticker.stickerType === 'logo' || sticker.stickerType === 'asset'"
                          :src="sticker.stickerContent"
                          alt="sticker"
                          class="sticker-image"
                        />
                        <!-- 이모지 스티커 -->
                        <template v-else>{{ sticker.stickerContent }}</template>
                      </div>
                    </div>
                    <!-- 액션 버튼들 -->
                    <div class="post-it-actions">
                      <!-- 스티커 추가 버튼 (본인 방명록만) -->
                      <button
                        v-if="isAuthenticated && isMyMessage(message)"
                        class="action-btn sticker-btn"
                        @click.stop="openStickerPicker(message)"
                        title="스티커 추가"
                      >
                        😊
                      </button>
                      <!-- 공유 버튼 -->
                      <button
                        class="action-btn share-btn"
                        @click.stop="shareMessage(message)"
                        title="공유하기"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="18" cy="5" r="3"/>
                          <circle cx="6" cy="12" r="3"/>
                          <circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="message-footer">
                    <div class="message-info">
                      <span class="message-author">- {{ message.userName }}</span>
                      <span class="message-date">{{ formatDate(message.createdAt) }}</span>
                    </div>
                    <button
                      class="like-btn"
                      :class="{ 'liked': message.isLikedByMe }"
                      @click.stop="handleLike(message)"
                      :disabled="likingMessageId === message.id"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" :fill="message.isLikedByMe ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      <span>{{ message.likeCount || 0 }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 낙서 모드 -->
      <template v-else-if="displayMode === 'graffiti'">
        <div class="graffiti-wall">
          <div
            v-for="(message, index) in previewMessages"
            :key="message.id"
            class="graffiti-item"
            :style="getGraffitiStyle(index, message)"
          >
            <img
              v-if="message.imageUrl"
              :src="message.imageUrl"
              :alt="`${message.userName}의 낙서`"
              class="graffiti-image"
              loading="lazy"
              decoding="async"
            />
            <div class="graffiti-footer">
              <span class="graffiti-author">{{ message.userName }}</span>
              <button
                class="like-btn like-btn-graffiti"
                :class="{ 'liked': message.isLikedByMe }"
                @click.stop="handleLike(message)"
                :disabled="likingMessageId === message.id"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" :fill="message.isLikedByMe ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{{ message.likeCount || 0 }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- 전체보기 버튼 (5개 초과 시에만 표시) -->
      <div v-if="totalMessageCount > 5" class="view-all-section">
        <button @click="goToFullGuestbook" class="view-all-btn">
          <span>전체 방명록 보기</span>
          <span class="message-count">({{ totalMessageCount }}개)</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </template>

    <!-- 전체화면 그리기 모달 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isModalOpen" class="drawing-modal-overlay" @click.self="closeModal">
          <div class="drawing-modal">
            <!-- 모달 헤더 -->
            <div class="modal-header">
              <button @click="closeModal" class="modal-close-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              <h3 class="modal-title">방명록 작성</h3>
              <div class="modal-header-spacer"></div>
            </div>

            <!-- 캔버스 영역 -->
            <div class="modal-canvas-container" :class="{ 'graffiti-mode': displayMode === 'graffiti' }">
              <div v-if="!hasDrawing" class="canvas-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="M2 2l7.586 7.586"/>
                  <circle cx="11" cy="11" r="2"/>
                </svg>
                <span>{{ displayMode === 'graffiti' ? '벽에 낙서를 남겨보세요!' : '여기에 그려주세요' }}</span>
              </div>
              <canvas
                ref="canvasRef"
                :class="{ 'graffiti-canvas': displayMode === 'graffiti' }"
                @mousedown="startDrawing"
                @mousemove="draw"
                @mouseup="stopDrawing"
                @mouseleave="stopDrawing"
                @touchstart.prevent="handleTouchStart"
                @touchmove.prevent="handleTouchMove"
                @touchend.prevent="stopDrawing"
                class="drawing-canvas"
              ></canvas>
            </div>

            <!-- 도구 모음 -->
            <div class="modal-tools">
              <div class="tools-row">
                <!-- 색상 피커 -->
                <div class="color-picker-wrapper">
                  <input
                    type="color"
                    v-model="selectedColor"
                    class="color-picker-input"
                    title="색상 선택"
                  />
                  <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
                </div>

                <!-- 브러시 크기 슬라이더 -->
                <div class="brush-slider-wrapper">
                  <input
                    type="range"
                    v-model.number="brushSize"
                    :min="minBrushSize"
                    :max="maxBrushSize"
                    step="1"
                    class="brush-slider"
                    title="브러시 크기"
                  />
                  <div class="brush-size-preview" :style="{ width: `${brushSize}px`, height: `${brushSize}px` }"></div>
                </div>

                <!-- 지우기 버튼 -->
                <button @click="clearCanvas" class="icon-btn clear-btn" title="지우기">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>

              <!-- 완료 버튼 -->
              <button @click="submitDrawing" :disabled="!hasDrawing || isSubmitting" class="submit-btn">
                <template v-if="isSubmitting">
                  <span class="spinner"></span>
                  등록 중...
                </template>
                <template v-else>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  완료
                </template>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 스티커 피커 모달 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isStickerPickerOpen" class="sticker-picker-overlay" @click.self="closeStickerPicker">
          <div class="sticker-picker-modal">
            <div class="sticker-picker-header">
              <h4>스티커 추가</h4>
              <button @click="closeStickerPicker" class="sticker-picker-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <!-- 탭 메뉴 -->
            <div class="sticker-tabs">
              <button
                class="sticker-tab"
                :class="{ active: stickerTab === 'emoji' }"
                @click="stickerTab = 'emoji'"
              >
                이모지
              </button>
              <button
                class="sticker-tab"
                :class="{ active: stickerTab === 'deco' }"
                @click="stickerTab = 'deco'"
              >
                다꾸
              </button>
              <button
                class="sticker-tab"
                :class="{ active: stickerTab === 'store' }"
                @click="stickerTab = 'store'; loadStickerAssets()"
              >
                매장
              </button>
            </div>
            <!-- 이모지 탭 -->
            <div v-if="stickerTab === 'emoji'" class="sticker-grid">
              <button
                v-for="emoji in emojiList"
                :key="emoji"
                class="sticker-option"
                @click="selectStickerForPlacement('emoji', emoji)"
                :disabled="addingStickerMessageId !== null"
              >
                {{ emoji }}
              </button>
            </div>
            <!-- 다꾸 스티커팩 탭 -->
            <div v-else-if="stickerTab === 'deco'" class="sticker-content">
              <div class="deco-category-tabs">
                <button
                  v-for="(stickers, category) in decoStickerPacks"
                  :key="category"
                  class="deco-category-btn"
                  :class="{ active: selectedDecoCategory === category }"
                  @click="selectedDecoCategory = category as keyof typeof decoStickerPacks"
                >
                  {{ stickers[0] }}
                </button>
              </div>
              <div class="sticker-grid deco-grid">
                <button
                  v-for="sticker in decoStickerPacks[selectedDecoCategory]"
                  :key="sticker"
                  class="sticker-option deco-sticker"
                  @click="selectStickerForPlacement('emoji', sticker)"
                  :disabled="addingStickerMessageId !== null"
                >
                  {{ sticker }}
                </button>
              </div>
            </div>
            <!-- 매장 스티커 탭 (로고 + 에셋) -->
            <div v-else-if="stickerTab === 'store'" class="sticker-content">
              <div v-if="isLoadingStickerAssets" class="sticker-loading">
                <span class="loading-spinner"></span>
                불러오는 중...
              </div>
              <div v-else-if="stickerAssets.length === 0" class="sticker-empty">
                <span>사용 가능한 스티커가 없습니다</span>
                <span class="sticker-empty-hint">관리자가 로고나 게임 에셋을 등록하면 여기에 표시됩니다</span>
              </div>
              <template v-else>
                <!-- 로고 섹션 -->
                <div v-if="logoAssets.length > 0" class="sticker-section">
                  <div class="sticker-section-title">매장 로고</div>
                  <div class="sticker-asset-grid">
                    <button
                      v-for="asset in logoAssets"
                      :key="asset.id"
                      class="sticker-asset-option"
                      @click="selectAssetForPlacement(asset)"
                      :disabled="addingStickerMessageId !== null"
                      :title="asset.name"
                    >
                      <img :src="asset.imageUrl" :alt="asset.name" class="sticker-asset-img" />
                      <span class="sticker-asset-label">{{ asset.name }}</span>
                    </button>
                  </div>
                </div>
                <!-- 게임 에셋 섹션 -->
                <div v-if="gameAssets.length > 0" class="sticker-section">
                  <div class="sticker-section-title">게임 에셋</div>
                  <div class="sticker-asset-grid">
                    <button
                      v-for="asset in gameAssets"
                      :key="asset.id"
                      class="sticker-asset-option"
                      @click="selectAssetForPlacement(asset)"
                      :disabled="addingStickerMessageId !== null"
                      :title="asset.name"
                    >
                      <img :src="asset.imageUrl" :alt="asset.name" class="sticker-asset-img" />
                      <span class="sticker-asset-label">{{ asset.name }}</span>
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 스티커 배치 모달 (드래그로 위치 지정) -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isStickerPlacementMode" class="sticker-placement-overlay">
          <div class="sticker-placement-modal">
            <div class="placement-header">
              <h4>스티커 위치 지정</h4>
              <p class="placement-hint">드래그하여 위치를 정하고, 슬라이더로 크기와 회전을 조절하세요</p>
            </div>

            <!-- 미리보기 영역 -->
            <div
              class="placement-preview"
              ref="placementContainerRef"
              @mousedown="startStickerDrag"
              @mousemove="dragSticker"
              @mouseup="stopStickerDrag"
              @mouseleave="stopStickerDrag"
              @touchstart.prevent="startStickerTouchDrag"
              @touchmove.prevent="dragStickerTouch"
              @touchend.prevent="stopStickerDrag"
            >
              <!-- 방명록 이미지 배경 -->
              <img
                v-if="selectedMessageForSticker?.imageUrl"
                :src="selectedMessageForSticker.imageUrl"
                class="placement-bg-image"
              />
              <!-- 배치할 스티커 -->
              <div
                class="placement-sticker"
                :style="{
                  left: `${stickerPlacementPos.x}%`,
                  top: `${stickerPlacementPos.y}%`,
                  transform: `translate(-50%, -50%) rotate(${stickerRotation}deg) scale(${stickerScale})`
                }"
              >
                <img
                  v-if="pendingSticker?.type === 'logo' || pendingSticker?.type === 'asset'"
                  :src="pendingSticker.content"
                  class="placement-sticker-img"
                />
                <span v-else class="placement-sticker-emoji">{{ pendingSticker?.content }}</span>
              </div>
            </div>

            <!-- 조절 컨트롤 -->
            <div class="placement-controls">
              <div class="control-row">
                <label>크기</label>
                <input
                  type="range"
                  v-model.number="stickerScale"
                  min="0.3"
                  max="2"
                  step="0.1"
                  class="control-slider"
                />
                <span class="control-value">{{ Math.round(stickerScale * 100) }}%</span>
              </div>
              <div class="control-row">
                <label>회전</label>
                <input
                  type="range"
                  v-model.number="stickerRotation"
                  min="-180"
                  max="180"
                  step="5"
                  class="control-slider"
                />
                <span class="control-value">{{ stickerRotation }}°</span>
              </div>
            </div>

            <!-- 버튼 -->
            <div class="placement-actions">
              <button class="placement-cancel" @click="cancelStickerPlacement">취소</button>
              <button
                class="placement-confirm"
                @click="confirmStickerPlacement"
                :disabled="addingStickerMessageId !== null"
              >
                <template v-if="addingStickerMessageId">
                  <span class="spinner-small"></span>
                </template>
                <template v-else>붙이기</template>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 공유 모달 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isShareModalOpen" class="share-modal-overlay" @click.self="closeShareModal">
          <div class="share-modal">
            <div class="share-modal-header">
              <h4>공유하기</h4>
              <button @click="closeShareModal" class="share-modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="share-options">
              <button class="share-option" @click="copyShareLink">
                <div class="share-icon copy-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </div>
                <span>링크 복사</span>
              </button>
              <button class="share-option" @click="shareToKakao">
                <div class="share-icon kakao-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.5 3 2 6.58 2 11c0 2.85 1.86 5.35 4.64 6.78-.14.53-.54 1.97-.62 2.27-.1.37.14.36.29.26.12-.08 1.87-1.27 2.63-1.79.67.1 1.36.15 2.06.15 5.5 0 10-3.58 10-8S17.5 3 12 3z"/>
                  </svg>
                </div>
                <span>카카오</span>
              </button>
              <button class="share-option" @click="shareToTwitter">
                <div class="share-icon twitter-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span>X</span>
              </button>
              <button class="share-option" @click="shareToFacebook">
                <div class="share-icon facebook-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span>페이스북</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import guestbookService, { type StickerAsset } from '@/services/guestbookService'
import followService from '@/services/followService'
import type { GuestbookBlockData } from '@/types/blocks'

interface Props {
  data: GuestbookBlockData
  qrCodeId: string
  isPreview?: boolean // 편집기 미리보기 모드
}

const props = defineProps<Props>()
const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUserId = computed(() => authStore.user?.id)

// 본인 방명록인지 확인
const isMyMessage = (message: any) => {
  return currentUserId.value && message.userId === currentUserId.value
}

// 표시 모드 (기본값: postit)
const displayMode = computed(() => props.data.displayMode || 'postit')

// 낙서 모드에서 각 아이템의 위치/회전 스타일 계산
const getGraffitiStyle = (index: number, message: any) => {
  // 각 메시지에 고유한 위치와 회전을 부여 (pseudo-random based on index)
  const positions = [
    { top: '5%', left: '10%', rotate: -8 },
    { top: '15%', left: '55%', rotate: 5 },
    { top: '40%', left: '25%', rotate: -3 },
    { top: '35%', left: '65%', rotate: 12 },
    { top: '60%', left: '40%', rotate: -6 },
  ] as const
  const pos = positions[index % positions.length]!
  return {
    top: pos.top,
    left: pos.left,
    transform: `rotate(${message.rotation || pos.rotate}deg)`,
    zIndex: index + 1
  }
}

// 모달 상태
const isModalOpen = ref(false)
const isSubmitting = ref(false)

// Canvas 관련
const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const isDrawing = ref(false)
const hasDrawing = ref(false)

// 도구 설정
const minBrushSize = 1
const maxBrushSize = 20
const selectedColor = ref('#000000')
const brushSize = ref(4)

// 터치 이벤트 처리
let lastX = 0
let lastY = 0

// 방명록 메시지 목록
const messages = ref<any[]>([])
const isLoadingMessages = ref(false)
const sliderRef = ref<HTMLElement | null>(null)
const totalMessageCount = ref(0)

// 좋아요 관련
const likingMessageId = ref<string | null>(null)

// 스티커 관련
const isStickerPickerOpen = ref(false)
const selectedMessageForSticker = ref<any>(null)
const addingStickerMessageId = ref<string | null>(null)
const stickerTab = ref<'emoji' | 'store' | 'deco'>('emoji')
const stickerAssets = ref<StickerAsset[]>([])
const isLoadingStickerAssets = ref(false)
const stickerAssetsLoaded = ref(false) // 캐싱용 플래그

// 스티커 배치 모드 (드래그로 위치 지정)
const isStickerPlacementMode = ref(false)
const pendingSticker = ref<{ type: string; content: string } | null>(null)
const stickerPlacementPos = ref({ x: 50, y: 50 })
const stickerScale = ref(1.0)
const stickerRotation = ref(0)
const placementContainerRef = ref<HTMLElement | null>(null)

// 이모지 목록
const emojiList = ['😊', '❤️', '👍', '🎉', '✨', '🔥', '💯', '🌟', '💕', '😍', '🥰', '😘', '🤩', '👏', '💪', '🙌']

// 다꾸 스티커팩 (기본 제공)
const decoStickerPacks = {
  hearts: ['💖', '💗', '💓', '💞', '💕', '💘', '💝', '❤️‍🔥'],
  stars: ['⭐', '🌟', '✨', '💫', '🌠', '⚡', '🔆', '✴️'],
  flowers: ['🌸', '🌺', '🌹', '🌷', '🌻', '🌼', '💐', '🪻'],
  animals: ['🐰', '🐱', '🐶', '🦋', '🐻', '🦊', '🐼', '🦄'],
  food: ['🍰', '🧁', '🍩', '🍪', '🍭', '🍬', '☕', '🧋'],
  weather: ['☀️', '🌈', '☁️', '🌙', '⛅', '🌤️', '💧', '❄️'],
  objects: ['📷', '🎀', '🎈', '🎁', '💌', '📝', '🔮', '💎'],
  faces: ['😆', '🥹', '😋', '🤗', '😇', '🥳', '😎', '🤭']
}
const selectedDecoCategory = ref<keyof typeof decoStickerPacks>('hearts')

// 공유 관련
const isShareModalOpen = ref(false)
const selectedMessageForShare = ref<any>(null)

// 미리보기용 최신 5개 메시지
const previewMessages = computed(() => messages.value.slice(0, 5))

// 스티커 에셋 분류
const logoAssets = computed(() => stickerAssets.value.filter(a => a.type === 'logo'))
const gameAssets = computed(() => stickerAssets.value.filter(a => a.type === 'asset'))

// 모달 열기
const openDrawingModal = async () => {
  isModalOpen.value = true
  document.body.style.overflow = 'hidden' // 배경 스크롤 방지

  // 히스토리 추가 (뒤로가기 처리)
  history.pushState({ modal: 'guestbook' }, '')

  await nextTick()
  initCanvas()
}

// 모달 닫기
const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = '' // 스크롤 복원
  hasDrawing.value = false

  // 히스토리 뒤로가기 (모달이 히스토리에 추가됐으면)
  if (history.state?.modal === 'guestbook') {
    history.back()
  }
}

// 뒤로가기 버튼 처리
const handlePopState = (event: PopStateEvent) => {
  if (isModalOpen.value) {
    isModalOpen.value = false
    document.body.style.overflow = ''
    hasDrawing.value = false
  }
}

onMounted(async () => {
  // 뒤로가기 이벤트 리스너
  window.addEventListener('popstate', handlePopState)

  // 미리보기 모드에서는 API 호출 스킵 (404 에러 방지)
  if (!props.isPreview) {
    await loadMessages()
  }
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
  document.body.style.overflow = '' // 스크롤 복원
})

// 방명록 메시지 로드
const loadMessages = async () => {
  if (!props.qrCodeId) return

  isLoadingMessages.value = true
  try {
    const response = await guestbookService.getMessages(props.qrCodeId)
    // 각 메시지에 stickers 배열 초기화 후 스티커 로드
    const messagesWithStickers = await Promise.all(
      response.map(async (msg: any) => {
        try {
          const stickers = await guestbookService.getStickers(msg.id)
          return { ...msg, stickers }
        } catch {
          return { ...msg, stickers: [] }
        }
      })
    )
    messages.value = messagesWithStickers
    totalMessageCount.value = response.length
  } catch {
    // API가 아직 구현되지 않았거나 네트워크 에러 시 조용히 처리
    messages.value = []
    totalMessageCount.value = 0
  } finally {
    isLoadingMessages.value = false
  }
}

// 전체 방명록 페이지로 이동
const goToFullGuestbook = () => {
  const currentQr = router.currentRoute.value.query.qr
  if (currentQr) {
    router.push(`/guestbook?qr=${currentQr}`)
  }
}

const initCanvas = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const container = canvas.parentElement

  if (container) {
    // 모달 내부 캔버스 크기 설정
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // 캔버스를 컨테이너에 맞춤
    canvas.width = containerWidth
    canvas.height = containerHeight

    ctx.value = canvas.getContext('2d')

    if (ctx.value) {
      // Canvas 초기 설정
      // 낙서 모드: 투명 배경 / 포스트잇 모드: 흰색 배경
      if (displayMode.value === 'graffiti') {
        ctx.value.clearRect(0, 0, canvas.width, canvas.height)
      } else {
        ctx.value.fillStyle = '#FFFFFF'
        ctx.value.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.value.lineCap = 'round'
      ctx.value.lineJoin = 'round'
    }
  }
}

const startDrawing = (e: MouseEvent) => {
  if (!ctx.value || !canvasRef.value) return

  isDrawing.value = true
  hasDrawing.value = true

  const rect = canvasRef.value.getBoundingClientRect()
  lastX = e.clientX - rect.left
  lastY = e.clientY - rect.top

  ctx.value.beginPath()
  ctx.value.moveTo(lastX, lastY)
}

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx.value || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  ctx.value.strokeStyle = selectedColor.value
  ctx.value.lineWidth = brushSize.value
  ctx.value.lineTo(x, y)
  ctx.value.stroke()

  lastX = x
  lastY = y
}

const handleTouchStart = (e: TouchEvent) => {
  if (!ctx.value || !canvasRef.value) return

  const touch = e.touches[0]
  if (!touch) return

  isDrawing.value = true
  hasDrawing.value = true

  const rect = canvasRef.value.getBoundingClientRect()
  lastX = touch.clientX - rect.left
  lastY = touch.clientY - rect.top

  ctx.value.beginPath()
  ctx.value.moveTo(lastX, lastY)
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDrawing.value || !ctx.value || !canvasRef.value) return

  const touch = e.touches[0]
  if (!touch) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top

  ctx.value.strokeStyle = selectedColor.value
  ctx.value.lineWidth = brushSize.value
  ctx.value.lineTo(x, y)
  ctx.value.stroke()

  lastX = x
  lastY = y
}

const stopDrawing = () => {
  isDrawing.value = false
}

const clearCanvas = () => {
  if (!ctx.value || !canvasRef.value) return

  // 낙서 모드: 투명 배경 / 포스트잇 모드: 흰색 배경
  if (displayMode.value === 'graffiti') {
    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  } else {
    ctx.value.fillStyle = '#FFFFFF'
    ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }
  hasDrawing.value = false
}

const submitDrawing = async () => {
  if (!canvasRef.value || !hasDrawing.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // 이미지 리사이징 및 압축
    const resizedImageData = await resizeAndCompressImage(canvasRef.value)

    // API 호출하여 이미지 저장
    await guestbookService.createMessage({
      qrCode: props.qrCodeId,  // QR Code 문자열 전달
      imageData: resizedImageData,
      color: 'yellow' // 기본 색상
    })

    // 성공 후 모달 닫기
    closeModal()

    // 방명록 목록 새로고침
    await loadMessages()

    // 성공 알림
    alert('방명록이 등록되었습니다!')
  } catch (error: any) {
    console.error('Failed to submit drawing:', error)

    // 팔로우가 필요한 경우 자동 팔로우 후 재시도
    if (error.response?.data?.requireFollow) {
      const storeName = error.response.data.storeName || '이 매장'
      const shouldFollow = confirm(`방명록 작성을 위해 ${storeName}을(를) 단골 등록해야 합니다.\n단골 등록 후 방명록을 작성하시겠습니까?`)

      if (shouldFollow) {
        try {
          // 팔로우 시도
          await followService.followAdmin(props.qrCodeId)

          // 팔로우 성공 후 방명록 다시 제출
          const resizedImageData = await resizeAndCompressImage(canvasRef.value!)
          await guestbookService.createMessage({
            qrCode: props.qrCodeId,
            imageData: resizedImageData,
            color: 'yellow'
          })

          closeModal()
          await loadMessages()
          alert('단골 등록 및 방명록이 등록되었습니다!')
        } catch (followError) {
          console.error('Failed to follow and retry:', followError)
          alert('단골 등록에 실패했습니다. 다시 시도해주세요.')
        }
      }
    } else {
      alert('방명록 등록에 실패했습니다.')
    }
  } finally {
    isSubmitting.value = false
  }
}

// 이미지 리사이징 및 압축 함수
const resizeAndCompressImage = async (canvas: HTMLCanvasElement): Promise<string> => {
  // 최대 크기 설정 (방명록 카드 크기에 맞춤)
  const MAX_WIDTH = 400
  const MAX_HEIGHT = 400
  const QUALITY = 0.75 // JPEG 품질 (0.0 - 1.0)

  let width = canvas.width
  let height = canvas.height

  // 비율 유지하면서 리사이징
  if (width > MAX_WIDTH || height > MAX_HEIGHT) {
    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
    width = Math.floor(width * ratio)
    height = Math.floor(height * ratio)
  }

  // 새 캔버스 생성
  const resizedCanvas = document.createElement('canvas')
  resizedCanvas.width = width
  resizedCanvas.height = height

  const ctx = resizedCanvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')

  // 낙서 모드: 투명 배경 유지 / 포스트잇 모드: 흰색 배경
  if (displayMode.value !== 'graffiti') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }

  // 이미지 리사이징 (부드러운 스케일링)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(canvas, 0, 0, width, height)

  // 낙서 모드: PNG (투명 배경 유지) / 포스트잇 모드: JPEG (파일 크기 작음)
  if (displayMode.value === 'graffiti') {
    return resizedCanvas.toDataURL('image/png')
  }
  return resizedCanvas.toDataURL('image/jpeg', QUALITY)
}

const goToLogin = () => {
  const currentQr = router.currentRoute.value.query.qr
  if (currentQr) {
    router.push(`/login?qr=${currentQr}`)
  } else {
    router.push('/login')
  }
}

const goToSignup = () => {
  const currentQr = router.currentRoute.value.query.qr
  if (currentQr) {
    router.push(`/signup?qr=${currentQr}`)
  } else {
    router.push('/signup')
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return '방금 전'
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }
}

// 공유 기능
const shareMessage = async (message: any) => {
  const shareUrl = `${window.location.origin}/guestbook?qr=${props.qrCodeId}&highlight=${message.id}`
  const shareText = `${message.userName}님의 방명록을 확인해보세요!`

  // Web Share API 지원 확인
  if (navigator.share) {
    try {
      await navigator.share({
        title: '방명록 공유',
        text: shareText,
        url: shareUrl
      })
    } catch (error: any) {
      // 사용자가 취소한 경우 무시
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error)
        fallbackShare(shareUrl)
      }
    }
  } else {
    // Web Share API 미지원 시 모달 표시
    selectedMessageForShare.value = message
    isShareModalOpen.value = true
  }
}

// 공유 모달 닫기
const closeShareModal = () => {
  isShareModalOpen.value = false
  selectedMessageForShare.value = null
}

// 링크 복사
const copyShareLink = async () => {
  if (!selectedMessageForShare.value) return

  const shareUrl = `${window.location.origin}/guestbook?qr=${props.qrCodeId}&highlight=${selectedMessageForShare.value.id}`

  try {
    await navigator.clipboard.writeText(shareUrl)
    alert('링크가 복사되었습니다!')
    closeShareModal()
  } catch {
    // 클립보드 API 미지원 시 폴백
    fallbackShare(shareUrl)
  }
}

// 카카오톡 공유
const shareToKakao = () => {
  if (!selectedMessageForShare.value) return

  const shareUrl = `${window.location.origin}/guestbook?qr=${props.qrCodeId}&highlight=${selectedMessageForShare.value.id}`
  const kakaoShareUrl = `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`
  window.open(kakaoShareUrl, '_blank', 'width=600,height=400')
  closeShareModal()
}

// 트위터 공유
const shareToTwitter = () => {
  if (!selectedMessageForShare.value) return

  const shareUrl = `${window.location.origin}/guestbook?qr=${props.qrCodeId}&highlight=${selectedMessageForShare.value.id}`
  const text = `${selectedMessageForShare.value.userName}님의 방명록을 확인해보세요!`
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
  window.open(twitterShareUrl, '_blank', 'width=600,height=400')
  closeShareModal()
}

// 페이스북 공유
const shareToFacebook = () => {
  if (!selectedMessageForShare.value) return

  const shareUrl = `${window.location.origin}/guestbook?qr=${props.qrCodeId}&highlight=${selectedMessageForShare.value.id}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  window.open(facebookShareUrl, '_blank', 'width=600,height=400')
  closeShareModal()
}

// 폴백 공유 (프롬프트)
const fallbackShare = (url: string) => {
  prompt('이 링크를 복사하세요:', url)
}

// 스티커 피커 열기
const openStickerPicker = (message: any) => {
  selectedMessageForSticker.value = message
  isStickerPickerOpen.value = true
}

// 스티커 피커 닫기
const closeStickerPicker = () => {
  isStickerPickerOpen.value = false
  stickerTab.value = 'emoji' // 탭 상태 초기화
}

// 스티커 선택 후 배치 모드로 전환
const selectStickerForPlacement = (type: string, content: string) => {
  pendingSticker.value = { type, content }
  stickerPlacementPos.value = { x: 50, y: 50 }
  stickerScale.value = type === 'emoji' ? 1.0 : 0.8
  stickerRotation.value = 0
  isStickerPickerOpen.value = false
  isStickerPlacementMode.value = true
}

// 에셋 스티커 선택
const selectAssetForPlacement = (asset: StickerAsset) => {
  pendingSticker.value = { type: asset.type, content: asset.imageUrl }
  stickerPlacementPos.value = { x: 50, y: 50 }
  stickerScale.value = 0.8
  stickerRotation.value = 0
  isStickerPickerOpen.value = false
  isStickerPlacementMode.value = true
}

// 스티커 드래그 관련
let isDraggingSticker = false

const startStickerDrag = (e: MouseEvent) => {
  isDraggingSticker = true
  updateStickerPosition(e)
}

const dragSticker = (e: MouseEvent) => {
  if (!isDraggingSticker) return
  updateStickerPosition(e)
}

const stopStickerDrag = () => {
  isDraggingSticker = false
}

const updateStickerPosition = (e: MouseEvent) => {
  if (!placementContainerRef.value) return
  const rect = placementContainerRef.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  stickerPlacementPos.value = {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y))
  }
}

// 터치 이벤트 처리
const startStickerTouchDrag = (e: TouchEvent) => {
  isDraggingSticker = true
  updateStickerTouchPosition(e)
}

const dragStickerTouch = (e: TouchEvent) => {
  if (!isDraggingSticker) return
  updateStickerTouchPosition(e)
}

const updateStickerTouchPosition = (e: TouchEvent) => {
  if (!placementContainerRef.value || !e.touches[0]) return
  const rect = placementContainerRef.value.getBoundingClientRect()
  const touch = e.touches[0]
  const x = ((touch.clientX - rect.left) / rect.width) * 100
  const y = ((touch.clientY - rect.top) / rect.height) * 100
  stickerPlacementPos.value = {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y))
  }
}

// 스티커 배치 취소
const cancelStickerPlacement = () => {
  isStickerPlacementMode.value = false
  pendingSticker.value = null
  selectedMessageForSticker.value = null
}

// 스티커 배치 확정
const confirmStickerPlacement = async () => {
  if (!selectedMessageForSticker.value || !pendingSticker.value || addingStickerMessageId.value) return

  addingStickerMessageId.value = selectedMessageForSticker.value.id

  try {
    const response = await guestbookService.addSticker(selectedMessageForSticker.value.id, {
      stickerType: pendingSticker.value.type as any,
      stickerContent: pendingSticker.value.content,
      positionX: stickerPlacementPos.value.x,
      positionY: stickerPlacementPos.value.y,
      rotation: stickerRotation.value,
      scale: stickerScale.value
    })

    // 메시지에 스티커 추가
    if (!selectedMessageForSticker.value.stickers) {
      selectedMessageForSticker.value.stickers = []
    }
    selectedMessageForSticker.value.stickers.push(response)

    // 모달 닫기
    isStickerPlacementMode.value = false
    pendingSticker.value = null
    selectedMessageForSticker.value = null
  } catch (error) {
    console.error('Failed to add sticker:', error)
    alert('스티커 추가에 실패했습니다.')
  } finally {
    addingStickerMessageId.value = null
  }
}

// 스티커 에셋 로드 (캐싱 적용)
const loadStickerAssets = async () => {
  // 이미 로드했거나 로딩 중이면 스킵
  if (stickerAssetsLoaded.value || isLoadingStickerAssets.value || !props.qrCodeId) return

  isLoadingStickerAssets.value = true
  try {
    const response = await guestbookService.getStickerAssets(props.qrCodeId)
    stickerAssets.value = response.assets
    stickerAssetsLoaded.value = true
  } catch (error) {
    console.error('Failed to load sticker assets:', error)
    stickerAssets.value = []
  } finally {
    isLoadingStickerAssets.value = false
  }
}

// 좋아요 토글 핸들러
const handleLike = async (message: any) => {
  if (!isAuthenticated.value) {
    const shouldLogin = confirm('좋아요를 누르려면 로그인이 필요합니다.\n로그인 하시겠습니까?')
    if (shouldLogin) {
      goToLogin()
    }
    return
  }

  if (likingMessageId.value) return

  likingMessageId.value = message.id

  try {
    const response = await guestbookService.toggleLike(message.id)
    // 메시지 상태 업데이트
    message.isLikedByMe = response.isLiked
    message.likeCount = response.likeCount
  } catch (error) {
    console.error('Failed to toggle like:', error)
    alert('좋아요 처리에 실패했습니다.')
  } finally {
    likingMessageId.value = null
  }
}
</script>

<style scoped>
.guestbook-block {
  padding: 2rem 1rem;
  margin-bottom: 1.5rem;
}

.guestbook-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color, #1f2937);
  margin-bottom: 2rem;
  text-align: center;
}

/* 방명록 작성 버튼 */
.write-section {
  margin-bottom: 2rem;
  text-align: center;
}

.write-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #4ECDC4 0%, #44a8a0 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
}

.write-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(78, 205, 196, 0.4);
}

.write-btn:active {
  transform: translateY(0);
}

/* 커스텀 버튼 이미지 */
.write-btn-custom {
  display: inline-block;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.write-btn-custom:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.write-btn-custom:active {
  transform: translateY(0) scale(0.98);
}

.custom-button-image {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
  display: block;
  border-radius: 12px;
  transition: transform 0.2s ease;
  transform-origin: center;
}

/* 로그인 유도 */
.login-prompt {
  background: #f3f4f6;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
}

.login-prompt p {
  color: #6b7280;
  font-size: 15px;
  margin: 0 0 1.25rem 0;
  font-weight: 500;
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-login,
.btn-signup {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-login {
  background: #4ECDC4;
  color: white;
}

.btn-login:hover {
  background: #45b7b8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(78, 205, 196, 0.3);
}

.btn-signup {
  background: white;
  color: #4ECDC4;
  border: 2px solid #4ECDC4;
}

.btn-signup:hover {
  background: #f0fffe;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(78, 205, 196, 0.2);
}

/* 낙서 모드 스타일 */
.graffiti-wall {
  position: relative;
  width: 100%;
  min-height: 350px;
  margin-top: 1.5rem;
  overflow: hidden;
}

.graffiti-item {
  position: absolute;
  transition: all 0.3s ease;
  max-width: 45%;
}

.graffiti-item:hover {
  z-index: 100 !important;
  transform: scale(1.1) rotate(0deg) !important;
}

.graffiti-image {
  width: 100%;
  max-width: 180px;
  height: auto;
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3));
  transition: filter 0.2s ease;
}

.graffiti-item:hover .graffiti-image {
  filter: drop-shadow(4px 8px 12px rgba(0, 0, 0, 0.4));
}

.graffiti-author {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  margin-top: 4px;
  text-align: center;
  font-weight: 600;
}

/* 포스트잇 이미지 컨테이너 (스티커 레이어 포함) */
.post-it-image-container {
  position: relative;
  width: 100%;
}

.stickers-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.sticker-item {
  position: absolute;
  font-size: 24px;
  line-height: 1;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

/* 이미지 스티커 */
.sticker-item--image {
  font-size: inherit;
  text-shadow: none;
}

.sticker-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.2));
}

/* 포스트잇 액션 버튼들 */
.post-it-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
}

.post-it:hover .post-it-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.action-btn:hover {
  transform: scale(1.1);
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.share-btn:hover {
  color: #4ECDC4;
  border-color: #4ECDC4;
}

/* 공유 모달 */
.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.share-modal {
  background: white;
  border-radius: 16px;
  padding: 1rem;
  max-width: 320px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.share-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.share-modal-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.share-modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.share-modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.share-option:hover {
  background: #f3f4f6;
}

.share-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-icon {
  background: #e5e7eb;
  color: #374151;
}

.kakao-icon {
  background: #FEE500;
  color: #3A1D1D;
}

.twitter-icon {
  background: #000000;
  color: white;
}

.facebook-icon {
  background: #1877F2;
  color: white;
}

.share-option span {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

/* 스티커 피커 모달 */
.sticker-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.sticker-picker-modal {
  background: white;
  border-radius: 16px;
  padding: 1rem;
  max-width: 320px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.sticker-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

/* 스티커 탭 */
.sticker-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
}

.sticker-tab {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sticker-tab:hover {
  background: #e5e7eb;
}

.sticker-tab.active {
  background: #4ECDC4;
  border-color: #4ECDC4;
  color: white;
}

/* 스티커 콘텐츠 영역 */
.sticker-content {
  min-height: 120px;
  max-height: 280px;
  overflow-y: auto;
}

.sticker-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 120px;
  color: #9ca3af;
  font-size: 14px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #4ECDC4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.sticker-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 120px;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.sticker-empty-hint {
  font-size: 11px;
  color: #c0c0c0;
  max-width: 200px;
}

/* 스티커 섹션 */
.sticker-section {
  margin-bottom: 12px;
}

.sticker-section:last-child {
  margin-bottom: 0;
}

.sticker-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
  padding-left: 2px;
}

/* 에셋 스티커 그리드 */
.sticker-asset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.sticker-asset-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sticker-asset-option:hover:not(:disabled) {
  background: #fff7ed;
  border-color: #fdba74;
  transform: scale(1.05);
}

.sticker-asset-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sticker-asset-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 6px;
}

.sticker-asset-label {
  font-size: 10px;
  color: #6b7280;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sticker-picker-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.sticker-picker-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.sticker-picker-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.sticker-option {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sticker-option:hover:not(:disabled) {
  background: #fff7ed;
  border-color: #fdba74;
  transform: scale(1.1);
}

.sticker-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 방명록 슬라이더 */
.drawings-slider-container {
  width: 100%;
  margin-top: 2rem;
  position: relative;
}

.drawings-slider {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 1rem 0.5rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.drawings-slider::-webkit-scrollbar {
  display: none;
}

.post-it-slide {
  flex: 0 0 280px;
  scroll-snap-align: center;
}

.post-it {
  position: relative;
  padding: 1rem;
  min-height: 200px;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: default;
  width: 100%;
}

.post-it::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 25px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.05) 0%,
    transparent 100%
  );
  border-radius: 4px 4px 0 0;
}

.post-it:hover {
  transform: scale(1.03) !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.post-it--yellow {
  background: #fef3c7;
  border-top: 3px solid #fbbf24;
}

.post-it--pink {
  background: #fce7f3;
  border-top: 3px solid #f472b6;
}

.post-it--blue {
  background: #dbeafe;
  border-top: 3px solid #60a5fa;
}

.post-it--green {
  background: #d1fae5;
  border-top: 3px solid #34d399;
}

.post-it-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 0.5rem;
}

.drawing-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.message-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-author {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.message-date {
  font-size: 12px;
  color: #9ca3af;
}

/* 좋아요 버튼 */
.like-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.like-btn:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #ef4444;
}

.like-btn.liked {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #ef4444;
}

.like-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.like-btn svg {
  flex-shrink: 0;
}

/* 낙서 모드 좋아요 버튼 */
.graffiti-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.like-btn-graffiti {
  padding: 4px 8px;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: rgba(255, 255, 255, 0.9);
}

.like-btn-graffiti:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.7);
  color: white;
}

.like-btn-graffiti.liked {
  background: rgba(239, 68, 68, 0.7);
  color: white;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
  font-size: 16px;
  font-style: italic;
}

/* 전체보기 버튼 */
.view-all-section {
  margin-top: 1.5rem;
  text-align: center;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: transparent;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  background: #f9fafb;
  border-color: #4ECDC4;
  color: #4ECDC4;
}

.view-all-btn .message-count {
  color: #9ca3af;
  font-weight: 400;
}

.view-all-btn:hover .message-count {
  color: #4ECDC4;
}

/* ==================== */
/* 전체화면 모달 스타일 */
/* ==================== */
.drawing-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawing-modal {
  width: 100%;
  height: 100%;
  max-width: 600px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
  flex-shrink: 0;
}

.modal-close-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-header-spacer {
  width: 40px;
}

/* 모달 캔버스 영역 */
.modal-canvas-container {
  flex: 1;
  position: relative;
  background: #f9fafb;
  overflow: hidden;
}

.modal-canvas-container .canvas-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #9ca3af;
  font-size: 16px;
  pointer-events: none;
  z-index: 1;
}

.modal-canvas-container .drawing-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: crosshair;
  touch-action: none;
  background: white;
  position: relative;
  z-index: 2;
}

/* 낙서 모드 캔버스 스타일 */
.modal-canvas-container.graffiti-mode {
  /* 체커보드 패턴으로 투명 배경 표시 */
  background:
    linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
    linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  background-color: #f0f0f0;
}

.modal-canvas-container .drawing-canvas.graffiti-canvas {
  background: transparent;
}

/* 모달 도구 모음 */
.modal-tools {
  padding: 1rem;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.tools-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

/* 색상 피커 */
.color-picker-wrapper {
  position: relative;
  width: 44px;
  height: 44px;
}

.color-picker-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.color-preview {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid #e5e7eb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  transition: all 0.2s;
}

.color-picker-wrapper:hover .color-preview {
  border-color: #4ECDC4;
  transform: scale(1.05);
}

/* 브러시 크기 슬라이더 */
.brush-slider-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.brush-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.brush-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  background: #4ECDC4;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(78, 205, 196, 0.4);
  transition: all 0.2s;
}

.brush-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(78, 205, 196, 0.5);
}

.brush-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  background: #4ECDC4;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(78, 205, 196, 0.4);
}

.brush-size-preview {
  min-width: 22px;
  min-height: 22px;
  max-width: 22px;
  max-height: 22px;
  background: #374151;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 아이콘 버튼 */
.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn.clear-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.icon-btn.clear-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* 완료 버튼 */
.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: #4ECDC4;
  color: white;
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.submit-btn:hover:not(:disabled) {
  background: #3dbdb5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(78, 205, 196, 0.4);
}

.submit-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  box-shadow: none;
}

/* 로딩 스피너 */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 모달 트랜지션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .drawing-modal,
.modal-fade-leave-active .drawing-modal {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .drawing-modal {
  transform: translateY(100%);
}

.modal-fade-leave-to .drawing-modal {
  transform: translateY(100%);
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .guestbook-block {
    padding: 1.5rem 0.75rem;
  }

  .drawing-modal {
    max-width: 100%;
    border-radius: 0;
  }

  .modal-header {
    padding: 0.875rem 1rem;
  }

  .modal-tools {
    padding: 0.875rem;
  }

  .tools-row {
    gap: 0.5rem;
  }

  .color-picker-wrapper,
  .color-preview {
    width: 40px;
    height: 40px;
  }

  .brush-slider::-webkit-slider-thumb {
    width: 20px;
    height: 20px;
  }

  .brush-size-preview {
    min-width: 20px;
    min-height: 20px;
    max-width: 20px;
    max-height: 20px;
  }

  .icon-btn {
    width: 40px;
    height: 40px;
  }

  .post-it-slide {
    flex: 0 0 85vw;
  }

  .post-it {
    transform: none !important;
  }

  .post-it:hover {
    transform: scale(1.02) !important;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .post-it-slide {
    flex: 0 0 320px;
  }
}

/* 데스크탑에서 모달 중앙 정렬 및 크기 제한 */
@media (min-width: 641px) {
  .drawing-modal {
    height: auto;
    max-height: 90vh;
    border-radius: 20px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  }

  .modal-canvas-container {
    height: 400px;
  }
}

/* 다꾸 스티커팩 스타일 */
.deco-category-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
  scrollbar-width: none;
}

.deco-category-tabs::-webkit-scrollbar {
  display: none;
}

.deco-category-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.deco-category-btn:hover {
  background: #f3f4f6;
  transform: scale(1.05);
}

.deco-category-btn.active {
  background: #fff7ed;
  border-color: #fdba74;
  box-shadow: 0 0 0 2px rgba(253, 186, 116, 0.3);
}

.deco-grid {
  grid-template-columns: repeat(4, 1fr);
}

.deco-sticker {
  font-size: 26px;
}

/* 스티커 배치 모달 */
.sticker-placement-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.sticker-placement-modal {
  background: white;
  border-radius: 20px;
  padding: 1.25rem;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.placement-header {
  text-align: center;
  margin-bottom: 1rem;
}

.placement-header h4 {
  margin: 0 0 0.25rem 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.placement-hint {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.placement-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  overflow: hidden;
  cursor: crosshair;
  touch-action: none;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.placement-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.placement-sticker {
  position: absolute;
  pointer-events: none;
  transition: transform 0.05s ease-out;
}

.placement-sticker-emoji {
  font-size: 48px;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.placement-sticker-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
}

/* 조절 컨트롤 */
.placement-controls {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-row label {
  width: 40px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.control-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.control-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #4ECDC4;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s;
}

.control-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.control-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #4ECDC4;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.control-value {
  width: 50px;
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

/* 배치 버튼 */
.placement-actions {
  display: flex;
  gap: 12px;
  margin-top: 1.25rem;
}

.placement-cancel,
.placement-confirm {
  flex: 1;
  padding: 0.875rem;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.placement-cancel {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.placement-cancel:hover {
  background: #e5e7eb;
}

.placement-confirm {
  background: linear-gradient(135deg, #4ECDC4 0%, #44a8a0 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.placement-confirm:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(78, 205, 196, 0.4);
}

.placement-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 스티커 탭 3개일 때 */
.sticker-tabs {
  gap: 6px;
}

.sticker-tab {
  padding: 0.5rem 0.5rem;
  font-size: 12px;
}

@media (max-width: 360px) {
  .sticker-placement-modal {
    padding: 1rem;
  }

  .placement-sticker-emoji {
    font-size: 40px;
  }

  .placement-sticker-img {
    width: 56px;
    height: 56px;
  }
}
</style>
