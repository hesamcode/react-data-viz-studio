import { forwardRef } from "react";
import { cn } from "./cn";

const variantClasses = {
  primary:
    "bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-400 active:bg-primary-600 dark:shadow-primary-500/30",
  secondary:
    "bg-surface-light text-text-light border border-slate-200 hover:border-primary-500/40 dark:bg-slate-800 dark:text-text-dark dark:border-slate-700",
  ghost:
    "bg-transparent text-text-light hover:bg-slate-100 dark:text-text-dark dark:hover:bg-slate-800",
  danger:
    "bg-red-500 text-white hover:bg-red-400 active:bg-red-600",
};

const sizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

const Button = forwardRef(function Button(
  { variant = "primary", size = "md", className = "", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
        variantClasses[variant] ?? variantClasses.primary,
        sizeClasses[size] ?? sizeClasses.md,
        className,
      )}
      {...props}
    />
  );
});

export default Button;
