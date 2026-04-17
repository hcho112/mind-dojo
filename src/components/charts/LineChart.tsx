'use client';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  title: string;
}

export function LineChart({ data, height = 150, color = 'var(--accent)', title }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center text-sm text-[var(--text-muted)] py-8">No data yet</div>
    );
  }

  const padding = { top: 20, right: 16, bottom: 32, left: 48 };
  const width = 100; // percentage-based, SVG viewBox handles scaling
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
    const y = padding.top + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Area fill under the line
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // Y-axis labels (3 ticks)
  const yTicks = [minVal, minVal + range / 2, maxVal].map(v => ({
    value: Math.round(v),
    y: padding.top + chartH - ((v - minVal) / range) * chartH,
  }));

  // X-axis labels (first, middle, last)
  const xIndices = data.length <= 3
    ? data.map((_, i) => i)
    : [0, Math.floor(data.length / 2), data.length - 1];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">{title}</h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full rounded-lg bg-[var(--surface)] border border-[var(--border)]"
        style={{ height: `${height}px` }}
      >
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={tick.y}
            x2={padding.left + chartW}
            y2={tick.y}
            stroke="var(--border)"
            strokeWidth="0.3"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={color} opacity="0.1" />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={padding.left - 4}
            y={tick.y + 1}
            textAnchor="end"
            fontSize="5"
            fill="var(--text-muted)"
          >
            {tick.value.toLocaleString()}
          </text>
        ))}

        {/* X-axis labels */}
        {xIndices.map((idx) => (
          <text
            key={idx}
            x={points[idx].x}
            y={padding.top + chartH + 10}
            textAnchor="middle"
            fontSize="4"
            fill="var(--text-muted)"
          >
            {data[idx].label}
          </text>
        ))}
      </svg>
    </div>
  );
}
