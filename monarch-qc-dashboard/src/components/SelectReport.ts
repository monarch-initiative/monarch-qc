export function selectReport(
  report: string,
  reports: Map<string, Promise<string>>
): Promise<string> {
  /**
   * Returns the report text for the given report name.
   * @report: string
   * @reports: Map<string, Promise<string>>
   * @return: Promise<string>
   */
  const reportText = reports.get(report)
  if (reportText === undefined) {
    throw new Error("Report not found")
  }
  return reportText
}
