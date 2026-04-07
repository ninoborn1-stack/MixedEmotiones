import { useRef, useEffect, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const WALLS = {
  left: -2.95,
  right: 2.95,
  back: -2.4,
  front: 2.46,
  doorLeft: -1.0,
  doorRight: 1.0,
}

// Store floor is at y=0.04, ground outside at y=-0.02
// Shelves at y=0.7 — figure should step up onto store floor
const STORE_FLOOR_Y = 0.08 // slight step up inside store
const GROUND_Y = 0

const MOVE_SPEED = 3
const ts = 0.12

export default function PlayerFigure({ playerPosRef, onEnterStore, onExitStore, sharedKeysRef }) {
  const wasInsideRef = useRef(false)
  const groupRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const posRef = useRef({ x: 4.5, z: 2.5 })
  const flame1Ref = useRef()
  const flame2Ref = useRef()
  const flame3Ref = useRef()
  const keysRef = useRef({})
  const walkPhaseRef = useRef(0)
  const facingRef = useRef(0)
  const [showHint, setShowHint] = useState(true)
  const hasMovedRef = useRef(false)
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  const velYRef = useRef(0)
  const posYRef = useRef(0)
  const onGroundRef = useRef(true)

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

  useFrame((state, delta) => {
    if (!groupRef.current) return
    // Merge keyboard keys + joystick keys
    const keys = keysRef.current
    const jk = sharedKeysRef?.current || {}
    const pos = posRef.current

    let dx = 0, dz = 0
    if (keys['ArrowLeft'] || keys['a'] || jk['ArrowLeft']) dx = -1
    if (keys['ArrowRight'] || keys['d'] || jk['ArrowRight']) dx = 1
    if (keys['ArrowUp'] || keys['w'] || jk['ArrowUp']) dz = -1
    if (keys['ArrowDown'] || keys['s'] || jk['ArrowDown']) dz = 1

    const moving = dx !== 0 || dz !== 0
    if (moving && !hasMovedRef.current) {
      hasMovedRef.current = true
      setShowHint(false)
    }

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

      // Lantern collision (center [5.5, z=1.5], radius ~0.3)
      const lDx = newX - 5.5, lDz = newZ - 1.5
      if (Math.sqrt(lDx * lDx + lDz * lDz) < 0.4) {
        canX = false; canZ = false
      }

      // Fountain collision (center [-5.5, z=1.5], square basin walls)
      // Basin outer: x [-6.2, -4.8], z [0.8, 2.2]
      const fLeft = -6.25, fRight = -4.75, fBack = 0.8, fFront = 2.2
      const fWall = 0.15 // wall thickness for collision
      const inFountainX = newX > fLeft - r && newX < fRight + r
      const inFountainZ = newZ > fBack - r && newZ < fFront + r
      if (inFountainX && inFountainZ) {
        const insideFountain = pos.x > fLeft + fWall && pos.x < fRight - fWall &&
                               pos.z > fBack + fWall && pos.z < fFront - fWall
        if (!insideFountain) {
          // Outside trying to enter — block at walls
          if (pos.x <= fLeft + fWall && newX > fLeft - r) canX = false
          if (pos.x >= fRight - fWall && newX < fRight + r) canX = false
          if (pos.z <= fBack + fWall && newZ > fBack - r) canZ = false
          if (pos.z >= fFront - fWall && newZ < fFront + r) canZ = false
        }
      }

      if (canX) pos.x = newX
      if (canZ) pos.z = newZ

      walkPhaseRef.current += delta * 10
    }

    // Jump
    const GRAVITY = -12
    const JUMP_FORCE = 5

    if ((keys[' '] || keys['Space'] || jk[' ']) && onGroundRef.current) {
      velYRef.current = JUMP_FORCE
      onGroundRef.current = false
    }

    // Apply gravity
    velYRef.current += GRAVITY * delta
    posYRef.current += velYRef.current * delta

    // Floor height — base floor level
    const inside = isInsideStore(pos.x, pos.z)
    let floorY = inside ? STORE_FLOOR_Y : GROUND_Y

    // Shelf collision — can stand on shelves if above them
    // Shelves: y=0.7, thickness=0.06 → top at y=0.73
    // shelf-bl: center [-1.8, 0.7, -2.1], extents [1.2, 0.5]
    // shelf-bc: center [0, 0.7, -2.1], extents [1.0, 0.5]
    // shelf-br: center [1.8, 0.7, -2.1], extents [1.2, 0.5]
    const SHELF_TOP = 0.76
    const FOUNTAIN_TOP = 0.65
    const shelves = [
      { cx: -1.8, cz: -2.1, hw: 0.6, hd: 0.25, top: SHELF_TOP },
      { cx: 0, cz: -2.1, hw: 0.5, hd: 0.25, top: SHELF_TOP },
      { cx: 1.8, cz: -2.1, hw: 0.6, hd: 0.25, top: SHELF_TOP },
      // Fountain walls — can land on rim
      { cx: -5.5, cz: 1.5, hw: 0.75, hd: 0.75, top: FOUNTAIN_TOP },
    ]
    for (const sh of shelves) {
      if (pos.x > sh.cx - sh.hw && pos.x < sh.cx + sh.hw &&
          pos.z > sh.cz - sh.hd && pos.z < sh.cz + sh.hd) {
        if (posYRef.current >= sh.top - 0.05 && velYRef.current <= 0) {
          floorY = sh.top
        }
        if (posYRef.current < sh.top - 0.05 && velYRef.current > 0 &&
            posYRef.current + velYRef.current * delta >= sh.top - 0.05) {
          velYRef.current = 0
          posYRef.current = sh.top - 0.06
        }
      }
    }

    // Land on floor
    if (posYRef.current <= floorY) {
      posYRef.current = floorY
      velYRef.current = 0
      onGroundRef.current = true
    }

    const bob = (moving && onGroundRef.current) ? Math.abs(Math.sin(walkPhaseRef.current)) * 0.03 : 0

    groupRef.current.position.set(pos.x, posYRef.current + bob, pos.z)
    groupRef.current.rotation.y = facingRef.current

    // Detect entering/exiting store through door
    const nowInside = isInsideStore(pos.x, pos.z)
    if (nowInside && !wasInsideRef.current) {
      wasInsideRef.current = true
      onEnterStore?.()
    } else if (!nowInside && wasInsideRef.current) {
      wasInsideRef.current = false
      onExitStore?.()
    }
    if (playerPosRef) { playerPosRef.current.x = pos.x; playerPosRef.current.z = pos.z }

    // Flame animation
    const ft = state.clock.elapsedTime
    if (flame1Ref.current) flame1Ref.current.scale.y = 0.8 + Math.sin(ft * 12) * 0.3
    if (flame2Ref.current) flame2Ref.current.scale.y = 0.6 + Math.sin(ft * 15 + 1) * 0.4
    if (flame3Ref.current) flame3Ref.current.scale.y = 0.5 + Math.sin(ft * 18 + 2) * 0.3

    // Leg + arm swing
    const swing = moving ? Math.sin(walkPhaseRef.current) * 0.6 : 0
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8
    if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.8
  })

  // Load Bear Tee poster as texture for the shirt
  const teeTexture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + 'poster-left.png')
  teeTexture.colorSpace = THREE.SRGBColorSpace

  return (
    <group ref={groupRef} scale={0.7}>
      {/* Left leg */}
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
      {/* Body — Bear Tee (black with texture on front) */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[ts * 2.5, 0.3, ts * 1.3]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      {/* Bear Tee graphic on front */}
      <mesh position={[0, 0.55, ts * 0.66]}>
        <planeGeometry args={[ts * 2.4, 0.28]} />
        <meshBasicMaterial map={teeTexture} transparent alphaTest={0.5} />
      </mesh>
      {/* Left arm — full black */}
      <group ref={leftArmRef} position={[-0.22, 0.6, 0]}>
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[ts * 0.7, 0.25, ts * 0.8]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
      </group>
      {/* Right arm — full black */}
      <group ref={rightArmRef} position={[0.22, 0.6, 0]}>
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[ts * 0.7, 0.25, ts * 0.8]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
      </group>
      {/* Flame head */}
      <mesh ref={flame1Ref} position={[0, 0.78, 0]}>
        <boxGeometry args={[ts * 1.0, ts * 1.4, ts * 1.0]} />
        <meshStandardMaterial color="#FF6B1A" emissive="#FF4500" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={flame2Ref} position={[0, 0.88, 0]}>
        <boxGeometry args={[ts * 0.7, ts * 1.0, ts * 0.7]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.6} />
      </mesh>
      <mesh ref={flame3Ref} position={[0, 0.96, 0]}>
        <boxGeometry args={[ts * 0.4, ts * 0.7, ts * 0.4]} />
        <meshStandardMaterial color="#FFEE88" emissive="#FFD700" emissiveIntensity={0.8} />
      </mesh>
      {/* Arrow keys on floor (desktop) or joystick hint (mobile) */}
      {showHint && isTouchDevice && (
        <Html position={[0, 1.2, 0]} center distanceFactor={5} style={{ pointerEvents: 'none' }}>
          <div className="text-center select-none opacity-60">
            <p className="text-[8px] tracking-[0.15em] text-[#1A1A1A] font-medium animate-bounce">Use joystick</p>
          </div>
        </Html>
      )}
      {showHint && !isTouchDevice && (
        <group position={[0, 0.03, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Up key */}
          <mesh position={[0, 0.24, 0]}>
            <planeGeometry args={[0.22, 0.22]} />
            <meshBasicMaterial color="#E0DDD8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.24, 0.001]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshBasicMaterial color="#1A1A1A" side={THREE.DoubleSide} />
          </mesh>
          {/* Left key */}
          <mesh position={[-0.25, 0, 0]}>
            <planeGeometry args={[0.22, 0.22]} />
            <meshBasicMaterial color="#E0DDD8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.25, 0, 0.001]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshBasicMaterial color="#1A1A1A" side={THREE.DoubleSide} />
          </mesh>
          {/* Down key */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.22, 0.22]} />
            <meshBasicMaterial color="#E0DDD8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshBasicMaterial color="#1A1A1A" side={THREE.DoubleSide} />
          </mesh>
          {/* Right key */}
          <mesh position={[0.25, 0, 0]}>
            <planeGeometry args={[0.22, 0.22]} />
            <meshBasicMaterial color="#E0DDD8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.25, 0, 0.001]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshBasicMaterial color="#1A1A1A" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  )
}
