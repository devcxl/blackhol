export function temperatureAtRadius(r: number, innerR: number, outerR: number): number {
  if (r <= innerR) return 10_000;
  if (r >= outerR) return 3_000;
  const t = (r - innerR) / (outerR - innerR);
  return 10_000 + t * (3_000 - 10_000);
}

export function blackbodyToRGB(tempK: number): [number, number, number] {
  if (tempK <= 0) return [0, 0, 0];
  const t = tempK / 1000;
  let r: number, g: number, b: number;
  if (t <= 2) {
    r = 1;
    g = 0.08 * (t - 1);
    b = 0;
  } else if (t <= 4) {
    r = 1;
    g = 0.1 + 0.4 * ((t - 2) / 2);
    b = 0.05 * ((t - 2) / 2);
  } else if (t <= 7) {
    r = 1 - 0.1 * ((t - 4) / 3);
    g = 0.5 + 0.4 * ((t - 4) / 3);
    b = 0.05 + 0.75 * ((t - 4) / 3);
  } else {
    r = 0.9 - 0.2 * ((t - 7) / 3);
    g = 0.9 - 0.1 * ((t - 7) / 3);
    b = 0.8 + 0.2 * ((t - 7) / 3);
  }
  return [
    Math.max(0, Math.min(1, r)),
    Math.max(0, Math.min(1, g)),
    Math.max(0, Math.min(1, b)),
  ];
}
