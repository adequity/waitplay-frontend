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

export interface RedeemWithStoreCodeRequest {
  couponCode: string
  storeCode: string
}

export interface RedeemWithStoreCodeResponse {
  success: boolean
  message?: string
  usedAt?: string
}

export interface RedeemBenefitDirectRequest {
  benefitId: string
  userId: string
  storeCode: string
  gameScoreId?: string
}

export interface RedeemBenefitDirectResponse {
  success: boolean
  message?: string
  redeemedAt?: string
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
  },

  /**
   * Redeem coupon with store code (직원이 매장 코드로 빠른 사용 처리)
   */
  async redeemWithStoreCode(request: RedeemWithStoreCodeRequest): Promise<RedeemWithStoreCodeResponse> {
    const response = await api.post('/api/coupons/redeem-with-store-code', request)
    return response.data
  },

  /**
   * Redeem benefit directly with store code (쿠폰 생성 실패 시 매장 코드로 직접 혜택 인정)
   */
  async redeemBenefitDirect(request: RedeemBenefitDirectRequest): Promise<RedeemBenefitDirectResponse> {
    const response = await api.post('/api/coupons/redeem-benefit-direct', request)
    return response.data
  }
}

export default couponsService
