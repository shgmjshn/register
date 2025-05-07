/**
 * Viteビルド設定ファイル
 * 
 * このファイルは以下の機能を提供します：
 * 1. ビルド設定の定義
 * 2. プラグインの設定
 * 3. 環境変数の管理
 * 4. PWA（Progressive Web App）の設定
 */

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Viteの設定を定義
// 環境変数に基づいて動的に設定を変更できます
export default defineConfig(({ mode }) => {
  // 環境変数を読み込む
  // 開発環境と本番環境で異なる設定を適用できます
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // プラグインの設定
    // ReactとPWAの機能を有効化します
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'icon-192x192.png', 'icon-512x512.png'],
        manifest: {
          name: 'Register App',
          short_name: 'Register',
          description: 'シンプルなレジアプリ',
          theme_color: '#4F46E5',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    
    // CSSの設定
    // PostCSSを使用してCSSの処理を行います
    css: {
      // PostCSSの設定ファイルを指定
      postcss: './postcss.config.js',
    },
    
    // 環境変数の設定
    // クライアントサイドで環境変数を使用できるようにします
    define: {
      'process.env': env
    }
  };
}); 