import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const TILE_SIZE = 0.35
const GAP = 0.015
const ANIM_DURATION = 1.6
const WAVE_SPREAD = 0.8

const SURFACES = [
  { id: 'floor', center: [0, 0.04, 0], extents: [6, 5], plane: 'xz', thickness: 0.08, baseDelay: 0, opacityBucket: 0 },
  { id: 'back-wall', center: [0, 1.8, -2.4], extents: [6, 3.6], plane: 'xy', thickness: 0.08, baseDelay: 0.2, opacityBucket: 1 },
  { id: 'left-wall', center: [-2.95, 1.8, 0], extents: [5, 3.6], plane: 'zy', thickness: 0.08, baseDelay: 0.4, opacityBucket: 1 },
  { id: 'right-wall', center: [2.95, 1.8, 0], extents: [5, 3.6], plane: 'zy', thickness: 0.08, baseDelay: 0.5, opacityBucket: 1 },
  { id: 'front-l', center: [-1.8, 1.8, 2.46], extents: [2.3, 3.6], plane: 'xy', thickness: 0.08, baseDelay: 0.6, opacityBucket: 1 },
  { id: 'front-r', center: [1.8, 1.8, 2.46], extents: [2.3, 3.6], plane: 'xy', thickness: 0.08, baseDelay: 0.65, opacityBucket: 1 },
  { id: 'ceiling', center: [0, 3.6, 0], extents: [6, 5], plane: 'xz', thickness: 0.06, baseDelay: 0.8, opacityBucket: 2 },
  { id: 'front-top', center: [0, 3.2, 2.46], extents: [1.5, 0.8], plane: 'xy', thickness: 0.08, baseDelay: 0.9, opacityBucket: 1 },
  { id: 'shelf-bl', center: [-1.8, 0.7, -2.1], extents: [1.2, 0.5], plane: 'xz', thickness: 0.06, baseDelay: 1.1, opacityBucket: 0, tileSize: 0.18 },
  { id: 'shelf-br', center: [1.8, 0.7, -2.1], extents: [1.2, 0.5], plane: 'xz', thickness: 0.06, baseDelay: 1.15, opacityBucket: 0, tileSize: 0.18 },
  { id: 'shelf-bc', center: [0, 0.7, -2.1], extents: [1.0, 0.5], plane: 'xz', thickness: 0.06, baseDelay: 1.2, opacityBucket: 0, tileSize: 0.18 },
  { id: 'rail', center: [0, 2.5, -1.5], extents: [4.5, 0.12], plane: 'xy', thickness: 0.04, baseDelay: 1.35, opacityBucket: 0, tileSize: 0.12 },
  { id: 'rail-sl', center: [-2.2, 3.05, -1.5], extents: [0.08, 1.1], plane: 'xy', thickness: 0.04, baseDelay: 1.3, opacityBucket: 0, tileSize: 0.1 },
  { id: 'rail-sr', center: [2.2, 3.05, -1.5], extents: [0.08, 1.1], plane: 'xy', thickness: 0.04, baseDelay: 1.3, opacityBucket: 0, tileSize: 0.1 },
  { id: 'sign', center: [0, 3.0, -2.33], extents: [2.0, 0.3], plane: 'xy', thickness: 0.04, baseDelay: 1.45, opacityBucket: 0, tileSize: 0.15 },
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

        let waveT
        if (surface.plane === 'xz') {
          const nc = c / (cols - 1 || 1) - 0.5
          const nr = r / (rows - 1 || 1) - 0.5
          waveT = Math.sqrt(nc * nc + nr * nr) / 0.707
        } else {
          waveT = 1 - r / (rows - 1 || 1)
        }

        const delay = surface.baseDelay + waveT * WAVE_SPREAD

        // Start: gently above and slightly offset — no wild scatter
        const offsetX = (Math.random() - 0.5) * 2
        const offsetZ = (Math.random() - 0.5) * 2
        const offsetY = 2 + Math.random() * 3

        tiles[surface.opacityBucket].push({
          tx: wx, ty: wy, tz: wz,
          sx, sy, sz,
          ox: wx + offsetX,
          oy: wy + offsetY,
          oz: wz + offsetZ,
          // Gentle rotation only
          rx: (Math.random() - 0.5) * 0.4,
          ry: (Math.random() - 0.5) * 0.4,
          rz: (Math.random() - 0.5) * 0.2,
          delay,
          settled: false,
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

  // Initialize: tiles start invisible
  useEffect(() => {
    const d = dummy.current
    d.scale.set(0, 0, 0)
    d.updateMatrix()
    for (let b = 0; b < 3; b++) {
      const mesh = meshRefs[b].current
      if (!mesh) continue
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
    const needsUpdate = [false, false, false]

    for (let b = 0; b < 3; b++) {
      const mesh = meshRefs[b].current
      if (!mesh) continue
      const tiles = buckets[b]

      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i]
        if (t.settled) continue // skip already settled tiles

        const timeAfterDelay = elapsed - t.delay

        if (timeAfterDelay < 0) {
          // Not started — invisible
          allDone = false
          continue
        }

        needsUpdate[b] = true

        if (timeAfterDelay >= ANIM_DURATION) {
          d.position.set(t.tx, t.ty, t.tz)
          d.rotation.set(0, 0, 0)
          d.scale.set(t.sx, t.sy, t.sz)
          d.updateMatrix()
          mesh.setMatrixAt(i, d.matrix)
          t.settled = true
          continue
        }

        const raw = timeAfterDelay / ANIM_DURATION
        const p = 1 - Math.pow(1 - raw, 3) // ease-out cubic

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
        // Smooth scale-in over first 40% of animation
        const scaleP = Math.min(raw / 0.4, 1)
        const smoothScale = scaleP * scaleP * (3 - 2 * scaleP) // smoothstep
        d.scale.set(t.sx * smoothScale, t.sy * smoothScale, t.sz * smoothScale)
        d.updateMatrix()
        mesh.setMatrixAt(i, d.matrix)
        allDone = false
      }

      if (needsUpdate[b]) {
        mesh.instanceMatrix.needsUpdate = true
      }
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
          castShadow={b === 0}
          receiveShadow={b === 0}
          renderOrder={b}
        >
          <meshStandardMaterial
            color="#FAFAF8"
            transparent
            opacity={BUCKET_OPACITIES[b]}
            roughness={0.35}
            metalness={0}
            side={THREE.DoubleSide}
            depthWrite={b === 0}
          />
        </instancedMesh>
      ))}
    </group>
  )
}
