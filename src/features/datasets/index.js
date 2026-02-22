import salesRows from "./data/sales.json";
import usersRows from "./data/users.json";
import retentionRows from "./data/retention.json";

const DATASET_MAP = {
  sales: {
    id: "sales",
    name: "Sales Performance",
    description: "Revenue, order flow, and unit velocity across regions.",
    rows: salesRows,
    metrics: [
      { key: "revenue", label: "Revenue", format: "currency" },
      { key: "orders", label: "Orders", format: "number" },
      { key: "units", label: "Units", format: "number" },
    ],
    defaultMetric: "revenue",
  },
  users: {
    id: "users",
    name: "User Growth",
    description: "Acquisition and activity trends by plan and geography.",
    rows: usersRows,
    metrics: [
      { key: "signups", label: "Signups", format: "number" },
      { key: "activeUsers", label: "Active Users", format: "number" },
      { key: "churned", label: "Churned Users", format: "number" },
    ],
    defaultMetric: "activeUsers",
  },
  retention: {
    id: "retention",
    name: "Retention Health",
    description: "Cohort retention quality and trend movement.",
    rows: retentionRows,
    metrics: [
      { key: "retentionRate", label: "Retention Rate", format: "percent", aggregation: "avg" },
      { key: "retainedUsers", label: "Retained Users", format: "number" },
      { key: "cohortSize", label: "Cohort Size", format: "number" },
    ],
    defaultMetric: "retentionRate",
  },
};

function listUnique(rows, key) {
  return [...new Set(rows.map((row) => row[key]))].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );
}

export const DATASETS = Object.values(DATASET_MAP).map((dataset) => ({
  ...dataset,
  regions: listUnique(dataset.rows, "region"),
  categories: listUnique(dataset.rows, "category"),
}));

const DATASET_LOOKUP = Object.fromEntries(DATASETS.map((dataset) => [dataset.id, dataset]));

export function getDatasetById(datasetId) {
  return DATASET_LOOKUP[datasetId] ?? DATASETS[0];
}

export function getDatasetOptions() {
  return DATASETS.map(({ id, name }) => ({ value: id, label: name }));
}
