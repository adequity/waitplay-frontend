<template>
  <div class="superadmin-view">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo-section">
        <h1 class="logo-text">WaitPlay</h1>
        <span class="logo-badge">본사</span>
      </div>

      <nav class="nav-menu">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </nav>

      <!-- Account Section -->
      <div class="sidebar-account">
        <div class="account-info">
          <div class="account-avatar">👤</div>
          <div class="account-details">
            <p class="account-name">본사 관리자</p>
            <p class="account-email">superadmin@waitplay.com</p>
          </div>
        </div>
        <button class="btn-logout" @click="logout">
          <span>로그아웃</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">{{ currentTabLabel }}</h2>
          <span class="page-subtitle">WaitPlay 본사 관리 시스템</span>
        </div>
        <div class="header-right">
          <div class="header-time">{{ currentTime }}</div>
        </div>
      </header>

      <!-- Dashboard Tab -->
      <div v-show="activeTab === 'dashboard'" class="tab-content">
        <!-- Apple-Style Key Metrics -->
        <div class="metrics-apple">
          <div class="metric-apple">
            <p class="metric-value-apple">{{ totalStores }}</p>
            <p class="metric-label-apple">전체 가맹점</p>
            <p class="metric-change-apple">이번 달</p>
          </div>

          <div class="metric-apple">
            <p class="metric-value-apple">{{ totalCustomers.toLocaleString() }}</p>
            <p class="metric-label-apple">전체 이용자</p>
            <p class="metric-change-apple">이번 주</p>
          </div>

          <div class="metric-apple">
            <p class="metric-value-apple">{{ totalGames.toLocaleString() }}</p>
            <p class="metric-label-apple">전체 게임 수</p>
            <p class="metric-change-apple">오늘</p>
          </div>

          <div class="metric-apple">
            <p class="metric-value-apple">{{ totalCoupons.toLocaleString() }}</p>
            <p class="metric-label-apple">쿠폰 사용</p>
            <p class="metric-change-apple">오늘</p>
          </div>
        </div>

        <!-- 중요 알림 및 인사이트 -->
        <div class="metrics-apple">
          <!-- 미처리 CS -->
          <div class="metric-apple" @click="activeTab = 'cs'" style="cursor: pointer;">
            <p class="metric-value-apple">{{ pendingCSCount }}</p>
            <p class="metric-label-apple">미처리 CS 문의</p>
            <p class="metric-change-apple">24시간 이내 응답 필요</p>
          </div>

          <!-- 승인 대기 가맹점 -->
          <div class="metric-apple" @click="activeTab = 'stores'" style="cursor: pointer;">
            <p class="metric-value-apple">{{ pendingStoresCount }}</p>
            <p class="metric-label-apple">가맹점 승인 대기</p>
            <p class="metric-change-apple">신규 가입 승인 필요</p>
          </div>

          <!-- 활성 가맹점 -->
          <div class="metric-apple" @click="activeTab = 'stores'" style="cursor: pointer;">
            <p class="metric-value-apple">{{ activeStoresCount }}</p>
            <p class="metric-label-apple">활성 가맹점</p>
            <p class="metric-change-apple">정상 운영 중</p>
          </div>

          <!-- 인기 에셋 -->
          <div class="metric-apple" @click="activeTab = 'assets'" style="cursor: pointer;">
            <p class="metric-value-apple">{{ topAssetName }}</p>
            <p class="metric-label-apple">가장 많이 쓰인 에셋</p>
            <p class="metric-change-apple">{{ topAssetUsage }}회 사용</p>
          </div>
        </div>

        <!-- 실시간 활동 -->
        <div class="content-section">
          <div class="section-header">
            <h3 class="section-title">실시간 활동</h3>
            <span class="section-subtitle">당일 쿠폰 사용량 TOP 10</span>
          </div>
          <div class="activity-grid">
            <div v-for="(store, index) in topStoresByDailyCoupons" :key="store.id" class="activity-card">
              <div class="activity-card-header">
                <div class="activity-rank">{{ index + 1 }}</div>
                <div class="activity-card-coupon">{{ store.dailyCouponUsed }}</div>
              </div>
              <div class="activity-card-body">
                <h4 class="activity-card-store">{{ store.name }}</h4>
                <p class="activity-card-region">{{ store.region }}</p>
                <div class="activity-card-games">
                  <span v-for="(game, idx) in store.topGames.slice(0, 3)" :key="idx" class="game-badge" :class="`rank-${idx + 1}`">
                    {{ idx + 1 }}. {{ game }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stores Tab -->
      <div v-show="activeTab === 'stores'" class="tab-content">
        <div class="content-section">
          <div class="section-header">
            <h3 class="section-title">가맹점 관리</h3>
            <button class="btn-primary-apple" @click="showAddStoreModal = true">
              가맹점 추가
            </button>
          </div>

          <!-- 검색 및 필터 -->
          <div class="filter-bar">
            <input
              type="text"
              v-model="storeSearchQuery"
              class="search-input-apple"
              placeholder="가맹점 검색..."
            />
            <select v-model="storeStatusFilter" class="select-apple">
              <option value="">전체 상태</option>
              <option value="active">운영중</option>
              <option value="inactive">비활성</option>
              <option value="pending">승인대기</option>
            </select>
          </div>

          <!-- 가맹점 목록 테이블 -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>상태</th>
                  <th>가맹점명</th>
                  <th>지역</th>
                  <th>사업주</th>
                  <th>연락처</th>
                  <th>가입일</th>
                  <th>이용자 수</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="store in filteredStores" :key="store.id">
                  <td>
                    <span :class="['status-badge', `status-${store.status}`]">
                      {{ getStatusLabel(store.status) }}
                    </span>
                  </td>
                  <td class="store-name clickable" @click="viewStoreDetail(store.id)">{{ store.name }}</td>
                  <td>{{ store.region }}</td>
                  <td>{{ store.owner }}</td>
                  <td>{{ store.phone }}</td>
                  <td>{{ store.joinDate }}</td>
                  <td class="text-center">{{ store.customers.toLocaleString() }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-action-small" @click="viewStoreDetail(store.id)">
                        보기
                      </button>
                      <button class="btn-action-small" @click="editStore(store.id)">
                        수정
                      </button>
                      <button class="btn-action-small danger" @click="deleteStore(store.id)">
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- CS Board Tab -->
      <div v-show="activeTab === 'cs'" class="tab-content">
        <div class="content-section">
          <div class="section-header">
            <h3 class="section-title">CS 게시판</h3>
            <div class="section-actions">
              <select v-model="csStatusFilter" class="select-apple">
                <option value="">전체 상태</option>
                <option value="pending">대기중</option>
                <option value="in-progress">처리중</option>
                <option value="resolved">해결완료</option>
              </select>
            </div>
          </div>

          <!-- CS 목록 테이블 -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>상태</th>
                  <th>문의 유형</th>
                  <th>제목</th>
                  <th>가맹점</th>
                  <th>작성자</th>
                  <th>등록일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cs in filteredCS" :key="cs.id">
                  <td>
                    <span :class="['status-badge', `status-${cs.status}`]">
                      {{ getCSStatusLabel(cs.status) }}
                    </span>
                  </td>
                  <td>{{ cs.category }}</td>
                  <td class="cs-title" @click="viewCS(cs.id)">{{ cs.title }}</td>
                  <td>{{ cs.storeName }}</td>
                  <td>{{ cs.author }}</td>
                  <td>{{ cs.createdAt }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-action-small" @click="openReplyModal(cs.id)">
                        답변하기
                      </button>
                      <button class="btn-action-small danger" @click="deleteCS(cs.id)">
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Notice Management Tab -->
      <div v-show="activeTab === 'notice'" class="tab-content">
        <div class="content-section">
          <div class="section-header">
            <h3 class="section-title">공지사항 관리</h3>
            <button class="btn-primary-apple" @click="showAddNoticeModal = true">
              공지사항 작성
            </button>
          </div>

          <!-- 공지사항 목록 테이블 -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>고정</th>
                  <th>구분</th>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>등록일</th>
                  <th>조회수</th>
                  <th>팝업</th>
                  <th>팝업 기간</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="notice in notices" :key="notice.id">
                  <td class="text-center">
                    <input
                      type="checkbox"
                      :checked="notice.isPinned"
                      @change="toggleNoticePin(notice.id)"
                      class="checkbox-apple"
                    />
                  </td>
                  <td>
                    <span :class="['badge', `badge-${notice.type}`]">
                      {{ getNoticeTypeLabel(notice.type) }}
                    </span>
                  </td>
                  <td class="notice-title" @click="viewNotice(notice.id)">{{ notice.title }}</td>
                  <td>{{ notice.author }}</td>
                  <td>{{ notice.createdAt }}</td>
                  <td class="text-center">{{ notice.views.toLocaleString() }}</td>
                  <td class="text-center">
                    <span v-if="notice.isPopupEnabled" class="popup-badge active">활성</span>
                    <span v-else class="popup-badge">비활성</span>
                  </td>
                  <td class="popup-period">
                    <span v-if="notice.isPopupEnabled">
                      {{ notice.popupStartDate }} ~ {{ notice.popupEndDate }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-action-small" @click="openEditNoticeModal(notice.id)">
                        수정
                      </button>
                      <button class="btn-action-small danger" @click="deleteNotice(notice.id)">
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Assets Tab -->
      <div v-show="activeTab === 'assets'" class="tab-content">
        <div class="content-section">
          <div class="section-header">
            <h3 class="section-title">에셋 라이브러리</h3>
            <button class="btn-primary-apple" @click="uploadAsset">
              에셋 업로드
            </button>
          </div>

          <!-- Filter Bar -->
          <div class="filter-bar">
            <div class="filter-group">
              <select v-model="assetCategoryFilter" class="select-apple">
                <option value="">전체 카테고리</option>
                <option value="food">음식</option>
                <option value="drink">음료</option>
                <option value="dessert">디저트</option>
                <option value="object">오브젝트</option>
                <option value="background">배경</option>
              </select>
              <select v-model="assetGameTypeFilter" class="select-apple">
                <option value="">전체 게임</option>
                <option value="pinball">핀볼</option>
                <option value="brick-breaker">벽돌깨기</option>
                <option value="memory">같은 카드 찾기</option>
                <option value="spot-difference">틀린 그림 찾기</option>
              </select>
            </div>
            <div class="search-box">
              <input
                v-model="assetSearchQuery"
                type="text"
                class="search-input"
                placeholder="에셋 검색..."
              />
            </div>
          </div>

          <!-- Assets Grid -->
          <div class="assets-grid">
            <div v-for="asset in filteredAssets" :key="asset.id" class="asset-card">
              <div class="asset-image-container">
                <img v-if="asset.imageUrl" :src="asset.imageUrl" :alt="asset.name" class="asset-image" />
                <div v-else class="asset-image-placeholder">No Image</div>
              </div>
              <div class="asset-info">
                <h4 class="asset-name">{{ asset.name }}</h4>
                <div class="asset-meta">
                  <span class="asset-category-tag">{{ getAssetCategoryLabel(asset.category) }}</span>
                  <span class="asset-game-tag">{{ getAssetGameTypeLabel(asset.gameType) }}</span>
                </div>
                <div class="asset-stats">
                  <span class="asset-stat">사용 {{ asset.usageCount }}회</span>
                  <span class="asset-date">{{ asset.uploadDate }}</span>
                </div>
              </div>
              <div class="asset-actions">
                <button class="btn-action-small" @click="viewAssetDetail(asset.id)">상세</button>
                <button class="btn-action-small" @click="editAsset(asset.id)">수정</button>
                <button class="btn-action-small danger" @click="deleteAsset(asset.id)">삭제</button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredAssets.length === 0" class="empty-state">
            <p class="empty-message">등록된 에셋이 없습니다</p>
            <button class="btn-secondary-apple" @click="uploadAsset">첫 에셋 업로드하기</button>
          </div>
        </div>
      </div>

      <!-- Analytics Tab -->
      <div v-show="activeTab === 'analytics'" class="tab-content">
        <div class="content-section">
          <h3 class="section-title">통합 분석</h3>
          <div class="chart-placeholder large">
            <div class="chart-message">📈 통합 분석 대시보드 영역</div>
            <p class="chart-hint">가맹점별 성과, 고객 트렌드, 게임 통계 등</p>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-show="activeTab === 'settings'" class="tab-content">
        <div class="content-section">
          <div class="section-header">
            <h3 class="section-title">시스템 설정</h3>
            <div class="settings-actions">
              <button class="btn-secondary-apple" @click="resetSettings">
                <span>초기화</span>
              </button>
              <button class="btn-primary-apple" @click="saveSettings">
                <span>설정 저장</span>
              </button>
            </div>
          </div>

          <div class="settings-container">
            <!-- 브랜드 관리 -->
            <div class="settings-section">
              <div class="settings-section-header">
                <div class="settings-section-title">
                  <span class="settings-icon">🎨</span>
                  <h4>브랜드 관리</h4>
                </div>
                <span class="settings-badge primary">전체 가맹점 적용</span>
              </div>

              <div class="settings-section-body">
                <div class="brand-identity-group">
                  <div class="brand-logo-area">
                    <label class="form-label-modern">브랜드 로고</label>
                    <div class="logo-upload-container">
                      <div class="logo-preview-box">
                        <img v-if="systemSettings.brandLogo" :src="systemSettings.brandLogo" alt="브랜드 로고" class="brand-logo-preview" />
                        <div v-else class="logo-empty-state">
                          <span class="empty-icon">📷</span>
                          <span class="empty-text">로고 없음</span>
                        </div>
                      </div>
                      <div class="logo-control-buttons">
                        <button class="btn-upload-modern" @click="uploadLogo">
                          <span class="btn-icon">⬆</span>
                          <span>업로드</span>
                        </button>
                        <button v-if="systemSettings.brandLogo" class="btn-remove-modern" @click="removeLogo">
                          <span class="btn-icon">🗑</span>
                          <span>삭제</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="brand-info-area">
                    <div class="form-group-modern">
                      <label class="form-label-modern">회사명</label>
                      <input
                        v-model="systemSettings.companyName"
                        type="text"
                        class="input-modern"
                        placeholder="예: 웨잇플레이"
                      />
                    </div>

                    <div class="form-group-modern">
                      <label class="form-label-modern">브랜드 컬러</label>
                      <div class="color-selector-modern">
                        <div class="color-preview-circle" :style="{ backgroundColor: systemSettings.brandColor }"></div>
                        <input
                          v-model="systemSettings.brandColor"
                          type="color"
                          class="color-input-hidden"
                          id="brandColorInput"
                        />
                        <label for="brandColorInput" class="color-picker-button">
                          컬러 선택
                        </label>
                        <input
                          v-model="systemSettings.brandColor"
                          type="text"
                          class="color-code-input"
                          placeholder="#007AFF"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 알림 설정 -->
            <div class="settings-section">
              <div class="settings-section-header">
                <div class="settings-section-title">
                  <span class="settings-icon">🔔</span>
                  <h4>알림 설정</h4>
                </div>
              </div>

              <div class="settings-section-body">
                <div class="notification-options">
                  <div class="notification-item">
                    <div class="notification-info">
                      <span class="notification-title">신규 가맹점 승인 요청</span>
                      <span class="notification-desc">새로운 가맹점 가입 신청 시 알림</span>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="systemSettings.notifyNewStore" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div class="notification-item">
                    <div class="notification-info">
                      <span class="notification-title">CS 문의 등록</span>
                      <span class="notification-desc">고객센터 문의 등록 시 알림</span>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="systemSettings.notifyCS" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div class="notification-item">
                    <div class="notification-info">
                      <span class="notification-title">일일 리포트 자동 발송</span>
                      <span class="notification-desc">매일 운영 현황 리포트 이메일 발송</span>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="systemSettings.notifyDailyReport" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- 데이터 관리 -->
            <div class="settings-section">
              <div class="settings-section-header">
                <div class="settings-section-title">
                  <span class="settings-icon">💾</span>
                  <h4>데이터 관리</h4>
                </div>
              </div>

              <div class="settings-section-body">
                <div class="data-management-options">
                  <div class="form-group-modern">
                    <label class="form-label-modern">자동 백업 주기</label>
                    <select v-model="systemSettings.backupSchedule" class="select-modern">
                      <option value="daily">매일</option>
                      <option value="weekly">매주</option>
                      <option value="monthly">매월</option>
                    </select>
                    <span class="form-helper-text">시스템 데이터를 자동으로 백업합니다</span>
                  </div>

                  <div class="backup-action-group">
                    <button class="btn-action-modern" @click="downloadBackup">
                      <span class="btn-icon">⬇</span>
                      <div class="btn-content">
                        <span class="btn-text">데이터 백업 다운로드</span>
                        <span class="btn-subtext">현재 시스템 데이터를 백업합니다</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Store Modal -->
    <div v-if="showAddStoreModal" class="modal-overlay" @click.self="showAddStoreModal = false">
      <div class="modal-content store-modal">
        <div class="modal-header">
          <h3 class="modal-title">가맹점 추가</h3>
          <button type="button" class="btn-modal-close" @click="showAddStoreModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-form-group">
            <label class="modal-label">가맹점명</label>
            <input type="text" class="modal-input" placeholder="예: 강남점" />
          </div>
          <div class="modal-form-group">
            <label class="modal-label">지역</label>
            <input type="text" class="modal-input" placeholder="예: 서울 강남구" />
          </div>
          <div class="modal-form-group">
            <label class="modal-label">사업주명</label>
            <input type="text" class="modal-input" placeholder="예: 홍길동" />
          </div>
          <div class="modal-form-group">
            <label class="modal-label">연락처</label>
            <input type="tel" class="modal-input" placeholder="010-0000-0000" />
          </div>
          <div class="modal-form-group">
            <label class="modal-label">이메일</label>
            <input type="email" class="modal-input" placeholder="store@example.com" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-modal-cancel" @click="showAddStoreModal = false">취소</button>
          <button type="button" class="btn-modal-confirm" @click="addStore">추가</button>
        </div>
      </div>
    </div>

    <!-- Notice Detail Modal -->
    <div v-if="showNoticeDetailModal" class="modal-overlay" @click.self="showNoticeDetailModal = false">
      <div class="modal-content notice-detail-modal">
        <div class="modal-header">
          <h3 class="modal-title">공지사항 상세</h3>
          <button type="button" class="btn-modal-close" @click="showNoticeDetailModal = false">✕</button>
        </div>
        <div class="modal-body" v-if="selectedNotice">
          <div class="notice-detail-header">
            <span :class="['badge', `badge-${selectedNotice.type}`]">
              {{ getNoticeTypeLabel(selectedNotice.type) }}
            </span>
            <span v-if="selectedNotice.isPinned" class="badge badge-pinned">고정됨</span>
          </div>
          <h2 class="notice-detail-title">{{ selectedNotice.title }}</h2>
          <div class="notice-detail-meta">
            <span>작성자: {{ selectedNotice.author }}</span>
            <span>등록일: {{ selectedNotice.createdAt }}</span>
            <span>조회수: {{ selectedNotice.views.toLocaleString() }}</span>
          </div>
          <div class="notice-detail-popup" v-if="selectedNotice.isPopupEnabled">
            <div class="popup-info">
              <span class="popup-badge active">팝업 활성</span>
              <span class="popup-period">{{ selectedNotice.popupStartDate }} ~ {{ selectedNotice.popupEndDate }}</span>
            </div>
          </div>
          <div class="notice-detail-content">
            <p>{{ selectedNotice.content || '공지사항 내용이 여기에 표시됩니다.' }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-modal-cancel" @click="showNoticeDetailModal = false">닫기</button>
          <button type="button" class="btn-modal-confirm" @click="openEditNoticeModalFromDetail">수정</button>
        </div>
      </div>
    </div>

    <!-- Edit Notice Modal -->
    <div v-if="showEditNoticeModal" class="modal-overlay" @click.self="showEditNoticeModal = false">
      <div class="modal-content edit-notice-modal">
        <div class="modal-header">
          <h3 class="modal-title">공지사항 {{ editingNotice ? '수정' : '작성' }}</h3>
          <button type="button" class="btn-modal-close" @click="closeEditNoticeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-form-group">
            <label class="modal-label">구분</label>
            <select v-model="noticeForm.type" class="modal-select">
              <option value="important">중요</option>
              <option value="update">업데이트</option>
              <option value="event">이벤트</option>
              <option value="notice">공지</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-label">제목</label>
            <input v-model="noticeForm.title" type="text" class="modal-input" placeholder="공지사항 제목을 입력하세요" />
          </div>
          <div class="modal-form-group">
            <label class="modal-label">내용</label>
            <textarea v-model="noticeForm.content" class="modal-textarea" rows="10" placeholder="공지사항 내용을 입력하세요"></textarea>
          </div>
          <div class="modal-form-group">
            <label class="modal-checkbox-label">
              <input v-model="noticeForm.isPinned" type="checkbox" class="checkbox-apple" />
              <span>상단 고정</span>
            </label>
          </div>
          <div class="modal-form-group">
            <label class="modal-checkbox-label">
              <input v-model="noticeForm.isPopupEnabled" type="checkbox" class="checkbox-apple" />
              <span>팝업으로 표시</span>
            </label>
          </div>
          <div v-if="noticeForm.isPopupEnabled" class="modal-form-row">
            <div class="modal-form-group">
              <label class="modal-label">팝업 시작일</label>
              <input v-model="noticeForm.popupStartDate" type="date" class="modal-input" />
            </div>
            <div class="modal-form-group">
              <label class="modal-label">팝업 종료일</label>
              <input v-model="noticeForm.popupEndDate" type="date" class="modal-input" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-modal-cancel" @click="closeEditNoticeModal">취소</button>
          <button type="button" class="btn-modal-confirm" @click="saveNotice">{{ editingNotice ? '수정' : '작성' }}</button>
        </div>
      </div>
    </div>

    <!-- CS Detail Modal -->
    <div v-if="showCSDetailModal" class="modal-overlay" @click.self="showCSDetailModal = false">
      <div class="modal-content cs-detail-modal">
        <div class="modal-header">
          <h3 class="modal-title">CS 문의 상세</h3>
          <button type="button" class="btn-modal-close" @click="showCSDetailModal = false">✕</button>
        </div>
        <div class="modal-body" v-if="selectedCS">
          <div class="cs-detail-header">
            <span :class="['status-badge', `status-${selectedCS.status}`]">
              {{ getCSStatusLabel(selectedCS.status) }}
            </span>
            <span class="cs-category-badge">{{ selectedCS.category }}</span>
          </div>
          <h2 class="cs-detail-title">{{ selectedCS.title }}</h2>
          <div class="cs-detail-meta">
            <span>가맹점: {{ selectedCS.storeName }}</span>
            <span>작성자: {{ selectedCS.author }}</span>
            <span>등록일: {{ selectedCS.createdAt }}</span>
          </div>
          <div class="cs-detail-content">
            <h4>문의 내용</h4>
            <p>{{ selectedCS.content || 'CS 문의 내용이 여기에 표시됩니다.' }}</p>
          </div>
          <div v-if="selectedCS.reply" class="cs-detail-reply">
            <h4>답변</h4>
            <div class="reply-meta">
              <span>답변자: {{ selectedCS.replyAuthor }}</span>
              <span>답변일: {{ selectedCS.replyDate }}</span>
            </div>
            <p>{{ selectedCS.reply }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-modal-cancel" @click="showCSDetailModal = false">닫기</button>
          <button type="button" class="btn-modal-confirm" @click="openReplyModalFromDetail">답변하기</button>
        </div>
      </div>
    </div>

    <!-- CS Reply Modal -->
    <div v-if="showCSReplyModal" class="modal-overlay" @click.self="showCSReplyModal = false">
      <div class="modal-content cs-reply-modal">
        <div class="modal-header">
          <h3 class="modal-title">CS 답변 작성</h3>
          <button type="button" class="btn-modal-close" @click="closeReplyModal">✕</button>
        </div>
        <div class="modal-body" v-if="replyingCS">
          <div class="cs-info-section">
            <div class="info-row">
              <span class="info-label">가맹점:</span>
              <span class="info-value">{{ replyingCS.storeName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">작성자:</span>
              <span class="info-value">{{ replyingCS.author }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">문의 제목:</span>
              <span class="info-value">{{ replyingCS.title }}</span>
            </div>
          </div>
          <div class="modal-form-group">
            <label class="modal-label">문의 내용</label>
            <div class="content-preview">{{ replyingCS.content }}</div>
          </div>
          <div class="modal-form-group">
            <label class="modal-label">답변 내용</label>
            <textarea v-model="csReplyForm.reply" class="modal-textarea" rows="8" placeholder="답변 내용을 입력하세요"></textarea>
          </div>
          <div class="modal-form-group">
            <label class="modal-label">처리 상태</label>
            <select v-model="csReplyForm.status" class="modal-select">
              <option value="pending">대기중</option>
              <option value="in-progress">처리중</option>
              <option value="resolved">해결완료</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-modal-cancel" @click="closeReplyModal">취소</button>
          <button type="button" class="btn-modal-confirm" @click="saveReply">답변 등록</button>
        </div>
      </div>
    </div>

    <!-- Asset Detail Modal -->
    <div v-if="showAssetDetailModal" class="modal-overlay" @click.self="showAssetDetailModal = false">
      <div class="modal-content asset-detail-modal">
        <div class="modal-header">
          <h3 class="modal-title">에셋 상세 정보</h3>
          <button type="button" class="btn-modal-close" @click="showAssetDetailModal = false">✕</button>
        </div>
        <div class="modal-body" v-if="selectedAsset">
          <div class="asset-detail-preview">
            <div class="asset-detail-image-container">
              <img v-if="selectedAsset.imageUrl" :src="selectedAsset.imageUrl" :alt="selectedAsset.name" class="asset-detail-image" />
              <div v-else class="asset-detail-placeholder">
                <span class="placeholder-icon">📷</span>
                <span class="placeholder-text">이미지 없음</span>
              </div>
            </div>
          </div>

          <div class="asset-detail-info">
            <h2 class="asset-detail-name">{{ selectedAsset.name }}</h2>

            <div class="asset-detail-grid">
              <div class="detail-item">
                <span class="detail-label">카테고리</span>
                <span class="detail-value">{{ getAssetCategoryLabel(selectedAsset.category) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">게임 타입</span>
                <span class="detail-value">{{ getAssetGameTypeLabel(selectedAsset.gameType) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">사용 횟수</span>
                <span class="detail-value highlight">{{ selectedAsset.usageCount }}회</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">업로드일</span>
                <span class="detail-value">{{ selectedAsset.uploadDate }}</span>
              </div>
            </div>

            <div class="asset-usage-section">
              <h4 class="usage-title">사용 중인 가맹점</h4>
              <div class="usage-list">
                <div class="usage-item">강남점</div>
                <div class="usage-item">홍대점</div>
                <div class="usage-item">신촌점</div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-modal-delete" @click="deleteAsset(selectedAsset.id)">삭제</button>
          <div class="footer-right">
            <button type="button" class="btn-modal-cancel" @click="showAssetDetailModal = false">닫기</button>
            <button type="button" class="btn-modal-confirm" @click="editAsset(selectedAsset.id); showAssetDetailModal = false">수정</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Asset Edit Modal -->
    <div v-if="showEditAssetModal" class="modal-overlay" @click.self="showEditAssetModal = false">
      <div class="modal-content edit-asset-modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingAsset ? '에셋 수정' : '에셋 추가' }}</h3>
          <button type="button" class="btn-modal-close" @click="closeEditAssetModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="asset-edit-layout">
            <div class="asset-edit-image-section">
              <label class="modal-label">이미지</label>
              <div class="asset-edit-image-container">
                <div class="asset-edit-preview">
                  <img v-if="assetForm.imageUrl" :src="assetForm.imageUrl" alt="에셋 미리보기" class="edit-image-preview" />
                  <div v-else class="edit-image-placeholder">
                    <span class="placeholder-icon">📷</span>
                    <span class="placeholder-text">이미지 없음</span>
                  </div>
                </div>
                <button type="button" class="btn-upload-asset" @click="uploadAssetImage">
                  <span class="upload-icon">⬆</span>
                  <span>이미지 업로드</span>
                </button>
              </div>
            </div>

            <div class="asset-edit-info-section">
              <div class="modal-form-group">
                <label class="modal-label">에셋 이름</label>
                <input v-model="assetForm.name" type="text" class="modal-input" placeholder="예: 햄버거 세트" />
              </div>

              <div class="modal-form-group">
                <label class="modal-label">카테고리</label>
                <select v-model="assetForm.category" class="modal-select">
                  <option value="food">음식</option>
                  <option value="drink">음료</option>
                  <option value="dessert">디저트</option>
                  <option value="object">오브젝트</option>
                  <option value="background">배경</option>
                </select>
              </div>

              <div class="modal-form-group">
                <label class="modal-label">게임 타입</label>
                <select v-model="assetForm.gameType" class="modal-select">
                  <option value="pinball">핀볼</option>
                  <option value="brick-breaker">벽돌깨기</option>
                  <option value="memory">같은 카드 찾기</option>
                  <option value="spot-difference">틀린 그림 찾기</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-modal-cancel" @click="closeEditAssetModal">취소</button>
          <button type="button" class="btn-modal-confirm" @click="saveAsset">{{ editingAsset ? '수정' : '추가' }}</button>
        </div>
      </div>
    </div>

    <!-- Store Detail Modal -->
    <div v-if="showStoreDetailModal" class="modal-overlay" @click.self="showStoreDetailModal = false">
      <div class="modal-content store-detail-modal">
        <div class="modal-header">
          <h3 class="modal-title">가맹점 상세 정보</h3>
          <button type="button" class="btn-modal-close" @click="showStoreDetailModal = false">✕</button>
        </div>
        <div class="modal-body" v-if="selectedStore">
          <div class="store-detail-header">
            <h2 class="store-detail-name">{{ selectedStore.name }}</h2>
            <span :class="['status-badge', `status-${selectedStore.status}`]">
              {{ getStatusLabel(selectedStore.status) }}
            </span>
          </div>

          <div class="store-detail-section">
            <h4 class="section-subtitle">기본 정보</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">가맹점명</span>
                <span class="info-value">{{ selectedStore.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">지역</span>
                <span class="info-value">{{ selectedStore.region }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">가입일</span>
                <span class="info-value">{{ selectedStore.joinDate }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">상태</span>
                <span class="info-value">{{ getStatusLabel(selectedStore.status) }}</span>
              </div>
            </div>
          </div>

          <div class="store-detail-section">
            <h4 class="section-subtitle">점주 정보</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">점주명</span>
                <span class="info-value">{{ selectedStore.owner }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">연락처</span>
                <span class="info-value">{{ selectedStore.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">이메일</span>
                <span class="info-value">{{ selectedStore.email || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">사업자번호</span>
                <span class="info-value">{{ selectedStore.businessNumber || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="store-detail-section">
            <h4 class="section-subtitle">운영 현황</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">총 등록 단골 수</span>
                <span class="info-value highlight">{{ selectedStore.totalCustomers?.toLocaleString() || '0' }}명</span>
              </div>
              <div class="info-item">
                <span class="info-label">이번 달 신규 단골</span>
                <span class="info-value highlight">{{ selectedStore.monthlyNewCustomers?.toLocaleString() || '0' }}명</span>
              </div>
              <div class="info-item">
                <span class="info-label">이번 달 쿠폰 사용</span>
                <span class="info-value highlight">{{ selectedStore.monthlyCouponUsed?.toLocaleString() || '0' }}개</span>
              </div>
              <div class="info-item">
                <span class="info-label">활성 게임 종류</span>
                <span class="info-value highlight">{{ selectedStore.activeGameTypes?.toLocaleString() || '0' }}개</span>
              </div>
            </div>
          </div>

          <div class="store-detail-section" v-if="selectedStore.memo">
            <h4 class="section-subtitle">메모</h4>
            <div class="memo-content">{{ selectedStore.memo }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-modal-cancel" @click="showStoreDetailModal = false">닫기</button>
          <button type="button" class="btn-modal-confirm" @click="openEditStoreModalFromDetail">수정</button>
        </div>
      </div>
    </div>

    <!-- Edit Store Modal -->
    <div v-if="showEditStoreModal" class="modal-overlay" @click.self="showEditStoreModal = false">
      <div class="modal-content edit-store-modal">
        <div class="modal-header">
          <h3 class="modal-title">가맹점 {{ editingStore ? '수정' : '추가' }}</h3>
          <button type="button" class="btn-modal-close" @click="closeEditStoreModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-form-group">
            <label class="modal-label">가맹점명 *</label>
            <input v-model="storeForm.name" type="text" class="modal-input" placeholder="예: 강남점" />
          </div>
          <div class="modal-form-group">
            <label class="modal-label">지역 *</label>
            <input v-model="storeForm.region" type="text" class="modal-input" placeholder="예: 서울 강남구" />
          </div>
          <div class="modal-form-row">
            <div class="modal-form-group">
              <label class="modal-label">점주명 *</label>
              <input v-model="storeForm.owner" type="text" class="modal-input" placeholder="예: 홍길동" />
            </div>
            <div class="modal-form-group">
              <label class="modal-label">연락처 *</label>
              <input v-model="storeForm.phone" type="tel" class="modal-input" placeholder="010-0000-0000" />
            </div>
          </div>
          <div class="modal-form-row">
            <div class="modal-form-group">
              <label class="modal-label">이메일</label>
              <input v-model="storeForm.email" type="email" class="modal-input" placeholder="store@example.com" />
            </div>
            <div class="modal-form-group">
              <label class="modal-label">사업자번호</label>
              <input v-model="storeForm.businessNumber" type="text" class="modal-input" placeholder="000-00-00000" />
            </div>
          </div>
          <div class="modal-form-group">
            <label class="modal-label">상태</label>
            <select v-model="storeForm.status" class="modal-select">
              <option value="active">운영중</option>
              <option value="inactive">비활성</option>
              <option value="pending">승인대기</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label class="modal-label">메모</label>
            <textarea v-model="storeForm.memo" class="modal-textarea" rows="4" placeholder="가맹점 관련 메모를 입력하세요"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-modal-cancel" @click="closeEditStoreModal">취소</button>
          <button type="button" class="btn-modal-confirm" @click="saveStore">{{ editingStore ? '수정' : '추가' }}</button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="showToast" class="toast-notification">
        <span class="toast-icon">{{ toastIcon }}</span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Tab Management
const activeTab = ref('dashboard')
const tabs = [
  { id: 'dashboard', label: '대시보드' },
  { id: 'stores', label: '가맹점 관리' },
  { id: 'cs', label: 'CS 게시판' },
  { id: 'notice', label: '공지사항 관리' },
  { id: 'assets', label: '에셋 관리' },
  { id: 'analytics', label: '통합 분석' },
  { id: 'settings', label: '시스템 설정' }
]

const currentTabLabel = computed(() => {
  return tabs.find(tab => tab.id === activeTab.value)?.label || ''
})

// Time
const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Dashboard Stats
const totalStores = ref(47)
const totalCustomers = ref(8532)
const totalGames = ref(12847)
const totalCoupons = ref(3421)

// Store Management
const stores = ref([
  {
    id: 1,
    name: '강남점',
    region: '서울 강남구',
    owner: '김사장',
    phone: '010-1234-5678',
    email: 'gangnam@example.com',
    businessNumber: '123-45-67890',
    joinDate: '2024-01-15',
    customers: 523,
    totalCustomers: 523,
    monthlyNewCustomers: 45,
    monthlyCouponUsed: 412,
    dailyCouponUsed: 247,
    activeGameTypes: 5,
    topGames: ['룰렛', '슬롯', '빙고'],
    status: 'active',
    memo: '우수 가맹점. 고객 만족도 높음.'
  },
  {
    id: 2,
    name: '홍대점',
    region: '서울 마포구',
    owner: '이사장',
    phone: '010-2345-6789',
    email: 'hongdae@example.com',
    businessNumber: '234-56-78901',
    joinDate: '2024-02-20',
    customers: 412,
    totalCustomers: 412,
    monthlyNewCustomers: 38,
    monthlyCouponUsed: 324,
    dailyCouponUsed: 198,
    activeGameTypes: 4,
    topGames: ['룰렛', '슬롯', '빙고'],
    status: 'active',
    memo: '활발한 운영. 이벤트 진행 우수.'
  },
  {
    id: 3,
    name: '신촌점',
    region: '서울 서대문구',
    owner: '박사장',
    phone: '010-3456-7890',
    email: 'sinchon@example.com',
    businessNumber: '345-67-89012',
    joinDate: '2024-03-10',
    customers: 348,
    totalCustomers: 348,
    monthlyNewCustomers: 29,
    monthlyCouponUsed: 267,
    dailyCouponUsed: 176,
    activeGameTypes: 3,
    topGames: ['빙고', '룰렛', '슬롯'],
    status: 'active',
    memo: null
  },
  {
    id: 4,
    name: '종로점',
    region: '서울 종로구',
    owner: '최사장',
    phone: '010-4567-8901',
    email: null,
    businessNumber: null,
    joinDate: '2024-04-05',
    customers: 275,
    totalCustomers: 0,
    monthlyNewCustomers: 0,
    monthlyCouponUsed: 0,
    dailyCouponUsed: 0,
    activeGameTypes: 0,
    topGames: [],
    status: 'pending',
    memo: '승인 대기중. 서류 검토 필요.'
  },
  {
    id: 5,
    name: '건대점',
    region: '서울 광진구',
    owner: '정사장',
    phone: '010-5678-9012',
    email: 'gundae@example.com',
    businessNumber: '567-89-01234',
    joinDate: '2024-05-12',
    customers: 189,
    totalCustomers: 189,
    monthlyNewCustomers: 22,
    monthlyCouponUsed: 201,
    dailyCouponUsed: 154,
    activeGameTypes: 3,
    topGames: ['슬롯', '빙고', '룰렛'],
    status: 'active',
    memo: '주말 고객 집중. 저녁 시간대 활발.'
  },
  {
    id: 6,
    name: '판교점',
    region: '경기 성남시',
    owner: '한사장',
    phone: '010-6789-0123',
    email: 'pangyo@example.com',
    businessNumber: '678-90-12345',
    joinDate: '2024-06-01',
    customers: 301,
    totalCustomers: 301,
    monthlyNewCustomers: 35,
    monthlyCouponUsed: 289,
    dailyCouponUsed: 143,
    activeGameTypes: 4,
    topGames: ['룰렛', '슬롯', '빙고'],
    status: 'active',
    memo: '직장인 고객 다수. 점심시간 활발.'
  },
  {
    id: 7,
    name: '분당점',
    region: '경기 성남시',
    owner: '송사장',
    phone: '010-7890-1234',
    email: 'bundang@example.com',
    businessNumber: '789-01-23456',
    joinDate: '2024-07-15',
    customers: 245,
    totalCustomers: 245,
    monthlyNewCustomers: 28,
    monthlyCouponUsed: 234,
    dailyCouponUsed: 132,
    activeGameTypes: 3,
    topGames: ['빙고', '슬롯', '룰렛'],
    status: 'active',
    memo: '가족 단위 고객 많음.'
  },
  {
    id: 8,
    name: '일산점',
    region: '경기 고양시',
    owner: '배사장',
    phone: '010-8901-2345',
    email: 'ilsan@example.com',
    businessNumber: '890-12-34567',
    joinDate: '2024-08-20',
    customers: 198,
    totalCustomers: 198,
    monthlyNewCustomers: 19,
    monthlyCouponUsed: 187,
    dailyCouponUsed: 119,
    activeGameTypes: 3,
    topGames: ['룰렛', '빙고', '슬롯'],
    status: 'active',
    memo: '신규 오픈. 순조로운 성장세.'
  },
  {
    id: 9,
    name: '수원점',
    region: '경기 수원시',
    owner: '유사장',
    phone: '010-9012-3456',
    email: 'suwon@example.com',
    businessNumber: '901-23-45678',
    joinDate: '2024-09-10',
    customers: 167,
    totalCustomers: 167,
    monthlyNewCustomers: 15,
    monthlyCouponUsed: 156,
    dailyCouponUsed: 107,
    activeGameTypes: 2,
    topGames: ['슬롯', '룰렛', '빙고'],
    status: 'active',
    memo: '학생 고객 비중 높음.'
  },
  {
    id: 10,
    name: '인천점',
    region: '인천 남동구',
    owner: '안사장',
    phone: '010-0123-4567',
    email: 'incheon@example.com',
    businessNumber: '012-34-56789',
    joinDate: '2024-10-05',
    customers: 134,
    totalCustomers: 134,
    monthlyNewCustomers: 12,
    monthlyCouponUsed: 128,
    dailyCouponUsed: 95,
    activeGameTypes: 2,
    topGames: ['빙고', '슬롯', '룰렛'],
    status: 'active',
    memo: '꾸준한 매출 유지.'
  }
])

// Insights Data
const pendingCSCount = computed(() => csInquiries.value.filter(cs => cs.status === 'pending').length)
const pendingStoresCount = computed(() => stores.value.filter(s => s.status === 'pending').length)
const activeStoresCount = computed(() => stores.value.filter(s => s.status === 'active').length)
const topAssetName = computed(() => {
  if (assets.value.length === 0) return '없음'
  const topAsset = assets.value.reduce((prev, current) =>
    (prev.usageCount > current.usageCount) ? prev : current
  )
  return topAsset.name
})
const topAssetUsage = computed(() => {
  if (assets.value.length === 0) return 0
  const topAsset = assets.value.reduce((prev, current) =>
    (prev.usageCount > current.usageCount) ? prev : current
  )
  return topAsset.usageCount
})

// Top Stores by Daily Coupons
const topStoresByDailyCoupons = computed(() => {
  return stores.value
    .filter(store => store.status === 'active' && store.dailyCouponUsed > 0)
    .sort((a, b) => b.dailyCouponUsed - a.dailyCouponUsed)
    .slice(0, 10)
})

const storeSearchQuery = ref('')
const storeStatusFilter = ref('')
const showAddStoreModal = ref(false)

// CS Management
const csInquiries = ref([
  {
    id: 1,
    status: 'pending',
    category: '시스템 문의',
    title: '쿠폰 발급 시스템 오류 문의',
    storeName: '강남점',
    author: '김사장',
    createdAt: '2025-12-06 14:30',
    content: '쿠폰 발급 시스템에서 오류가 발생하고 있습니다.\n고객이 게임에서 승리했음에도 불구하고 쿠폰이 자동으로 발급되지 않는 현상이 지속적으로 발생하고 있습니다.\n\n재현 단계:\n1. 고객이 게임 플레이\n2. 게임 승리\n3. 쿠폰 발급 화면에서 로딩만 계속됨\n\n시급히 확인 부탁드립니다.',
    reply: null,
    replyAuthor: null,
    replyDate: null
  },
  {
    id: 2,
    status: 'in-progress',
    category: '게임 기능',
    title: '룰렛게임 확률 설정 방법',
    storeName: '홍대점',
    author: '이사장',
    createdAt: '2025-12-06 12:15',
    content: '룰렛게임의 당첨 확률을 조정하고 싶습니다.\n현재 기본 설정으로 운영 중인데, 특정 시간대에 확률을 높이거나 낮추는 것이 가능한지 문의드립니다.\n\n또한 각 상품별로 다른 확률을 설정할 수 있는지도 알고 싶습니다.',
    reply: '안녕하세요. 관리자 페이지의 게임 설정에서 룰렛게임 확률을 조정하실 수 있습니다.\n\n설정 방법:\n1. 게임 관리 > 룰렛게임 선택\n2. 확률 설정 탭 클릭\n3. 상품별 확률 조정\n\n시간대별 확률 조정 기능은 다음 업데이트에 추가될 예정입니다.',
    replyAuthor: '본사 관리자',
    replyDate: '2025-12-06 14:20'
  },
  {
    id: 3,
    status: 'resolved',
    category: '정산 문의',
    title: '11월 정산 내역 확인 요청',
    storeName: '신촌점',
    author: '박사장',
    createdAt: '2025-12-05 16:45',
    content: '11월 정산 내역을 확인하고 싶습니다.\n정산 페이지에서 10월까지만 조회가 되고 11월 데이터가 보이지 않습니다.\n\n11월 매출이 상당했던 것으로 기억하는데, 정산 내역을 확인할 수 있을까요?',
    reply: '11월 정산 내역이 업데이트되었습니다.\n정산 페이지를 새로고침하시면 확인하실 수 있습니다.\n\n11월 총 매출: 8,420,000원\n수수료: 842,000원\n정산 예정액: 7,578,000원\n\n정산은 12월 10일에 진행될 예정입니다.',
    replyAuthor: '본사 관리자',
    replyDate: '2025-12-05 17:30'
  },
  {
    id: 4,
    status: 'pending',
    category: '기술 지원',
    title: 'QR코드 스캔 오류 발생',
    storeName: '종로점',
    author: '최사장',
    createdAt: '2025-12-05 11:20',
    content: '고객들이 QR코드를 스캔할 때 간헐적으로 오류가 발생합니다.\n\n증상:\n- QR코드 스캔 후 "잘못된 코드입니다" 메시지 표시\n- 같은 QR코드로 재시도하면 정상 작동하는 경우도 있음\n- 특정 기기에서만 발생하는 것은 아닌 것으로 보임\n\n기술 지원 부탁드립니다.',
    reply: null,
    replyAuthor: null,
    replyDate: null
  },
  {
    id: 5,
    status: 'resolved',
    category: '계정 문의',
    title: '직원 계정 추가 방법',
    storeName: '건대점',
    author: '정사장',
    createdAt: '2025-12-04 09:30',
    content: '새로 채용한 직원에게 시스템 접근 권한을 부여하고 싶습니다.\n직원 계정을 추가하는 방법을 안내해 주세요.\n\n또한 직원 권한 레벨도 설정할 수 있나요?',
    reply: '직원 계정 추가 방법을 안내드립니다.\n\n1. 설정 > 직원 관리 메뉴 접속\n2. "직원 추가" 버튼 클릭\n3. 직원 정보 입력 (이름, 연락처, 이메일)\n4. 권한 레벨 선택 (일반/매니저/관리자)\n5. 저장\n\n직원에게 SMS로 초기 비밀번호가 전송됩니다.',
    replyAuthor: '본사 관리자',
    replyDate: '2025-12-04 11:15'
  }
])

const csStatusFilter = ref('')

const filteredCS = computed(() => {
  if (!csStatusFilter.value) return csInquiries.value
  return csInquiries.value.filter(cs => cs.status === csStatusFilter.value)
})

const getCSStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '대기중',
    'in-progress': '처리중',
    resolved: '해결완료'
  }
  return labels[status] || status
}

// Notice Management
const notices = ref([
  {
    id: 1,
    isPinned: true,
    type: 'important',
    title: '[중요] 2025년 1월 정기 점검 안내',
    author: '본사 관리자',
    createdAt: '2025-12-01',
    views: 1247,
    isPopupEnabled: true,
    popupStartDate: '2025-12-01',
    popupEndDate: '2025-12-31',
    content: '2025년 1월 15일(수) 오전 2시부터 6시까지 시스템 정기 점검이 진행됩니다.\n점검 시간 동안 모든 서비스 이용이 일시 중단되오니 양해 부탁드립니다.\n\n점검 내용:\n- 서버 보안 업데이트\n- 데이터베이스 최적화\n- 신규 기능 배포 준비'
  },
  {
    id: 2,
    isPinned: true,
    type: 'update',
    title: '신규 게임 "포춘휠" 출시 안내',
    author: '본사 관리자',
    createdAt: '2025-11-28',
    views: 892,
    isPopupEnabled: false,
    popupStartDate: '',
    popupEndDate: '',
    content: '고객 참여도를 높일 수 있는 신규 게임 "포춘휠"이 출시되었습니다.\n\n주요 특징:\n- 시각적으로 화려한 룰렛 애니메이션\n- 다양한 확률 설정 옵션\n- 실시간 당첨 결과 표시\n\n관리자 페이지에서 바로 설정 가능합니다.'
  },
  {
    id: 3,
    isPinned: false,
    type: 'event',
    title: '연말 프로모션 이벤트 기획안',
    author: '본사 관리자',
    createdAt: '2025-11-25',
    views: 654,
    isPopupEnabled: true,
    popupStartDate: '2025-12-15',
    popupEndDate: '2025-12-31',
    content: '연말을 맞이하여 특별 프로모션 이벤트를 기획하였습니다.\n\n이벤트 기간: 12월 15일 ~ 12월 31일\n혜택: 쿠폰 발급 시 추가 보너스 쿠폰 제공\n참여 방법: 관리자 페이지에서 이벤트 활성화'
  },
  {
    id: 4,
    isPinned: false,
    type: 'notice',
    title: '가맹점 교육 일정 안내',
    author: '본사 관리자',
    createdAt: '2025-11-20',
    views: 523,
    isPopupEnabled: false,
    popupStartDate: '',
    popupEndDate: '',
    content: '신규 가맹점주 대상 시스템 사용 교육을 진행합니다.\n\n일시: 매주 수요일 오후 2시\n장소: 본사 교육장\n신청: 담당자 이메일로 신청'
  },
  {
    id: 5,
    isPinned: false,
    type: 'update',
    title: '모바일 앱 v2.3 업데이트 내역',
    author: '본사 관리자',
    createdAt: '2025-11-15',
    views: 418,
    isPopupEnabled: false,
    popupStartDate: '',
    popupEndDate: '',
    content: '모바일 앱이 v2.3으로 업데이트되었습니다.\n\n주요 변경사항:\n- UI/UX 개선\n- 게임 로딩 속도 향상\n- 버그 수정 및 안정성 개선'
  }
])

const showAddNoticeModal = ref(false)

// Notice Modal State
const showNoticeDetailModal = ref(false)
const showEditNoticeModal = ref(false)
const selectedNotice = ref<any>(null)
const editingNotice = ref<number | null>(null)
const noticeForm = ref({
  type: 'notice',
  title: '',
  content: '',
  isPinned: false,
  isPopupEnabled: false,
  popupStartDate: '',
  popupEndDate: ''
})

// Notice Modal Functions
const viewNotice = (noticeId: number) => {
  selectedNotice.value = notices.value.find(n => n.id === noticeId)
  if (selectedNotice.value) {
    selectedNotice.value.views += 1
    showNoticeDetailModal.value = true
  }
}

const openEditNoticeModal = (noticeId: number) => {
  const notice = notices.value.find(n => n.id === noticeId)
  if (notice) {
    editingNotice.value = noticeId
    noticeForm.value = {
      type: notice.type,
      title: notice.title,
      content: notice.content || '',
      isPinned: notice.isPinned,
      isPopupEnabled: notice.isPopupEnabled,
      popupStartDate: notice.popupStartDate,
      popupEndDate: notice.popupEndDate
    }
    showEditNoticeModal.value = true
  }
}

const openEditNoticeModalFromDetail = () => {
  if (selectedNotice.value) {
    showNoticeDetailModal.value = false
    openEditNoticeModal(selectedNotice.value.id)
  }
}

const closeEditNoticeModal = () => {
  showEditNoticeModal.value = false
  editingNotice.value = null
  noticeForm.value = {
    type: 'notice',
    title: '',
    content: '',
    isPinned: false,
    isPopupEnabled: false,
    popupStartDate: '',
    popupEndDate: ''
  }
}

const saveNotice = () => {
  if (!noticeForm.value.title.trim()) {
    showToastNotification('제목을 입력해주세요', '⚠️')
    return
  }

  if (editingNotice.value) {
    const notice = notices.value.find(n => n.id === editingNotice.value)
    if (notice) {
      notice.type = noticeForm.value.type
      notice.title = noticeForm.value.title
      notice.content = noticeForm.value.content
      notice.isPinned = noticeForm.value.isPinned
      notice.isPopupEnabled = noticeForm.value.isPopupEnabled
      notice.popupStartDate = noticeForm.value.popupStartDate
      notice.popupEndDate = noticeForm.value.popupEndDate
      showToastNotification('공지사항이 수정되었습니다', '✓')
    }
  } else {
    const newNotice = {
      id: notices.value.length + 1,
      ...noticeForm.value,
      author: '본사 관리자',
      createdAt: new Date().toISOString().split('T')[0] as string,
      views: 0
    }
    notices.value.unshift(newNotice as any)
    showToastNotification('공지사항이 작성되었습니다', '✓')
  }

  closeEditNoticeModal()
}

const getNoticeTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    important: '중요',
    update: '업데이트',
    event: '이벤트',
    notice: '공지'
  }
  return labels[type] || type
}

// CS Modal State
const showCSDetailModal = ref(false)
const showCSReplyModal = ref(false)
const selectedCS = ref<any>(null)
const replyingCS = ref<any>(null)
const csReplyForm = ref({
  reply: '',
  status: 'pending'
})

// Store Modal State
const showStoreDetailModal = ref(false)
const showEditStoreModal = ref(false)
const selectedStore = ref<any>(null)
const editingStore = ref<number | null>(null)
const storeForm = ref({
  name: '',
  region: '',
  owner: '',
  phone: '',
  email: '',
  businessNumber: '',
  status: 'active',
  memo: ''
})

// CS Modal Functions
const viewCS = (csId: number) => {
  selectedCS.value = csInquiries.value.find(cs => cs.id === csId)
  if (selectedCS.value) {
    showCSDetailModal.value = true
  }
}

const openReplyModal = (csId: number) => {
  const cs = csInquiries.value.find(cs => cs.id === csId)
  if (cs) {
    replyingCS.value = cs
    csReplyForm.value = {
      reply: cs.reply || '',
      status: cs.status
    }
    showCSReplyModal.value = true
  }
}

const openReplyModalFromDetail = () => {
  if (selectedCS.value) {
    showCSDetailModal.value = false
    openReplyModal(selectedCS.value.id)
  }
}

const closeReplyModal = () => {
  showCSReplyModal.value = false
  replyingCS.value = null
  csReplyForm.value = {
    reply: '',
    status: 'pending'
  }
}

const saveReply = () => {
  if (!csReplyForm.value.reply.trim()) {
    showToastNotification('답변 내용을 입력해주세요', '⚠️')
    return
  }

  if (replyingCS.value) {
    const cs = csInquiries.value.find(c => c.id === replyingCS.value.id)
    if (cs) {
      cs.reply = csReplyForm.value.reply
      cs.status = csReplyForm.value.status
      cs.replyAuthor = '본사 관리자'
      cs.replyDate = (new Date().toISOString().split('T')[0] || '') + ' ' + (new Date().toTimeString().split(' ')[0]?.substring(0, 5) || '')
      showToastNotification('답변이 등록되었습니다', '✓')
    }
  }

  closeReplyModal()
}

const deleteCS = (csId: number) => {
  if (confirm('정말 이 CS 문의를 삭제하시겠습니까?')) {
    csInquiries.value = csInquiries.value.filter(cs => cs.id !== csId)
    showToastNotification('CS 문의가 삭제되었습니다', '✓')
  }
}

const filteredStores = computed(() => {
  return stores.value.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(storeSearchQuery.value.toLowerCase()) ||
                         store.owner.toLowerCase().includes(storeSearchQuery.value.toLowerCase())
    const matchesStatus = !storeStatusFilter.value || store.status === storeStatusFilter.value
    return matchesSearch && matchesStatus
  })
})

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: '운영중',
    inactive: '비활성',
    pending: '승인대기'
  }
  return labels[status] || status
}

// Toast Notification
const showToast = ref(false)
const toastMessage = ref('')
const toastIcon = ref('✓')

const showToastNotification = (message: string, icon: string = '✓') => {
  toastMessage.value = message
  toastIcon.value = icon
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Actions
const logout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    router.push('/')
  }
}

// Store Modal Functions
const viewStoreDetail = (storeId: number) => {
  selectedStore.value = stores.value.find(s => s.id === storeId)
  if (selectedStore.value) {
    showStoreDetailModal.value = true
  }
}

const openEditStoreModal = (storeId?: number) => {
  if (storeId) {
    const store = stores.value.find(s => s.id === storeId)
    if (store) {
      editingStore.value = storeId
      storeForm.value = {
        name: store.name,
        region: store.region,
        owner: store.owner,
        phone: store.phone,
        email: store.email || '',
        businessNumber: store.businessNumber || '',
        status: store.status,
        memo: store.memo || ''
      }
      showEditStoreModal.value = true
    }
  } else {
    editingStore.value = null
    storeForm.value = {
      name: '',
      region: '',
      owner: '',
      phone: '',
      email: '',
      businessNumber: '',
      status: 'active',
      memo: ''
    }
    showEditStoreModal.value = true
  }
}

const openEditStoreModalFromDetail = () => {
  if (selectedStore.value) {
    showStoreDetailModal.value = false
    openEditStoreModal(selectedStore.value.id)
  }
}

const closeEditStoreModal = () => {
  showEditStoreModal.value = false
  editingStore.value = null
  storeForm.value = {
    name: '',
    region: '',
    owner: '',
    phone: '',
    email: '',
    businessNumber: '',
    status: 'active',
    memo: ''
  }
}

const saveStore = () => {
  if (!storeForm.value.name.trim()) {
    showToastNotification('가맹점명을 입력해주세요', '⚠️')
    return
  }
  if (!storeForm.value.region.trim()) {
    showToastNotification('지역을 입력해주세요', '⚠️')
    return
  }
  if (!storeForm.value.owner.trim()) {
    showToastNotification('점주명을 입력해주세요', '⚠️')
    return
  }
  if (!storeForm.value.phone.trim()) {
    showToastNotification('연락처를 입력해주세요', '⚠️')
    return
  }

  if (editingStore.value) {
    const store = stores.value.find(s => s.id === editingStore.value)
    if (store) {
      store.name = storeForm.value.name
      store.region = storeForm.value.region
      store.owner = storeForm.value.owner
      store.phone = storeForm.value.phone
      store.email = storeForm.value.email || null
      store.businessNumber = storeForm.value.businessNumber || null
      store.status = storeForm.value.status
      store.memo = storeForm.value.memo || null
      showToastNotification('가맹점 정보가 수정되었습니다', '✓')
    }
  } else {
    const newStore = {
      id: stores.value.length + 1,
      name: storeForm.value.name,
      region: storeForm.value.region,
      owner: storeForm.value.owner,
      phone: storeForm.value.phone,
      email: storeForm.value.email || '',
      businessNumber: storeForm.value.businessNumber || '',
      joinDate: new Date().toISOString().split('T')[0] as string,
      customers: 0,
      totalCustomers: 0,
      monthlyNewCustomers: 0,
      monthlyCouponUsed: 0,
      activeGameTypes: 0,
      dailyCouponUsed: 0,
      topGames: [],
      status: storeForm.value.status,
      memo: storeForm.value.memo || ''
    }
    stores.value.unshift(newStore as any)
    showToastNotification('가맹점이 추가되었습니다', '✓')
  }

  closeEditStoreModal()
}

const editStore = (storeId: number) => {
  openEditStoreModal(storeId)
}

const deleteStore = (storeId: number) => {
  if (confirm('정말 이 가맹점을 삭제하시겠습니까?')) {
    stores.value = stores.value.filter(s => s.id !== storeId)
    showToastNotification('가맹점이 삭제되었습니다', '✓')
  }
}

const addStore = () => {
  openEditStoreModal()
}

// Notice Actions
const toggleNoticePin = (noticeId: number) => {
  const notice = notices.value.find(n => n.id === noticeId)
  if (notice) {
    notice.isPinned = !notice.isPinned
    showToastNotification(
      notice.isPinned ? '공지사항이 상단에 고정되었습니다' : '공지사항 고정이 해제되었습니다',
      '✓'
    )
  }
}

const deleteNotice = (noticeId: number) => {
  if (confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
    notices.value = notices.value.filter(n => n.id !== noticeId)
    showToastNotification('공지사항이 삭제되었습니다', '✓')
  }
}

// Asset Management
const assetSearchQuery = ref('')
const assetCategoryFilter = ref('')
const assetGameTypeFilter = ref('')
const showAssetDetailModal = ref(false)
const showEditAssetModal = ref(false)
const selectedAsset = ref<any>(null)
const editingAsset = ref<number | null>(null)
const assetForm = ref({
  name: '',
  category: 'food',
  gameType: 'spot-difference',
  imageUrl: null as string | null
})

const assets = ref([
  {
    id: 1,
    name: '햄버거 세트',
    category: 'food',
    gameType: 'spot-difference',
    imageUrl: null,
    usageCount: 12,
    uploadDate: '2025-11-15'
  },
  {
    id: 2,
    name: '아이스 아메리카노',
    category: 'drink',
    gameType: 'matching',
    imageUrl: null,
    usageCount: 8,
    uploadDate: '2025-11-20'
  },
  {
    id: 3,
    name: '초콜릿 케이크',
    category: 'dessert',
    gameType: 'memory',
    imageUrl: null,
    usageCount: 15,
    uploadDate: '2025-11-25'
  },
  {
    id: 4,
    name: '파스타',
    category: 'food',
    gameType: 'spot-difference',
    imageUrl: null,
    usageCount: 6,
    uploadDate: '2025-12-01'
  },
  {
    id: 5,
    name: '오렌지 주스',
    category: 'drink',
    gameType: 'matching',
    imageUrl: null,
    usageCount: 10,
    uploadDate: '2025-12-03'
  }
])

const filteredAssets = computed(() => {
  return assets.value.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(assetSearchQuery.value.toLowerCase())
    const matchesCategory = !assetCategoryFilter.value || asset.category === assetCategoryFilter.value
    const matchesGameType = !assetGameTypeFilter.value || asset.gameType === assetGameTypeFilter.value
    return matchesSearch && matchesCategory && matchesGameType
  })
})

const getAssetCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    food: '음식',
    drink: '음료',
    dessert: '디저트',
    object: '오브젝트',
    background: '배경'
  }
  return labels[category] || category
}

const getAssetGameTypeLabel = (gameType: string) => {
  const labels: Record<string, string> = {
    'pinball': '핀볼',
    'brick-breaker': '벽돌깨기',
    'memory': '같은 카드 찾기',
    'spot-difference': '틀린 그림 찾기'
  }
  return labels[gameType] || gameType
}

const uploadAsset = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newAsset = {
          id: assets.value.length + 1,
          name: file.name.split('.')[0] || '',
          category: 'food',
          gameType: 'spot-difference',
          imageUrl: (e.target?.result as string) || '',
          usageCount: 0,
          uploadDate: new Date().toISOString().split('T')[0] as string
        }
        assets.value.unshift(newAsset as any)
        showToastNotification('에셋이 업로드되었습니다', '✓')
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const viewAssetDetail = (assetId: number) => {
  const asset = assets.value.find(a => a.id === assetId)
  if (asset) {
    selectedAsset.value = asset
    showAssetDetailModal.value = true
  }
}

const openEditAssetModal = (assetId?: number) => {
  if (assetId) {
    const asset = assets.value.find(a => a.id === assetId)
    if (asset) {
      editingAsset.value = assetId
      assetForm.value = {
        name: asset.name,
        category: asset.category,
        gameType: asset.gameType,
        imageUrl: asset.imageUrl
      }
    }
  } else {
    editingAsset.value = null
    assetForm.value = {
      name: '',
      category: 'food',
      gameType: 'spot-difference',
      imageUrl: null
    }
  }
  showEditAssetModal.value = true
}

const closeEditAssetModal = () => {
  showEditAssetModal.value = false
  editingAsset.value = null
  assetForm.value = {
    name: '',
    category: 'food',
    gameType: 'spot-difference',
    imageUrl: null
  }
}

const editAsset = (assetId: number) => {
  openEditAssetModal(assetId)
}

const saveAsset = () => {
  if (!assetForm.value.name.trim()) {
    showToastNotification('에셋 이름을 입력해주세요', '⚠️')
    return
  }

  if (editingAsset.value) {
    const asset = assets.value.find(a => a.id === editingAsset.value)
    if (asset) {
      asset.name = assetForm.value.name
      asset.category = assetForm.value.category
      asset.gameType = assetForm.value.gameType
      if (assetForm.value.imageUrl) {
        asset.imageUrl = assetForm.value.imageUrl as any
      }
      showToastNotification('에셋이 수정되었습니다', '✓')
    }
  } else {
    const newAsset = {
      id: assets.value.length + 1,
      name: assetForm.value.name,
      category: assetForm.value.category,
      gameType: assetForm.value.gameType,
      imageUrl: assetForm.value.imageUrl || '',
      usageCount: 0,
      uploadDate: new Date().toISOString().split('T')[0] as string
    }
    assets.value.unshift(newAsset as any)
    showToastNotification('에셋이 추가되었습니다', '✓')
  }

  closeEditAssetModal()
}

const uploadAssetImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        assetForm.value.imageUrl = e.target?.result as string
        showToastNotification('이미지가 업로드되었습니다', '✓')
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const deleteAsset = (assetId: number) => {
  if (confirm('정말 이 에셋을 삭제하시겠습니까?\n이 에셋을 사용중인 게임에서 제거될 수 있습니다.')) {
    assets.value = assets.value.filter(a => a.id !== assetId)
    showToastNotification('에셋이 삭제되었습니다', '✓')
    if (showAssetDetailModal.value && selectedAsset.value?.id === assetId) {
      showAssetDetailModal.value = false
    }
  }
}

// System Settings
const systemSettings = ref({
  brandLogo: null as string | null,
  companyName: '웨잇플레이',
  brandColor: '#007AFF',
  notifyNewStore: true,
  notifyCS: true,
  notifyDailyReport: false,
  backupSchedule: 'weekly'
})

// System Settings Functions
const uploadLogo = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        systemSettings.value.brandLogo = e.target?.result as string
        showToastNotification('로고가 업로드되었습니다', '✓')
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const removeLogo = () => {
  if (confirm('브랜드 로고를 삭제하시겠습니까?')) {
    systemSettings.value.brandLogo = null
    showToastNotification('로고가 삭제되었습니다', '✓')
  }
}

const downloadBackup = () => {
  const data = {
    stores: stores.value,
    notices: notices.value,
    csInquiries: csInquiries.value,
    settings: systemSettings.value,
    exportDate: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `waitplay-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)

  showToastNotification('백업 파일이 다운로드되었습니다', '✓')
}

const saveSettings = () => {
  // 실제로는 API 호출하여 서버에 저장
  showToastNotification('설정이 저장되었습니다', '✓')
}

const resetSettings = () => {
  if (confirm('모든 설정을 초기화하시겠습니까?')) {
    systemSettings.value = {
      brandLogo: null,
      companyName: '웨잇플레이',
      brandColor: '#007AFF',
      notifyNewStore: true,
      notifyCS: true,
      notifyDailyReport: false,
      backupSchedule: 'weekly'
    }
    showToastNotification('설정이 초기화되었습니다', '✓')
  }
}

// Lifecycle
let timeInterval: number | null = null

onMounted(() => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 60000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.superadmin-view {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 0.5px solid #d1d1d6;
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.03);
}

.logo-section {
  padding: 0 24px 24px;
  border-bottom: 1px solid #e5e5ea;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.logo-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #ff3b30 0%, #d32f2f 100%);
  color: #ffffff;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.nav-menu {
  flex: 1;
  padding: 0 16px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 6px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 15px;
  color: #1d1d1f;
}

.nav-item:hover {
  background: #f5f5f7;
}

.nav-item.active {
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.nav-label {
  font-weight: 500;
}

/* Sidebar Account Section */
.sidebar-account {
  padding: 20px 16px;
  border-top: 0.5px solid #e1e4e8;
  margin-top: auto;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 10px;
}

.account-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #007aff 0%, #005ecb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.account-details {
  flex: 1;
  min-width: 0;
}

.account-name {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 2px 0;
  letter-spacing: -0.01em;
}

.account-email {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 13px;
  color: #8e8e93;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-logout {
  width: 100%;
  padding: 12px 16px;
  background: #f5f5f7;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-logout:hover {
  background: #e5e5ea;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

/* Header */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e5ea;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #8e8e93;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}


.header-time {
  padding: 10px 16px;
  background: #f5f5f7;
  border-radius: 10px;
  font-size: 14px;
  color: #1d1d1f;
  font-weight: 500;
}

/* Apple-Style Metrics */
.metrics-apple {
  display: flex;
  gap: 24px;
  margin-bottom: 48px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.metric-apple {
  flex: 1;
  min-width: 180px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%);
  padding: 32px 24px;
  border-radius: 16px;
  border: 1px solid #e1e4e8;
  text-align: center;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  animation: metricSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  box-shadow: 0 2px 12px rgba(0, 122, 255, 0.06);
}

.metric-apple:nth-child(1) {
  animation-delay: 0.1s;
}

.metric-apple:nth-child(2) {
  animation-delay: 0.2s;
}

.metric-apple:nth-child(3) {
  animation-delay: 0.3s;
}

.metric-apple:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes metricSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-apple:hover {
  transform: translateY(-2px);
  border-color: #007aff;
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.15);
}

.metric-value-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 8px 0;
  letter-spacing: -0.03em;
}

.metric-label-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 17px;
  color: #8e8e93;
  margin: 0 0 8px 0;
  font-weight: 400;
}

.metric-change-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  color: #007aff;
  font-weight: 500;
}

/* Activity Grid */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.activity-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e5ea;
  padding: 20px;
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.activity-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.activity-rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f7;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.activity-card-icon {
  font-size: 32px;
}

.activity-card-coupon {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
}

.activity-card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-card-store {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.activity-card-region {
  font-size: 13px;
  color: #8e8e93;
  margin: 0;
}

.activity-card-games {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.game-badge {
  padding: 4px 10px;
  background: #f5f5f7;
  color: #1d1d1f;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

/* Content Section */
.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.content-section {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e5ea;
  padding: 24px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.btn-filter-apple {
  padding: 8px 16px;
  background: #f5f5f7;
  border: 1px solid #d1d1d6;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-filter-apple:hover {
  background: #e5e5ea;
}

.btn-filter-apple.active {
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: #ffffff;
  border-color: transparent;
}

.btn-primary-apple {
  padding: 10px 20px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary-apple:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-primary-apple.large {
  padding: 14px 28px;
  font-size: 16px;
}

/* Chart Placeholder */
.chart-placeholder {
  background: #f5f5f7;
  border: 2px dashed #d1d1d6;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
}

.chart-placeholder.large {
  padding: 100px 20px;
}

.chart-message {
  font-size: 18px;
  color: #8e8e93;
  margin-bottom: 8px;
}

.chart-hint {
  font-size: 14px;
  color: #a0a0a5;
  margin: 0;
}

/* Activity Grid */

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input-apple {
  flex: 1;
  padding: 12px 16px;
  background: #f5f5f7;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 15px;
  color: #1d1d1f;
  transition: all 0.2s ease;
}

.search-input-apple:focus {
  outline: none;
  background: #ffffff;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.select-apple {
  padding: 12px 16px;
  background: #f5f5f7;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 15px;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-apple:focus {
  outline: none;
  background: #ffffff;
  border-color: #007aff;
}

/* Table */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 12px 16px;
  background: #f5f5f7;
  border-bottom: 1px solid #d1d1d6;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6e6e73;
  text-transform: uppercase;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #e5e5ea;
  font-size: 14px;
  color: #1d1d1f;
}

.data-table tbody tr:hover {
  background: #f5f5f7;
}

.store-name {
  font-weight: 600;
}

.text-center {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: #d1f4e0;
  color: #28a745;
}

.status-inactive {
  background: #ffe5e5;
  color: #ff3b30;
}

.status-pending {
  background: #fff3cd;
  color: #ff9500;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.btn-action-small {
  width: 32px;
  height: 32px;
  padding: 0;
  background: #f5f5f7;
  border: 1px solid #d1d1d6;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action-small:hover {
  background: #e5e5ea;
  transform: translateY(-1px);
}

.btn-action-small.danger:hover {
  background: #fff5f4;
  border-color: #ff3b30;
}

/* Settings Styles */
.settings-actions {
  display: flex;
  gap: 12px;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%);
  border-radius: 16px;
  border: 1px solid #e1e4e8;
  padding: 28px;
  transition: all 0.3s ease;
}

.settings-section:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.settings-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e1e4e8;
}

.settings-section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-icon {
  font-size: 24px;
}

.settings-section-title h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.settings-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.settings-badge.primary {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

.settings-section-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Brand Identity Section */
.brand-identity-group {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 32px;
}

.brand-logo-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.logo-upload-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.logo-preview-box {
  width: 100%;
  height: 200px;
  background: #f5f5f7;
  border: 2px dashed #d1d1d6;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s ease;
}

.logo-preview-box:hover {
  border-color: #007aff;
  background: #f0f4f8;
}

.brand-logo-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.logo-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-icon {
  font-size: 40px;
  opacity: 0.4;
}

.empty-text {
  font-size: 13px;
  color: #8e8e93;
}

.logo-control-buttons {
  display: flex;
  gap: 12px;
}

.btn-upload-modern,
.btn-remove-modern {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-upload-modern {
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: #ffffff;
}

.btn-upload-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 122, 255, 0.3);
}

.btn-remove-modern {
  background: linear-gradient(135deg, #ff3b30 0%, #d32f2f 100%);
  color: #ffffff;
}

.btn-remove-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(255, 59, 48, 0.3);
}

.btn-icon {
  font-size: 16px;
}

.brand-info-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group-modern {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label-modern {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.input-modern {
  padding: 14px 16px;
  background: #ffffff;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 15px;
  color: #1d1d1f;
  transition: all 0.3s ease;
}

.input-modern:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.color-selector-modern {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-preview-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.color-input-hidden {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.color-picker-button {
  padding: 12px 20px;
  background: #f5f5f7;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-picker-button:hover {
  background: #e8e8ed;
  border-color: #007aff;
}

.color-code-input {
  flex: 1;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'SF Mono', 'Monaco', monospace;
  color: #1d1d1f;
  transition: all 0.3s ease;
}

.color-code-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

/* Notification Options */
.notification-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: #f8f9fb;
  border-color: #d0d5dd;
}

.notification-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.notification-desc {
  font-size: 13px;
  color: #6e6e73;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 32px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d1d6;
  transition: 0.4s;
  border-radius: 32px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #34c759;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Data Management Options */
.data-management-options {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.select-modern {
  padding: 14px 16px;
  background: #ffffff;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 15px;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-modern:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.form-helper-text {
  font-size: 13px;
  color: #6e6e73;
  margin-top: 4px;
}

.backup-action-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-action-modern {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%);
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-action-modern:hover {
  background: linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%);
  border-color: #007aff;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.btn-action-modern .btn-icon {
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 12px;
}

.btn-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.btn-text {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.btn-subtext {
  font-size: 13px;
  color: #6e6e73;
}

/* Settings - Game List */
.game-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.game-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.game-item:hover {
  background: #f5f5f7;
}

.game-item span {
  font-size: 14px;
  color: #1d1d1f;
}

/* Settings - Checkbox Items */
.setting-item.checkbox-item {
  flex-direction: row;
  align-items: center;
}

.setting-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 100%;
  padding: 12px;
  background: #ffffff;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.setting-checkbox:hover {
  background: #f5f5f7;
}

.setting-checkbox span {
  font-size: 14px;
  color: #1d1d1f;
  font-weight: 500;
}

.btn-secondary-apple.full-width {
  width: 100%;
}

.btn-secondary-apple.danger {
  color: #ff3b30;
  border-color: #ff3b30;
}

.btn-secondary-apple.danger:hover {
  background: rgba(255, 59, 48, 0.1);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.store-modal {
  width: 500px;
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e5ea;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.btn-modal-close {
  width: 32px;
  height: 32px;
  background: #f5f5f7;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  color: #8e8e93;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-modal-close:hover {
  background: #e5e5ea;
  color: #1d1d1f;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-form-group {
  margin-bottom: 20px;
}

.modal-form-group:last-child {
  margin-bottom: 0;
}

.modal-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  background: #f5f5f7;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 15px;
  color: #1d1d1f;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif;
}

.modal-input:focus {
  outline: none;
  background: #ffffff;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.modal-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid #e5e5ea;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.btn-modal-cancel {
  padding: 10px 20px;
  background: #f5f5f7;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-cancel:hover {
  background: #e5e5ea;
}

.btn-modal-confirm {
  padding: 10px 20px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-modal-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* CS & Notice Styles */
.cs-title,
.notice-title {
  font-weight: 500;
  color: #1d1d1f;
}

.popup-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: #f5f5f7;
  color: #8e8e93;
}

.popup-badge.active {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

.popup-period {
  font-size: 13px;
  color: #6e6e73;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge-important {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.badge-update {
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
}

.badge-event {
  background: rgba(255, 149, 0, 0.1);
  color: #ff9500;
}

.badge-notice {
  background: rgba(88, 86, 214, 0.1);
  color: #5856d6;
}

.text-muted {
  color: #a0a0a5;
}

.checkbox-apple {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 32px;
  right: 32px;
  padding: 16px 24px;
  background: #1d1d1f;
  color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 500;
  z-index: 10001;
}

.toast-icon {
  font-size: 20px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Notice Modal Styles */
.notice-detail-modal,
.edit-notice-modal {
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.notice-detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.badge-pinned {
  background: rgba(255, 149, 0, 0.1);
  color: #ff9500;
}

.notice-detail-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.notice-detail-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #e5e5ea;
  border-bottom: 1px solid #e5e5ea;
  margin-bottom: 16px;
  font-size: 13px;
  color: #6e6e73;
}

.notice-detail-popup {
  margin-bottom: 20px;
}

.popup-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 122, 255, 0.05);
  border-radius: 8px;
}

.notice-detail-content {
  font-size: 15px;
  line-height: 1.6;
  color: #1d1d1f;
  white-space: pre-wrap;
}

.notice-title {
  cursor: pointer;
  transition: color 0.2s ease;
}

.notice-title:hover {
  color: #007aff;
}

.modal-textarea {
  width: 100%;
  padding: 12px 16px;
  background: #f5f5f7;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 15px;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
}

.modal-textarea:focus {
  outline: none;
  background: #ffffff;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.modal-select {
  width: 100%;
  padding: 12px 16px;
  background: #f5f5f7;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 15px;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-select:focus {
  outline: none;
  background: #ffffff;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.modal-checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #1d1d1f;
  cursor: pointer;
  user-select: none;
}

.checkbox-apple {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d1d6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background: #f5f5f7;
  position: relative;
}

.checkbox-apple:checked {
  background: #007aff;
  border-color: #007aff;
}

.checkbox-apple:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.modal-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* CS Modal Styles */
.cs-detail-modal,
.cs-reply-modal {
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.cs-detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.cs-category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(88, 86, 214, 0.1);
  color: #5856d6;
}

.cs-detail-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

.cs-detail-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #e5e5ea;
  border-bottom: 1px solid #e5e5ea;
  margin-bottom: 20px;
  font-size: 13px;
  color: #6e6e73;
}

.cs-detail-content,
.cs-detail-reply {
  margin-bottom: 24px;
}

.cs-detail-content h4,
.cs-detail-reply h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

.cs-detail-content p,
.cs-detail-reply p {
  font-size: 15px;
  line-height: 1.6;
  color: #1d1d1f;
  white-space: pre-wrap;
  margin: 0;
}

.cs-detail-reply {
  background: rgba(0, 122, 255, 0.05);
  padding: 16px;
  border-radius: 12px;
  border-left: 3px solid #007aff;
}

.reply-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #6e6e73;
  margin-bottom: 12px;
}

.cs-title {
  cursor: pointer;
  transition: color 0.2s ease;
}

.cs-title:hover {
  color: #007aff;
}

.cs-info-section {
  background: #f5f5f7;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: #6e6e73;
  min-width: 80px;
}

.info-value {
  color: #1d1d1f;
}

.content-preview {
  background: #ffffff;
  padding: 12px 16px;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 14px;
  color: #1d1d1f;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 120px;
  overflow-y: auto;
}

/* Store Modal Styles */
.store-detail-modal,
.edit-store-modal {
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.store-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e5ea;
}

.store-detail-name {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.store-detail-section {
  margin-bottom: 28px;
}

.section-subtitle {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f5f5f7;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .info-label {
  font-size: 13px;
  font-weight: 600;
  color: #6e6e73;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .info-value {
  font-size: 15px;
  color: #1d1d1f;
  font-weight: 500;
}

.info-item .info-value.highlight {
  color: #007aff;
  font-weight: 600;
  font-size: 16px;
}

.memo-content {
  background: #f5f5f7;
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #1d1d1f;
  white-space: pre-wrap;
}

.store-name.clickable {
  cursor: pointer;
  color: #007aff;
  font-weight: 600;
}

.store-name.clickable:hover {
  text-decoration: underline;
}

/* Asset Management Styles */
.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.asset-card {
  background: #ffffff;
  border: 1px solid #d1d1d6;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.asset-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.asset-image-container {
  width: 100%;
  height: 200px;
  background: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.asset-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-image-placeholder {
  font-size: 14px;
  color: #8e8e93;
}

.asset-info {
  padding: 16px;
  flex: 1;
}

.asset-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

.asset-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.asset-category-tag,
.asset-game-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.asset-category-tag {
  background: rgba(255, 149, 0, 0.1);
  color: #ff9500;
}

.asset-game-tag {
  background: rgba(88, 86, 214, 0.1);
  color: #5856d6;
}

.asset-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #6e6e73;
}

.asset-stat {
  font-weight: 500;
}

.asset-date {
  font-size: 12px;
}

.asset-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e5e5ea;
  background: #f5f5f7;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-message {
  font-size: 16px;
  color: #6e6e73;
  margin-bottom: 20px;
}

/* Asset Modal Styles */
.asset-detail-modal {
  max-width: 800px;
  max-height: 85vh;
}

.asset-detail-preview {
  width: 100%;
  margin-bottom: 28px;
}

.asset-detail-image-container {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.asset-detail-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.asset-detail-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.placeholder-icon {
  font-size: 64px;
  opacity: 0.3;
}

.placeholder-text {
  font-size: 16px;
  color: #8e8e93;
}

.asset-detail-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.asset-detail-name {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.asset-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%);
  border-radius: 12px;
}

.detail-label {
  font-size: 13px;
  font-weight: 500;
  color: #6e6e73;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.detail-value.highlight {
  color: #007aff;
}

.asset-usage-section {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fb 0%, #f0f2f5 100%);
  border-radius: 12px;
}

.usage-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
}

.usage-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.usage-item {
  padding: 8px 16px;
  background: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  font-size: 14px;
  color: #1d1d1f;
}

.btn-modal-delete {
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff3b30 0%, #d32f2f 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(255, 59, 48, 0.3);
}

.footer-right {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

/* Asset Edit Modal */
.edit-asset-modal {
  max-width: 900px;
  max-height: 85vh;
}

.asset-edit-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 32px;
}

.asset-edit-image-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.asset-edit-image-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.asset-edit-preview {
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px dashed #d1d1d6;
  transition: all 0.3s ease;
}

.asset-edit-preview:hover {
  border-color: #007aff;
  background: linear-gradient(135deg, #f0f4f8 0%, #e1e8f0 100%);
}

.edit-image-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.edit-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.btn-upload-asset {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-upload-asset:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 122, 255, 0.3);
}

.upload-icon {
  font-size: 18px;
}

.asset-edit-info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
