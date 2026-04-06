import { motion } from 'framer-motion'

export default function ProductDetail({ product, onClose }) {
  const isTshirt = product.type === 'T-Shirt'
  const isDark = product.color === '#1A1A1A'
  const strokeColor = isDark ? '#333' : product.type === 'Pullover' ? '#B5ADA3' : '#D5D0CB'

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-ivory/92 backdrop-blur-md cursor-pointer"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Close button - top right */}
      <motion.button
        className="absolute top-8 right-10 z-20 text-[10px] tracking-[0.3em] uppercase text-warm-gray hover:text-charcoal transition-colors duration-300 cursor-pointer bg-transparent border-none font-light flex items-center gap-2"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ x: 3 }}
      >
        Close
        <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-50">
          <path d="M1,1 L9,9 M9,1 L1,9" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      </motion.button>

      {/* Content */}
      <motion.div
        className="relative z-10 flex items-center gap-20 max-w-5xl mx-auto px-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Product visual */}
        <motion.div
          className="flex-shrink-0 relative"
          style={{ width: 300, height: isTshirt ? 340 : 380 }}
        >
          {/* Subtle glow behind product */}
          <div
            className="absolute inset-0 -m-8"
            style={{
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 60%)',
            }}
          />
          <motion.div
            className="relative w-full h-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {isTshirt ? (
              <svg viewBox="0 0 160 180" className="w-full h-full drop-shadow-md">
                <path
                  d="M40,10 L20,10 L5,45 L25,55 L32,38 L32,170 L128,170 L128,38 L135,55 L155,45 L140,10 L120,10 L110,18 C100,28 60,28 50,18 Z"
                  fill={product.color}
                  stroke={strokeColor}
                  strokeWidth="0.5"
                />
                <path d="M50,18 C60,28 100,28 110,18" fill="none" stroke={strokeColor} strokeWidth="0.6" opacity="0.4" />
                <line x1="32" y1="38" x2="32" y2="170" stroke={strokeColor} strokeWidth="0.15" opacity="0.12" />
                <line x1="128" y1="38" x2="128" y2="170" stroke={strokeColor} strokeWidth="0.15" opacity="0.12" />
              </svg>
            ) : (
              <svg viewBox="0 0 180 210" className="w-full h-full drop-shadow-md">
                <path
                  d="M48,15 L12,15 L-5,60 L18,70 L28,42 L26,195 L154,195 L152,42 L162,70 L185,60 L168,15 L132,15 L122,22 C110,33 70,33 58,22 Z"
                  fill={product.color}
                  stroke="#B5ADA3"
                  strokeWidth="0.5"
                />
                <path d="M58,22 C70,33 110,33 122,22" fill="none" stroke="#B5ADA3" strokeWidth="0.6" opacity="0.4" />
                <line x1="26" y1="190" x2="154" y2="190" stroke="#B5ADA3" strokeWidth="0.4" opacity="0.2" />
              </svg>
            )}
          </motion.div>

          {/* Shadow */}
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: '70%',
              height: 8,
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.06) 0%, transparent 70%)',
            }}
            animate={{ scaleX: [1, 0.95, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Product info */}
        <div className="flex flex-col gap-5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <p className="text-[9px] tracking-[0.35em] uppercase text-warm-gray font-light mb-2">
              {product.type}
            </p>
            <h2 className="font-display text-4xl tracking-wide text-charcoal font-normal leading-tight">
              {product.name}
            </h2>
            <p className="text-sm tracking-[0.15em] text-warm-gray mt-1.5 font-light">
              {product.subtitle}
            </p>
          </motion.div>

          <motion.div
            className="w-8 h-px bg-light-gray"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />

          <motion.p
            className="text-sm leading-[1.8] text-warm-gray max-w-[280px] font-light"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {product.description}
          </motion.p>

          <ul className="flex flex-col gap-2 mt-1">
            {product.details.map((detail, i) => (
              <motion.li
                key={i}
                className="text-[11px] tracking-[0.1em] text-warm-gray/60 font-light flex items-center gap-2"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
              >
                <span className="w-3 h-px bg-warm-gray/30" />
                {detail}
              </motion.li>
            ))}
          </ul>

          <motion.div
            className="flex items-center gap-8 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-xl tracking-[0.1em] text-charcoal font-light">
              EUR {product.price}
            </span>
            <motion.button
              className="px-8 py-3 bg-charcoal text-ivory text-[9px] tracking-[0.3em] uppercase font-light border-none cursor-pointer"
              whileHover={{ backgroundColor: '#2A2A2A', scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              Coming Soon
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
