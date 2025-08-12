import React from 'react'
import { motion } from 'framer-motion'

const Sparkle = ({ delay = 0, x = 0, y = 0, size = 4, color = '#10b981' }) => {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 ${size}px ${color}30`,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
    />
  )
}

export default function FloatingSparkles() {
  const sparkles = [
    { delay: 0, x: '25%', y: '20%', size: 3, color: '#10b98150' },
    { delay: 1.5, x: '70%', y: '30%', size: 2, color: '#34d39950' },
    { delay: 3, x: '20%', y: '70%', size: 2, color: '#6ee7b750' },
    { delay: 4.5, x: '80%', y: '75%', size: 3, color: '#059669 50' },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((sparkle, index) => (
        <Sparkle
          key={index}
          delay={sparkle.delay}
          x={sparkle.x}
          y={sparkle.y}
          size={sparkle.size}
          color={sparkle.color}
        />
      ))}
    </div>
  )
}