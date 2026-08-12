import { EffectComposer, Bloom } from "@react-three/postprocessing";

export function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.72}
        luminanceSmoothing={0.1}
        intensity={1.1}
        radius={0.4}
      />
    </EffectComposer>
  );
}
