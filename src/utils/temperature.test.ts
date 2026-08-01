import { describe, it, expect } from "vitest";
import { temperatureAtRadius, blackbodyToRGB } from "./temperature";

describe("temperatureAtRadius", () => {
  it("returns max temperature at inner radius", () => {
    expect(temperatureAtRadius(3, 3, 30)).toBe(10_000);
  });

  it("returns min temperature at outer radius", () => {
    expect(temperatureAtRadius(30, 3, 30)).toBe(3_000);
  });

  it("returns intermediate temperature at midpoint", () => {
    const t = temperatureAtRadius(10, 3, 30);
    expect(t).toBeGreaterThan(3_000);
    expect(t).toBeLessThan(10_000);
  });

  it("clamps to max for radius below inner", () => {
    expect(temperatureAtRadius(1, 3, 30)).toBe(10_000);
  });

  it("clamps to min for radius above outer", () => {
    expect(temperatureAtRadius(50, 3, 30)).toBe(3_000);
  });
});

describe("blackbodyToRGB", () => {
  it("returns blue-white for 10000K", () => {
    const rgb = blackbodyToRGB(10_000);
    expect(rgb[2]).toBe(1);
    expect(rgb[1]).toBeCloseTo(0.8, 1);
  });

  it("returns warm orange for 3000K", () => {
    const rgb = blackbodyToRGB(3_000);
    expect(rgb[0]).toBe(1);
    expect(rgb[2]).toBeLessThan(0.1);
  });

  it("returns [0,0,0] for 0K", () => {
    expect(blackbodyToRGB(0)).toEqual([0, 0, 0]);
  });

  it("clamps output to [0, 1]", () => {
    const rgb = blackbodyToRGB(100_000);
    for (const c of rgb) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(1);
    }
  });
});
