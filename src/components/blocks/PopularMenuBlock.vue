<template>
  <div class="popular-menu-block">
    <div class="popular-menu-card">
      <h3 class="menu-card-title">{{ data.title }}</h3>
      <p class="menu-card-subtitle">{{ data.subtitle }}</p>
      <div class="menu-rankings">
        <div class="menu-rank-item" v-for="item in data.items" :key="item.rank">
          <span class="rank-number">{{ item.rank }}</span>
          <div class="menu-info">
            <span class="menu-name">{{ item.name }}</span>
            <span v-if="item.price" class="menu-price">{{ item.price.toLocaleString() }}원</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PopularMenuBlockData } from '@/types/blocks'

interface Props {
  data: PopularMenuBlockData
}

defineProps<Props>()
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
  margin: 0 0 16px 0;
}

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

.rank-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.menu-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-name {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
}

.menu-price {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}
</style>
