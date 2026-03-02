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
      <!-- Default WaitPlay branding -->
      <div class="sidebar-ad-branding">
        <div class="branding-content">
          <div class="branding-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="branding-logo-svg">
              <circle cx="20" cy="20" r="18" fill="#2563eb" opacity="0.1"/>
              <circle cx="20" cy="20" r="12" fill="#2563eb" opacity="0.2"/>
              <circle cx="20" cy="20" r="6" fill="#2563eb"/>
            </svg>
          </div>
          <h3 class="branding-title">WaitPlay</h3>
          <p class="branding-slogan">게임하고<br>혜택받자</p>
          <div class="branding-decoration">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
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

async function loadAds() {
  try {
    const qrCode = detectQrCode()
    const newCacheKey = qrCode || 'default'

    // Use cache if valid
    if (newCacheKey === cacheKey.value && Date.now() < cacheExpiry.value) {
      return
    }

    let result: SidebarAd[]
    if (qrCode) {
      result = await getSidebarAds(qrCode)
    } else {
      result = await getDefaultSidebarAds()
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
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 12px;
  overflow-y: auto;
  scrollbar-width: none;
}

.sidebar-ad::-webkit-scrollbar {
  display: none;
}

.sidebar-ad-item {
  display: block;
  width: 100%;
  max-width: 280px;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sidebar-ad-item.clickable {
  cursor: pointer;
}

.sidebar-ad-item.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.sidebar-ad-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

/* Default branding */
.sidebar-ad-branding {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.branding-content {
  text-align: center;
  padding: 40px 20px;
}

.branding-logo {
  margin-bottom: 20px;
}

.branding-logo-svg {
  width: 56px;
  height: 56px;
}

.branding-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2563eb;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.branding-slogan {
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.5;
  font-weight: 400;
}

.branding-decoration {
  margin-top: 24px;
  display: flex;
  gap: 6px;
  justify-content: center;
}

.branding-decoration .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #cbd5e1;
}

.branding-decoration .dot:nth-child(2) {
  background: #2563eb;
  opacity: 0.5;
}
</style>
