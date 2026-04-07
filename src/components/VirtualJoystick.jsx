import { useRef, useState, useCallback, useEffect } from 'react'

export default function VirtualJoystick({ keysRef }) {
  const joystickRef = useRef(null)
  const [active, setActive] = useState(false)
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 })
  const originRef = useRef({ x: 0, y: 0 })
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const handleStart = useCallback((clientX, clientY) => {
    const el = joystickRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    originRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    setActive(true)
  }, [])

  const handleMove = useCallback((clientX, clientY) => {
    if (!active) return
    const dx = clientX - originRef.current.x
    const dy = clientY - originRef.current.y
    const maxDist = 30
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist)
    const angle = Math.atan2(dy, dx)
    const nx = Math.cos(angle) * dist
    const ny = Math.sin(angle) * dist
    setStickPos({ x: nx, y: ny })

    // Map to keys
    const threshold = 8
    if (keysRef?.current) {
      keysRef.current['ArrowLeft'] = nx < -threshold
      keysRef.current['ArrowRight'] = nx > threshold
      keysRef.current['ArrowUp'] = ny < -threshold
      keysRef.current['ArrowDown'] = ny > threshold
    }
  }, [active, keysRef])

  const handleEnd = useCallback(() => {
    setActive(false)
    setStickPos({ x: 0, y: 0 })
    if (keysRef?.current) {
      keysRef.current['ArrowLeft'] = false
      keysRef.current['ArrowRight'] = false
      keysRef.current['ArrowUp'] = false
      keysRef.current['ArrowDown'] = false
    }
  }, [keysRef])

  const handleJump = useCallback(() => {
    if (keysRef?.current) {
      keysRef.current[' '] = true
      setTimeout(() => { if (keysRef?.current) keysRef.current[' '] = false }, 100)
    }
  }, [keysRef])

  if (!isTouch) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none" style={{ height: '35vh' }}>
      {/* Joystick */}
      <div
        ref={joystickRef}
        className="absolute bottom-8 left-8 w-20 h-20 rounded-full border-2 border-[#1A1A1A]/20 bg-[#1A1A1A]/5 pointer-events-auto"
        onTouchStart={(e) => {
          e.preventDefault()
          const t = e.touches[0]
          handleStart(t.clientX, t.clientY)
        }}
        onTouchMove={(e) => {
          e.preventDefault()
          const t = e.touches[0]
          handleMove(t.clientX, t.clientY)
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          handleEnd()
        }}
      >
        {/* Stick */}
        <div
          className="absolute w-8 h-8 rounded-full bg-[#1A1A1A]/30 top-1/2 left-1/2"
          style={{
            transform: `translate(calc(-50% + ${stickPos.x}px), calc(-50% + ${stickPos.y}px))`,
          }}
        />
      </div>

    </div>
  )
}
