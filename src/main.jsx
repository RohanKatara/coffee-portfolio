import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gsap } from 'gsap'
import { CSSPlugin } from 'gsap/CSSPlugin'
import './index.css'
import App from './App.jsx'

// CSSPlugin handles opacity / transform / etc. on DOM elements.
// Must be registered explicitly when bundling with Vite (tree-shaking
// can strip the auto-registration that happens in the gsap UMD build).
gsap.registerPlugin(CSSPlugin)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
