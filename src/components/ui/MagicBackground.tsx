import { useMemo } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  type: 'dot' | 'star' | 'butterfly'
  color: string
}

const COLORS = [
  'rgba(147,51,234,0.6)',
  'rgba(236,72,153,0.6)',
  'rgba(99,102,241,0.6)',
  'rgba(167,139,250,0.5)',
  'rgba(244,114,182,0.5)',
]

export function MagicBackground() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 15 + 8,
      delay: Math.random() * 10,
      type: i < 5 ? 'butterfly' : i < 15 ? 'star' : 'dot',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Radial gradient orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #9333ea, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)' }}
      />
      <div
        className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
      />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          {p.type === 'butterfly' ? (
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" style={{ color: p.color }}>
              <path d="M8 6 C4 2 0 0 1 4 C2 7 6 7 8 6Z" fill="currentColor" opacity="0.7" />
              <path d="M8 6 C12 2 16 0 15 4 C14 7 10 7 8 6Z" fill="currentColor" opacity="0.7" />
              <path d="M8 6 C5 8 2 12 4 11 C6 10 7 8 8 6Z" fill="currentColor" opacity="0.5" />
              <path d="M8 6 C11 8 14 12 12 11 C10 10 9 8 8 6Z" fill="currentColor" opacity="0.5" />
            </svg>
          ) : p.type === 'star' ? (
            <svg width={p.size * 3} height={p.size * 3} viewBox="0 0 12 12" fill="none">
              <path d="M6 0L7.5 4.5H12L8.25 7.5L9.75 12L6 9L2.25 12L3.75 7.5L0 4.5H4.5L6 0Z"
                fill={p.color} />
            </svg>
          ) : (
            <div
              className="rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              }}
            />
          )}
        </div>
      ))}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(147,51,234,1) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}
