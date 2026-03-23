import { Component } from 'react'
import { createPortal } from 'react-dom'

// Module-level counter so multiple simultaneous error overlays stack
// vertically instead of sitting on top of each other.
let _overlayCount = 0

/**
 * Catches errors thrown by failed GLB loads (404s, Draco failures, etc.)
 * and renders:
 *   1. A fixed red overlay on screen showing error.name + error.message
 *      (visible on any device without needing devtools).
 *   2. console.error for vConsole / Remote Web Inspector.
 */
export default class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this._overlayIndex = _overlayCount++
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error(
      '[ModelErrorBoundary] Model failed to load:',
      error.name,
      error.message,
      info?.componentStack ?? '',
    )
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state
      const TOP_OFFSET = 10 + this._overlayIndex * 120  // stack overlays

      const overlay = (
        <div
          style={{
            position:     'fixed',
            top:          `${TOP_OFFSET}px`,
            left:         '8px',
            right:        '8px',
            background:   'rgba(200,0,0,0.95)',
            color:        '#fff',
            padding:      '10px 14px',
            fontFamily:   'monospace',
            fontSize:     '13px',
            lineHeight:   '1.5',
            borderRadius: '6px',
            zIndex:       99999,
            wordBreak:    'break-all',
            pointerEvents:'none',
            boxShadow:    '0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            ❌ ModelErrorBoundary — {error?.name ?? 'Error'}
          </div>
          <div>{error?.message ?? 'Unknown error'}</div>
        </div>
      )

      // createPortal renders the overlay directly on document.body,
      // completely outside the Canvas / React-Three-Fiber tree, so it
      // appears on screen regardless of camera position or scene state.
      return createPortal(overlay, document.body)
    }

    return this.props.children
  }
}
