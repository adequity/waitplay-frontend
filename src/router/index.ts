import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/customer',
    name: 'customer',
    component: () => import('../views/CustomerView.vue')
  },
  {
    path: '/support',
    name: 'support',
    component: () => import('../components/CustomerSupportTab.vue'),
    meta: { requiresAuth: true }
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
      if (authStore.user?.userRole !== 'admin') {
        console.warn('[Router] Access denied: Admin role required')
        next({ name: 'home' })
        return
      }
    }

    // Check superadmin role requirement
    if (to.meta.requiresSuperAdmin && authStore.user?.userRole !== 'superadmin') {
      console.warn('Access denied: Superadmin role required')
      next({ name: 'home' })
      return
    }
  }

  next()
})

export default router
