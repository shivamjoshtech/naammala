import { useEffect, useRef, useState } from "react";

// A simple freehand canvas — draws like a pencil on paper.
// Exposes the drawing as a PNG data-url via onChange, and stays crisp/undistorted
// across resizes and device rotation by resetting cleanly instead of stretching.

export default function WritingCanvas({ height = 180, onChange, placeholder }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getContext = () => canvasRef.current.getContext("2d");

  const sizeCanvasToContainer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    canvas.width = displayWidth * ratio;
    canvas.height = displayHeight * ratio;

    const ctx = getContext();
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#2B2620";
  };

  useEffect(() => {
    sizeCanvasToContainer();

    // On resize/rotation, re-fit the canvas rather than letting the browser stretch
    // pre-drawn pixels (which would distort the naam). We clear and ask the user
    // to re-write — safer than a distorted, unusable drawing.
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        sizeCanvasToContainer();
        setHasDrawn(false);
        if (onChange) onChange(null);
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      clearTimeout(resizeTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    const { x, y } = getPos(e);
    const ctx = getContext();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = getContext();
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasDrawn) setHasDrawn(true);
  };

  const stopDraw = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (onChange) {
      onChange(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    if (onChange) onChange(null);
  };

  return (
    <div ref={wrapperRef}>
      <div style={{ position: "relative" }}>
        {!hasDrawn && placeholder && (
          <span style={styles.placeholder}>{placeholder}</span>
        )}
        <canvas
          ref={canvasRef}
          style={{ ...styles.canvas, height }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
      <button type="button" onClick={clear} style={styles.clearButton}>
        Clear
      </button>
    </div>
  );
}

const styles = {
  canvas: {
    width: "100%",
    display: "block",
    background: "#FFFFFF",
    border: "1px dashed var(--border)",
    borderRadius: "10px",
    touchAction: "none",
    cursor: "crosshair",
  },
  placeholder: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "var(--ink-soft)",
    fontStyle: "italic",
    pointerEvents: "none",
    textAlign: "center",
    width: "80%",
  },
  clearButton: {
    marginTop: "0.5rem",
    background: "none",
    border: "none",
    color: "var(--accent)",
    cursor: "pointer",
    fontSize: "0.85rem",
    padding: 0,
  },
};