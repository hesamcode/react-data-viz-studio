import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AppShell from "./AppShell";
import DashboardPage from "./DashboardPage";
import AboutPage from "./AboutPage";
import { parseHashLocation } from "../lib/urlState";
import { ToastProvider, ToastViewport } from "../components/ui/Toast";

const RouterContext = createContext(null);

function ensureHashPath() {
  if (!window.location.hash) {
    window.location.hash = "#/";
  }
}

function HashRouter({ children }) {
  const [location, setLocation] = useState(() => parseHashLocation());

  useEffect(() => {
    ensureHashPath();

    const onHashChange = () => {
      setLocation(parseHashLocation());
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, []);

  const value = useMemo(() => ({ location }), [location]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

function useHashRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useHashRouter must be used within HashRouter");
  }

  return context;
}

function NotFoundPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-surface-light p-6 text-center shadow-sm dark:border-slate-800 dark:bg-surface-dark">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The requested route does not exist in this static app.</p>
      <a
        href="#/"
        className="mt-4 inline-flex rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        Back to Dashboard
      </a>
    </section>
  );
}

function RouteSwitch() {
  const {
    location: { pathname },
  } = useHashRouter();

  if (pathname === "/about") {
    return <AboutPage />;
  }

  if (pathname === "/") {
    return <DashboardPage />;
  }

  return <NotFoundPage />;
}

function RoutedApp() {
  const {
    location: { pathname },
  } = useHashRouter();

  return (
    <AppShell pathname={pathname}>
      <RouteSwitch />
    </AppShell>
  );
}

export default function AppRouter() {
  return (
    <ToastProvider>
      <HashRouter>
        <RoutedApp />
      </HashRouter>
      <ToastViewport />
    </ToastProvider>
  );
}
