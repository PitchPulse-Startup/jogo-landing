// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// --- ADD THESE TWO LINES ---
import faviconUrl from './assets/jogo-logo2.png'
document.querySelector('link[rel="icon"]').setAttribute('href', faviconUrl)
// -------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)