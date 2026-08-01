export function computeDopplerFactor(
  velocity: [number, number, number],
  observerDir: [number, number, number],
): number {
  const dot = velocity[0] * observerDir[0] + velocity[1] * observerDir[1] + velocity[2] * observerDir[2];
  const speed = Math.sqrt(
    observerDir[0] * observerDir[0] + observerDir[1] * observerDir[1] + observerDir[2] * observerDir[2],
  );
  if (speed === 0) return 1;
  const cosAngle = dot / speed;
  const beta = Math.min(Math.abs(cosAngle), 0.9);
  if (cosAngle >= 0) return 1 + beta * 1.5;
  return 1 - Math.abs(beta) * 0.8;
}
