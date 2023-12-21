/**
 * Represents a Report
 */
export interface Report {
  /** Report summarizing knowledge graph dangling edges */
  dangling_edges?: EdgeReport[]
  /** Report summarizing knowledge graph edges */
  edges: EdgeReport[]
  /** Report summarizing knowledge graph nodes */
  nodes: NodeReport[]
  /** Report summarizing knowledge graph missing nodes */
  missing_nodes?: NodeReport[]
}

export function isReport(o: object): o is Report {
  return "edges" in o && "nodes" in o
}

export function toReport(obj: object): Report {
  const o = obj as Report
  return {
    dangling_edges: o.dangling_edges ?? [],
    edges: o.edges ?? [],
    nodes: o.nodes ?? [],
    missing_nodes: o.missing_nodes ?? [],
  }
}

/**
 * An abstract report section for a knowledge graph
 */
export interface SubReport {
  /** The categories of the node or edge objects */
  categories: string[]
  /** A human-readable name for a report */
  name: string
  /** The namespaces of the node or edge objects */
  namespaces?: string[]
  /** Total number of edge or node objects */
  total_number: number
}

export function isSubReport(o: object): o is SubReport {
  return "categories" in o && "name" in o && "total_number" in o
}

export function toSubReport(obj: SubReport): SubReport {
  const o = obj as SubReport
  return {
    categories: o.categories ?? [],
    name: o.name ?? "",
    namespaces: o.namespaces ?? [],
    total_number: o.total_number ?? 0,
  }
}

/**
 * A sub report summarizing a collection of edges
 */
export interface EdgeReport extends SubReport {
  /** Number of missing of type in collection */
  missing?: number
  /** Number of missing of type in collection - old method */
  missing_old?: number
  /** NodeType reports for the edges collection */
  node_types: NodeTypeReport[]
  /** Predicate reports for the edges collection */
  predicates: PredicateReport[]
}

export function isEdgeReport(o: object): o is EdgeReport {
  return (
    "node_types" in o &&
    "predicates" in o &&
    "categories" in o &&
    "name" in o &&
    "total_number" in o
  )
}

export function toEdgeReport(obj: EdgeReport): EdgeReport {
  const o = obj as EdgeReport
  return {
    missing: o.missing ?? 0,
    missing_old: o.missing_old ?? 0,
    node_types: o.node_types ?? [],
    predicates: o.predicates ?? [],
    categories: o.categories ?? [],
    name: o.name ?? "",
    namespaces: o.namespaces ?? [],
    total_number: o.total_number ?? 0,
  }
}

/**
 * A sub report summarizing a collection of nodes
 */
export interface NodeReport extends SubReport {
  /** The taxons of the nodes in the collection */
  taxon: string[]
}

export function isNodeReport(o: object): o is NodeReport {
  return "taxon" in o && "categories" in o && "name" in o && "total_number" in o
}

export function toNodeReport(obj: NodeReport): NodeReport {
  const o = obj as NodeReport
  return {
    taxon: o.taxon ?? [],
    categories: o.categories ?? [],
    name: o.name ?? "",
    namespaces: o.namespaces ?? [],
    total_number: o.total_number ?? 0,
  }
}

/**
 * A sub report summarizing the types of a collection of nodes
 */
export interface NodeTypeReport extends NodeReport {
  /** Number of missing of type in collection */
  missing: number
}

export function isNodeTypeReport(o: object): o is NodeTypeReport {
  return "missing" in o && "taxon" in o && "categories" in o && "name" in o && "total_number" in o
}

export function toNodeTypeReport(obj: NodeTypeReport): NodeTypeReport {
  const o = obj as NodeTypeReport
  return {
    missing: o.missing ?? 0,
    taxon: o.taxon ?? [],
    categories: o.categories ?? [],
    name: o.name ?? "",
    namespaces: o.namespaces ?? [],
    total_number: o.total_number ?? 0,
  }
}

/**
 * A sub report summarizing the predicates of a collection
 */
export interface PredicateReport {
  /** Namespaces of missing objects from predicate edges collection */
  missing_object_namespaces?: string[]
  /** Number of missing objects in edges of predicate collection */
  missing_objects?: number
  /** Namespaces of mission subjects from predicate edges collection */
  missing_subject_namespaces?: string[]
  /** Number of mission subjects in edges of predicate collection */
  missing_subjects?: number
  /** Total number of edge or node objects */
  total_number: number
  /** Predicate URI for the group of edges */
  uri: string
}

export function isPredicateReport(o: object): o is PredicateReport {
  return "total_number" in o && "uri" in o
}

export function toPredicateReport(obj: PredicateReport): PredicateReport {
  const o = obj as PredicateReport
  return {
    missing_object_namespaces: o.missing_object_namespaces ?? [],
    missing_objects: o.missing_objects ?? 0,
    missing_subject_namespaces: o.missing_subject_namespaces ?? [],
    missing_subjects: o.missing_subjects ?? 0,
    total_number: o.total_number ?? 0,
    uri: o.uri ?? "",
  }
}
