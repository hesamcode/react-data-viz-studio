const ARRAY_SEPARATOR = ",";

function isClient() {
  return typeof window !== "undefined";
}

function normalizePath(pathname) {
  if (!pathname || pathname === "#") {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function parseArray(value) {
  if (!value) {
    return [];
  }

  return value
    .split(ARRAY_SEPARATOR)
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyArray(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return "";
  }

  return values.join(ARRAY_SEPARATOR);
}

export function parseHashLocation(hashValue) {
  const hash = hashValue ?? (isClient() ? window.location.hash : "#/");
  const withoutHash = hash.replace(/^#/, "");
  const [pathPart, searchPart = ""] = withoutHash.split("?");
  return {
    pathname: normalizePath(pathPart),
    search: searchPart ? `?${searchPart}` : "",
  };
}

export function encodeQueryToSearch(queryState) {
  const params = new URLSearchParams();

  if (queryState.datasetId) params.set("dataset", queryState.datasetId);
  if (queryState.dateFrom) params.set("from", queryState.dateFrom);
  if (queryState.dateTo) params.set("to", queryState.dateTo);

  const regions = stringifyArray(queryState.regions);
  if (regions) params.set("regions", regions);

  const categories = stringifyArray(queryState.categories);
  if (categories) params.set("categories", categories);

  if (queryState.metric) params.set("metric", queryState.metric);
  if (queryState.groupBy) params.set("groupBy", queryState.groupBy);
  if (queryState.sortBy) params.set("sortBy", queryState.sortBy);
  if (queryState.sortDir) params.set("sortDir", queryState.sortDir);
  if (queryState.limit) params.set("limit", String(queryState.limit));

  return params.toString();
}

export function decodeQueryFromSearch(search, fallbackQuery) {
  const params = new URLSearchParams(search?.startsWith("?") ? search.slice(1) : search ?? "");
  const limitValue = params.get("limit");

  return {
    ...fallbackQuery,
    datasetId: params.get("dataset") ?? fallbackQuery.datasetId,
    dateFrom: params.get("from") ?? fallbackQuery.dateFrom,
    dateTo: params.get("to") ?? fallbackQuery.dateTo,
    regions: parseArray(params.get("regions")),
    categories: parseArray(params.get("categories")),
    metric: params.get("metric") ?? fallbackQuery.metric,
    groupBy: params.get("groupBy") ?? fallbackQuery.groupBy,
    sortBy: params.get("sortBy") ?? fallbackQuery.sortBy,
    sortDir: params.get("sortDir") ?? fallbackQuery.sortDir,
    limit: limitValue && Number.isFinite(Number(limitValue)) ? Number(limitValue) : fallbackQuery.limit,
  };
}

export function replaceHashQuery(pathname, queryState) {
  if (!isClient()) {
    return;
  }

  const search = encodeQueryToSearch(queryState);
  const hash = search ? `#${normalizePath(pathname)}?${search}` : `#${normalizePath(pathname)}`;
  const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;

  window.history.replaceState(null, "", nextUrl);
}

export function buildShareUrl(pathname, queryState) {
  if (!isClient()) {
    return "";
  }

  const search = encodeQueryToSearch(queryState);
  const hash = search ? `#${normalizePath(pathname)}?${search}` : `#${normalizePath(pathname)}`;
  return `${window.location.origin}${window.location.pathname}${window.location.search}${hash}`;
}
