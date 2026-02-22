import { getThemeFromStorage, saveThemeToStorage } from "./storage";

function setDarkClass(isDark) {
  const html = document.documentElement;
  if (isDark) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}

export function initializeTheme() {
  if (typeof document === "undefined") {
    return { theme: "dark", error: null };
  }

  const { theme, error } = getThemeFromStorage();
  const resolvedTheme = theme === "light" ? "light" : "dark";
  setDarkClass(resolvedTheme === "dark");
  return { theme: resolvedTheme, error };
}

export function applyTheme(theme) {
  const resolvedTheme = theme === "light" ? "light" : "dark";
  setDarkClass(resolvedTheme === "dark");
  return saveThemeToStorage(resolvedTheme);
}
