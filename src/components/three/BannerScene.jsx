import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import NermaiCube from './NermaiCube';
import FloatingPaper from './FloatingPaper';

// A component that moves the entire group based on mouse to create parallax
function ParallaxGroup({ children }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    // Mouse ranges from -1 to +1. We add a tiny rotation for parallax.
    const targetX = (state.mouse.x * Math.PI) / 10;
    const targetY = (state.mouse.y * Math.PI) / 10;
    
    groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.05;
  });

  return <group ref={groupRef}>{children}</group>;
}

export default function BannerScene({ type }) {
  // Different scenes based on the banner type.
  // We place objects in the "Safe Zone" (typically the right side of the screen).

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 45 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      
      <Suspense fallback={null}>
        <Environment preset="city" />
        
        <ParallaxGroup>
          {type === 'admissions' && (
            <group position={[0, 0, -5]}>
              {/* Subtle ambient floating geometries behind the text */}
              <FloatingPaper position={[-6, -2, -3]} rotation={[0, -Math.PI / 6, Math.PI / 12]} />
              <FloatingPaper position={[6, 2, -1]} rotation={[Math.PI / 8, Math.PI / 4, 0]} />
            </group>
          )}

          {type === 'results' && (
            <group position={[0, 0, -2]}>
              {/* Subtle floating result depth elements */}
              <FloatingPaper position={[-5, 2, -2]} rotation={[0, 0, -Math.PI / 24]} />
              <FloatingPaper position={[5, -1, -4]} rotation={[0, -Math.PI / 12, Math.PI / 24]} />
            </group>
          )}
        </ParallaxGroup>
      </Suspense>
    </Canvas>
  );
}
