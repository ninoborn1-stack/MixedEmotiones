import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export default function GarmentDisplay({ product, position, onClick, visible }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const isTshirt = product.type === 'T-Shirt'
  const floatOffset = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime + floatOffset.current

    // Gentle float
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.04
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.02

    // Hover lift
    const targetScale = hovered ? 1.08 : 1
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    )
  })

  if (!visible) return null

  return (
    <group
      ref={groupRef}
      position={position}
      scale={0.7}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerEnter={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerLeave={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      {/* Hanger wire */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 1.6, 8]} />
        <meshStandardMaterial color="#C0B8AE" transparent opacity={0.5} />
      </mesh>

      {/* Hanger bar */}
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.5, 8]} />
        <meshStandardMaterial color="#A09890" />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.5, 8]} />
        <meshStandardMaterial color="#A09890" />
      </mesh>

      {/* Garment body - flat panel representation */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <boxGeometry args={isTshirt ? [0.6, 0.7, 0.04] : [0.65, 0.8, 0.05]} />
        <meshPhysicalMaterial
          color={product.color}
          roughness={0.8}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sleeves */}
      {/* Left sleeve */}
      <mesh
        position={isTshirt ? [-0.38, -0.15, 0] : [-0.42, -0.12, 0]}
        rotation={[0, 0, isTshirt ? 0.4 : 0.3]}
        castShadow
      >
        <boxGeometry args={isTshirt ? [0.22, 0.25, 0.035] : [0.25, 0.4, 0.045]} />
        <meshPhysicalMaterial
          color={product.color}
          roughness={0.8}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Right sleeve */}
      <mesh
        position={isTshirt ? [0.38, -0.15, 0] : [0.42, -0.12, 0]}
        rotation={[0, 0, isTshirt ? -0.4 : -0.3]}
        castShadow
      >
        <boxGeometry args={isTshirt ? [0.22, 0.25, 0.035] : [0.25, 0.4, 0.045]} />
        <meshPhysicalMaterial
          color={product.color}
          roughness={0.8}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Collar notch */}
      <mesh position={[0, 0.02, 0.025]}>
        <boxGeometry args={[0.15, 0.06, 0.01]} />
        <meshStandardMaterial color="#F5F2EF" />
      </mesh>

      {/* Label tag */}
      <Html
        position={[0, -0.9, 0]}
        center
        distanceFactor={6}
        style={{
          opacity: hovered ? 1 : 0.5,
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
        }}
      >
        <div className="text-center select-none whitespace-nowrap">
          <p className="text-[7px] tracking-[0.3em] uppercase text-[#8A8478] font-light mb-0.5">
            {product.type}
          </p>
          <p className="font-display text-[11px] tracking-wide text-[#1A1A1A]">
            {product.name}
          </p>
          <p className="text-[7px] tracking-[0.15em] text-[#8A8478] mt-0.5">
            {product.subtitle}
          </p>
        </div>
      </Html>
    </group>
  )
}
