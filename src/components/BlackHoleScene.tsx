import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BlackHoleRenderer } from "./BlackHoleRenderer";
import { PostProcessing } from "./PostProcessing";
import { useQualityTier } from "../hooks/useQualityTier";

export function BlackHoleScene() {
  const quality = useQualityTier();

  return (
    <Canvas camera={{ position: [0, 1.8, 16], fov: 60 }} dpr={quality.devicePixelRatio}>
      <BlackHoleRenderer />
      <PostProcessing />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={35}
        autoRotate={false}
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}
