import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

export default function FloatingPaper({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle hovering effect
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={rotation} castShadow receiveShadow>
        <planeGeometry args={[3, 4.5]} />
        <meshStandardMaterial color="#FDFBF7" side={2} /> {/* Double side rendering */}
      </mesh>
    </Float>
  );
}
