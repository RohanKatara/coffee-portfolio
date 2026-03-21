import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gsap } from 'gsap'
import { CSSPlugin } from 'gsap/CSSPlugin'
import './index.css'
import App from './App.jsx'

gsap.registerPlugin(CSSPlugin)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)