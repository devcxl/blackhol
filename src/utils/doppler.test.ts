import { describe, it, expect } from "vitest";
import { computeDopplerFactor } from "./doppler";

describe("computeDopplerFactor", () => {
  it("is > 1 when moving toward observer", () => {
    const factor = computeDopplerFactor([0, 1, 0], [0, 1, 0]);
    expect(factor).toBeGreaterThan(1);
  });

  it("is < 1 when moving away from observer", () => {
    const factor = computeDopplerFactor([0, -1, 0], [0, 1, 0]);
    expect(factor).toBeLessThan(1);
  });

  it("is 1 when perpendicular to observer", () => {
    const factor = computeDopplerFactor([1, 0, 0], [0, 1, 0]);
    expect(factor).toBeCloseTo(1, 1);
  });

  it("returns 1 for zero velocity", () => {
    expect(computeDopplerFactor([0, 0, 0], [0, 1, 0])).toBeCloseTo(1, 5);
  });

  it("handles perpendicular motion correctly", () => {
    const factor = computeDopplerFactor([1, 0, 0], [0, 1, 0]);
    expect(factor).toBeCloseTo(1, 0);
  });
});
