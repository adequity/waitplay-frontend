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
  }
}

export default gameSettingsService
