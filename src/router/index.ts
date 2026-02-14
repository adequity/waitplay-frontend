import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// ✅ Lazy import to avoid circular dependency and speed up initial load
// auth store는 인증이 필요한 라우트에서만 동적으로 로드됨
let authStoreInstance: ReturnType<typeof import('@/stores/auth').useAuthStore> | null = null

const getAuthStore = async () => {
  if (!authStoreInstance) {
    const { useAuthStore } = await import('@/stores/auth')
    authStoreInstance = useAuthStore()
  }
  return authStoreInstance
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    // 짧은 공유 URL - 백엔드 OG 태그 페이지로 리다이렉트
    // /s/MSCJ7ENA → api.waitplay.co.kr/api/ogimage/share/MSCJ7ENA
    path: '/s/:code',
    name: 'share-redirect',
    beforeEnter: (to) => {
      const code = to.params.code as string
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.waitplay.co.kr'
      window.location.href = `${apiUrl}/api/ogimage/share/${code}`
      return false // 라우터 네비게이션 중단
    },
    component: { template: '<div>Redirecting...</div>' }
  },
  {
    path: '/customer',
    name: 'customer',
    component: () => import('../views/CustomerView.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/layout-editor',
    name: 'layout-editor',
    component: () => import('../views/LayoutEditorView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/verify-coupon',
    name: 'verify-coupon',
    component: () => import('../components/CouponVerificationView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/superadmin',
    name: 'superadmin',
    component: () => import('../views/SuperAdminView.vue'),
    meta: { requiresAuth: true, requiresSuperAdmin: true }
  },
  {
    path: '/masteradmin',
    name: 'masteradmin',
    component: () => import('../views/MasterAdminView.vue'),
    meta: { requiresAuth: true, requiresMasterAdmin: true }
  },
  {
    path: '/game/:type',
    name: 'game',
    component: () => import('../views/GameView.vue'),
    props: true
  },
  {
    path: '/guestbook',
    name: 'guestbook',
    component: () => import('../views/GuestbookFullView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/SignupView.vue')
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/ForgotPasswordView.vue')
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('../views/PrivacyPolicyView.vue')
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('../views/TermsOfServiceView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guard for authentication and authorization
// ✅ 인증이 필요 없는 라우트는 auth store를 로드하지 않음 (성능 최적화)
router.beforeEach(async (to, _from, next) => {
  // 인증이 필요 없는 라우트는 바로 통과
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // 인증이 필요한 경우에만 auth store 로드
  const authStore = await getAuthStore()

  // If not authenticated, redirect to login
  if (!authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Ensure user data is loaded
  if (!authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      console.error('Failed to fetch user:', error)
      authStore.logout()
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }

  // Check admin role requirement
  if (to.meta.requiresAdmin) {
    const role = authStore.userRole || authStore.user?.userRole
    if (role !== 'admin' && role !== 'company') {
      console.warn('[Router] Access denied: Admin role required')
      next({ name: 'login' })
      return
    }
  }

  // Check superadmin role requirement
  if (to.meta.requiresSuperAdmin) {
    const role = authStore.userRole || authStore.user?.userRole
    if (role !== 'superadmin' && role !== 'masteradmin') {
      console.warn('Access denied: Superadmin role required')
      next({ name: 'login' })
      return
    }
  }

  // Check masteradmin role requirement
  if (to.meta.requiresMasterAdmin) {
    const role = authStore.userRole || authStore.user?.userRole
    if (role !== 'masteradmin') {
      console.warn('Access denied: MasterAdmin role required')
      next({ name: 'login' })
      return
    }
  }

  next()
})

export default router
