export type QualityTier = "HIGH" | "LOW";

export interface QualityConfig {
  tier: QualityTier;
  maxSteps: number;
  starCount: number;
  particleCount: number;
  devicePixelRatio: number;
}

export function detectQualityTier(): QualityConfig {
  // 桌面 Chrome 也带有 userAgentData，必须读其 mobile 字段，
  // 仅用 "!== undefined" 会把桌面误判为移动端（步数减半 → 透镜盘像欠采样噪点）
  const uaData = (navigator as unknown as Record<string, unknown>).userAgentData as
    | { mobile?: boolean }
    | undefined;
  const isMobile =
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || uaData?.mobile === true;

  const dpr = isMobile ? Math.min(window.devicePixelRatio, 1.0) : Math.min(window.devicePixelRatio, 1.5);

  if (isMobile) {
    return { tier: "LOW", maxSteps: 144, starCount: 800, particleCount: 80, devicePixelRatio: dpr };
  }
    return { tier: "HIGH", maxSteps: 224, starCount: 2000, particleCount: 120, devicePixelRatio: dpr };
}
