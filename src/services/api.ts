import axios, { type AxiosInstance, type AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor (HttpOnly 쿠키가 자동 전송되므로 헤더 주입 불필요)
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Flag to prevent multiple refresh attempts
let isRefreshing = false

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config

    // Skip refresh logic for auth endpoints to prevent infinite loops
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/refresh') ||
                           originalRequest?.url?.includes('/auth/me') ||
                           originalRequest?.url?.includes('/auth/standard-login') ||
                           originalRequest?.url?.includes('/auth/login') ||
                           originalRequest?.url?.includes('/auth/signup')

    // If 401 on auth endpoint, logout and only redirect if on protected page
    if (error.response?.status === 401 && isAuthEndpoint) {
      const authStore = useAuthStore()
      authStore.logout()

      // Only redirect to login if on a protected page (not customer/game pages)
      const currentPath = window.location.pathname
      const publicPaths = ['/customer', '/game', '/login', '/signup', '/forgot-password']
      const isPublicPage = publicPaths.some(path => currentPath.startsWith(path))

      if (!isPublicPage) {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    // If 401, not an auth endpoint, not already retrying, and not currently refreshing
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      originalRequest._retry = true
      isRefreshing = true

      try {
        const authStore = useAuthStore()
        const refreshed = await authStore.refreshAccessToken()

        if (refreshed) {
          // 쿠키가 자동 갱신되므로 헤더 설정 불필요
          return apiClient(originalRequest)
        } else {
          // Refresh failed, only redirect if on a protected page
          const currentPath = window.location.pathname
          const publicPaths = ['/customer', '/game', '/login', '/signup', '/forgot-password']
          const isPublicPage = publicPaths.some(path => currentPath.startsWith(path))

          if (!isPublicPage) {
            window.location.href = '/login'
          }
        }
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

// Type augmentation for retry flag
declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean
  }
}
