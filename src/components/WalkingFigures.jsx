import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Each figure is a simple block-person: legs, body, head
// They walk across the plaza on different paths
const FIGURES = [
  // Near figures (front of store)
  { id: 1, startX: -12, endX: 12, z: 5, speed: 0.8, delay: 2, scale: 0.6 },
  { id: 2, startX: 10, endX: -10, z: 7, speed: 0.6, delay: 3.5, scale: 0.55 },
  // Mid-distance
  { id: 3, startX: -14, endX: 14, z: -5, speed: 0.5, delay: 1, scale: 0.5 },
  { id: 4, startX: 12, endX: -12, z: -7, speed: 0.7, delay: 4, scale: 0.45 },
  // Far background
  { id: 5, startX: -16, endX: 16, z: -12, speed: 0.4, delay: 0.5, scale: 0.35 },
  { id: 6, startX: 14, endX: -14, z: -14, speed: 0.35, delay: 2.5, scale: 0.3 },
  // Crossing near store
  { id: 7, startX: -8, endX: 8, z: 3.5, speed: 0.9, delay: 5, scale: 0.6 },
  { id: 8, startX: 15, endX: -15, z: 9, speed: 0.45, delay: 1.5, scale: 0.4 },
]

function BlockFigure({ figure }) {
  const groupRef = useRef()
  const legPhaseRef = useRef(0)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const { startX, endX, z, speed, delay, scale } = figure

    // Loop position along path
    const elapsed = Math.max(0, t - delay)
    const pathLen = Math.abs(endX - startX)
    const progress = (elapsed * speed) % pathLen
    const dir = endX > startX ? 1 : -1
    const x = startX + progress * dir

    groupRef.current.position.set(x, 0, z)
    groupRef.current.scale.setScalar(scale)

    // Walking bob
    legPhaseRef.current = elapsed * speed * 8
    const bob = Math.abs(Math.sin(legPhaseRef.current)) * 0.03
    groupRef.current.position.y = bob
  })

  const ts = 0.12 // tile size for figure blocks

  return (
    <group ref={groupRef}>
      {/* Left leg */}
      <mesh position={[-0.06, 0.2, 0]}>
        <boxGeometry args={[ts, 0.35, ts]} />
        <meshStandardMaterial color="#FAFAF8" />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.06, 0.2, 0]}>
        <boxGeometry args={[ts, 0.35, ts]} />
        <meshStandardMaterial color="#FAFAF8" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[ts * 2.2, 0.35, ts * 1.2]} />
        <meshStandardMaterial color="#FAFAF8" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[ts, ts, ts]} />
        <meshStandardMaterial color="#FAFAF8" />
      </mesh>
    </group>
  )
}

export default function WalkingFigures() {
  return (
    <group>
      {FIGURES.map((fig) => (
        <BlockFigure key={fig.id} figure={fig} />
      ))}
    </group>
  )
}
