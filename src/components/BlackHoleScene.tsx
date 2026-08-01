import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BlackHoleRenderer } from "./BlackHoleRenderer";

export function BlackHoleScene() {
  return (
    <Canvas camera={{ position: [0, 5, 20], fov: 60 }}>
      <BlackHoleRenderer />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={50}
        autoRotate={true}
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}
