import apiClient from './api'
import type { TokenResponse } from '@/stores/auth'

export interface SocialLoginRequest {
  accessToken: string
  provider: 0 | 1 // 0 = Kakao, 1 = Naver
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface UserProfile {
  id: string
  nickname: string
  profileImage?: string
  kakaoId?: string
  naverId?: string
  createdAt: string
}

class AuthService {
  /**
   * Social login with Kakao or Naver
   */
  async socialLogin(request: SocialLoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/api/auth/login', request)
    return response.data
  }

  /**
   * Refresh access token
   */
  async refreshToken(request: RefreshTokenRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/api/auth/refresh', request)
    return response.data
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/api/auth/me')
    return response.data
  }
}

export default new AuthService()
