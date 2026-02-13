export function StaticGeometricPattern({ opacity = 0.15 }: { opacity?: number }) {
  const w = 400;
  const h = 400;
  const spacing = 50;
  const outerR = 18;
  const innerR = 8;
  const points = 8;

  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let x = spacing; x < w; x += spacing) {
    for (let y = spacing; y < h; y += spacing) {
      // Star polygon points
      const starPoints: string[] = [];
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        starPoints.push(`${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`);
      }

      elements.push(
        <polygon
          key={key++}
          points={starPoints.join(" ")}
          fill="none"
          stroke="#c9a84c"
          strokeWidth={0.5}
          opacity={opacity}
        />
      );

      // Horizontal connecting line
      if (x + spacing < w) {
        elements.push(
          <line
            key={key++}
            x1={x + outerR}
            y1={y}
            x2={x + spacing - outerR}
            y2={y}
            stroke="#c9a84c"
            strokeWidth={0.3}
            opacity={opacity * 0.67}
          />
        );
      }

      // Vertical connecting line
      if (y + spacing < h) {
        elements.push(
          <line
            key={key++}
            x1={x}
            y1={y + outerR}
            x2={x}
            y2={y + spacing - outerR}
            stroke="#c9a84c"
            strokeWidth={0.3}
            opacity={opacity * 0.67}
          />
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {elements}
    </svg>
  );
}
