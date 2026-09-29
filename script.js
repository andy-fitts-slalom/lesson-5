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

if (window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let pointerX = 0;
  let pointerY = 0;
  let framePending = false;

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;

    if (framePending) return;
    framePending = true;

    requestAnimationFrame(() => {
      framePending = false;
      const offsetX = ((pointerX / window.innerWidth) - 0.5) * 8;
      const offsetY = ((pointerY / window.innerHeight) - 0.5) * 8;
      root.style.setProperty("--pointer-x", `${pointerX}px`);
      root.style.setProperty("--pointer-y", `${pointerY}px`);
      root.style.setProperty("--pattern-x", `${offsetX}px`);
      root.style.setProperty("--pattern-y", `${offsetY}px`);
    });
  }, { passive: true });
}

themeToggle.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  updateThemeToggle();

  try {
    localStorage.setItem(themeStorageKey, root.dataset.theme);
  } catch {
    // The selected theme still applies for this page view.
  }
});