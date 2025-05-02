// Reactのインポート
import React from 'react'
// ReactDOMのインポート
import ReactDOM from 'react-dom/client'
// メインのアプリケーションコンポーネント
import { App } from './App'
// グローバルスタイルのインポート
import './index.css'

// Reactアプリケーションのレンダリング
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 