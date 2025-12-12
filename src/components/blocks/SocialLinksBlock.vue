<template>
  <div class="social-links-block">
    <div class="social-links">
      <a
        v-for="(social, index) in data.links"
        :key="index"
        :href="social.url"
        target="_blank"
        class="social-link"
        :class="`social-link--${social.type || social.platform || 'website'}`"
      >
        <Icon :icon="getSocialIcon(social.type || social.platform || 'website')" width="24" height="24" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SocialLinksBlockData } from '@/types/blocks'
import { Icon } from '@iconify/vue'

interface Props {
  data: SocialLinksBlockData
}

defineProps<Props>()

function getSocialIcon(platform: string | undefined): string {
  if (!platform) return 'mdi:web'

  const icons: Record<string, string> = {
    instagram: 'mdi:instagram',
    youtube: 'mdi:youtube',
    naver: 'simple-icons:naver',
    threads: 'ri:threads-fill',
    facebook: 'mdi:facebook',
    twitter: 'mdi:twitter',
    tiktok: 'mdi:music-note',
    website: 'mdi:web'
  }
  return icons[platform] || 'mdi:link-variant'
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
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.social-link:active {
  transform: scale(0.95);
}

/* 각 플랫폼별 브랜드 컬러 */
.social-link--instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}

.social-link--youtube {
  background: #FF0000;
}

.social-link--naver {
  background: #03C75A;
}

.social-link--threads {
  background: #000000;
}

.social-link--facebook {
  background: #1877F2;
}

.social-link--twitter {
  background: #1DA1F2;
}

.social-link--tiktok {
  background: #000000;
}

.social-link--website {
  background: #6366f1;
}
</style>
