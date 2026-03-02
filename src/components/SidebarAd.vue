<template>
  <div class="sidebar-ad" :class="`sidebar-ad-${position}`">
    <template v-if="filteredAds.length > 0">
      <a
        v-for="ad in filteredAds"
        :key="ad.id"
        :href="ad.linkUrl || undefined"
        :target="ad.linkUrl ? '_blank' : undefined"
        rel="noopener noreferrer"
        class="sidebar-ad-item"
        :class="{ 'clickable': !!ad.linkUrl }"
      >
        <img :src="ad.imageUrl" :alt="ad.title || '광고'" class="sidebar-ad-image" />
      </a>
    </template>
    <template v-else>
      <!-- 광고 없을 때: 뷰포트 전체를 채우는 빈 광고 구좌 -->
      <div class="sidebar-ad-empty">
        <div class="ad-slot-label">AD</div>
        <div class="branding-mini">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="branding-logo-svg">
            <circle cx="20" cy="20" r="18" fill="#2563eb" opacity="0.1"/>
            <circle cx="20" cy="20" r="12" fill="#2563eb" opacity="0.2"/>
            <circle cx="20" cy="20" r="6" fill="#2563eb"/>
          </svg>
          <span class="branding-name">WaitPlay</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSidebarAds, getDefaultSidebarAds, type SidebarAd } from '@/services/sidebarAdService'

const props = defineProps<{
  position: 'left' | 'right'
}>()

const route = useRoute()
const ads = ref<SidebarAd[]>([])
const cacheKey = ref('')
const cacheExpiry = ref(0)
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const filteredAds = computed(() => {
  return ads.value.filter(
    ad => ad.position === props.position || ad.position === 'both'
  )
})

// Detect current page section from route
function detectPageSection(): string {
  const path = route.path

  if (path === '/customer') return 'customer'
  if (path === '/login' || path === '/signup' || path === '/forgot-password') return 'login'
  if (path.startsWith('/u/') || path.startsWith('/user/') || path === '/settings') return 'profile'
  if (path.startsWith('/game/')) return 'game'
  if (path === '/guestbook') return 'guestbook'
  if (path === '/privacy' || path === '/terms') return 'login'
  if (path === '/' || path.startsWith('/s/')) return 'customer'

  return 'all'
}

async function loadAds() {
  try {
    const qrCode = detectQrCode()
    const section = detectPageSection()
    const newCacheKey = `${qrCode || 'default'}_${section}`

    // Use cache if valid
    if (newCacheKey === cacheKey.value && Date.now() < cacheExpiry.value) {
      return
    }

    let result: SidebarAd[]
    if (qrCode) {
      result = await getSidebarAds(qrCode, section)
    } else {
      result = await getDefaultSidebarAds(section)
    }

    ads.value = result
    cacheKey.value = newCacheKey
    cacheExpiry.value = Date.now() + CACHE_DURATION
  } catch {
    // Silent fail - show default branding
    ads.value = []
  }
}

function detectQrCode(): string | null {
  // /customer?qr=XXX
  if (route.path === '/customer' && route.query.qr) {
    return route.query.qr as string
  }
  return null
}

// Watch route changes
watch(() => route.fullPath, () => {
  loadAds()
})

onMounted(() => {
  loadAds()
})
</script>

<style scoped>
.sidebar-ad {
  width: 100%;
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  overflow-y: auto;
  scrollbar-width: none;
}

.sidebar-ad::-webkit-scrollbar {
  display: none;
}

/* 광고가 있을 때 */
.sidebar-ad-item {
  display: block;
  width: 100%;
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sidebar-ad-item.clickable {
  cursor: pointer;
}

.sidebar-ad-item.clickable:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.sidebar-ad-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

/* 광고 없을 때: 전체 영역을 채우는 빈 구좌 */
.sidebar-ad-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-left: 1px dashed #e2e8f0;
  border-right: 1px dashed #e2e8f0;
  gap: 40px;
}

.sidebar-ad-left .sidebar-ad-empty {
  border-left: none;
}

.sidebar-ad-right .sidebar-ad-empty {
  border-right: none;
}

.ad-slot-label {
  font-size: 16px;
  font-weight: 700;
  color: #cbd5e1;
  letter-spacing: 4px;
}

.branding-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.6;
}

.branding-logo-svg {
  width: 36px;
  height: 36px;
}

.branding-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: -0.01em;
}
</style>
