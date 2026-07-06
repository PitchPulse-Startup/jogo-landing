// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Blog from './Blog.jsx'
import Media from './Media.jsx'
import Policy from './Policy.jsx'
import Terms from './Terms.jsx'
import Feedback from './Feedback.jsx'
import DeleteAccount from './DeleteAccount.jsx'
import Support from './Support.jsx'
import EmailVerified from './EmailVerified.jsx'
import AuthAction from './AuthAction.jsx'
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
        <Route path="/policy" element={<Policy onBackToMain={() => window.location.href = '/'} />} />
        <Route path="/terms" element={<Terms onBackToMain={() => window.location.href = '/'} />} />
        <Route path="/feedback" element={<Feedback onBackToMain={() => window.location.href = '/'} />} />
        <Route path="/delete-account" element={<DeleteAccount onBackToMain={() => window.location.href = '/'} />} />
        <Route path="/support" element={<Support onBackToMain={() => window.location.href = '/'} />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="/auth-action" element={<AuthAction />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)