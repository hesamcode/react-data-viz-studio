# Data Viz Studio

Data Viz Studio is a dark-first, SaaS-grade analytics dashboard built with Vite + React + Tailwind CSS v4. It runs as a fully static app and is compatible with GitHub Pages.

## Highlights

- 3 built-in local JSON datasets: `sales`, `users`, `retention`
- Query builder with:
  - date range
  - region/category multi-filters
  - metric selection
  - day/week/month group-by
  - optional sorting and limit controls
- Analytics output:
  - KPI row (total, average, change %)
  - main line/area trend chart
  - bar breakdown chart
  - donut breakdown chart
- Saved views with localStorage persistence (versioned storage)
- Shareable URL state with copy-link action
- Mobile-first controls in a bottom drawer
- Toast notifications, skeleton loading, empty state, and storage fallback error state
- Accessible UI patterns: focus-visible rings, icon button `aria-label`s, dialog focus trap + ESC close + focus return

## Project Structure

```text
src/
  app/
    AppShell.jsx
    router.jsx
    DashboardPage.jsx
    AboutPage.jsx
  components/
    ui/
      Button.jsx
      Select.jsx
      DateRange.jsx
      Modal.jsx
      Toast.jsx
      Drawer.jsx
  features/
    datasets/
      data/
        sales.json
        users.json
        retention.json
      index.js
      DatasetSelector.jsx
    query/
      useQueryState.js
      QueryBuilder.jsx
    charts/
      LineAreaChart.jsx
      BarChart.jsx
      DonutChart.jsx
    views/
      useSavedViews.js
      SavedViewsPanel.jsx
  lib/
    storage.js
    urlState.js
    compute.js
    format.js
    theme.js
  main.jsx
  index.css
```

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages Notes (Important)

- This app is static-only: no backend, SSR, API routes, or Node-only runtime APIs.
- Routing is hash-based (`#/...`) to avoid 404 issues on GitHub Pages.
- `vite.config.js` uses a repo base path:
  - `base: "/react-data-viz-studio/"`
- Avoid absolute asset URLs (`/asset.png`); use module imports/relative references.
- Environment variables inside app code should use `import.meta.env.VITE_*`.
- Shareable state is stored in URL search params after hash (example):
  - `#/?dataset=sales&metric=revenue...`

## Accessibility Coverage

- Global focus-visible ring styling
- Icon-only close/dismiss controls include `aria-label`
- Modal and Drawer:
  - focus trap on open
  - ESC to close
  - focus restored to trigger on close

## QA Checklist

- [x] App loads at mobile width 360px without horizontal scroll
- [x] Dark mode is default on first run and preference is persisted
- [x] Dataset switcher changes metrics and filter options
- [x] Query builder updates KPI and charts
- [x] Saved views can be created, loaded, and deleted
- [x] URL state updates and shared URLs restore query state
- [x] Toast messages appear for key actions
- [x] Skeleton loading appears on initial dashboard load
- [x] Empty state appears when filters return zero records
- [x] Storage failure path falls back gracefully with visible warning
- [x] Footer author signature appears across all routes
- [x] `npm run build` succeeds for production output

Author
HesamCode
Portfolio: https://hesamcode.github.io
