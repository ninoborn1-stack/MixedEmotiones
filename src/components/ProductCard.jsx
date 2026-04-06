import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ProductCard({ product, index, onClick }) {
  const [hovered, setHovered] = useState(false)
  const isTshirt = product.type === 'T-Shirt'

  // Each product gets a slightly different float animation
  const floatDuration = 4 + index * 0.7
  const floatDelay = index * 1.2

  return (
    <motion.div
      className="relative cursor-pointer flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      animate={{ y: hovered ? -12 : 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Hanger line from ceiling */}
      <motion.div
        className="w-px bg-gradient-to-b from-transparent via-light-gray to-warm-gray/40"
        style={{ height: 50 + index * 10 }}
        animate={{ scaleY: hovered ? 0.85 : 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Hanger hook */}
      <div className="relative mb-0.5">
        <svg width="24" height="8" viewBox="0 0 24 8" className="opacity-30">
          <path d="M0,8 Q12,0 24,8" fill="none" stroke="#8A8478" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Floating product */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{
          width: isTshirt ? 170 : 200,
          height: isTshirt ? 190 : 220,
        }}
        animate={{
          y: [0, -5, 0],
          rotateZ: hovered ? 1.5 : [0, 0.3, 0],
        }}
        transition={{
          y: { duration: floatDuration, delay: floatDelay, repeat: Infinity, ease: 'easeInOut' },
          rotateZ: { duration: hovered ? 0.4 : floatDuration * 1.3, repeat: hovered ? 0 : Infinity, ease: 'easeInOut' },
        }}
      >
        {isTshirt ? (
          <TshirtShape color={product.color} hovered={hovered} />
        ) : (
          <PulloverShape color={product.color} hovered={hovered} />
        )}
      </motion.div>

      {/* Shadow on ground */}
      <motion.div
        className="mt-2 rounded-full"
        style={{
          width: isTshirt ? 100 : 120,
          height: 6,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.05) 0%, transparent 70%)',
        }}
        animate={{
          scaleX: hovered ? 1.15 : [1, 0.95, 1],
          opacity: hovered ? 0.8 : [0.5, 0.4, 0.5],
        }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Product info */}
      <motion.div
        className="mt-5 text-center"
        animate={{ opacity: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-[9px] tracking-[0.3em] uppercase text-warm-gray font-light mb-1.5">
          {product.type}
        </p>
        <h3 className="font-display text-lg tracking-wide text-charcoal font-normal leading-tight">
          {product.name}
        </h3>
        <p className="text-[11px] tracking-[0.2em] text-warm-gray mt-1 font-light">
          {product.subtitle}
        </p>
      </motion.div>

      {/* Price + line - appear on hover */}
      <motion.div
        className="flex flex-col items-center mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
        transition={{ duration: 0.35 }}
      >
        <span className="text-xs tracking-[0.15em] text-charcoal font-light">
          EUR {product.price}
        </span>
        <motion.div
          className="mt-2 h-px bg-charcoal"
          animate={{ width: hovered ? 30 : 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
      </motion.div>
    </motion.div>
  )
}

function TshirtShape({ color, hovered }) {
  const isDark = color === '#1A1A1A'
  const strokeColor = isDark ? '#333' : '#D5D0CB'

  return (
    <motion.svg
      viewBox="0 0 160 180"
      className="w-full h-full drop-shadow-sm"
      animate={{ scale: hovered ? 1.05 : 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <path
        d="M40,10 L20,10 L5,45 L25,55 L32,38 L32,170 L128,170 L128,38 L135,55 L155,45 L140,10 L120,10 L110,18 C100,28 60,28 50,18 Z"
        fill={color}
        stroke={strokeColor}
        strokeWidth="0.5"
      />
      {/* Collar */}
      <path
        d="M50,18 C60,28 100,28 110,18"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.6"
        opacity="0.4"
      />
      {/* Seam lines */}
      <line x1="32" y1="38" x2="32" y2="170" stroke={strokeColor} strokeWidth="0.15" opacity="0.15" />
      <line x1="128" y1="38" x2="128" y2="170" stroke={strokeColor} strokeWidth="0.15" opacity="0.15" />
      {/* Center fold */}
      <line x1="80" y1="28" x2="80" y2="168" stroke={strokeColor} strokeWidth="0.15" opacity="0.1" />
    </motion.svg>
  )
}

function PulloverShape({ color, hovered }) {
  return (
    <motion.svg
      viewBox="0 0 180 210"
      className="w-full h-full drop-shadow-sm"
      animate={{ scale: hovered ? 1.05 : 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Body + sleeves */}
      <path
        d="M48,15 L12,15 L-5,60 L18,70 L28,42 L26,195 L154,195 L152,42 L162,70 L185,60 L168,15 L132,15 L122,22 C110,33 70,33 58,22 Z"
        fill={color}
        stroke="#B5ADA3"
        strokeWidth="0.5"
      />
      {/* Collar neckline */}
      <path
        d="M58,22 C70,33 110,33 122,22"
        fill="none"
        stroke="#B5ADA3"
        strokeWidth="0.6"
        opacity="0.4"
      />
      {/* Cuff ribbing */}
      <line x1="26" y1="190" x2="154" y2="190" stroke="#B5ADA3" strokeWidth="0.4" opacity="0.25" />
      <line x1="26" y1="193" x2="154" y2="193" stroke="#B5ADA3" strokeWidth="0.3" opacity="0.15" />
      {/* Sleeve seams */}
      <line x1="28" y1="42" x2="26" y2="195" stroke="#B5ADA3" strokeWidth="0.15" opacity="0.12" />
      <line x1="152" y1="42" x2="154" y2="195" stroke="#B5ADA3" strokeWidth="0.15" opacity="0.12" />
      {/* Center fold */}
      <line x1="90" y1="33" x2="90" y2="192" stroke="#B5ADA3" strokeWidth="0.15" opacity="0.08" />
    </motion.svg>
  )
}
