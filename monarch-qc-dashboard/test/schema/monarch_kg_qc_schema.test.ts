import { describe, expect, test } from "vitest"
import * as qc from "../../src/schema/monarch_kg_qc_schema"

describe("isReport tests ", () => {
  test("isReport required fields", () => {
    const report: qc.Report = {
      edges: [],
      nodes: [],
    }
    expect(qc.isReport(report)).toEqual(true)
  })
  test("isReport optional fields", () => {
    const report: qc.Report = {
      dangling_edges: [],
      edges: [],
      nodes: [],
      missing_nodes: [],
    }
    expect(qc.isReport(report)).toEqual(true)
  })
  test("isReport empty", () => {
    const report = {}
    expect(qc.isReport(report)).toEqual(false)
  })
  test("isReport missing edges", () => {
    const report = {
      nodes: [],
    }
    expect(qc.isReport(report)).toEqual(false)
  })
  test("isReport missing nodes", () => {
    const report = {
      edges: [],
    }
    expect(qc.isReport(report)).toEqual(false)
  })
})

describe("toReport tests ", () => {
  test("toReport required fields", () => {
    const report = {
      edges: [],
      nodes: [],
    }
    expect(qc.toReport(report)).toEqual({
      dangling_edges: [],
      edges: [],
      nodes: [],
      missing_nodes: [],
    })
  })
  test("toReport empty", () => {
    const report = {}
    expect(qc.toReport(report)).toEqual({
      dangling_edges: [],
      edges: [],
      nodes: [],
      missing_nodes: [],
    })
  })
})

describe("isSubReport tests ", () => {
  test("isSubReport required fields", () => {
    const subReport: qc.SubReport = {
      categories: [],
      name: "",
      total_number: 0,
    }
    expect(qc.isSubReport(subReport)).toEqual(true)
  })
  test("isSubReport optional fields", () => {
    const subReport: qc.SubReport = {
      categories: [],
      name: "",
      namespaces: [],
      total_number: 0,
    }
    expect(qc.isSubReport(subReport)).toEqual(true)
  })
  test("isSubReport empty", () => {
    const subReport = {}
    expect(qc.isSubReport(subReport)).toEqual(false)
  })
  test("isSubReport missing categories", () => {
    const subReport = {
      name: "",
      total_number: 0,
    }
    expect(qc.isSubReport(subReport)).toEqual(false)
  })
  test("isSubReport missing name", () => {
    const subReport = {
      categories: [],
      total_number: 0,
    }
    expect(qc.isSubReport(subReport)).toEqual(false)
  })
  test("isSubReport missing total_number", () => {
    const subReport = {
      categories: [],
      name: "",
    }
    expect(qc.isSubReport(subReport)).toEqual(false)
  })
})

describe("toSubReport tests ", () => {
  test("toSubReport", () => {
    const subReport = {
      categories: [],
      name: "",
      total_number: 0,
    }
    expect(qc.toSubReport(subReport)).toEqual({
      categories: [],
      name: "",
      namespaces: [],
      total_number: 0,
    })
  })
  test("toSubReport empty", () => {
    const subReport = {}
    expect(qc.toSubReport(subReport as unknown as qc.SubReport)).toEqual({
      categories: [],
      name: "",
      namespaces: [],
      total_number: 0,
    })
  })
})

describe("isEdgeReport tests ", () => {
  test("isEdgeReport required fields", () => {
    const edgeReport: qc.EdgeReport = {
      categories: [],
      name: "",
      total_number: 0,
      node_types: [],
      predicates: [],
    }
    expect(qc.isEdgeReport(edgeReport)).toEqual(true)
  })
  test("isEdgeReport optional fields", () => {
    const edgeReport: qc.EdgeReport = {
      categories: [],
      name: "",
      total_number: 0,
      missing: 0,
      missing_old: 0,
      node_types: [],
      predicates: [],
    }
    expect(qc.isEdgeReport(edgeReport)).toEqual(true)
  })
  test("isEdgeReport empty", () => {
    const edgeReport = {}
    expect(qc.isEdgeReport(edgeReport)).toEqual(false)
  })
  test("isEdgeReport missing node_types", () => {
    const edgeReport = {
      categories: [],
      name: "",
      total_number: 0,
      predicates: [],
    }
    expect(qc.isEdgeReport(edgeReport)).toEqual(false)
  })
  test("isEdgeReport missing predicates", () => {
    const edgeReport = {
      categories: [],
      name: "",
      total_number: 0,
      node_types: [],
    }
    expect(qc.isEdgeReport(edgeReport)).toEqual(false)
  })
})

describe("toEdgeReport tests ", () => {
  test("toEdgeReport required fields", () => {
    const edgeReport = {
      categories: [],
      name: "",
      total_number: 0,
      node_types: [],
      predicates: [],
    }
    expect(qc.toEdgeReport(edgeReport)).toEqual({
      missing: 0,
      missing_old: 0,
      node_types: [],
      predicates: [],
      categories: [],
      name: "",
      namespaces: [],
      total_number: 0,
    })
  })
  test("toEdgeReport empty", () => {
    const edgeReport = {}
    expect(qc.toEdgeReport(edgeReport as unknown as qc.EdgeReport)).toEqual({
      missing: 0,
      missing_old: 0,
      node_types: [],
      predicates: [],
      categories: [],
      name: "",
      namespaces: [],
      total_number: 0,
    })
  })
})

describe("isNodeReport tests ", () => {
  test("isNodeReport required fields", () => {
    const nodeReport: qc.NodeReport = {
      categories: [],
      name: "",
      total_number: 0,
      taxon: [],
    }
    expect(qc.isNodeReport(nodeReport)).toEqual(true)
  })
  test("isNodeReport empty", () => {
    const nodeReport = {}
    expect(qc.isNodeReport(nodeReport)).toEqual(false)
  })
})

describe("toNodeReport tests ", () => {
  test("toNodeReport required fields", () => {
    const nodeReport = {
      categories: [],
      name: "",
      total_number: 0,
      taxon: [],
    }
    expect(qc.toNodeReport(nodeReport)).toEqual({
      taxon: [],
      categories: [],
      name: "",
      namespaces: [],
      total_number: 0,
    })
  })
  test("toNodeReport empty", () => {
    const nodeReport = {}
    expect(qc.toNodeReport(nodeReport as unknown as qc.NodeReport)).toEqual({
      taxon: [],
      categories: [],
      name: "",
      namespaces: [],
      total_number: 0,
    })
  })
})

describe("isNodeTypeReport tests ", () => {
  test("isNodeTypeReport required fields", () => {
    const nodeTypeReport: qc.NodeTypeReport = {
      categories: [],
      name: "",
      total_number: 0,
      taxon: [],
      missing: 0,
    }
    expect(qc.isNodeTypeReport(nodeTypeReport)).toEqual(true)
  })
  test("isNodeTypeReport empty", () => {
    const nodeTypeReport = {}
    expect(qc.isNodeTypeReport(nodeTypeReport)).toEqual(false)
  })
})

describe("toNodeTypeReport tests ", () => {
  test("toNodeTypeReport required fields", () => {
    const nodeTypeReport = {
      categories: [],
      name: "",
      total_number: 0,
      taxon: [],
      missing: 0,
    }
    expect(qc.toNodeTypeReport(nodeTypeReport)).toEqual({
      missing: 0,
      taxon: [],
      categories: [],
      name: "",
      namespaces: [],
      total_number: 0,
    })
  })
  test("toNodeTypeReport empty", () => {
    const nodeTypeReport = {}
    expect(qc.toNodeTypeReport(nodeTypeReport as unknown as qc.NodeTypeReport)).toEqual({
      missing: 0,
      taxon: [],
      categories: [],
      name: "",
      namespaces: [],
      total_number: 0,
    })
  })
})

describe("isPredicateReport tests ", () => {
  test("isPredicateReport required fields", () => {
    const predicateReport: qc.PredicateReport = {
      total_number: 0,
      uri: "",
    }
    expect(qc.isPredicateReport(predicateReport)).toEqual(true)
  })
  test("isPredicateReport empty", () => {
    const predicateReport = {}
    expect(qc.isPredicateReport(predicateReport)).toEqual(false)
  })
})

describe("toPredicateReport tests ", () => {
  test("toPredicateReport required fields", () => {
    const predicateReport = {
      total_number: 0,
      uri: "",
    }
    expect(qc.toPredicateReport(predicateReport)).toEqual({
      missing_object_namespaces: [],
      missing_objects: 0,
      missing_subject_namespaces: [],
      missing_subjects: 0,
      total_number: 0,
      uri: "",
    })
  })
  test("toPredicateReport empty", () => {
    const predicateReport = {}
    expect(qc.toPredicateReport(predicateReport as unknown as qc.PredicateReport)).toEqual({
      missing_object_namespaces: [],
      missing_objects: 0,
      missing_subject_namespaces: [],
      missing_subjects: 0,
      total_number: 0,
      uri: "",
    })
  })
})
