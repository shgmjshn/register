/**
 * Supabaseデータベース接続管理モジュール
 * 
 * このファイルは以下の機能を提供します：
 * 1. Supabaseクライアントの初期化と設定
 * 2. データベース接続の管理
 * 3. エラーハンドリング機能
 * 
 * 環境変数：
 * - VITE_SUPABASE_URL: SupabaseプロジェクトのURL
 * - VITE_SUPABASE_ANON_KEY: Supabaseの匿名キー
 */

// Supabaseクライアントライブラリをインポート
import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabaseの設定を取得
// これらの値は.envファイルで設定する必要があります
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// デバッグ用：環境変数が正しく設定されているか確認
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey);

// 環境変数が設定されていない場合はエラーをスロー
// アプリケーションの起動時に必要な設定が行われているか確認します
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabaseの環境変数が設定されていません。');
}

// Supabaseクライアントのインスタンスを作成してエクスポート
// このインスタンスはアプリケーション全体で共有されます
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// エラーハンドリング用のヘルパー関数
// データベース操作で発生するエラーをユーザーフレンドリーなメッセージに変換します
export const handleSupabaseError = (error: any) => {
  console.error('Supabaseエラー:', error);
  
  // データベース構造に関するエラー
  if (error.code === '42703') {
    return 'データベースの構造が正しく設定されていません。管理者に連絡してください。';
  }
  
  // テーブルが存在しない場合のエラー
  if (error.code === '42P01') {
    return 'テーブルが存在しません。管理者に連絡してください。';
  }
  
  // その他のエラー
  return '操作に失敗しました。もう一度お試しください。';
}; 