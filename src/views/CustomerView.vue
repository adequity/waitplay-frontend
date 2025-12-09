<template>
  <div
    class="customer-view"
    :style="{
      backgroundColor: pageTheme.backgroundColor,
      color: pageTheme.textColor
    }"
  >
    <!-- Dynamic Block Rendering -->
    <component
      v-for="block in visibleBlocks"
      :key="block.id"
      :is="getBlockComponent(block.type)"
      :data="block.data"
    />

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text" :style="{ color: pageTheme.textColor, opacity: 0.4 }">
        Powered by WaitPlay
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Component } from 'vue'
import { useRoute } from 'vue-router'
import type { Block, PageTheme } from '@/types/blocks'

// Import block components
import HeaderBlock from '@/components/blocks/HeaderBlock.vue'
import ButtonBlock from '@/components/blocks/ButtonBlock.vue'
import SocialLinksBlock from '@/components/blocks/SocialLinksBlock.vue'
import VideoGridBlock from '@/components/blocks/VideoGridBlock.vue'
import GamesCarouselBlock from '@/components/blocks/GamesCarouselBlock.vue'
import PopularMenuBlock from '@/components/blocks/PopularMenuBlock.vue'
import TextBlock from '@/components/blocks/TextBlock.vue'
import ImageBlock from '@/components/blocks/ImageBlock.vue'
import CountdownBlock from '@/components/blocks/CountdownBlock.vue'
import GuestbookBlock from '@/components/blocks/GuestbookBlock.vue'

const route = useRoute()

// Blocks data (실제로는 API에서 가져와야 함)
const blocks = ref<Block[]>([])

// Page theme - Default values (will be loaded from API)
const pageTheme = ref<PageTheme>({
  backgroundColor: '#121212',
  textColor: '#ffffff'
})

const visibleBlocks = computed(() => {
  return blocks.value
    .filter(block => block.isVisible)
    .sort((a, b) => a.order - b.order)
})

function getBlockComponent(type: string): Component | string {
  const components: Record<string, Component> = {
    header: HeaderBlock,
    button: ButtonBlock,
    social_links: SocialLinksBlock,
    video_grid: VideoGridBlock,
    games_carousel: GamesCarouselBlock,
    popular_menu: PopularMenuBlock,
    text: TextBlock,
    image: ImageBlock,
    countdown: CountdownBlock,
    guestbook: GuestbookBlock
  }
  return components[type] || 'div'
}

onMounted(async () => {
  // Get storeId and QR code from route query
  const storeId = route.query.storeId as string
  const qrCode = route.query.qr as string

  // API URL
  const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

  // Fetch landing page settings from API
  let logoUrl = ''
  let storeName = '테라스 레스토랑'
  let welcomeMessage = '📶 테라스_Guest / terrace1234\n🕐 매일 10:00 - 22:00\n📞 02-1234-5678'

  try {

    // If QR code is provided, call QR code API to log scan
    if (qrCode) {
      try {
        // Call QR code API to increment scan count and log analytics
        const qrResponse = await fetch(`${API_URL}/api/qrcode/by-code/${encodeURIComponent(qrCode)}`)
        if (qrResponse.ok) {
          console.log('QR scan logged successfully')
        }
      } catch (err) {
        console.warn('Failed to log QR scan:', err)
      }
    }

    // Fetch landing page settings
    const endpoint = qrCode
      ? `${API_URL}/api/landingpage/settings/qr/${encodeURIComponent(qrCode)}`
      : `${API_URL}/api/landingpage/settings`

    const response = await fetch(endpoint)
    const settings = await response.json()

    if (settings && settings.storeName) {
      logoUrl = settings.logoUrl || ''
      storeName = settings.storeName
      welcomeMessage = settings.welcomeMessage || welcomeMessage
    }
  } catch (error) {
    console.warn('Failed to load landing page settings from API, using defaults:', error)
  }

  // Load layout from API if QR code is provided
  if (qrCode) {
    try {
    // Extract QR code ID from the QR code
    const qrResponse = await fetch(`${API_URL}/api/qrcode/by-code/${encodeURIComponent(qrCode)}`)
    if (!qrResponse.ok) {
      console.error('Failed to fetch QR code data')
      return
    }

    const qrData = await qrResponse.json()
    const qrCodeId = qrData.id

    // Fetch layout from API
    const layoutResponse = await fetch(`${API_URL}/api/landingpage/layout/${qrCodeId}`)
    if (!layoutResponse.ok) {
      console.error('Failed to fetch layout data')
      return
    }

    const layoutData = await layoutResponse.json()

    // Parse blocks from API response
    if (layoutData.blocksJson) {
      blocks.value = JSON.parse(layoutData.blocksJson)
      console.log('Layout loaded from API')
    } else {
      console.warn('No layout data found')
      blocks.value = []
    }

    // Parse theme from API response
    if (layoutData.themeJson) {
      pageTheme.value = JSON.parse(layoutData.themeJson)
    }

    // Update header block with latest API data
    const headerBlock = blocks.value.find(b => b.type === 'header')
    if (headerBlock && headerBlock.data) {
      headerBlock.data.logoUrl = logoUrl
      headerBlock.data.storeName = storeName
      headerBlock.data.welcomeMessage = welcomeMessage
    }
    } catch (error) {
      console.error('Error loading layout from API:', error)
    }
  }
})
</script>

<style scoped>
.customer-view {
  min-height: 100vh;
  transition: background-color 0.3s ease;
}

/* Footer */
.footer {
  padding: 2rem 1.5rem;
  text-align: center;
}

.footer-text {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 12px;
  transition: color 0.3s ease;
}
</style>
