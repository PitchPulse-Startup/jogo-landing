import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Cylinder, Sphere, Box } from '@react-three/drei'

function TrophyMesh({ scale = 1, speed = 1 }) {
  const groupRef = useRef()
  const cupRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01 * speed
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * speed * 0.8) * 0.15
    }
    
    if (cupRef.current) {
      cupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * speed * 2) * 0.05
    }
  })

  return (
    <group ref={groupRef} scale={scale}>
      {/* Base */}
      <Cylinder
        args={[1.2, 1.2, 0.3]}
        position={[0, -2, 0]}
      >
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.8} 
          roughness={0.2}
        />
      </Cylinder>
      
      {/* Middle base */}
      <Cylinder
        args={[0.8, 0.8, 0.4]}
        position={[0, -1.5, 0]}
      >
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.7} 
          roughness={0.3}
        />
      </Cylinder>
      
      {/* Stem */}
      <Cylinder
        args={[0.3, 0.4, 1.5]}
        position={[0, -0.5, 0]}
      >
        <meshStandardMaterial 
          color="#ffd700" 
          metalness={0.9} 
          roughness={0.1}
          emissive="#b8860b"
          emissiveIntensity={0.1}
        />
      </Cylinder>
      
      {/* Main cup */}
      <group ref={cupRef}>
        <Cylinder
          args={[0.8, 0.6, 1.2]}
          position={[0, 0.8, 0]}
        >
          <meshStandardMaterial 
            color="#ffd700" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#b8860b"
            emissiveIntensity={0.2}
          />
        </Cylinder>
        
        {/* Cup handles */}
        <Cylinder
          args={[0.1, 0.1, 0.6]}
          position={[-1, 0.8, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial 
            color="#ffd700" 
            metalness={0.9} 
            roughness={0.1}
          />
        </Cylinder>
        <Cylinder
          args={[0.1, 0.1, 0.6]}
          position={[1, 0.8, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial 
            color="#ffd700" 
            metalness={0.9} 
            roughness={0.1}
          />
        </Cylinder>
      </group>
      
      {/* Crown/Top decoration */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 0.6
        const z = Math.sin(angle) * 0.6
        return (
          <Box
            key={i}
            args={[0.1, 0.3, 0.1]}
            position={[x, 1.6, z]}
          >
            <meshStandardMaterial 
              color="#10b981" 
              metalness={0.8} 
              roughness={0.2}
              emissive="#064e3b"
              emissiveIntensity={0.3}
            />
          </Box>
        )
      })}
      
      {/* Soccer ball on top */}
      <Sphere
        args={[0.3]}
        position={[0, 1.8, 0]}
      >
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.1} 
          roughness={0.8}
        />
      </Sphere>
      
      {/* Pentagon on soccer ball */}
      <Cylinder
        args={[0.1, 0.1, 0.02]}
        position={[0, 2.1, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial color="#000000" />
      </Cylinder>
    </group>
  )
}

export default function SoccerTrophy3D({ 
  size = 100, 
  className = "", 
  speed = 1 
}) {
  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [3, 3, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5}
          castShadow
        />
        <pointLight position={[-5, 5, 5]} intensity={0.6} color="#ffd700" />
        <spotLight 
          position={[0, 10, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.8}
          color="#10b981"
        />
        <TrophyMesh speed={speed} />
      </Canvas>
    </div>
  )
}