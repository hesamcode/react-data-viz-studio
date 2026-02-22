import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Drawer from "../components/ui/Drawer";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { BarChart, DonutChart, LineAreaChart } from "../features/charts";
import QueryBuilder from "../features/query/QueryBuilder";
import { useQueryState } from "../features/query/useQueryState";
import SavedViewsPanel from "../features/views/SavedViewsPanel";
import { useSavedViews } from "../features/views/useSavedViews";
import { computeAnalytics } from "../lib/compute";
import { formatChange, formatMetricValue } from "../lib/format";

function KpiCard({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
        ? "text-red-400"
        : "text-slate-900 dark:text-slate-100";

  return (
    <article className="rounded-2xl border border-slate-200 bg-surface-light p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </article>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {["a", "b", "c"].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

function cloneQuery(query) {
  return {
    ...query,
    regions: [...query.regions],
    categories: [...query.categories],
  };
}

export default function DashboardPage() {
  const { query, dataset, shareUrl, updateQuery, switchDataset, resetFilters } = useQueryState("/");
  const [controlsOpen, setControlsOpen] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { pushToast } = useToast();
  const { savedViews, saveView, deleteView } = useSavedViews((message) => setStorageError(message));

  const analytics = useMemo(() => computeAnalytics(dataset, query), [dataset, query]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), 260);
    return () => window.clearTimeout(timeoutId);
  }, [dataset.id, query]);

  const handleQueryChange = useCallback(
    (patch) => {
      setIsLoading(true);
      updateQuery(patch);
    },
    [updateQuery],
  );

  const handleDatasetChange = useCallback(
    (datasetId) => {
      setIsLoading(true);
      switchDataset(datasetId);
    },
    [switchDataset],
  );

  const handleResetFilters = useCallback(() => {
    setIsLoading(true);
    resetFilters();
  }, [resetFilters]);

  const metricFormat = analytics.metric.format;
  const kpiTotal = formatMetricValue(analytics.kpis.total, metricFormat);
  const kpiAverage = formatMetricValue(analytics.kpis.average, metricFormat);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      pushToast({
        title: "Share link copied",
        description: "The current query state is now on your clipboard.",
        kind: "success",
      });
    } catch {
      pushToast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        kind: "error",
      });
    }
  };

  const handleSaveView = () => {
    const created = saveView(viewName, cloneQuery(query));
    if (!created) {
      pushToast({
        title: "Name required",
        description: "Give the view a name before saving.",
        kind: "error",
      });
      return;
    }

    setSaveModalOpen(false);
    setViewName("");
    pushToast({
      title: "View saved",
      description: "You can load it anytime from the Saved Views panel.",
      kind: "success",
    });
  };

  const handleDeleteView = (viewId) => {
    deleteView(viewId);
    pushToast({
      title: "View deleted",
      description: "The saved configuration was removed.",
      kind: "info",
    });
  };

  const handleLoadView = (view) => {
    if (!view?.query) {
      return;
    }

    setIsLoading(true);
    updateQuery(view.query);
    pushToast({
      title: "View loaded",
      description: `Applied configuration: ${view.name}`,
      kind: "success",
    });
  };

  const queryBuilder = (
    <QueryBuilder
      dataset={dataset}
      query={query}
      onDatasetChange={handleDatasetChange}
      onQueryChange={handleQueryChange}
      onReset={handleResetFilters}
    />
  );

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-surface-light p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-primary-500/10 via-cyan-400/5 to-accent-500/10" />
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Data Viz Studio</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{dataset.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setSaveModalOpen(true)}>
                Save View
              </Button>
              <Button variant="primary" onClick={handleCopyShareLink}>
                Copy Share Link
              </Button>
            </div>
          </div>

          <div className="md:hidden">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setControlsOpen(true)}
              aria-label="Open query controls drawer"
            >
              Open Filters & Query Controls
            </Button>
          </div>
        </div>
      </section>

      {storageError ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Storage fallback active: {storageError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden space-y-4 md:block">
          {queryBuilder}
          <SavedViewsPanel
            savedViews={savedViews}
            onOpenSaveModal={() => setSaveModalOpen(true)}
            onLoadView={handleLoadView}
            onDeleteView={handleDeleteView}
          />
        </aside>

        <main className="space-y-4">
          {isLoading ? (
            <AnalyticsSkeleton />
          ) : analytics.filteredRows.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">No results found</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Adjust date range or filters to bring data back into view.
              </p>
              <Button className="mt-4" variant="secondary" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </section>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <KpiCard label="Total" value={kpiTotal} />
                <KpiCard label="Average" value={kpiAverage} />
                <KpiCard
                  label="Change %"
                  value={formatChange(analytics.kpis.changePct)}
                  tone={analytics.kpis.changePct >= 0 ? "positive" : "negative"}
                />
              </section>

              <LineAreaChart
                title="Main Trend"
                series={analytics.series}
                metricFormat={metricFormat}
                groupBy={query.groupBy}
              />

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <BarChart title="Category Breakdown" data={analytics.categoryBreakdown} metricFormat={metricFormat} />
                <DonutChart title="Regional Distribution" data={analytics.regionBreakdown} metricFormat={metricFormat} />
              </div>
            </>
          )}

          <div className="md:hidden">
            <SavedViewsPanel
              savedViews={savedViews}
              onOpenSaveModal={() => setSaveModalOpen(true)}
              onLoadView={handleLoadView}
              onDeleteView={handleDeleteView}
            />
          </div>
        </main>
      </div>

      <Drawer open={controlsOpen} onClose={() => setControlsOpen(false)} title="Query Controls">
        {queryBuilder}
      </Drawer>

      <Modal
        open={isSaveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Current View"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveView}>
              Save View
            </Button>
          </>
        }
      >
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-200">View name</span>
          <input
            type="text"
            value={viewName}
            onChange={(event) => setViewName(event.target.value)}
            placeholder="Q1 revenue pulse"
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          />
        </label>
      </Modal>
    </div>
  );
}
