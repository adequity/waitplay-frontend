<template>
  <div class="layout-editor">
    <!-- 1. Header (Apple Style) -->
    <header class="editor-header">
      <div class="header-left">
        <button class="btn-back" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div class="header-title">
          <h1>랜딩 페이지 디자인</h1>
          <p class="header-subtitle">블록을 드래그하여 순서를 변경하고 스타일을 편집하세요</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-action btn-secondary" @click="goBack">
          취소
        </button>
        <button class="btn-action btn-primary" @click="saveLayout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
          저장하기
        </button>
      </div>
    </header>

    <div class="editor-container">
      <!-- 2. Left Panel: Block List & Editor -->
      <aside class="editor-panel">
        <div class="panel-header">
          <div class="panel-title">
            <h2>블록 레이어</h2>
            <span class="block-count">{{ blocks.length }}개</span>
          </div>
          <button class="btn-add-block" @click="showAddBlockModal = true">
            + 블록 추가
          </button>
        </div>

        <div class="blocks-list" v-if="blocks.length > 0">
          <draggable
            v-model="blocks"
            item-key="id"
            handle=".drag-handle"
            animation="300"
            ghost-class="sortable-ghost"
            chosen-class="sortable-chosen"
            drag-class="sortable-drag"
            :move="checkMove"
            @end="onDragEnd"
          >
            <template #item="{ element, index }">
              <div
                class="block-item"
                :class="{
                  fixed: element.type === 'header',
                  hidden: !element.isVisible
                }"
              >
                <!-- Drag Handle -->
                <div class="drag-handle" :class="{ disabled: element.type === 'header' }">
                  <svg v-if="element.type !== 'header'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="5" r="1.5" fill="currentColor"/>
                    <circle cx="15" cy="5" r="1.5" fill="currentColor"/>
                    <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="9" cy="19" r="1.5" fill="currentColor"/>
                    <circle cx="15" cy="19" r="1.5" fill="currentColor"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3">
                    <path d="M12 17v5M18.5 3.5L18 2M5.5 3.5L6 2M3 8h18M5 8v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/>
                  </svg>
                </div>

                <!-- Icon -->
                <div class="block-icon">
                  {{ getBlockIcon(element.type) }}
                </div>

                <!-- Info -->
                <div class="block-info">
                  <div class="block-header">
                    <span class="block-title">{{ getBlockTitle(element.type) }}</span>
                    <span v-if="element.type === 'header'" class="badge fixed">고정</span>
                    <span v-if="!element.isVisible" class="badge hidden">숨김</span>
                  </div>
                  <div class="block-preview">
                    {{ getBlockPreview(element) }}
                  </div>
                </div>

                <!-- Actions -->
                <div class="block-actions">
                  <button class="btn-icon" @click="editBlock(element)" title="편집">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    v-if="element.type !== 'header'"
                    class="btn-icon"
                    @click="toggleBlockVisibility(element)"
                    :title="element.isVisible ? '숨기기' : '표시하기'"
                  >
                    <svg v-if="element.isVisible" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                  <button
                    v-if="element.type !== 'header'"
                    class="btn-icon delete"
                    @click="deleteBlock(index)"
                    title="삭제"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>블록이 없습니다</h3>
          <p>첫 번째 블록을 추가하여 페이지를 구성하세요</p>
          <button class="btn-add-large" @click="showAddBlockModal = true">
            블록 추가하기
          </button>
        </div>
      </aside>

      <!-- 3. Right Panel: Preview (iPhone Frame) -->
      <main class="preview-panel">
        <div class="preview-toolbar">
          <div class="segmented-control">
            <button class="segment-btn" :class="{ active: previewDevice === 'mobile' }" @click="previewDevice = 'mobile'">모바일</button>
            <button class="segment-btn" :class="{ active: previewDevice === 'desktop' }" @click="previewDevice = 'desktop'">데스크톱</button>
          </div>
          <div class="theme-picker">
            <span style="font-size:12px; font-weight:600; color:#666;">배경색</span>
            <input type="color" v-model="pageTheme.backgroundColor" class="color-dot-input" />
          </div>
          <div class="bgm-picker">
            <button class="btn-bgm-settings" @click="showBgmModal = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
              <span>BGM 설정</span>
              <span v-if="pageTheme.bgmUrl" class="bgm-indicator">●</span>
            </button>
          </div>
        </div>

        <div class="preview-container" :class="previewDevice">
          <div class="phone-frame">
            <div class="notch" v-if="previewDevice === 'mobile'"></div>
            <div
              class="preview-screen"
              :style="{
                backgroundColor: pageTheme.backgroundColor,
                color: pageTheme.textColor
              }"
            >
              <!-- Dynamic Block Component Rendering (Logic Preserved) -->
              <component
                v-for="block in visibleBlocks"
                :key="block.id"
                :is="getBlockComponent(block.type)"
                :data="block.data"
                :qrCodeId="qrCodeId"
                :isPreview="true"
              />

              <!-- Footer -->
              <div class="footer">
                <p class="footer-text" :style="{ color: pageTheme.textColor, opacity: 0.4 }">
                  Powered by WaitPlay
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 4. Modals (Add / Edit) -->

    <!-- BGM 설정 Modal -->
    <div v-if="showBgmModal" class="modal-overlay active" @click="showBgmModal = false">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h2>🎵 배경음악(BGM) 설정</h2>
          <button class="btn-icon-close" @click="closeBgmModal">✕</button>
        </div>
        <div class="bgm-modal-content">
          <!-- 입력 방식 선택 탭 -->
          <div class="bgm-input-tabs">
            <button
              :class="['bgm-tab', { active: bgmInputType === 'file' }]"
              @click="bgmInputType = 'file'"
            >
              📁 파일 업로드
            </button>
            <button
              :class="['bgm-tab', { active: bgmInputType === 'url' }]"
              @click="bgmInputType = 'url'"
            >
              🔗 URL 입력
            </button>
          </div>

          <!-- 파일 업로드 방식 -->
          <div v-if="bgmInputType === 'file'" class="form-group">
            <label class="form-label">오디오 파일 (MP3, WAV, OGG)</label>
            <div class="file-upload-area">
              <input
                type="file"
                id="bgm-file-input"
                accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/x-m4a,.mp3,.wav,.ogg,.m4a"
                @change="handleBgmFileUpload"
                style="display: none;"
              />
              <label for="bgm-file-input" class="file-upload-label" :class="{ uploading: bgmFileUploading }">
                <template v-if="bgmFileUploading">
                  <span class="upload-spinner"></span>
                  업로드 중...
                </template>
                <template v-else-if="pageTheme.bgmUrl && bgmFileName">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                  <span class="file-name">{{ bgmFileName }}</span>
                  <span class="change-text">클릭하여 변경</span>
                </template>
                <template v-else>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>클릭하여 오디오 파일 선택</span>
                  <span class="file-hint">MP3, WAV, OGG, M4A (최대 10MB)</span>
                </template>
              </label>
            </div>
          </div>

          <!-- URL 입력 방식 -->
          <div v-else class="form-group">
            <label class="form-label">음악 URL (MP3, WAV 등)</label>
            <input
              type="url"
              class="form-input"
              v-model="pageTheme.bgmUrl"
              placeholder="https://example.com/music.mp3"
            />
            <p class="form-hint">
              직접 링크 가능한 오디오 파일 URL을 입력하세요.
            </p>
          </div>

          <div class="bgm-preview-section" v-if="pageTheme.bgmUrl">
            <label class="form-label">미리듣기</label>
            <div class="bgm-preview-controls">
              <button
                class="btn-preview"
                @click="toggleBgmPreview"
              >
                <svg v-if="!isBgmPreviewing" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
                {{ isBgmPreviewing ? '정지' : '재생' }}
              </button>
              <button
                class="btn-remove-bgm"
                @click="removeBgm"
              >
                BGM 제거
              </button>
            </div>
          </div>

          <div class="bgm-info-box">
            <strong>💡 안내</strong>
            <ul>
              <li>저작권에 주의하여 음원을 사용하세요.</li>
              <li>용량이 큰 파일은 로딩 시간이 길어질 수 있습니다.</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeBgmModal">확인</button>
        </div>
      </div>
    </div>

    <!-- Add Block Modal -->
    <div v-if="showAddBlockModal" class="modal-overlay active" @click="showAddBlockModal = false">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h2>블록 추가하기</h2>
          <button class="btn-icon-close" @click="showAddBlockModal = false">✕</button>
        </div>
        <div class="modal-grid">
          <div
            v-for="blockType in availableBlockTypes"
            :key="blockType.type"
            class="block-type-card"
            @click="addBlock(blockType.type as BlockType)"
          >
            <div class="type-icon">{{ blockType.icon }}</div>
            <div class="type-info">
              <div class="type-name">{{ blockType.name }}</div>
              <div class="type-desc">{{ blockType.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Block Modal -->
    <div v-if="editingBlock" class="modal-overlay active" @click="cancelEdit">
      <div class="modal-card large" @click.stop>
        <div class="modal-header">
          <h2>{{ getBlockTitle(editingBlock.type) }} 편집</h2>
          <button class="btn-icon-close" @click="cancelEdit">✕</button>
        </div>

        <div class="edit-form-content">
          <!-- Example: Header Edit -->
          <template v-if="editingBlock.type === 'header'">
            <div class="form-group">
              <label class="form-label">매장 이름</label>
              <input type="text" class="form-input" v-model="editForm.storeName" placeholder="매장명 입력" />
            </div>
            <div class="form-group">
              <label class="form-label">배경 이미지</label>
              <input type="file" class="form-input" @change="handleBackgroundImageUpload" accept="image/*" style="margin-bottom: 8px;">
              <div v-if="editForm.backgroundImage" style="margin-top: 8px;">
                <img :src="editForm.backgroundImage" alt="배경 미리보기" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e5ea;">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">환영 메시지</label>
              <textarea class="form-textarea" v-model="editForm.welcomeMessage" placeholder="환영 메시지 입력"></textarea>
            </div>

            <!-- 폰트 스타일 옵션 -->
            <div class="form-divider"></div>
            <h4 class="form-section-title">글꼴 설정</h4>

            <div class="form-group">
              <label class="form-label">제목 폰트</label>
              <select class="form-input" v-model="editForm.titleFontFamily">
                <option value="default">기본 (시스템 폰트)</option>
                <option value="serif">명조체</option>
                <option value="rounded">둥근 고딕</option>
                <option value="handwriting">손글씨</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">제목 크기: {{ editForm.titleFontSize || 32 }}px</label>
              <input type="range" class="form-range" v-model.number="editForm.titleFontSize" min="24" max="48" step="2" />
              <div class="range-labels">
                <span>24px</span>
                <span>48px</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">설명 크기: {{ editForm.descFontSize || 15 }}px</label>
              <input type="range" class="form-range" v-model.number="editForm.descFontSize" min="12" max="20" step="1" />
              <div class="range-labels">
                <span>12px</span>
                <span>20px</span>
              </div>
            </div>
          </template>

          <!-- Button Edit -->
          <template v-if="editingBlock.type === 'button'">
            <div class="form-group">
              <label class="form-label">버튼 텍스트</label>
              <input type="text" class="form-input" v-model="editForm.text" placeholder="버튼명 입력">
            </div>
            <div class="form-group">
              <label class="form-label">링크 URL</label>
              <input type="text" class="form-input" v-model="editForm.url" placeholder="https://...">
            </div>
            <div class="form-group">
              <label class="form-label">버튼 스타일</label>
              <div class="button-style-selector">
                <button
                  type="button"
                  :class="['btn-style-option', 'primary-style', { active: editForm.style === 'primary' }]"
                  @click="editForm.style = 'primary'"
                >
                  메인 버튼
                </button>
                <button
                  type="button"
                  :class="['btn-style-option', 'secondary-style', { active: editForm.style === 'secondary' }]"
                  @click="editForm.style = 'secondary'"
                >
                  보조 버튼
                </button>
              </div>
            </div>
          </template>


          <!-- Image Edit -->
          <template v-if="editingBlock.type === 'image'">
            <div class="form-group">
              <label class="form-label">이미지 업로드</label>
              <input type="file" class="form-input" @change="handleImageUpload" accept="image/*" style="margin-bottom: 8px;">
              <div v-if="editForm.imageUrl" style="margin-top: 8px;">
                <img :src="editForm.imageUrl" alt="미리보기" style="width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e5ea;">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">이미지 비율</label>
              <div class="ratio-selector">
                <button
                  type="button"
                  :class="['ratio-btn', { active: editForm.aspectRatio === '16:9' }]"
                  @click="editForm.aspectRatio = '16:9'"
                >
                  <div class="ratio-preview ratio-16-9"></div>
                  <span>16:9</span>
                </button>
                <button
                  type="button"
                  :class="['ratio-btn', { active: editForm.aspectRatio === '4:3' }]"
                  @click="editForm.aspectRatio = '4:3'"
                >
                  <div class="ratio-preview ratio-4-3"></div>
                  <span>4:3</span>
                </button>
                <button
                  type="button"
                  :class="['ratio-btn', { active: editForm.aspectRatio === '1:1' }]"
                  @click="editForm.aspectRatio = '1:1'"
                >
                  <div class="ratio-preview ratio-1-1"></div>
                  <span>1:1</span>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">캡션 (선택)</label>
              <input type="text" class="form-input" v-model="editForm.caption" placeholder="이미지 설명">
            </div>
          </template>

          <!-- Countdown Edit -->
          <template v-if="editingBlock.type === 'countdown'">
            <div class="form-group">
              <label class="form-label">제목</label>
              <input type="text" class="form-input" v-model="editForm.title" placeholder="이벤트 제목">
            </div>
            <div class="form-group">
              <label class="form-label">설명</label>
              <textarea class="form-textarea" v-model="editForm.description" placeholder="이벤트 설명"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">목표 날짜</label>
              <input type="datetime-local" class="form-input" v-model="editForm.targetDate">
            </div>
            <div class="form-group">
              <label class="form-label">스타일</label>
              <div class="countdown-style-selector">
                <button
                  type="button"
                  :class="['countdown-style-btn', { active: editForm.style === 'card' }]"
                  @click="editForm.style = 'card'"
                >
                  <div class="countdown-style-preview card-preview">
                    <div class="preview-box"></div>
                  </div>
                  <span>카드</span>
                </button>
                <button
                  type="button"
                  :class="['countdown-style-btn', { active: editForm.style === 'minimal' }]"
                  @click="editForm.style = 'minimal'"
                >
                  <div class="countdown-style-preview minimal-preview">
                    <div class="preview-line"></div>
                  </div>
                  <span>미니멀</span>
                </button>
                <button
                  type="button"
                  :class="['countdown-style-btn', { active: editForm.style === 'banner' }]"
                  @click="editForm.style = 'banner'"
                >
                  <div class="countdown-style-preview banner-preview">
                    <div class="preview-banner"></div>
                  </div>
                  <span>배너</span>
                </button>
              </div>
            </div>
          </template>

          <!-- Popular Menu Edit -->
          <template v-if="editingBlock.type === 'popular_menu'">
            <div class="form-group">
              <label class="form-label">제목</label>
              <input type="text" class="form-input" v-model="editForm.title" placeholder="인기 메뉴">
            </div>
            <div class="form-group">
              <label class="form-label">부제목 (선택)</label>
              <input type="text" class="form-input" v-model="editForm.subtitle" placeholder="부제목">
            </div>
            <div class="form-divider"></div>
            <div class="form-group">
              <label class="form-label">메뉴 아이템</label>
              <div class="menu-items-list">
                <div
                  v-for="(item, index) in editForm.items"
                  :key="index"
                  class="menu-item-card"
                >
                  <div class="menu-item-rank">{{ index + 1 }}</div>
                  <div class="menu-item-thumbnail">
                    <input
                      type="file"
                      :id="'menu-image-' + index"
                      accept="image/*"
                      @change="(e) => handleMenuImageUpload(e, index)"
                      style="display: none;"
                    />
                    <label
                      :for="'menu-image-' + index"
                      class="menu-thumbnail-label"
                      :class="{ 'has-image': item.imageUrl }"
                    >
                      <img v-if="item.imageUrl" :src="item.imageUrl" alt="메뉴 이미지" />
                      <span v-else class="thumbnail-placeholder">+</span>
                    </label>
                    <button
                      v-if="item.imageUrl"
                      type="button"
                      class="btn-remove-thumbnail"
                      @click="item.imageUrl = ''"
                      title="이미지 제거"
                    >×</button>
                  </div>
                  <div class="menu-item-fields">
                    <input
                      type="text"
                      class="form-input"
                      v-model="item.name"
                      placeholder="메뉴명"
                    />
                    <div class="menu-item-row">
                      <input
                        type="number"
                        class="form-input menu-price-input"
                        v-model.number="item.price"
                        placeholder="가격"
                      />
                      <span class="price-unit">원</span>
                    </div>
                    <input
                      type="text"
                      class="form-input"
                      v-model="item.description"
                      placeholder="설명 (선택)"
                    />
                  </div>
                  <button
                    type="button"
                    class="btn-delete-menu-item"
                    @click="editForm.items.splice(index, 1)"
                    title="삭제"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
              <button
                type="button"
                class="btn-add-menu-item"
                @click="editForm.items.push({ rank: editForm.items.length + 1, name: '', price: null, description: '', imageUrl: '' })"
              >
                + 메뉴 추가
              </button>
            </div>
          </template>

          <!-- Guestbook Edit -->
          <template v-if="editingBlock.type === 'guestbook'">
            <div class="form-group">
              <label class="form-label">제목</label>
              <input type="text" class="form-input" v-model="editForm.title" placeholder="방명록">
            </div>
            <div class="form-group">
              <label class="form-label">최대 글자 수</label>
              <input type="number" class="form-input" v-model="editForm.maxMessageLength" placeholder="200">
            </div>
          </template>

          <!-- Marquee Edit -->
          <template v-if="editingBlock.type === 'marquee'">
            <!-- 콘텐츠 타입 선택 -->
            <div class="form-group">
              <label class="form-label">콘텐츠 타입</label>
              <div class="content-type-selector">
                <button
                  type="button"
                  :class="['type-btn', { active: editForm.contentType === 'text' }]"
                  @click="editForm.contentType = 'text'"
                >
                  텍스트만
                </button>
                <button
                  type="button"
                  :class="['type-btn', { active: editForm.contentType === 'image' }]"
                  @click="editForm.contentType = 'image'"
                >
                  이미지만
                </button>
                <button
                  type="button"
                  :class="['type-btn', { active: editForm.contentType === 'both' }]"
                  @click="editForm.contentType = 'both'"
                >
                  둘 다
                </button>
              </div>
            </div>

            <!-- 텍스트 입력 (text 또는 both 일 때) -->
            <div v-if="editForm.contentType === 'text' || editForm.contentType === 'both'" class="form-group">
              <label class="form-label">공지 텍스트</label>
              <input
                type="text"
                class="form-input"
                v-model="editForm.text"
                placeholder="🎉 오늘의 특가! 아메리카노 50% 할인"
              />
            </div>

            <!-- 이미지 업로드 (image 또는 both 일 때) -->
            <div v-if="editForm.contentType === 'image' || editForm.contentType === 'both'" class="form-group">
              <label class="form-label">배너 이미지</label>
              <div class="marquee-image-upload">
                <input
                  type="file"
                  id="marquee-image-input"
                  accept="image/*"
                  @change="handleMarqueeImageUpload"
                  style="display: none;"
                />
                <label
                  for="marquee-image-input"
                  class="marquee-image-upload-label"
                  :class="{ 'has-image': editForm.imageUrl }"
                >
                  <template v-if="editForm.imageUrl">
                    <img :src="editForm.imageUrl" alt="배너 미리보기" class="marquee-image-preview" />
                    <span class="change-overlay">클릭하여 변경</span>
                  </template>
                  <template v-else>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>클릭하여 이미지 업로드</span>
                  </template>
                </label>
                <button
                  v-if="editForm.imageUrl"
                  type="button"
                  class="btn-remove-image"
                  @click="editForm.imageUrl = ''"
                >
                  이미지 제거
                </button>
              </div>
              <div class="image-spec-info">
                <strong>권장 규격</strong>
                <ul>
                  <li>크기: <code>1200 x 80px</code> (가로로 긴 배너 형태)</li>
                  <li>비율: <code>15:1</code></li>
                  <li>형식: PNG, JPG, GIF, WebP</li>
                  <li>용량: 500KB 이하 권장</li>
                </ul>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">배경색</label>
                <div class="color-input-wrapper">
                  <input type="color" v-model="editForm.backgroundColor" class="color-input" />
                  <span class="color-value">{{ editForm.backgroundColor }}</span>
                </div>
              </div>
              <div class="form-group" v-if="editForm.contentType !== 'image'">
                <label class="form-label">글자색</label>
                <div class="color-input-wrapper">
                  <input type="color" v-model="editForm.textColor" class="color-input" />
                  <span class="color-value">{{ editForm.textColor }}</span>
                </div>
              </div>
            </div>

            <!-- 내부 디자인 설정 -->
            <div class="form-row" v-if="editForm.contentType !== 'image'">
              <div class="form-group">
                <label class="form-label">글자 크기</label>
                <div class="padding-input-wrapper">
                  <input
                    type="number"
                    class="form-input padding-input"
                    v-model.number="editForm.fontSize"
                    min="10"
                    max="30"
                    step="1"
                  />
                  <span class="padding-unit">px</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">내부 상하 여백</label>
                <div class="padding-input-wrapper">
                  <input
                    type="number"
                    class="form-input padding-input"
                    v-model.number="editForm.innerPadding"
                    min="4"
                    max="40"
                    step="2"
                  />
                  <span class="padding-unit">px</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                스크롤 속도
                <span class="speed-badge" :class="getSpeedClass(editForm.speed)">
                  {{ getSpeedLabel(editForm.speed) }}
                </span>
              </label>
              <input type="range" class="form-range" v-model.number="editForm.speed" min="5" max="30" step="1" />
              <div class="range-labels">
                <span>빠름</span>
                <span>느림</span>
              </div>
              <p class="form-hint" style="margin-top: 4px;">
                한 바퀴 도는 데 {{ editForm.speed || 15 }}초 소요
              </p>
            </div>

            <!-- 블록 간 여백 설정 -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">위쪽 블록과 간격</label>
                <div class="padding-input-wrapper">
                  <input
                    type="number"
                    class="form-input padding-input"
                    v-model.number="editForm.paddingTop"
                    min="0"
                    max="100"
                    step="5"
                  />
                  <span class="padding-unit">px</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">아래쪽 블록과 간격</label>
                <div class="padding-input-wrapper">
                  <input
                    type="number"
                    class="form-input padding-input"
                    v-model.number="editForm.paddingBottom"
                    min="0"
                    max="100"
                    step="5"
                  />
                  <span class="padding-unit">px</span>
                </div>
              </div>
            </div>

            <div class="marquee-preview-box">
              <label class="form-label">미리보기</label>
              <div
                class="marquee-preview"
                :style="{
                  backgroundColor: editForm.backgroundColor || '#ff6b6b',
                  color: editForm.textColor || '#ffffff',
                  padding: `${editForm.innerPadding || 8}px 0`
                }"
              >
                <div class="marquee-preview-content">
                  <img
                    v-if="(editForm.contentType === 'image' || editForm.contentType === 'both') && editForm.imageUrl"
                    :src="editForm.imageUrl"
                    alt="배너"
                    class="marquee-preview-image"
                  />
                  <span
                    v-if="editForm.contentType === 'text' || editForm.contentType === 'both'"
                    class="marquee-preview-text"
                    :style="{ fontSize: `${editForm.fontSize || 14}px` }"
                  >
                    {{ editForm.text || '공지사항을 입력하세요' }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <!-- Social Links Edit -->
          <template v-if="editingBlock.type === 'social_links'">
            <div class="form-group">
              <label class="form-label">SNS 링크 관리</label>
              <div v-for="(link, index) in editForm.links" :key="index" class="sns-link-item">
                <div class="sns-icon" :class="'sns-' + link.type">
                  {{ getSnsIcon(link.type) }}
                </div>
                <select class="form-input sns-select" v-model="link.type">
                  <option value="instagram">Instagram</option>
                  <option value="threads">Threads</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter (X)</option>
                  <option value="tiktok">TikTok</option>
                  <option value="naver">네이버 블로그</option>
                  <option value="website">Website</option>
                </select>
                <input type="text" class="form-input sns-url-input" v-model="link.url" placeholder="https://...">
                <button class="btn-delete-sns" @click="editForm.links.splice(index, 1)" title="삭제">
                  <span>×</span>
                </button>
              </div>
              <button class="btn-action btn-secondary" @click="editForm.links.push({ type: 'instagram', url: '' })" style="width: 100%; margin-top: 8px;">
                + 링크 추가
              </button>
            </div>
          </template>

          <!-- Video Grid Edit -->
          <template v-if="editingBlock.type === 'video_grid'">
            <div class="form-group">
              <label class="form-label">레이아웃</label>
              <select class="form-input" v-model="editForm.layout">
                <option value="grid-2">2단 그리드</option>
                <option value="grid-3">3단 그리드</option>
                <option value="list">리스트</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">영상 관리</label>
              <div class="video-grid-container">
                <div v-for="(video, index) in editForm.videos" :key="index" class="video-item-card">
                  <div v-if="video.thumbnail" class="video-thumbnail">
                    <img :src="video.thumbnail" alt="썸네일">
                    <button class="btn-delete-video" @click="editForm.videos.splice(index, 1)" title="삭제">
                      <span>×</span>
                    </button>
                  </div>
                  <div v-else class="video-placeholder" @click="() => {}">
                    <span class="placeholder-icon">V</span>
                    <button class="btn-delete-video" @click="editForm.videos.splice(index, 1)" title="삭제">
                      <span>×</span>
                    </button>
                  </div>
                  <input type="text" class="form-input video-title-input" v-model="video.title" placeholder="제목">
                  <input
                    type="text"
                    class="form-input video-url-input"
                    v-model="video.url"
                    @blur="updateVideoThumbnail(video)"
                    @keyup.enter="updateVideoThumbnail(video)"
                    placeholder="YouTube URL"
                  >
                </div>
                <div class="video-add-card" @click="editForm.videos.push({ title: '', url: '', thumbnail: '' })">
                  <span class="add-icon">+</span>
                  <span class="add-text">영상 추가</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Games Carousel Edit -->
          <template v-if="editingBlock.type === 'games_carousel'">
            <div class="form-group">
              <label class="form-label">리더보드 표시</label>
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" v-model="editForm.showLeaderboard">
                <span>게임 리더보드 보이기</span>
              </label>
            </div>
            <div class="form-group">
              <label class="form-label">활성화된 게임</label>
              <div v-for="game in editForm.gamesOrder" :key="game.type" style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f9fafb; border-radius: 8px;">
                  <input type="checkbox" :value="game.type" v-model="editForm.enabledGames">
                  <span>{{ game.icon }} {{ game.name }}</span>
                </label>
              </div>
            </div>
          </template>

        </div>

<div class="modal-actions">
          <button class="btn-action btn-secondary" @click="cancelEdit">취소</button>
          <button class="btn-action btn-primary" @click="saveBlockEdit">저장</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, type Component } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import draggable from 'vuedraggable'
import type { Block, BlockType } from '@/types/blocks'
import gameSettingsService from '@/services/gameSettingsService'
import apiClient from '@/services/api'

// Import block components
import HeaderBlock from '@/components/blocks/HeaderBlock.vue'
import ButtonBlock from '@/components/blocks/ButtonBlock.vue'
import SocialLinksBlock from '@/components/blocks/SocialLinksBlock.vue'
import VideoGridBlock from '@/components/blocks/VideoGridBlock.vue'
import GamesCarouselBlock from '@/components/blocks/GamesCarouselBlock.vue'
import PopularMenuBlock from '@/components/blocks/PopularMenuBlock.vue'
import ImageBlock from '@/components/blocks/ImageBlock.vue'
import CountdownBlock from '@/components/blocks/CountdownBlock.vue'
import GuestbookBlock from '@/components/blocks/GuestbookBlock.vue'
import MarqueeBlock from '@/components/blocks/MarqueeBlock.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Get QR Code ID from authenticated user (not from URL parameter)
const qrCodeId = ref<string>('')
const isLoading = ref(true)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Landing page settings (from QR management)
const landingPageSettings = ref<any>(null)

// Blocks data - will be loaded from API
const blocks = ref<Block[]>([])

const showAddBlockModal = ref(false)
const editingBlock = ref<Block | null>(null)
const editForm = ref<any>({})
const previewDevice = ref<'mobile' | 'desktop'>('mobile')

// File upload state
const backgroundImageInput = ref<HTMLInputElement | null>(null)
const backgroundImageUploading = ref(false)

// Page theme settings - will be loaded from API
const pageTheme = ref({
  backgroundColor: '#121212',
  textColor: '#ffffff',
  bgmUrl: '' // 배경음악 URL
})

// BGM 설정 모달 상태
const showBgmModal = ref(false)
const bgmPreviewAudio = ref<HTMLAudioElement | null>(null)
const isBgmPreviewing = ref(false)
const bgmInputType = ref<'url' | 'file'>('file') // 기본값: 파일 업로드
const bgmFileUploading = ref(false)
const bgmFileName = ref('')

// Available block types
const availableBlockTypes = [
  { type: 'marquee', icon: '📢', name: '마퀴(전광판)', description: '흐르는 공지사항' },
  { type: 'button', icon: 'B', name: '버튼', description: '링크 버튼 추가' },
  { type: 'social_links', icon: 'S', name: 'SNS 링크', description: '소셜 미디어 링크' },
  { type: 'video_grid', icon: 'V', name: '영상', description: 'YouTube Shorts' },
  { type: 'games_carousel', icon: 'G', name: '게임', description: '게임 캐러셀' },
  { type: 'popular_menu', icon: 'M', name: '메뉴', description: '인기 메뉴' },
  { type: 'image', icon: 'I', name: '이미지', description: '이미지 추가' },
  { type: 'countdown', icon: 'C', name: '카운트다운', description: '이벤트 타이머' },
  { type: 'guestbook', icon: 'N', name: '방명록', description: '손글씨 방명록' }
]

// Load layout from API on mount
onMounted(async () => {
  // Router navigation guard already handles authentication and admin role check
  // User data should already be loaded by router guard

  // Get QR code ID from authenticated user
  if (!authStore.user?.qrCodeId) {
    console.error('[LayoutEditor] No QR code ID found for user')
    alert('QR 코드를 찾을 수 없습니다. QR 관리에서 QR 코드를 먼저 생성해주세요.')
    // Use router.replace instead of push to prevent infinite loop
    router.replace('/admin')
    return
  }

  qrCodeId.value = authStore.user.qrCodeId
  console.log('[LayoutEditor] Loading layout for QR code:', qrCodeId.value)

  await loadLandingPageSettings()
  await loadLayout()
})

// Load landing page settings first
async function loadLandingPageSettings() {
  if (!qrCodeId.value) return

  try {
    // QR 코드 UUID로 설정 조회 (QRManagement와 동일하게 apiClient 사용)
    const response = await apiClient.get(`/api/landingpage/settings/${encodeURIComponent(qrCodeId.value)}`)
    landingPageSettings.value = response.data
    console.log('Loaded landing page settings:', landingPageSettings.value)
  } catch {
    // 설정 로드 실패 시 조용히 처리 (기본값 사용)
  }
}

// Get default blocks for new layouts
function getDefaultBlocks(): Block[] {
  // Use landing page settings if available
  const storeName = landingPageSettings.value?.storeName || '매장명을 입력하세요'
  const welcomeMessage = landingPageSettings.value?.welcomeMessage || '환영합니다!\n\n📶 WiFi 정보\n🕐 영업시간\n📞 연락처'
  const logoUrl = landingPageSettings.value?.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'

  return [
    {
      id: 'header-001',
      type: 'header',
      order: 0,
      isVisible: true,
      fixed: true,
      data: {
        storeName: storeName,
        backgroundImage: logoUrl,
        welcomeMessage: welcomeMessage,
        gradientOverlay: {
          enabled: true,
          startOpacity: 0,
          endOpacity: 100,
          color: pageTheme.value.backgroundColor
        }
      }
    }
  ]
}

// Load layout from API
async function loadLayout() {
  if (!qrCodeId.value) {
    console.error('QR Code ID is required')
    alert('QR 코드 ID가 필요합니다')
    router.back()
    return
  }

  try {
    isLoading.value = true
    const response = await fetch(`${API_BASE_URL}/api/landingpage/layout/${qrCodeId.value}`)

    if (response.ok) {
      const layout = await response.json()

      // Parse blocks from JSON
      if (layout.blocksJson) {
        const parsedBlocks = JSON.parse(layout.blocksJson)
        // If blocks exist and have content, use them; otherwise use default blocks with header
        if (parsedBlocks && parsedBlocks.length > 0) {
          // Ensure header block exists (some old layouts might not have it)
          const hasHeader = parsedBlocks.some((block: Block) => block.type === 'header')
          if (!hasHeader) {
            // Add header block at the beginning
            const defaultBlocks = getDefaultBlocks()
            blocks.value = [...defaultBlocks, ...parsedBlocks]
          } else {
            blocks.value = parsedBlocks
          }
        } else {
          // Empty layout - add default header block
          blocks.value = getDefaultBlocks()
        }
      } else {
        // Use default blocks if no blocksJson
        blocks.value = getDefaultBlocks()
      }

      // Parse theme from JSON if exists
      if (layout.themeJson) {
        pageTheme.value = JSON.parse(layout.themeJson)
      }
    } else if (response.status === 404) {
      // Layout doesn't exist yet, use default blocks
      console.log('No layout found for this QR code, using default blocks')
      blocks.value = getDefaultBlocks()
    } else {
      throw new Error('Failed to load layout')
    }
  } catch (error) {
    console.error('Error loading layout:', error)
    // On error, use default blocks instead of showing alert
    console.log('Using default blocks due to error')
    blocks.value = getDefaultBlocks()
  } finally {
    isLoading.value = false
  }
}

// Computed
const visibleBlocks = computed(() => {
  return blocks.value
    .filter(block => block.isVisible)
    .sort((a, b) => a.order - b.order)
})

// Methods
function getBlockComponent(type: string): Component | string {
  const components: Record<string, Component> = {
    header: HeaderBlock,
    button: ButtonBlock,
    social_links: SocialLinksBlock,
    video_grid: VideoGridBlock,
    games_carousel: GamesCarouselBlock,
    popular_menu: PopularMenuBlock,
    image: ImageBlock,
    countdown: CountdownBlock,
    guestbook: GuestbookBlock,
    marquee: MarqueeBlock
  }
  return components[type] || 'div'
}

function getBlockIcon(type: string): string {
  const icons: Record<string, string> = {
    header: 'H',
    button: 'B',
    social_links: 'S',
    video_grid: 'V',
    games_carousel: 'G',
    popular_menu: 'M',
    image: 'I',
    countdown: '⏱',
    guestbook: '✍',
    marquee: '📢'
  }
  return icons[type] || '□'
}

function getBlockTitle(type: string): string {
  const titles: Record<string, string> = {
    header: '헤더',
    button: '버튼',
    social_links: 'SNS 링크',
    video_grid: '영상 그리드',
    games_carousel: '게임 캐러셀',
    popular_menu: '인기 메뉴',
    image: '이미지',
    countdown: '카운트다운',
    guestbook: '방명록',
    marquee: '마퀴(전광판)'
  }
  return titles[type] || '블록'
}

// 마퀴 속도 라벨
function getSpeedLabel(speed: number): string {
  if (speed <= 8) return '매우 빠름'
  if (speed <= 12) return '빠름'
  if (speed <= 18) return '보통'
  if (speed <= 24) return '느림'
  return '매우 느림'
}

function getSpeedClass(speed: number): string {
  if (speed <= 8) return 'speed-very-fast'
  if (speed <= 12) return 'speed-fast'
  if (speed <= 18) return 'speed-normal'
  if (speed <= 24) return 'speed-slow'
  return 'speed-very-slow'
}

function getBlockPreview(block: Block): string {
  switch (block.type) {
    case 'header':
      return (block.data as any).storeName || '매장명 없음'
    case 'button':
      return (block.data as any).text || '버튼 텍스트 없음'
    case 'social_links':
      return `${(block.data as any).links?.length || 0}개 링크`
    case 'video_grid':
      return `${(block.data as any).videos?.length || 0}개 영상`
    case 'games_carousel':
      return `${(block.data as any).enabledGames?.length || 0}개 게임`
    case 'popular_menu':
      return `${(block.data as any).items?.length || 0}개 메뉴`
    case 'marquee':
      return (block.data as any).text || '공지사항 없음'
    default:
      return ''
  }
}

// 드래그 이동 가능 여부 체크 (헤더는 항상 첫 번째)
function checkMove(evt: any) {
  const draggedElement = evt.draggedContext.element
  const targetIndex = evt.draggedContext.futureIndex

  // 헤더 블록은 드래그 불가
  if (draggedElement.type === 'header') {
    return false
  }

  // 다른 블록을 헤더 위로 드래그 불가 (index 0)
  if (targetIndex === 0) {
    return false
  }

  return true
}

function onDragEnd() {
  // 헤더가 항상 첫 번째에 오도록 정렬
  const headerBlock = blocks.value.find(b => b.type === 'header')
  const otherBlocks = blocks.value.filter(b => b.type !== 'header')

  if (headerBlock) {
    blocks.value = [headerBlock, ...otherBlocks]
  }

  blocks.value.forEach((block, index) => {
    block.order = index
  })
}

function addBlock(type: BlockType) {
  const newBlock: any = {
    id: `${type}-${Date.now()}`,
    type,
    order: blocks.value.length,
    isVisible: true,
    data: getDefaultBlockData(type)
  }
  blocks.value.push(newBlock)
  showAddBlockModal.value = false
}

function getDefaultBlockData(type: BlockType): any {
  switch (type) {
    case 'header':
      return {
        storeName: '',
        backgroundImage: '',
        welcomeMessage: '',
        gradientOverlay: {
          enabled: true,
          startOpacity: 0,
          endOpacity: 100,
          color: pageTheme.value.backgroundColor
        }
      }
    case 'button':
      return { text: '새 버튼', url: '', style: 'primary' }
    case 'social_links':
      return { links: [] }
    case 'video_grid':
      return { videos: [], layout: 'grid-2' }
    case 'games_carousel':
      return {
        enabledGames: ['pinball', 'memory', 'spot-difference'],
        showLeaderboard: true,
        gamesOrder: [
          { type: 'pinball', name: '핀볼', icon: '🎯' },
          { type: 'brick-breaker', name: '벽돌깨기', icon: '🧱' },
          { type: 'memory', name: '같은 카드 찾기', icon: '🃏' },
          { type: 'spot-difference', name: '틀린 그림 찾기', icon: '🔍' }
        ]
      }
    case 'popular_menu':
      return { title: '인기 메뉴', subtitle: '', items: [] }
    case 'image':
      return { imageUrl: '', caption: '', aspectRatio: '16:9' }
    case 'countdown':
      return {
        title: '이벤트 카운트다운',
        description: '곧 특별한 이벤트가 시작됩니다!',
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        style: 'card'
      }
    case 'guestbook':
      return {
        title: '방명록',
        messages: [],
        maxMessageLength: 200,
        textColor: '#374151'
      }
    case 'marquee':
      return {
        text: '🎉 오늘의 특가! 아메리카노 50% 할인',
        emoji: '',
        backgroundColor: '#ff6b6b',
        textColor: '#ffffff',
        speed: 15,
        imageUrl: '',
        contentType: 'text', // 'text' | 'image' | 'both'
        paddingTop: 5, // 블록 간 위쪽 여백
        paddingBottom: 5, // 블록 간 아래쪽 여백
        fontSize: 14, // 글자 크기
        innerPadding: 8 // 내부 상하 여백
      }
    default:
      return {}
  }
}

async function editBlock(block: Block) {
  editingBlock.value = block
  editForm.value = JSON.parse(JSON.stringify(block.data))

  // Ensure gradientOverlay exists for header blocks
  if (block.type === 'header') {
    if (!editForm.value.gradientOverlay) {
      editForm.value.gradientOverlay = {
        enabled: true,
        startOpacity: 0,
        endOpacity: 100,
        color: pageTheme.value.backgroundColor
      }
    }
    // 폰트 기본값 설정
    if (!editForm.value.titleFontFamily) {
      editForm.value.titleFontFamily = 'default'
    }
    if (!editForm.value.titleFontSize) {
      editForm.value.titleFontSize = 32
    }
    if (!editForm.value.descFontSize) {
      editForm.value.descFontSize = 15
    }
  }

  // Ensure links array exists for social_links blocks
  if (block.type === 'social_links' && !editForm.value.links) {
    editForm.value.links = []
  }

  // Ensure videos array exists for video_grid blocks
  if (block.type === 'video_grid') {
    if (!editForm.value.videos) {
      editForm.value.videos = []
    }
    if (!editForm.value.layout) {
      editForm.value.layout = 'grid-2'
    }
  }

  // Load game settings from API for games_carousel blocks
  if (block.type === 'games_carousel') {
    try {
      const settings = await gameSettingsService.getGameSettings(qrCodeId.value)

      // Game definitions matching GamesTab
      const gameDefinitions: Record<string, { name: string; icon: string }> = {
        'pinball': { name: '핀볼', icon: '🎯' },
        'brick-breaker': { name: '벽돌깨기', icon: '🧱' },
        'memory': { name: '같은 카드 찾기', icon: '🃏' },
        'spot-difference': { name: '틀린 그림 찾기', icon: '🔍' }
      }

      // Update enabled games from API
      editForm.value.enabledGames = settings.enabledGames

      // Update games order from API or create from enabled games
      if (settings.gamesOrder && settings.gamesOrder.length > 0) {
        editForm.value.gamesOrder = settings.gamesOrder.map(order => ({
          type: order.type,
          name: gameDefinitions[order.type]?.name || order.type,
          icon: gameDefinitions[order.type]?.icon || '🎮'
        }))
      } else {
        // Create games order from enabled games
        editForm.value.gamesOrder = settings.enabledGames.map(gameId => ({
          type: gameId,
          name: gameDefinitions[gameId]?.name || gameId,
          icon: gameDefinitions[gameId]?.icon || '🎮'
        }))
      }

      console.log('Game settings loaded for carousel:', settings)
    } catch (error) {
      console.error('Failed to load game settings:', error)
      // Fallback to default games if API fails
      if (!editForm.value.gamesOrder || editForm.value.gamesOrder.length === 0) {
        editForm.value.gamesOrder = [
          { type: 'pinball', name: '핀볼', icon: '🎯' },
          { type: 'memory', name: '같은 카드 찾기', icon: '🃏' },
          { type: 'spot-difference', name: '틀린 그림 찾기', icon: '🔍' }
        ]
      }
      if (!editForm.value.enabledGames || editForm.value.enabledGames.length === 0) {
        editForm.value.enabledGames = ['pinball', 'memory', 'spot-difference']
      }
    }
  }

  // Ensure marquee block has default values
  if (block.type === 'marquee') {
    if (editForm.value.speed === undefined || editForm.value.speed === null) {
      editForm.value.speed = 15
    }
    if (editForm.value.paddingTop === undefined || editForm.value.paddingTop === null) {
      editForm.value.paddingTop = 5
    }
    if (editForm.value.paddingBottom === undefined || editForm.value.paddingBottom === null) {
      editForm.value.paddingBottom = 5
    }
    if (editForm.value.fontSize === undefined || editForm.value.fontSize === null) {
      editForm.value.fontSize = 14
    }
    if (editForm.value.innerPadding === undefined || editForm.value.innerPadding === null) {
      editForm.value.innerPadding = 8
    }
    if (!editForm.value.contentType) {
      editForm.value.contentType = 'text'
    }
  }

  // Convert ISO date to datetime-local format for countdown blocks
  if (block.type === 'countdown' && editForm.value.targetDate) {
    // ISO format: 2024-12-17T12:00:00.000Z
    // datetime-local format: 2024-12-17T12:00
    const date = new Date(editForm.value.targetDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    editForm.value.targetDate = `${year}-${month}-${day}T${hours}:${minutes}`
  }
}

function getGradientPreview(overlay: any): string {
  const color = overlay.color || '#121212'
  const startOpacity = (overlay.startOpacity ?? 0) / 100
  const endOpacity = (overlay.endOpacity ?? 100) / 100

  // Convert hex to rgb
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  return `linear-gradient(
    to bottom,
    rgba(${r}, ${g}, ${b}, ${startOpacity}) 0%,
    rgba(${r}, ${g}, ${b}, ${startOpacity + (endOpacity - startOpacity) * 0.4}) 40%,
    rgba(${r}, ${g}, ${b}, ${startOpacity + (endOpacity - startOpacity) * 0.7}) 70%,
    rgba(${r}, ${g}, ${b}, ${startOpacity + (endOpacity - startOpacity) * 0.95}) 90%,
    rgba(${r}, ${g}, ${b}, ${endOpacity}) 100%
  )`
}

function cancelEdit() {
  editingBlock.value = null
  editForm.value = {}
}

function saveBlockEdit() {
  if (editingBlock.value) {
    const formData = JSON.parse(JSON.stringify(editForm.value))

    // Convert datetime-local back to ISO format for countdown blocks
    if (editingBlock.value.type === 'countdown' && formData.targetDate) {
      formData.targetDate = new Date(formData.targetDate).toISOString()
    }

    // Ensure marquee numeric fields have valid values
    if (editingBlock.value.type === 'marquee') {
      // speed: 빈 값이면 기본값 15, 숫자로 변환
      formData.speed = formData.speed === '' || formData.speed === undefined || formData.speed === null
        ? 15
        : Number(formData.speed)
      // paddingTop: 빈 값이면 기본값 5, 숫자로 변환
      formData.paddingTop = formData.paddingTop === '' || formData.paddingTop === undefined || formData.paddingTop === null
        ? 5
        : Number(formData.paddingTop)
      // paddingBottom: 빈 값이면 기본값 5, 숫자로 변환
      formData.paddingBottom = formData.paddingBottom === '' || formData.paddingBottom === undefined || formData.paddingBottom === null
        ? 5
        : Number(formData.paddingBottom)
      // fontSize: 빈 값이면 기본값 14, 숫자로 변환
      formData.fontSize = formData.fontSize === '' || formData.fontSize === undefined || formData.fontSize === null
        ? 14
        : Number(formData.fontSize)
      // innerPadding: 빈 값이면 기본값 8, 숫자로 변환
      formData.innerPadding = formData.innerPadding === '' || formData.innerPadding === undefined || formData.innerPadding === null
        ? 8
        : Number(formData.innerPadding)
    }

    // Save to block data
    editingBlock.value.data = formData
  }
  // Close modal
  editingBlock.value = null
  editForm.value = {}
}

function deleteBlock(index: number) {
  if (confirm('정말 삭제하시겠습니까?')) {
    blocks.value.splice(index, 1)
  }
}

function toggleBlockVisibility(block: Block) {
  block.isVisible = !block.isVisible
}

// YouTube URL에서 비디오 ID 추출
function extractYouTubeId(url: string): string | null {
  if (!url) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

// YouTube 썸네일 URL 생성
function generateYouTubeThumbnail(url: string): string {
  const videoId = extractYouTubeId(url)
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
  return ''
}

// SNS 아이콘 텍스트 반환
function getSnsIcon(type: string): string {
  const icons: Record<string, string> = {
    instagram: 'IG',
    threads: 'TH',
    facebook: 'FB',
    youtube: 'YT',
    twitter: 'X',
    tiktok: 'TT',
    naver: 'NV',
    website: 'WB'
  }
  return icons[type] || 'LK'
}

// 영상 URL 변경 시 썸네일 자동 생성
function updateVideoThumbnail(video: any) {
  // 즉시 썸네일 생성 시도
  if (!video.url) {
    video.thumbnail = ''
    return
  }

  const thumbnail = generateYouTubeThumbnail(video.url)
  if (thumbnail) {
    video.thumbnail = thumbnail
    console.log('썸네일 생성 성공:', thumbnail, 'URL:', video.url)
  } else {
    console.log('썸네일 생성 실패 - 유효한 YouTube URL이 아닙니다:', video.url)
  }
}

// 이미지 파일 업로드
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(`${API_BASE_URL}/api/FileUpload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: formData
    })

    if (!response.ok) {
      // 서버 에러 메시지 파싱 시도
      let errorMessage = '이미지 업로드 실패'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // JSON 파싱 실패 시 상태 코드 기반 메시지
        if (response.status === 400) {
          errorMessage = '이미지 형식이 올바르지 않습니다.'
        } else if (response.status === 401) {
          errorMessage = '로그인이 필요합니다.'
        } else if (response.status === 413) {
          errorMessage = '파일 크기가 너무 큽니다.'
        }
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data.fileUrl
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.')
    }
    throw error
  }
}

// 이미지 리사이징 함수 (썸네일용)
async function resizeImage(file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      let { width, height } = img

      // 비율 유지하면서 리사이징
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // 고품질 리사이징
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'))
            return
          }
          // 원본 파일명 유지하면서 새 File 생성
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(resizedFile)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// 이미지 파일 선택 핸들러
async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    try {
      const url = await uploadImage(input.files[0])
      editForm.value.imageUrl = url
    } catch (error) {
      console.error('Image upload failed:', error)
    }
  }
}

function goBack() {
  // QR 관리 탭으로 리다이렉트
  router.push('/admin?tab=qr')
}

// BGM 관련 함수들
function toggleBgmPreview() {
  if (!pageTheme.value.bgmUrl) return

  if (isBgmPreviewing.value) {
    // 정지
    if (bgmPreviewAudio.value) {
      bgmPreviewAudio.value.pause()
      bgmPreviewAudio.value.currentTime = 0
    }
    isBgmPreviewing.value = false
  } else {
    // 재생
    if (!bgmPreviewAudio.value) {
      bgmPreviewAudio.value = new Audio(pageTheme.value.bgmUrl)
      bgmPreviewAudio.value.volume = 0.5
      bgmPreviewAudio.value.onended = () => {
        isBgmPreviewing.value = false
      }
      bgmPreviewAudio.value.onerror = () => {
        alert('음악을 재생할 수 없습니다. URL을 확인해주세요.')
        isBgmPreviewing.value = false
      }
    } else {
      bgmPreviewAudio.value.src = pageTheme.value.bgmUrl
    }
    bgmPreviewAudio.value.play()
    isBgmPreviewing.value = true
  }
}

function removeBgm() {
  if (bgmPreviewAudio.value) {
    bgmPreviewAudio.value.pause()
    bgmPreviewAudio.value = null
  }
  isBgmPreviewing.value = false
  pageTheme.value.bgmUrl = ''
  bgmFileName.value = ''
}

function closeBgmModal() {
  if (bgmPreviewAudio.value) {
    bgmPreviewAudio.value.pause()
  }
  isBgmPreviewing.value = false
  showBgmModal.value = false
}

// 오디오 파일 업로드
async function uploadAudio(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const endpoints = [
    '/api/FileUpload/audio',  // 1순위: 오디오 전용 엔드포인트
    '/api/FileUpload/file',   // 2순위: 범용 파일 엔드포인트
    '/api/FileUpload/image'   // 3순위: 이미지 엔드포인트 (임시 해결책)
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`[uploadAudio] Success with endpoint: ${endpoint}`)
        return data.fileUrl
      }

      // 405 Method Not Allowed는 다음 엔드포인트 시도
      if (response.status === 405) {
        console.log(`[uploadAudio] ${endpoint} returned 405, trying next...`)
        continue
      }

      // 400 Bad Request (파일 타입 불일치 등)는 다음 엔드포인트 시도
      if (response.status === 400) {
        console.log(`[uploadAudio] ${endpoint} returned 400, trying next...`)
        continue
      }

      // 401/403은 인증 문제이므로 바로 에러
      if (response.status === 401 || response.status === 403) {
        throw new Error('로그인이 필요합니다.')
      }

      // 413은 파일 크기 문제
      if (response.status === 413) {
        throw new Error('파일 크기가 너무 큽니다.')
      }
    } catch (error) {
      // TypeError는 네트워크 에러
      if (error instanceof TypeError) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.')
      }
      // 다른 에러는 그대로 전달
      if (error instanceof Error && error.message !== '') {
        throw error
      }
    }
  }

  // 모든 시도 실패
  throw new Error('서버에서 오디오 업로드를 지원하지 않습니다. 관리자에게 문의하세요.')
}

// BGM 파일 선택 핸들러
async function handleBgmFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  const file = input.files[0]

  // 파일 크기 체크 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('파일 크기는 10MB 이하만 가능합니다.')
    return
  }

  // 파일 타입 체크
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/mp4']
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
    alert('MP3, WAV, OGG, M4A 파일만 업로드 가능합니다.')
    return
  }

  bgmFileUploading.value = true

  try {
    const url = await uploadAudio(file)
    pageTheme.value.bgmUrl = url
    bgmFileName.value = file.name
  } catch (error) {
    alert('오디오 파일 업로드에 실패했습니다.')
    console.error('BGM upload failed:', error)
  } finally {
    bgmFileUploading.value = false
    // input 초기화 (같은 파일 다시 선택 가능하게)
    input.value = ''
  }
}

// 마퀴 이미지 업로드 핸들러
async function handleMarqueeImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  const file = input.files[0]

  // 파일 크기 체크 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('이미지 파일 크기는 2MB 이하만 가능합니다.')
    return
  }

  try {
    const url = await uploadImage(file)
    editForm.value.imageUrl = url
  } catch (error) {
    alert('이미지 업로드에 실패했습니다.')
    console.error('Marquee image upload failed:', error)
  } finally {
    input.value = ''
  }
}

// 메뉴 아이템 이미지 업로드 핸들러 (썸네일용 리사이징 적용)
async function handleMenuImageUpload(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  let file = input.files[0]

  // 파일 크기 체크 (원본 기준 5MB - 리사이징 후 작아짐)
  if (file.size > 5 * 1024 * 1024) {
    alert('이미지 파일 크기는 5MB 이하만 가능합니다.')
    return
  }

  try {
    // 메뉴 썸네일용 리사이징 (144x144 - 72px의 2배 for Retina)
    // 품질 0.85로 설정하여 용량 절감
    const resizedFile = await resizeImage(file, 144, 144, 0.85)
    console.log(`Menu image resized: ${file.size} bytes -> ${resizedFile.size} bytes`)

    const url = await uploadImage(resizedFile)
    if (editForm.value.items && editForm.value.items[index]) {
      editForm.value.items[index].imageUrl = url
    }
  } catch (error) {
    alert('이미지 업로드에 실패했습니다.')
    console.error('Menu image upload failed:', error)
  } finally {
    input.value = ''
  }
}

async function saveLayout() {
  if (!qrCodeId.value) {
    alert('QR 코드 ID가 필요합니다')
    return
  }

  try {
    isLoading.value = true

    // 저장하기 전에 블록 순서 재정렬
    blocks.value.forEach((block, index) => {
      block.order = index
    })

    const payload = {
      qrCodeId: qrCodeId.value,
      blocksJson: JSON.stringify(blocks.value),
      themeJson: JSON.stringify(pageTheme.value)
    }

    const response = await fetch(`${API_BASE_URL}/api/landingpage/layout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('Failed to save layout')
    }

    alert('레이아웃이 저장되었습니다!')
  } catch (error) {
    console.error('Error saving layout:', error)
    alert('레이아웃 저장 중 오류가 발생했습니다')
  } finally {
    isLoading.value = false
  }
}

// Social Links helpers
function addSocialLink() {
  if (!editForm.value.links) editForm.value.links = []
  editForm.value.links.push({ platform: 'instagram', url: '' })
}

function removeSocialLink(index: number) {
  editForm.value.links.splice(index, 1)
}

// Background image upload functions
async function handleBackgroundImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    alert('파일 크기는 2MB 이하여야 합니다.')
    return
  }

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    alert('PNG, JPG, SVG 파일만 업로드 가능합니다.')
    return
  }

  try {
    backgroundImageUploading.value = true

    // Create FormData and upload
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/FileUpload/background`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to upload image')
    }

    const data = await response.json()

    if (data.success && data.fileUrl) {
      editForm.value.backgroundImage = data.fileUrl
    } else {
      throw new Error(data.message || 'Upload failed')
    }
  } catch (error) {
    console.error('Error uploading background image:', error)
    alert('이미지 업로드 중 오류가 발생했습니다.')
  } finally {
    backgroundImageUploading.value = false
    // Reset file input
    if (backgroundImageInput.value) {
      backgroundImageInput.value.value = ''
    }
  }
}

function removeBackgroundImage() {
  if (confirm('배경 이미지를 삭제하시겠습니까?')) {
    editForm.value.backgroundImage = ''
  }
}

// Video helpers
function addVideo() {
  if (!editForm.value.videos) editForm.value.videos = []
  editForm.value.videos.push({ url: '', thumbnail: '' })
}

function removeVideo(index: number) {
  editForm.value.videos.splice(index, 1)
}

// Menu helpers
function addMenuItem() {
  if (!editForm.value.items) editForm.value.items = []
  editForm.value.items.push({ rank: editForm.value.items.length + 1, name: '', price: 0 })
}

function removeMenuItem(index: number) {
  editForm.value.items.splice(index, 1)
}
</script>

<style scoped>
/* --- Design Tokens (LayoutEditor Style) --- */
:root {
  --primary-blue: #0071e3;
  --primary-dark: #0077ed;
  --bg-body: #f5f5f7;
  --bg-white: #ffffff;
  --text-dark: #1d1d1f;
  --text-gray: #86868b;
  --border-light: #e5e5ea;
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.layout-editor {
  background-color: #f5f5f7;
  color: #1d1d1f;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Noto Sans KR', sans-serif;
}

/* Header */
.editor-header {
  height: 70px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid #e5e5ea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  z-index: 100;
}

.header-left { display: flex; align-items: center; gap: 16px; }
.btn-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: #f5f5f7; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.header-title h1 { font-size: 18px; font-weight: 700; margin: 0; color: #1d1d1f; }
.header-subtitle { font-size: 12px; color: #86868b; margin: 0; }

.header-actions { display: flex; gap: 12px; }
.btn-action {
  padding: 10px 20px; border-radius: 20px; font-size: 14px;
  font-weight: 600; cursor: pointer; border: none;
  display: flex; align-items: center; gap: 6px;
  transition: all 0.2s;
}
.btn-secondary { background: white; border: 1px solid #d2d2d7; color: #1d1d1f; }
.btn-secondary:hover { background: #f5f5f7; }
.btn-primary { background: #0071e3; color: white; }
.btn-primary:hover { background: #0077ed; transform: translateY(-1px); }

/* Main Layout */
.editor-container {
  display: grid;
  grid-template-columns: 420px 1fr;
  flex: 1;
  overflow: hidden;
}

/* Left Panel */
.editor-panel {
  background: white;
  border-right: 1px solid #e5e5ea;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 24px; border-bottom: 1px solid #e5e5ea;
  display: flex; justify-content: space-between; align-items: center;
}
.panel-title { display: flex; align-items: center; }
.panel-title h2 { font-size: 18px; font-weight: 700; margin: 0; color: #1d1d1f; }
.block-count { background: #f5f5f7; padding: 4px 10px; border-radius: 12px; font-size: 12px; margin-left: 8px; color: #1d1d1f; }
.btn-add-block {
  padding: 8px 16px; background: #e8f2ff; color: #0071e3;
  border: none; border-radius: 16px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.btn-add-block:hover { background: #d0e7ff; }

.blocks-list {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 12px; background: #fafafa;
}

/* Block Item */
.block-item {
  background: white; border-radius: 16px; padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.02);
  display: flex; align-items: center; gap: 12px; cursor: grab;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
}
.block-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.block-item.fixed { background: #fffdf5; border-color: #fff3cd; }

/* Animation classes for draggable */
.sortable-ghost {
  opacity: 0.4;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
}
.sortable-drag {
  opacity: 1;
  background: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: scale(1.02);
  z-index: 999;
}

.drag-handle {
  width: 24px;
  height: 40px;
  color: #86868b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  flex-shrink: 0;
  border-radius: 6px;
  transition: all 0.2s;
}
.drag-handle:hover { background: #f5f5f7; color: #1d1d1f; }
.drag-handle.disabled { cursor: default; color: #d2d2d7; }
.drag-handle.disabled:hover { background: transparent; color: #d2d2d7; }
.drag-handle:active { cursor: grabbing; }

.block-icon {
  width: 40px; height: 40px; background: #f5f5f7;
  border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;
  flex-shrink: 0;
}
.fixed .block-icon { background: #fff3cd; }

.block-info { flex: 1; min-width: 0; }
.block-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.block-title { font-size: 15px; font-weight: 600; color: #1d1d1f; }
.block-preview { font-size: 13px; color: #86868b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
.badge.fixed { background: #fff3cd; color: #b78a0b; }
.badge.hidden { background: #e5e5ea; color: #86868b; }

.block-actions { display: flex; gap: 4px; opacity: 0.6; transition: 0.2s; }
.block-item:hover .block-actions { opacity: 1; }
.btn-icon {
  width: 32px; height: 32px; border: none; background: transparent;
  cursor: pointer; color: #86868b; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.btn-icon:hover { color: #1d1d1f; background: #f5f5f7; }
.btn-icon.delete:hover { color: #ff3b30; background: #fff0f3; }

/* Empty State */
.empty-state {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; color: #86868b; padding: 40px;
}
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h3 { font-size: 18px; font-weight: 600; margin: 0 0 8px 0; color: #1d1d1f; }
.empty-state p { font-size: 14px; margin: 0 0 20px 0; }
.btn-add-large {
  padding: 14px 28px; background: #0071e3; color: white;
  border: none; border-radius: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.btn-add-large:hover { background: #0077ed; transform: translateY(-1px); }

/* Right Panel */
.preview-panel {
  background: #f2f2f7; display: flex; flex-direction: column;
}

.preview-toolbar {
  padding: 16px 24px; display: flex; justify-content: center; gap: 20px; align-items: center;
  background: white; border-bottom: 1px solid #e5e5ea;
}
.segmented-control {
  background: #e3e3e8; padding: 4px; border-radius: 12px; display: flex; gap: 4px;
}
.segment-btn {
  padding: 6px 24px; border: none; border-radius: 8px; font-size: 13px;
  font-weight: 600; color: #86868b; background: transparent; cursor: pointer;
  transition: all 0.2s;
}
.segment-btn.active { background: white; color: #1d1d1f; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

.theme-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot-input {
  width: 24px; height: 24px; border: none; border-radius: 50%; cursor: pointer;
}

.preview-container {
  flex: 1; display: flex; justify-content: center; align-items: center; overflow-y: auto; padding: 40px;
}

/* Responsive Phone Frame */
.phone-frame {
  width: 100%;
  max-width: 375px;
  aspect-ratio: 9 / 19.5;
  height: auto;
  max-height: 85vh;

  background: white;
  border-radius: 44px; border: 12px solid #1d1d1f;
  position: relative; box-shadow: 0 12px 40px rgba(0,0,0,0.12); overflow: hidden;
  transition: width 0.3s, height 0.3s;
}
.preview-container.desktop .phone-frame {
  width: 100%; max-width: 1000px; height: 100%;
  border: none; border-radius: 16px; aspect-ratio: auto;
}

.notch {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 35%;
  max-width: 120px;
  height: 30px; background: #1d1d1f;
  border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; z-index: 100;
}

.preview-screen {
  height: 100%; overflow-y: auto;
  scrollbar-width: none;
}
.preview-screen::-webkit-scrollbar { display: none; }

.footer {
  padding: 20px;
  text-align: center;
}

.footer-text {
  font-size: 12px;
  margin: 0;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-overlay.active { display: flex; }

.modal-card {
  background: white;
  width: 500px;
  max-width: calc(100vw - 40px);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-card.large { width: 600px; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f2;
  background: linear-gradient(to bottom, #fafafa, #ffffff);
  flex-shrink: 0;
}
.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-header h2::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(180deg, #0071e3, #5856d6);
  border-radius: 2px;
}
.btn-icon-close {
  background: #f5f5f7;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  color: #86868b;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-icon-close:hover {
  background: #e5e5ea;
  color: #1d1d1f;
  transform: rotate(90deg);
}

.modal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 20px 24px;
  overflow-y: auto;
}

.block-type-card {
  padding: 14px 16px;
  border: 1.5px solid #e8e8ed;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  background: #fafafa;
}
.block-type-card:hover {
  border-color: #0071e3;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.15);
}
.block-type-card:active {
  transform: translateY(0);
}
.type-icon {
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  flex-shrink: 0;
  transition: all 0.2s;
}
.block-type-card:hover .type-icon {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.2);
  transform: scale(1.05);
}
.type-info { flex: 1; min-width: 0; }
.type-name {
  font-weight: 600;
  font-size: 14px;
  color: #1d1d1f;
  margin-bottom: 2px;
}
.type-desc {
  font-size: 12px;
  color: #86868b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Form Styles */
.edit-form-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.form-group {
  margin-bottom: 20px;
}
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #48484a;
  letter-spacing: -0.01em;
}
.form-input, .form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e5e5ea;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  font-family: inherit;
  background: #fafafa;
  color: #1d1d1f;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.form-input::placeholder, .form-textarea::placeholder {
  color: #aeaeb2;
}
.form-input:hover, .form-textarea:hover {
  border-color: #c7c7cc;
  background: #f5f5f7;
}
.form-input:focus, .form-textarea:focus {
  border-color: #0071e3;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0,113,227,0.12);
}
.form-textarea {
  resize: vertical;
  min-height: 88px;
  line-height: 1.5;
}
.mt-2 { margin-top: 8px; }
.form-hint-box {
  padding: 14px 16px;
  background: linear-gradient(135deg, #f5f5f7 0%, #ebebf0 100%);
  border-radius: 10px;
  color: #636366;
  font-size: 13px;
  text-align: center;
  border: 1px solid #e5e5ea;
}

/* Form Section Styles */
.form-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e5e5ea 20%, #e5e5ea 80%, transparent 100%);
  margin: 24px 0 20px 0;
}

.form-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-section-title::before {
  content: '';
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, #5856d6, #af52de);
  border-radius: 1.5px;
}

/* Range Input Styles */
.form-range {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(90deg, #e5e5ea, #d1d1d6);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  margin-top: 4px;
}

.form-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(180deg, #ffffff, #f5f5f7);
  border: 2px solid #0071e3;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 113, 227, 0.25);
  transition: all 0.15s;
}
.form-range::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 10px rgba(0, 113, 227, 0.35);
}

.form-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: linear-gradient(180deg, #ffffff, #f5f5f7);
  border: 2px solid #0071e3;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 113, 227, 0.25);
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #aeaeb2;
  margin-top: 6px;
  font-weight: 500;
}

/* Modal Actions - Sticky Footer */
.modal-actions {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: linear-gradient(to top, #ffffff, #fafafa);
  border-top: 1px solid #f0f0f2;
  flex-shrink: 0;
}
.modal-actions .btn-action {
  min-width: 80px;
  padding: 10px 20px;
  font-size: 14px;
}
.modal-actions .btn-secondary {
  background: #f5f5f7;
  border: 1px solid #e5e5ea;
}
.modal-actions .btn-secondary:hover {
  background: #ebebf0;
}
.modal-actions .btn-primary {
  background: linear-gradient(180deg, #0077ed, #0071e3);
  box-shadow: 0 2px 8px rgba(0, 113, 227, 0.3);
}
.modal-actions .btn-primary:hover {
  background: linear-gradient(180deg, #0081ff, #0077ed);
  box-shadow: 0 4px 12px rgba(0, 113, 227, 0.4);
}

/* Select Input Enhancement */
.form-input[type="file"] {
  padding: 10px 14px;
  background: #fafafa;
  cursor: pointer;
}
.form-input[type="file"]::-webkit-file-upload-button {
  padding: 6px 12px;
  background: linear-gradient(180deg, #ffffff, #f5f5f7);
  border: 1px solid #d1d1d6;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  margin-right: 10px;
  transition: all 0.15s;
}
.form-input[type="file"]::-webkit-file-upload-button:hover {
  background: linear-gradient(180deg, #f5f5f7, #ebebf0);
  border-color: #c7c7cc;
}

select.form-input {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2386868b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* Checkbox Enhancement */
.form-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid #d1d1d6;
  background: #fafafa;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  position: relative;
  transition: all 0.15s;
}
.form-group input[type="checkbox"]:hover {
  border-color: #0071e3;
  background: #f0f7ff;
}
.form-group input[type="checkbox"]:checked {
  background: linear-gradient(180deg, #0077ed, #0071e3);
  border-color: #0071e3;
}
.form-group input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Number Input */
.form-input[type="number"] {
  -moz-appearance: textfield;
}
.form-input[type="number"]::-webkit-inner-spin-button,
.form-input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Image Preview Enhancement */
.edit-form-content img {
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Link/Video Item Card */
.edit-form-content > template > .form-group > div[style*="display: flex"] {
  background: #f9fafb;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e5e5ea;
}

/* Responsive Modal */
@media (max-width: 640px) {
  .modal-card {
    width: 100%;
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
    margin: 0;
  }
  .modal-card.large {
    width: 100%;
  }
  .modal-grid {
    grid-template-columns: 1fr;
  }
  .modal-header {
    padding: 16px 20px;
  }
  .edit-form-content {
    padding: 16px 20px;
  }
  .modal-actions {
    padding: 14px 20px;
  }
  .video-grid-container {
    grid-template-columns: 1fr;
  }
}

/* Video Grid Editor Styles */
.video-grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.video-item-card {
  background: #f9fafb;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e5ea;
}

.video-thumbnail {
  position: relative;
  aspect-ratio: 9 / 16;
  background: #e5e5ea;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder {
  position: relative;
  aspect-ratio: 9 / 16;
  background: linear-gradient(135deg, #f0f0f2 0%, #e5e5ea 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 28px;
  font-weight: 700;
  color: #aeaeb2;
}

.btn-delete-video {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-delete-video:hover {
  background: #ff3b30;
  transform: scale(1.1);
}

.video-title-input,
.video-url-input {
  border: none;
  border-radius: 0;
  background: transparent;
  padding: 8px 10px;
  font-size: 13px;
}

.video-title-input {
  font-weight: 600;
  border-bottom: 1px solid #e5e5ea;
}

.video-url-input {
  color: #86868b;
  font-size: 12px;
}

.video-add-card {
  aspect-ratio: 9 / 16;
  background: #f5f5f7;
  border: 2px dashed #d1d1d6;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  gap: 8px;
}

.video-add-card:hover {
  background: #e8f2ff;
  border-color: #0071e3;
}

.video-add-card .add-icon {
  font-size: 32px;
  color: #86868b;
  font-weight: 300;
}

.video-add-card:hover .add-icon {
  color: #0071e3;
}

.video-add-card .add-text {
  font-size: 13px;
  color: #86868b;
  font-weight: 500;
}

.video-add-card:hover .add-text {
  color: #0071e3;
}

/* SNS Link Editor Styles */
.sns-link-item {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  align-items: center;
}

.sns-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.sns-instagram { background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); }
.sns-facebook { background: #1877f2; }
.sns-youtube { background: #ff0000; }
.sns-twitter { background: #000000; }
.sns-tiktok { background: #000000; }
.sns-website { background: #6366f1; }

.sns-select {
  flex: 0 0 110px;
  padding: 8px 10px;
  font-size: 13px;
}

.sns-url-input {
  flex: 1;
  padding: 8px 10px;
  font-size: 13px;
}

.btn-delete-sns {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f5f5f7;
  border: none;
  color: #86868b;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}

.btn-delete-sns:hover {
  background: #ffebee;
  color: #ff3b30;
}

/* BGM 설정 버튼 */
.bgm-picker {
  display: flex;
  align-items: center;
}

.btn-bgm-settings {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-bgm-settings:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
}

.bgm-indicator {
  color: #4ade80;
  font-size: 8px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* BGM 모달 스타일 */
.bgm-modal-content {
  padding: 20px 24px;
}

.form-hint {
  font-size: 12px;
  color: #8e8e93;
  margin-top: 8px;
  line-height: 1.5;
}

.bgm-preview-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f2;
}

.bgm-preview-controls {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-remove-bgm {
  padding: 10px 20px;
  background: #f5f5f7;
  color: #ff3b30;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove-bgm:hover {
  background: #ffebee;
  border-color: #ff3b30;
}

.bgm-info-box {
  margin-top: 20px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  font-size: 13px;
  color: #0369a1;
}

.bgm-info-box strong {
  display: block;
  margin-bottom: 8px;
}

.bgm-info-box ul {
  margin: 0;
  padding-left: 20px;
}

.bgm-info-box li {
  margin-bottom: 4px;
  line-height: 1.5;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f2;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f5f5f7;
  color: #1d1d1f;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e5ea;
}

/* BGM 입력 탭 */
.bgm-input-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.bgm-tab {
  flex: 1;
  padding: 12px 16px;
  background: #f5f5f7;
  border: 2px solid transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.bgm-tab:hover {
  background: #e5e5ea;
}

.bgm-tab.active {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%);
  border-color: #f093fb;
  color: #d946ef;
}

/* 파일 업로드 영역 */
.file-upload-area {
  margin-top: 8px;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 20px;
  background: #fafafa;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  color: #6b7280;
}

.file-upload-label:hover {
  border-color: #f093fb;
  background: #fdf4ff;
}

.file-upload-label.uploading {
  pointer-events: none;
  opacity: 0.7;
}

.file-upload-label .file-name {
  font-weight: 600;
  color: #1d1d1f;
  word-break: break-all;
}

.file-upload-label .change-text {
  font-size: 12px;
  color: #9ca3af;
}

.file-upload-label .file-hint {
  font-size: 12px;
  color: #9ca3af;
}

.upload-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f093fb;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 마퀴 편집 폼 스타일 */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f5f5f7;
  border-radius: 10px;
  border: 1px solid #e5e5ea;
}

.color-input {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: 2px solid white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.color-value {
  font-size: 13px;
  font-family: monospace;
  color: #666;
}

/* 여백 입력 스타일 */
.padding-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.padding-input {
  width: 80px;
  text-align: center;
}

.padding-unit {
  font-size: 13px;
  color: #666;
}

.marquee-preview-box {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f2;
}

.marquee-preview {
  margin-top: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  overflow: hidden;
}

.marquee-preview-text {
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  animation: marquee-demo 5s linear infinite;
}

@keyframes marquee-demo {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

/* 속도 뱃지 스타일 */
.speed-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
}

.speed-very-fast {
  background: #dcfce7;
  color: #15803d;
}

.speed-fast {
  background: #d1fae5;
  color: #047857;
}

.speed-normal {
  background: #fef3c7;
  color: #b45309;
}

.speed-slow {
  background: #fed7aa;
  color: #c2410c;
}

.speed-very-slow {
  background: #fecaca;
  color: #dc2626;
}

/* 콘텐츠 타입 선택기 */
.content-type-selector {
  display: flex;
  gap: 8px;
}

.content-type-selector .type-btn {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.content-type-selector .type-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.content-type-selector .type-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}

/* 마퀴 이미지 업로드 */
.marquee-image-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.marquee-image-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  min-height: 80px;
}

.marquee-image-upload-label:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.marquee-image-upload-label.has-image {
  padding: 0;
  border-style: solid;
  border-color: #e5e7eb;
}

.marquee-image-preview {
  width: 100%;
  height: auto;
  max-height: 100px;
  object-fit: contain;
  display: block;
}

.change-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 13px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.marquee-image-upload-label.has-image:hover .change-overlay {
  opacity: 1;
}

.btn-remove-image {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-remove-image:hover {
  background: #fecaca;
}

/* 이미지 규격 안내 */
.image-spec-info {
  margin-top: 12px;
  padding: 12px 16px;
  background: #f0f9ff;
  border-radius: 10px;
  border: 1px solid #bae6fd;
}

.image-spec-info strong {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #0369a1;
}

.image-spec-info ul {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: #0c4a6e;
  line-height: 1.6;
}

.image-spec-info code {
  padding: 2px 6px;
  background: #e0f2fe;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 11px;
  color: #0369a1;
}

/* 마퀴 미리보기 개선 */
.marquee-preview-content {
  display: flex;
  align-items: center;
  gap: 16px;
  white-space: nowrap;
  animation: marquee-demo 5s linear infinite;
}

.marquee-preview-image {
  height: 40px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}

.marquee-preview-text {
  font-size: 14px;
  font-weight: 600;
}

/* 메뉴 아이템 편집 */
.menu-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.menu-item-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  position: absolute;
  top: -6px;
  left: -6px;
  z-index: 1;
}

.menu-item-thumbnail {
  position: relative;
  flex-shrink: 0;
}

.menu-thumbnail-label {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  background: #f9fafb;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.menu-thumbnail-label:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.menu-thumbnail-label.has-image {
  border-style: solid;
  border-color: #e5e7eb;
}

.menu-thumbnail-label img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  font-size: 24px;
  color: #9ca3af;
  font-weight: 300;
}

.btn-remove-thumbnail {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove-thumbnail:hover {
  background: #dc2626;
}

.menu-item-card {
  position: relative;
}

.menu-item-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-price-input {
  width: 120px !important;
  flex-shrink: 0;
}

.price-unit {
  font-size: 13px;
  color: #6b7280;
  flex-shrink: 0;
}

.btn-delete-menu-item {
  padding: 6px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-delete-menu-item:hover {
  background: #fee2e2;
  color: #dc2626;
}

.btn-add-menu-item {
  width: 100%;
  padding: 12px;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.btn-add-menu-item:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

/* 텍스트 스타일 선택기 */
.style-selector {
  display: flex;
  gap: 8px;
}

.style-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.style-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.style-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.style-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #374151;
}

.style-btn.active .style-icon {
  background: #dbeafe;
  color: #1d4ed8;
}

.style-name {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.style-btn.active .style-name {
  color: #1d4ed8;
}

/* 버튼 스타일 선택기 */
.button-style-selector {
  display: flex;
  gap: 8px;
}

.btn-style-option {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-style-option.primary-style {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-style-option.primary-style:not(.active) {
  background: #eff6ff;
  color: #3b82f6;
  border-color: #bfdbfe;
}

.btn-style-option.secondary-style {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.btn-style-option.secondary-style:not(.active) {
  background: #f9fafb;
  color: #9ca3af;
  border-color: #e5e7eb;
}

.btn-style-option.active {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* 이미지 비율 선택기 */
.ratio-selector {
  display: flex;
  gap: 8px;
}

.ratio-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ratio-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.ratio-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.ratio-preview {
  background: #d1d5db;
  border-radius: 4px;
}

.ratio-16-9 {
  width: 48px;
  height: 27px;
}

.ratio-4-3 {
  width: 40px;
  height: 30px;
}

.ratio-1-1 {
  width: 32px;
  height: 32px;
}

.ratio-btn.active .ratio-preview {
  background: #3b82f6;
}

.ratio-btn span {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.ratio-btn.active span {
  color: #1d4ed8;
}

/* 카운트다운 스타일 선택기 */
.countdown-style-selector {
  display: flex;
  gap: 8px;
}

.countdown-style-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.countdown-style-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.countdown-style-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.countdown-style-preview {
  width: 48px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-preview .preview-box {
  width: 40px;
  height: 28px;
  background: #d1d5db;
  border-radius: 6px;
}

.minimal-preview .preview-line {
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
}

.banner-preview .preview-banner {
  width: 48px;
  height: 16px;
  background: #d1d5db;
  border-radius: 4px;
}

.countdown-style-btn.active .preview-box,
.countdown-style-btn.active .preview-line,
.countdown-style-btn.active .preview-banner {
  background: #3b82f6;
}

.countdown-style-btn span {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.countdown-style-btn.active span {
  color: #1d4ed8;
}

/* SNS 아이콘 추가 스타일 */
.sns-threads {
  background: linear-gradient(45deg, #000000, #333333);
  color: white;
}

.sns-naver {
  background: #03C75A;
  color: white;
}
</style>
