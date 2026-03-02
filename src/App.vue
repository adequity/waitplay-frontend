<template>
  <div id="app" :class="{ 'app-framed': !isAdminRoute }">
    <template v-if="!isAdminRoute">
      <div class="app-sidebar app-sidebar-left">
        <SidebarAd position="left" />
      </div>
      <div class="app-mobile-frame">
        <router-view />
      </div>
      <div class="app-sidebar app-sidebar-right">
        <SidebarAd position="right" />
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import SidebarAd from './components/SidebarAd.vue'

const route = useRoute()
const authStore = useAuthStore()

const isAdminRoute = computed(() => {
  const path = route.path
  return path.startsWith('/admin') ||
    path.startsWith('/superadmin') ||
    path.startsWith('/masteradmin')
})

onMounted(() => {
  if (authStore.accessToken) {
    authStore.fetchUser()
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #ffffff;
  color: #1e293b;
}

#app {
  min-height: 100vh;
}

/* PC mobile frame layout */
#app.app-framed {
  display: flex;
  justify-content: center;
  min-height: 100vh;
}

.app-mobile-frame {
  width: 100%;
  max-width: 480px;
  min-height: 100vh;
  position: relative;
  background: #ffffff;
}

.app-sidebar {
  flex: 1;
  min-width: 0;
  display: none;
  background: #f8fafc;
}

/* PC: show sidebars */
@media (min-width: 481px) {
  body {
    background-color: #f1f5f9;
  }

  .app-mobile-frame {
    box-shadow: -1px 0 0 #e2e8f0, 1px 0 0 #e2e8f0;
  }

  .app-sidebar {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }
}

@media (min-width: 1024px) {
  .app-sidebar {
    min-width: 200px;
  }
}
</style>
