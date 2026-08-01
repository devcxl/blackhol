import { describe, it, expect } from "vitest";
import { isInsideEventHorizon, schwarzschildDeflection, diskIntersection } from "./schwarzschild";

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
