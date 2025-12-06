import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue')
  },
  {
    path: '/admin/layout-editor',
    name: 'layout-editor',
    component: () => import('../views/LayoutEditorView.vue')
  },
  {
    path: '/superadmin',
    name: 'superadmin',
    component: () => import('../views/SuperAdminView.vue')
  },
  {
    path: '/game/:type',
    name: 'game',
    component: () => import('../views/GameView.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
