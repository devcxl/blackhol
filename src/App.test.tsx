import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children?: React.ReactNode }) => (
    <canvas data-testid="r3f-canvas">{children}</canvas>
  ),
}));

import { App } from "./App";

describe("App", () => {
  it("renders a canvas", () => {
    const { container } = render(<App />);
    expect(container.querySelector("canvas")).toBeTruthy();
  });
});
