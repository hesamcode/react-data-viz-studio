const STORAGE_KEY = "data-viz-studio::state";
const STORAGE_VERSION = 1;

const DEFAULT_STATE = {
  version: STORAGE_VERSION,
  theme: "dark",
  savedViews: [],
};

let memoryState = { ...DEFAULT_STATE };

function isClient() {
  return typeof window !== "undefined";
}

function normalizeSavedViews(savedViews) {
  if (!Array.isArray(savedViews)) {
    return [];
  }

  return savedViews
    .filter((view) => view && typeof view.id === "string" && typeof view.name === "string")
    .map((view) => ({
      id: view.id,
      name: view.name,
      query: view.query ?? null,
      createdAt: view.createdAt ?? new Date().toISOString(),
    }));
}

function normalizeState(raw) {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_STATE };
  }

  const theme = raw.theme === "light" ? "light" : "dark";
  return {
    version: STORAGE_VERSION,
    theme,
    savedViews: normalizeSavedViews(raw.savedViews),
  };
}

function readRawStorage() {
  if (!isClient()) {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY);
}

function writeRawStorage(value) {
  if (!isClient()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, value);
}

export function readVersionedStorage() {
  try {
    const raw = readRawStorage();
    if (!raw) {
      memoryState = { ...DEFAULT_STATE };
      return { state: memoryState, error: null, fallback: false };
    }

    const parsed = JSON.parse(raw);
    const normalized = normalizeState(parsed?.version === STORAGE_VERSION ? parsed : DEFAULT_STATE);
    memoryState = normalized;
    return { state: normalized, error: null, fallback: false };
  } catch {
    return {
      state: memoryState,
      error: "Browser storage is unavailable. Changes are kept in memory for this session.",
      fallback: true,
    };
  }
}

export function writeVersionedStorage(partialState) {
  const { state: currentState } = readVersionedStorage();
  const nextState = normalizeState({ ...currentState, ...partialState });
  memoryState = nextState;

  try {
    writeRawStorage(JSON.stringify(nextState));
    return { state: nextState, error: null, fallback: false };
  } catch {
    return {
      state: nextState,
      error: "Could not persist data to browser storage. Using memory fallback.",
      fallback: true,
    };
  }
}

export function getSavedViewsFromStorage() {
  const { state, error, fallback } = readVersionedStorage();
  return { savedViews: state.savedViews, error, fallback };
}

export function saveSavedViewsToStorage(savedViews) {
  const { state, error, fallback } = writeVersionedStorage({ savedViews });
  return { savedViews: state.savedViews, error, fallback };
}

export function getThemeFromStorage() {
  const { state, error, fallback } = readVersionedStorage();
  return { theme: state.theme, error, fallback };
}

export function saveThemeToStorage(theme) {
  const { state, error, fallback } = writeVersionedStorage({ theme });
  return { theme: state.theme, error, fallback };
}

export const storageMeta = {
  key: STORAGE_KEY,
  version: STORAGE_VERSION,
};
