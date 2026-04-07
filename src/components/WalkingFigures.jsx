import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'

// Store walls for collision
const WALLS = {
  left: -2.95,
  right: 2.95,
  back: -2.4,
  front: 2.46,
  // Door opening (gap in front wall)
  doorLeft: -0.65,
  doorRight: 0.65,
}

const MOVE_SPEED = 3
const ts = 0.12

export default function PlayerFigure() {
  const groupRef = useRef()
  const posRef = useRef({ x: 4.5, z: 4 }) // Start next to store
  const keysRef = useRef({})
  const walkPhaseRef = useRef(0)
  const facingRef = useRef(0) // rotation Y

  useEffect(() => {
    const onDown = (e) => { keysRef.current[e.key] = true }
    const onUp = (e) => { keysRef.current[e.key] = false }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const keys = keysRef.current
    const pos = posRef.current

    let dx = 0, dz = 0
    if (keys['ArrowLeft'] || keys['a']) dx = -1
    if (keys['ArrowRight'] || keys['d']) dx = 1
    if (keys['ArrowUp'] || keys['w']) dz = -1
    if (keys['ArrowDown'] || keys['s']) dz = 1

    const moving = dx !== 0 || dz !== 0

    if (moving) {
      // Normalize diagonal
      const len = Math.sqrt(dx * dx + dz * dz)
      dx /= len
      dz /= len

      const newX = pos.x + dx * MOVE_SPEED * delta
      const newZ = pos.z + dz * MOVE_SPEED * delta

      // Facing direction
      facingRef.current = Math.atan2(dx, -dz)

      // Collision detection
      const r = 0.2 // figure radius
      let canMoveX = true
      let canMoveZ = true

      // Check if inside store bounds (z-wise)
      const insideZ = pos.z > WALLS.back && pos.z < WALLS.front
      const wouldBeInsideZ = newZ > WALLS.back && newZ < WALLS.front
      const insideX = pos.x > WALLS.left && pos.x < WALLS.right

      // Check wall collisions
      if (wouldBeInsideZ || insideZ) {
        // Left wall
        if (newX > WALLS.left - r && newX < WALLS.left + r && insideZ) canMoveX = false
        // Right wall
        if (newX < WALLS.right + r && newX > WALLS.right - r && insideZ) canMoveX = false

        // Front wall (with door gap)
        if (insideX) {
          const inDoor = pos.x > WALLS.doorLeft && pos.x < WALLS.doorRight
          if (!inDoor) {
            if (newZ > WALLS.front - r && newZ < WALLS.front + r) canMoveZ = false
          }
        }

        // Back wall
        if (insideX && newZ < WALLS.back + r && newZ > WALLS.back - r) canMoveZ = false
      }

      // Entering from outside — check front wall
      if (!insideZ && wouldBeInsideZ && insideX) {
        // Coming from front
        if (pos.z >= WALLS.front) {
          const inDoor = newX > WALLS.doorLeft && newX < WALLS.doorRight
          if (!inDoor) canMoveZ = false
        }
      }

      // Side walls from outside
      if (!insideX && newX > WALLS.left - r && newX < WALLS.right + r) {
        if (wouldBeInsideZ && pos.z > WALLS.back && pos.z < WALLS.front) {
          // Already checked above
        } else if (newZ > WALLS.back - r && newZ < WALLS.front + r) {
          // Approaching side wall from outside
          if (pos.x <= WALLS.left && newX > WALLS.left - r) canMoveX = false
          if (pos.x >= WALLS.right && newX < WALLS.right + r) canMoveX = false
        }
      }

      if (canMoveX) pos.x = newX
      if (canMoveZ) pos.z = newZ

      // Walk animation
      walkPhaseRef.current += delta * 12
    }

    const bob = moving ? Math.abs(Math.sin(walkPhaseRef.current)) * 0.04 : 0
    groupRef.current.position.set(pos.x, bob, pos.z)
    groupRef.current.rotation.y = facingRef.current
  })

  return (
    <group ref={groupRef} scale={0.7}>
      {/* Left leg */}
      <mesh position={[-0.07, 0.18, 0]}>
        <boxGeometry args={[ts, 0.3, ts]} />
        <meshStandardMaterial color="#FAFAF8" />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.07, 0.18, 0]}>
        <boxGeometry args={[ts, 0.3, ts]} />
        <meshStandardMaterial color="#FAFAF8" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[ts * 2.5, 0.3, ts * 1.3]} />
        <meshStandardMaterial color="#FAFAF8" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.2, 0.45, 0]}>
        <boxGeometry args={[ts * 0.7, 0.25, ts * 0.8]} />
        <meshStandardMaterial color="#FAFAF8" />
      </mesh>
      <mesh position={[0.2, 0.45, 0]}>
        <boxGeometry args={[ts * 0.7, 0.25, ts * 0.8]} />
        <meshStandardMaterial color="#FAFAF8" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[ts * 1.1, ts * 1.1, ts * 1.1]} />
        <meshStandardMaterial color="#FAFAF8" />
      </mesh>
    </group>
  )
}
