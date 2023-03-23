export interface QCReport {
  dangling_edges: QCPart[]
  edges: QCPart[]
  missing_nodes: QCPart[]
  nodes: QCPart[]
}

export interface QCPart {
  categories: []
  missing: number
  name: string
  namespaces: []
  node_types: []
  predicates: []
  taxon: []
  total_number: number
}

export function getNamespaces(qcpart: QCPart[]): string[] {
  /**
   * Returns all namespaces in the QCPart.
   * @qcpart: QCPart[]
   * @return: string[]
   */
  if (qcpart === undefined) return []

  let allNamespaces: string[] = []
  for (const item of qcpart) {
    allNamespaces = allNamespaces.concat(item.namespaces)
  }
  return allNamespaces
}

export function stringSetDiff(a: string[], b: string[]): string[] {
  /**
   * Returns the difference between two string arrays.
   * @a: string[]
   * @b: string[]
   * @return: string[]
   */
  const diff: string[] = a.filter((x) => !b.includes(x))
  return diff
}

export function uniq(items: string[]) {
  /**
   * Returns the unique items in the array.
   * @items: string[]
   * @return: string[]
   */
  const result: string[] = []
  for (const i of items) {
    if (result.indexOf(i) < 0) result.push(i)
  }
  return result
}

export function zipMap(keys: string[], values: object[]): Map<string, object> {
  /**
   * Zips two arrays into a map of keys to values.
   * @keys: string[]
   * @values: any[]
   * @return: Map<string, any>
   */
  if (keys.length !== values.length) {
    throw new RangeError("Keys and Values must be of equal length.")
  }
  const zippedMap = new Map<string, object>()
  keys.forEach((key, i) => zippedMap.set(key, values[i]))

  return zippedMap
}
