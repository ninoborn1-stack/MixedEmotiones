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
// Removes WHITE/GRAY background — high threshold to preserve white graphics on shirt
const whiteKeyFrag = `
  uniform sampler2D map;
  varying vec2 vUv;
  void main() {
    vec4 color = texture2D(map, vUv);
    float minC = min(color.r, min(color.g, color.b));
    // Only discard pixels where ALL channels are very bright (near-white BG)
    // This preserves white graphics on the shirt because they have slight
    // color variation and shadows from the fabric texture
    if (minC > 0.58) discard;
    gl_FragColor = vec4(color.rgb, 1.0);
  }
`
// Removes BLACK background
const blackKeyFrag = `
  uniform sampler2D map;
  varying vec2 vUv;
  void main() {
    vec4 color = texture2D(map, vUv);
    float maxC = max(color.r, max(color.g, color.b));
    if (maxC < 0.02) discard;
    gl_FragColor = vec4(color.rgb, 1.0);
  }
`

export default function VideoGarment({ product, position, onClick, visible, videoSrc, posterSrc, bgType = 'black' }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const floatOffset = useRef(Math.random() * Math.PI * 2)
  const videoRef = useRef(null)
  const videoTextureRef = useRef(null)

  const posterTexture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + posterSrc)
  posterTexture.colorSpace = THREE.SRGBColorSpace

  const startVideo = () => {
    if (videoRef.current) return
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
    setPlaying(true)

    // Wait until video has actual frame data before showing shader
    const onPlaying = () => {
      v.removeEventListener('playing', onPlaying)
      // Extra safety: wait one frame so texture has data
      requestAnimationFrame(() => setVideoReady(true))
    }
    v.addEventListener('playing', onPlaying)
    v.play()
  }

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
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    if (playing && videoRef.current && videoRef.current.readyState >= 2) {
      videoTextureRef.current.needsUpdate = true
    }
  })

  if (!visible) return null

  const planeW = 1.1
  const planeH = planeW * (720 / 1280)
  const fragShader = bgType === 'white' ? whiteKeyFrag : blackKeyFrag

  return (
    <group
      ref={groupRef}
      position={position}
      scale={0.7}
      onClick={handleClick}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 1.6, 8]} />
        <meshStandardMaterial color="#C0B8AE" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.5, 8]} />
        <meshStandardMaterial color="#A09890" />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.5, 8]} />
        <meshStandardMaterial color="#A09890" />
      </mesh>

      <mesh position={[0, -0.25, 0.01]}>
        <planeGeometry args={[planeW, planeH]} />
        {(!playing || !videoReady) ? (
          <meshBasicMaterial
            map={posterTexture}
            transparent
            alphaTest={0.5}
            side={THREE.DoubleSide}
          />
        ) : (
          <shaderMaterial
            vertexShader={vertShader}
            fragmentShader={fragShader}
            uniforms={{ map: { value: videoTextureRef.current } }}
            transparent
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      <Html
        position={[0, -0.9, 0]}
        center
        distanceFactor={6}
        style={{ opacity: hovered ? 1 : 0.5, transition: 'opacity 0.3s', pointerEvents: 'none' }}
      >
        <div className="text-center select-none whitespace-nowrap">
          <p className="text-[7px] tracking-[0.3em] uppercase text-[#8A8478] font-light mb-0.5">{product.type}</p>
          <p className="font-display text-[11px] tracking-wide text-[#1A1A1A]">{product.name}</p>
          <p className="text-[7px] tracking-[0.15em] text-[#8A8478] mt-0.5">{product.subtitle}</p>
          {!playing && <p className="text-[6px] tracking-[0.2em] uppercase text-[#8A8478]/40 mt-1">Click to view</p>}
        </div>
      </Html>
    </group>
  )
}
