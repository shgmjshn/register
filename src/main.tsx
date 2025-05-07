/**
 * アプリケーションのエントリーポイント
 * 
 * このファイルは以下の機能を提供します：
 * 1. Reactアプリケーションの初期化
 * 2. メインコンポーネントのレンダリング
 * 3. グローバルスタイルの適用
 */

// Reactのインポート
import React from 'react'
// ReactDOMのインポート
import ReactDOM from 'react-dom/client'
// メインのアプリケーションコンポーネント
import { App } from './App'
// グローバルスタイルのインポート
import './index.css'

// Reactアプリケーションのレンダリング
// StrictModeを使用して開発時の潜在的な問題を検出
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 