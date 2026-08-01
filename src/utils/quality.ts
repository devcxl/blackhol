export type QualityTier = "HIGH" | "LOW";

export interface QualityConfig {
  tier: QualityTier;
  maxSteps: number;
  starCount: number;
  particleCount: number;
  devicePixelRatio: number;
}

export function detectQualityTier(): QualityConfig {
  const isMobile =
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
    (navigator as unknown as Record<string, unknown>).userAgentData !== undefined;

  const dpr = isMobile ? Math.min(window.devicePixelRatio, 1.0) : Math.min(window.devicePixelRatio, 1.5);

  if (isMobile) {
    return { tier: "LOW", maxSteps: 32, starCount: 800, particleCount: 200, devicePixelRatio: dpr };
  }
  return { tier: "HIGH", maxSteps: 64, starCount: 2000, particleCount: 500, devicePixelRatio: dpr };
}
