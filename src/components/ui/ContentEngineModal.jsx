import { useEffect } from 'react'

export default function ContentEngineModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    const msgHandler = (e) => { if (e.data === 'closeModal') onClose() }
    window.addEventListener('keydown', handler)
    window.addEventListener('message', msgHandler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('message', msgHandler)
    }
  }, [onClose])

  return (
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
        animation: 'ceFadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes ceFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ceSlideUp {
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
          animation: 'ceSlideUp 0.3s ease',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src="/content-engine-case-study.html"
          title="AI Content Multiplier Case Study"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}
