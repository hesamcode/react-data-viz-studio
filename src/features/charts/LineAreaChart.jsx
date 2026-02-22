import { memo, useMemo } from "react";
import { formatCompactValue, formatSeriesLabel } from "../../lib/format";

const CHART_HEIGHT = 220;
const CHART_WIDTH = 720;
const PADDING = { top: 20, right: 20, bottom: 38, left: 44 };

function buildChartPoints(series) {
  if (series.length === 0) {
    return [];
  }

  const minValue = Math.min(...series.map((item) => item.value));
  const maxValue = Math.max(...series.map((item) => item.value));
  const valueRange = maxValue - minValue || 1;
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  return series.map((item, index) => {
    const x = PADDING.left + (series.length === 1 ? innerWidth / 2 : (index / (series.length - 1)) * innerWidth);
    const y = PADDING.top + ((maxValue - item.value) / valueRange) * innerHeight;
    return {
      ...item,
      x,
      y,
    };
  });
}

const LineAreaChart = memo(function LineAreaChart({ series, groupBy, metricFormat, title }) {
  const points = useMemo(() => buildChartPoints(series), [series]);

  const linePath = useMemo(() => {
    if (points.length === 0) {
      return "";
    }

    return points
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
      .join(" ");
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) {
      return "";
    }

    const first = points[0];
    const last = points[points.length - 1];
    const baseline = CHART_HEIGHT - PADDING.bottom;

    return `${linePath} L${last.x.toFixed(2)},${baseline.toFixed(2)} L${first.x.toFixed(2)},${baseline.toFixed(2)} Z`;
  }, [linePath, points]);

  const labels = [points[0], points[Math.floor(points.length / 2)], points[points.length - 1]].filter(Boolean);

  return (
    <article className="rounded-2xl border border-slate-200 bg-surface-light p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{series.length} points</span>
      </div>

      {points.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-3 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No trend data available for the selected filters.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-slate-100/70 p-2 dark:bg-slate-900/60">
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-56 w-full" role="img" aria-label="Main trend chart">
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(168,85,247,0.50)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0.05)" />
              </linearGradient>
            </defs>

            <line
              x1={PADDING.left}
              y1={CHART_HEIGHT - PADDING.bottom}
              x2={CHART_WIDTH - PADDING.right}
              y2={CHART_HEIGHT - PADDING.bottom}
              stroke="rgba(148,163,184,0.5)"
              strokeWidth="1"
            />

            <path d={areaPath} fill="url(#lineGradient)" />
            <path d={linePath} fill="none" stroke="#A855F7" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

            {points.map((point) => (
              <circle key={`${point.label}-${point.value}`} cx={point.x} cy={point.y} r="3" fill="#22C55E">
                <title>
                  {formatSeriesLabel(point.label, groupBy)} - {formatCompactValue(point.value, metricFormat)}
                </title>
              </circle>
            ))}

            {labels.map((point) => (
              <text
                key={`x-${point.label}`}
                x={point.x}
                y={CHART_HEIGHT - 12}
                textAnchor="middle"
                fontSize="11"
                fill="rgba(148,163,184,0.95)"
              >
                {formatSeriesLabel(point.label, groupBy)}
              </text>
            ))}

            <text
              x={PADDING.left}
              y={18}
              textAnchor="start"
              fontSize="11"
              fill="rgba(148,163,184,0.95)"
            >
              {formatCompactValue(Math.max(...series.map((item) => item.value)), metricFormat)}
            </text>
          </svg>
        </div>
      )}
    </article>
  );
});

export default LineAreaChart;
