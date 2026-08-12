import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import vertexShader from "../shaders/blackhole.vert";
import fragmentShader from "../shaders/blackhole.frag";
import {
  MAX_RAYMARCH_STEPS_HIGH,
  RS,
  DISK_HALF_THICKNESS,
  INNER_DISK_RADIUS,
  OUTER_DISK_RADIUS,
  DISK_TEMPERATURE_INNER_K,
  DISK_TEMPERATURE_OUTER_K,
} from "../utils/constants";
import { useQualityTier } from "../hooks/useQualityTier";

export function BlackHoleRenderer() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();
  const quality = useQualityTier();

  const uniforms = useMemo(
    () => ({
      uCameraPos: { value: new THREE.Vector3() },
      uInvProjViewMatrix: { value: new THREE.Matrix4() },
      uTime: { value: 0 },
      uResolution: { value: [size.width, size.height] },
      uMaxSteps: { value: MAX_RAYMARCH_STEPS_HIGH },
      uRS: { value: RS },
      uDiskHalfThickness: { value: DISK_HALF_THICKNESS },
      uInnerDiskRadius: { value: INNER_DISK_RADIUS },
      uOuterDiskRadius: { value: OUTER_DISK_RADIUS },
      uDiskTempInner: { value: DISK_TEMPERATURE_INNER_K },
      uDiskTempOuter: { value: DISK_TEMPERATURE_OUTER_K },
    }),
    [],
  );

  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );

  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uCameraPos.value.copy(camera.position);
    // 世界坐标 = matrixWorld · projectionMatrixInverse · NDC（V⁻¹·P⁻¹ 顺序）
    mat.uniforms.uInvProjViewMatrix.value
      .copy(camera.matrixWorld)
      .multiply(camera.projectionMatrixInverse);
    mat.uniforms.uTime.value = performance.now() / 1000;
    mat.uniforms.uResolution.value = [size.width, size.height];
    mat.uniforms.uMaxSteps.value = quality.maxSteps;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
}
