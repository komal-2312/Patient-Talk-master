export const DEFAULT_PRIMARY = "#1c6e73";
export const DEFAULT_SECONDARY = "#9ed6df";

export const applyTheme = (primary, secondary, saveToStorage = true) => {
  if (!primary || !secondary) return;

  const getContrastColor = (hex) => {
    if (!hex) return "#ffffff";
    const color = hex.replace("#", "");
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#0b1c28" : "#ffffff";
  };

  const contrastText = getContrastColor(secondary);
  const btnText = getContrastColor(primary);
  const isDark = contrastText === "#ffffff";

  document.documentElement.style.setProperty("--primary-color", primary);
  document.documentElement.style.setProperty("--secondary-color", secondary);
  document.documentElement.style.setProperty("--text-main", contrastText);
  document.documentElement.style.setProperty("--btn-text", btnText);
  document.documentElement.style.setProperty(
    "--glass-bg",
    isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.75)"
  );
  document.documentElement.style.setProperty(
    "--glass-border",
    isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)"
  );
  document.body.style.background = secondary;

  if (saveToStorage) {
    localStorage.setItem("hospitalAdminColor", primary);
    localStorage.setItem("hospitalUserColor", secondary);
  }
};

export const resetToDefaultTheme = () => {
  applyTheme(DEFAULT_PRIMARY, DEFAULT_SECONDARY, false);
};

export const loadThemeFromStorage = () => {
  const primary = localStorage.getItem("hospitalAdminColor");
  const secondary = localStorage.getItem("hospitalUserColor");
  if (primary && secondary) {
    applyTheme(primary, secondary);
  } else {
    resetToDefaultTheme();
  }
};
