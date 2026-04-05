// ─────────────────────────────────────────────────────────────────────────────
// FloorSelector.jsx  →  client/src/components/FloorSelector.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useMapContext } from '../context/MapContext'
import { FLOORS } from '../data/campusData'

export default function FloorSelector() {
  const { activeFloor, setActiveFloor } = useMapContext()

  return (
    <div style={{
      position: 'absolute', left: '14px', bottom: '180px',
      zIndex: 1050, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '4px',
    }}>
      <span style={{
        fontSize: '10px', color: 'rgba(226,232,240,0.5)',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        fontFamily: "'DM Sans', sans-serif", marginBottom: '2px',
      }}>Floor</span>

      <div style={{
        display: 'flex', flexDirection: 'column',
        background: 'rgba(15,17,25,0.88)',
        borderRadius: '10px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(10px)',
      }}>
        {FLOORS.map((floor, i) => (
          <div key={floor.id}>
            {i > 0 && (
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 6px' }} />
            )}
            <button
              onClick={() => setActiveFloor(floor.id)}
              title={floor.label}
              style={{
                width: '40px', height: '36px', border: 'none',
                background: activeFloor === floor.id ? 'rgba(59,130,246,0.28)' : 'transparent',
                color: activeFloor === floor.id ? '#93c5fd' : 'rgba(226,232,240,0.6)',
                fontSize: '13px', fontWeight: activeFloor === floor.id ? 600 : 400,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                borderLeft: activeFloor === floor.id ? '2px solid #3b82f6' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s ease',
              }}
            >
              {floor.shortLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}