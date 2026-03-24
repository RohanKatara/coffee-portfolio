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
  },
  {
    title: 'Krishna.AI',
    tag: 'AI Architecture',
    tagColor: '#d0bcff',
    tagBg: 'rgba(208,188,255,0.1)',
    tagBorder: 'rgba(208,188,255,0.2)',
    desc: 'Ancient wisdom for modern problems. A digital space for reflection and ethical alignment through specialized Large Language Models.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIBTadpuLNymDrkLRfnRipa7HW8H-8w5c5iioQVCIL0V55lk_Qh-YdU-0oHHMRHrMprwFG5xAXlJ1HLwdZA8RlU0X8YkyazKCv2X7GzsjQKGDLX-1w9M0Biht4PZyyO-gARIIx_-6cAkwBzxZ9npfIrfOSQbfSqbkT3jFbrKvIl97hAFcVmyW1HCsgHHqeNqLxe3w0y0c7af6KNq5iBuQOpqsg_kqk-REKcpEU2GUCA23WhontnjUA0KL4DgejXGN5LZR7D7TNNng',
  },
  {
    title: 'AI Lead Gatekeeper',
    tag: 'CRM Automation',
    tagColor: '#4cd7f6',
    tagBg: 'rgba(76,215,246,0.1)',
    tagBorder: 'rgba(76,215,246,0.2)',
    desc: 'An intelligent autonomous agent that intercepts, qualifies, and routes leads directly into the CRM using natural language processing.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdLdWMAMNXr1AN8UiJqPFz-a49BBJ0RRoh5iPGz1UM0s_WK07cEE-lhzn8PlLklFy937aNralaxUk53QwE6ejAG1MOKLOqco-7ZMvxCgdrU6kX_1e34PbezAX3RCdldZ3bMi3XtsSLCx6H4hOdVhbK3Ynge1-2WNqiUDtVOE0PphOz89vY_HaOTsZC-hgGQcqyC5ztdDNAwsxgAmMu8O52eN8mK4ukLONw-M0hER5hFfKvh1sHYwETf2EJleo4ZcloftMt2PD7LFc',
  },
  {
    title: 'Content Bot',
    tag: 'Generative AI',
    tagColor: '#d0bcff',
    tagBg: 'rgba(208,188,255,0.1)',
    tagBorder: 'rgba(208,188,255,0.2)',
    desc: 'A fully automated content generation and distribution pipeline leveraging LLMs to scale digital presence.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy2QWfN4ciZ_0Z8W-MsPZeLmxeSnd88loPR942dEm-pptI0aYy2ms80Fs8XT9NrnTh09o7vOhLaMrDjq8r-oSNuII_nCRCxQGFZdmhjhPm95zPa8gAKtIx2W5cz4Q53lYDDNfVaHVE3hvGse0ZR1sMzWV4dhbv68IuYfmwCDwRP4bxlhaZR96Beo5baGaJVIua45iOsiDoU9lVHpEpVF-zAcO9NKFGfdSKrMUoN5eVByObmTauQw2zJ6c74GGl_jyUfgnPSpeSHgo',
  },
]

const TERMINAL_ITEMS = [
  {
    cmd: 'open /about_rohan',
    content: (
      <p style={{ lineHeight: '1.75', color: 'rgba(209,213,219,1)', fontSize: '0.875rem', margin: 0 }}>
        Hey! I&apos;m <span className="font-bold" style={{ color: '#4cd7f6' }}>Rohan Katara</span> — an
        engineer focused on bridging the gap between high-performance computing and intuitive
        human-centric interfaces. I firmly believe the web was never meant to be a stack of static,
        boring documents. It&apos;s a living, breathing canvas.
      </p>
    ),
  },
  {
    cmd: 'open /what_i_build',
    content: (
      <p style={{ lineHeight: '1.75', color: 'rgba(209,213,219,1)', fontSize: '0.875rem', margin: 0 }}>
        My true passion lies in the intersection of engineering and creativity—whether that means
        architecting immersive web environments, exploring the latest in low-latency neural
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
        you&apos;ll likely catch me holding an angle in a{' '}
        <span className="italic" style={{ color: '#d0bcff' }}>Valorant</span> match, applying the
        same tactical precision to the screen as I do to my architecture.
      </p>
    ),
  },
]

const PROJECT_IDS = ['mocktalk', 'krishna', 'crm', 'contentengine']

export default function MobilePortfolio() {
  const [openTerminal, setOpenTerminal] = useState(null)
  const [activeProject, setActiveProject] = useState(null)

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
      style={{ backgroundColor: '#050505', color: '#e5e2e1', minHeight: '100vh', paddingBottom: '150px' }}
    >
      {/* Atmospheric light leaks */}
      <div
        className="light-leak"
        style={{ width: 500, height: 500, top: -80, left: -80, backgroundColor: '#06b6d4' }}
      />
      <div
        className="light-leak"
        style={{ width: 600, height: 600, bottom: 0, right: -80, backgroundColor: '#571bc1' }}
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-6 py-4"
        style={{ backgroundColor: 'rgba(19,19,19,0.8)' }}
      >
        <div className="text-xl font-headline font-bold tracking-tighter" style={{ color: '#e5e2e1' }}>
          Rohan Katara
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          {['Home', 'Bio', 'Works', 'Contact'].map((label, i) => (
            <a
              key={label}
              href={i === 0 ? '#' : `#${label.toLowerCase()}`}
              className="font-headline text-sm uppercase tracking-widest transition-colors duration-300"
              style={{ color: i === 0 ? '#4cd7f6' : '#bcc9cd' }}
            >
              {label}
            </a>
          ))}
        </nav>
        <button className="md:hidden active:scale-95 transition-transform" style={{ color: '#4cd7f6' }}>
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      <main>
        <div className="flex flex-col gap-20 w-full">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center min-h-[100dvh] w-full px-6 overflow-hidden">

          {/* Data grid base layer */}
          <div
            className="absolute inset-0 z-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Breathing orb 1 — cyan, top-left */}
          <motion.div
            className="absolute z-0 rounded-full"
            style={{
              width: 256,
              height: 256,
              top: '10%',
              left: '-10%',
              backgroundColor: 'rgba(6,182,212,0.2)',
              filter: 'blur(100px)',
            }}
            animate={{ y: [0, -30, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Breathing orb 2 — violet, bottom-right */}
          <motion.div
            className="absolute z-0 rounded-full"
            style={{
              width: 256,
              height: 256,
              bottom: '10%',
              right: '-10%',
              backgroundColor: 'rgba(124,58,237,0.2)',
              filter: 'blur(100px)',
            }}
            animate={{ y: [0, 30, 0], x: [0, -20, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Main content — above background layers */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8"
              style={{ borderColor: 'rgba(76,215,246,0.3)', backgroundColor: 'rgba(76,215,246,0.05)' }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: '#4cd7f6' }}
              />
              <span
                className="text-[10px] font-label font-bold uppercase tracking-widest"
                style={{ color: '#4cd7f6' }}
              >
                AVAILABLE FOR NEW OPPORTUNITIES
              </span>
            </div>

            <h1 className="font-headline text-5xl font-bold tracking-tighter text-center mb-6 neon-glow-cyan">
              Rohan Katara
            </h1>
            <p
              className="font-body text-xl md:text-2xl max-w-2xl text-center mb-12 opacity-80"
              style={{ color: '#bcc9cd' }}
            >
              Software Engineer &amp; AI Builder.
            </p>
          </div>

          <div className="absolute bottom-12 z-10 flex flex-col items-center gap-4">
            <div className="w-px h-16 bg-gradient-to-b from-[#4cd7f6] to-transparent" />
            <span
              className="text-[10px] font-label uppercase tracking-[0.3em] opacity-50"
              style={{ color: '#869397' }}
            >
              Scroll
            </span>
          </div>
        </section>

        {/* ── Bio — Terminal Accordion ──────────────────────────────────────── */}
        <section className="px-5 max-w-5xl mx-auto w-full" id="bio">
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
                      className="while-tap-spring w-full text-left px-4 py-4 flex items-center gap-3 font-mono text-sm md:text-base"
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
        </section>

        {/* ── Selected Works — Horizontal Scroll Strip ─────────────────────── */}
        <section
          className="overflow-hidden"
          style={{ backgroundColor: 'rgba(14,14,14,0.5)' }}
          id="works"
        >
          <div className="max-w-6xl mx-auto pt-14">
            <div className="flex flex-col gap-3 mb-10 px-6">
              <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
                Selected Works
              </h2>
              <p className="font-body text-sm text-gray-400">
                Current versions of experimental deployments.
              </p>
            </div>
          </div>

          <div className="flex flex-row flex-nowrap overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar px-6 pb-24 gap-6 md:gap-12">
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
                    alt={`${project.title} Project Cover`}
                    className="project-card-image w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 opacity-60"
                    src={project.img}
                  />
                </div>
                <div className="p-6 flex flex-col gap-3">
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
                  <p className="text-sm leading-relaxed text-gray-400 mt-1">
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
          className="px-5 flex flex-col items-center justify-center text-center"
          id="contact"
        >
          <div className="flex flex-col items-center gap-8 mt-10">
            <h2 className="font-headline text-4xl md:text-7xl font-bold tracking-tighter leading-tight">
              Let&apos;s build something.
            </h2>
            <a
              className="while-tap-spring px-8 py-4 font-headline font-bold text-lg rounded-full transition-all duration-300 inline-block"
              style={{
                backgroundColor: '#e5e2e1',
                color: '#0e0e0e',
                boxShadow: '0 0 40px rgba(255,255,255,0.1)',
              }}
              href="mailto:hello@rohankatara.com"
            >
              Initialize Contact
            </a>
            <div className="flex gap-8">
              {['GitHub', 'LinkedIn', 'Twitter'].map((link) => (
                <a
                  key={link}
                  className="font-mono text-sm transition-colors hover:text-[#4cd7f6]"
                  style={{ color: '#bcc9cd' }}
                  href="#"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </section>

        </div>{/* end gap-40 wrapper */}
      </main>

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
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              backgroundColor: 'rgba(10,10,10,0.75)',
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

      {/* ── Bottom Navigation (mobile only) ──────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-around items-center px-4 h-16 rounded-full border border-white/10 backdrop-blur-xl"
        style={{
          width: '90%',
          maxWidth: '28rem',
          backgroundColor: 'rgba(14,14,14,0.9)',
          boxShadow: '0 0 30px rgba(6,182,212,0.15)',
        }}
      >
        <a
          className="flex items-center justify-center rounded-full w-12 h-12 active:scale-90 duration-200"
          style={{ background: 'linear-gradient(to top right, #4cd7f6, #06b6d4)', color: '#003640' }}
          href="#"
        >
          <span className="material-symbols-outlined">terminal</span>
        </a>
        {[
          { icon: 'person_search', href: '#bio' },
          { icon: 'layers', href: '#works' },
          { icon: 'send', href: '#contact' },
        ].map(({ icon, href }) => (
          <a
            key={href}
            className="flex items-center justify-center w-12 h-12 transition-all active:scale-90 duration-200"
            style={{ color: '#bcc9cd' }}
            href={href}
          >
            <span className="material-symbols-outlined">{icon}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}
