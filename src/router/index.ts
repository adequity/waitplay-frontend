import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
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
    path: '/game/:type',
    name: 'game',
    component: () => import('../views/GameView.vue'),
    props: true
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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guard for authentication and authorization
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
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
      if (role !== 'superadmin') {
        console.warn('Access denied: Superadmin role required')
        next({ name: 'login' })
        return
      }
    }
  }

  next()
})

export default router
