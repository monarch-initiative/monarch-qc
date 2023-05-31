// Detect if the browser is using dark mode
export function isDarkMode(): boolean {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
}

// Return the appropriate row style based on the color scheme
export function getRowStyle(index: number) {
  const contrastBackgroundColor = isDarkMode()
    ? "var(--dark-mode-contrast-background-color)"
    : "var(--light-mode-contrast-background-color)"

  return {
    backgroundColor: index % 2 === 0 ? contrastBackgroundColor : "transparent",
  }
}
