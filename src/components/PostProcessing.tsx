import { EffectComposer, Bloom } from "@react-three/postprocessing";

export function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.4}
        luminanceSmoothing={0.3}
        intensity={1.2}
        radius={0.5}
      />
    </EffectComposer>
  );
}
