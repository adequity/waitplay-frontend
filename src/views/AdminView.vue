<template>
  <div class="admin-view">
    <!-- Left Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">⚙️</div>
        <h2>WaitPlay</h2>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </nav>

      <!-- Account Section -->
      <div class="sidebar-account">
        <div class="account-info">
          <div class="account-avatar">👤</div>
          <div class="account-details">
            <p class="account-name">관리자</p>
            <p class="account-email">admin@waitplay.com</p>
          </div>
        </div>
        <button class="btn-logout">
          <span>로그아웃</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <div class="content-header">
        <h1>{{ tabs.find(t => t.id === activeTab)?.label }}</h1>
      </div>

      <!-- Dashboard Tab -->
      <div v-show="activeTab === 'dashboard'" class="tab-content">
      <!-- Apple-Style Greeting -->
      <div class="apple-greeting">
        <h1 class="greeting-title">WaitPlay 관리자</h1>
        <p class="greeting-subtitle">오늘도 좋은 하루 보내세요</p>
      </div>

      <!-- Global Date Filter -->
      <div class="global-filter-section">
        <div class="filter-label">기간 선택</div>
        <div class="date-filter-apple">
          <button
            v-for="filter in dateFilters"
            :key="filter.value"
            @click="selectedFilter = filter.value"
            :class="['filter-btn-apple', { active: selectedFilter === filter.value }]"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Apple-Style Key Metrics -->
      <div class="metrics-apple">
        <div class="metric-apple">
          <p class="metric-value-apple">{{ animatedQrUsers }}</p>
          <p class="metric-label-apple">QR 활용자</p>
          <p class="metric-change-apple">{{ selectedDateRange }}</p>
        </div>

        <div class="metric-apple">
          <p class="metric-value-apple">{{ animatedCouponUsed }}</p>
          <p class="metric-label-apple">쿠폰 사용</p>
          <p class="metric-change-apple">{{ selectedDateRange }}</p>
        </div>

        <div class="metric-apple">
          <p class="metric-value-apple">{{ animatedNewFavorites }}</p>
          <p class="metric-label-apple">신규 단골</p>
          <p class="metric-change-apple">{{ selectedDateRange }}</p>
        </div>

        <div class="metric-apple">
          <p class="metric-value-apple">{{ animatedTotalFavorites }}</p>
          <p class="metric-label-apple">총 단골 수</p>
          <p class="metric-change-apple">누적</p>
        </div>
      </div>

      <!-- Apple-Style Chart Section -->
      <div class="chart-apple">
        <div class="chart-header-apple">
          <h3 class="chart-title-apple">일자별 활동 추이</h3>
        </div>

        <div class="chart-legend-apple">
          <div class="legend-item-apple">
            <span class="legend-dot-apple" style="background: #007aff"></span>
            <span class="legend-label-apple">QR 활용자</span>
          </div>
          <div class="legend-item-apple">
            <span class="legend-dot-apple" style="background: #34c759"></span>
            <span class="legend-label-apple">쿠폰 사용</span>
          </div>
          <div class="legend-item-apple">
            <span class="legend-dot-apple" style="background: #ff9500"></span>
            <span class="legend-label-apple">신규 단골</span>
          </div>
        </div>

        <div class="chart-container-apple">
          <div class="line-chart">
            <!-- Y-axis labels -->
            <div class="y-axis">
              <div class="y-label-apple" v-for="i in 5" :key="i">
                {{ Math.round((maxValue * (5 - i)) / 4) }}
              </div>
            </div>

            <!-- Chart area -->
            <div class="chart-area">
              <!-- Grid lines -->
              <div class="grid-lines-apple">
                <div class="grid-line-apple" v-for="i in 5" :key="i"></div>
              </div>

              <!-- Lines -->
              <svg class="chart-svg" viewBox="0 0 700 300" preserveAspectRatio="none">
                <!-- QR Users line -->
                <polyline
                  :points="currentChartData.map((d, i) => `${i * 100 + 50},${300 - (d.qrUsers / maxValue * 280)}`).join(' ')"
                  fill="none"
                  stroke="#007aff"
                  stroke-width="3"
                />
                <!-- Coupon Used line -->
                <polyline
                  :points="currentChartData.map((d, i) => `${i * 100 + 50},${300 - (d.couponUsed / maxValue * 280)}`).join(' ')"
                  fill="none"
                  stroke="#34c759"
                  stroke-width="3"
                />
                <!-- New Favorites line -->
                <polyline
                  :points="currentChartData.map((d, i) => `${i * 100 + 50},${300 - (d.newFavorites / maxValue * 280)}`).join(' ')"
                  fill="none"
                  stroke="#ff9500"
                  stroke-width="3"
                />

                <!-- Data points for QR Users -->
                <g v-for="(d, i) in currentChartData" :key="`qr-${i}`">
                  <circle :cx="i * 100 + 50" :cy="300 - (d.qrUsers / maxValue * 280)" r="4" fill="#007aff" />
                </g>
                <!-- Data points for Coupon Used -->
                <g v-for="(d, i) in currentChartData" :key="`coupon-${i}`">
                  <circle :cx="i * 100 + 50" :cy="300 - (d.couponUsed / maxValue * 280)" r="4" fill="#34c759" />
                </g>
                <!-- Data points for New Favorites -->
                <g v-for="(d, i) in currentChartData" :key="`fav-${i}`">
                  <circle :cx="i * 100 + 50" :cy="300 - (d.newFavorites / maxValue * 280)" r="4" fill="#ff9500" />
                </g>
              </svg>

              <!-- X-axis labels -->
              <div class="x-axis">
                <div class="x-label-apple" v-for="(d, i) in currentChartData" :key="i">
                  {{ d.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Management Tab -->
    <div v-show="activeTab === 'qr'" class="tab-content">
      <!-- Apple-Style Greeting -->
      <div class="apple-greeting">
        <h1 class="greeting-title">QR 랜딩페이지 관리</h1>
        <p class="greeting-subtitle">게임 랜딩페이지 QR 코드를 생성하고 관리하세요.</p>
      </div>

      <!-- Main QR Management Grid (Horizontal Layout) -->
      <div class="qr-management-grid">
        <!-- Left: Landing Page Settings -->
        <div class="landing-settings-section">
          <h2 class="settings-section-title">랜딩페이지 설정</h2>

          <div class="settings-form-apple">
            <div class="settings-form-group">
              <label class="settings-label">매장 이름</label>
              <input
                type="text"
                class="settings-input-apple"
                v-model="storeName"
                placeholder="예: 스타벅스 강남점"
              />
            </div>

            <!-- Logo Upload Section -->
            <div class="settings-form-group">
              <label class="settings-label">매장 로고</label>
              <div class="logo-upload-container">
                <div v-if="logoUrl" class="logo-preview-wrapper">
                  <div class="logo-preview">
                    <img :src="logoUrl" alt="매장 로고" class="logo-image" />
                  </div>
                  <div class="logo-actions">
                    <button type="button" class="btn-logo-change" @click="triggerLogoUpload">
                      <span>🔄</span>
                      <span>변경</span>
                    </button>
                    <button type="button" class="btn-logo-remove" @click="removeLogo">
                      <span>🗑️</span>
                      <span>삭제</span>
                    </button>
                  </div>
                </div>
                <div v-else class="logo-upload-box" @click="triggerLogoUpload">
                  <div class="upload-icon">📷</div>
                  <p class="upload-text">로고 이미지를 업로드하세요</p>
                  <p class="upload-hint">PNG, JPG, SVG (최대 2MB)</p>
                </div>
                <input
                  ref="logoFileInput"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  @change="handleLogoUpload"
                  class="logo-file-input"
                  hidden
                />
              </div>
            </div>

            <div class="settings-form-group">
              <label class="settings-label">환영 메시지</label>
              <textarea
                class="settings-textarea-apple"
                v-model="welcomeMessage"
                placeholder="고객에게 표시될 환영 메시지를 입력하세요..."
                rows="3"
              ></textarea>
            </div>

            <div class="settings-form-group">
              <label class="settings-label">활성화된 게임</label>
              <div class="active-games-summary">
                <span class="game-chip">🎯 브랜드 퀴즈</span>
                <span class="game-chip">🃏 메뉴 픽 맞추기</span>
                <span class="game-chip game-chip-disabled">🔍 틀린 그림 찾기 (비활성)</span>
              </div>
              <p class="settings-hint">게임 관리 탭에서 활성화/비활성화 할 수 있습니다.</p>
            </div>

            <div class="settings-form-group">
              <label class="settings-label">랜딩페이지 URL</label>
              <div class="url-display-box">
                <span class="url-text">waitplay.io/store/demo123</span>
                <button class="btn-url-copy" @click="showToastNotification('링크가 복사되었습니다', '🔗')">
                  <span>🔗</span>
                  <span>복사</span>
                </button>
              </div>
            </div>

            <div class="settings-form-actions">
              <button class="btn-settings-save" @click="showToastNotification('설정이 저장되었습니다', '✓')">
                <span>💾</span>
                <span>설정 저장</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: QR Code Card -->
        <div class="qr-code-card">
          <h3 class="qr-code-title">QR 코드</h3>
          <p class="qr-code-subtitle">고객이 스캔하면 랜딩페이지로 이동합니다</p>

          <!-- QR Code Preview -->
          <div class="qr-code-display">
            <div class="qr-placeholder">
              <svg viewBox="0 0 200 200" class="qr-svg">
                <!-- Simple QR code representation -->
                <rect width="200" height="200" fill="#ffffff" />
                <rect x="10" y="10" width="60" height="60" fill="#000000" />
                <rect x="130" y="10" width="60" height="60" fill="#000000" />
                <rect x="10" y="130" width="60" height="60" fill="#000000" />
                <rect x="20" y="20" width="20" height="20" fill="#ffffff" />
                <rect x="140" y="20" width="20" height="20" fill="#ffffff" />
                <rect x="20" y="140" width="20" height="20" fill="#ffffff" />
                <rect x="80" y="80" width="40" height="40" fill="#000000" />
                <!-- Additional QR pattern details -->
                <rect x="90" y="10" width="10" height="10" fill="#000000" />
                <rect x="110" y="10" width="10" height="10" fill="#000000" />
                <rect x="90" y="30" width="10" height="10" fill="#000000" />
                <rect x="110" y="30" width="10" height="10" fill="#000000" />
              </svg>
            </div>
          </div>

          <div class="qr-actions">
            <button class="btn-qr-download">
              <span>⬇️</span>
              <span>이미지 다운로드</span>
            </button>
            <button class="btn-qr-print">
              <span>🖨️</span>
              <span>인쇄하기</span>
            </button>
          </div>

          <!-- Advanced Settings: Layout Management -->
          <div class="advanced-settings-section">
            <button class="btn-layout-manager" @click="goToLayoutEditor">
              <span class="btn-icon">⚙️</span>
              <span class="btn-text">레이아웃 관리</span>
              <span class="btn-badge">고급</span>
            </button>
            <p class="advanced-hint">랜딩페이지 레이아웃을 블록 방식으로 편집합니다</p>
          </div>

          <div class="qr-info-box">
            <div class="info-item-qr">
              <span class="info-label-qr">📏 크기</span>
              <span class="info-value-qr">300 × 300 px</span>
            </div>
            <div class="info-item-qr">
              <span class="info-label-qr">📄 형식</span>
              <span class="info-value-qr">PNG / SVG</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Games Management Tab -->
    <div v-show="activeTab === 'games'" class="tab-content">
      <!-- Apple-Style Greeting -->
      <div class="apple-greeting">
        <h1 class="greeting-title">게임 라인업 설정</h1>
        <p class="greeting-subtitle">매장 상황에 맞춰 원하는 게임을 활성화하세요.</p>
      </div>

      <!-- Games List -->
      <div class="games-list-apple">
        <!-- Game Item 1: 브랜드 퀴즈 -->
        <div class="game-item-apple">
          <div class="game-header-apple">
            <div class="game-info-left">
              <div class="game-icon-small">🎯</div>
              <div class="game-title-section">
                <h3 class="game-name-apple">브랜드 퀴즈</h3>
                <p class="game-status-text active">ON • 가장 인기 있는 게임입니다.</p>
              </div>
            </div>
            <div class="game-toggle-section">
              <label class="toggle-switch">
                <input type="checkbox" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="game-quick-stats">
            <div class="quick-stat-item">
              <span class="quick-stat-label">오늘 플레이</span>
              <span class="quick-stat-value">24회</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">평균 점수</span>
              <span class="quick-stat-value">8.2점</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">참여자</span>
              <span class="quick-stat-value">127명</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">재참여율</span>
              <span class="quick-stat-value">68%</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">쿠폰 평균점수</span>
              <span class="quick-stat-value">7.5점</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">쿠폰 확인</span>
              <span class="quick-stat-value">82회</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="game-action-buttons">
            <button class="btn-benefit-link" @click="activeTab = 'benefits'">
              혜택 설정
            </button>
            <button class="btn-detail-apple" @click="expandedGame = expandedGame === 'quiz' ? null : 'quiz'">
              <span>{{ expandedGame === 'quiz' ? '접기' : '상세 보기' }}</span>
              <span class="detail-arrow" :class="{ expanded: expandedGame === 'quiz' }">›</span>
            </button>
          </div>

          <!-- Expanded Details -->
          <div v-if="expandedGame === 'quiz'" class="game-details-expanded">
            <div class="details-grid">
              <div class="detail-card">
                <h4 class="detail-title">이용 통계</h4>
                <div class="detail-stats-list">
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">총 플레이 횟수</span>
                    <span class="detail-stat-value">1,248회</span>
                  </div>
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">평균 플레이 시간</span>
                    <span class="detail-stat-value">15분</span>
                  </div>
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">완료율</span>
                    <span class="detail-stat-value">87%</span>
                  </div>
                </div>
              </div>

              <div class="detail-card">
                <h4 class="detail-title">점수 현황</h4>
                <div class="detail-stats-list">
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">평균 점수</span>
                    <span class="detail-stat-value highlight">8.2점</span>
                  </div>
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">최고 점수</span>
                    <span class="detail-stat-value">10점</span>
                  </div>
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">최고 득점자</span>
                    <span class="detail-stat-value">김단골님</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Item 2: 메뉴 픽 맞추기 -->
        <div class="game-item-apple">
          <div class="game-header-apple">
            <div class="game-info-left">
              <div class="game-icon-small">🃏</div>
              <div class="game-title-section">
                <h3 class="game-name-apple">메뉴 픽 맞추기</h3>
                <p class="game-status-text active">ON • 신메뉴 이미지로 자동 생성됩니다.</p>
              </div>
            </div>
            <div class="game-toggle-section">
              <label class="toggle-switch">
                <input type="checkbox" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="game-quick-stats">
            <div class="quick-stat-item">
              <span class="quick-stat-label">오늘 플레이</span>
              <span class="quick-stat-value">18회</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">평균 점수</span>
              <span class="quick-stat-value">7.8점</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">참여자</span>
              <span class="quick-stat-value">95명</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">재참여율</span>
              <span class="quick-stat-value">54%</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">쿠폰 평균점수</span>
              <span class="quick-stat-value">6.8점</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">쿠폰 확인</span>
              <span class="quick-stat-value">63회</span>
            </div>
          </div>

          <div class="game-action-buttons">
            <button class="btn-benefit-link" @click="activeTab = 'benefits'">
              혜택 설정
            </button>
            <button class="btn-detail-apple" @click="expandedGame = expandedGame === 'menu' ? null : 'menu'">
              <span>{{ expandedGame === 'menu' ? '접기' : '상세 보기' }}</span>
              <span class="detail-arrow" :class="{ expanded: expandedGame === 'menu' }">›</span>
            </button>
          </div>

          <div v-if="expandedGame === 'menu'" class="game-details-expanded">
            <div class="details-grid">
              <div class="detail-card">
                <h4 class="detail-title">이용 통계</h4>
                <div class="detail-stats-list">
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">총 플레이 횟수</span>
                    <span class="detail-stat-value">856회</span>
                  </div>
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">평균 플레이 시간</span>
                    <span class="detail-stat-value">12분</span>
                  </div>
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">완료율</span>
                    <span class="detail-stat-value">92%</span>
                  </div>
                </div>
              </div>

              <div class="detail-card">
                <h4 class="detail-title">점수 현황</h4>
                <div class="detail-stats-list">
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">평균 점수</span>
                    <span class="detail-stat-value highlight">7.8점</span>
                  </div>
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">최고 점수</span>
                    <span class="detail-stat-value">10점</span>
                  </div>
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">최고 득점자</span>
                    <span class="detail-stat-value">박고객님</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Item 3: 틀린 그림 찾기 -->
        <div class="game-item-apple">
          <div class="game-header-apple">
            <div class="game-info-left">
              <div class="game-icon-small">🔍</div>
              <div class="game-title-section">
                <h3 class="game-name-apple">틀린 그림 찾기</h3>
                <p class="game-status-text inactive">OFF • 잠시 비활성화 상태입니다.</p>
              </div>
            </div>
            <div class="game-toggle-section">
              <label class="toggle-switch">
                <input type="checkbox" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="game-quick-stats">
            <div class="quick-stat-item">
              <span class="quick-stat-label">오늘 플레이</span>
              <span class="quick-stat-value">0회</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">평균 점수</span>
              <span class="quick-stat-value">-</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">참여자</span>
              <span class="quick-stat-value">0명</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">재참여율</span>
              <span class="quick-stat-value">-</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">쿠폰 평균점수</span>
              <span class="quick-stat-value">-</span>
            </div>
            <div class="quick-stat-item">
              <span class="quick-stat-label">쿠폰 확인</span>
              <span class="quick-stat-value">-</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="game-action-buttons">
            <button class="btn-benefit-link" @click="activeTab = 'benefits'">
              혜택 설정
            </button>
            <button class="btn-detail-apple" @click="expandedGame = expandedGame === 'find' ? null : 'find'">
              <span>{{ expandedGame === 'find' ? '접기' : '상세 보기' }}</span>
              <span class="detail-arrow" :class="{ expanded: expandedGame === 'find' }">›</span>
            </button>
          </div>

          <div v-if="expandedGame === 'find'" class="game-details-expanded">
            <div class="details-grid">
              <div class="detail-card">
                <h4 class="detail-title">이용 통계</h4>
                <div class="detail-stats-list">
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">총 플레이 횟수</span>
                    <span class="detail-stat-value">324회</span>
                  </div>
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">평균 플레이 시간</span>
                    <span class="detail-stat-value">10분</span>
                  </div>
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">완료율</span>
                    <span class="detail-stat-value">78%</span>
                  </div>
                </div>
              </div>

              <div class="detail-card">
                <h4 class="detail-title">점수 현황</h4>
                <div class="detail-stats-list">
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">평균 점수</span>
                    <span class="detail-stat-value highlight">6.5점</span>
                  </div>
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">최고 점수</span>
                    <span class="detail-stat-value">9.8점</span>
                  </div>
                  <div class="detail-stat-row">
                    <span class="detail-stat-label">최고 득점자</span>
                    <span class="detail-stat-value">이손님님</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Marketplace CTA -->
      <div class="marketplace-cta">
        <div class="cta-content">
          <div class="cta-icon">🛍️</div>
          <div class="cta-text">
            <h3 class="cta-title">더 많은 게임이 필요하신가요?</h3>
            <p class="cta-description">마켓플레이스에서 새로운 게임을 구매하고 고객 경험을 확대하세요.</p>
          </div>
          <button class="btn-marketplace">
            <span>마켓플레이스 바로가기</span>
            <span class="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Benefits Tab -->
    <div v-show="activeTab === 'benefits'" class="tab-content">
      <!-- Apple-Style Greeting -->
      <div class="apple-greeting">
        <h1 class="greeting-title">혜택 설정</h1>
        <p class="greeting-subtitle">게임별 리워드를 설정하고 고객 만족도를 높이세요.</p>
      </div>

      <!-- Template Info Banner -->
      <div class="template-info-banner-global">
        <div class="info-icon">💡</div>
        <div class="info-text">
          <strong>기본 설정:</strong> 동메달(6-7점), 은메달(8-9점), 금메달(10점) 3단계 구조입니다.
          메달명, 점수 범위, 리워드를 자유롭게 수정하거나 단계를 추가/삭제할 수 있습니다.
        </div>
      </div>

      <!-- PC Layout: Games Grid -->
      <div class="benefits-pc-layout">
        <!-- Game 1: 브랜드 퀴즈 -->
        <div class="benefit-game-card">
          <div class="game-card-header">
            <div class="game-info">
              <div class="game-icon-benefit">🎯</div>
              <h3 class="game-title-benefit">브랜드 퀴즈</h3>
            </div>
            <button class="btn-toggle-benefit" @click="toggleBenefit('game1')">
              {{ expandedGames.game1 ? '▲ 접기' : '▼ 더보기' }}
            </button>
          </div>

          <!-- Preview (Always Visible) -->
          <div class="benefit-preview">
            <div class="preview-tier">
              <span class="preview-icon">🥉</span>
              <span class="preview-name">동메달</span>
              <span class="preview-score">6-7점</span>
            </div>
            <div class="preview-tier">
              <span class="preview-icon">🥈</span>
              <span class="preview-name">은메달</span>
              <span class="preview-score">8-9점</span>
            </div>
            <div class="preview-tier">
              <span class="preview-icon">🥇</span>
              <span class="preview-name">금메달</span>
              <span class="preview-score">10점</span>
            </div>
          </div>

          <!-- Expanded Content (Collapsible) -->
          <div v-show="expandedGames.game1" class="benefit-expanded">
            <div class="expanded-actions">
              <button class="btn-template-sm">📋 템플릿 적용</button>
            </div>

            <!-- Reward Tiers (Horizontal Cards) -->
            <div class="reward-tiers-horizontal">
              <!-- Tier 1 -->
              <div class="tier-card-compact">
                <div class="tier-card-header-compact">
                  <span class="tier-badge">1</span>
                  <button class="btn-remove-compact" @click="showToastNotification('단계가 삭제되었습니다', '🗑️')">✕</button>
                </div>
                <div class="tier-form-compact">
                  <input type="text" class="input-emoji" value="🥉" placeholder="🥉" title="아이콘" />
                  <input type="text" class="input-name" value="동메달" placeholder="이름" />
                  <input type="number" class="input-score" value="6" placeholder="최소" />
                  <span class="score-separator">~</span>
                  <input type="number" class="input-score" value="7" placeholder="최대" />
                  <input type="text" class="input-reward" value="아메리카노 1잔" placeholder="리워드 내용" />
                </div>
              </div>

              <!-- Tier 2 -->
              <div class="tier-card-compact">
                <div class="tier-card-header-compact">
                  <span class="tier-badge">2</span>
                  <button class="btn-remove-compact" @click="showToastNotification('단계가 삭제되었습니다', '🗑️')">✕</button>
                </div>
                <div class="tier-form-compact">
                  <input type="text" class="input-emoji" value="🥈" placeholder="🥈" title="아이콘" />
                  <input type="text" class="input-name" value="은메달" placeholder="이름" />
                  <input type="number" class="input-score" value="8" placeholder="최소" />
                  <span class="score-separator">~</span>
                  <input type="number" class="input-score" value="9" placeholder="최대" />
                  <input type="text" class="input-reward" value="음료 2잔" placeholder="리워드 내용" />
                </div>
              </div>

              <!-- Tier 3 -->
              <div class="tier-card-compact">
                <div class="tier-card-header-compact">
                  <span class="tier-badge">3</span>
                  <button class="btn-remove-compact" @click="showToastNotification('단계가 삭제되었습니다', '🗑️')">✕</button>
                </div>
                <div class="tier-form-compact">
                  <input type="text" class="input-emoji" value="🥇" placeholder="🥇" title="아이콘" />
                  <input type="text" class="input-name" value="금메달" placeholder="이름" />
                  <input type="number" class="input-score" value="10" placeholder="최소" />
                  <span class="score-separator">~</span>
                  <input type="number" class="input-score" value="10" placeholder="최대" />
                  <input type="text" class="input-reward" value="디저트 세트" placeholder="리워드 내용" />
                </div>
              </div>
            </div>

            <!-- Add Tier & Save -->
            <div class="game-card-footer">
              <button class="btn-add-tier-sm">➕ 단계 추가</button>
              <button class="btn-save-benefit" @click="showToastNotification('혜택 설정이 저장되었습니다', '✓')">저장</button>
            </div>
          </div>
        </div>

        <!-- Game 2: 메뉴 픽 맞추기 -->
        <div class="benefit-game-card">
          <div class="game-card-header">
            <div class="game-info">
              <div class="game-icon-benefit">🃏</div>
              <h3 class="game-title-benefit">메뉴 픽 맞추기</h3>
            </div>
            <button class="btn-toggle-benefit" @click="toggleBenefit('game2')">
              {{ expandedGames.game2 ? '▲ 접기' : '▼ 더보기' }}
            </button>
          </div>

          <!-- Preview (Always Visible) -->
          <div class="benefit-preview">
            <div class="preview-tier">
              <span class="preview-icon">🥉</span>
              <span class="preview-name">동메달</span>
              <span class="preview-score">6-7점</span>
            </div>
            <div class="preview-tier">
              <span class="preview-icon">🥈</span>
              <span class="preview-name">은메달</span>
              <span class="preview-score">8-9점</span>
            </div>
            <div class="preview-tier">
              <span class="preview-icon">🥇</span>
              <span class="preview-name">금메달</span>
              <span class="preview-score">10점</span>
            </div>
          </div>

          <!-- Expanded Content (Collapsible) -->
          <div v-show="expandedGames.game2" class="benefit-expanded">
            <div class="expanded-actions">
              <button class="btn-template-sm">📋 템플릿 적용</button>
            </div>

            <div class="reward-tiers-horizontal">
              <div class="tier-card-compact">
                <div class="tier-card-header-compact">
                  <span class="tier-badge">1</span>
                  <button class="btn-remove-compact" @click="showToastNotification('단계가 삭제되었습니다', '🗑️')">✕</button>
                </div>
                <div class="tier-form-compact">
                  <input type="text" class="input-emoji" value="🥉" placeholder="🥉" />
                  <input type="text" class="input-name" value="동메달" placeholder="이름" />
                  <input type="number" class="input-score" value="6" placeholder="최소" />
                  <span class="score-separator">~</span>
                  <input type="number" class="input-score" value="7" placeholder="최대" />
                  <input type="text" class="input-reward" value="쿠키 1개" placeholder="리워드 내용" />
                </div>
              </div>

              <div class="tier-card-compact">
                <div class="tier-card-header-compact">
                  <span class="tier-badge">2</span>
                  <button class="btn-remove-compact" @click="showToastNotification('단계가 삭제되었습니다', '🗑️')">✕</button>
                </div>
                <div class="tier-form-compact">
                  <input type="text" class="input-emoji" value="🥈" placeholder="🥈" />
                  <input type="text" class="input-name" value="은메달" placeholder="이름" />
                  <input type="number" class="input-score" value="8" placeholder="최소" />
                  <span class="score-separator">~</span>
                  <input type="number" class="input-score" value="9" placeholder="최대" />
                  <input type="text" class="input-reward" value="케이크 조각" placeholder="리워드 내용" />
                </div>
              </div>

              <div class="tier-card-compact">
                <div class="tier-card-header-compact">
                  <span class="tier-badge">3</span>
                  <button class="btn-remove-compact" @click="showToastNotification('단계가 삭제되었습니다', '🗑️')">✕</button>
                </div>
                <div class="tier-form-compact">
                  <input type="text" class="input-emoji" value="🥇" placeholder="🥇" />
                  <input type="text" class="input-name" value="금메달" placeholder="이름" />
                  <input type="number" class="input-score" value="10" placeholder="최소" />
                  <span class="score-separator">~</span>
                  <input type="number" class="input-score" value="10" placeholder="최대" />
                  <input type="text" class="input-reward" value="전 메뉴 10% 할인" placeholder="리워드 내용" />
                </div>
              </div>
            </div>

            <div class="game-card-footer">
              <button class="btn-add-tier-sm">➕ 단계 추가</button>
              <button class="btn-save-benefit" @click="showToastNotification('혜택 설정이 저장되었습니다', '✓')">저장</button>
            </div>
          </div>
        </div>

        <!-- Game 3: 틀린 그림 찾기 -->
        <div class="benefit-game-card">
          <div class="game-card-header">
            <div class="game-info">
              <div class="game-icon-benefit">🔍</div>
              <h3 class="game-title-benefit">틀린 그림 찾기</h3>
            </div>
            <button class="btn-toggle-benefit" @click="toggleBenefit('game3')">
              {{ expandedGames.game3 ? '▲ 접기' : '▼ 더보기' }}
            </button>
          </div>

          <!-- Preview (Always Visible) -->
          <div class="benefit-preview">
            <div class="preview-tier">
              <span class="preview-icon">🥉</span>
              <span class="preview-name">동메달</span>
              <span class="preview-score">6-7점</span>
            </div>
            <div class="preview-tier">
              <span class="preview-icon">🥈</span>
              <span class="preview-name">은메달</span>
              <span class="preview-score">8-9점</span>
            </div>
            <div class="preview-tier">
              <span class="preview-icon">🥇</span>
              <span class="preview-name">금메달</span>
              <span class="preview-score">10점</span>
            </div>
          </div>

          <!-- Expanded Content (Collapsible) -->
          <div v-show="expandedGames.game3" class="benefit-expanded">
            <div class="expanded-actions">
              <button class="btn-template-sm">📋 템플릿 적용</button>
            </div>

            <div class="reward-tiers-horizontal">
              <div class="tier-card-compact">
                <div class="tier-card-header-compact">
                  <span class="tier-badge">1</span>
                  <button class="btn-remove-compact" @click="showToastNotification('단계가 삭제되었습니다', '🗑️')">✕</button>
                </div>
                <div class="tier-form-compact">
                  <input type="text" class="input-emoji" value="🥉" placeholder="🥉" />
                  <input type="text" class="input-name" value="동메달" placeholder="이름" />
                  <input type="number" class="input-score" value="6" placeholder="최소" />
                  <span class="score-separator">~</span>
                  <input type="number" class="input-score" value="7" placeholder="최대" />
                  <input type="text" class="input-reward" value="" placeholder="리워드 내용" />
                </div>
              </div>

              <div class="tier-card-compact">
                <div class="tier-card-header-compact">
                  <span class="tier-badge">2</span>
                  <button class="btn-remove-compact" @click="showToastNotification('단계가 삭제되었습니다', '🗑️')">✕</button>
                </div>
                <div class="tier-form-compact">
                  <input type="text" class="input-emoji" value="🥈" placeholder="🥈" />
                  <input type="text" class="input-name" value="은메달" placeholder="이름" />
                  <input type="number" class="input-score" value="8" placeholder="최소" />
                  <span class="score-separator">~</span>
                  <input type="number" class="input-score" value="9" placeholder="최대" />
                  <input type="text" class="input-reward" value="" placeholder="리워드 내용" />
                </div>
              </div>

              <div class="tier-card-compact">
                <div class="tier-card-header-compact">
                  <span class="tier-badge">3</span>
                  <button class="btn-remove-compact" @click="showToastNotification('단계가 삭제되었습니다', '🗑️')">✕</button>
                </div>
                <div class="tier-form-compact">
                  <input type="text" class="input-emoji" value="🥇" placeholder="🥇" />
                  <input type="text" class="input-name" value="금메달" placeholder="이름" />
                  <input type="number" class="input-score" value="10" placeholder="최소" />
                  <span class="score-separator">~</span>
                  <input type="number" class="input-score" value="10" placeholder="최대" />
                  <input type="text" class="input-reward" value="" placeholder="리워드 내용" />
                </div>
              </div>
            </div>

            <div class="game-card-footer">
              <button class="btn-add-tier-sm">➕ 단계 추가</button>
              <button class="btn-save-benefit" @click="showToastNotification('혜택 설정이 저장되었습니다', '✓')">저장</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div v-if="showToast" class="toast-notification" :class="{ 'toast-show': showToast }">
        <span class="toast-icon">{{ toastIcon }}</span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </div>

    <!-- Customers Tab -->
    <div v-show="activeTab === 'customers'" class="tab-content">
      <!-- Apple-Style Greeting -->
      <div class="apple-greeting">
        <h1 class="greeting-title">고객 분석</h1>
        <p class="greeting-subtitle">고객 세그먼트별 현황과 참여도를 확인하세요.</p>
      </div>

      <!-- Customer Segments Overview -->
      <div class="customer-segments-grid">
        <!-- Segment Card 1: VIP -->
        <div class="segment-card segment-vip">
          <div class="segment-card-header">
            <div class="segment-icon">👑</div>
            <div class="segment-title-group">
              <h3 class="segment-title">VIP 고객</h3>
              <p class="segment-subtitle">방문 20회 이상</p>
            </div>
          </div>
          <div class="segment-stat">
            <span class="stat-number">12</span>
            <span class="stat-label">명</span>
          </div>
          <div class="segment-metrics">
            <div class="metric-item">
              <span class="metric-label">평균 방문</span>
              <span class="metric-value">27회</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">쿠폰 보유</span>
              <span class="metric-value">평균 8장</span>
            </div>
          </div>
        </div>

        <!-- Segment Card 2: Regular -->
        <div class="segment-card segment-regular">
          <div class="segment-card-header">
            <div class="segment-icon">⭐</div>
            <div class="segment-title-group">
              <h3 class="segment-title">단골 고객</h3>
              <p class="segment-subtitle">방문 10-19회</p>
            </div>
          </div>
          <div class="segment-stat">
            <span class="stat-number">28</span>
            <span class="stat-label">명</span>
          </div>
          <div class="segment-metrics">
            <div class="metric-item">
              <span class="metric-label">평균 방문</span>
              <span class="metric-value">14회</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">쿠폰 보유</span>
              <span class="metric-value">평균 5장</span>
            </div>
          </div>
        </div>

        <!-- Segment Card 3: Active -->
        <div class="segment-card segment-active">
          <div class="segment-card-header">
            <div class="segment-icon">✨</div>
            <div class="segment-title-group">
              <h3 class="segment-title">활동 고객</h3>
              <p class="segment-subtitle">방문 4-9회</p>
            </div>
          </div>
          <div class="segment-stat">
            <span class="stat-number">56</span>
            <span class="stat-label">명</span>
          </div>
          <div class="segment-metrics">
            <div class="metric-item">
              <span class="metric-label">평균 방문</span>
              <span class="metric-value">6회</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">쿠폰 보유</span>
              <span class="metric-value">평균 3장</span>
            </div>
          </div>
        </div>

        <!-- Segment Card 4: New -->
        <div class="segment-card segment-new">
          <div class="segment-card-header">
            <div class="segment-icon">🎯</div>
            <div class="segment-title-group">
              <h3 class="segment-title">신규 고객</h3>
              <p class="segment-subtitle">방문 1-3회</p>
            </div>
          </div>
          <div class="segment-stat">
            <span class="stat-number">45</span>
            <span class="stat-label">명</span>
          </div>
          <div class="segment-metrics">
            <div class="metric-item">
              <span class="metric-label">평균 방문</span>
              <span class="metric-value">2회</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">쿠폰 보유</span>
              <span class="metric-value">평균 2장</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Sending Section -->
      <div class="push-notification-section">
        <div class="push-section-header">
          <h2 class="push-section-title">메시지 발송</h2>
          <p class="push-section-subtitle">고객 세그먼트를 선택하여 문자 또는 카카오톡 메시지를 전송하세요.</p>
        </div>

        <div class="push-form-apple">
          <!-- Message Type Selection -->
          <div class="push-form-group">
            <label class="push-label">발송 방식</label>
            <div class="message-type-selector">
              <button
                type="button"
                @click="messageType = 'sms'"
                :class="['message-type-btn', { active: messageType === 'sms' }]"
              >
                <span class="type-icon">💬</span>
                <span class="type-label">문자 메시지 (SMS)</span>
              </button>
              <button
                type="button"
                @click="messageType = 'kakao'"
                :class="['message-type-btn', { active: messageType === 'kakao' }]"
              >
                <span class="type-icon">💛</span>
                <span class="type-label">카카오톡 플러스친구</span>
              </button>
            </div>
          </div>

          <!-- Target Customer Selection -->
          <div class="push-form-group">
            <label class="push-label">대상 고객 세그먼트</label>
            <div class="segment-filter-container">
              <!-- Basic Segments -->
              <div class="filter-section">
                <label class="filter-section-label">기본 세그먼트</label>
                <select class="push-select-apple" v-model="selectedCustomerSegment">
                  <option value="all">전체 고객 (141명)</option>
                  <option value="vip">VIP 고객 (12명)</option>
                  <option value="regular">단골 고객 (28명)</option>
                  <option value="active">활동 고객 (56명)</option>
                  <option value="new">신규 고객 (45명)</option>
                  <option value="inactive">미방문 고객 7일 이상 (30명)</option>
                </select>
              </div>

              <!-- Advanced Filters -->
              <div class="filter-section">
                <label class="filter-section-label">상세 필터</label>
                <div class="advanced-filters">
                  <!-- Month Filter -->
                  <div class="filter-item">
                    <label class="filter-label">
                      <input type="checkbox" v-model="filters.byMonth.enabled" class="filter-checkbox" />
                      <span>특정 월 웨이팅 고객</span>
                    </label>
                    <select
                      v-if="filters.byMonth.enabled"
                      v-model="filters.byMonth.month"
                      class="filter-select"
                    >
                      <option value="1">1월</option>
                      <option value="2">2월</option>
                      <option value="3">3월</option>
                      <option value="4">4월</option>
                      <option value="5">5월</option>
                      <option value="6">6월</option>
                      <option value="7">7월</option>
                      <option value="8">8월</option>
                      <option value="9">9월</option>
                      <option value="10">10월</option>
                      <option value="11">11월</option>
                      <option value="12">12월</option>
                    </select>
                  </div>

                  <!-- Visit Count Filter -->
                  <div class="filter-item">
                    <label class="filter-label">
                      <input type="checkbox" v-model="filters.byVisitCount.enabled" class="filter-checkbox" />
                      <span>방문 횟수</span>
                    </label>
                    <div v-if="filters.byVisitCount.enabled" class="filter-range">
                      <input
                        type="number"
                        v-model.number="filters.byVisitCount.min"
                        placeholder="최소"
                        class="filter-input"
                        min="0"
                      />
                      <span class="range-separator">~</span>
                      <input
                        type="number"
                        v-model.number="filters.byVisitCount.max"
                        placeholder="최대"
                        class="filter-input"
                        min="0"
                      />
                      <span class="range-unit">회</span>
                    </div>
                  </div>

                  <!-- Game Participation Filter -->
                  <div class="filter-item">
                    <label class="filter-label">
                      <input type="checkbox" v-model="filters.byGameParticipation.enabled" class="filter-checkbox" />
                      <span>게임 참여 여부</span>
                    </label>
                    <select
                      v-if="filters.byGameParticipation.enabled"
                      v-model="filters.byGameParticipation.status"
                      class="filter-select"
                    >
                      <option value="participated">참여함</option>
                      <option value="not_participated">참여 안 함</option>
                      <option value="won">우승 경험 있음</option>
                    </select>
                  </div>

                  <!-- Last Visit Filter -->
                  <div class="filter-item">
                    <label class="filter-label">
                      <input type="checkbox" v-model="filters.byLastVisit.enabled" class="filter-checkbox" />
                      <span>마지막 방문</span>
                    </label>
                    <select
                      v-if="filters.byLastVisit.enabled"
                      v-model="filters.byLastVisit.period"
                      class="filter-select"
                    >
                      <option value="7">7일 이내</option>
                      <option value="14">14일 이내</option>
                      <option value="30">30일 이내</option>
                      <option value="60">60일 이내</option>
                      <option value="90">90일 이상</option>
                    </select>
                  </div>

                  <!-- Reward Status Filter -->
                  <div class="filter-item">
                    <label class="filter-label">
                      <input type="checkbox" v-model="filters.byRewardStatus.enabled" class="filter-checkbox" />
                      <span>리워드 사용 여부</span>
                    </label>
                    <select
                      v-if="filters.byRewardStatus.enabled"
                      v-model="filters.byRewardStatus.status"
                      class="filter-select"
                    >
                      <option value="used">사용함</option>
                      <option value="not_used">미사용</option>
                      <option value="expired">만료됨</option>
                    </select>
                  </div>
                </div>

                <!-- Filter Summary -->
                <div v-if="hasActiveFilters" class="filter-summary">
                  <span class="summary-icon">🎯</span>
                  <span class="summary-text">{{ getFilterSummary }}</span>
                  <button type="button" @click="clearFilters" class="btn-clear-filters">
                    <span>✕</span>
                    <span>필터 초기화</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Template Selection & Management -->
          <div class="push-form-group">
            <label class="push-label">메시지 템플릿</label>
            <div class="template-controls">
              <select class="push-select-apple template-select" v-model="selectedTemplate" @change="loadTemplate">
                <option value="">직접 입력</option>
                <optgroup v-if="messageType === 'sms'" label="SMS 기본 템플릿">
                  <option value="sms_welcome">신규 고객 환영</option>
                  <option value="sms_coupon">쿠폰 발송</option>
                  <option value="sms_event">이벤트 안내</option>
                  <option value="sms_reminder">방문 유도</option>
                </optgroup>
                <optgroup v-if="messageType === 'kakao'" label="카카오톡 기본 템플릿">
                  <option value="kakao_welcome">신규 고객 환영</option>
                  <option value="kakao_coupon">쿠폰 발송</option>
                  <option value="kakao_event">이벤트 안내</option>
                  <option value="kakao_reward">리워드 지급</option>
                </optgroup>
                <optgroup v-if="customTemplates.length > 0" label="내 템플릿">
                  <option v-for="template in customTemplates" :key="template.id" :value="`custom_${template.id}`">
                    {{ template.name }}
                  </option>
                </optgroup>
              </select>
              <button type="button" class="btn-template-action" @click="showTemplateSaveModal = true" :disabled="!pushMessage.trim()">
                <span>💾</span>
                <span>템플릿 저장</span>
              </button>
              <button type="button" class="btn-template-action" @click="showTemplateManageModal = true">
                <span>⚙️</span>
                <span>템플릿 관리</span>
              </button>
            </div>
          </div>

          <!-- Message Input -->
          <div class="push-form-group">
            <label class="push-label">
              메시지
              <span v-if="messageType === 'sms'" class="char-count">
                {{ pushMessage.length }} / {{ smsMaxLength }}자
              </span>
            </label>
            <textarea
              class="push-textarea-apple"
              v-model="pushMessage"
              :placeholder="messageType === 'sms' ? 'SMS 메시지를 입력하세요...' : '카카오톡 메시지를 입력하세요...'"
              :maxlength="messageType === 'sms' ? smsMaxLength : undefined"
              rows="6"
            ></textarea>
            <div v-if="messageType === 'sms'" class="sms-info">
              <span class="info-icon">ℹ️</span>
              <span class="info-text">
                {{ calculateSmsCount }}건의 SMS로 발송됩니다
                ({{ calculateSmsCount > 1 ? '장문' : '단문' }}, {{ estimatedSmsCost }}원)
              </span>
            </div>
          </div>

          <!-- Plus Friend Push Section (Kakao only) -->
          <div v-if="messageType === 'kakao'" class="plus-friend-section">
            <div class="plus-friend-header">
              <span class="plus-friend-icon">💛</span>
              <div class="plus-friend-info">
                <h4 class="plus-friend-title">카카오톡 플러스친구 연동</h4>
                <p class="plus-friend-desc">고객들이 플러스친구를 추가하면 메시지를 받을 수 있습니다.</p>
              </div>
            </div>
            <button
              type="button"
              class="btn-plus-friend-push"
              @click="sendPlusFriendPush"
              :disabled="!pushMessage.trim()"
            >
              <span class="btn-icon">📢</span>
              <span class="btn-text">플러스친구 메시지 푸시하기</span>
              <span class="btn-badge">{{ getTargetCount }}명</span>
            </button>
          </div>

          <!-- Send Actions -->
          <div class="push-form-actions">
            <button
              type="button"
              class="btn-push-preview"
              @click="showMessagePreview"
            >
              <span>👁️</span>
              <span>미리보기</span>
            </button>
            <button
              type="button"
              class="btn-push-send"
              @click="sendMessage"
              :disabled="!pushMessage.trim()"
            >
              <span>{{ messageType === 'sms' ? '💬' : '💛' }}</span>
              <span>{{ messageType === 'sms' ? 'SMS 발송' : '카카오톡 발송' }}</span>
            </button>
          </div>

          <!-- Sending Stats -->
          <div class="sending-stats">
            <div class="stat-item-send">
              <span class="stat-label-send">예상 발송 건수</span>
              <span class="stat-value-send">{{ getTargetCount }}건</span>
            </div>
            <div class="stat-item-send">
              <span class="stat-label-send">예상 비용</span>
              <span class="stat-value-send">{{ estimateTotalCost }}원</span>
            </div>
            <div class="stat-item-send">
              <span class="stat-label-send">발송 방식</span>
              <span class="stat-value-send">{{ messageType === 'sms' ? 'SMS' : '카카오톡' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </main>

    <!-- Template Save Modal -->
    <div v-if="showTemplateSaveModal" class="modal-overlay" @click.self="showTemplateSaveModal = false">
      <div class="modal-content template-modal">
        <div class="modal-header">
          <h3 class="modal-title">템플릿 저장</h3>
          <button type="button" class="btn-modal-close" @click="showTemplateSaveModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-form-group">
            <label class="modal-label">템플릿 이름</label>
            <input
              type="text"
              v-model="newTemplateName"
              class="modal-input"
              placeholder="예: 주말 이벤트, 신규 고객 환영 메시지"
              maxlength="50"
            />
          </div>
          <div class="modal-form-group">
            <label class="modal-label">메시지 미리보기</label>
            <div class="template-preview">{{ pushMessage }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-modal-cancel" @click="showTemplateSaveModal = false">취소</button>
          <button type="button" class="btn-modal-confirm" @click="saveTemplate" :disabled="!newTemplateName.trim()">저장</button>
        </div>
      </div>
    </div>

    <!-- Template Manage Modal -->
    <div v-if="showTemplateManageModal" class="modal-overlay" @click.self="showTemplateManageModal = false">
      <div class="modal-content template-manage-modal">
        <div class="modal-header">
          <h3 class="modal-title">템플릿 관리</h3>
          <button type="button" class="btn-modal-close" @click="showTemplateManageModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="customTemplates.length === 0" class="empty-state">
            <span class="empty-icon">📝</span>
            <p class="empty-text">저장된 템플릿이 없습니다</p>
            <p class="empty-hint">메시지를 작성하고 '템플릿 저장' 버튼을 눌러 저장하세요</p>
          </div>
          <div v-else class="template-list">
            <div v-for="template in customTemplates" :key="template.id" class="template-item">
              <div class="template-item-header">
                <span class="template-item-icon">{{ template.type === 'sms' ? '💬' : '💛' }}</span>
                <span class="template-item-name">{{ template.name }}</span>
                <span class="template-item-type">{{ template.type === 'sms' ? 'SMS' : '카카오톡' }}</span>
              </div>
              <div class="template-item-content">{{ template.content }}</div>
              <div class="template-item-actions">
                <button type="button" class="btn-template-use" @click="useTemplate(template.id)">
                  <span>✓</span>
                  <span>사용하기</span>
                </button>
                <button type="button" class="btn-template-delete" @click="deleteTemplate(template.id)">
                  <span>🗑️</span>
                  <span>삭제</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-modal-cancel" @click="showTemplateManageModal = false">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQueueStore } from '@/stores/queue'

const router = useRouter()
const queueStore = useQueueStore()
const activeTab = ref('dashboard')
const expandedGame = ref<string | null>(null)
const expandedGames = ref({
  game1: false,
  game2: false,
  game3: false
})

const tabs = [
  { id: 'dashboard', label: '대시보드', icon: '▪' },
  { id: 'qr', label: 'QR관리', icon: '▫' },
  { id: 'games', label: '게임관리', icon: '▪' },
  { id: 'benefits', label: '혜택설정', icon: '▫' },
  { id: 'customers', label: '고객분석', icon: '▪' }
]

const showToast = ref(false)
const toastMessage = ref('')
const toastIcon = ref('✓')
const selectedCustomerSegment = ref('all')
const pushMessage = ref('')
const messageType = ref<'sms' | 'kakao'>('sms')
const selectedKakaoTemplate = ref('')
const smsMaxLength = ref(2000)

// Template management
const selectedTemplate = ref('')
const showTemplateSaveModal = ref(false)
const showTemplateManageModal = ref(false)
const newTemplateName = ref('')
const customTemplates = ref<Array<{
  id: string
  name: string
  type: 'sms' | 'kakao'
  content: string
  createdAt: string
}>>([])

// Predefined templates
const predefinedTemplates: Record<string, string> = {
  sms_welcome: '[WaitPlay] 환영합니다! 첫 방문 감사 쿠폰을 드립니다. 7일간 사용 가능합니다.',
  sms_coupon: '[WaitPlay] 특별 할인 쿠폰이 도착했습니다! 이번 주말까지 20% 할인 혜택을 받으세요.',
  sms_event: '[WaitPlay] 오늘 방문하시면 무료 음료 1잔을 드립니다. 지금 바로 방문하세요!',
  sms_reminder: '[WaitPlay] 오랜만이에요! 특별 혜택을 준비했습니다. 다시 뵙길 기다리겠습니다.',
  kakao_welcome: `🎉 WaitPlay에 오신 것을 환영합니다!

첫 방문 고객님께 특별한 혜택을 드립니다.
게임에 참여하고 무료 음료를 받아가세요!

지금 바로 게임 시작하기 →`,
  kakao_coupon: `안녕하세요! 고객님께 특별한 쿠폰을 드립니다 🎁

[특별 할인 쿠폰]
• 할인율: 20%
• 유효기간: 7일
• 사용처: 전 메뉴

지금 바로 사용하세요!`,
  kakao_event: `🎉 특별 이벤트 안내

기간 한정 이벤트가 진행 중입니다!
지금 매장을 방문하시면 다양한 혜택을 받으실 수 있습니다.

기간: ~ 2025-12-31
장소: 매장 방문 시`,
  kakao_reward: `🏆 리워드 지급 안내

고객님께서 게임에서 우승하셨습니다!
축하드립니다!

지급 리워드: 무료 음료 쿠폰
사용 기한: 7일 이내

매장에서 바로 사용하세요!`
}

// Advanced filters
const filters = ref({
  byMonth: {
    enabled: false,
    month: new Date().getMonth() + 1 // Current month
  },
  byVisitCount: {
    enabled: false,
    min: 0,
    max: 100
  },
  byGameParticipation: {
    enabled: false,
    status: 'participated' as 'participated' | 'not_participated' | 'won'
  },
  byLastVisit: {
    enabled: false,
    period: '7' as '7' | '14' | '30' | '60' | '90'
  },
  byRewardStatus: {
    enabled: false,
    status: 'used' as 'used' | 'not_used' | 'expired'
  }
})

// Customer segment data (하드코딩 → API 연동 필요)
const segmentCounts: Record<string, number> = {
  all: 141,
  vip: 12,
  regular: 28,
  active: 56,
  new: 45,
  inactive: 30
}

// SMS 비용 계산 (한국 기준)
const SMS_COST_PER_MESSAGE = 15  // 단문 SMS 기본 비용 (원)
const LMS_COST_PER_MESSAGE = 45  // 장문 SMS 기본 비용 (원)
const SMS_CHAR_LIMIT = 90        // 단문 문자 제한
const KAKAO_COST_PER_MESSAGE = 15 // 카카오톡 플러스친구 비용 (원)

// Computed: Calculate SMS count
const calculateSmsCount = computed(() => {
  if (!pushMessage.value) return 1
  const length = pushMessage.value.length
  if (length <= SMS_CHAR_LIMIT) return 1
  return Math.ceil(length / SMS_CHAR_LIMIT)
})

// Computed: Estimated SMS cost per message
const estimatedSmsCost = computed(() => {
  if (calculateSmsCount.value > 1) {
    return LMS_COST_PER_MESSAGE * calculateSmsCount.value
  }
  return SMS_COST_PER_MESSAGE
})

// Computed: Get target count
const getTargetCount = computed(() => {
  return segmentCounts[selectedCustomerSegment.value] || 0
})

// Computed: Estimate total cost
const estimateTotalCost = computed(() => {
  const targetCount = getTargetCount.value
  if (messageType.value === 'sms') {
    return targetCount * estimatedSmsCost.value
  } else {
    return targetCount * KAKAO_COST_PER_MESSAGE
  }
})

// Function: Show message preview
const showMessagePreview = () => {
  if (!pushMessage.value.trim()) {
    showToastNotification('메시지를 입력하세요', '⚠️')
    return
  }

  const previewWindow = window.open('', '_blank', 'width=400,height=600')
  if (!previewWindow) {
    showToastNotification('팝업이 차단되었습니다', '⚠️')
    return
  }

  const messageTypeLabel = messageType.value === 'sms' ? 'SMS' : '카카오톡'
  const targetLabel = selectedCustomerSegment.value === 'all'
    ? '전체 고객'
    : `${selectedCustomerSegment.value.toUpperCase()} 고객`

  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>메시지 미리보기</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #f5f5f5;
          padding: 20px;
        }
        .preview-container {
          max-width: 360px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .preview-header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e1e4e8;
        }
        .preview-type {
          font-size: 14px;
          color: #86868b;
          margin-bottom: 8px;
        }
        .preview-target {
          font-size: 16px;
          font-weight: 600;
          color: #1d1d1f;
        }
        .preview-message {
          background: ${messageType.value === 'kakao' ? '#FEE500' : '#f5f7fa'};
          padding: 20px;
          border-radius: 12px;
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 1.6;
          font-size: 14px;
          color: #1d1d1f;
        }
        .preview-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #86868b;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="preview-header">
          <div class="preview-type">${messageTypeLabel} 미리보기</div>
          <div class="preview-target">${targetLabel} (${getTargetCount.value}명)</div>
        </div>
        <div class="preview-message">${pushMessage.value}</div>
        <div class="preview-footer">
          예상 비용: ${estimateTotalCost.value.toLocaleString()}원
        </div>
      </div>
    </body>
    </html>
  `)
  previewWindow.document.close()
}

// Template Management Functions
const loadTemplate = () => {
  if (!selectedTemplate.value) {
    return
  }

  // Load predefined template
  if (selectedTemplate.value in predefinedTemplates) {
    pushMessage.value = predefinedTemplates[selectedTemplate.value]
    return
  }

  // Load custom template
  if (selectedTemplate.value.startsWith('custom_')) {
    const templateId = selectedTemplate.value.replace('custom_', '')
    const template = customTemplates.value.find(t => t.id === templateId)
    if (template) {
      pushMessage.value = template.content
      // Switch message type if needed
      if (template.type !== messageType.value) {
        messageType.value = template.type
      }
    }
  }
}

const saveTemplate = () => {
  if (!newTemplateName.value.trim() || !pushMessage.value.trim()) {
    return
  }

  const newTemplate = {
    id: Date.now().toString(),
    name: newTemplateName.value.trim(),
    type: messageType.value,
    content: pushMessage.value,
    createdAt: new Date().toISOString()
  }

  customTemplates.value.push(newTemplate)

  // Save to localStorage
  try {
    localStorage.setItem('waitplay_message_templates', JSON.stringify(customTemplates.value))
  } catch (error) {
    console.error('Failed to save template:', error)
  }

  showToastNotification(`템플릿 "${newTemplateName.value}"이 저장되었습니다`, '✓')
  newTemplateName.value = ''
  showTemplateSaveModal.value = false
}

const useTemplate = (templateId: string) => {
  const template = customTemplates.value.find(t => t.id === templateId)
  if (template) {
    pushMessage.value = template.content
    if (template.type !== messageType.value) {
      messageType.value = template.type
    }
    selectedTemplate.value = `custom_${templateId}`
    showTemplateManageModal.value = false
    showToastNotification('템플릿이 적용되었습니다', '✓')
  }
}

const deleteTemplate = (templateId: string) => {
  const template = customTemplates.value.find(t => t.id === templateId)
  if (!template) return

  const confirmed = confirm(`"${template.name}" 템플릿을 삭제하시겠습니까?`)
  if (!confirmed) return

  customTemplates.value = customTemplates.value.filter(t => t.id !== templateId)

  // Save to localStorage
  try {
    localStorage.setItem('waitplay_message_templates', JSON.stringify(customTemplates.value))
  } catch (error) {
    console.error('Failed to delete template:', error)
  }

  // Reset selection if deleted template was selected
  if (selectedTemplate.value === `custom_${templateId}`) {
    selectedTemplate.value = ''
  }

  showToastNotification('템플릿이 삭제되었습니다', '✓')
}

// Load custom templates from localStorage on mount
onMounted(() => {
  try {
    const saved = localStorage.getItem('waitplay_message_templates')
    if (saved) {
      customTemplates.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load templates:', error)
  }
})

// Computed: Check if any filter is active
const hasActiveFilters = computed(() => {
  return filters.value.byMonth.enabled ||
         filters.value.byVisitCount.enabled ||
         filters.value.byGameParticipation.enabled ||
         filters.value.byLastVisit.enabled ||
         filters.value.byRewardStatus.enabled
})

// Computed: Get filter summary
const getFilterSummary = computed(() => {
  const activeFilters: string[] = []

  if (filters.value.byMonth.enabled) {
    activeFilters.push(`${filters.value.byMonth.month}월 웨이팅`)
  }
  if (filters.value.byVisitCount.enabled) {
    activeFilters.push(`방문 ${filters.value.byVisitCount.min}~${filters.value.byVisitCount.max}회`)
  }
  if (filters.value.byGameParticipation.enabled) {
    const statusLabels = {
      participated: '게임 참여',
      not_participated: '게임 미참여',
      won: '게임 우승'
    }
    activeFilters.push(statusLabels[filters.value.byGameParticipation.status])
  }
  if (filters.value.byLastVisit.enabled) {
    activeFilters.push(`${filters.value.byLastVisit.period}일 이내 방문`)
  }
  if (filters.value.byRewardStatus.enabled) {
    const statusLabels = {
      used: '리워드 사용',
      not_used: '리워드 미사용',
      expired: '리워드 만료'
    }
    activeFilters.push(statusLabels[filters.value.byRewardStatus.status])
  }

  return activeFilters.length > 0
    ? `활성 필터: ${activeFilters.join(', ')}`
    : '활성 필터 없음'
})

// Function: Clear all filters
const clearFilters = () => {
  filters.value.byMonth.enabled = false
  filters.value.byVisitCount.enabled = false
  filters.value.byGameParticipation.enabled = false
  filters.value.byLastVisit.enabled = false
  filters.value.byRewardStatus.enabled = false
  showToastNotification('필터가 초기화되었습니다', '✓')
}

// Function: Send Plus Friend Push (Kakao specific)
const sendPlusFriendPush = async () => {
  if (!pushMessage.value.trim()) {
    showToastNotification('메시지를 입력하세요', '⚠️')
    return
  }

  const targetLabel = selectedCustomerSegment.value === 'all'
    ? '전체 고객'
    : `${selectedCustomerSegment.value.toUpperCase()} 고객`

  const filterInfo = hasActiveFilters.value ? `\n\n필터 조건: ${getFilterSummary.value}` : ''

  const confirmed = confirm(
    `${targetLabel} ${getTargetCount.value}명에게 카카오톡 플러스친구 메시지를 푸시하시겠습니까?${filterInfo}\n\n` +
    `예상 비용: ${estimateTotalCost.value.toLocaleString()}원\n\n` +
    `메시지: ${pushMessage.value.substring(0, 50)}${pushMessage.value.length > 50 ? '...' : ''}`
  )

  if (!confirmed) return

  try {
    // API 호출 (향후 구현)
    // const response = await fetch('/api/admin/kakao-plus-friend/push', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     target_segment: selectedCustomerSegment.value,
    //     message: pushMessage.value,
    //     template: selectedKakaoTemplate.value,
    //     filters: hasActiveFilters.value ? filters.value : null
    //   })
    // })

    showToastNotification(
      `플러스친구 메시지가 ${getTargetCount.value}명에게 푸시되었습니다`,
      '💛'
    )

    // Reset
    pushMessage.value = ''
    selectedKakaoTemplate.value = ''
  } catch (error) {
    showToastNotification('푸시 실패: 다시 시도해주세요', '⚠️')
  }
}

// Function: Send message
const sendMessage = async () => {
  if (!pushMessage.value.trim()) {
    showToastNotification('메시지를 입력하세요', '⚠️')
    return
  }

  const messageTypeLabel = messageType.value === 'sms' ? 'SMS' : '카카오톡'
  const targetLabel = selectedCustomerSegment.value === 'all'
    ? '전체 고객'
    : `${selectedCustomerSegment.value.toUpperCase()} 고객`

  const filterInfo = hasActiveFilters.value ? `\n\n필터 조건: ${getFilterSummary.value}` : ''

  const confirmed = confirm(
    `${targetLabel} ${getTargetCount.value}명에게 ${messageTypeLabel}을 발송하시겠습니까?${filterInfo}\n\n` +
    `예상 비용: ${estimateTotalCost.value.toLocaleString()}원\n\n` +
    `메시지: ${pushMessage.value.substring(0, 50)}${pushMessage.value.length > 50 ? '...' : ''}`
  )

  if (!confirmed) return

  try {
    // API 호출 (향후 구현)
    // const response = await fetch('/api/admin/messages/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     message_type: messageType.value,
    //     target_segment: selectedCustomerSegment.value,
    //     filters: hasActiveFilters.value ? filters.value : null,
    //     message: pushMessage.value,
    //     kakao_template: selectedKakaoTemplate.value || null
    //   })
    // })

    // 성공 피드백
    const icon = messageType.value === 'sms' ? '💬' : '💛'
    showToastNotification(
      `${messageTypeLabel}이 ${getTargetCount.value}명에게 발송되었습니다`,
      icon
    )

    // 메시지 초기화
    pushMessage.value = ''
    selectedKakaoTemplate.value = ''
  } catch (error) {
    showToastNotification('발송 실패: 다시 시도해주세요', '⚠️')
  }
}
const storeName = ref('우리 매장 이름')
const welcomeMessage = ref('즐거운 게임과 함께 특별한 혜택을 받아가세요!')
const logoUrl = ref('')
const logoFileInput = ref<HTMLInputElement | null>(null)

// Logo management functions
const triggerLogoUpload = () => {
  logoFileInput.value?.click()
}

const handleLogoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Check file size (2MB limit)
  if (file.size > 2 * 1024 * 1024) {
    showToastNotification('파일 크기는 2MB 이하여야 합니다', '⚠️')
    return
  }

  // Check file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
  if (!validTypes.includes(file.type)) {
    showToastNotification('PNG, JPG, SVG 파일만 업로드 가능합니다', '⚠️')
    return
  }

  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    logoUrl.value = e.target?.result as string
    showToastNotification('로고가 업로드되었습니다', '✓')
  }
  reader.readAsDataURL(file)
}

const removeLogo = () => {
  logoUrl.value = ''
  if (logoFileInput.value) {
    logoFileInput.value.value = ''
  }
  showToastNotification('로고가 삭제되었습니다', '✓')
}

const toggleBenefit = (gameId: 'game1' | 'game2' | 'game3') => {
  expandedGames.value[gameId] = !expandedGames.value[gameId]
}

const goToLayoutEditor = () => {
  router.push({ name: 'layout-editor' })
}

const showToastNotification = (message: string, icon: string = '✓') => {
  toastMessage.value = message
  toastIcon.value = icon
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const selectedFilter = ref('today')
const selectedDateRange = ref('오늘')

const dateFilters = [
  { label: '오늘', value: 'today' },
  { label: '7일', value: '7days' },
  { label: '30일', value: '30days' }
]

const dashboardData = ref({
  qrUsers: 127,
  couponUsed: 85,
  newFavorites: 12,
  totalFavorites: 248
})

// Animated values for counting animation
const animatedQrUsers = ref(127)
const animatedCouponUsed = ref(85)
const animatedNewFavorites = ref(12)
const animatedTotalFavorites = ref(248)

// Animation function with ease-out cubic easing
function animateValue(animatedRef: Ref<number>, target: number, duration: number = 800) {
  const start = animatedRef.value
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-out cubic) for smooth deceleration
    const easeProgress = 1 - Math.pow(1 - progress, 3)

    animatedRef.value = Math.round(start + (target - start) * easeProgress)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

// Watch dashboard data changes and trigger animations
watch(dashboardData, (newData) => {
  animateValue(animatedQrUsers, newData.qrUsers)
  animateValue(animatedCouponUsed, newData.couponUsed)
  animateValue(animatedNewFavorites, newData.newFavorites)
  animateValue(animatedTotalFavorites, newData.totalFavorites)
}, { deep: true })

// Initialize with current values on mount
onMounted(() => {
  animatedQrUsers.value = dashboardData.value.qrUsers
  animatedCouponUsed.value = dashboardData.value.couponUsed
  animatedNewFavorites.value = dashboardData.value.newFavorites
  animatedTotalFavorites.value = dashboardData.value.totalFavorites
})

// 오늘 시간별 데이터 (24시간)
const todayData = ref([
  { label: '0시', qrUsers: 5, couponUsed: 2, newFavorites: 0 },
  { label: '6시', qrUsers: 12, couponUsed: 5, newFavorites: 1 },
  { label: '12시', qrUsers: 45, couponUsed: 18, newFavorites: 3 },
  { label: '18시', qrUsers: 65, couponUsed: 32, newFavorites: 5 },
  { label: '21시', qrUsers: 85, couponUsed: 42, newFavorites: 7 },
  { label: '23시', qrUsers: 95, couponUsed: 48, newFavorites: 8 },
  { label: '현재', qrUsers: 127, couponUsed: 85, newFavorites: 12 }
])

// 7일 데이터 (주간)
const weeklyData = ref([
  { label: '월', qrUsers: 98, couponUsed: 45, newFavorites: 8 },
  { label: '화', qrUsers: 112, couponUsed: 52, newFavorites: 11 },
  { label: '수', qrUsers: 105, couponUsed: 48, newFavorites: 9 },
  { label: '목', qrUsers: 128, couponUsed: 61, newFavorites: 13 },
  { label: '금', qrUsers: 145, couponUsed: 73, newFavorites: 15 },
  { label: '토', qrUsers: 138, couponUsed: 68, newFavorites: 12 },
  { label: '일', qrUsers: 127, couponUsed: 59, newFavorites: 14 }
])

// 30일 데이터 (월간 - 주차별)
const monthlyData = ref([
  { label: '1주차', qrUsers: 420, couponUsed: 198, newFavorites: 45 },
  { label: '2주차', qrUsers: 485, couponUsed: 225, newFavorites: 52 },
  { label: '3주차', qrUsers: 512, couponUsed: 248, newFavorites: 58 },
  { label: '4주차', qrUsers: 548, couponUsed: 265, newFavorites: 62 },
  { label: '5주차', qrUsers: 592, couponUsed: 285, newFavorites: 68 },
  { label: '이번주', qrUsers: 625, couponUsed: 302, newFavorites: 72 },
  { label: '누적', qrUsers: 853, couponUsed: 359, newFavorites: 89 }
])

// 현재 차트 데이터 (필터에 따라 변경)
const currentChartData = computed(() => {
  if (selectedFilter.value === 'today') {
    return todayData.value
  } else if (selectedFilter.value === '7days') {
    return weeklyData.value
  } else {
    return monthlyData.value
  }
})

const maxValue = computed(() => {
  const data = currentChartData.value
  return Math.max(...data.map(d => Math.max(d.qrUsers, d.couponUsed, d.newFavorites)))
})

// 필터 변경 시 대시보드 데이터도 업데이트
watch(selectedFilter, (newFilter) => {
  if (newFilter === 'today') {
    selectedDateRange.value = '오늘'
    const lastData = todayData.value[todayData.value.length - 1]
    dashboardData.value = {
      qrUsers: lastData.qrUsers,
      couponUsed: lastData.couponUsed,
      newFavorites: lastData.newFavorites,
      totalFavorites: 248
    }
  } else if (newFilter === '7days') {
    selectedDateRange.value = '7일'
    const totalQr = weeklyData.value.reduce((sum, d) => sum + d.qrUsers, 0)
    const totalCoupon = weeklyData.value.reduce((sum, d) => sum + d.couponUsed, 0)
    const totalNew = weeklyData.value.reduce((sum, d) => sum + d.newFavorites, 0)
    dashboardData.value = {
      qrUsers: totalQr,
      couponUsed: totalCoupon,
      newFavorites: totalNew,
      totalFavorites: 248
    }
  } else {
    selectedDateRange.value = '30일'
    const lastData = monthlyData.value[monthlyData.value.length - 1]
    dashboardData.value = {
      qrUsers: lastData.qrUsers,
      couponUsed: lastData.couponUsed,
      newFavorites: lastData.newFavorites,
      totalFavorites: 248
    }
  }
})

let refreshInterval: number | null = null

async function refreshData() {
  try {
    await Promise.all([
      queueStore.fetchStats(),
      queueStore.fetchWaitingQueue(),
      queueStore.fetchPlayingQueue()
    ])
  } catch (error) {
    console.error('Failed to refresh data:', error)
  }
}

async function startPlaying(queueId: string) {
  try {
    await queueStore.startPlaying(queueId)
    await refreshData()
  } catch (error) {
    alert('플레이 시작에 실패했습니다.')
  }
}

async function completePlaying(queueId: string) {
  try {
    await queueStore.completePlaying(queueId)
    await refreshData()
  } catch (error) {
    alert('완료 처리에 실패했습니다.')
  }
}

async function cancelEntry(queueId: string) {
  if (confirm('정말 취소하시겠습니까?')) {
    try {
      await queueStore.cancelEntry(queueId)
      await refreshData()
    } catch (error) {
      alert('취소에 실패했습니다.')
    }
  }
}

onMounted(async () => {
  await refreshData()
  refreshInterval = window.setInterval(refreshData, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.admin-view {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

/* Sidebar - Apple Style */
.sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 0.5px solid #d1d1d6;
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.03);
}

.sidebar-header {
  padding: 0 24px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-size: 1.5rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007aff 0%, #005ecb 100%);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
}

.sidebar-header h2 {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 22px;
  color: #1d1d1f;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #8e8e93;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.nav-item:hover {
  background: #f2f2f7;
  color: #1d1d1f;
}

.nav-item.active {
  background: #007aff;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
}

.nav-icon {
  font-size: 18px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  flex: 1;
  letter-spacing: -0.01em;
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
  padding: 10px;
  background: #f2f2f7;
  border: none;
  border-radius: 8px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #8e8e93;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-logout:hover {
  background: #007aff;
  color: #ffffff;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 48px 64px;
  overflow-y: auto;
  background: #f5f7fa;
}

.content-header {
  display: none;
}

/* Tab Content - Apple Animation */
.tab-content {
  animation: fadeInApple 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInApple {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apple-Style Greeting */
.apple-greeting {
  margin-bottom: 2rem;
  text-align: left;
  animation: greetingSlide 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Global Filter Section */
.global-filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 20px 28px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%);
  border-radius: 16px;
  border: 1px solid #e1e4e8;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.08);
  animation: filterSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s backwards;
}

@keyframes filterSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-label {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.01em;
}

@keyframes greetingSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.greeting-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 34px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.greeting-subtitle {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 17px;
  color: #8e8e93;
  font-weight: 400;
  opacity: 0;
  animation: subtitleFade 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
}

@keyframes subtitleFade {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Apple-Style Chart Section */
.chart-apple {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%);
  padding: 32px;
  border-radius: 16px;
  border: 1px solid #e1e4e8;
  margin-bottom: 48px;
  opacity: 0;
  animation: chartFadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.08);
}

@keyframes chartFadeIn {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chart-header-apple {
  margin-bottom: 24px;
}

.chart-title-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.01em;
  margin: 0;
}

.date-filter-apple {
  display: flex;
  gap: 8px;
  background: #f2f2f7;
  padding: 4px;
  border-radius: 8px;
}

.filter-btn-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  padding: 6px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #8e8e93;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-btn-apple:hover {
  color: #000000;
}

.filter-btn-apple.active {
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.chart-legend-apple {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.legend-item-apple {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot-apple {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-label-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 13px;
  color: #8e8e93;
  font-weight: 400;
}

.chart-container-apple {
  min-height: 300px;
  padding: 0;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
  gap: 1rem;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bar-value {
  color: #111827;
  font-weight: 600;
  font-size: 0.9rem;
}

.bar {
  width: 100%;
  background: #111827;
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: all 0.2s ease;
  animation: barGrow 0.5s ease-out;
}

@keyframes barGrow {
  from { height: 0; opacity: 0; }
  to { height: 100%; opacity: 1; }
}

.bar-item:hover .bar {
  background: #374151;
}

.bar-label {
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Coupon Stats */
.coupon-stats {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 0;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-label {
  color: #6b7280;
  font-weight: 500;
  min-width: 100px;
  font-size: 0.9rem;
}

.stat-bar-wrapper {
  flex: 1;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.stat-bar {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 0.75rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  animation: barSlide 0.5s ease-out;
}

@keyframes barSlide {
  from { width: 0; opacity: 0; }
}

.stat-bar.new-members {
  background: #111827;
}

.stat-bar.returning {
  background: #374151;
}

.stat-bar.expired {
  background: #6b7280;
}

.stat-count {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Section Title */
.section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-icon {
  font-size: 2.5rem;
}

.section-title h2 {
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

/* Queue Sections (Reuse from previous AdminView) */
.queue-section {
  margin-bottom: 3rem;
}

.queue-section h3 {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.count-badge {
  display: inline-block;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
}

.playing-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.empty-state {
  text-align: center;
  padding: 4rem;
  background: linear-gradient(135deg, rgba(45, 45, 68, 0.6) 0%, rgba(61, 61, 84, 0.4) 100%);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 2px dashed rgba(160, 160, 176, 0.3);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #a0a0b0;
  font-size: 1.2rem;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.queue-item {
  position: relative;
  background: linear-gradient(135deg, rgba(45, 45, 68, 0.8) 0%, rgba(61, 61, 84, 0.6) 100%);
  backdrop-filter: blur(15px);
  padding: 2rem;
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid transparent;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.queue-item:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.queue-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 0;
}

.waiting-item .queue-glow {
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.1) 0%, transparent 100%);
}

.playing-item .queue-glow {
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%);
  animation: playingGlow 2s ease-in-out infinite;
}

@keyframes playingGlow {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.playing-item {
  border-left: 4px solid #10b981;
}

.queue-info {
  position: relative;
  display: flex;
  align-items: center;
  gap: 2rem;
  z-index: 1;
}

.queue-position {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 900;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.position-waiting {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.position-playing {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.play-pulse {
  animation: playPulse 1.5s ease-in-out infinite;
}

@keyframes playPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.queue-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.queue-name {
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
}

.queue-game {
  color: #a0a0b0;
  font-size: 1rem;
}

.queue-actions {
  position: relative;
  display: flex;
  gap: 1rem;
  z-index: 1;
}

.btn-start, .btn-complete, .btn-cancel-small {
  padding: 1rem 1.8rem;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}

.btn-start {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-start:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
}

.btn-complete {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-complete:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
}

.btn-cancel-small {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-cancel-small:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);
}

/* Games Management Section - Apple Style List Layout */
.games-list-apple {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.game-item-apple {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e1e4e8;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(0, 122, 255, 0.06);
}

.game-item-apple:hover {
  border-color: #007aff;
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.12);
}

.game-header-apple {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.game-info-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.game-icon-small {
  width: 48px;
  height: 48px;
  background: #f5f7fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.game-title-section {
  flex: 1;
  min-width: 0;
}

.game-name-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
}

.game-status-text {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 400;
  margin: 0;
}

.game-status-text.active {
  color: #007aff;
}

.game-status-text.inactive {
  color: #8e8e93;
}

/* Toggle Switch */
.game-toggle-section {
  margin-left: 16px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 51px;
  height: 31px;
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
  background-color: #e1e4e8;
  transition: 0.4s;
  border-radius: 31px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 27px;
  width: 27px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Quick Stats */
.game-quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px 32px;
  padding: 20px 0;
  border-top: 0.5px solid #e1e4e8;
  border-bottom: 0.5px solid #e1e4e8;
  margin-bottom: 16px;
}

.quick-stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quick-stat-label {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 13px;
  color: #8e8e93;
  font-weight: 400;
}

.quick-stat-value {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.02em;
}

/* Detail Button */
.btn-detail-apple {
  flex: 1;
  padding: 12px 20px;
  background: #f5f7fa;
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #007aff;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.btn-detail-apple:hover {
  background: #007aff;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.2);
  border-color: #007aff;
}

.btn-detail-apple:active {
  transform: translateY(0);
}

.detail-arrow {
  font-size: 18px;
  font-weight: 700;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}

.detail-arrow.expanded {
  transform: rotate(90deg);
}

/* Expanded Details */
.game-details-expanded {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 0.5px solid #e1e4e8;
  animation: expandIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes expandIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-card {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 12px;
}

.detail-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
  letter-spacing: -0.01em;
}

.detail-stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-stat-label {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  color: #8e8e93;
  font-weight: 400;
}

.detail-stat-value {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  color: #1d1d1f;
  font-weight: 600;
}

.detail-stat-value.highlight {
  color: #007aff;
  font-size: 18px;
  font-weight: 700;
}

/* Marketplace CTA */
.marketplace-cta {
  margin-top: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.25);
  animation: ctaFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s backwards;
}

@keyframes ctaFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cta-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.cta-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.cta-text {
  flex: 1;
}

.cta-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: -0.01em;
}

.cta-description {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  font-weight: 400;
  line-height: 1.5;
}

.btn-marketplace {
  padding: 14px 28px;
  background: #ffffff;
  color: #007aff;
  border: none;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.btn-marketplace:hover {
  background: #f5f7fa;
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
}

.btn-marketplace:active {
  transform: translateY(0);
}

.arrow-icon {
  font-size: 18px;
  font-weight: 700;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-marketplace:hover .arrow-icon {
  transform: translateX(4px);
}

/* Benefits Section */
.benefits-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.benefit-card {
  background: linear-gradient(135deg, rgba(45, 45, 68, 0.8) 0%, rgba(61, 61, 84, 0.6) 100%);
  backdrop-filter: blur(15px);
  padding: 2rem;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.benefit-card h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  color: #a0a0b0;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 1rem;
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.input-suffix {
  position: absolute;
  right: 1rem;
  top: 2.8rem;
  color: #a0a0b0;
  font-weight: 600;
}

.btn-save {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-save:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
}

/* Customers Section */
.customers-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.customer-segment {
  background: linear-gradient(135deg, rgba(45, 45, 68, 0.8) 0%, rgba(61, 61, 84, 0.6) 100%);
  backdrop-filter: blur(15px);
  padding: 2rem;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.segment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.segment-header h3 {
  color: white;
  font-size: 1.3rem;
}

.segment-count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 700;
}

.segment-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.customer-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  transition: all 0.3s;
}

.customer-item:hover {
  background: rgba(0, 0, 0, 0.3);
  transform: translateX(5px);
}

.customer-avatar {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
}

.customer-info {
  flex: 1;
}

.customer-name {
  color: white;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.customer-meta {
  color: #a0a0b0;
  font-size: 0.9rem;
}

.btn-push-small {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-push-small:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
}

/* Push Section */
.push-section {
  background: linear-gradient(135deg, rgba(45, 45, 68, 0.8) 0%, rgba(61, 61, 84, 0.6) 100%);
  backdrop-filter: blur(15px);
  padding: 2rem;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.push-section h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.push-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-select {
  padding: 1rem;
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  padding: 1rem;
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  min-height: 150px;
  resize: vertical;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.btn-send-push {
  padding: 1.2rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-send-push:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(240, 147, 251, 0.4);
}

/* Home Button */
.btn-home {
  display: block;
  width: fit-content;
  margin: 3rem auto 0;
  padding: 1.2rem 2.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  text-decoration: none;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

.btn-home:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(139, 92, 246, 0.6);
}

/* Line Chart */
.line-chart {
  display: flex;
  gap: 1rem;
  height: 300px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
  min-width: 40px;
}

.y-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
}

.y-label-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 13px;
  color: #8e8e93;
  text-align: right;
  font-weight: 400;
}

.chart-area {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.grid-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
  pointer-events: none;
}

.grid-lines-apple {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
  pointer-events: none;
}

.grid-line {
  width: 100%;
  height: 1px;
  background: #e5e7eb;
}

.grid-line-apple {
  width: 100%;
  height: 0.5px;
  background: #d1d1d6;
  opacity: 0.5;
}

.chart-svg {
  width: 100%;
  height: 280px;
  margin-top: 10px;
}

.x-axis {
  display: flex;
  justify-content: space-around;
  padding-top: 0.5rem;
  margin-top: auto;
}

.x-label {
  flex: 1;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.x-label-apple {
  flex: 1;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 13px;
  color: #8e8e93;
  font-weight: 400;
}

/* Apple-Style Responsive Design */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }

  .main-content {
    padding: 32px 40px;
  }

  .greeting-title {
    font-size: 28px;
  }

  .metric-value-apple {
    font-size: 40px;
  }
}

@media (max-width: 768px) {
  .admin-view {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 0.5px solid #d1d1d6;
    padding: 24px 0;
  }

  .sidebar-header {
    padding: 0 20px;
    margin-bottom: 24px;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 20px;
    gap: 8px;
  }

  .nav-item {
    flex-shrink: 0;
    min-width: 120px;
  }

  .main-content {
    padding: 24px 20px;
  }

  .greeting-title {
    font-size: 24px;
  }

  .greeting-subtitle {
    font-size: 15px;
  }

  .metrics-apple {
    flex-direction: column;
    gap: 16px;
  }

  .metric-apple {
    min-width: 100%;
  }

  .metric-value-apple {
    font-size: 36px;
  }

  .chart-apple {
    padding: 24px;
  }

  .chart-title-apple {
    font-size: 19px;
  }
}

@media (max-width: 480px) {
  .greeting-title {
    font-size: 20px;
  }

  .metric-value-apple {
    font-size: 32px;
  }

  .metric-label-apple {
    font-size: 15px;
  }

  .chart-apple {
    padding: 20px;
  }
}

/* Game Action Buttons */
.game-action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-benefit-link {
  flex: 1;
  padding: 12px 20px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
  text-align: center;
}

.btn-benefit-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.35);
}

.btn-benefit-link:active {
  transform: translateY(0);
}

/* Benefits List - Apple Style */
.benefits-list-apple {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.benefit-item-apple {
  background: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 16px;
  padding: 28px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: benefitFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.benefit-item-apple:nth-child(1) {
  animation-delay: 0.1s;
}

.benefit-item-apple:nth-child(2) {
  animation-delay: 0.2s;
}

.benefit-item-apple:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes benefitFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.benefit-item-apple:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.benefit-header-apple {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.benefit-info-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.benefit-icon-small {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 14px;
}

.benefit-title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.benefit-name-apple {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
}

.benefit-status-text {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  color: #8e8e93;
  margin: 0;
  font-weight: 400;
}

/* Reward Settings Grid */
.reward-settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.reward-setting-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reward-label {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 6px;
}

.reward-input-group {
  position: relative;
}

.reward-input {
  width: 100%;
  padding: 12px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  color: #1d1d1f;
  background: #f5f7fa;
  border: 2px solid transparent;
  border-radius: 10px;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.reward-input:focus {
  background: #ffffff;
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.reward-input::placeholder {
  color: #8e8e93;
}

/* Save Button - Apple Style */
.btn-save-apple {
  align-self: flex-start;
  padding: 12px 32px;
  background: #007aff;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
}

.btn-save-apple:hover {
  background: #0051d5;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.35);
}

.btn-save-apple:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
}

/* Global Template Info Banner */
.template-info-banner-global {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f5f9ff 100%);
  border: 1px solid #b3d9ff;
  border-radius: 12px;
  margin-bottom: 32px;
}

.info-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.info-text {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #1d1d1f;
}

.info-text strong {
  color: #007aff;
  font-weight: 700;
}

/* PC Layout Grid */
.benefits-pc-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

/* Game Card */
.benefit-game-card {
  background: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.benefit-game-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Game Card Header */
.game-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.game-icon-benefit {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #e1e4e8;
}

.game-title-benefit {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

/* Toggle Benefit Button */
.btn-toggle-benefit {
  padding: 8px 16px;
  background: #f5f7fa;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #007aff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle-benefit:hover {
  background: #e8ecf0;
  transform: translateY(-1px);
}

/* Benefit Preview */
.benefit-preview {
  display: flex;
  gap: 8px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.preview-tier {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.preview-tier:hover {
  background: #eef1f5;
}

.preview-icon {
  font-size: 24px;
}

.preview-name {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}

.preview-score {
  font-size: 12px;
  color: #86868b;
}

/* Expanded Content */
.benefit-expanded {
  animation: expandDown 0.3s ease-out;
}

@keyframes expandDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}

.expanded-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 12px;
}

/* Small Template Button */
.btn-template-sm {
  padding: 8px 16px;
  background: #f5f7fa;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #007aff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-template-sm:hover {
  background: #e8ecf0;
  transform: translateY(-1px);
}

/* Horizontal Tier Container */
.reward-tiers-horizontal {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

/* Compact Tier Card */
.tier-card-compact {
  background: #f5f7fa;
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.tier-card-compact:hover {
  background: #eef1f5;
  border-color: #d1d5db;
}

/* Tier Card Header */
.tier-card-header-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tier-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: #ffffff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.btn-remove-compact {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #86868b;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-remove-compact:hover {
  background: #e1e4e8;
  color: #ff3b30;
}

/* Compact Inline Form */
.tier-form-compact {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

/* Input Styles */
.input-emoji {
  width: 48px;
  height: 40px;
  text-align: center;
  font-size: 20px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.input-emoji:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.input-name {
  width: 100px;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 500;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.input-name:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.input-score {
  width: 60px;
  height: 40px;
  padding: 0 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.input-score:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.score-separator {
  color: #86868b;
  font-weight: 500;
  font-size: 14px;
}

.input-reward {
  flex: 1;
  min-width: 150px;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.input-reward:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

/* Game Card Footer */
.game-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* Small Add Tier Button */
.btn-add-tier-sm {
  padding: 10px 16px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #007aff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add-tier-sm:hover {
  background: #f5f7fa;
  border-color: #007aff;
  transform: translateY(-1px);
}

/* Save Benefit Button */
.btn-save-benefit {
  padding: 10px 24px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save-benefit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #34c759 0%, #30a14e 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(52, 199, 89, 0.4);
  font-size: 15px;
  font-weight: 600;
  z-index: 9999;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}

.toast-notification.toast-show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.toast-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.toast-message {
  flex: 1;
}

/* Reward Tiers Container */
.reward-tiers-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

/* Reward Tier Card */
.reward-tier-card {
  background: #f5f7fa;
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.reward-tier-card:hover {
  border-color: #007aff;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1);
}

/* Tier Header */
.tier-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tier-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 16px;
  font-weight: 700;
}

.btn-remove-tier {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  color: #8e8e93;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove-tier:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
  transform: scale(1.1);
}

/* Tier Inputs */
.tier-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-row {
  display: flex;
  gap: 12px;
}

.input-group-custom {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group-custom.full-width {
  width: 100%;
}

.input-group-custom label {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #8e8e93;
}

.tier-input-small {
  width: 80px;
  padding: 10px 12px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  color: #1d1d1f;
  background: #ffffff;
  border: 1.5px solid #e1e4e8;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tier-input-medium {
  width: 150px;
  padding: 10px 12px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  color: #1d1d1f;
  background: #ffffff;
  border: 1.5px solid #e1e4e8;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tier-input-full {
  width: 100%;
  padding: 10px 12px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  color: #1d1d1f;
  background: #ffffff;
  border: 1.5px solid #e1e4e8;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tier-input-small:focus,
.tier-input-medium:focus,
.tier-input-full:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.tier-input-small::placeholder,
.tier-input-medium::placeholder,
.tier-input-full::placeholder {
  color: #c7c7cc;
}

/* Add Tier Button */
.btn-add-tier {
  width: 100%;
  padding: 14px 20px;
  background: #ffffff;
  border: 2px dashed #e1e4e8;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #007aff;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.btn-add-tier:hover {
  background: #f5f7fa;
  border-color: #007aff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
}

/* Benefit Actions */
.benefit-actions {
  display: flex;
  justify-content: flex-end;
}

.benefit-actions .btn-save-apple {
  align-self: flex-start;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .game-action-buttons {
    flex-direction: column;
  }

  .reward-settings-grid {
    grid-template-columns: 1fr;
  }

  .benefit-item-apple {
    padding: 20px;
  }

  .benefit-header-apple {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

/* Customer Segments Grid */
.customer-segments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 48px;
}

.segment-card {
  background: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.segment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.segment-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.segment-icon {
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border: 1px solid #e1e4e8;
}

.segment-title-group {
  flex: 1;
}

.segment-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.segment-subtitle {
  font-size: 13px;
  color: #86868b;
  margin: 0;
}

.segment-stat {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 20px;
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 16px;
  color: #86868b;
  font-weight: 500;
}

.segment-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 13px;
  color: #86868b;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

/* Segment-specific colors */
.segment-vip .segment-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.segment-vip .stat-number {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.segment-regular .segment-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.segment-active .segment-icon {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.segment-new .segment-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.segment-new .stat-number {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Push Notification Section */
.push-notification-section {
  background: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 16px;
  padding: 32px;
}

.push-section-header {
  margin-bottom: 24px;
}

.push-section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.push-section-subtitle {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.push-form-apple {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.push-form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.push-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.push-select-apple {
  padding: 12px 16px;
  background: #f5f7fa;
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.push-select-apple:hover {
  background: #eef1f5;
  border-color: #d1d5db;
}

.push-select-apple:focus {
  background: #ffffff;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.push-textarea-apple {
  padding: 16px;
  background: #f5f7fa;
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  color: #1d1d1f;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
  outline: none;
}

.push-textarea-apple:hover {
  background: #eef1f5;
  border-color: #d1d5db;
}

.push-textarea-apple:focus {
  background: #ffffff;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.push-textarea-apple::placeholder {
  color: #86868b;
}

.push-form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-push-preview {
  padding: 12px 24px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #007aff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-push-preview:hover {
  background: #f5f7fa;
  border-color: #007aff;
  transform: translateY(-1px);
}

.btn-push-send {
  padding: 12px 24px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-push-send:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* ============================================
   QR MANAGEMENT TAB
   ============================================ */

/* Main Grid Layout - Horizontal */
.qr-management-grid {
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 32px;
  align-items: start;
}

@media (max-width: 1200px) {
  .qr-management-grid {
    grid-template-columns: 1fr;
  }
}

/* QR Code Card - Right Side */
.qr-code-card {
  background: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 16px;
  padding: 32px;
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.qr-code-title {
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
  text-align: center;
}

.qr-code-subtitle {
  font-size: 14px;
  color: #86868b;
  margin: -16px 0 0 0;
  text-align: center;
}

.qr-code-display {
  text-align: center;
  padding: 24px;
  background: #f5f7fa;
  border-radius: 16px;
}

.qr-placeholder {
  width: 280px;
  height: 280px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  border: 2px solid #e1e4e8;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.qr-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.qr-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-qr-download,
.btn-qr-print {
  padding: 14px 16px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-qr-download:hover,
.btn-qr-print:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* Advanced Settings Section */
.advanced-settings-section {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border-radius: 12px;
  border: 1px solid #d1d5db;
}

.btn-layout-manager {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.btn-layout-manager:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
}

.btn-layout-manager:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 18px;
}

.btn-text {
  flex: 1;
  text-align: center;
}

.btn-badge {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.advanced-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
}

/* QR Info Box */
.qr-info-box {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item-qr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-item-qr:not(:last-child) {
  border-bottom: 1px solid #e1e4e8;
}

.info-label-qr {
  font-size: 13px;
  color: #86868b;
  font-weight: 500;
}

.info-value-qr {
  font-size: 13px;
  color: #1d1d1f;
  font-weight: 600;
}

/* Landing Settings Section - Left Side */
.landing-settings-section {
  background: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 16px;
  padding: 32px;
}

.settings-section-title {
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 24px 0;
}

.settings-form-apple {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.settings-input-apple {
  padding: 12px 16px;
  background: #f5f7fa;
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  color: #1d1d1f;
  transition: all 0.2s ease;
  outline: none;
}

.settings-input-apple:hover {
  background: #eef1f5;
  border-color: #d1d5db;
}

.settings-input-apple:focus {
  background: #ffffff;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.settings-input-apple::placeholder {
  color: #86868b;
}

.settings-textarea-apple {
  padding: 16px;
  background: #f5f7fa;
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  color: #1d1d1f;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;
  outline: none;
}

.settings-textarea-apple:hover {
  background: #eef1f5;
  border-color: #d1d5db;
}

.settings-textarea-apple:focus {
  background: #ffffff;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.settings-textarea-apple::placeholder {
  color: #86868b;
}

/* Logo Upload Styles */
.logo-upload-container {
  margin-top: 8px;
}

.logo-preview-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border: 1px solid #e1e4e8;
  border-radius: 12px;
}

.logo-preview {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  border: 2px solid #e1e4e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.logo-actions {
  display: flex;
  gap: 8px;
  flex: 1;
}

.btn-logo-change,
.btn-logo-remove {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-logo-change {
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: #ffffff;
}

.btn-logo-change:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-logo-remove {
  background: #ffffff;
  color: #ef4444;
  border: 1px solid #e1e4e8;
}

.btn-logo-remove:hover {
  background: #fef2f2;
  border-color: #ef4444;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.logo-upload-box {
  padding: 40px;
  background: #f5f7fa;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo-upload-box:hover {
  background: #eef1f5;
  border-color: #007aff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.upload-hint {
  font-size: 13px;
  color: #86868b;
  margin: 0;
}

.logo-file-input {
  display: none;
}

/* Message Type Selector Styles */
.message-type-selector {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.message-type-btn {
  flex: 1;
  padding: 16px 20px;
  background: #f5f7fa;
  border: 2px solid #e1e4e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
}

.message-type-btn:hover {
  background: #eef1f5;
  border-color: #007aff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1);
}

.message-type-btn.active {
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  border-color: #007aff;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.25);
}

.message-type-btn .type-icon {
  font-size: 24px;
}

.message-type-btn .type-label {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  transition: color 0.3s ease;
}

.message-type-btn.active .type-label {
  color: #ffffff;
}

/* Character Count Styles */
.char-count {
  float: right;
  font-size: 12px;
  font-weight: 500;
  color: #86868b;
  padding: 4px 10px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-left: 12px;
}

/* SMS Info Styles */
.sms-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
}

.sms-info .info-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.sms-info .info-text {
  font-size: 13px;
  color: #1e3a8a;
  font-weight: 500;
  line-height: 1.5;
}

/* Sending Stats Styles */
.sending-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 12px;
  border: 1px solid #e1e4e8;
}

.stat-item-send {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #ffffff;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.stat-item-send:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-label-send {
  font-size: 12px;
  font-weight: 500;
  color: #86868b;
  text-align: center;
}

.stat-value-send {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  text-align: center;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Segment Filter Container Styles */
.segment-filter-container {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-section-label {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
  padding-bottom: 4px;
  border-bottom: 2px solid #007aff;
  display: inline-block;
  margin-bottom: 8px;
}

/* Advanced Filters Styles */
.advanced-filters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 12px;
  border: 1px solid #e1e4e8;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  user-select: none;
}

.filter-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #007aff;
}

.filter-select {
  padding: 10px 14px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.filter-select:hover {
  border-color: #007aff;
  background: #fafbfc;
}

.filter-select:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.filter-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-input {
  flex: 1;
  padding: 10px 14px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  color: #1d1d1f;
  transition: all 0.2s ease;
  outline: none;
}

.filter-input:hover {
  border-color: #007aff;
  background: #fafbfc;
}

.filter-input:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.range-separator {
  font-size: 14px;
  font-weight: 600;
  color: #86868b;
}

.range-unit {
  font-size: 13px;
  font-weight: 500;
  color: #86868b;
  white-space: nowrap;
}

/* Filter Summary Styles */
.filter-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  margin-top: 8px;
}

.summary-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.summary-text {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #1e3a8a;
  line-height: 1.5;
}

.btn-clear-filters {
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #1e3a8a;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.btn-clear-filters:hover {
  background: #dbeafe;
  border-color: #93c5fd;
  transform: translateY(-1px);
}

/* Plus Friend Section Styles */
.plus-friend-section {
  margin: 20px 0;
  padding: 20px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff4cc 100%);
  border: 2px solid #fee500;
  border-radius: 16px;
}

.plus-friend-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.plus-friend-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.plus-friend-info {
  flex: 1;
}

.plus-friend-title {
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.plus-friend-desc {
  font-size: 13px;
  color: #666666;
  margin: 0;
  line-height: 1.5;
}

.btn-plus-friend-push {
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fee500 0%, #fdd835 100%);
  border: 2px solid #f9a825;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  color: #3c2415;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(254, 229, 0, 0.3);
}

.btn-plus-friend-push:hover:not(:disabled) {
  background: linear-gradient(135deg, #fdd835 0%, #f9a825 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(254, 229, 0, 0.4);
}

.btn-plus-friend-push:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(254, 229, 0, 0.3);
}

.btn-plus-friend-push:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-plus-friend-push .btn-icon {
  font-size: 20px;
}

.btn-plus-friend-push .btn-text {
  flex: 1;
  text-align: center;
}

.btn-plus-friend-push .btn-badge {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #f9a825;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.active-games-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.game-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: #ffffff;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.game-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.game-chip-disabled {
  background: #f5f7fa;
  color: #86868b;
  border: 1px solid #e1e4e8;
}

.game-chip-disabled:hover {
  transform: none;
  box-shadow: none;
}

.settings-hint {
  font-size: 13px;
  color: #86868b;
  margin: 8px 0 0 0;
  font-style: italic;
}

/* URL Display Box */
.url-display-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f5f7fa;
  border: 1px solid #e1e4e8;
  border-radius: 12px;
}

.url-text {
  flex: 1;
  font-size: 14px;
  color: #007aff;
  font-weight: 500;
  font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
}

.btn-url-copy {
  padding: 8px 16px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-url-copy:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.settings-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn-settings-save {
  padding: 12px 24px;
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-settings-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* Removed Dark Mode - Light theme only */

/* Template Management Styles */
.template-controls {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.template-select {
  flex: 1;
  min-width: 200px;
}

.btn-template-action {
  padding: 10px 16px;
  background: linear-gradient(135deg, #f5f5f7 0%, #e5e5ea 100%);
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-template-action:hover:not(:disabled) {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f7 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-template-action:active:not(:disabled) {
  transform: translateY(0);
}

.btn-template-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-template-action span:first-child {
  font-size: 16px;
}

/* Modal Overlay */
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal Content */
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

/* Template Save Modal */
.template-modal {
  width: 500px;
}

/* Template Manage Modal */
.template-manage-modal {
  width: 700px;
}

/* Modal Header */
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

/* Modal Body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Modal Form Group */
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

/* Template Preview */
.template-preview {
  padding: 16px;
  background: #f5f5f7;
  border: 1px solid #d1d1d6;
  border-radius: 10px;
  font-size: 14px;
  color: #1d1d1f;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

/* Modal Footer */
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

.btn-modal-confirm:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-modal-confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px;
}

.empty-hint {
  font-size: 14px;
  color: #8e8e93;
  margin: 0;
}

/* Template List */
.template-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Template Item */
.template-item {
  padding: 16px;
  background: #f5f5f7;
  border: 1px solid #d1d1d6;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.template-item:hover {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.template-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.template-item-icon {
  font-size: 20px;
}

.template-item-name {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  flex: 1;
}

.template-item-type {
  padding: 4px 10px;
  background: #e5e5ea;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #1d1d1f;
}

.template-item-content {
  font-size: 14px;
  color: #6e6e73;
  line-height: 1.5;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-item-actions {
  display: flex;
  gap: 8px;
}

.btn-template-use,
.btn-template-delete {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-template-use {
  background: linear-gradient(135deg, #007aff 0%, #0051d5 100%);
  color: #ffffff;
  flex: 1;
}

.btn-template-use:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-template-delete {
  background: #f5f5f7;
  color: #ff3b30;
  border: 1px solid #d1d1d6;
}

.btn-template-delete:hover {
  background: #fff5f4;
  border-color: #ff3b30;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.1);
}

.btn-template-use span:first-child,
.btn-template-delete span:first-child {
  font-size: 14px;
}
</style>
