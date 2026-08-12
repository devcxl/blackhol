/**
 * 史瓦西黑洞光线追踪的纯函数模型（与 blackhole.frag 中的实现保持一致）。
 */

export function isInsideEventHorizon(r: number, rs: number): boolean {
  return r <= rs;
}

/** 光子球半径：r = 1.5·rs，黑洞剪影的视觉边缘 */
export function photonSphereRadius(rs: number): number {
  return 1.5 * rs;
}

/**
 * 弱场引力偏转（每单位步长的角偏转率）：dθ = 1.5·rs/r²·ds。
 * 在光子球 r=1.5·rs 处每圈偏转恰好 2π（光子不稳定圆轨道），是史瓦西度规的一阶近似。
 */
export function schwarzschildDeflection(r: number, rs: number, stepSize = 1): number {
  return (1.5 * rs * stepSize) / (r * r);
}

/** 自适应步长：远处大步快进、近处小步保证弯曲积分精度（与 shader 一致） */
export function adaptiveStepSize(r: number): number {
  return Math.min(Math.max(r * 0.12, 0.04), 0.4);
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
