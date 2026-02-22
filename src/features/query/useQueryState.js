import { useCallback, useEffect, useMemo, useState } from "react";
import { getDatasetById } from "../datasets";
import { createDefaultQuery, sanitizeQuery } from "../../lib/compute";
import { buildShareUrl, decodeQueryFromSearch, parseHashLocation, replaceHashQuery } from "../../lib/urlState";

function createInitialQuery() {
  const location = parseHashLocation();
  const defaultDataset = getDatasetById("sales");
  const baseQuery = createDefaultQuery(defaultDataset);
  const decoded = decodeQueryFromSearch(location.search, baseQuery);
  const dataset = getDatasetById(decoded.datasetId || defaultDataset.id);
  return sanitizeQuery(decoded, dataset);
}

export function useQueryState(pathname = "/") {
  const [query, setQuery] = useState(createInitialQuery);

  const dataset = useMemo(() => getDatasetById(query.datasetId), [query.datasetId]);

  const updateQuery = useCallback((patch) => {
    setQuery((current) => {
      const nextDataset = getDatasetById(patch.datasetId ?? current.datasetId);
      const nextQuery = sanitizeQuery({ ...current, ...patch }, nextDataset);
      return nextQuery;
    });
  }, []);

  const switchDataset = useCallback((datasetId) => {
    setQuery((current) => {
      const nextDataset = getDatasetById(datasetId);
      const nextDefaults = createDefaultQuery(nextDataset);
      return sanitizeQuery(
        {
          ...current,
          datasetId: nextDataset.id,
          metric: nextDefaults.metric,
          regions: [],
          categories: [],
          dateFrom: nextDefaults.dateFrom,
          dateTo: nextDefaults.dateTo,
        },
        nextDataset,
      );
    });
  }, []);

  const resetFilters = useCallback(() => {
    const defaults = createDefaultQuery(dataset);
    setQuery(defaults);
  }, [dataset]);

  useEffect(() => {
    replaceHashQuery(pathname, query);
  }, [pathname, query]);

  const shareUrl = useMemo(() => buildShareUrl(pathname, query), [pathname, query]);

  return {
    query,
    dataset,
    shareUrl,
    updateQuery,
    switchDataset,
    resetFilters,
  };
}
