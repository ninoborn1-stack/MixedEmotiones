import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
      if (!visible) setVisible(true)
    }
    const leave = () => setVisible(false)
    const enter = () => setVisible(true)

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseleave', leave)
    document.addEventListener('mouseenter', enter)
    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', leave)
      document.removeEventListener('mouseenter', enter)
    }
  }, [visible])

  return (
    <motion.div
      className="fixed top-0 left-0 w-2 h-2 rounded-full bg-charcoal/20 pointer-events-none z-[100] mix-blend-darken"
      animate={{
        x: pos.x - 4,
        y: pos.y - 4,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        x: { type: 'spring', stiffness: 500, damping: 28, mass: 0.5 },
        y: { type: 'spring', stiffness: 500, damping: 28, mass: 0.5 },
        opacity: { duration: 0.2 },
      }}
    />
  )
}
