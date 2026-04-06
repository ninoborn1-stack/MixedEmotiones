import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const vertShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const fragShader = `
  uniform sampler2D videoTexture;
  varying vec2 vUv;
  void main() {
    vec4 color = texture2D(videoTexture, vUv);
    float maxC = max(color.r, max(color.g, color.b));
    float alpha = smoothstep(0.01, 0.025, maxC);
    gl_FragColor = vec4(color.rgb, alpha);
  }
`

export default function VideoGarment({ product, position, onClick, visible, videoSrc, posterSrc }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [playing, setPlaying] = useState(false)
  const floatOffset = useRef(Math.random() * Math.PI * 2)
  const videoRef = useRef(null)
  const videoTextureRef = useRef(null)

  // Load poster image (PNG with alpha)
  const posterTexture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + posterSrc)
  posterTexture.colorSpace = THREE.SRGBColorSpace

  // Create video lazily on first click
  const startVideo = () => {
    if (videoRef.current) return // already created

    const v = document.createElement('video')
    v.src = import.meta.env.BASE_URL + videoSrc
    v.crossOrigin = 'anonymous'
    v.loop = true
    v.muted = true
    v.playsInline = true

    const tex = new THREE.VideoTexture(v)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.colorSpace = THREE.SRGBColorSpace

    videoRef.current = v
    videoTextureRef.current = tex
    v.play()
    setPlaying(true)
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ''
      }
    }
  }, [])

  const handleClick = (e) => {
    e.stopPropagation()
    if (!playing) {
      startVideo()
    } else {
      onClick()
    }
  }

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime + floatOffset.current

    groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.04
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.02

    const targetScale = hovered ? 1.08 : 1
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    )

    // Update video texture when playing
    if (playing && videoRef.current && videoRef.current.readyState >= 2) {
      videoTextureRef.current.needsUpdate = true
    }
  })

  if (!visible) return null

  const planeW = 1.1
  const planeH = planeW * (720 / 1280)

  return (
    <group
      ref={groupRef}
      position={position}
      scale={0.7}
      onClick={handleClick}
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
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.5, 8]} />
        <meshStandardMaterial color="#A09890" />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.5, 8]} />
        <meshStandardMaterial color="#A09890" />
      </mesh>

      {/* Poster image (still) or Video (playing) */}
      <mesh position={[0, -0.25, 0.01]}>
        <planeGeometry args={[planeW, planeH]} />
        {!playing ? (
          <meshBasicMaterial
            map={posterTexture}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        ) : (
          <shaderMaterial
            vertexShader={vertShader}
            fragmentShader={fragShader}
            uniforms={{ videoTexture: { value: videoTextureRef.current } }}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        )}
      </mesh>

      {/* Label */}
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
          {!playing && (
            <p className="text-[6px] tracking-[0.2em] uppercase text-[#8A8478]/40 mt-1">
              Click to view
            </p>
          )}
        </div>
      </Html>
    </group>
  )
}
