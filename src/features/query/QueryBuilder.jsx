import DateRange from "../../components/ui/DateRange";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import DatasetSelector from "../datasets/DatasetSelector";

const GROUP_BY_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const SORT_BY_OPTIONS = [
  { value: "value", label: "Metric Value" },
  { value: "label", label: "Label" },
];

const SORT_DIR_OPTIONS = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

const LIMIT_OPTIONS = [
  { value: "5", label: "Top 5" },
  { value: "8", label: "Top 8" },
  { value: "12", label: "Top 12" },
  { value: "20", label: "Top 20" },
];

export default function QueryBuilder({ dataset, query, onQueryChange, onDatasetChange, onReset }) {
  const metricOptions = dataset.metrics.map((metric) => ({ value: metric.key, label: metric.label }));
  const regionOptions = dataset.regions.map((region) => ({ value: region, label: region }));
  const categoryOptions = dataset.categories.map((category) => ({ value: category, label: category }));

  const sortedDates = [...dataset.rows].map((row) => row.date).sort((a, b) => a.localeCompare(b));
  const minDate = sortedDates[0];
  const maxDate = sortedDates[sortedDates.length - 1];

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-surface-light p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Query Builder</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <DatasetSelector value={query.datasetId} onChange={onDatasetChange} />

      <DateRange
        dateFrom={query.dateFrom}
        dateTo={query.dateTo}
        min={minDate}
        max={maxDate}
        onChange={({ dateFrom, dateTo }) => onQueryChange({ dateFrom, dateTo })}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          id="metric"
          label="Metric"
          options={metricOptions}
          value={query.metric}
          onChange={(metric) => onQueryChange({ metric })}
        />
        <Select
          id="groupBy"
          label="Group By"
          options={GROUP_BY_OPTIONS}
          value={query.groupBy}
          onChange={(groupBy) => onQueryChange({ groupBy })}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          id="sortBy"
          label="Sort By"
          options={SORT_BY_OPTIONS}
          value={query.sortBy}
          onChange={(sortBy) => onQueryChange({ sortBy })}
        />
        <Select
          id="sortDir"
          label="Sort Direction"
          options={SORT_DIR_OPTIONS}
          value={query.sortDir}
          onChange={(sortDir) => onQueryChange({ sortDir })}
        />
      </div>

      <Select
        id="limit"
        label="Limit"
        options={LIMIT_OPTIONS}
        value={String(query.limit)}
        onChange={(limit) => onQueryChange({ limit: Number(limit) })}
      />

      <Select
        id="regionFilter"
        label="Region Filter"
        options={regionOptions}
        value={query.regions}
        onChange={(regions) => onQueryChange({ regions })}
        multiple
      />

      <Select
        id="categoryFilter"
        label="Category Filter"
        options={categoryOptions}
        value={query.categories}
        onChange={(categories) => onQueryChange({ categories })}
        multiple
      />
    </section>
  );
}
