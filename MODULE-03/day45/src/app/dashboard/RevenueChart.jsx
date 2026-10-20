"use client";

export function formatETB(value) {
  if (value >= 1000) {
    const thousands = value / 1000;
    const trimmed = Number.isInteger(thousands)
      ? String(thousands)
      : thousands.toFixed(1);
    return `ETB ${trimmed}k`;
  }
  return `ETB ${value}`;
}

function niceTicks(max, count = 4) {
  if (max <= 0) return [0];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rough) ??
    magnitude * 10;
  const ticks = [];
  for (let value = 0; value <= max + 1e-9; value += step) {
    ticks.push(Math.round(value * 100) / 100);
  }
  return ticks;
}

const WIDTH = 760;
const HEIGHT = 340;
const MARGIN = { top: 18, right: 92, bottom: 44, left: 116 };

export default function RevenueChart({ data, labelledBy }) {
  const rows = data ?? [];
  const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const maxRevenue = rows.reduce((max, row) => Math.max(max, row.revenue), 0);
  const ticks = niceTicks(maxRevenue);
  const scaleMax = ticks[ticks.length - 1] || 1;
  const x = (value) => MARGIN.left + (value / scaleMax) * plotWidth;

  const rowHeight = rows.length ? plotHeight / rows.length : plotHeight;
  const barHeight = Math.min(24, rowHeight * 0.62);

  return (
    <div className="chart-frame">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby={labelledBy}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              className="chart-grid"
              x1={x(tick)}
              x2={x(tick)}
              y1={MARGIN.top}
              y2={HEIGHT - MARGIN.bottom}
            />
            <text
              className="chart-tick"
              x={x(tick)}
              y={HEIGHT - MARGIN.bottom + 18}
              textAnchor="middle"
            >
              {formatETB(tick)}
            </text>
          </g>
        ))}

        {rows.map((row, index) => {
          const barTop = MARGIN.top + index * rowHeight + (rowHeight - barHeight) / 2;
          const width = Math.max(2, x(row.revenue) - MARGIN.left);
          return (
            <g key={row.area}>
              <text
                className="chart-label"
                x={MARGIN.left - 10}
                y={barTop + barHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {row.area}
              </text>
              <rect
                className="chart-bar"
                x={MARGIN.left}
                y={barTop}
                width={width}
                height={barHeight}
                rx={4}
              >
                <title>{`${row.area}: ETB ${row.revenue.toLocaleString("en-US")} from ${row.orders} order${row.orders === 1 ? "" : "s"}`}</title>
              </rect>
              <text
                className="chart-value"
                x={MARGIN.left + width + 8}
                y={barTop + barHeight / 2}
                dominantBaseline="middle"
              >
                {formatETB(row.revenue)}
              </text>
            </g>
          );
        })}

        <line
          className="chart-axis"
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={HEIGHT - MARGIN.bottom}
          y2={HEIGHT - MARGIN.bottom}
        />
        <text
          className="chart-axis-title"
          x={MARGIN.left}
          y={HEIGHT - 8}
          textAnchor="start"
        >
          Revenue per neighbourhood, Ethiopian Birr
        </text>
      </svg>
    </div>
  );
}
