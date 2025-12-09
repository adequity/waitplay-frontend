<template>
  <div class="image-block">
    <div class="image-container" :class="`aspect-ratio--${data.aspectRatio}`">
      <img :src="data.imageUrl" :alt="data.caption || '이미지'" class="block-image" />
    </div>
    <p v-if="data.caption" class="image-caption">{{ data.caption }}</p>
  </div>
</template>

<script setup lang="ts">
import type { ImageBlockData } from '@/types/blocks'

interface Props {
  data: ImageBlockData
}

defineProps<Props>()
</script>

<style scoped>
.image-block {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
}

.image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 16:9 비율 */
.image-container.aspect-ratio--16\:9 {
  padding-bottom: 56.25%; /* 9/16 = 0.5625 */
}

/* 1:1 비율 */
.image-container.aspect-ratio--1\:1 {
  padding-bottom: 100%;
}

/* 4:3 비율 */
.image-container.aspect-ratio--4\:3 {
  padding-bottom: 75%; /* 3/4 = 0.75 */
}

.block-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.image-caption {
  margin-top: 0.75rem;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  line-height: 1.5;
}
</style>
