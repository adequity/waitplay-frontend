import apiClient from './api'
import type { TokenResponse } from '@/stores/auth'

export interface StandardLoginRequest {
  username: string
  password: string
  qrCodeId?: string
}

export interface SocialLoginRequest {
  accessToken: string
  provider: 0 | 1 // 0 = Kakao, 1 = Naver
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface EmailSignupRequest {
  name: string
  email: string
  password: string
  qrCodeId?: string
  agreeMarketing?: boolean
  isBusinessUser?: boolean
  companyName?: string
  businessNumber?: string
  businessAddress?: string
  businessType?: string
  businessCategory?: string
}

export interface SocialSignupRequest {
  provider: 0 | 1 // 0 = Kakao, 1 = Naver
  accessToken: string
  qrCodeId?: string
  agreeMarketing?: boolean
}

export interface UserProfile {
  id: string
  nickname: string
  profileImage?: string
  profileCode?: string
  bio?: string
  kakaoId?: string
  naverId?: string
  company?: string
  userRole: string
  createdAt: string
  qrCodeId?: string
  qrCode?: string
}

export interface UpdateProfileRequest {
  nickname?: string
  profileImage?: string
  bio?: string
}

class AuthService {
  /**
   * Standard username/password login
   */
  async standardLogin(request: StandardLoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/api/auth/standard-login', request)
    return response.data
  }

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

  /**
   * Email/Password 회원가입
   */
  async emailSignup(request: EmailSignupRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/api/auth/signup/email', request)
    return response.data
  }

  /**
   * SNS 회원가입 (Kakao, Naver)
   */
  async socialSignup(request: SocialSignupRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/api/auth/signup/social', request)
    return response.data
  }

  /**
   * 프로필 수정
   */
  async updateProfile(request: UpdateProfileRequest): Promise<{ success: boolean; nickname: string; profileImage: string | null; bio: string | null }> {
    const response = await apiClient.patch('/api/auth/profile', request)
    return response.data
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/change-password', { currentPassword, newPassword })
  }

  /**
   * 계정 삭제
   */
  async deleteAccount(password?: string): Promise<void> {
    await apiClient.delete('/api/auth/account', { data: password ? { password } : {} })
  }
}

export default new AuthService()
