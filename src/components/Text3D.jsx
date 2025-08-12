import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Center } from '@react-three/drei'
import * as THREE from 'three'

function Text3DMesh({ text, color = "#10b981", speed = 1, fontSize = 1 }) {
  const textRef = useRef()
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y += 0.008 * speed
      textRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.1
      textRef.current.position.y = Math.sin(state.clock.elapsedTime * speed * 0.8) * 0.3
    }
  })

  return (
    <group ref={textRef}>
      <Center>
        <Text
          fontSize={fontSize}
          font="https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap"
          fontWeight={900}
          letterSpacing={0.02}
          lineHeight={1}
        >
          {text}
          <meshStandardMaterial
            color={color}
            metalness={0.9}
            roughness={0.1}
            emissive={color}
            emissiveIntensity={0.2}
            transparent
            opacity={0.95}
          />
        </Text>
        
        {/* Shadow/Depth effect */}
        <Text
          fontSize={fontSize}
          font="https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap"
          fontWeight={900}
          letterSpacing={0.02}
          lineHeight={1}
          position={[0.05, -0.05, -0.1]}
        >
          {text}
          <meshStandardMaterial
            color="#000000"
            metalness={0.1}
            roughness={0.9}
            opacity={0.3}
            transparent
          />
        </Text>
      </Center>
    </group>
  )
}

export default function Text3D({ 
  text,
  size = 100, 
  className = "", 
  speed = 1,
  color = "#10b981",
  fontSize = 1
}) {
  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={2}
          castShadow
        />
        <pointLight position={[-5, 5, 5]} intensity={0.8} color={color} />
        <spotLight 
          position={[0, 10, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={1.2}
          color="#ffffff"
        />
        <Text3DMesh text={text} color={color} speed={speed} fontSize={fontSize} />
      </Canvas>
    </div>
  )
}