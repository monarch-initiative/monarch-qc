export interface QCPart {
  categories: string[]
  missing: number
  name: string
  namespaces: string[]
  node_types: string[]
  predicates: string[]
  taxon: string[]
  total_number: number
}

export function toQCPart(i: object = {}): QCPart {
  const o = <QCPart>i
  return {
    categories: o.categories ?? [],
    missing: o.missing ?? 0,
    name: o.name ?? "",
    namespaces: o.namespaces ?? [],
    node_types: o.node_types ?? [],
    predicates: o.predicates ?? [],
    taxon: o.taxon ?? [],
    total_number: o.total_number ?? 0,
  }
}

export interface QCReport {
  dangling_edges: QCPart[]
  edges: QCPart[]
  missing_nodes: QCPart[]
  nodes: QCPart[]
}

export function toQCReport(i: object = {}): QCReport {
  const o = <QCReport>i
  return {
    dangling_edges: o.dangling_edges ?? [],
    edges: o.edges ?? [],
    missing_nodes: o.missing_nodes ?? [],
    nodes: o.nodes ?? [],
  }
}

export interface StatCount {
  count: number
  provided_by: Map<string, { count: number }>
}

export interface EdgeStatPart {
  count_by_predicates: Map<string, StatCount>
  count_by_spo: Map<string, StatCount>
  predicates: string[]
  provided_by: string[]
  total_edges: number
}

export interface NodeStatPart {
  count_by_category: Map<string, Map<string, number>>
  predicates: string[]
  provided_by: string[]
  total_nodes: number
}

export interface StatReport {
  edge_stats: EdgeStatPart
  graph_name: string
  node_stats: NodeStatPart
}

export function getNamespaces(qcparts: QCPart[]): string[] {
  /**
   * Returns all namespaces in the QCPart.
   * @qcpart: QCPart[]
   * @return: string[]
   */
  let allNamespaces: string[] = []
  for (const item of qcparts) {
    const qcpart = toQCPart(item)
    allNamespaces = allNamespaces.concat(qcpart.namespaces)
  }
  return allNamespaces
}

export function stringSetDiff(a: string[], b: string[]): string[] {
  /**
   * Returns the difference (A-B) between two string arrays.
   * @a: string[]
   * @b: string[]
   * @return: string[]
   */
  const diff: string[] = a.filter((x) => !b.includes(x))
  return uniq(diff).sort()
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
