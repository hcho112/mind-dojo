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

export function LineChart({ data, color = 'var(--accent-precision)', title }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '32px 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--text-dim)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        No data yet
      </div>
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

  const yTicks = [minVal, minVal + range / 2, maxVal].map(v => ({
    value: Math.round(v),
    y: padding.top + chartH - ((v - minVal) / range) * chartH,
  }));

  const labelCount = Math.min(data.length, 5);
  const xIndices: number[] = [];
  for (let i = 0; i < labelCount; i++) {
    xIndices.push(Math.round((i / (labelCount - 1)) * (data.length - 1)));
  }
  if (data.length === 1) xIndices.splice(0, xIndices.length, 0);

  return (
    <div style={{ marginBottom: 20 }}>
      <div className="eyebrow" style={{ marginBottom: 8, paddingLeft: 2 }}>{title}</div>
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        style={{
          width: '100%',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elev)',
          border: '1px solid var(--stroke)',
        }}
      >
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={tick.y}
            x2={padding.left + chartW}
            y2={tick.y}
            stroke="var(--stroke)"
            strokeWidth="0.5"
          />
        ))}

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={padding.left - 6}
            y={tick.y + 4}
            textAnchor="end"
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--text-dim)"
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
            fontSize="8"
            fontFamily="var(--font-mono)"
            fill="var(--text-dim)"
          >
            {data[idx].label}
          </text>
        ))}
      </svg>
    </div>
  );
}
