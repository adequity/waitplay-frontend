import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import type { UserProfile } from '@/services/authService'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  userId: string
  nickname: string
  userRole: string
  profileImage?: string
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const userRole = ref<string | null>(localStorage.getItem('userRole'))
  const user = ref<UserProfile | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  async function standardLogin(username: string, password: string, qrCodeId?: string) {
    try {
      const data = await authService.standardLogin({
        username,
        password,
        qrCodeId
      })

      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      userRole.value = data.userRole

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('userRole', data.userRole)

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

      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      userRole.value = data.userRole

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('userRole', data.userRole)

      await fetchUser()

      return data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function fetchUser() {
    if (!accessToken.value) return

    try {
      user.value = await authService.getCurrentUser()
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      logout()
      return false
    }

    try {
      const data = await authService.refreshToken({
        refreshToken: refreshToken.value
      })

      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      userRole.value = data.userRole

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('userRole', data.userRole)

      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  function setTokens(data: TokenResponse) {
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    userRole.value = data.userRole

    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('userRole', data.userRole)

    fetchUser()
  }

  function logout() {
    accessToken.value = null
    refreshToken.value = null
    userRole.value = null
    user.value = null

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userRole')
  }

  // Initialize user on store creation
  if (accessToken.value) {
    fetchUser()
  }

  return {
    accessToken,
    refreshToken,
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
