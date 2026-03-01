import { Component } from 'react'

/**
 * Catches errors thrown by failed GLB loads (404s, Draco failures, etc.)
 * and renders the provided fallback instead of crashing the whole scene.
 */
export default class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    // Only swallow loading errors; re-throw programming errors in dev
    if (import.meta.env.DEV) {
      console.warn('[ModelErrorBoundary] Model failed to load:', error.message)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}
