import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'

export default function StoreBlock({ targetPosition, size, delay, opacity, assembling }) {
  const meshRef = useRef()
  const materialRef = useRef()

  // Random starting position far away
  const startPos = useMemo(() => {
    const angle = Math.random() * Math.PI * 2
    const dist = 8 + Math.random() * 6
    const y = 4 + Math.random() * 8
    return new THREE.Vector3(
      Math.cos(angle) * dist,
      y,
      Math.sin(angle) * dist
    )
  }, [])

  const startRotation = useMemo(
    () => new THREE.Euler(
      (Math.random() - 0.5) * Math.PI,
      (Math.random() - 0.5) * Math.PI,
      (Math.random() - 0.5) * Math.PI * 0.5
    ),
    []
  )

  const targetPos = useMemo(() => new THREE.Vector3(...targetPosition), [targetPosition])
  const elapsedRef = useRef(0)
  const arrivedRef = useRef(false)

  useFrame((_, delta) => {
    if (!meshRef.current) return

    elapsedRef.current += delta

    // Assembly animation
    const timeAfterDelay = elapsedRef.current - delay
    if (timeAfterDelay < 0) {
      // Not yet started - stay at origin, invisible
      meshRef.current.position.copy(startPos)
      meshRef.current.rotation.copy(startRotation)
      if (materialRef.current) materialRef.current.opacity = 0
      return
    }

    // Ease-in animation over ~2 seconds
    const duration = 2.0
    const raw = Math.min(timeAfterDelay / duration, 1)
    // Smooth ease-out cubic
    const t = 1 - Math.pow(1 - raw, 3)

    // Position interpolation
    meshRef.current.position.lerpVectors(startPos, targetPos, t)

    // Rotation interpolation
    meshRef.current.rotation.x = startRotation.x * (1 - t)
    meshRef.current.rotation.y = startRotation.y * (1 - t)
    meshRef.current.rotation.z = startRotation.z * (1 - t)

    // Opacity
    if (materialRef.current) {
      materialRef.current.opacity = t * opacity
    }

    if (t >= 0.99 && !arrivedRef.current) {
      arrivedRef.current = true
      meshRef.current.position.copy(targetPos)
      meshRef.current.rotation.set(0, 0, 0)
    }
  })

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        ref={materialRef}
        color="#FAFAF8"
        transparent
        opacity={0}
        roughness={0.3}
        metalness={0}
        clearcoat={0.1}
        transmission={opacity < 0.4 ? 0.3 : 0}
        thickness={0.5}
        side={THREE.DoubleSide}
        depthWrite={opacity > 0.5}
      />
      <Edges
        threshold={15}
        color="#2A2A2A"
        linewidth={1}
        scale={1.001}
        renderOrder={1}
      />
    </mesh>
  )
}
