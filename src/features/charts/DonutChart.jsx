import { memo, useMemo } from "react";
import { formatCompactValue } from "../../lib/format";

const COLORS = ["#A855F7", "#22C55E", "#38BDF8", "#F59E0B", "#F97316", "#EF4444"];

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function arcPath(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

const DonutChart = memo(function DonutChart({ data, metricFormat, title }) {
  const normalized = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total <= 0) {
      return { slices: [], total: 0 };
    }

    let cursor = 0;
    const slices = data.map((item, index) => {
      const angle = (item.value / total) * 360;
      const startAngle = cursor;
      const endAngle = cursor + angle;
      cursor += angle;
      return {
        ...item,
        color: COLORS[index % COLORS.length],
        startAngle,
        endAngle,
        percent: (item.value / total) * 100,
      };
    });

    return { slices, total };
  }, [data]);

  return (
    <article className="rounded-2xl border border-slate-200 bg-surface-light p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{data.length} slices</span>
      </div>

      {normalized.slices.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-3 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No regional split to display.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
          <svg viewBox="0 0 240 240" className="mx-auto h-44 w-44" role="img" aria-label="Donut chart">
            <circle cx="120" cy="120" r="76" fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="28" />
            {normalized.slices.map((slice) => (
              <path
                key={slice.label}
                d={arcPath(120, 120, 76, slice.startAngle, slice.endAngle)}
                fill="none"
                stroke={slice.color}
                strokeWidth="28"
                strokeLinecap="round"
              >
                <title>
                  {slice.label}: {formatCompactValue(slice.value, metricFormat)}
                </title>
              </path>
            ))}
            <text x="120" y="115" textAnchor="middle" fontSize="16" fill="rgba(226,232,240,0.95)">
              Total
            </text>
            <text x="120" y="138" textAnchor="middle" fontSize="15" fill="#22C55E">
              {formatCompactValue(normalized.total, metricFormat)}
            </text>
          </svg>

          <ul className="space-y-2 text-sm">
            {normalized.slices.map((slice) => (
              <li key={`legend-${slice.label}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                  <span className="text-slate-700 dark:text-slate-200">{slice.label}</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400">
                  {slice.percent.toFixed(1)}% ({formatCompactValue(slice.value, metricFormat)})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
});

export default DonutChart;
