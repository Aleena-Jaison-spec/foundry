// ─────────────────────────────────────────────────────────────────────────────
// LandingPage.jsx  →  client/src/components/LandingPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'

const FEATURES = [
  {
    icon: '🗺',
    title: 'Micro-Scale Maps',
    desc: 'Indoor floor plans for schools, hospitals and campuses — built from minimal input, no surveying required.',
  },
  {
    icon: '📍',
    title: 'Live Navigation',
    desc: 'Real-time GPS pointer with gyroscope heading. Follows you as you move, floor by floor.',
  },
  {
    icon: '🔍',
    title: 'Instant Search',
    desc: 'Find any room, lab or office in seconds. Auto-switches to the right floor when you pick a result.',
  },
  {
    icon: '🪜',
    title: 'Floor Switching',
    desc: 'Multi-floor support with smooth transitions. Ground, first, second — all in one tap.',
  },
  {
    icon: '🗺️',
    title: 'Smart Routing',
    desc: 'Compute optimal paths through corridors in real time. Dashed route line drawn directly on the map.',
  },
  {
    icon: '⬡',
    title: 'Share via QR',
    desc: 'Distribute maps instantly via shareable links and QR codes — no app install needed.',
  },
]

export default function LandingPage({ onExplore }) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={S.page}>
      {/* Grid background */}
      <div style={S.grid} />

      {/* Glow orb */}
      <div style={S.orb} />

      {/* Nav */}
      <nav style={{ ...S.nav, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(-12px)', transition: 'all 0.6s ease' }}>
        <span style={S.logo}>Navigo</span>
        <button style={S.navBtn} onClick={onExplore}>Launch App</button>
      </nav>

      {/* Hero */}
      <section style={S.hero}>
        <div style={{ ...S.badge, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transition: 'all 0.55s ease 0.1s' }}>
          <span style={S.badgeDot} />
          Indoor Navigation · Redefined
        </div>

        <h1 style={{ ...S.h1, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.65s ease 0.2s' }}>
          Navigate any space.<br />
          <span style={S.accent}>Instantly.</span>
        </h1>

        <p style={{ ...S.sub, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.65s ease 0.3s' }}>
          Navigo generates interactive indoor maps for schools, hospitals and campuses
          from minimal input — enriched with live navigation, smart search and seamless floor switching.
        </p>

        <div style={{ ...S.ctas, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.65s ease 0.42s' }}>
          <button style={S.exploreBtn} onClick={onExplore}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Explore the Map →
          </button>
          <a href="#features" style={S.ghostBtn}>See Features</a>
        </div>

        {/* Mock map preview */}
        <div style={{ ...S.mapPreview, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(32px) scale(0.97)', transition: 'all 0.8s ease 0.55s' }}>
          <div style={S.mapBar}>
            <div style={S.mapBarDots}>
              {['#ef4444','#f59e0b','#22c55e'].map((c,i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div style={S.mapBarTitle}>Navigo — First Floor · SOE CUSAT</div>
          </div>
          <div style={S.mapBody}>
            {/* Floor plan SVG mock */}
            <svg width="100%" viewBox="0 0 520 200" style={{ display: 'block' }}>
              {/* Building outline */}
              <rect x="10" y="10" width="500" height="180" rx="4" fill="none" stroke="#334155" strokeWidth="1.5"/>
              {/* Corridor */}
              <rect x="10" y="88" width="500" height="24" fill="rgba(51,65,85,0.3)" stroke="none"/>
              <text x="260" y="104" textAnchor="middle" fontSize="8" fill="#475569" fontFamily="'DM Sans',sans-serif">corridor</text>
              {/* Top rooms */}
              {[
                [10,10,60,78,'#166534','Girls\nWash'],
                [70,10,80,78,'#1e3a5f','CS4'],
                [150,10,80,78,'#1e3a5f','CS3'],
                [230,10,80,78,'#1e3a5f','CS2'],
                [310,10,70,78,'#1e3a5f','CS1'],
                [380,10,80,78,'#713f12','Faculty 1'],
                [460,10,50,78,'#4a1942','HOD'],
              ].map(([x,y,w,h,bg,label],i) => (
                <g key={i}>
                  <rect x={x} y={y} width={w} height={h} fill={bg} fillOpacity="0.35" stroke="#334155" strokeWidth="0.8" rx="2"/>
                  <text x={x+w/2} y={y+h/2+4} textAnchor="middle" fontSize="7.5" fill="#94a3b8" fontFamily="'DM Sans',sans-serif">{label.split('\n')[0]}</text>
                  {label.includes('\n') && <text x={x+w/2} y={y+h/2+14} textAnchor="middle" fontSize="7.5" fill="#94a3b8" fontFamily="'DM Sans',sans-serif">{label.split('\n')[1]}</text>}
                </g>
              ))}
              {/* Bottom rooms */}
              {[
                [10,112,60,78,'#166534','Boys\nWash'],
                [70,112,80,78,'#1e3a5f','CS5'],
                [150,112,80,78,'#1e3a5f','CS6'],
                [230,112,80,78,'#1e3a5f','CS7'],
                [310,112,70,78,'#1e3a5f','CS8'],
                [380,112,130,78,'#7f1d1d','Project Lab'],
              ].map(([x,y,w,h,bg,label],i) => (
                <g key={i}>
                  <rect x={x} y={y} width={w} height={h} fill={bg} fillOpacity="0.35" stroke="#334155" strokeWidth="0.8" rx="2"/>
                  <text x={x+w/2} y={y+h/2+4} textAnchor="middle" fontSize="7.5" fill="#94a3b8" fontFamily="'DM Sans',sans-serif">{label.split('\n')[0]}</text>
                  {label.includes('\n') && <text x={x+w/2} y={y+h/2+14} textAnchor="middle" fontSize="7.5" fill="#94a3b8" fontFamily="'DM Sans',sans-serif">{label.split('\n')[1]}</text>}
                </g>
              ))}
              {/* Animated GPS dot */}
              <circle cx="160" cy="100" r="5" fill="#3b82f6" opacity="0.9">
                <animate attributeName="r" values="5;8;5" dur="1.8s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="160" cy="100" r="4" fill="#3b82f6"/>
              {/* Route line */}
              <line x1="160" y1="100" x2="415" y2="151" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" opacity="0.7"/>
              {/* Destination pin */}
              <circle cx="415" cy="151" r="5" fill="#a855f7" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={S.featSection}>
        <div style={{ ...S.sectionLabel, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.6s' }}>
          What Navigo does
        </div>
        <h2 style={{ ...S.h2, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.65s' }}>
          Everything you need.<br />Nothing you don't.
        </h2>

        <div style={S.featGrid}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                ...S.featCard,
                ...(hovered === i ? S.featCardHover : {}),
                opacity: visible ? 1 : 0,
                transform: visible
                  ? (hovered === i ? 'translateY(-4px)' : 'translateY(0)')
                  : 'translateY(20px)',
                transition: `opacity 0.5s ease ${0.7 + i * 0.07}s, transform 0.25s ease, border-color 0.2s ease, background 0.2s ease`,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={S.featIcon}>{f.icon}</div>
              <div style={S.featTitle}>{f.title}</div>
              <div style={S.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA block */}
      <section style={S.ctaBlock}>
        <div style={S.ctaOrb} />
        <h2 style={S.ctaH2}>Ready to navigate?</h2>
        <p style={S.ctaP}>Open the live map and explore SOE CUSAT's first floor right now.</p>
        <button style={S.exploreBtn2} onClick={onExplore}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          Open Navigo Map →
        </button>
      </section>

      {/* Footer */}
      <footer style={S.footer}>
        <span style={S.logo}>Navigo</span>
        <span style={{ color: '#334155', fontSize: 13 }}>Built for SOE CUSAT · SenseMap Project</span>
      </footer>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#060810',
    color: '#e2e8f0',
    fontFamily: "'DM Sans', sans-serif",
    overflowX: 'hidden',
    position: 'relative',
  },
  grid: {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: `
      linear-gradient(rgba(51,65,85,0.18) 1px, transparent 1px),
      linear-gradient(90deg, rgba(51,65,85,0.18) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
  },
  orb: {
    position: 'fixed', top: '-20vh', left: '50%', transform: 'translateX(-50%)',
    width: '80vw', height: '60vh',
    background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 40px',
    background: 'rgba(6,8,16,0.75)',
    backdropFilter: 'blur(18px)',
    borderBottom: '1px solid rgba(51,65,85,0.4)',
  },
  logo: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 22, fontWeight: 800,
    background: 'linear-gradient(135deg, #e2e8f0 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  navBtn: {
    padding: '8px 20px', borderRadius: 8,
    border: '1px solid rgba(59,130,246,0.4)',
    background: 'rgba(59,130,246,0.1)',
    color: '#93c5fd', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.18s ease',
  },
  hero: {
    position: 'relative', zIndex: 1,
    paddingTop: 140, paddingBottom: 80,
    paddingLeft: 40, paddingRight: 40,
    maxWidth: 860, margin: '0 auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '6px 14px', borderRadius: 99,
    border: '1px solid rgba(59,130,246,0.3)',
    background: 'rgba(59,130,246,0.08)',
    fontSize: 12, color: '#93c5fd', letterSpacing: '0.04em',
    marginBottom: 28,
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#3b82f6',
    boxShadow: '0 0 6px #3b82f6',
  },
  h1: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(38px, 6vw, 72px)',
    fontWeight: 800, lineHeight: 1.08,
    letterSpacing: '-0.03em',
    color: '#f1f5f9',
    marginBottom: 24,
  },
  accent: {
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  sub: {
    fontSize: 17, lineHeight: 1.7, color: '#94a3b8',
    maxWidth: 560, marginBottom: 36,
  },
  ctas: {
    display: 'flex', gap: 14, flexWrap: 'wrap',
    justifyContent: 'center', marginBottom: 52,
  },
  exploreBtn: {
    padding: '14px 32px', borderRadius: 10,
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff', fontSize: 15, fontWeight: 600,
    border: 'none', cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 4px 24px rgba(59,130,246,0.35)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    letterSpacing: '0.01em',
  },
  ghostBtn: {
    padding: '14px 28px', borderRadius: 10,
    border: '1px solid rgba(100,116,139,0.4)',
    background: 'transparent',
    color: '#94a3b8', fontSize: 15, fontWeight: 500,
    cursor: 'pointer', textDecoration: 'none',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex', alignItems: 'center',
    transition: 'border-color 0.2s, color 0.2s',
  },
  mapPreview: {
    width: '100%', maxWidth: 660,
    border: '1px solid rgba(51,65,85,0.6)',
    borderRadius: 16, overflow: 'hidden',
    background: '#0d1117',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.08)',
  },
  mapBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px',
    background: 'rgba(15,17,25,0.95)',
    borderBottom: '1px solid rgba(51,65,85,0.4)',
  },
  mapBarDots: { display: 'flex', gap: 5 },
  mapBarTitle: {
    flex: 1, fontSize: 11.5, color: '#475569',
    textAlign: 'center', letterSpacing: '0.04em',
    fontFamily: "'DM Sans', sans-serif",
  },
  mapBody: { padding: '16px', background: '#0d1117' },

  // Features
  featSection: {
    position: 'relative', zIndex: 1,
    padding: '80px 40px 100px',
    maxWidth: 1060, margin: '0 auto',
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 11, letterSpacing: '0.12em', color: '#3b82f6',
    textTransform: 'uppercase', marginBottom: 14,
  },
  h2: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(28px, 4vw, 48px)',
    fontWeight: 700, color: '#f1f5f9',
    lineHeight: 1.15, letterSpacing: '-0.02em',
    marginBottom: 52,
  },
  featGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
  },
  featCard: {
    padding: '28px 24px',
    background: 'rgba(13,17,23,0.8)',
    border: '1px solid rgba(51,65,85,0.5)',
    borderRadius: 14, textAlign: 'left',
    cursor: 'default',
  },
  featCardHover: {
    background: 'rgba(20,28,40,0.95)',
    borderColor: 'rgba(59,130,246,0.35)',
  },
  featIcon: { fontSize: 26, marginBottom: 14 },
  featTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 16, fontWeight: 700, color: '#f1f5f9',
    marginBottom: 8, letterSpacing: '-0.01em',
  },
  featDesc: { fontSize: 13.5, color: '#64748b', lineHeight: 1.65 },

  // CTA block
  ctaBlock: {
    position: 'relative', zIndex: 1,
    padding: '80px 40px',
    textAlign: 'center',
    borderTop: '1px solid rgba(51,65,85,0.3)',
    overflow: 'hidden',
  },
  ctaOrb: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '60vw', height: '40vh',
    background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ctaH2: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(26px, 4vw, 44px)',
    fontWeight: 700, color: '#f1f5f9',
    marginBottom: 14, letterSpacing: '-0.02em',
  },
  ctaP: { fontSize: 15, color: '#64748b', marginBottom: 32 },
  exploreBtn2: {
    padding: '15px 36px', borderRadius: 10,
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff', fontSize: 15, fontWeight: 600,
    border: 'none', cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 4px 24px rgba(59,130,246,0.35)',
    transition: 'transform 0.2s ease',
    letterSpacing: '0.01em',
  },
  footer: {
    position: 'relative', zIndex: 1,
    borderTop: '1px solid rgba(51,65,85,0.3)',
    padding: '24px 40px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 10,
  },
}