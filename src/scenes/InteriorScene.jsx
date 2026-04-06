import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import ProductDetail from '../components/ProductDetail'

const BRAND_NAME = 'MXD MTNS'

const products = [
  {
    id: 1,
    name: 'Essential Tee',
    subtitle: 'Midnight',
    price: '89',
    color: '#1A1A1A',
    type: 'T-Shirt',
    description: 'Premium heavyweight cotton. Relaxed fit. Minimal branding.',
    details: ['100% organic cotton', '240 GSM', 'Relaxed fit', 'Made in Portugal'],
  },
  {
    id: 2,
    name: 'Essential Tee',
    subtitle: 'Bone',
    price: '89',
    color: '#F5F0EB',
    type: 'T-Shirt',
    description: 'Premium heavyweight cotton. Relaxed fit. Minimal branding.',
    details: ['100% organic cotton', '240 GSM', 'Relaxed fit', 'Made in Portugal'],
  },
  {
    id: 3,
    name: 'Archive Pullover',
    subtitle: 'Stone',
    price: '149',
    color: '#C4B9AC',
    type: 'Pullover',
    description: 'Brushed fleece interior. Oversized silhouette. Drop shoulder.',
    details: ['80% cotton, 20% polyester', '380 GSM', 'Oversized fit', 'Made in Portugal'],
  },
]

export default function InteriorScene({ onExit }) {
  const [selected, setSelected] = useState(null)

  return (
    <motion.div
      className="w-full h-full bg-off-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Room architecture - ceiling beam */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px] bg-charcoal/5"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
      />

      {/* Side wall accents */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-charcoal/5 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-charcoal/5 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />

      {/* Ambient ceiling light */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-72 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.9) 0%, transparent 60%)',
        }}
      />

      {/* Subtle floor gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(232,228,223,0.3) 0%, transparent 100%)',
        }}
      />

      {/* Top bar */}
      <motion.nav
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 py-7 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <motion.button
          onClick={onExit}
          className="text-[10px] tracking-[0.3em] uppercase text-warm-gray hover:text-charcoal transition-colors duration-300 cursor-pointer bg-transparent border-none font-light flex items-center gap-2"
          whileHover={{ x: -3 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="14" height="8" viewBox="0 0 14 8" className="opacity-50">
            <path d="M0,4 L6,0 M0,4 L6,8 M0,4 L14,4" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </svg>
          Exit
        </motion.button>
        <span className="font-display text-lg tracking-[0.35em] text-charcoal font-normal">
          {BRAND_NAME}
        </span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-warm-gray/50 font-light">
          001
        </span>
      </motion.nav>

      {/* Ceiling rail line (products hang from this) */}
      <motion.div
        className="absolute top-20 left-[15%] right-[15%] h-px bg-light-gray/50"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Main content */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex items-start gap-16 md:gap-24 px-8 -mt-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4 + i * 0.15,
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ProductCard
                product={product}
                index={i}
                onClick={() => setSelected(product)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating dust particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-warm-gray/8 pointer-events-none"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 4) * 20}%`,
          }}
          animate={{
            y: [0, -30 - i * 5, 0],
            x: [0, (i % 2 === 0 ? 8 : -8), 0],
            opacity: [0, 0.2, 0],
          }}
          transition={{
            duration: 5 + i * 0.7,
            delay: i * 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Bottom indicator */}
      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <div className="w-6 h-px bg-light-gray" />
        <span className="text-[8px] tracking-[0.35em] uppercase text-warm-gray/30 font-light">
          Select to view
        </span>
        <div className="w-6 h-px bg-light-gray" />
      </motion.div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selected && (
          <ProductDetail
            product={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
