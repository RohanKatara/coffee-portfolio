import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import useSceneStore from '../../store/useSceneStore'

/**
 * Speech bubble overlay shown in the LANDING scene.
 * The character "speaks" and the user accepts a coffee to advance.
 */
export default function SpeechBubble() {
  const scene = useSceneStore((s) => s.scene)
  const setScene = useSceneStore((s) => s.setScene)
  const bubbleRef = useRef(null)
  const hasEntered = useRef(false)

  useEffect(() => {
    if (scene === 'LANDING' && bubbleRef.current && !hasEntered.current) {
      hasEntered.current = true
      gsap.fromTo(
        bubbleRef.current,
        { opacity: 0, y: 20, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: 0.8, ease: 'back.out(1.4)' },
      )
    }
    if (scene !== 'LANDING' && bubbleRef.current) {
      gsap.to(bubbleRef.current, { opacity: 0, y: -15, duration: 0.4, ease: 'power2.in' })
    }
  }, [scene])

  if (scene !== 'LANDING') return null

  const handleAccept = () => {
    setScene('MACHINE')
  }

  return (
    <div
      ref={bubbleRef}
      className="absolute bottom-[18%] left-1/2 -translate-x-1/2 z-40 opacity-0"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Bubble body */}
      <div
        className="relative bg-white rounded-2xl shadow-xl px-7 py-5 max-w-xs text-center"
        style={{
          border: '1.5px solid #e8d5b7',
          boxShadow: '0 8px 32px rgba(61,43,31,0.12)',
        }}
      >
        {/* Tail pointing down */}
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45"
          style={{ border: '1.5px solid #e8d5b7', borderTop: 'none', borderLeft: 'none' }}
        />

        <p className="font-serif text-[#3d2b1f] text-lg leading-snug mb-4">
          ☕ Welcome! Can I get you<br />
          <span className="font-semibold">a coffee?</span>
        </p>

        <button
          onClick={handleAccept}
          className="
            bg-[#8b5e3c] hover:bg-[#6f4e37] active:scale-95
            text-white font-serif text-sm px-6 py-2.5 rounded-full
            transition-all duration-150 shadow-md
          "
        >
          Yes, please! ✨
        </button>
      </div>
    </div>
  )
}
