import { createContext, useContext, useMemo } from "react";
import { QualityConfig, detectQualityTier } from "../utils/quality";

const QualityContext = createContext<QualityConfig>({
  tier: "HIGH",
  maxSteps: 64,
  starCount: 2000,
  particleCount: 500,
  devicePixelRatio: 1.5,
});

export function useQualityTier() {
  return useContext(QualityContext);
}

export function QualityProvider({ children }: { children: React.ReactNode }) {
  const config = useMemo(() => detectQualityTier(), []);
  return <QualityContext.Provider value={config}>{children}</QualityContext.Provider>;
}
