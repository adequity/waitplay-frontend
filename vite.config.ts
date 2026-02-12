import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from 'vite-plugin-wasm'
import path from 'path'

/**
 * ✅ 커스텀 플러그인: Vite 프리로드 헬퍼를 별도 청크로 분리
 * 문제: Vite의 __vitePreload 헬퍼가 게임 청크에 포함되어 모든 동적 import가 게임 번들을 로드함
 * 해결: 프리로드 헬퍼를 index.js에 인라인하여 게임 청크 의존성 제거
 */
function vitePreloadInlinePlugin(): Plugin {
  return {
    name: 'vite-preload-inline',
    enforce: 'post',
    generateBundle(_, bundle) {
      // 모든 JS 번들에서 game-core import를 제거하고 헬퍼를 인라인
      for (const fileName of Object.keys(bundle)) {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk' && fileName.includes('index-')) {
          // index 청크에서 game-core import 및 vendor-phaser import 제거
          // 그리고 필요한 헬퍼 함수만 인라인
          let code = chunk.code;

          // game-core에서 _ 만 import하고 vendor-phaser를 직접 import하는 패턴 감지
          // import{_ as i}from"./game-core-XXX.js";import"./vendor-phaser-XXX.js";
          const gameImportPattern = /import\{_ as ([a-z])\}from"\.\/game-core-[^"]+\.js";import"\.\/vendor-phaser-[^"]+\.js";/;
          const match = code.match(gameImportPattern);

          if (match) {
            const helperVar = match[1];

            // 간단한 동적 import 래퍼 (Vite 프리로드 헬퍼의 단순화 버전)
            // CSS 프리로드 없이 순수 동적 import만 수행
            const inlineHelper = `const ${helperVar}=(e,t,n)=>e();`;

            // 원래 import 문을 인라인 헬퍼로 교체
            code = code.replace(gameImportPattern, inlineHelper);
            chunk.code = code;
          }
        }
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    wasm(),
    vitePreloadInlinePlugin()
    // ❌ topLevelAwait 플러그인 제거 - 게임 번들을 index.js에 번들링하는 원인
    // 대신 빌드 타겟을 esnext로 설정하여 네이티브 TLA 사용
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // ✅ 최신 브라우저 타겟으로 네이티브 top-level await 사용
    target: 'esnext',
    // ✅ modulepreload 완전 비활성화
    modulePreload: false,
    // ✅ CSS 코드 분할 비활성화
    cssCodeSplit: false,
    // ✅ 더 강력한 minify (esbuild 기본값보다 terser가 더 작은 결과)
    minify: 'esbuild',
    // ✅ CSS minify 최적화
    cssMinify: 'esbuild',
    rollupOptions: {
      // ✅ 게임 관련 모듈을 완전히 분리하기 위한 외부 진입점 설정
      // Phaser/Pixi 게임은 /game 라우트에서만 필요
      output: {
        // Vite 헬퍼 함수를 별도 청크로 분리
        chunkFileNames: 'assets/[name]-[hash].js',
        // ✅ 청크 분리 최적화 - 순서가 중요함 (먼저 매칭되는 규칙이 적용됨)
        manualChunks: (id) => {
          // 1. Vue/Pinia 코어 - 가장 먼저 분리 (모든 청크가 공유)
          if (id.includes('node_modules/vue') ||
              id.includes('node_modules/@vue') ||
              id.includes('node_modules/pinia')) {
            return 'vendor-vue';
          }
          // 2. Vue Router - 별도 분리
          if (id.includes('node_modules/vue-router')) {
            return 'vendor-router';
          }
          // 3. Axios - 공통 HTTP 클라이언트 (게임과 앱에서 공유)
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }
          // 4. Phaser 게임 엔진
          if (id.includes('node_modules/phaser')) {
            return 'vendor-phaser';
          }
          // 5. Pixi.js (핀볼 게임용)
          if (id.includes('node_modules/pixi') || id.includes('node_modules/@pixi')) {
            return 'vendor-pixi';
          }
          // 6. Rapier 물리 엔진 (핀볼 게임용)
          if (id.includes('node_modules/@dimforge/rapier')) {
            return 'vendor-rapier';
          }
          // 7. GameManager와 게임 설정 - 모든 게임에서 공유하지만 게임 전용 청크로 분리
          if (id.includes('/game/GameManager') || id.includes('/game/config')) {
            return 'game-core';
          }
          // 8. 게임 Scene 파일들 (Phaser 기반) - 각 씬별로 별도 청크
          if (id.includes('/game/scenes/')) {
            const sceneName = id.split('/game/scenes/')[1]?.split('.')[0]?.toLowerCase();
            if (sceneName) {
              return `game-${sceneName}`;
            }
          }
          // 9. 핀볼 게임 모듈 (Pixi.js 기반)
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
