import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    wasm(),
    topLevelAwait()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // ✅ modulepreload 비활성화 - 게임 번들이 index.html에서 preload되는 것 방지
    // 게임 청크는 실제로 게임 페이지 접속 시에만 로드되어야 함
    modulePreload: false,
    rollupOptions: {
      output: {
        // 게임 관련 라이브러리를 별도 청크로 분리 (초기 로드 최적화)
        manualChunks: (id) => {
          // Phaser 게임 엔진
          if (id.includes('node_modules/phaser')) {
            return 'vendor-phaser';
          }
          // Pixi.js (핀볼 게임용)
          if (id.includes('node_modules/pixi') || id.includes('node_modules/@pixi')) {
            return 'vendor-pixi';
          }
          // Rapier 물리 엔진 (핀볼 게임용)
          if (id.includes('node_modules/@dimforge/rapier')) {
            return 'vendor-rapier';
          }
          // 게임 Scene 파일들
          if (id.includes('/game/scenes/')) {
            const sceneName = id.split('/game/scenes/')[1]?.split('.')[0]?.toLowerCase();
            if (sceneName) {
              return `game-${sceneName}`;
            }
          }
          // 핀볼 게임 모듈
          if (id.includes('/game/pinball/')) {
            return 'game-pinball';
          }
        }
      }
    },
    // 청크 크기 경고 임계값 (게임 라이브러리는 별도 청크로 분리됨)
    chunkSizeWarningLimit: 600
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 4173,
    strictPort: false,
    allowedHosts: [
      'waitplay-frontend-production-77e5.up.railway.app',
      '.up.railway.app',
      'waitplay.co.kr',
      'www.waitplay.co.kr'
    ]
  }
})
