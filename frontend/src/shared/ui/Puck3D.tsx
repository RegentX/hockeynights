/**
 * SPEC-UI-7.2 - Interactive 3D Puck anchor using Three.js and React Three Fiber
 */

import {useRef, useState} from 'react'
import {Canvas, useFrame} from '@react-three/fiber'
import {MeshDistortMaterial, Float, PerspectiveCamera} from '@react-three/drei'
import {Text} from '@gravity-ui/uikit'
import * as THREE from 'three'
import {testId} from '@/shared/testing/testId'

function PuckMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    meshRef.current.rotation.x = Math.cos(t / 4) / 8
    meshRef.current.rotation.y = Math.sin(t / 4) / 8
    meshRef.current.position.y = (1 + Math.sin(t / 1.5)) / 10
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <cylinderGeometry args={[1.5, 1.5, 0.6, 32]} />
        <MeshDistortMaterial
          color={hovered ? '#E10600' : '#1a1a1a'}
          speed={2}
          distort={0.2}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

function isWebGLSupported() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}

export function Puck3D() {
  if (!isWebGLSupported()) {
    return (
      <div className="puck-3d puck-3d--fallback" data-testid={testId('shared', 'puck-3d', 'panel', 'fallback')}>
        <Text color="secondary" data-testid={testId('shared', 'puck-3d', 'text', 'fallback')}>3D-preview недоступен в этой среде</Text>
      </div>
    )
  }

  return (
    <div className="puck-3d" data-testid={testId('shared', 'puck-3d', 'panel')}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <PuckMesh />
      </Canvas>
    </div>
  )
}
