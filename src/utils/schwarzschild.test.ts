import { describe, it, expect } from "vitest";
import {
  isInsideEventHorizon,
  photonSphereRadius,
  schwarzschildDeflection,
  adaptiveStepSize,
  diskIntersection,
} from "./schwarzschild";

describe("isInsideEventHorizon", () => {
  it("returns true for radius < RS", () => {
    expect(isInsideEventHorizon(0.5, 1)).toBe(true);
  });

  it("returns false for radius > RS", () => {
    expect(isInsideEventHorizon(2, 1)).toBe(false);
  });

  it("returns true for exact RS", () => {
    expect(isInsideEventHorizon(1, 1)).toBe(true);
  });
});

describe("schwarzschildDeflection", () => {
  it("returns 0 for infinite distance", () => {
    expect(schwarzschildDeflection(1e10, 1)).toBeCloseTo(0, 5);
  });

  it("increases as r decreases", () => {
    const d1 = schwarzschildDeflection(10, 1);
    const d2 = schwarzschildDeflection(5, 1);
    expect(d2).toBeGreaterThan(d1);
  });

  it("deflection is proportional to RS", () => {
    const d1 = schwarzschildDeflection(10, 1);
    const d2 = schwarzschildDeflection(10, 2);
    expect(d2).toBeCloseTo(d1 * 2, 5);
  });

  it("scales linearly with step size", () => {
    const d1 = schwarzschildDeflection(10, 1, 1);
    const d2 = schwarzschildDeflection(10, 1, 3);
    expect(d2).toBeCloseTo(d1 * 3, 5);
  });

  it("is stronger than 1/r for small radii (inverse square)", () => {
    const d1 = schwarzschildDeflection(2, 1, 1);
    const d4 = schwarzschildDeflection(4, 1, 1);
    expect(d1).toBeCloseTo(d4 * 4, 5);
  });

  it("deflects a photon by exactly 2π per orbit at the photon sphere", () => {
    const rs = 1;
    const r = photonSphereRadius(rs);
    const circumference = 2 * Math.PI * r;
    const totalBend = schwarzschildDeflection(r, rs, 1) * circumference;
    expect(totalBend).toBeCloseTo(2 * Math.PI, 5);
  });
});

describe("photonSphereRadius", () => {
  it("is 1.5 RS", () => {
    expect(photonSphereRadius(1)).toBeCloseTo(1.5, 5);
    expect(photonSphereRadius(2)).toBeCloseTo(3, 5);
  });
});

describe("adaptiveStepSize", () => {
  it("shrinks near the black hole", () => {
    const far = adaptiveStepSize(20);
    const near = adaptiveStepSize(1.5);
    expect(near).toBeLessThan(far);
  });

  it("clamps to max step 0.4", () => {
    expect(adaptiveStepSize(100)).toBe(0.4);
  });

  it("clamps to min step 0.04", () => {
    expect(adaptiveStepSize(0.01)).toBe(0.04);
  });

  it("does not exceed disk half-thickness to avoid skipping the disk", () => {
    expect(adaptiveStepSize(100)).toBeLessThanOrEqual(0.4);
  });
});

describe("diskIntersection", () => {
  it("detects intersection when |y| < halfThickness and r in range", () => {
    expect(diskIntersection(10, 0, 3, 30, 0.5)).toBe(true);
  });

  it("misses when |y| exceeds halfThickness", () => {
    expect(diskIntersection(10, 1, 3, 30, 0.5)).toBe(false);
  });

  it("misses when r is too small", () => {
    expect(diskIntersection(2, 0, 3, 30, 0.5)).toBe(false);
  });

  it("misses when r is too large", () => {
    expect(diskIntersection(50, 0, 3, 30, 0.5)).toBe(false);
  });
});
