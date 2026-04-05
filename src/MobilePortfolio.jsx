import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import './mobile.css'
import MocktalkModal from './components/ui/MocktalkModal'
import KrishnaModal from './components/ui/KrishnaModal'
import CRMModal from './components/ui/CRMModal'
import ContentEngineModal from './components/ui/ContentEngineModal'

const PROJECTS = [
  {
    title: 'MockTalk',
    tag: 'Generative AI',
    tagColor: '#4cd7f6',
    tagBg: 'rgba(76,215,246,0.1)',
    tagBorder: 'rgba(76,215,246,0.2)',
    desc: 'A high-intensity behavioral interview simulator powered by low-latency neural processing. Real-time feedback loops for professional growth.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCXpd1DVCXx7ek92AsiIi-KK58y_Ejb1l0W6Mhca30QdGWU-6_-36f474fsNLDN6ERqDAVPJL8D0Lx1z8DyrnWSP-ZmRg0x4hCeNEQsHlkDHT0eS0Vp6yJfi1J6DnaW-KwOkQs0ETjtWxT-POrwgH-zGzReetZ1lfSe_W-ngoOOaXF_Wlp26RzQF6arJY_O0caEpI3IyfNm3ppxPC2F4Yj3e5p6Q9mbZ_LgYnf9fi2Ik4iHMt9EBxtDkpJoIaPZUPMdyKtILuZSD4',
    alt: 'MockTalk AI Behavioral Interview Simulator by Rohan Katara — real-time feedback dashboard',
  },
  {
    title: 'Krishna.AI',
    tag: 'AI Architecture',
    tagColor: '#d0bcff',
    tagBg: 'rgba(208,188,255,0.1)',
    tagBorder: 'rgba(208,188,255,0.2)',
    desc: 'Ancient wisdom for modern problems. A digital space for reflection and ethical alignment through specialized Large Language Models.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIBTadpuLNymDrkLRfnRipa7HW8H-8w5c5iioQVCIL0V55lk_Qh-YdU-0oHHMRHrMprwFG5xAXlJ1HLwdZA8RlU0X8YkyazKCv2X7GzsjQKGDLX-1w9M0Biht4PZyyO-gARIIx_-6cAkwBzxZ9npfIrfOSQbfSqbkT3jFbrKvIl97hAFcVmyW1HCsgHHqeNqLxe3w0y0c7af6KNq5iBuQOpqsg_kqk-REKcpEU2GUCA23WhontnjUA0KL4DgejXGN5LZR7D7TNNng',
    alt: 'Krishna.AI — LLM-powered spiritual guidance and ethical alignment interface by Rohan Katara',
  },
  {
    title: 'Automate Pro',
    tag: 'AI Automation',
    tagColor: '#4cd7f6',
    tagBg: 'rgba(76,215,246,0.1)',
    tagBorder: 'rgba(76,215,246,0.2)',
    desc: 'An automated pipeline using n8n and Gemini 2.5 Flash to instantly score, qualify, and route agency leads — saving 20+ hours a week.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADVHaWwUd22eXt1ILGfRr7yulfkwlwOVQr5gDHPQtfPkW6WobdIVbJclm58A0S0aFgwLW4ZgefKoGZCQIJmll5yW9-KylyjCALWNohItL-JIxlmCKK3MfB8Z4x3sngmV_7VXDtOfWhkPLr7ollvLp4SJyjxjlvaJuZ9s02x8SWa3BCTk43wLYuMOg7qVEeCnkxvF0nmazfzIEr3ccitfubhCiGIoBWvwKX2PDZMwOpsyquewOlsy0ftkMfW-E43vy6SBBOuluNzx8',
    alt: 'Automate Pro AI Lead Gatekeeper — automated lead scoring and routing pipeline by Rohan Katara',
  },
  {
    title: 'Content Bot',
    tag: 'Generative AI',
    tagColor: '#d0bcff',
    tagBg: 'rgba(208,188,255,0.1)',
    tagBorder: 'rgba(208,188,255,0.2)',
    desc: 'A fully automated content generation and distribution pipeline leveraging LLMs to scale digital presence.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy2QWfN4ciZ_0Z8W-MsPZeLmxeSnd88loPR942dEm-pptI0aYy2ms80Fs8XT9NrnTh09o7vOhLaMrDjq8r-oSNuII_nCRCxQGFZdmhjhPm95zPa8gAKtIx2W5cz4Q53lYDDNfVaHVE3hvGse0ZR1sMzWV4dhbv68IuYfmwCDwRP4bxlhaZR96Beo5baGaJVIua45iOsiDoU9lVHpEpVF-zAcO9NKFGfdSKrMUoN5eVByObmTauQw2zJ6c74GGl_jyUfgnPSpeSHgo',
    alt: 'Content Bot Generative AI Automated Content Pipeline Dashboard — LLM content distribution by Rohan Katara',
  },
]

const TERMINAL_ITEMS = [
  {
    cmd: 'open /about_rohan',
    content: (
      <p style={{ lineHeight: '1.75', color: 'rgba(209,213,219,1)', fontSize: '0.875rem', margin: 0 }}>
        Hey! I&apos;m <span className="font-bold" style={{ color: '#4cd7f6' }}>Rohan Katara</span> an
        engineer focused on bridging the gap between high performance computing and intuitive
        human centric interfaces. I firmly believe the web was never meant to be a stack of static,
        boring documents. It&apos;s a living, breathing canvas.
      </p>
    ),
  },
  {
    cmd: 'open /what_i_build',
    content: (
      <p style={{ lineHeight: '1.75', color: 'rgba(209,213,219,1)', fontSize: '0.875rem', margin: 0 }}>
        My true passion lies in the intersection of engineering and creativity whether that means
        architecting immersive web environments, exploring the latest in low latency neural
        processing, or building tools that feel as responsive as biological reflexes.
      </p>
    ),
  },
  {
    cmd: 'open /off_the_clock',
    content: (
      <p style={{ lineHeight: '1.75', color: 'rgba(209,213,219,1)', fontSize: '0.875rem', margin: 0 }}>
        When I am not obsessively tweaking the grind size of my morning espresso to hit that perfect
        1:2 ratio, you&apos;ll find me deploying code. And if the deployment pipeline is green,
        you&apos;ll likely catch me holding an angle in a Valorant match, applying the
        same tactical precision to the screen as I do to my architecture.
      </p>
    ),
  },
]

const PROJECT_IDS = ['mocktalk', 'krishna', 'crm', 'contentengine']

const NAV_LINKS = [
  { label: 'Home',    href: '#'        },
  { label: 'Bio',     href: '#bio'     },
  { label: 'Works',   href: '#works'   },
  { label: 'Contact', href: '#contact' },
]

export default function MobilePortfolio() {
  const [openTerminal, setOpenTerminal] = useState(null)
  const [activeProject, setActiveProject] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showDesktopNotice, setShowDesktopNotice] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowDesktopNotice(false), 7000)
    return () => clearTimeout(timer)
  }, [])

  // index.css locks overflow:hidden + height:100% on html/body/#root for the 3D
  // scene. Override with inline styles (higher specificity) to enable scrolling.
  useEffect(() => {
    const root = document.getElementById('root')
    const body = document.body
    const html = document.documentElement

    const prev = {
      rootOverflow: root?.style.overflow ?? '',
      rootHeight:   root?.style.height   ?? '',
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      htmlHeight:   html.style.height,
    }

    if (root) { root.style.overflow = 'auto'; root.style.height = 'auto' }
    body.style.overflow = 'auto'
    html.style.overflow = 'auto'
    html.style.height   = 'auto'

    return () => {
      if (root) { root.style.overflow = prev.rootOverflow; root.style.height = prev.rootHeight }
      body.style.overflow = prev.bodyOverflow
      html.style.overflow = prev.htmlOverflow
      html.style.height   = prev.htmlHeight
    }
  }, [])

  // Trigger entry animation when project cards scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          } else {
            entry.target.classList.remove('in-view')
          }
        })
      },
      { threshold: 0.2 },
    )
    document.querySelectorAll('.project-card').forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  function toggleTerminal(index) {
    setOpenTerminal((prev) => (prev === index ? null : index))
  }

  return (
    <div
      className="font-body"
      style={{
        backgroundColor: '#050505', color: '#e5e2e1', minHeight: '100vh', paddingBottom: '0', position: 'relative',
        backgroundImage: 'radial-gradient(ellipse at 15% 25%, rgba(6,182,212,0.045) 0%, transparent 50%), radial-gradient(ellipse at 85% 75%, rgba(124,58,237,0.045) 0%, transparent 50%), radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 100% 100%, 28px 28px',
      }}
    >
      {/* ── Desktop notice toast ── */}
      <AnimatePresence>
        {showDesktopNotice && (
          <motion.div
            key="desktop-notice"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none mt-4"
          >
            <div
              className="pointer-events-auto flex items-center gap-3 rounded-xl px-5 py-3"
              style={{
                background: 'rgba(0, 0, 0, 0.95)',
                border: '1px solid rgba(76, 215, 246, 0.15)',
                boxShadow: '0 0 20px rgba(76, 215, 246, 0.06), 0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <span
                className="text-sm"
                style={{ color: '#4cd7f6', textShadow: '0 0 10px rgba(6,182,212,0.4)' }}
              >
                &#9733;
              </span>
              <span className="text-sm font-medium" style={{ color: '#bcc9cd' }}>
                Tip: Visit this site on a PC to experience the full interactive 3D cafe!
              </span>
              <button
                onClick={() => setShowDesktopNotice(false)}
                className="ml-1 transition-colors text-xs leading-none"
                style={{ color: 'rgba(188, 201, 205, 0.4)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#4cd7f6')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(188, 201, 205, 0.4)')}
                aria-label="Dismiss"
              >
                &#10005;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Global ambient background (scrolls with content — no fixed compositing cost) ── */}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 w-full z-50 border-b border-white/5 flex justify-between items-center py-4"
        style={{ backgroundColor: 'rgba(19,19,19,0.97)', paddingLeft: '24px', paddingRight: '24px' }}
      >
        <div className="text-xl font-headline font-bold tracking-tighter" style={{ color: '#e5e2e1' }}>
          Portfolio
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8 items-center">
          {NAV_LINKS.map(({ label, href }, i) => (
            <a
              key={label}
              href={href}
              className="font-headline text-sm uppercase tracking-widest transition-colors duration-300"
              style={{ color: i === 0 ? '#4cd7f6' : '#bcc9cd' }}
            >
              {label}
            </a>
          ))}
        </nav>
        {/* Mobile hamburger */}
        <button
          className="md:hidden active:scale-95 transition-transform"
          style={{ color: '#4cd7f6' }}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </header>

      {/* ── Mobile Nav Drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.nav
              className="fixed top-0 right-0 bottom-0 z-40 flex flex-col"
              style={{
                width: '72vw',
                maxWidth: '300px',
                backgroundColor: 'rgba(13,13,13,0.98)',
                borderLeft: '1px solid rgba(255,255,255,0.07)',
                paddingTop: '80px',
                paddingLeft: '32px',
                paddingRight: '32px',
                paddingBottom: '40px',
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#4cd7f6', fontFamily: 'monospace' }}>
                  NAVIGATION
                </span>
              </div>
              <div
                style={{ height: '1px', backgroundColor: 'rgba(76,215,246,0.2)', marginBottom: '32px' }}
              />
              {NAV_LINKS.map(({ label, href }, i) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-headline, sans-serif)',
                    fontSize: '2rem',
                    fontWeight: '700',
                    letterSpacing: '-0.03em',
                    color: i === 0 ? '#4cd7f6' : '#e5e2e1',
                    marginBottom: '24px',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                >
                  {label}
                </a>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <main style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex flex-col gap-20 w-full">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center min-h-[100dvh] w-full overflow-hidden" style={{ paddingLeft: '24px', paddingRight: '24px' }}>

          {/* Center radial spotlight */}
          <div className="absolute inset-0 z-0" style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(6,182,212,0.08) 0%, rgba(124,58,237,0.05) 50%, transparent 100%)',
          }} />

          {/* Orb 1 — cyan top-left (static radial gradient, no blur filter) */}
          <div className="absolute z-0 rounded-full" style={{
            width: 320, height: 320, top: '5%', left: '-15%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)',
          }} />

          {/* Orb 2 — violet bottom-right */}
          <div className="absolute z-0 rounded-full" style={{
            width: 360, height: 360, bottom: '5%', right: '-15%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
          }} />

          {/* Orb 3 — small cyan accent, bottom-left */}
          <div className="absolute z-0 rounded-full" style={{
            width: 180, height: 180, bottom: '20%', left: '-5%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          }} />

          {/* Horizontal scan line — top */}
          <div className="absolute z-0 w-full" style={{
            top: '30%', height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(76,215,246,0.12) 30%, rgba(76,215,246,0.12) 70%, transparent 100%)',
          }} />
          {/* Horizontal scan line — bottom */}
          <div className="absolute z-0 w-full" style={{
            top: '70%', height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(208,188,255,0.1) 30%, rgba(208,188,255,0.1) 70%, transparent 100%)',
          }} />

          {/* ── Main content ── */}
          <div className="relative z-10 flex flex-col items-center w-full">

            {/* Terminal status line */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(76,215,246,0.6)', letterSpacing: '0.15em', marginBottom: '20px' }}
            >
              <span style={{ color: 'rgba(76,215,246,0.4)' }}>{'>'}</span>
              {' '}system.init<span style={{ color: '#4cd7f6' }}>()</span>
              <span style={{ display: 'inline-block', width: '8px', height: '13px', backgroundColor: '#4cd7f6', marginLeft: '4px', opacity: 0.8, verticalAlign: 'middle', animation: 'floatBob 1s step-end infinite' }} />
            </motion.div>

            {/* Availability pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="inline-flex items-center gap-2 rounded-full border"
              style={{ borderColor: 'rgba(76,215,246,0.3)', backgroundColor: 'rgba(76,215,246,0.05)', padding: '6px 16px', marginBottom: '28px' }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#4cd7f6' }} />
              <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.15em', color: '#4cd7f6', fontFamily: 'monospace' }}>
                AVAILABLE FOR NEW OPPORTUNITIES
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="font-headline font-bold tracking-tighter text-center neon-glow-cyan"
              style={{ fontSize: '3.5rem', lineHeight: 1.05, marginBottom: '16px' }}
            >
              Rohan Katara
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              style={{ fontSize: '1.1rem', color: '#bcc9cd', textAlign: 'center', marginBottom: '12px', opacity: 0.85 }}
            >
              Software Engineer &amp; AI Builder
            </motion.p>

            {/* Descriptor line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              style={{ fontFamily: 'monospace', fontSize: '12px', color: 'rgba(76,215,246,0.5)', marginBottom: '36px', letterSpacing: '0.05em' }}
            >
              // crafting AI-powered digital experiences
            </motion.p>

            {/* Tech stack chips */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}
            >
              {['React', 'Three.js', 'Python', 'GenAI', 'LLMs', 'Node.js'].map((tech, i) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.6 + i * 0.07 }}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    padding: '4px 12px',
                    borderRadius: '100px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    color: 'rgba(229,226,225,0.7)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {tech}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-12 z-10 flex flex-col items-center">
            <div className="w-px h-16" style={{ background: 'linear-gradient(to bottom, #4cd7f6, transparent)' }} />
          </div>
        </section>

        {/* ── Bio — Terminal Accordion ──────────────────────────────────────── */}
        <section className="relative w-full overflow-hidden" id="bio" style={{ contain: 'content' }}>
          {/* Bio section background */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(180deg, transparent 0%, rgba(6,182,212,0.03) 40%, rgba(124,58,237,0.03) 100%)',
          }} />
          {/* Cyan glow — left edge (radial gradient, no blur filter) */}
          <div style={{
            position: 'absolute', left: '-80px', top: '20%', width: '300px', height: '300px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none',
          }} />
          {/* Section label */}
          <div style={{
            position: 'absolute', top: '12px', right: '24px',
            fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em',
            color: 'rgba(76,215,246,0.25)', pointerEvents: 'none',
          }}>01 // BIO</div>
          {/* Scan line */}
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(76,215,246,0.06) 40%, rgba(76,215,246,0.06) 60%, transparent)',
          }} />

          <div className="relative max-w-5xl mx-auto w-full" style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '8px', paddingBottom: '8px' }}>
          <div className="flex flex-col md:flex-row gap-10 md:gap-12 items-start">
            <div className="w-full md:w-1/3 md:sticky md:top-32">
              <h2 className="font-headline text-4xl font-bold tracking-tighter mb-10">System_Bio</h2>
              <div className="h-1 w-12" style={{ backgroundColor: '#4cd7f6' }} />
            </div>

            <div className="w-full md:w-2/3 flex flex-col gap-3">
              {TERMINAL_ITEMS.map((item, i) => {
                const isActive = openTerminal === i
                return (
                  <div
                    key={i}
                    className="glass-card rounded-xl border transition-colors duration-300"
                    style={{
                      borderColor: isActive ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.05)',
                      boxShadow: isActive ? '0 0 20px rgba(6,182,212,0.1)' : 'none',
                    }}
                  >
                    <button
                      className="while-tap-spring w-full text-left flex items-center gap-3 font-mono text-sm md:text-base"
                      style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '16px', paddingBottom: '16px' }}
                      onClick={() => toggleTerminal(i)}
                    >
                      <span className="font-bold shrink-0" style={{ color: '#06b6d4' }}>{'>'}</span>
                      <span className="min-w-0 break-words" style={{ color: 'rgba(229,226,225,0.9)' }}>{item.cmd}</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.175, 0.885, 0.32, 1.1] }}
                          className="overflow-hidden"
                        >
                          <div style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '8px', paddingBottom: '24px' }}>
                            <div
                              style={{ height: '1px', width: '100%', marginBottom: '16px', backgroundColor: 'rgba(255,255,255,0.05)' }}
                            />
                            {item.content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
          </div>
        </section>

        {/* ── Selected Works — Horizontal Scroll Strip ─────────────────────── */}
        <section className="relative w-full flex flex-col pt-10 overflow-hidden" id="works" style={{ backgroundColor: 'rgba(10,10,10,0.6)', contain: 'content' }}>

          {/* Works background */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(180deg, rgba(124,58,237,0.04) 0%, transparent 50%, rgba(6,182,212,0.03) 100%)',
          }} />
          {/* Violet glow — right edge (radial gradient, no blur filter) */}
          <div style={{
            position: 'absolute', right: '-60px', top: '10%', width: '280px', height: '280px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none',
          }} />
          {/* Scan lines */}
          <div style={{
            position: 'absolute', top: '35%', left: 0, right: 0, height: '1px', pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(208,188,255,0.07) 40%, rgba(208,188,255,0.07) 60%, transparent)',
          }} />
          <div style={{
            position: 'absolute', top: '75%', left: 0, right: 0, height: '1px', pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(76,215,246,0.06) 40%, rgba(76,215,246,0.06) 60%, transparent)',
          }} />
          {/* Section label */}
          <div style={{
            position: 'absolute', top: '12px', right: '24px',
            fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em',
            color: 'rgba(208,188,255,0.25)', pointerEvents: 'none',
          }}>02 // WORKS</div>

          {/* Title wrapper */}
          <div style={{ position: 'relative', paddingLeft: '24px', paddingRight: '24px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '2.25rem', fontWeight: '700', letterSpacing: '-0.04em' }}>Selected Works</h2>
          </div>

          {/* Carousel */}
          <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-6 pb-24 [&::-webkit-scrollbar]:hidden" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
            {PROJECTS.map((project, i) => (
              <div
                key={i}
                className="project-card snap-center while-tap-spring project-card-glow group relative flex flex-col rounded-2xl overflow-hidden border border-white/5 transition-all duration-500 cursor-pointer"
                style={{ minWidth: '85vw', backgroundColor: '#1c1b1b', touchAction: 'manipulation' }}
                onClick={() => setActiveProject(PROJECT_IDS[i])}
              >
                <div
                  className="aspect-[3/4] md:aspect-video overflow-hidden"
                  style={{ backgroundColor: '#353534' }}
                >
                  <img
                    alt={project.alt}
                    className="project-card-image w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    src={project.img}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="flex flex-col gap-3" style={{ padding: '20px' }}>
                  <span
                    className="self-start px-3 py-1 rounded-full text-[10px] font-mono font-bold border"
                    style={{
                      color: project.tagColor,
                      backgroundColor: project.tagBg,
                      borderColor: project.tagBorder,
                    }}
                  >
                    {project.tag}
                  </span>
                  <h3 className="font-headline text-2xl font-bold tracking-tighter mt-1">{project.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-400 mt-3 mb-3">
                    {project.desc}
                  </p>
                  <button
                    className="mt-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-bold border transition-all duration-200 active:scale-95"
                    style={{
                      color: project.tagColor,
                      borderColor: project.tagBorder,
                      backgroundColor: project.tagBg,
                      touchAction: 'manipulation',
                    }}
                    onClick={(e) => { e.stopPropagation(); setActiveProject(PROJECT_IDS[i]) }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                    View Details
                  </button>
                </div>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ backgroundColor: `${project.tagColor}0D` }}
                />
              </div>
            ))}
            {/* Trailing spacer so last card doesn't snap flush to edge */}
            <div className="min-w-[5vw] shrink-0" />
          </div>
        </section>

        {/* ── Contact ──────────────────────────────────────────────────────── */}
        <section
          className="relative flex flex-col items-center justify-center text-center overflow-hidden"
          style={{ paddingTop: '64px', paddingBottom: '64px', paddingLeft: '24px', paddingRight: '24px', contain: 'content' }}
          id="contact"
        >
          {/* Contact background */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 90% 70% at 50% 60%, rgba(6,182,212,0.07) 0%, rgba(124,58,237,0.05) 50%, transparent 100%)',
          }} />
          {/* Large glow behind heading (radial gradient, no blur filter) */}
          <div style={{
            position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(76,215,246,0.05) 0%, transparent 70%)', pointerEvents: 'none',
          }} />
          {/* Scan lines */}
          <div style={{
            position: 'absolute', top: '25%', left: 0, right: 0, height: '1px', pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(76,215,246,0.08) 30%, rgba(76,215,246,0.08) 70%, transparent)',
          }} />
          <div style={{
            position: 'absolute', top: '80%', left: 0, right: 0, height: '1px', pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent, rgba(208,188,255,0.07) 30%, rgba(208,188,255,0.07) 70%, transparent)',
          }} />
          {/* Section label */}
          <div style={{
            position: 'absolute', top: '12px', right: '24px',
            fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em',
            color: 'rgba(76,215,246,0.25)', pointerEvents: 'none',
          }}>03 // CONTACT</div>

          <div className="relative flex flex-col items-center gap-6" style={{ marginTop: '0' }}>
            <h2 className="font-headline text-4xl font-bold tracking-tighter leading-tight" style={{ marginBottom: '8px' }}>
              Let&apos;s build something.
            </h2>
            <a
              className="while-tap-spring border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors font-headline font-bold text-lg inline-block"
              style={{ padding: '14px 32px' }}
              href="https://mail.google.com/mail/?view=cm&to=rohankatara3@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Initialize Contact
            </a>
            <div className="flex gap-6" style={{ marginTop: '8px' }}>
              {[
                { label: 'GitHub',   href: 'https://github.com/RohanKatara' },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rohan-katara-5895952b6' },
                { label: 'Twitter',  href: 'https://x.com/Rohan2Katara' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  className="font-mono text-sm transition-colors hover:text-[#4cd7f6]"
                  style={{ color: '#bcc9cd' }}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </section>

        </div>{/* end gap-40 wrapper */}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ position: 'relative', overflow: 'hidden', paddingTop: '32px', paddingBottom: '40px', paddingLeft: '24px', paddingRight: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 100% 120% at 50% 100%, rgba(6,182,212,0.06) 0%, rgba(124,58,237,0.04) 60%, transparent 100%)' }} />
        {/* Scan line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(76,215,246,0.15) 30%, rgba(76,215,246,0.15) 70%, transparent)' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          {/* Terminal signature */}
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(76,215,246,0.4)', letterSpacing: '0.15em' }}>
            <span style={{ color: 'rgba(76,215,246,0.25)' }}>{'>'}</span> rohan.katara<span style={{ color: '#4cd7f6' }}>.exe</span> —— all rights reserved
          </div>
          {/* Dot divider */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: i === 1 ? '#4cd7f6' : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
            © 2025 — built with React + Three.js
          </div>
        </div>
      </footer>

      {/* ── Project Modals (portalled to body so #root overflow/stacking never clips them) */}
      {activeProject && createPortal(
        <>
          {activeProject === 'mocktalk'      && <MocktalkModal      onClose={() => setActiveProject(null)} />}
          {activeProject === 'krishna'       && <KrishnaModal       onClose={() => setActiveProject(null)} />}
          {activeProject === 'crm'           && <CRMModal           onClose={() => setActiveProject(null)} />}
          {activeProject === 'contentengine' && <ContentEngineModal onClose={() => setActiveProject(null)} />}

          {/* Back button — above the modal (z-index 1001 > modal's 1000) */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1001,
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: 'rgba(10,10,10,0.97)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <button
              onClick={() => setActiveProject(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#4cd7f6',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 8px',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                fontWeight: 600,
                letterSpacing: '0.05em',
                touchAction: 'manipulation',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
              Back
            </button>
          </div>
        </>,
        document.body
      )}

    </div>
  )
}
