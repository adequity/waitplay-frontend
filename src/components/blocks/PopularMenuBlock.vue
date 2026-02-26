<template>
  <div class="popular-menu-block" :class="{ 'transparent-style': isTransparent }">
    <div class="popular-menu-card" :class="{ 'no-card': isTransparent }">
      <div class="menu-card-header">
        <div>
          <h3 class="menu-card-title" :style="{ color: textColor }">{{ data.title }}</h3>
          <p v-if="data.subtitle" class="menu-card-subtitle" :style="{ color: subtitleColor }">{{ data.subtitle }}</p>
        </div>
        <span v-if="hasMoreItems && displayStyle === 'grid'" class="swipe-hint" :style="{ color: mutedColor }">
          스와이프 →
        </span>
      </div>

      <!-- Grid Layout with Horizontal Swipe (2x1) -->
      <div v-if="displayStyle === 'grid'" class="menu-grid-wrapper">
        <div
          ref="gridContainer"
          class="menu-grid-container"
          @scroll="onScroll"
        >
          <!-- 2개씩 페이지로 나누기 -->
          <div
            v-for="(page, pageIndex) in gridPages"
            :key="pageIndex"
            class="menu-grid-page"
          >
            <div
              v-for="(item, itemIndex) in page"
              :key="itemIndex"
              class="menu-grid-item"
              :class="{ clickable: item.link }"
              @click="handleItemClick(item)"
            >
              <div v-if="item.imageUrl" class="grid-item-image">
                <img :src="item.imageUrl" :alt="item.name" loading="lazy" decoding="async" />
                <span v-if="showBadge(item, getOriginalIndex(pageIndex, itemIndex))" class="grid-item-badge">
                  {{ getBadgeText(item, getOriginalIndex(pageIndex, itemIndex)) }}
                </span>
              </div>
              <div v-else class="grid-item-placeholder">
                <span v-if="showBadge(item, getOriginalIndex(pageIndex, itemIndex))" class="grid-item-badge">
                  {{ getBadgeText(item, getOriginalIndex(pageIndex, itemIndex)) }}
                </span>
              </div>
              <div class="grid-item-info">
                <span class="grid-item-name" :style="{ color: textColor }">{{ item.name }}</span>
                <span v-if="item.description" class="grid-item-description" :style="{ color: mutedColor }">{{ item.description }}</span>
                <span v-if="item.price" class="grid-item-price" :style="{ color: priceColor }">{{ item.price.toLocaleString() }}원</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 페이지 인디케이터 -->
        <div v-if="gridPages.length > 1" class="page-indicators">
          <span
            v-for="(_, index) in gridPages"
            :key="index"
            class="page-dot"
            :class="{ active: currentPage === index }"
          ></span>
        </div>
      </div>

      <!-- Ranking Layout (앱스토어 스타일 순위 리스트) -->
      <div v-else-if="displayStyle === 'ranking'" class="menu-ranking-list">
        <div
          class="ranking-item"
          :class="{ clickable: item.link }"
          v-for="(item, index) in data.items"
          :key="index"
          @click="handleItemClick(item)"
        >
          <span class="ranking-number" :class="getRankingClass(index)">{{ index + 1 }}</span>
          <div class="ranking-thumb">
            <img
              v-if="item.thumbnailUrl || item.imageUrl"
              :src="item.thumbnailUrl || item.imageUrl"
              :alt="item.name"
              loading="lazy"
              decoding="async"
            />
            <span v-else class="ranking-thumb-fallback">{{ item.name ? item.name.charAt(0) : '?' }}</span>
          </div>
          <div class="ranking-info">
            <span class="ranking-name" :style="{ color: textColor }">{{ item.name }}</span>
            <span v-if="item.description" class="ranking-desc" :style="{ color: mutedColor }">{{ item.description }}</span>
          </div>
          <span v-if="item.price" class="ranking-price" :style="{ color: priceColor }">{{ item.price.toLocaleString() }}원</span>
        </div>
      </div>

      <!-- List Layout (기존) -->
      <div v-else class="menu-rankings">
        <div
          class="menu-rank-item"
          :class="{ clickable: item.link }"
          v-for="(item, index) in data.items"
          :key="index"
          @click="handleItemClick(item)"
        >
          <div v-if="item.imageUrl" class="menu-thumbnail">
            <img :src="item.imageUrl" :alt="item.name" loading="lazy" decoding="async" />
          </div>
          <div class="menu-info">
            <div class="menu-details">
              <span class="menu-name" :style="{ color: textColor }">{{ item.name }}</span>
              <span v-if="item.description" class="menu-description" :style="{ color: mutedColor }">{{ item.description }}</span>
            </div>
            <div class="menu-price-area">
              <span v-if="showBadge(item, index)" class="rank-badge" :class="getBadgeClass(index)">
                {{ getBadgeText(item, index) }}
              </span>
              <span v-if="item.price" class="menu-price" :style="{ color: priceColor }">{{ item.price.toLocaleString() }}원</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PopularMenuBlockData, MenuItem } from '@/types/blocks'

interface Props {
  data: PopularMenuBlockData
  textColor?: string // 페이지 테마 글자색
}

const props = defineProps<Props>()

const gridContainer = ref<HTMLElement | null>(null)
const currentPage = ref(0)

const displayStyle = computed(() => props.data.displayStyle || 'grid')
const badgeStyle = computed(() => props.data.badgeStyle || 'badge')
const isTransparent = computed(() => props.data.cardStyle === 'transparent')

// 글자색 계산 (props로 받으면 사용, 없으면 기본값)
const textColor = computed(() => props.textColor || '#ffffff')
const subtitleColor = computed(() => {
  // 글자색에 투명도 적용
  const color = props.textColor || '#ffffff'
  // hex를 rgba로 변환하여 투명도 적용
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.6)`
})
const mutedColor = computed(() => {
  const color = props.textColor || '#ffffff'
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.5)`
})
const priceColor = computed(() => {
  const color = props.textColor || '#ffffff'
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.9)`
})

// 2개씩 페이지로 나누기 (2x1 가로 스와이프)
const ITEMS_PER_PAGE = 2

const gridPages = computed(() => {
  const items = props.data.items || []
  const pages: MenuItem[][] = []

  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pages.push(items.slice(i, i + ITEMS_PER_PAGE))
  }

  return pages
})

const hasMoreItems = computed(() => (props.data.items?.length || 0) > ITEMS_PER_PAGE)

// 페이지와 아이템 인덱스로 원본 인덱스 계산
const getOriginalIndex = (pageIndex: number, itemIndex: number): number => {
  return pageIndex * ITEMS_PER_PAGE + itemIndex
}

// 스크롤 이벤트 핸들러
const onScroll = () => {
  if (!gridContainer.value) return

  const container = gridContainer.value
  const scrollLeft = container.scrollLeft
  const pageWidth = container.clientWidth

  currentPage.value = Math.round(scrollLeft / pageWidth)
}

const showBadge = (item: MenuItem, index: number): boolean => {
  if (badgeStyle.value === 'none') return false
  if (badgeStyle.value === 'badge') return !!item.badge
  return true // rank
}

const getBadgeText = (item: MenuItem, index: number): string => {
  if (badgeStyle.value === 'badge' && item.badge) {
    return item.badge
  }
  if (badgeStyle.value === 'rank') {
    return String(index + 1)
  }
  return item.badge || ''
}

const getBadgeClass = (index: number): string => {
  if (badgeStyle.value !== 'rank') return ''
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}

// 랭킹 스타일용 순위 클래스
const getRankingClass = (index: number): string => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return ''
}

// 메뉴 아이템 클릭 핸들러
const handleItemClick = (item: MenuItem) => {
  if (item.link) {
    window.open(item.link, '_blank', 'noopener,noreferrer')
  }
}
</script>

<style scoped>
.popular-menu-block {
  padding: 0 1.5rem;
}

.popular-menu-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  overflow: hidden;
}

/* 투명 스타일 - 카드 배경 없음 */
.popular-menu-card.no-card {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
}

.menu-card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 16px;
}

.menu-card-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.menu-card-subtitle {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.swipe-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* Grid Layout with Horizontal Swipe (2x1) */
.menu-grid-wrapper {
  margin: 0 -20px;
}

.menu-grid-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.menu-grid-container::-webkit-scrollbar {
  display: none;
}

.menu-grid-page {
  flex: 0 0 100%;
  display: flex;
  gap: 10px;
  padding: 0 20px;
  scroll-snap-align: start;
  box-sizing: border-box;
}

.menu-grid-item {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.grid-item-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.grid-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grid-item-placeholder {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-item-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
}

.grid-item-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.grid-item-name {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.grid-item-description {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.3;
}

.grid-item-price {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
}

/* 페이지 인디케이터 */
.page-indicators {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
}

.page-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.page-dot.active {
  width: 18px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.8);
}

/* List Layout (기존 스타일 유지) */
.menu-rankings {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.rank-badge {
  min-width: 40px;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.rank-badge.rank-gold {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1a1a1a;
}

.rank-badge.rank-silver {
  background: linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%);
  color: #1a1a1a;
}

.rank-badge.rank-bronze {
  background: linear-gradient(135deg, #CD7F32 0%, #A0522D 100%);
  color: #ffffff;
}

.menu-thumbnail {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.menu-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.menu-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menu-price-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.menu-name {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
}

.menu-description {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.menu-price {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

/* 리스트 스타일에서 배지 - 가격 위에 배치 */
.menu-price-area .rank-badge {
  min-width: auto;
}

/* 클릭 가능한 아이템 스타일 */
.menu-grid-item.clickable,
.menu-rank-item.clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.menu-grid-item.clickable:hover,
.menu-rank-item.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.menu-grid-item.clickable:active,
.menu-rank-item.clickable:active {
  transform: translateY(0);
}

/* ==================== Ranking Layout (앱스토어 스타일) ==================== */
.menu-ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-number {
  min-width: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  flex-shrink: 0;
}

.ranking-number.rank-1 {
  color: #FFD700;
  font-size: 19px;
}

.ranking-number.rank-2 {
  color: #C0C0C0;
  font-size: 18px;
}

.ranking-number.rank-3 {
  color: #CD7F32;
  font-size: 18px;
}

.ranking-thumb {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ranking-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ranking-thumb-fallback {
  font-size: 22px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
}

.ranking-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ranking-name {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-desc {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ranking-price {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
}

.ranking-item.clickable {
  cursor: pointer;
  transition: background 0.2s ease;
  margin: 0 -12px;
  padding: 14px 12px;
  border-radius: 12px;
}

.ranking-item.clickable:hover {
  background: rgba(255, 255, 255, 0.05);
}

.ranking-item.clickable:active {
  background: rgba(255, 255, 255, 0.08);
}
</style>
