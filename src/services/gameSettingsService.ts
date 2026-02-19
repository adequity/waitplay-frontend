import api from './api'

export interface GameOrderDto {
  type: string
  order: number
}

export interface GameSettingsDto {
  id: string
  qrCodeId: string
  enabledGames: string[]
  gamesOrder: GameOrderDto[] | null
  createdAt: string
  updatedAt: string | null
}

export interface UpdateGameSettingsDto {
  enabledGames: string[]
  gamesOrder: GameOrderDto[] | null
}

export interface GameStatsDto {
  gameType: string
  todayPlays: number
  avgScore: string | null
  participants: number
  revisitRate: string | null
  couponAvgScore: string | null
  couponCheck: string | null
}

export interface AvailableGameDto {
  gameKey: string
  name: string
  icon: string | null
  description: string | null
  displayOrder: number
  iconImageUrl?: string | null
  backgroundImageUrl?: string | null
  buttonText?: string | null
  bgOpacity?: number
  bgBlur?: number
  nameFontSize?: number
  nameFontFamily?: string | null
  descFontSize?: number
  descFontFamily?: string | null
  nameTextShadow?: number
  descTextShadow?: number
}

const gameSettingsService = {
  /**
   * Get game settings by QR code ID (public - no auth required)
   */
  async getGameSettingsPublic(qrCodeId: string): Promise<GameSettingsDto> {
    const response = await api.get(`/api/games/settings/public/${qrCodeId}`)
    return response.data
  },

  /**
   * Get game settings by QR code ID (requires auth)
   */
  async getGameSettings(qrCodeId: string): Promise<GameSettingsDto> {
    const response = await api.get(`/api/games/settings/${qrCodeId}`)
    return response.data
  },

  /**
   * Update game settings by QR code ID
   */
  async updateGameSettings(
    qrCodeId: string,
    settings: UpdateGameSettingsDto
  ): Promise<GameSettingsDto> {
    const response = await api.put(`/api/games/settings/${qrCodeId}`, settings)
    return response.data
  },

  /**
   * Get game statistics by QR code ID (admin only)
   */
  async getGameStats(qrCodeId: string): Promise<GameStatsDto[]> {
    const response = await api.get(`/api/games/stats/${qrCodeId}`)
    return response.data
  },

  /**
   * Get available games assigned to admin user (admin only)
   */
  async getAvailableGames(): Promise<AvailableGameDto[]> {
    const response = await api.get('/api/games/settings/available-games')
    return response.data.games || []
  },

  /**
   * Get available games for QR code (public - no auth required)
   * Returns games assigned to the admin who owns this QR code
   */
  async getAvailableGamesPublic(qrCodeId: string): Promise<AvailableGameDto[]> {
    const response = await api.get(`/api/games/settings/public/${qrCodeId}/games`)
    return response.data.games || []
  }
}

export default gameSettingsService
