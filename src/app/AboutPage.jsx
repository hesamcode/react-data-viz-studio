export const ABOUT_PARAGRAPH =
  "Data Viz Studio is a premium, dark-first analytics workspace for exploring built-in datasets, building reusable query views, and sharing insight-rich dashboard states.";

export default function AboutPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-surface-light p-6 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">About Data Viz Studio</h1>
      <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">{ABOUT_PARAGRAPH}</p>
      <p className="mt-6 text-base text-slate-700 dark:text-slate-200">
        Built by{" "}
        <a
          href="https://hesamcode.github.io"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit HesamCode portfolio website"
          className="font-semibold text-primary-500 underline decoration-primary-500/60 underline-offset-4 hover:text-primary-400"
        >
          HesamCode
        </a>
      </p>
    </section>
  );
}
