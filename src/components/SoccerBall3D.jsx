import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Text } from '@react-three/drei'
import * as THREE from 'three'

function SoccerBallMesh({ position = [0, 0, 0], scale = 1, speed = 1 }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * speed
      meshRef.current.rotation.y += 0.015 * speed
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3
    }
  })

  // Create soccer ball texture
  const soccerBallTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
    // White background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 512, 512)
    
    // Black pentagons and hexagons pattern
    ctx.fillStyle = 'black'
    
    // Center pentagon
    ctx.beginPath()
    const centerX = 256
    const centerY = 256
    const radius = 60
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()
    
    // Surrounding pentagons
    const positions = [
      [180, 150], [330, 150], [380, 280], [280, 380], [180, 380], [130, 280]
    ]
    
    positions.forEach(([x, y]) => {
      ctx.beginPath()
      const smallRadius = 35
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
        const px = x + smallRadius * Math.cos(angle)
        const py = y + smallRadius * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
    })
    
    // Create connecting lines
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 3
    
    // Lines from center to surrounding pentagons
    positions.forEach(([x, y]) => {
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()
    })
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [])

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        map={soccerBallTexture}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  )
}

export default function SoccerBall3D({ 
  size = 100, 
  className = "", 
  speed = 1,
  position = [0, 0, 0] 
}) {
  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />
        <SoccerBallMesh position={position} speed={speed} />
      </Canvas>
    </div>
  )
}