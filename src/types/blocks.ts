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
  | 'countdown'
  | 'guestbook'

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
  platform?: 'instagram' | 'youtube' | 'naver' | 'threads' | 'facebook' | 'twitter' | 'tiktok' | 'website'
  type?: 'instagram' | 'youtube' | 'naver' | 'threads' | 'facebook' | 'twitter' | 'tiktok' | 'website'
  url: string
}

export interface SocialLinksBlockData {
  links: SocialLink[]
}

// Video Grid Block
export interface VideoItem {
  url: string
  thumbnail: string
  title?: string
}

export interface VideoGridBlockData {
  title?: string
  videos: VideoItem[]
  layout: 'grid-1' | 'grid-2' | 'grid-3' | 'carousel' | 'list'
}

// Games Carousel Block
export interface GameOrderItem {
  type: string
  name: string
  icon: string
}

export interface GamesCarouselBlockData {
  enabledGames: string[] // ['brick-breaker', 'memory', 'spot-difference']
  showLeaderboard: boolean
  gamesOrder: GameOrderItem[]
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

// Countdown Block
export interface CountdownBlockData {
  title: string
  targetDate: string // ISO 8601 format
  description?: string
  style: 'card' | 'minimal' | 'banner'
}

// Guestbook Block
export interface GuestbookMessage {
  id: string
  userId: string
  userName: string
  message?: string // Optional for text messages
  imageUrl?: string // For canvas drawing images
  createdAt: string
  rotation: number // -5 to 5 degrees for post-it rotation effect
  color: 'yellow' | 'pink' | 'blue' | 'green'
}

export interface GuestbookBlockData {
  title: string
  messages: GuestbookMessage[]
  maxMessageLength: number // default 200
  textColor?: string // hex color for guestbook text
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

export interface CountdownBlock extends BaseBlock {
  type: 'countdown'
  data: CountdownBlockData
}

export interface GuestbookBlock extends BaseBlock {
  type: 'guestbook'
  data: GuestbookBlockData
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
  | CountdownBlock
  | GuestbookBlock

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
