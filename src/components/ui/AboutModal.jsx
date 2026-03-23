import React from 'react'

// Stitch-generated "Profile – No Footer & Scrollable" screen
// HTML → JSX conversion:
//   • class → className (all instances)
//   • data-alt → alt on <img>
//   • Stitch custom Tailwind color tokens → inline styles (project uses Tailwind v4, no custom config)
//   • Responsive bento columns handled via injected <style> media query
//   • onClose wired to header "Back to Café" button + footer CTA

export default function AboutModal({ onClose }) {
  return (
    <div
      className="about-scrollbar"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        overflowY: 'auto',
        backgroundColor: '#051710',
        color: '#d2e7dc',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── Injected styles ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@1,6..72,400;1,6..72,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .about-material-icon {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .about-icon-filled {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .about-glass-panel {
          background: rgba(17, 35, 28, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .about-scrollbar::-webkit-scrollbar { width: 4px; }
        .about-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .about-scrollbar::-webkit-scrollbar-thumb { background: #554337; border-radius: 10px; }
        .about-font-headline { font-family: 'Newsreader', Georgia, serif; }
        @keyframes about-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .about-animate-fade-in {
          animation: about-fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes about-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .about-pulse { animation: about-pulse 2s ease-in-out infinite; }

        /* Responsive bento card columns */
        .about-bento-card {
          display: flex;
          flex-direction: column;
        }
        .about-bento-left  { width: 100%; }
        .about-bento-right { width: 100%; }
        @media (min-width: 768px) {
          .about-bento-card  { flex-direction: row; }
          .about-bento-left  { width: 40%; }
          .about-bento-right { width: 60%; }
        }
        .about-content-scroll {
          overflow-y: auto;
        }
        @media (min-width: 768px) {
          .about-content-scroll { max-height: 614px; }
        }
      `}</style>

      {/* ── Fixed header ──────────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        backgroundColor: 'rgba(5, 23, 16, 0.8)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 40px 40px rgba(2,17,11,0.08)',
      }}>
        <nav style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.5rem 2rem', maxWidth: '80rem', margin: '0 auto',
        }}>
          <div className="about-font-headline" style={{ fontSize: '1.5rem', fontStyle: 'italic', color: '#fb923c' }}>
            Studio Portfolio
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hire Me — opens LinkedIn */}
            <a
              href="https://www.linkedin.com/in/rohan-katara-5895952b6/"
              target="_blank"
              rel="noreferrer"
              style={{
                backgroundColor: '#fb923c', color: '#4f2500',
                padding: '8px 24px', borderRadius: '8px',
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
                fontSize: '0.875rem', letterSpacing: '0.04em',
                textDecoration: 'none', display: 'inline-block',
                transition: 'box-shadow 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(251,146,60,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
            >
              Hire Me
            </a>

            {/* ← Back to Café — dismiss */}
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(251,146,60,0.1)',
                border: '1px solid rgba(251,146,60,0.3)',
                borderRadius: '8px', color: '#ffb887',
                padding: '8px 20px', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontWeight: 500,
                fontSize: '0.875rem', letterSpacing: '0.05em',
                transition: 'background 0.3s, border-color 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(251,146,60,0.2)'
                e.currentTarget.style.borderColor = 'rgba(251,146,60,0.6)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(251,146,60,0.1)'
                e.currentTarget.style.borderColor = 'rgba(251,146,60,0.3)'
              }}
            >
              ← Back to Café
            </button>
          </div>
        </nav>
      </header>

      {/* ── Main canvas ───────────────────────────────────────────────────────── */}
      <main style={{
        minHeight: '100vh',
        paddingTop: '8rem', paddingBottom: '4rem',
        paddingLeft: '1.5rem', paddingRight: '1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Background glows */}
        <div style={{
          position: 'fixed', top: '-10%', left: '-10%',
          width: '50%', height: '50%',
          background: 'rgba(255,184,135,0.05)',
          borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'fixed', bottom: '-10%', right: '-10%',
          width: '40%', height: '40%',
          background: 'rgba(48,77,64,0.10)',
          borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none',
        }} />

        {/* ── Bento card ──────────────────────────────────────────────────────── */}
        <div
          className="about-glass-panel about-animate-fade-in about-bento-card"
          style={{
            position: 'relative', width: '100%', maxWidth: '64rem',
            borderRadius: '8px', boxShadow: '0 40px 80px rgba(2,17,11,0.2)',
            overflow: 'hidden',
          }}
        >
          {/* ── Left: profile ─────────────────────────────────────────────────── */}
          <div
            className="about-bento-left"
            style={{
              padding: '2.5rem',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(13, 31, 24, 0.5)',
            }}
          >
            {/* Portrait with glow ring */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: '-4px',
                background: 'rgba(255,184,135,0.20)',
                borderRadius: '12px', filter: 'blur(20px)',
              }} />
              <div style={{
                position: 'relative',
                width: '16rem', height: '20rem',
                borderRadius: '12px', overflow: 'hidden',
                boxShadow: '0 0 30px rgba(251,146,60,0.15)',
                border: '1px solid rgba(85,67,55,0.2)',
              }}>
                <img
                  src="/images/rohan-profile.jpg"
                  alt="Portrait of Rohan Katara in a moody studio light"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.7s' }}
                />
              </div>
            </div>

            {/* Name + title + availability */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <h2 className="about-font-headline" style={{ fontStyle: 'italic', fontSize: '1.875rem', color: '#d2e7dc', marginBottom: '4px' }}>
                Rohan Katara
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#dbc1b2', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                COMPUTER ENGINEER
              </p>
              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', justifyContent: 'center', alignItems: 'center' }}>
                <span
                  className="about-pulse"
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffb887', display: 'inline-block', flexShrink: 0 }}
                />
                <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Available for Adventure
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: content ────────────────────────────────────────────────── */}
          <div
            className="about-bento-right"
            style={{ padding: '2rem 3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div className="about-scrollbar about-content-scroll" style={{ paddingRight: '1rem' }}>
              {/* Headline */}
              <h1 className="about-font-headline" style={{
                fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                color: '#d2e7dc', marginBottom: '2rem', lineHeight: 1.1,
              }}>
                The <span style={{ fontStyle: 'italic', color: '#ffb887' }}>barista</span> behind the code.
              </h1>

              {/* Bio paragraphs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#dbc1b2', lineHeight: 1.7, fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
                <p>
                  Hey! I&rsquo;m <span style={{ color: '#d2e7dc', fontWeight: 600 }}>Rohan Katara</span>, a recent B.Tech Computer Engineering graduate based in Ahmedabad, India. I firmly believe the web was never meant to be a stack of static, boring documents—it should be a living, breathing, interactive experience.
                </p>
                <p>
                  That&rsquo;s exactly why you are standing in a 3D cafe right now instead of scrolling through a standard PDF resume. When I am not obsessively tweaking the grind size on my coffee beans to pull a god-tier extraction from my espresso, I am applying that exact same perfectionism to my code.
                </p>
                <p>
                  My true passion lies in the <span className="about-font-headline" style={{ fontStyle: 'italic', color: '#d2e7dc' }}>intersection of engineering and creativity</span>—whether that means architecting immersive web environments, tinkering with the latest Generative AI models, or building tools that actually feel alive.
                </p>
                <p>
                  I thrive on taking complex, cutting-edge technology and serving it up in a way that is intuitive and engaging. If my code is compiling, the servers are happy, and I&rsquo;ve already had way too much caffeine for one day, you can probably catch me holding an angle in a Valorant match.
                </p>
              </div>

              {/* Details bento grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '3rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: 'rgba(38,57,49,0.4)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="about-material-icon" style={{ color: '#ffb887' }}>location_on</span>
                  <div>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700 }}>Base</p>
                    <p style={{ fontSize: '0.75rem', color: '#d2e7dc' }}>Ahmedabad, IN</p>
                  </div>
                </div>
                <div style={{ backgroundColor: 'rgba(38,57,49,0.4)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="about-material-icon" style={{ color: '#ffb887' }}>terminal</span>
                  <div>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 700 }}>Stack</p>
                    <p style={{ fontSize: '0.75rem', color: '#d2e7dc' }}>Full-Stack / AI</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div style={{
              paddingTop: '2.5rem',
              display: 'flex', flexWrap: 'wrap', gap: '1rem',
              borderTop: '1px solid rgba(85,67,55,0.10)',
              marginTop: '1.5rem',
            }}>
              {/* Contact Me — opens LinkedIn */}
              <a
                href="https://www.linkedin.com/in/rohan-katara-5895952b6/"
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1, minWidth: '160px',
                  backgroundColor: '#fb923c', color: '#4f2500',
                  padding: '1rem 2rem', borderRadius: '8px',
                  fontWeight: 700, fontSize: '0.875rem',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'box-shadow 0.3s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(251,146,60,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
                onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.97)' }}
                onMouseUp={e    => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                Contact Me
                <span className="about-material-icon" style={{ fontSize: '1.1rem' }}>arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
