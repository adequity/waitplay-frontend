<template>
  <div class="video-grid-block">
    <h3 v-if="data.title" class="block-title">{{ data.title }}</h3>

    <div class="youtube-shorts-grid" v-if="data.layout === 'grid-2'">
      <div
        v-for="(video, index) in data.videos"
        :key="index"
        class="youtube-short"
        @click="openVideo(video.url)"
      >
        <div class="short-thumbnail">
          <img :src="video.thumbnail" alt="Video thumbnail" />
          <div class="play-button-small">▶</div>
        </div>
      </div>
    </div>

    <div class="youtube-shorts-grid grid-3" v-else-if="data.layout === 'grid-3'">
      <div
        v-for="(video, index) in data.videos"
        :key="index"
        class="youtube-short"
        @click="openVideo(video.url)"
      >
        <div class="short-thumbnail">
          <img :src="video.thumbnail" alt="Video thumbnail" />
          <div class="play-button-small">▶</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VideoGridBlockData } from '@/types/blocks'

interface Props {
  data: VideoGridBlockData
}

defineProps<Props>()

function openVideo(url: string) {
  window.open(url, '_blank')
}
</script>

<style scoped>
.video-grid-block {
  padding: 0 1.5rem;
  margin-bottom: 20px;
}

.block-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
}

.youtube-shorts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.youtube-shorts-grid.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.youtube-short {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.08), 0 4px 16px rgba(255, 255, 255, 0.04);
}

.youtube-short:active {
  transform: scale(0.98);
  box-shadow: 0 2px 12px rgba(255, 255, 255, 0.12), 0 4px 20px rgba(255, 255, 255, 0.06);
}

.short-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 177.78%; /* 9:16 aspect ratio for Shorts */
  background: #000000;
}

.short-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button-small {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #ffffff;
  padding-left: 3px;
}
</style>
