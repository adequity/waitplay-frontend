// Block types for landing page builder

export type BlockType =
  | 'header'
  | 'button'
  | 'social_links'
  | 'video_grid'
  | 'games_carousel'
  | 'popular_menu'
  | 'text'
  | 'image'

// Header Block
export interface HeaderBlockData {
  logoUrl?: string
  storeName: string
  backgroundImage: string
  welcomeMessage: string // WiFi, 영업시간, 연락처 등
  gradientOverlay?: {
    enabled: boolean
    startOpacity: number // 0-100
    endOpacity: number // 0-100
    color: string // hex color
  }
}

// Button Block
export interface ButtonBlockData {
  text: string
  url: string
  icon?: string
  style: 'primary' | 'secondary'
}

// Social Links Block
export interface SocialLink {
  platform: 'instagram' | 'youtube' | 'naver' | 'threads'
  url: string
}

export interface SocialLinksBlockData {
  links: SocialLink[]
}

// Video Grid Block
export interface VideoItem {
  url: string
  thumbnail: string
}

export interface VideoGridBlockData {
  title?: string
  videos: VideoItem[]
  layout: 'grid-2' | 'grid-3' | 'carousel'
}

// Games Carousel Block
export interface GamesCarouselBlockData {
  enabledGames: string[] // ['pinball', 'memory', 'spot-difference']
  showLeaderboard: boolean
  gamesOrder: string[]
}

// Popular Menu Block
export interface MenuItem {
  rank: number
  name: string
  price?: number
  description?: string
}

export interface PopularMenuBlockData {
  title: string
  subtitle: string
  items: MenuItem[]
}

// Text Block
export interface TextBlockData {
  content: string
  style: 'normal' | 'callout' | 'quote'
}

// Image Block
export interface ImageBlockData {
  imageUrl: string
  caption?: string
  aspectRatio: '16:9' | '1:1' | '4:3'
}

// Base Block Interface
export interface BaseBlock {
  id: string
  type: BlockType
  order: number
  isVisible: boolean
}

// Specific Block Types
export interface HeaderBlock extends BaseBlock {
  type: 'header'
  data: HeaderBlockData
  fixed: true
}

export interface ButtonBlock extends BaseBlock {
  type: 'button'
  data: ButtonBlockData
}

export interface SocialLinksBlock extends BaseBlock {
  type: 'social_links'
  data: SocialLinksBlockData
}

export interface VideoGridBlock extends BaseBlock {
  type: 'video_grid'
  data: VideoGridBlockData
}

export interface GamesCarouselBlock extends BaseBlock {
  type: 'games_carousel'
  data: GamesCarouselBlockData
}

export interface PopularMenuBlock extends BaseBlock {
  type: 'popular_menu'
  data: PopularMenuBlockData
}

export interface TextBlock extends BaseBlock {
  type: 'text'
  data: TextBlockData
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  data: ImageBlockData
}

// Union type for all blocks
export type Block =
  | HeaderBlock
  | ButtonBlock
  | SocialLinksBlock
  | VideoGridBlock
  | GamesCarouselBlock
  | PopularMenuBlock
  | TextBlock
  | ImageBlock

// Landing Page Theme
export interface PageTheme {
  backgroundColor: string
  textColor: string
}

// Landing Page Layout
export interface LandingPageLayout {
  id: number
  storeId: number
  blocks: Block[]
  theme: PageTheme
  createdAt: string
  updatedAt: string
}
