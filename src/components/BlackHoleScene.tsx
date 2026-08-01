import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BlackHoleRenderer } from "./BlackHoleRenderer";
import { AccretionParticles } from "./AccretionParticles";
import { PostProcessing } from "./PostProcessing";

export function BlackHoleScene() {
  return (
    <Canvas camera={{ position: [0, 5, 20], fov: 60 }}>
      <BlackHoleRenderer />
      <AccretionParticles />
      <PostProcessing />
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
