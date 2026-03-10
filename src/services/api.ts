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

// Token refresh state
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve()
    }
  })
  failedQueue = []
}

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config

    // Skip refresh logic for auth endpoints to prevent infinite loops
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/refresh') ||
                           originalRequest?.url?.includes('/auth/me') ||
                           originalRequest?.url?.includes('/auth/logout') ||
                           originalRequest?.url?.includes('/auth/standard-login') ||
                           originalRequest?.url?.includes('/auth/login') ||
                           originalRequest?.url?.includes('/auth/signup')

    // If 401 on auth endpoint, just reject (no refresh attempt, no logout loop)
    if (error.response?.status === 401 && isAuthEndpoint) {
      return Promise.reject(error)
    }

    // If 401, not an auth endpoint, not already retrying
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const authStore = useAuthStore()
        const refreshed = await authStore.refreshAccessToken()

        if (refreshed) {
          // 쿠키가 자동 갱신됨 — 큐에 대기 중인 요청 재시도
          processQueue(null)
          return apiClient(originalRequest)
        } else {
          processQueue(new Error('Token refresh failed'))
          // Refresh failed, only redirect if on a protected page
          const currentPath = window.location.pathname
          const publicPaths = ['/customer', '/game', '/login', '/signup', '/forgot-password']
          const isPublicPage = publicPaths.some(path => currentPath.startsWith(path))

          if (!isPublicPage) {
            window.location.href = '/login'
          }
        }
      } catch (refreshError) {
        processQueue(refreshError)
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
