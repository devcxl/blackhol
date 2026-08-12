export const RS = 1;
export const EVENT_HORIZON_RADIUS = RS;
/** 光子球半径：r=1.5·rs，黑洞剪影的视觉边缘（光线在该处作不稳定圆轨道） */
export const PHOTON_SPHERE_RADIUS = 1.5 * RS;
export const INNER_DISK_RADIUS = 3 * RS;
/** 外半径 9.5·rs：兼顾画面占比与盘的视觉存在感；过大（30）会淹没黑洞结构 */
export const OUTER_DISK_RADIUS = 9.5 * RS;
export const DISK_HALF_THICKNESS = 0.55;
export const DISK_TEMPERATURE_INNER_K = 10_000;
export const DISK_TEMPERATURE_OUTER_K = 3_000;
export const MAX_RAYMARCH_STEPS_HIGH = 224;
export const MAX_RAYMARCH_STEPS_LOW = 144;
