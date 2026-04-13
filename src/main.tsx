import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'
import clarity from '@microsoft/clarity'

// Initialize Microsoft Clarity Analytics
clarity.init('waz4ejr21b')

// Register Service Worker
registerSW({
  immediate: true 
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
