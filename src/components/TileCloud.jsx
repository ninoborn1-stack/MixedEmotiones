import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const TILE_SIZE = 0.35
const GAP = 0.015
const ANIM_DURATION = 1.0 // seconds per tile fly-in
const WAVE_SPREAD = 0.6 // seconds of wave spread within a surface

const SURFACES = [
  // === ARCHITECTURE ===
  { id: 'floor', center: [0, 0.04, 0], extents: [6, 5], plane: 'xz', thickness: 0.08, baseDelay: 0, opacityBucket: 0 },
  { id: 'back-wall', center: [0, 1.8, -2.4], extents: [6, 3.6], plane: 'xy', thickness: 0.08, baseDelay: 0.15, opacityBucket: 1 },
  { id: 'left-wall', center: [-2.95, 1.8, 0], extents: [5, 3.6], plane: 'zy', thickness: 0.08, baseDelay: 0.25, opacityBucket: 1 },
  { id: 'right-wall', center: [2.95, 1.8, 0], extents: [5, 3.6], plane: 'zy', thickness: 0.08, baseDelay: 0.3, opacityBucket: 1 },
  { id: 'front-l', center: [-1.8, 1.8, 2.46], extents: [2.3, 3.6], plane: 'xy', thickness: 0.08, baseDelay: 0.4, opacityBucket: 1 },
  { id: 'front-r', center: [1.8, 1.8, 2.46], extents: [2.3, 3.6], plane: 'xy', thickness: 0.08, baseDelay: 0.42, opacityBucket: 1 },
  { id: 'ceiling', center: [0, 3.6, 0], extents: [6, 5], plane: 'xz', thickness: 0.06, baseDelay: 0.5, opacityBucket: 2 },
  { id: 'front-top', center: [0, 3.2, 2.46], extents: [1.5, 0.8], plane: 'xy', thickness: 0.08, baseDelay: 0.55, opacityBucket: 1 },
  // === INTERIOR FURNITURE ===
  { id: 'shelf-bl', center: [-1.8, 0.7, -2.1], extents: [1.2, 0.5], plane: 'xz', thickness: 0.06, baseDelay: 0.7, opacityBucket: 0, tileSize: 0.18 },
  { id: 'shelf-br', center: [1.8, 0.7, -2.1], extents: [1.2, 0.5], plane: 'xz', thickness: 0.06, baseDelay: 0.72, opacityBucket: 0, tileSize: 0.18 },
  { id: 'shelf-bc', center: [0, 0.7, -2.1], extents: [1.0, 0.5], plane: 'xz', thickness: 0.06, baseDelay: 0.75, opacityBucket: 0, tileSize: 0.18 },
  { id: 'rail', center: [0, 2.5, -1.5], extents: [4.5, 0.12], plane: 'xy', thickness: 0.04, baseDelay: 0.85, opacityBucket: 0, tileSize: 0.12 },
  { id: 'rail-sl', center: [-2.2, 3.05, -1.5], extents: [0.08, 1.1], plane: 'xy', thickness: 0.04, baseDelay: 0.8, opacityBucket: 0, tileSize: 0.1 },
  { id: 'rail-sr', center: [2.2, 3.05, -1.5], extents: [0.08, 1.1], plane: 'xy', thickness: 0.04, baseDelay: 0.8, opacityBucket: 0, tileSize: 0.1 },
  { id: 'sign', center: [0, 3.0, -2.33], extents: [2.0, 0.3], plane: 'xy', thickness: 0.04, baseDelay: 0.9, opacityBucket: 0, tileSize: 0.15 },
]

const BUCKET_OPACITIES = [0.85, 0.3, 0.12]

function generateTiles() {
  const tiles = [[], [], []]

  for (const surface of SURFACES) {
    const [extW, extH] = surface.extents
    const ts = surface.tileSize || TILE_SIZE
    const step = ts + GAP
    const cols = Math.max(1, Math.floor(extW / step))
    const rows = Math.max(1, Math.floor(extH / step))
    const offsetW = (cols * step - GAP) / 2
    const offsetH = (rows * step - GAP) / 2

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const localU = c * step + ts / 2 - offsetW
        const localV = r * step + ts / 2 - offsetH

        let wx, wy, wz, sx, sy, sz
        const [cx, cy, cz] = surface.center
        const thk = surface.thickness

        if (surface.plane === 'xz') {
          wx = cx + localU; wy = cy; wz = cz + localV
          sx = ts; sy = thk; sz = ts
        } else if (surface.plane === 'xy') {
          wx = cx + localU; wy = cy + localV - extH / 2 + offsetH; wz = cz
          sx = ts; sy = ts; sz = thk
        } else {
          wx = cx; wy = cy + localV - extH / 2 + offsetH; wz = cz + localU
          sx = thk; sy = ts; sz = ts
        }

        // Wave delay — radial for floors/ceilings, bottom-up for walls
        let waveT
        if (surface.plane === 'xz') {
          const nc = c / (cols - 1 || 1) - 0.5
          const nr = r / (rows - 1 || 1) - 0.5
          waveT = Math.sqrt(nc * nc + nr * nr) / 0.707
        } else {
          waveT = 1 - r / (rows - 1 || 1)
        }

        const delay = surface.baseDelay + waveT * WAVE_SPREAD

        // Start position — closer (4-8 units away) for faster, cleaner fly-in
        const angle = Math.random() * Math.PI * 2
        const dist = 4 + Math.random() * 4
        const startY = wy + 3 + Math.random() * 5

        tiles[surface.opacityBucket].push({
          tx: wx, ty: wy, tz: wz,
          sx, sy, sz,
          ox: wx + Math.cos(angle) * dist,
          oy: startY,
          oz: wz + Math.sin(angle) * dist,
          rx: (Math.random() - 0.5) * 1.2,
          ry: (Math.random() - 0.5) * 1.2,
          rz: (Math.random() - 0.5) * 0.6,
          delay,
        })
      }
    }
  }

  return tiles
}

export default function TileCloud({ onSettled }) {
  const groupRef = useRef()
  const elapsedRef = useRef(0)
  const settledRef = useRef(false)
  const meshRefs = [useRef(), useRef(), useRef()]
  const dummy = useRef(new THREE.Object3D())

  const buckets = useMemo(generateTiles, [])

  const maxDelay = useMemo(() => {
    let max = 0
    for (const bucket of buckets) {
      for (const tile of bucket) {
        if (tile.delay > max) max = tile.delay
      }
    }
    return max
  }, [buckets])

  // Initialize all instances to zero scale
  useEffect(() => {
    const d = dummy.current
    for (let b = 0; b < 3; b++) {
      const mesh = meshRefs[b].current
      if (!mesh) continue
      d.scale.set(0, 0, 0)
      d.updateMatrix()
      for (let i = 0; i < buckets[b].length; i++) {
        mesh.setMatrixAt(i, d.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    }
  }, [buckets])

  useFrame((_, delta) => {
    if (settledRef.current) return

    elapsedRef.current += delta
    const elapsed = elapsedRef.current
    const d = dummy.current
    let allDone = true

    for (let b = 0; b < 3; b++) {
      const mesh = meshRefs[b].current
      if (!mesh) continue
      const tiles = buckets[b]

      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i]
        const timeAfterDelay = elapsed - t.delay

        if (timeAfterDelay < 0) {
          d.position.set(t.ox, t.oy, t.oz)
          d.rotation.set(t.rx, t.ry, t.rz)
          d.scale.set(0, 0, 0)
          allDone = false
        } else if (timeAfterDelay < ANIM_DURATION) {
          const raw = timeAfterDelay / ANIM_DURATION
          // Smooth ease-out quart for snappy arrival
          const p = 1 - Math.pow(1 - raw, 4)

          d.position.set(
            t.ox + (t.tx - t.ox) * p,
            t.oy + (t.ty - t.oy) * p,
            t.oz + (t.tz - t.oz) * p
          )
          d.rotation.set(
            t.rx * (1 - p),
            t.ry * (1 - p),
            t.rz * (1 - p)
          )
          // Scale snaps in quickly — full size by 30% of animation
          const scaleP = Math.min(raw / 0.3, 1)
          d.scale.set(t.sx * scaleP, t.sy * scaleP, t.sz * scaleP)
          allDone = false
        } else {
          // Settled — exact target
          d.position.set(t.tx, t.ty, t.tz)
          d.rotation.set(0, 0, 0)
          d.scale.set(t.sx, t.sy, t.sz)
        }

        d.updateMatrix()
        mesh.setMatrixAt(i, d.matrix)
      }

      mesh.instanceMatrix.needsUpdate = true
    }

    if (allDone && !settledRef.current) {
      settledRef.current = true
      onSettled?.()
    }
  })

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])

  return (
    <group ref={groupRef}>
      {buckets.map((bucket, b) => (
        <instancedMesh
          key={b}
          ref={meshRefs[b]}
          args={[geometry, undefined, bucket.length]}
          castShadow
          receiveShadow
          renderOrder={b}
        >
          <meshPhysicalMaterial
            color="#FAFAF8"
            transparent
            opacity={BUCKET_OPACITIES[b]}
            roughness={0.3}
            metalness={0}
            clearcoat={0.05}
            transmission={b >= 1 ? 0.15 : 0}
            thickness={0.3}
            side={THREE.DoubleSide}
            depthWrite={b === 0}
          />
        </instancedMesh>
      ))}
    </group>
  )
}
