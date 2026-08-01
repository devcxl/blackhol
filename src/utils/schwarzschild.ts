export function isInsideEventHorizon(r: number, rs: number): boolean {
  return r <= rs;
}

export function schwarzschildDeflection(r: number, rs: number): number {
  return (1.5 * rs) / r;
}

export function diskIntersection(
  r: number,
  y: number,
  innerR: number,
  outerR: number,
  halfThickness: number,
): boolean {
  return Math.abs(y) < halfThickness && r >= innerR && r <= outerR;
}
