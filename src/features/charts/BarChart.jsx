import { memo } from "react";
import { formatCompactValue } from "../../lib/format";

const BarChart = memo(function BarChart({ data, metricFormat, title }) {
  const maxValue = data.length > 0 ? Math.max(...data.map((item) => item.value)) : 1;

  return (
    <article className="rounded-2xl border border-slate-200 bg-surface-light p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{data.length} segments</span>
      </div>

      {data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-3 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No category breakdown to render.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate">{item.label}</span>
                <span>{formatCompactValue(item.value, metricFormat)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                  style={{ width: `${Math.max(8, (item.value / maxValue) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
});

export default BarChart;
