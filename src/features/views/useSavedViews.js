import { useCallback, useMemo, useState } from "react";
import { getSavedViewsFromStorage, saveSavedViewsToStorage } from "../../lib/storage";

function makeViewId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `view-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function useSavedViews(onStorageError) {
  const [savedViews, setSavedViews] = useState(() => {
    const { savedViews: initialViews, error } = getSavedViewsFromStorage();
    if (error) {
      onStorageError?.(error);
    }
    return initialViews;
  });

  const persist = useCallback(
    (nextViews) => {
      const { savedViews: persistedViews, error } = saveSavedViewsToStorage(nextViews);
      if (error) {
        onStorageError?.(error);
      }
      setSavedViews(persistedViews);
    },
    [onStorageError],
  );

  const saveView = useCallback(
    (name, query) => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return false;
      }

      const nextViews = [
        {
          id: makeViewId(),
          name: trimmedName,
          query,
          createdAt: new Date().toISOString(),
        },
        ...savedViews,
      ].slice(0, 30);

      persist(nextViews);
      return true;
    },
    [persist, savedViews],
  );

  const deleteView = useCallback(
    (viewId) => {
      const nextViews = savedViews.filter((view) => view.id !== viewId);
      persist(nextViews);
    },
    [persist, savedViews],
  );

  const value = useMemo(
    () => ({
      savedViews,
      saveView,
      deleteView,
    }),
    [savedViews, saveView, deleteView],
  );

  return value;
}
