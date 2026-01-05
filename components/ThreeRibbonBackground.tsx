import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { MeshDistortMaterial, Environment, Float } from '@react-three/drei';

// Fix for missing R3F types via global declaration and React module augmentation
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      planeGeometry: any;
      ambientLight: any;
      directionalLight: any;
      group: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      planeGeometry: any;
      ambientLight: any;
      directionalLight: any;
      group: any;
    }
  }
}

interface RibbonProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  speed: number;
}

const Ribbon: React.FC<RibbonProps> = ({ position, rotation, color, speed }) => {
  return (
    <Float 
      speed={2} // Animation speed of the float
      rotationIntensity={0.2} // XYZ rotation intensity
      floatIntensity={0.5} // Up/down float intensity
      floatingRange={[-0.5, 0.5]}
    >
      <mesh position={position} rotation={rotation} scale={1}>
        {/* High segment plane for smooth distortion waves */}
        <planeGeometry args={[15, 3, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          speed={speed} // Speed of the distortion (wind)
          distort={0.4} // Strength of the distortion
          radius={1}
          roughness={0.2} // Glossy fabric
          metalness={0.1} // Slight metallic sheen
          clearcoat={1} // High clearcoat for sunlight reflection
          clearcoatRoughness={0.1}
          side={2} // DoubleSide
        />
      </mesh>
    </Float>
  );
};

const ThreeRibbonBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          // Tone mapping for realistic lighting response
          toneMappingExposure: 1.1 
        }}
        dpr={[1, 2]} // Handle high DPI screens
        shadows
      >
        <Suspense fallback={null}>
          {/* 1. LIGHTING SETUP */}
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[5, 10, 7]} 
            intensity={2} 
            castShadow 
          />
          {/* Environment preset 'city' adds complex reflections (buildings/sky) to the clearcoat */}
          <Environment preset="city" />

          {/* 2. RIBBONS */}
          <group position={[0, 0, 0]}>
            {/* Top Right - Cyan */}
            <Ribbon
              position={[2, 4, -2]}
              rotation={[0, 0, -Math.PI / 12]}
              color="#00C9FF"
              speed={2}
            />
            
            {/* Center Left - Lime */}
            <Ribbon
              position={[-3, 0, -5]}
              rotation={[0, 0, Math.PI / 12]}
              color="#84fab0"
              speed={2.5}
            />

            {/* Bottom - Pink */}
            <Ribbon
              position={[2, -5, -3]}
              rotation={[0, 0, -Math.PI / 8]}
              color="#FF0080"
              speed={1.8}
            />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeRibbonBackground;