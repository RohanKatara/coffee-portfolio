import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import useSceneStore from '../../store/useSceneStore'

/**
 * Floating back button shown in the CUP scene.
 * Returns the user to the MACHINE scene to pick another project.
 */
export default function BackButton() {
  const scene = useSceneStore((s) => s.scene)
  const goBackToMachine = useSceneStore((s) => s.goBackToMachine)
  const btnRef = useRef(null)

  useEffect(() => {
    if (scene === 'CUP' && btnRef.current) {
      gsap.fromTo(
        btnRef.current,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, delay: 1.2, ease: 'power2.out' },
      )
    } else if (btnRef.current) {
      gsap.to(btnRef.current, { opacity: 0, x: -10, duration: 0.25 })
    }
  }, [scene])

  if (scene !== 'CUP') return null

  return (
    <button
      ref={btnRef}
      onClick={goBackToMachine}
      className="
        absolute top-6 left-6 z-40 opacity-0
        flex items-center gap-2
        bg-white/80 hover:bg-white backdrop-blur-sm
        text-[#3d2b1f] font-serif text-sm
        px-4 py-2 rounded-full shadow-md
        transition-all duration-150 hover:shadow-lg active:scale-95
      "
      style={{ border: '1px solid #e8d5b7' }}
    >
      ← Back to menu
    </button>
  )
}
