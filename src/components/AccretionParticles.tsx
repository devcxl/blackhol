import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RS, INNER_DISK_RADIUS, OUTER_DISK_RADIUS } from "../utils/constants";
import { useQualityTier } from "../hooks/useQualityTier";

export function AccretionParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const quality = useQualityTier();
  const particleCount = quality.particleCount;

  const { positions, colors, velocities, angles } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const vel: number[] = [];
    const ang: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = INNER_DISK_RADIUS + Math.random() * (OUTER_DISK_RADIUS - INNER_DISK_RADIUS);
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.15;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const t = (radius - INNER_DISK_RADIUS) / (OUTER_DISK_RADIUS - INNER_DISK_RADIUS);
      const temp = 10_000 + t * (3_000 - 10_000);
      const rgb = blackbodyToRGB(temp);
      col[i * 3] = rgb[0];
      col[i * 3 + 1] = rgb[1];
      col[i * 3 + 2] = rgb[2];

      vel.push(0.5 + Math.random() * 0.5);
      ang.push(angle);
    }

    return { positions: pos, colors: col, velocities: vel, angles: ang };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.sqrt(arr[i * 3] ** 2 + arr[i * 3 + 2] ** 2);
      const angularSpeed = 0.3 / Math.sqrt(radius / RS);
      angles[i] += angularSpeed * delta * velocities[i];

      const decay = 1 - delta * 0.01;
      const newRadius = Math.max(radius * decay, INNER_DISK_RADIUS * 1.01);

      if (newRadius <= INNER_DISK_RADIUS * 1.02) {
        const r = INNER_DISK_RADIUS + Math.random() * (OUTER_DISK_RADIUS - INNER_DISK_RADIUS);
        angles[i] = Math.random() * Math.PI * 2;
        arr[i * 3] = Math.cos(angles[i]) * r;
        arr[i * 3 + 2] = Math.sin(angles[i]) * r;
      } else {
        arr[i * 3] = Math.cos(angles[i]) * newRadius;
        arr[i * 3 + 2] = Math.sin(angles[i]) * newRadius;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={0.6}
      />
    </points>
  );
}

function blackbodyToRGB(tempK: number): [number, number, number] {
  const t = tempK / 1000;
  let r: number, g: number, b: number;
  if (t <= 2) {
    r = 1; g = 0.08 * (t - 1); b = 0;
  } else if (t <= 4) {
    r = 1; g = 0.1 + 0.4 * ((t - 2) / 2); b = 0.05 * ((t - 2) / 2);
  } else if (t <= 7) {
    r = 1 - 0.1 * ((t - 4) / 3); g = 0.5 + 0.4 * ((t - 4) / 3); b = 0.05 + 0.75 * ((t - 4) / 3);
  } else {
    r = 0.9 - 0.2 * ((t - 7) / 3); g = 0.9 - 0.1 * ((t - 7) / 3); b = 0.8 + 0.2 * ((t - 7) / 3);
  }
  return [Math.max(0, Math.min(1, r)), Math.max(0, Math.min(1, g)), Math.max(0, Math.min(1, b))];
}
