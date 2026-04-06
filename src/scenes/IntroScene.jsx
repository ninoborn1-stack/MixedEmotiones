import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const BRAND_NAME = 'MXD MTNS'

// Blocks defined as percentages of the container (which fills the viewport)
// All positions relative to a 100x100 coordinate system
const blocks = [
  // Large background panels - the "walls" of the store
  { id: 'wall-l', xP: 0, yP: 0, wP: 22, hP: 100, color: '#1A1A1A', delay: 0 },
  { id: 'wall-r', xP: 78, yP: 0, wP: 22, hP: 100, color: '#1A1A1A', delay: 0.08 },
  // Top beam
  { id: 'beam-t', xP: 22, yP: 0, wP: 56, hP: 12, color: '#1A1A1A', delay: 0.15 },
  // Floor
  { id: 'floor', xP: 22, yP: 88, wP: 56, hP: 12, color: '#D5D0CB', delay: 0.2 },
  // Left wall accent panel
  { id: 'accent-l', xP: 22, yP: 12, wP: 1.5, hP: 76, color: '#8A8478', delay: 0.28 },
  // Right wall accent panel
  { id: 'accent-r', xP: 76.5, yP: 12, wP: 1.5, hP: 76, color: '#8A8478', delay: 0.3 },
  // Left display niche
  { id: 'niche-l', xP: 25, yP: 25, wP: 12, hP: 45, color: '#2A2A2A', delay: 0.35 },
  // Right display niche
  { id: 'niche-r', xP: 63, yP: 25, wP: 12, hP: 45, color: '#2A2A2A', delay: 0.38 },
  // Door frame left pillar
  { id: 'door-l', xP: 38, yP: 20, wP: 1, hP: 68, color: '#1A1A1A', delay: 0.42 },
  // Door frame right pillar
  { id: 'door-r', xP: 61, yP: 20, wP: 1, hP: 68, color: '#1A1A1A', delay: 0.42 },
  // Door lintel
  { id: 'door-t', xP: 38, yP: 18, wP: 24, hP: 2, color: '#1A1A1A', delay: 0.48 },
  // Display shelf left
  { id: 'shelf-l', xP: 26, yP: 52, wP: 10, hP: 0.4, color: '#8A8478', delay: 0.52 },
  // Display shelf right
  { id: 'shelf-r', xP: 64, yP: 52, wP: 10, hP: 0.4, color: '#8A8478', delay: 0.52 },
  // Floor accent strip
  { id: 'floor-accent', xP: 30, yP: 87, wP: 40, hP: 0.5, color: '#8A8478', delay: 0.55 },
]

function getRandomOrigin() {
  const angle = Math.random() * Math.PI * 2
  const distance = 120 + Math.random() * 60
  return {
    xP: Math.cos(angle) * distance,
    yP: Math.sin(angle) * distance,
    rotate: (Math.random() - 0.5) * 120,
  }
}

export default function IntroScene({ onComplete }) {
  const [assembled, setAssembled] = useState(false)

  // Memoize random origins so they don't change on re-render
  const origins = useMemo(
    () => blocks.map(() => getRandomOrigin()),
    []
  )

  useEffect(() => {
    const timer = setTimeout(() => setAssembled(true), 3400)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (assembled) {
      const timer = setTimeout(onComplete, 1400)
      return () => clearTimeout(timer)
    }
  }, [assembled, onComplete])

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center bg-ivory relative overflow-hidden"
      initial={{ opacity: 1 }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Assembly container - fills most of the viewport */}
      <div className="relative w-[85vw] h-[85vh] max-w-[1200px] max-h-[700px]">
        {blocks.map((block, i) => {
          const origin = origins[i]
          return (
            <motion.div
              key={block.id}
              className="absolute"
              style={{
                left: `${block.xP}%`,
                top: `${block.yP}%`,
                width: `${block.wP}%`,
                height: `${block.hP}%`,
                backgroundColor: block.color,
              }}
              initial={{
                left: `${origin.xP}%`,
                top: `${origin.yP}%`,
                rotate: origin.rotate,
                opacity: 0,
                scale: 0.4,
              }}
              animate={{
                left: `${block.xP}%`,
                top: `${block.yP}%`,
                rotate: 0,
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 2,
                delay: block.delay + 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          )
        })}

        {/* Center opening - the "door" / entrance area is just the ivory bg showing through */}

        {/* Brand name appears after assembly */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: assembled ? 1 : 0 }}
          transition={{ duration: 1.2, delay: 0.1 }}
        >
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="w-12 h-px bg-warm-gray"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: assembled ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
            <span className="font-display text-5xl md:text-6xl tracking-[0.4em] text-ivory mix-blend-difference">
              {BRAND_NAME}
            </span>
            <motion.div
              className="w-12 h-px bg-warm-gray"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: assembled ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom subtle indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2.8, duration: 1 }}
      >
        <div className="w-8 h-px bg-charcoal" />
      </motion.div>
    </motion.div>
  )
}
