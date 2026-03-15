import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface CoinOrbProps {
  position: [number, number, number];
  symbol: string;
  color: string;
  onClick?: () => void;
}

export function CoinOrb({ position, symbol, color, onClick }: CoinOrbProps) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!group.current || !mesh.current) return;
    
    // Floating animation
    const time = state.clock.getElapsedTime();
    group.current.position.y = position[1] + Math.sin(time * 2 + position[0]) * 0.2;
    
    // Rotation
    mesh.current.rotation.y += 0.01;
    mesh.current.rotation.z += 0.005;
    
    // Scale on hover
    const targetScale = hovered ? 1.2 : 1;
    mesh.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group ref={group} position={position}>
      <mesh
        ref={mesh}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <icosahedronGeometry args={[0.6, 2]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.2}
          roughness={0.2}
          metalness={0.8}
          wireframe={true}
        />
      </mesh>
      
      {/* Coin Symbol */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.3}
        font="https://fonts.gstatic.com/s/spacegrotesk/v15/V8mQoQDjQSkGpu8pnHXFAA_sZzQ.woff"
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        renderOrder={1} // Render on top of wireframe
      >
        {symbol}
      </Text>
      
      {/* Point light matching coin color */}
      <pointLight color={color} intensity={hovered ? 2 : 0.5} distance={3} />
    </group>
  );
}
