import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

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
          <iframe
            src="/automate-pro-player.html"
            allow="autoplay"
            title="Automate Pro Demo Player"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
          />
        </div>,
        document.body,
      )}
    </>
  )
}
