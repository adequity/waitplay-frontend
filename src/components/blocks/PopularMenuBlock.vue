<template>
  <div class="popular-menu-block">
    <div class="popular-menu-card">
      <div class="menu-card-header">
        <div>
          <h3 class="menu-card-title">{{ data.title }}</h3>
          <p v-if="data.subtitle" class="menu-card-subtitle">{{ data.subtitle }}</p>
        </div>
        <span v-if="hasMoreItems && displayStyle === 'grid'" class="swipe-hint">
          스와이프 →
        </span>
      </div>

      <!-- Grid Layout with Swipe -->
      <div v-if="displayStyle === 'grid'" class="menu-grid-wrapper">
        <div
          ref="gridContainer"
          class="menu-grid-container"
          @scroll="onScroll"
        >
          <!-- 페이지별로 2x2 그리드 -->
          <div
            v-for="(page, pageIndex) in gridPages"
            :key="pageIndex"
            class="menu-grid-page"
          >
            <div
              v-for="(item, itemIndex) in page"
              :key="itemIndex"
              class="menu-grid-item"
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
                <span class="grid-item-name">{{ item.name }}</span>
                <span v-if="item.description" class="grid-item-description">{{ item.description }}</span>
                <span v-if="item.price" class="grid-item-price">{{ item.price.toLocaleString() }}원</span>
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

      <!-- List Layout (기존) -->
      <div v-else class="menu-rankings">
        <div class="menu-rank-item" v-for="(item, index) in data.items" :key="index">
          <span v-if="showBadge(item, index)" class="rank-badge" :class="getBadgeClass(index)">
            {{ getBadgeText(item, index) }}
          </span>
          <div v-if="item.imageUrl" class="menu-thumbnail">
            <img :src="item.imageUrl" :alt="item.name" loading="lazy" decoding="async" />
          </div>
          <div class="menu-info">
            <div class="menu-details">
              <span class="menu-name">{{ item.name }}</span>
              <span v-if="item.description" class="menu-description">{{ item.description }}</span>
            </div>
            <span v-if="item.price" class="menu-price">{{ item.price.toLocaleString() }}원</span>
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
}

const props = defineProps<Props>()

const gridContainer = ref<HTMLElement | null>(null)
const currentPage = ref(0)

const displayStyle = computed(() => props.data.displayStyle || 'grid')
const badgeStyle = computed(() => props.data.badgeStyle || 'badge')

// 4개씩 페이지로 나누기 (2x2 그리드)
const ITEMS_PER_PAGE = 4

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
</script>

<style scoped>
.popular-menu-block {
  padding: 0 1.5rem;
  margin-bottom: 12px;
}

.popular-menu-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  overflow: hidden;
}

.menu-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

/* Grid Layout with Swipe */
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 20px;
  scroll-snap-align: start;
  box-sizing: border-box;
}

.menu-grid-item {
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
  flex-shrink: 0;
}
</style>
