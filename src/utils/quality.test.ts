import { describe, it, expect, vi } from "vitest";
import { detectQualityTier } from "./quality";

describe("detectQualityTier", () => {
  it("returns HIGH tier on desktop", () => {
    vi.stubGlobal("navigator", { userAgent: "Chrome", devicePixelRatio: 1.5 });
    const config = detectQualityTier();
    expect(config.tier).toBe("HIGH");
    expect(config.maxSteps).toBe(224);
  });

  it("returns LOW tier on mobile", () => {
    vi.stubGlobal("navigator", { userAgent: "Mobi", devicePixelRatio: 2 });
    const config = detectQualityTier();
    expect(config.tier).toBe("LOW");
    expect(config.maxSteps).toBe(144);
  });

  it("caps DPR on mobile", () => {
    vi.stubGlobal("navigator", { userAgent: "Mobi", devicePixelRatio: 3 });
    const config = detectQualityTier();
    expect(config.devicePixelRatio).toBeLessThanOrEqual(1);
  });
});
