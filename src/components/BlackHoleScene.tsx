import { Canvas } from "@react-three/fiber";
import { BlackHoleRenderer } from "./BlackHoleRenderer";

export function BlackHoleScene() {
  return (
    <Canvas camera={{ position: [0, 5, 20], fov: 60 }}>
      <BlackHoleRenderer />
    </Canvas>
  );
}
