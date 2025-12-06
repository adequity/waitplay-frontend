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

const route = useRoute()

// Blocks data (실제로는 API에서 가져와야 함)
const blocks = ref<Block[]>([])

// Page theme - Load from localStorage or use defaults
const savedTheme = localStorage.getItem('waitplay-page-theme')
const pageTheme = ref<PageTheme>(
  savedTheme
    ? JSON.parse(savedTheme)
    : {
        backgroundColor: '#121212',
        textColor: '#ffffff'
      }
)

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
    popular_menu: PopularMenuBlock
  }
  return components[type] || 'div'
}

onMounted(async () => {
  // Get storeId from route query (QR code parameter)
  const storeId = route.query.storeId as string

  // TODO: Fetch layout from API
  // const response = await fetch(`/api/landing-page/${storeId}`)
  // const data = await response.json()
  // blocks.value = data.blocks
  // pageTheme.value = data.theme

  // Load blocks from localStorage or use demo data
  const savedBlocks = localStorage.getItem('waitplay-blocks')
  if (savedBlocks) {
    blocks.value = JSON.parse(savedBlocks)
  } else {
    // 임시 데이터 (데모용)
    blocks.value = [
    {
      id: 'header-001',
      type: 'header',
      order: 0,
      isVisible: true,
      fixed: true,
      data: {
        storeName: '테라스 레스토랑',
        backgroundImage: 'https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20230917_255%2F16949402169637M5tc_JPEG%2F%25C5%25D7%25B6%25F3%25BD%25BA.jpg',
        welcomeMessage: '📶 테라스_Guest / terrace1234\n🕐 매일 10:00 - 22:00\n📞 02-1234-5678',
        gradientOverlay: {
          enabled: true,
          startOpacity: 0,
          endOpacity: 100,
          color: '#121212'
        }
      }
    },
    {
      id: 'social-001',
      type: 'social_links',
      order: 1,
      isVisible: true,
      data: {
        links: [
          { platform: 'instagram', url: 'https://instagram.com/terrace' },
          { platform: 'youtube', url: 'https://youtube.com/@terrace' },
          { platform: 'naver', url: 'https://blog.naver.com/terrace' }
        ]
      }
    },
    {
      id: 'video-001',
      type: 'video_grid',
      order: 2,
      isVisible: true,
      data: {
        videos: [
          {
            url: 'https://youtube.com/shorts/abc123',
            thumbnail: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg'
          },
          {
            url: 'https://youtube.com/shorts/def456',
            thumbnail: 'https://img.youtube.com/vi/def456/maxresdefault.jpg'
          }
        ],
        layout: 'grid-2'
      }
    },
    {
      id: 'games-001',
      type: 'games_carousel',
      order: 3,
      isVisible: true,
      data: {
        enabledGames: ['pinball', 'memory', 'spot-difference'],
        showLeaderboard: true,
        gamesOrder: ['pinball', 'memory', 'spot-difference']
      }
    },
    {
      id: 'menu-001',
      type: 'popular_menu',
      order: 4,
      isVisible: true,
      data: {
        title: '인기 메뉴',
        subtitle: '사람들이 많이 받아간 메뉴',
        items: [
          { rank: 1, name: '알페로 파스타', price: 18000 },
          { rank: 2, name: '립아이 스테이크', price: 32000 },
          { rank: 3, name: '트러플 리조또', price: 24000 }
        ]
      }
    }
  ]
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
