import api from './api'

export interface GenerateCouponRequest {
  benefitId: string
  userId: string
  gameScoreId?: string
}

export interface CouponCodeResponse {
  couponCode: string
  benefitTitle: string
  benefitDescription?: string
  expiresAt: string
  expiresInMinutes: number
}

export interface VerifyCouponRequest {
  couponCode: string
}

export interface CouponVerificationResponse {
  isValid: boolean
  benefitTitle: string
  benefitDescription?: string
  usedAt?: string
  message: string
}

export interface CouponStatsResponse {
  totalIssued: number
  totalUsed: number
  totalExpired: number
  usageRate: number
  todayIssued: number
  todayUsed: number
}

const couponsService = {
  /**
   * Generate one-time coupon code
   */
  async generateCoupon(request: GenerateCouponRequest): Promise<CouponCodeResponse> {
    const response = await api.post('/api/coupons/generate', request)
    return response.data
  },

  /**
   * Verify and redeem coupon code (staff use)
   */
  async verifyCoupon(request: VerifyCouponRequest): Promise<CouponVerificationResponse> {
    const response = await api.post('/api/coupons/verify', request)
    return response.data
  },

  /**
   * Get coupon statistics for admin
   */
  async getCouponStats(qrCodeId: string): Promise<CouponStatsResponse> {
    const response = await api.get(`/api/coupons/stats/${qrCodeId}`)
    return response.data
  }
}

export default couponsService
