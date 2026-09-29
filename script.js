const root = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");
const themeStorageKey = "my-links-theme";

try {
  if (localStorage.getItem(themeStorageKey) === "light") {
    root.dataset.theme = "light";
  }
} catch {
  // Keep the dark default when browser storage is unavailable.
}

function updateThemeToggle() {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  const label = `Switch to ${nextTheme} mode`;
  themeToggle.setAttribute("aria-label", label);
  themeToggle.setAttribute("title", label);
  themeToggle.setAttribute("aria-pressed", String(nextTheme === "dark"));
}

updateThemeToggle();

themeToggle.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  updateThemeToggle();

  try {
    localStorage.setItem(themeStorageKey, root.dataset.theme);
  } catch {
    // The selected theme still applies for this page view.
  }
});