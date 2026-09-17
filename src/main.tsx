import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/app.css'
import './styles/tokens.css'
import './styles/portal.css'
import './styles/doc.css'
import './styles/canvas.css'
import './styles/sections.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
