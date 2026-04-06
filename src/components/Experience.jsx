import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import TileCloud from './TileCloud'
import GarmentDisplay from './GarmentDisplay'

const PRODUCTS = [
  {
    id: 1,
    name: 'Essential Tee',
    subtitle: 'Midnight',
    price: '89',
    type: 'T-Shirt',
    color: '#1A1A1A',
    description: 'Premium heavyweight cotton. Relaxed fit. Minimal branding.',
    details: ['100% organic cotton', '240 GSM', 'Relaxed fit', 'Made in Portugal'],
    position: [-1.3, 1.6, -1.5],
  },
  {
    id: 2,
    name: 'Essential Tee',
    subtitle: 'Bone',
    price: '89',
    type: 'T-Shirt',
    color: '#EDE8E2',
    description: 'Premium heavyweight cotton. Relaxed fit. Minimal branding.',
    details: ['100% organic cotton', '240 GSM', 'Relaxed fit', 'Made in Portugal'],
    position: [0, 1.6, -1.7],
  },
  {
    id: 3,
    name: 'Archive Pullover',
    subtitle: 'Stone',
    price: '149',
    type: 'Pullover',
    color: '#B8AFA5',
    description: 'Brushed fleece interior. Oversized silhouette. Drop shoulder.',
    details: ['80% cotton, 20% polyester', '380 GSM', 'Oversized fit', 'Made in Portugal'],
    position: [1.3, 1.6, -1.5],
  },
]

const CAMERA_TARGETS = {
  assembling: { pos: [10, 7, 10], lookAt: [0, 1.5, 0] },
  exterior: { pos: [0, 2.2, 8], lookAt: [0, 1.5, 0] },
  entering: { pos: [0, 1.8, 3.5], lookAt: [0, 1.5, -1] },
  interior: { pos: [0, 1.9, 2.4], lookAt: [0, 1.2, -1.8] },
}

export default function Experience({ phase, onAssemblyComplete, onEnter, selectedProduct, onSelectProduct }) {
  const groupRef = useRef()

  const handleTilesSettled = useCallback(() => {
    setTimeout(onAssemblyComplete, 1200)
  }, [onAssemblyComplete])

  useEffect(() => {
    if (phase === 'entering') {
      const timer = setTimeout(onEnter, 2000)
      return () => clearTimeout(timer)
    }
  }, [phase, onEnter])

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 3]}
        intensity={0.8}
        castShadow
        shadow-mapSize={1024}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />
      <hemisphereLight args={['#FAFAF8', '#E0DDD8', 0.4]} />
      <Environment preset="studio" environmentIntensity={0.15} />

      <CameraController phase={phase} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#F5F2EF" />
      </mesh>

      <group ref={groupRef}>
        {/* Everything built from tiles */}
        <TileCloud onSettled={handleTilesSettled} />

        {/* Products */}
        {(phase === 'interior' || phase === 'entering') &&
          PRODUCTS.map((product) => (
            <GarmentDisplay
              key={product.id}
              product={product}
              position={product.position}
              onClick={() => onSelectProduct(product)}
              visible={phase === 'interior'}
            />
          ))}
      </group>
    </>
  )
}

function CameraController({ phase }) {
  const { camera } = useThree()
  const target = CAMERA_TARGETS[phase]
  const lookAtRef = useRef(new THREE.Vector3(...CAMERA_TARGETS.assembling.lookAt))

  useFrame((_, delta) => {
    // Slower camera for assembling->exterior transition, medium for entering
    const speed = phase === 'assembling' ? 0.6 : phase === 'exterior' ? 0.8 : phase === 'entering' ? 1.0 : 1.5
    const t = 1 - Math.pow(0.001, delta * speed)

    camera.position.lerp(new THREE.Vector3(...target.pos), t)
    lookAtRef.current.lerp(new THREE.Vector3(...target.lookAt), t)
    camera.lookAt(lookAtRef.current)
  })

  return null
}
