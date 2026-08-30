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
          {/* Subtle enhancements can be added here in the future.
              For now, the scene is strictly contained to the Hero banner container 
              and does not use any large blocking geometries. */}
        </ParallaxGroup>
      </Suspense>
    </Canvas>
  );
}
