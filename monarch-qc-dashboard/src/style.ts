export function isDarkMode(): boolean {
  /**
   * Returns true if the user's OS is in dark mode.
   * @return: boolean
   */
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function getRowStyle(index: number) {
  /**
   * Returns the appropriate row style based on the color scheme.
   * @index: number
   * @return: string
   */
  const contrastBackgroundColor = isDarkMode()
    ? "var(--dark-mode-contrast-background-color)"
    : "var(--light-mode-contrast-background-color)"

  return {
    backgroundColor: index % 2 === 0 ? contrastBackgroundColor : "transparent",
  }
}

export function titleFormat(title: string | null) {
  /**
   * Returns the title with underscores replaced with spaces and the first letter capitalized.
   * @title: string | null
   * @return: string
   */
  if (title === null) return ""
  return title.replace(/_/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()))
}
