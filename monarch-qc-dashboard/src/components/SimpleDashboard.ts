import { uniq } from "../qc_utils"

export interface DashboardDataGroup {
  [field: string]: DashboardData
}

export interface DashboardData {
  [field: string]: {
    value: Map<string, number>
    diff: Map<string, number>
  }
}

export function getDataLabels(data: DashboardData): string[] {
  /**
   * Returns the data labels of the internal value/diff maps.
   * @data: DashboardData
   * @return: string[]
   */
  const labels: string[] = []
  const fieldData = Object.values(data)[0]
  if (fieldData === undefined) return labels
  for (const [name] of fieldData.value) {
    labels.push(name)
  }
  return labels
}

export function getAllVisualDiffs(data: DashboardData): Map<string, Map<string, string>> {
  /**
   * Returns a map of the differences between two maps.
   * @data: DashboardData
   * @return: Map<string, Map<string, string>>
   */
  const visualDiffs = new Map<string, Map<string, string>>()
  for (const [field, value] of Object.entries(data)) {
    if (getNextField(field, data) === null) continue
    const nextField = getNextField(field, data) as string
    visualDiffs.set(field, getVisualDiffs(value.value, data[nextField].value))
  }
  return visualDiffs
}

export function getNextField(
  field: number | string,
  data: DashboardData | Array<string>
): string | null {
  /**
   * Returns the next field in the DashboardData object.
   * @index: number
   * @data: DashboardData
   * @return: string
   */
  // Check if data is an array of strings
  if (Array.isArray(data)) {
    const index = typeof field === "string" ? data.indexOf(field) : field
    return index < data.length - 1 ? data[index + 1] : null
  }
  const keys = Object.keys(data)
  const index = typeof field === "string" ? keys.indexOf(field) : field
  return index < keys.length - 1 ? keys[index + 1] : null
}

function getVisualDiffs(a: Map<string, number>, b: Map<string, number>): Map<string, string> {
  /**
   * Returns a map of the differences between two maps.
   * @a: Map<string, number>
   * @b: Map<string, number>
   * @return: Map<string, string>
   */
  if (a === undefined || b === undefined) return new Map<string, string>()
  const names = uniq([...a.keys(), ...b.keys()])
  const edge_diff = new Map<string, string>()
  for (const name of names) {
    if (name == "Total Number") continue
    const diff = visualDiff(a.get(name) ?? 0, b.get(name) ?? 0)
    edge_diff.set(name, diff)
  }
  if (a.get("Total Number") !== undefined && b.get("Total Number") !== undefined) {
    const diff = visualDiff(a.get("Total Number") ?? 0, b.get("Total Number") ?? 0)
    edge_diff.set("-------------", "-------------")
    edge_diff.set("Total Number", diff)
  }
  return edge_diff
}

function visualDiff(a: number, b: number): string {
  /**
   * Returns a visual representation of the ratio of a to a+b.
   * @a: number
   * @b: number
   * @return: string
   */
  const filled = "⚫"
  const unfilled = "⚪"
  const ratio = Math.floor((a / (a + b)) * 10)
  // create a filled/unfilled circle representation of the ratio
  // e.g. 3/7 = ⚫⚫⚫⚪⚪⚪⚪⚪⚪⚪
  const visualRatio: string = filled.repeat(ratio).concat(unfilled.repeat(10 - ratio))
  return visualRatio
}
