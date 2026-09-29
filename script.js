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

const gridCanvas = document.querySelector("#background-grid");
const gridContext = gridCanvas.getContext("2d");
const gridSpacing = 34;
const gridSampleStep = 8;
let viewportWidth = 0;
let viewportHeight = 0;
let pixelRatio = 1;
let pointerX = 0;
let pointerY = 0;
let targetPointerX = 0;
let targetPointerY = 0;
let pointerStrength = 0;
let targetPointerStrength = 0;
let gridFrame = 0;

function warpPoint(x, y) {
  const deltaX = x - pointerX;
  const deltaY = y - pointerY;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance === 0 || pointerStrength < 0.001) return [x, y];

  const influence = Math.exp(-(distance * distance) / (2 * 170 ** 2));
  const displacement = 16 * influence * Math.min(distance / 30, 1) * pointerStrength;
  return [x + (deltaX / distance) * displacement, y + (deltaY / distance) * displacement];
}

function drawGrid() {
  gridContext.clearRect(0, 0, viewportWidth, viewportHeight);
  gridContext.strokeStyle = getComputedStyle(root).getPropertyValue("--grid").trim();
  gridContext.lineWidth = 1;

  for (let x = -gridSpacing; x <= viewportWidth + gridSpacing; x += gridSpacing) {
    gridContext.beginPath();
    for (let y = -gridSpacing; y <= viewportHeight + gridSpacing; y += gridSampleStep) {
      const [warpedX, warpedY] = warpPoint(x, y);
      if (y === -gridSpacing) gridContext.moveTo(warpedX, warpedY);
      else gridContext.lineTo(warpedX, warpedY);
    }
    gridContext.stroke();
  }

  for (let y = -gridSpacing; y <= viewportHeight + gridSpacing; y += gridSpacing) {
    gridContext.beginPath();
    for (let x = -gridSpacing; x <= viewportWidth + gridSpacing; x += gridSampleStep) {
      const [warpedX, warpedY] = warpPoint(x, y);
      if (x === -gridSpacing) gridContext.moveTo(warpedX, warpedY);
      else gridContext.lineTo(warpedX, warpedY);
    }
    gridContext.stroke();
  }
}

function resizeGrid() {
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  gridCanvas.width = Math.round(viewportWidth * pixelRatio);
  gridCanvas.height = Math.round(viewportHeight * pixelRatio);
  gridContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  drawGrid();
}

function animateGrid() {
  gridFrame = 0;
  pointerX += (targetPointerX - pointerX) * 0.18;
  pointerY += (targetPointerY - pointerY) * 0.18;
  pointerStrength += (targetPointerStrength - pointerStrength) * 0.18;
  drawGrid();

  if (
    Math.abs(targetPointerX - pointerX) > 0.1 ||
    Math.abs(targetPointerY - pointerY) > 0.1 ||
    Math.abs(targetPointerStrength - pointerStrength) > 0.001
  ) {
    gridFrame = requestAnimationFrame(animateGrid);
  } else {
    pointerStrength = targetPointerStrength;
    drawGrid();
  }
}

function scheduleGridAnimation() {
  if (!gridFrame) gridFrame = requestAnimationFrame(animateGrid);
}

resizeGrid();
window.addEventListener("resize", resizeGrid);

if (window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener("pointermove", (event) => {
    targetPointerX = event.clientX;
    targetPointerY = event.clientY;
    targetPointerStrength = 1;
    scheduleGridAnimation();
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    targetPointerStrength = 0;
    scheduleGridAnimation();
  });
}

themeToggle.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  updateThemeToggle();
  drawGrid();

  try {
    localStorage.setItem(themeStorageKey, root.dataset.theme);
  } catch {
    // The selected theme still applies for this page view.
  }
});