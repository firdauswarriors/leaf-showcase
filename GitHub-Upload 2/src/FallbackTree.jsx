import { useEffect, useRef } from "react";
// Adapted branching curvature and multi-stroke technique from ThreeUI's MIT
// Generative Tree (68802d5). Static, deterministic, no iframe or tracking.
export default function FallbackTree() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current,
      ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = 760;
    c.height = 850;
    ctx.clearRect(0, 0, 760, 850);
    let seed = 404;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    function branch(x, y, len, angle, width, depth) {
      const curve = (rand() - 0.5) * len * 0.3;
      const ex = x + Math.cos(angle) * len,
        ey = y + Math.sin(angle) * len;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(
        x + Math.cos(angle) * len * 0.33 + curve,
        y + Math.sin(angle) * len * 0.33,
        x + Math.cos(angle) * len * 0.66 + curve,
        y + Math.sin(angle) * len * 0.66,
        ex,
        ey,
      );
      ctx.strokeStyle = depth < 3 ? "#746448" : "#527348";
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.stroke();
      if (depth < 7) {
        for (let i = 0; i < 2; i++)
          branch(
            ex,
            ey,
            len * (0.65 + rand() * 0.12),
            angle + (i === 0 ? -1 : 1) * (0.27 + rand() * 0.38),
            width * 0.63,
            depth + 1,
          );
      } else {
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(angle);
        ctx.fillStyle = ["#426746", "#7c974c", "#a0b86b"][
          Math.floor(rand() * 3)
        ];
        ctx.beginPath();
        ctx.ellipse(0, 0, 10 + rand() * 7, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    branch(380, 790, 180, -Math.PI / 2, 24, 0);
  }, []);
  return (
    <canvas
      ref={ref}
      className="fallback-tree"
      role="img"
      aria-label="Botanical tree illustration. Use the feature controls below to explore Leaf."
    />
  );
}
