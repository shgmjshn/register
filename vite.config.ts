import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Viteの設定を定義
export default defineConfig(({ mode }) => {
  // 環境変数を読み込む
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // Reactプラグインを有効化
    plugins: [react()],
    
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