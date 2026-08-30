import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import NermaiCube from './NermaiCube';
import FloatingPaper from './FloatingPaper';

export default function HeroScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          {/* A conceptual abstract composition representing the institution */}
          <NermaiCube position={[0, 0, 0]} />
          <FloatingPaper position={[-3, -1, -2]} rotation={[0, Math.PI / 6, 0]} />
          <FloatingPaper position={[3, 1, -1]} rotation={[0, -Math.PI / 4, Math.PI / 12]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
