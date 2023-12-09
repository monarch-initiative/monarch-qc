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

export function isQCReport(i: object): i is QCReport {
  return "dangling_edges" in i && "edges" in i && "missing_nodes" in i && "nodes" in i
}

export interface StatCount {
  count: number
  provided_by: { [key: string]: { count: number } }
}

export interface EdgeStatPart {
  count_by_predicates: { [key: string]: StatCount }
  count_by_spo: { [key: string]: StatCount }
  predicates: string[]
  provided_by: string[]
  total_edges: number
}

export function isEdgeStatPart(i: object | string): i is EdgeStatPart {
  if (typeof i === "string") return false
  return "count_by_predicates" in i && "count_by_spo" in i
}

export interface NodeStatPart {
  count_by_category: { [key: string]: StatCount }
  count_by_id_prefixes: { [key: string]: number }
  count_by_id_prefixes_by_category: { [key: string]: { [key: string]: StatCount } }
  node_categories: string[]
  node_id_prefixes: string[]
  node_id_prefixes_by_category: { [key: string]: string[] }
  provided_by: string[]
  total_nodes: number
}

export function isNodeStatPart(i: object | string): i is NodeStatPart {
  if (typeof i != "object") return false
  return "count_by_category" in i && "count_by_id_prefixes" in i
}

export interface StatReport {
  edge_stats: EdgeStatPart
  graph_name: string
  node_stats: NodeStatPart
}

export function toStatReport(i: object = {}): StatReport {
  const o = <StatReport>i
  return {
    edge_stats: o.edge_stats ?? {},
    graph_name: o.graph_name ?? "",
    node_stats: o.node_stats ?? {},
  }
}

export function isStatReport(i: object): i is StatReport {
  return "edge_stats" in i && "graph_name" in i && "node_stats" in i
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
