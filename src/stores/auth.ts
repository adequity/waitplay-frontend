import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import type { UserProfile } from '@/services/authService'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  userId: string
  nickname: string
  profileImage?: string
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const user = ref<UserProfile | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  async function login(provider: 'kakao' | 'naver', socialAccessToken: string) {
    try {
      const data = await authService.socialLogin({
        accessToken: socialAccessToken,
        provider: provider === 'kakao' ? 0 : 1
      })

      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)

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

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)

      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  function logout() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  // Initialize user on store creation
  if (accessToken.value) {
    fetchUser()
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    login,
    logout,
    fetchUser,
    refreshAccessToken
  }
})
