import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ParticleField } from './ParticleField';
import { Suspense } from 'react';

export function SceneBackground({ children }: { children?: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[-1] bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <color attach="background" args={['#05050a']} />
          <ambientLight intensity={0.2} />
          <ParticleField count={2000} />
          {children}
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate 
            autoRotateSpeed={0.5} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
