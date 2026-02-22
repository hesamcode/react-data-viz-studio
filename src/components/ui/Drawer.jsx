import { useEffect, useRef } from "react";
import Button from "./Button";

function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  return [...container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
    (element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden"),
  );
}

export default function Drawer({ open, onClose, title, children }) {
  const drawerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement;
    const focusable = getFocusableElements(drawerRef.current);
    (focusable[0] ?? drawerRef.current)?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const elements = getFocusableElements(drawerRef.current);
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/60 md:hidden"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border border-slate-700 bg-surface-dark px-4 pb-6 pt-4 text-text-dark shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-lg p-0 text-slate-200"
            onClick={onClose}
            aria-label="Close filters drawer"
          >
            <span aria-hidden="true">✕</span>
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
