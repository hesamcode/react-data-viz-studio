const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

function asDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatMetricValue(value, formatType) {
  if (formatType === "currency") {
    return currencyFormatter.format(value);
  }

  if (formatType === "percent") {
    return percentFormatter.format(value);
  }

  return numberFormatter.format(value);
}

export function formatCompactValue(value, formatType) {
  if (formatType === "currency") {
    return `$${compactFormatter.format(value)}`;
  }

  if (formatType === "percent") {
    return `${(value * 100).toFixed(1)}%`;
  }

  return compactFormatter.format(value);
}

export function formatChange(value) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatSeriesLabel(groupKey, groupBy) {
  if (!groupKey) {
    return "";
  }

  if (groupBy === "month") {
    const parsed = asDate(`${groupKey}-01`);
    return parsed
      ? parsed.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })
      : groupKey;
  }

  const parsed = asDate(groupKey);
  if (!parsed) {
    return groupKey;
  }

  if (groupBy === "week") {
    return `Week of ${parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })}`;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateInputValue(value) {
  return value || "";
}
