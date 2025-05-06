import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Viteの設定を定義
export default defineConfig(({ mode }) => {
  // 環境変数を読み込む
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // Reactプラグインを有効化
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
          icons: [
            {
              src: 'icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    
    // CSSの設定
    css: {
      // PostCSSの設定ファイルを指定
      postcss: './postcss.config.js',
    },
    
    // 環境変数をクライアントサイドで使用可能にする
    define: {
      'process.env': env
    }
  };
}); 