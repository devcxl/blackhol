import { Canvas } from "@react-three/fiber";

export function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.1} />
    </Canvas>
  );
}
