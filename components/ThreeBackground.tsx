import React, { useEffect, useRef } from 'react';

// Declaration for the global THREE variable loaded via CDN
declare global {
  interface Window {
    THREE: any;
  }
}

const ThreeBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !window.THREE) return;

    const THREE = window.THREE;
    
    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // White background for high contrast
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = -1;
    camera.rotation.x = 0.2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- Create Ribbons ---
    const ribbons: any[] = [];
    
    // Ribbon Configuration
    const createRibbon = (color: number, zIndex: number, speed: number, offset: number, width: number) => {
      // Use PlaneGeometry with many segments for smooth wave distortion
      const geometry = new THREE.PlaneGeometry(30, 4, 100, 20);
      const material = new THREE.MeshBasicMaterial({ 
        color: color, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        blending: THREE.MultiplyBlending // "Multiply" blend for the overlapping marker ink effect
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = zIndex;
      mesh.rotation.z = -Math.PI / 8; // Diagonal tilt
      scene.add(mesh);
      
      // Store initial positions for animation
      const initialPositions = mesh.geometry.attributes.position.array.slice();
      
      ribbons.push({
        mesh,
        geometry,
        initialPositions,
        speed,
        offset,
        time: Math.random() * 100
      });
    };

    // Add 3 High-Contrast Ribbons
    createRibbon(0x00C9FF, -2, 0.002, 1.0, 5); // Cyan
    createRibbon(0x92FE9D, -1, 0.003, 2.0, 4); // Lime
    createRibbon(0xFF0080, -3, 0.0015, 0.5, 6); // Magenta/Pink Punch

    // Animation Loop
    let animationId: number;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      ribbons.forEach(ribbon => {
        ribbon.time += ribbon.speed;
        
        const positions = ribbon.geometry.attributes.position.array;
        const initial = ribbon.initialPositions;
        
        for (let i = 0; i < positions.length; i += 3) {
          const x = initial[i];
          const y = initial[i + 1];
          
          // "Wind" simulation: Sine waves moving along X
          // The Z-coordinate (height) is modified to create the flutter
          // We also modify Y slightly to make it look like it's drifting
          
          const wave1 = Math.sin(x * 0.5 + ribbon.time * 2.0 + ribbon.offset);
          const wave2 = Math.cos(x * 1.5 + ribbon.time * 1.5);
          
          // Modify Z for depth undulation
          positions[i + 2] = initial[i + 2] + (wave1 * 0.8 + wave2 * 0.3);
          
          // Modify Y for lateral flutter
          positions[i + 1] = y + Math.sin(x * 1.0 + ribbon.time) * 0.3;
        }
        
        ribbon.geometry.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // Dispose geometries/materials
      ribbons.forEach(r => {
        r.geometry.dispose();
        r.mesh.material.dispose();
      });
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 1.0 }} 
    />
  );
};

export default ThreeBackground;
