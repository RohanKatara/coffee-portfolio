import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getIsMobile } from '../../hooks/useBreakpoint'

export default function CRMModal({ onClose }) {
  const [demoOpen, setDemoOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (demoOpen) setDemoOpen(false)
        else onClose()
      }
    }
    const msgHandler = (e) => {
      if (e.data === 'closeModal')      onClose()
      if (e.data === 'openDemoPlayer')  setDemoOpen(true)
      if (e.data === 'closeDemoPlayer') setDemoOpen(false)
    }
    window.addEventListener('keydown', handler)
    window.addEventListener('message', msgHandler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('message', msgHandler)
    }
  }, [onClose, demoOpen])

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          animation: 'crmFadeIn 0.25s ease',
        }}
        onClick={onClose}
      >
        <style>{`
          @keyframes crmFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes crmSlideUp {
            from { opacity: 0; transform: translateY(24px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0)    scale(1);    }
          }
        `}</style>

        <div
          style={{
            position: 'relative',
            width: '92vw',
            height: '90vh',
            maxWidth: '1200px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            animation: 'crmSlideUp 0.3s ease',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            src="/crm-case-study.html"
            title="Automate Pro: AI Lead Gatekeeper"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* ── Demo player overlay — portalled above everything ── */}
      {demoOpen && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1002,
            background: '#000',
          }}
        >
          {getIsMobile() ? (
            <video
              src="/automate-pro-demo/automate%20pro%20demo.mp4"
              controls
              autoPlay
              playsInline
              title="Automate Pro Demo"
              style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#000',
              }}
            />
          ) : (
            <iframe
              src="/automate-pro-demo/index.html"
              allow="autoplay"
              title="Automate Pro Demo Player"
              style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
            />
          )}
          {/* Close button — sits above the iframe */}
          <button
            onClick={() => setDemoOpen(false)}
            style={{
              position: 'fixed',
              top: 14,
              right: 16,
              zIndex: 20,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '1.05rem',
              cursor: 'pointer',
            }}
            aria-label="Close demo"
          >
            &#10005;
          </button>
        </div>,
        document.body,
      )}
    </>
  )
}
