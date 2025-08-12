import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Box, Cylinder, Line } from '@react-three/drei'
import * as THREE from 'three'

function SoccerGoalMesh({ scale = 1, speed = 1 }) {
  const groupRef = useRef()
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005 * speed
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.1
    }
  })

  // Net animation
  const netRef = useRef()
  useFrame((state) => {
    if (netRef.current) {
      netRef.current.children.forEach((line, index) => {
        line.position.z = Math.sin(state.clock.elapsedTime * 2 + index * 0.3) * 0.05
      })
    }
  })

  return (
    <group ref={groupRef} scale={scale}>
      {/* Goal Posts */}
      <Cylinder
        args={[0.05, 0.05, 2]}
        position={[-1, 0, 0]}
      >
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </Cylinder>
      <Cylinder
        args={[0.05, 0.05, 2]}
        position={[1, 0, 0]}
      >
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {/* Crossbar */}
      <Cylinder
        args={[0.05, 0.05, 2]}
        position={[0, 1, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {/* Net */}
      <group ref={netRef} position={[0, 0, -0.5]}>
        {/* Vertical net lines */}
        {Array.from({ length: 9 }, (_, i) => (
          <Line
            key={`v-${i}`}
            points={[
              [i * 0.25 - 1, -1, 0],
              [i * 0.25 - 1, 1, 0]
            ]}
            color="#00ff00"
            lineWidth={1}
          />
        ))}
        {/* Horizontal net lines */}
        {Array.from({ length: 9 }, (_, i) => (
          <Line
            key={`h-${i}`}
            points={[
              [-1, i * 0.25 - 1, 0],
              [1, i * 0.25 - 1, 0]
            ]}
            color="#00ff00"
            lineWidth={1}
          />
        ))}
      </group>
    </group>
  )
}

export default function SoccerGoal3D({ 
  size = 100, 
  className = "", 
  speed = 1 
}) {
  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [3, 2, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
        />
        <pointLight position={[-5, 5, 5]} intensity={0.4} color="#10b981" />
        <SoccerGoalMesh speed={speed} />
      </Canvas>
    </div>
  )
}