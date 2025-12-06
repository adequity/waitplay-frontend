<template>
  <div class="social-links-block">
    <div class="social-links">
      <a
        v-for="social in data.links"
        :key="social.platform"
        :href="social.url"
        target="_blank"
        class="social-link"
      >
        {{ getSocialIcon(social.platform) }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SocialLinksBlockData } from '@/types/blocks'

interface Props {
  data: SocialLinksBlockData
}

defineProps<Props>()

function getSocialIcon(platform: string): string {
  const icons: Record<string, string> = {
    instagram: '📷',
    youtube: '▶️',
    naver: 'N',
    threads: '🧵'
  }
  return icons[platform] || '🔗'
}
</script>

<style scoped>
.social-links-block {
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
}

.social-links {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.social-link {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  text-decoration: none;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.social-link:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.25);
}
</style>
