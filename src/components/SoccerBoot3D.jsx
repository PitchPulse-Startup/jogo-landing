import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Box, Sphere } from '@react-three/drei'
import * as THREE from 'three'

function SoccerBootMesh({ scale = 1, speed = 1 }) {
  const groupRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.1
      groupRef.current.rotation.y += 0.008 * speed
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * speed) * 0.2
    }
  })

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main boot body */}
      <Box
        args={[2.5, 1, 0.8]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.3} 
          roughness={0.7}
        />
      </Box>
      
      {/* Boot toe */}
      <Box
        args={[1, 0.6, 0.6]}
        position={[1.5, -0.1, 0]}
        rotation={[0, 0, -0.1]}
      >
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.4} 
          roughness={0.6}
        />
      </Box>
      
      {/* Boot heel */}
      <Box
        args={[0.8, 1.2, 0.9]}
        position={[-1.2, 0.1, 0]}
      >
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.2} 
          roughness={0.8}
        />
      </Box>
      
      {/* Sole */}
      <Box
        args={[3, 0.2, 1]}
        position={[0, -0.6, 0]}
      >
        <meshStandardMaterial 
          color="#4a4a4a" 
          metalness={0.1} 
          roughness={0.9}
        />
      </Box>
      
      {/* Studs */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 0.8
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        return (
          <Sphere
            key={i}
            args={[0.08]}
            position={[x * 0.8, -0.8, z]}
          >
            <meshStandardMaterial 
              color="#10b981" 
              metalness={0.8} 
              roughness={0.2}
              emissive="#064e3b"
              emissiveIntensity={0.1}
            />
          </Sphere>
        )
      })}
      
      {/* Nike-style swoosh */}
      <Box
        args={[1.2, 0.1, 0.05]}
        position={[0.3, 0.2, 0.45]}
        rotation={[0, 0, -0.3]}
      >
        <meshStandardMaterial 
          color="#10b981" 
          metalness={0.6} 
          roughness={0.3}
          emissive="#064e3b"
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Laces */}
      {Array.from({ length: 5 }, (_, i) => (
        <Box
          key={`lace-${i}`}
          args={[0.05, 0.3, 0.02]}
          position={[0.2 + i * 0.15, 0.3, 0.45]}
          rotation={[Math.PI / 6, 0, 0]}
        >
          <meshStandardMaterial color="#ffffff" />
        </Box>
      ))}
    </group>
  )
}

export default function SoccerBoot3D({ 
  size = 100, 
  className = "", 
  speed = 1 
}) {
  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [4, 2, 4], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.2}
          castShadow
        />
        <pointLight position={[-5, 5, 5]} intensity={0.4} color="#10b981" />
        <spotLight 
          position={[0, 10, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.5}
          color="#ffffff"
        />
        <SoccerBootMesh speed={speed} />
      </Canvas>
    </div>
  )
}