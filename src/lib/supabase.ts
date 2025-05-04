// Supabaseクライアントライブラリをインポート
import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabaseの設定を取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// デバッグ用：環境変数が正しく設定されているか確認
if (import.meta.env.DEV) {
  console.log('Supabase URL:', supabaseUrl);
}

// 環境変数が設定されていない場合はエラーをスロー
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabaseの環境変数が設定されていません。');
}

// Supabaseクライアントのインスタンスを作成してエクスポート
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// エラーハンドリング用のヘルパー関数
export const handleSupabaseError = (error: any) => {
  console.error('Supabaseエラー:', error);
  
  if (error.code === '42703') {
    return 'データベースの構造が正しく設定されていません。管理者に連絡してください。';
  }
  
  if (error.code === '42P01') {
    return 'テーブルが存在しません。管理者に連絡してください。';
  }
  
  return '操作に失敗しました。もう一度お試しください。';
}; 