/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase設定
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;

  // アプリケーション設定
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_DESCRIPTION: string;

  // 開発環境設定
  readonly VITE_DEV_SERVER_PORT: string;
  readonly VITE_DEV_SERVER_HOST: string;

  // 本番環境設定
  readonly VITE_PRODUCTION_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 