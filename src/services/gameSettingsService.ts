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

const gameSettingsService = {
  /**
   * Get game settings by QR code ID
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
  }
}

export default gameSettingsService
