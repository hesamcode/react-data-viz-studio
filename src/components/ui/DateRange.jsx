import { formatDateInputValue } from "../../lib/format";

export default function DateRange({ dateFrom, dateTo, onChange, min, max }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">From</span>
        <input
          type="date"
          min={min}
          max={max}
          value={formatDateInputValue(dateFrom)}
          onChange={(event) => onChange({ dateFrom: event.target.value, dateTo })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">To</span>
        <input
          type="date"
          min={min}
          max={max}
          value={formatDateInputValue(dateTo)}
          onChange={(event) => onChange({ dateFrom, dateTo: event.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </label>
    </div>
  );
}
