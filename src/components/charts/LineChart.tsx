'use client';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  title: string;
}

export function LineChart({ data, color = 'var(--accent)', title }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center text-sm text-[var(--text-muted)] py-8">No data yet</div>
    );
  }

  const viewW = 400;
  const viewH = 160;
  const padding = { top: 16, right: 12, bottom: 28, left: 44 };
  const chartW = viewW - padding.left - padding.right;
  const chartH = viewH - padding.top - padding.bottom;

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

  // Y-axis: 3 ticks
  const yTicks = [minVal, minVal + range / 2, maxVal].map(v => ({
    value: Math.round(v),
    y: padding.top + chartH - ((v - minVal) / range) * chartH,
  }));

  // X-axis: up to 5 evenly spaced labels
  const labelCount = Math.min(data.length, 5);
  const xIndices: number[] = [];
  for (let i = 0; i < labelCount; i++) {
    xIndices.push(Math.round((i / (labelCount - 1)) * (data.length - 1)));
  }
  if (data.length === 1) xIndices.splice(0, xIndices.length, 0);

  return (
    <div className="mb-5">
      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">{title}</h3>
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full rounded-lg bg-[var(--surface)] border border-[var(--border)]"
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
            strokeWidth="0.5"
          />
        ))}

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={padding.left - 6}
            y={tick.y + 4}
            textAnchor="end"
            fontSize="10"
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
            y={viewH - 4}
            textAnchor="middle"
            fontSize="9"
            fill="var(--text-muted)"
          >
            {data[idx].label}
          </text>
        ))}
      </svg>
    </div>
  );
}
