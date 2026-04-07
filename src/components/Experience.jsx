import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import TileCloud from './TileCloud'
import PlayerFigure from './WalkingFigures'
import VideoGarment from './VideoGarment'

const PRODUCTS = [
  {
    id: 1,
    name: 'Bear Tee',
    subtitle: 'Black',
    price: '65',
    type: 'T-Shirt',
    color: '#1A1A1A',
    description: 'Premium heavyweight cotton. Relaxed fit. Bear graphic print.',
    details: ['100% organic cotton', '240 GSM', 'Relaxed fit', 'Made in Portugal', 'Ab 2 Produkten Lieferung inkl.'],
    position: [-1.8, 1.5, -1.8],
    displayScale: 1.0,
    videoSrc: 'TL.mp4',
    posterSrc: 'poster-left.png',
    bgType: 'white',
  },
  {
    id: 2,
    name: 'MXD Hoodie',
    subtitle: 'Black',
    price: '125',
    type: 'Hoodie',
    color: '#1A1A1A',
    description: 'Brushed fleece interior. Oversized silhouette. Heart line art.',
    details: ['80% cotton, 20% polyester', '380 GSM', 'Oversized fit', 'Made in Portugal', 'Ab 2 Produkten Lieferung inkl.'],
    position: [-0.08, 1.42, -1.8],
    displayScale: 1.45,
    videoSrc: 'HM2.mp4',
    posterSrc: 'poster-center.png',
    bgType: 'white',
  },
  {
    id: 3,
    name: 'Happy & Sad Tee',
    subtitle: 'Black',
    price: '65',
    type: 'T-Shirt',
    color: '#1A1A1A',
    description: 'Premium heavyweight cotton. Relaxed fit. Bubble typography.',
    details: ['100% organic cotton', '240 GSM', 'Relaxed fit', 'Made in Portugal', 'Ab 2 Produkten Lieferung inkl.'],
    position: [1.8, 1.5, -1.8],
    displayScale: 1.0,
    videoSrc: 'TR.mp4',
    posterSrc: 'poster-right.png',
    bgType: 'white',
  },
]

const CAMERA_TARGETS = {
  assembling: { pos: [14, 9, 14], lookAt: [0, 1, 0] },
  exterior:   { pos: [2, 3.5, 16], lookAt: [0, 1.0, 0] },
  entering:   { pos: [0, 1.8, 2.0], lookAt: [0, 1.4, -1.0] },
  interior:   { pos: [0, 1.8, 2.0], lookAt: [0, 1.3, -1.2] },
}

export default function Experience({ phase, onAssemblyComplete, onEnter, selectedProduct, onSelectProduct, pulseTime }) {
  const groupRef = useRef()
  const playerPosRef = useRef({ x: 4.5, z: 4 })

  const handleTilesSettled = useCallback(() => {
    setTimeout(onAssemblyComplete, 300)
  }, [onAssemblyComplete])

  // entering -> interior auto-advance handled by App.jsx

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

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#F0EDE9" />
      </mesh>

      <group ref={groupRef}>
        <TileCloud onSettled={handleTilesSettled} pulseTime={pulseTime} playerPosRef={playerPosRef} />
        <PlayerFigure playerPosRef={playerPosRef} />

        {/* Products ALWAYS rendered — they are part of the store, visible from outside through glass walls */}
        {PRODUCTS.map((product) => (
          <VideoGarment
            key={product.id}
            product={product}
            position={product.position}
            onClick={() => onSelectProduct(product)}
            visible={true}
            videoSrc={product.videoSrc}
            posterSrc={product.posterSrc}
            bgType={product.bgType}
            showLabels={phase === 'interior' && !selectedProduct}
            displayScale={product.displayScale}
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
    const speed =
      phase === 'assembling' ? 0.3 :
      phase === 'exterior' ? 0.4 :
      phase === 'entering' ? 0.6 :
      1.0

    const t = 1 - Math.pow(0.001, delta * speed)

    camera.position.lerp(new THREE.Vector3(...target.pos), t)
    lookAtRef.current.lerp(new THREE.Vector3(...target.lookAt), t)
    camera.lookAt(lookAtRef.current)
  })

  return null
}
