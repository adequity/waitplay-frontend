import api from './api'

export interface BenefitDto {
  id: string
  qrCodeId: string
  gameType: string
  title: string
  description?: string
  requiredScore: number
  couponPrefix?: string
  expiryDays: number
  maxIssuance?: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
  // Statistics
  issuedCount: number
  usedCount: number
  usageRate: number
}

export interface CreateBenefitRequest {
  gameType: string
  title: string
  description?: string
  requiredScore: number
  couponPrefix?: string
  expiryDays?: number
  maxIssuance?: number
  isActive?: boolean
}

export interface UpdateBenefitRequest {
  title?: string
  description?: string
  requiredScore?: number
  couponPrefix?: string
  expiryDays?: number
  maxIssuance?: number
  isActive?: boolean
}

export interface GameBenefitStatsDto {
  gameType: string
  todayPlays: number
  avgScore: number
  participants: number
  couponsIssued: number
  highestScore: number
  avgPlayTime: number
}

const benefitsService = {
  /**
   * Get all benefits for a QR code
   */
  async getBenefits(qrCodeId: string): Promise<BenefitDto[]> {
    const response = await api.get(`/api/benefits/${qrCodeId}`)
    return response.data
  },

  /**
   * Get benefits for a specific game
   */
  async getBenefitsByGame(qrCodeId: string, gameType: string): Promise<BenefitDto[]> {
    const response = await api.get(`/api/benefits/${qrCodeId}/game/${gameType}`)
    return response.data
  },

  /**
   * Create a new benefit
   */
  async createBenefit(qrCodeId: string, request: CreateBenefitRequest): Promise<BenefitDto> {
    const response = await api.post(`/api/benefits/${qrCodeId}`, request)
    return response.data
  },

  /**
   * Update a benefit
   */
  async updateBenefit(benefitId: string, request: UpdateBenefitRequest): Promise<BenefitDto> {
    const response = await api.put(`/api/benefits/${benefitId}`, request)
    return response.data
  },

  /**
   * Delete a benefit
   */
  async deleteBenefit(benefitId: string): Promise<void> {
    await api.delete(`/api/benefits/${benefitId}`)
  },

  /**
   * Get game statistics for benefits dashboard
   */
  async getGameStats(qrCodeId: string): Promise<GameBenefitStatsDto[]> {
    const response = await api.get(`/api/benefits/${qrCodeId}/stats`)
    return response.data
  }
}

export default benefitsService
