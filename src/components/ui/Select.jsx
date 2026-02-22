import { cn } from "./cn";

function normalizeValue(value, multiple) {
  if (multiple) {
    return Array.isArray(value) ? value : [];
  }

  return value ?? "";
}

export default function Select({
  id,
  label,
  options,
  value,
  onChange,
  multiple = false,
  className = "",
  placeholder = "Select",
}) {
  return (
    <label className={cn("flex w-full flex-col gap-2 text-sm", className)}>
      <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <select
        id={id}
        value={normalizeValue(value, multiple)}
        multiple={multiple}
        onChange={(event) => {
          if (multiple) {
            const selected = [...event.target.selectedOptions].map((option) => option.value);
            onChange(selected);
            return;
          }

          onChange(event.target.value);
        }}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
          multiple && "min-h-24",
        )}
      >
        {!multiple && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
