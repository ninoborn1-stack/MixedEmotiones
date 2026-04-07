import { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import Experience from './components/Experience'

export default function App() {
  // assembling -> exterior -> entering -> interior
  const [phase, setPhase] = useState('assembling')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [uiVisible, setUiVisible] = useState(false)
  const [pulseTime, setPulseTime] = useState(0)

  const advancePhase = useCallback(() => {
    setPhase((prev) => {
      if (prev === 'assembling') return 'exterior'
      if (prev === 'exterior') return 'entering'
      if (prev === 'entering') return 'interior'
      return prev
    })
  }, [])

  // Auto-advance from entering -> interior (smooth continuous fly-through)
  useEffect(() => {
    if (phase === 'entering') {
      const t = setTimeout(() => setPhase('interior'), 3500)
      return () => clearTimeout(t)
    }
  }, [phase])

  const goBack = useCallback(() => {
    setSelectedProduct(null)
    setPhase('exterior')
  }, [])

  useEffect(() => {
    if (phase === 'interior') {
      const t = setTimeout(() => setUiVisible(true), 1500)
      return () => clearTimeout(t)
    } else {
      setUiVisible(false)
    }
  }, [phase])

  return (
    <div
      className="w-full h-full bg-[#F8F6F3] overflow-hidden relative"
      onPointerDown={() => setPulseTime((p) => p + 1)}
    >
      <Canvas
        shadows
        camera={{ position: [14, 9, 14], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#F8F6F3']} />
        <fog attach="fog" args={['#F8F6F3', 20, 45]} />
        <Experience
          phase={phase}
          onAssemblyComplete={advancePhase}
          onEnter={advancePhase}
          selectedProduct={selectedProduct}
          onSelectProduct={setSelectedProduct}
          pulseTime={pulseTime}
        />
      </Canvas>

      {/* UI Overlays */}
      <AnimatePresence>
        {phase === 'assembling' && (
          <motion.div
            key="assembling-ui"
            className="absolute bottom-8 left-0 right-0 text-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <p className="text-[9px] tracking-[0.4em] uppercase text-[#8A8478] font-light">
              Constructing
            </p>
          </motion.div>
        )}

        {phase === 'exterior' && (
          <motion.div
            key="exterior-ui"
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute top-8 left-0 right-0 text-center">
              <h1 className="text-5xl md:text-6xl tracking-[0.3em] text-[#1A1A1A] font-bold opacity-70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                MXD MTNS
              </h1>
            </div>
            <motion.div
              className="absolute bottom-14 left-0 right-0 flex justify-center pointer-events-auto"
            >
              <motion.button
                className="px-10 py-3.5 bg-[#1A1A1A] text-[#F8F6F3] text-[11px] tracking-[0.35em] uppercase font-medium border-none cursor-pointer"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                onClick={advancePhase}
                whileHover={{ backgroundColor: '#2A2A2A', scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Enter Store
              </motion.button>
            </motion.div>
            <p className="absolute bottom-8 right-10 text-[8px] tracking-[0.3em] uppercase text-[#8A8478]/30 font-light">
              001
            </p>
          </motion.div>
        )}

        {phase === 'interior' && uiVisible && (
          <motion.div
            key="interior-ui"
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 py-7">
              <motion.button
                className="text-[10px] tracking-[0.3em] uppercase text-[#8A8478] hover:text-[#1A1A1A] transition-colors duration-300 cursor-pointer bg-transparent border-none font-light pointer-events-auto flex items-center gap-2"
                onClick={goBack}
                whileHover={{ x: -3 }}
              >
                <svg width="12" height="8" viewBox="0 0 12 8" className="opacity-50">
                  <path d="M0,4 L5,0 M0,4 L5,8 M0,4 L12,4" fill="none" stroke="currentColor" strokeWidth="0.7" />
                </svg>
                Exit
              </motion.button>
              <span className="text-2xl tracking-[0.25em] text-[#1A1A1A] font-bold opacity-60" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                MXD MTNS
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#8A8478]/40 font-light">
                001
              </span>
            </div>
            <div className="absolute bottom-7 left-0 right-0 text-center">
              <p className="text-[8px] tracking-[0.35em] uppercase text-[#8A8478]/25 font-light">
                Select to view
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            key="product-detail"
            className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="absolute inset-0 bg-[#F8F6F3]/90 backdrop-blur-md cursor-pointer"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              className="relative z-10 flex items-center gap-12 max-w-4xl mx-auto px-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Video on the left */}
              <div className="flex-shrink-0 w-[320px] h-[240px] flex items-center justify-center">
                <video
                  src={import.meta.env.BASE_URL + selectedProduct.videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="max-w-full max-h-full object-contain"
                  style={{ background: 'transparent' }}
                />
              </div>
              {/* Info on the right */}
              <div className="flex flex-col gap-4">
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#8A8478] font-light">
                  {selectedProduct.type}
                </p>
                <h2 className="font-display text-3xl tracking-wide text-[#1A1A1A] font-normal">
                  {selectedProduct.name}
                </h2>
                <p className="text-sm tracking-[0.15em] text-[#8A8478] font-light">
                  {selectedProduct.subtitle}
                </p>
                <div className="w-8 h-px bg-[#E8E4DF]" />
                <p className="text-sm leading-[1.8] text-[#8A8478] font-light max-w-xs">
                  {selectedProduct.description}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {selectedProduct.details.map((d, i) => (
                    <motion.li
                      key={i}
                      className="text-[10px] tracking-[0.1em] text-[#8A8478]/50 font-light flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                    >
                      <span className="w-2 h-px bg-[#8A8478]/20" />{d}
                    </motion.li>
                  ))}
                </ul>
                <div className="flex items-center gap-6 mt-2">
                  <span className="text-xl tracking-[0.1em] text-[#1A1A1A] font-light">
                    EUR {selectedProduct.price}
                  </span>
                  <motion.button
                    className="px-7 py-2.5 bg-[#1A1A1A] text-[#F8F6F3] text-[9px] tracking-[0.3em] uppercase font-light border-none cursor-pointer"
                    whileHover={{ backgroundColor: '#2A2A2A' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Coming Soon
                  </motion.button>
                </div>
                <button
                  className="text-[9px] tracking-[0.25em] uppercase text-[#8A8478]/30 hover:text-[#8A8478] transition-colors duration-300 cursor-pointer bg-transparent border-none font-light mt-2 self-start"
                  onClick={() => setSelectedProduct(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
