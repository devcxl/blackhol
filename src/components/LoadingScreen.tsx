import { useState, useEffect } from "react";

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        zIndex: 100,
        transition: "opacity 0.5s",
      }}
    >
      <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", fontSize: "1rem" }}>
        Loading...
      </p>
    </div>
  );
}
