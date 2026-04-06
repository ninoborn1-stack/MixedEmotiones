import { useState } from 'react'
import { motion } from 'framer-motion'

const BRAND_NAME = 'MXD MTNS'

export default function StorefrontScene({ onEnter }) {
  const [hovering, setHovering] = useState(false)

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center bg-ivory relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Ambient light from above */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.7) 0%, transparent 70%)',
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Store facade */}
      <div className="relative flex flex-col items-center">
        <div className="relative" style={{ width: '70vw', maxWidth: 700, height: '72vh', maxHeight: 520 }}>
          {/* Main wall */}
          <motion.div
            className="absolute inset-0 bg-charcoal"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'bottom' }}
          />

          {/* Top accent line */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[3px] bg-warm-gray/60"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          />

          {/* Brand sign */}
          <motion.div
            className="absolute top-[8%] left-0 right-0 text-center z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <h1 className="font-display text-4xl md:text-5xl tracking-[0.45em] text-ivory font-normal">
              {BRAND_NAME}
            </h1>
            <motion.div
              className="mx-auto mt-4 h-px bg-warm-gray/50"
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              transition={{ duration: 0.8, delay: 1.3 }}
            />
          </motion.div>

          {/* Door opening */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 bg-ivory cursor-pointer overflow-hidden z-10"
            style={{ width: '38%', maxWidth: 240 }}
            initial={{ height: 0 }}
            animate={{ height: '72%' }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onClick={onEnter}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            {/* Interior warm glow */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: hovering
                  ? 'linear-gradient(180deg, #FAFAF8 0%, #F0ECE7 100%)'
                  : 'linear-gradient(180deg, #F5F0EB 0%, #E8E4DF 100%)',
              }}
              transition={{ duration: 0.5 }}
            />

            {/* Light beam from inside when hovering */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center 30%, rgba(255,255,255,0.4) 0%, transparent 60%)',
              }}
              animate={{ opacity: hovering ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            />

            {/* Tiny product silhouettes inside */}
            <motion.div
              className="absolute top-[15%] left-1/2 -translate-x-1/2 flex gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.12 }}
              transition={{ delay: 1.8 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-6 h-8 bg-charcoal rounded-[1px]"
                  animate={{ y: [0, -2, 0] }}
                  transition={{
                    duration: 3.5,
                    delay: i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>

            {/* Enter hint - subtle animated chevron */}
            <motion.div
              className="absolute bottom-[12%] left-0 right-0 flex flex-col items-center gap-2"
              animate={{ opacity: hovering ? 1 : 0.25 }}
              transition={{ duration: 0.4 }}
            >
              <motion.span
                className="text-[9px] tracking-[0.35em] uppercase text-warm-gray/70 font-light"
                animate={{ letterSpacing: hovering ? '0.45em' : '0.35em' }}
                transition={{ duration: 0.4 }}
              >
                Enter
              </motion.span>
              <motion.svg
                width="16" height="10" viewBox="0 0 16 10"
                className="text-warm-gray/40"
                animate={{ y: hovering ? 3 : [0, 2, 0] }}
                transition={hovering ? { duration: 0.3 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M1,1 L8,8 L15,1" fill="none" stroke="currentColor" strokeWidth="0.8" />
              </motion.svg>
            </motion.div>
          </motion.div>

          {/* Door frame lines */}
          <motion.div
            className="absolute left-1/2 bottom-0 w-px bg-warm-gray/25 pointer-events-none z-10"
            style={{ marginLeft: 'calc(-19% - 1px)', height: '72%', transformOrigin: 'bottom' }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          />
          <motion.div
            className="absolute left-1/2 bottom-0 w-px bg-warm-gray/25 pointer-events-none z-10"
            style={{ marginLeft: 'calc(19%)', height: '72%', transformOrigin: 'bottom' }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          />

          {/* Side display niches */}
          <motion.div
            className="absolute left-[6%] top-[28%] w-[14%] h-[42%] border border-warm-gray/15 rounded-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          />
          <motion.div
            className="absolute right-[6%] top-[28%] w-[14%] h-[42%] border border-warm-gray/15 rounded-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          />

          {/* Niche horizontal shelves */}
          <motion.div
            className="absolute left-[8%] top-[50%] w-[10%] h-px bg-warm-gray/10"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          />
          <motion.div
            className="absolute right-[8%] top-[50%] w-[10%] h-px bg-warm-gray/10"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          />
        </div>

        {/* Ground shadow */}
        <motion.div
          className="mt-1 rounded-full"
          style={{
            width: '70vw',
            maxWidth: 700,
            height: 16,
            background: 'radial-gradient(ellipse, rgba(26,26,26,0.06) 0%, transparent 70%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        />
      </div>

      {/* Collection label */}
      <motion.p
        className="absolute bottom-7 left-0 right-0 text-center text-[9px] tracking-[0.3em] uppercase text-warm-gray/40 font-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
      >
        Collection 001
      </motion.p>
    </motion.div>
  )
}
