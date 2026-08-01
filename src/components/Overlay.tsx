export function Overlay() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <h1
        style={{
          color: "white",
          fontFamily: "sans-serif",
          fontSize: "1.5rem",
          fontWeight: 300,
          textAlign: "center",
          marginTop: "2rem",
          letterSpacing: "0.3em",
          opacity: 0.7,
        }}
      >
        BLACK HOLE · Gargantua
      </h1>
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          width: "100%",
          textAlign: "center",
          color: "rgba(255,255,255,0.4)",
          fontFamily: "sans-serif",
          fontSize: "0.8rem",
        }}
      >
        拖拽旋转 · 滚轮缩放
      </div>
    </div>
  );
}
