const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDate(dateValue) {
  const parsed = new Date(`${dateValue}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function clampDateRange(rows, dateFrom, dateTo) {
  if (rows.length === 0) {
    return { dateFrom: "", dateTo: "" };
  }

  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const minDate = sorted[0].date;
  const maxDate = sorted[sorted.length - 1].date;

  return {
    dateFrom: dateFrom || minDate,
    dateTo: dateTo || maxDate,
  };
}

function groupKeyFromDate(dateValue, groupBy) {
  const date = toUtcDate(dateValue);
  if (!date) {
    return { key: dateValue, ts: Number.MAX_SAFE_INTEGER };
  }

  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  if (groupBy === "month") {
    return { key: `${year}-${month}`, ts: Date.UTC(year, date.getUTCMonth(), 1) };
  }

  if (groupBy === "week") {
    const dayOfWeek = date.getUTCDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mondayTs = date.getTime() + mondayOffset * DAY_MS;
    const mondayDate = new Date(mondayTs);
    const weekYear = mondayDate.getUTCFullYear();
    const weekMonth = `${mondayDate.getUTCMonth() + 1}`.padStart(2, "0");
    const weekDay = `${mondayDate.getUTCDate()}`.padStart(2, "0");
    return {
      key: `${weekYear}-${weekMonth}-${weekDay}`,
      ts: Date.UTC(weekYear, mondayDate.getUTCMonth(), mondayDate.getUTCDate()),
    };
  }

  return { key: `${year}-${month}-${day}`, ts: Date.UTC(year, date.getUTCMonth(), date.getUTCDate()) };
}

function createBucket() {
  return { sum: 0, count: 0 };
}

function updateBucket(bucket, value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return;
  }

  bucket.sum += value;
  bucket.count += 1;
}

function finalizeBucket(bucket, aggregation) {
  if (bucket.count === 0) {
    return 0;
  }

  if (aggregation === "avg") {
    return bucket.sum / bucket.count;
  }

  return bucket.sum;
}

function applySortingAndLimit(items, sortBy, sortDir, limit) {
  const direction = sortDir === "asc" ? 1 : -1;
  const sorted = [...items].sort((a, b) => {
    if (sortBy === "label") {
      return a.label.localeCompare(b.label) * direction;
    }

    return (a.value - b.value) * direction;
  });

  if (!limit || limit <= 0) {
    return sorted;
  }

  return sorted.slice(0, limit);
}

function valueInSelection(value, selected) {
  if (!selected || selected.length === 0) {
    return true;
  }

  return selected.includes(value);
}

export function createDefaultQuery(dataset) {
  const sortedDates = [...dataset.rows]
    .map((row) => row.date)
    .sort((a, b) => a.localeCompare(b));

  return {
    datasetId: dataset.id,
    dateFrom: sortedDates[0] ?? "",
    dateTo: sortedDates[sortedDates.length - 1] ?? "",
    regions: [],
    categories: [],
    metric: dataset.defaultMetric,
    groupBy: "week",
    sortBy: "value",
    sortDir: "desc",
    limit: 8,
  };
}

export function sanitizeQuery(query, dataset) {
  const defaults = createDefaultQuery(dataset);
  const metricKeys = dataset.metrics.map((metric) => metric.key);

  const merged = {
    ...defaults,
    ...query,
    datasetId: dataset.id,
    regions: Array.isArray(query?.regions)
      ? query.regions.filter((value) => dataset.regions.includes(value))
      : [],
    categories: Array.isArray(query?.categories)
      ? query.categories.filter((value) => dataset.categories.includes(value))
      : [],
    limit: Number.isFinite(Number(query?.limit)) ? Math.max(1, Math.min(20, Number(query.limit))) : defaults.limit,
  };

  if (!metricKeys.includes(merged.metric)) {
    merged.metric = defaults.metric;
  }

  if (!["day", "week", "month"].includes(merged.groupBy)) {
    merged.groupBy = defaults.groupBy;
  }

  if (!["value", "label"].includes(merged.sortBy)) {
    merged.sortBy = defaults.sortBy;
  }

  if (!["asc", "desc"].includes(merged.sortDir)) {
    merged.sortDir = defaults.sortDir;
  }

  const clampedRange = clampDateRange(dataset.rows, merged.dateFrom, merged.dateTo);
  merged.dateFrom = clampedRange.dateFrom;
  merged.dateTo = clampedRange.dateTo;

  if (merged.dateFrom > merged.dateTo) {
    merged.dateFrom = clampedRange.dateFrom;
    merged.dateTo = clampedRange.dateTo;
  }

  return merged;
}

export function computeAnalytics(dataset, query) {
  const metric = dataset.metrics.find((item) => item.key === query.metric) ?? dataset.metrics[0];
  const aggregation = metric.aggregation ?? "sum";
  const rangeStart = toUtcDate(query.dateFrom);
  const rangeEnd = toUtcDate(query.dateTo);

  const filteredRows = dataset.rows.filter((row) => {
    const rowDate = toUtcDate(row.date);
    if (!rowDate || !rangeStart || !rangeEnd) {
      return false;
    }

    const inDateRange = rowDate.getTime() >= rangeStart.getTime() && rowDate.getTime() <= rangeEnd.getTime();
    const inRegion = valueInSelection(row.region, query.regions);
    const inCategory = valueInSelection(row.category, query.categories);

    return inDateRange && inRegion && inCategory;
  });

  if (filteredRows.length === 0) {
    return {
      metric,
      filteredRows,
      series: [],
      categoryBreakdown: [],
      regionBreakdown: [],
      kpis: {
        total: 0,
        average: 0,
        changePct: 0,
      },
    };
  }

  const seriesBuckets = new Map();
  const categoryBuckets = new Map();
  const regionBuckets = new Map();

  filteredRows.forEach((row) => {
    const value = Number(row[metric.key]);

    const groupMeta = groupKeyFromDate(row.date, query.groupBy);
    if (!seriesBuckets.has(groupMeta.key)) {
      seriesBuckets.set(groupMeta.key, { ...createBucket(), ts: groupMeta.ts });
    }
    updateBucket(seriesBuckets.get(groupMeta.key), value);

    if (!categoryBuckets.has(row.category)) {
      categoryBuckets.set(row.category, createBucket());
    }
    updateBucket(categoryBuckets.get(row.category), value);

    if (!regionBuckets.has(row.region)) {
      regionBuckets.set(row.region, createBucket());
    }
    updateBucket(regionBuckets.get(row.region), value);
  });

  const series = [...seriesBuckets.entries()]
    .map(([label, bucket]) => ({ label, value: finalizeBucket(bucket, aggregation), ts: bucket.ts }))
    .sort((a, b) => a.ts - b.ts)
    .map(({ label, value }) => ({ label, value }));

  const categoryBreakdown = applySortingAndLimit(
    [...categoryBuckets.entries()].map(([label, bucket]) => ({ label, value: finalizeBucket(bucket, aggregation) })),
    query.sortBy,
    query.sortDir,
    query.limit,
  );

  const regionBreakdown = applySortingAndLimit(
    [...regionBuckets.entries()].map(([label, bucket]) => ({ label, value: finalizeBucket(bucket, aggregation) })),
    query.sortBy,
    query.sortDir,
    query.limit,
  );

  const total = series.reduce((sum, item) => sum + item.value, 0);
  const average = total / series.length;
  const first = series[0]?.value ?? 0;
  const last = series[series.length - 1]?.value ?? 0;
  const changePct = first === 0 ? 0 : ((last - first) / Math.abs(first)) * 100;

  return {
    metric,
    filteredRows,
    series,
    categoryBreakdown,
    regionBreakdown,
    kpis: {
      total,
      average,
      changePct,
    },
  };
}
