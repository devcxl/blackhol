import { BlackHoleScene } from "./components/BlackHoleScene";
import { QualityProvider } from "./hooks/useQualityTier";
import { Overlay } from "./components/Overlay";
import { LoadingScreen } from "./components/LoadingScreen";

export function App() {
  return (
    <QualityProvider>
      <LoadingScreen />
      <BlackHoleScene />
      <Overlay />
    </QualityProvider>
  );
}
