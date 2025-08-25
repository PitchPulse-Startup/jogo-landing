// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Blog from './Blog.jsx'
import Media from './Media.jsx'
import './index.css'

// --- ADD THESE TWO LINES ---
import faviconUrl from './assets/jogo-logo2.png'
document.querySelector('link[rel="icon"]').setAttribute('href', faviconUrl)
// -------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/blog" element={<Blog onBackToMain={() => window.location.href = '/'} />} />
        <Route path="/media" element={<Media onBackToMain={() => window.location.href = '/'} />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)