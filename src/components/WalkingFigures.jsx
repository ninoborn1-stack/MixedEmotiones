import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

const WALLS = {
  left: -2.95,
  right: 2.95,
  back: -2.4,
  front: 2.46,
  doorLeft: -0.65,
  doorRight: 0.65,
}

// Store floor is at y=0.04, ground outside at y=-0.02
// Shelves at y=0.7 — figure should step up onto store floor
const STORE_FLOOR_Y = 0.08 // slight step up inside store
const GROUND_Y = 0

const MOVE_SPEED = 3
const ts = 0.12

export default function PlayerFigure() {
  const groupRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const posRef = useRef({ x: 4.5, z: 4 })
  const keysRef = useRef({})
  const walkPhaseRef = useRef(0)
  const facingRef = useRef(0)

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

  function isInsideStore(x, z) {
    return x > WALLS.left && x < WALLS.right && z > WALLS.back && z < WALLS.front
  }

  function isInDoor(x) {
    return x > WALLS.doorLeft && x < WALLS.doorRight
  }

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
      const len = Math.sqrt(dx * dx + dz * dz)
      dx /= len; dz /= len
      facingRef.current = Math.atan2(dx, -dz)

      const newX = pos.x + dx * MOVE_SPEED * delta
      const newZ = pos.z + dz * MOVE_SPEED * delta
      const r = 0.2

      let canX = true, canZ = true
      const inStore = isInsideStore(pos.x, pos.z)
      const newInStoreX = newX > WALLS.left && newX < WALLS.right
      const newInStoreZ = newZ > WALLS.back && newZ < WALLS.front

      if (inStore) {
        // Inside — can't go through walls
        if (newX <= WALLS.left + r) canX = false
        if (newX >= WALLS.right - r) canX = false
        if (newZ <= WALLS.back + r) canZ = false
        // Front wall — only exit through door
        if (newZ >= WALLS.front - r && !isInDoor(pos.x)) canZ = false
      } else {
        // Outside — can't enter through walls, only through door
        // Front wall
        if (pos.z >= WALLS.front && newZ < WALLS.front + r && newInStoreX) {
          if (!isInDoor(newX)) canZ = false
        }
        // Back wall
        if (pos.z <= WALLS.back && newZ > WALLS.back - r && newInStoreX) canZ = false
        // Left wall
        if (pos.x <= WALLS.left && newX > WALLS.left - r && newInStoreZ) canX = false
        // Right wall
        if (pos.x >= WALLS.right && newX < WALLS.right + r && newInStoreZ) canX = false
      }

      if (canX) pos.x = newX
      if (canZ) pos.z = newZ

      walkPhaseRef.current += delta * 10
    }

    // Floor height — step up when inside store
    const inside = isInsideStore(pos.x, pos.z)
    const targetY = inside ? STORE_FLOOR_Y : GROUND_Y
    const bob = moving ? Math.abs(Math.sin(walkPhaseRef.current)) * 0.03 : 0

    groupRef.current.position.set(pos.x, targetY + bob, pos.z)
    groupRef.current.rotation.y = facingRef.current

    // Leg + arm swing
    const swing = moving ? Math.sin(walkPhaseRef.current) * 0.6 : 0
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8
    if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.8
  })

  return (
    <group ref={groupRef} scale={0.7}>
      {/* Left leg — pivot at top */}
      <group ref={leftLegRef} position={[-0.07, 0.35, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[ts, 0.3, ts]} />
          <meshStandardMaterial color="#FAFAF8" />
        </mesh>
      </group>
      {/* Right leg */}
      <group ref={rightLegRef} position={[0.07, 0.35, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[ts, 0.3, ts]} />
          <meshStandardMaterial color="#FAFAF8" />
        </mesh>
      </group>
      {/* Body */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[ts * 2.5, 0.3, ts * 1.3]} />
        <meshStandardMaterial color="#FAFAF8" />
      </mesh>
      {/* Left arm — pivot at shoulder */}
      <group ref={leftArmRef} position={[-0.22, 0.6, 0]}>
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[ts * 0.7, 0.25, ts * 0.8]} />
          <meshStandardMaterial color="#FAFAF8" />
        </mesh>
      </group>
      {/* Right arm */}
      <group ref={rightArmRef} position={[0.22, 0.6, 0]}>
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[ts * 0.7, 0.25, ts * 0.8]} />
          <meshStandardMaterial color="#FAFAF8" />
        </mesh>
      </group>
      {/* Head */}
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[ts * 1.1, ts * 1.1, ts * 1.1]} />
        <meshStandardMaterial color="#FAFAF8" />
      </mesh>
    </group>
  )
}
