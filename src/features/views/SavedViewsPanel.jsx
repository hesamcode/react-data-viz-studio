import Button from "../../components/ui/Button";

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SavedViewsPanel({ savedViews, onLoadView, onDeleteView, onOpenSaveModal }) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-surface-light p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Saved Views</h2>
        <Button variant="primary" size="sm" onClick={onOpenSaveModal}>
          Save Current
        </Button>
      </div>

      {savedViews.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          No saved views yet. Save your current query setup to reuse it later.
        </p>
      ) : (
        <ul className="space-y-2">
          {savedViews.map((view) => (
            <li
              key={view.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700"
            >
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{view.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatTimestamp(view.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => onLoadView(view)}>
                  Load
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDeleteView(view.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
