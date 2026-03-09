import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import apiClient from '@/services/api'
import type { UserProfile } from '@/services/authService'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  userId: string
  nickname: string
  userRole: string
  profileImage?: string
  redirectUrl?: string
}

export const useAuthStore = defineStore('auth', () => {
  const userRole = ref<string | null>(localStorage.getItem('userRole'))
  const user = ref<UserProfile | null>(null)

  // 쿠키 기반: user 존재 여부로 인증 상태 판단
  const isAuthenticated = computed(() => !!user.value)

  async function standardLogin(username: string, password: string, qrCodeId?: string) {
    try {
      const data = await authService.standardLogin({
        username,
        password,
        qrCodeId
      })

      // 쿠키는 서버가 자동 설정, userRole만 localStorage 저장
      userRole.value = data.userRole
      localStorage.setItem('userRole', data.userRole)

      await fetchUser()

      return data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function login(provider: 'kakao' | 'naver', socialAccessToken: string) {
    try {
      const data = await authService.socialLogin({
        accessToken: socialAccessToken,
        provider: provider === 'kakao' ? 0 : 1
      })

      userRole.value = data.userRole
      localStorage.setItem('userRole', data.userRole)

      await fetchUser()

      return data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function fetchUser() {
    try {
      const fetchedUser = await authService.getCurrentUser()
      user.value = fetchedUser
      // fetchUser 성공 시 userRole도 동기화
      if (fetchedUser.userRole) {
        userRole.value = fetchedUser.userRole
        localStorage.setItem('userRole', fetchedUser.userRole)
      }
    } catch (error) {
      // 인증 실패 → 쿠키 만료됨
      user.value = null
    }
  }

  async function refreshAccessToken() {
    try {
      // body 없이 호출 — 쿠키의 refresh_token 자동 전송
      const data = await authService.refreshToken({})
      userRole.value = data.userRole
      localStorage.setItem('userRole', data.userRole)
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  async function setTokens(data: TokenResponse) {
    // 쿠키는 서버가 자동 설정
    userRole.value = data.userRole
    localStorage.setItem('userRole', data.userRole)
    await fetchUser()
  }

  async function logout() {
    try {
      await apiClient.post('/api/auth/logout')
    } catch {
      // 실패해도 로컬 정리
    }
    userRole.value = null
    user.value = null
    localStorage.removeItem('userRole')
    // 기존 localStorage 토큰도 정리 (마이그레이션)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  // 초기화: 쿠키가 유효한지 fetchUser로 확인
  fetchUser()

  return {
    userRole,
    user,
    isAuthenticated,
    standardLogin,
    login,
    logout,
    fetchUser,
    refreshAccessToken,
    setTokens
  }
})
