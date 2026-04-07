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

export default function VideoGarment({ product, position, onClick, visible, videoSrc, posterSrc, bgType = 'black', showLabels = false, displayScale }) {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const floatOffset = useRef(Math.random() * Math.PI * 2)
  const videoRef = useRef(null)
  const videoTextureRef = useRef(null)

  const posterTexture = useLoader(THREE.TextureLoader, import.meta.env.BASE_URL + posterSrc)
  posterTexture.colorSpace = THREE.SRGBColorSpace

  const loopCountRef = useRef(0)

  const startVideo = () => {
    if (videoRef.current) {
      // Restart: reset loop count and play again
      loopCountRef.current = 0
      videoRef.current.currentTime = 0
      videoRef.current.play()
      setPlaying(true)
      setVideoReady(true)
      return
    }

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

    // Stop after 3 loops
    v.addEventListener('ended', () => {
      loopCountRef.current++
      if (loopCountRef.current >= 3) {
        v.loop = false
        v.pause()
        v.currentTime = 0
        setPlaying(false)
        setVideoReady(false)
        loopCountRef.current = 0
      }
    })
    // Count loops via timeupdate (since loop=true doesn't fire 'ended')
    let lastTime = 0
    v.addEventListener('timeupdate', () => {
      if (v.currentTime < lastTime - 0.5) {
        // Video looped back to start
        loopCountRef.current++
        if (loopCountRef.current >= 3) {
          v.pause()
          v.currentTime = 0
          setPlaying(false)
          setVideoReady(false)
          loopCountRef.current = 0
        }
      }
      lastTime = v.currentTime
    })

    videoRef.current = v
    videoTextureRef.current = tex
    setPlaying(true)

    const onPlaying = () => {
      v.removeEventListener('playing', onPlaying)
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
    // First click: show product info + start video
    if (!playing) startVideo()
    onClick()
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

  const planeW = 1.6
  const planeH = planeW * (720 / 1280)
  const fragShader = bgType === 'white' ? whiteKeyFrag : blackKeyFrag

  return (
    <group
      ref={groupRef}
      position={position}
      scale={displayScale || 0.8}
      onClick={handleClick}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      <mesh position={[0, -0.05, 0.01]}>
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

      {/* Labels only visible inside the store */}
      {showLabels && (
        <Html
          position={[0, -0.7, 0]}
          center
          distanceFactor={6}
          style={{ opacity: hovered ? 1 : 0.7, transition: 'opacity 0.3s', pointerEvents: 'none' }}
        >
          <div className="text-center select-none whitespace-nowrap">
            <p className="text-[8px] tracking-[0.3em] uppercase text-[#4A4540] font-light mb-0.5">{product.type}</p>
            <p className="font-display text-[13px] tracking-wide text-[#1A1A1A] font-medium">{product.name}</p>
            <p className="text-[8px] tracking-[0.15em] text-[#4A4540] mt-0.5">{product.subtitle}</p>
            {!playing && <p className="text-[7px] tracking-[0.2em] uppercase text-[#4A4540]/50 mt-1">Click to view</p>}
          </div>
        </Html>
      )}
    </group>
  )
}
