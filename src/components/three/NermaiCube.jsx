import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, Float } from '@react-three/drei';

export default function NermaiCube({ text = 'NERMAI', position = [0, 0, 0] }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#4A1521" wireframe={true} />
        {/* Placeholder for actual 3D text when font is loaded, just wireframe for now */}
      </mesh>
    </Float>
  );
}
