import { useMemo, useState } from "react";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { applyTheme } from "../lib/theme";

function navClass(isActive) {
  if (isActive) {
    return "bg-primary-500/20 text-primary-500";
  }

  return "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800";
}

export default function AppShell({ pathname, children }) {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const { pushToast } = useToast();

  const navItems = useMemo(
    () => [
      { href: "#/", label: "Dashboard", isActive: pathname === "/" },
      { href: "#/about", label: "About", isActive: pathname === "/about" },
    ],
    [pathname],
  );

  const onToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    const { error } = applyTheme(nextTheme);
    if (error) {
      pushToast({
        title: "Theme persistence disabled",
        description: error,
        kind: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg-light text-text-light dark:bg-bg-dark dark:text-text-dark">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 pb-6 pt-4 sm:px-5 lg:px-8">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-surface-light/90 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-surface-dark/85">
          <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500/20 to-accent-500/15 px-3 py-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Data Viz Studio</span>
          </div>

          <nav aria-label="Primary" className="flex items-center gap-1 rounded-xl bg-slate-100/70 p-1 dark:bg-slate-900/80">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${navClass(item.isActive)}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="min-w-28"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-base text-slate-700 dark:border-slate-800 dark:text-slate-300">
          Built by{" "}
          <a
            href="https://hesamkhorshidi.github.io"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Hesam Khorshidi portfolio website"
            className="font-semibold text-primary-500 hover:text-primary-400"
          >
            Hesam Khorshidi
          </a>
        </footer>
      </div>
    </div>
  );
}
