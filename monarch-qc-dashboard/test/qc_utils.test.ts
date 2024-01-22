import { describe, expect, test } from "vitest"
import * as qc from "../src/schema/monarch_kg_qc_schema"
import * as qc_utils from "../src/qc_utils"

describe("isEdgeStatPart tests", () => {
  test("isEdgeStatPart string", () => {
    expect(qc_utils.isEdgeStatPart("")).toEqual(false)
  })
  test("isEdgeStatPart empty", () => {
    expect(qc_utils.isEdgeStatPart({})).toEqual(false)
  })
  test("isEdgeStatPart with values", () => {
    expect(qc_utils.isEdgeStatPart({ a: 1 })).toEqual(false)
  })
  test("isEdgeStatPart with single value", () => {
    expect(
      qc_utils.isEdgeStatPart({
        count_by_predicates: {},
        count_by_spo: {},
      })
    ).toEqual(true)
  })
  test("isEdgeStatPart with extra values", () => {
    expect(
      qc_utils.isEdgeStatPart({
        count_by_predicates: {},
        count_by_spo: {},
        extra: "a",
      })
    ).toEqual(true)
  })
})

describe("isNodeStatPart tests", () => {
  test("isNodeStatPart string", () => {
    expect(qc_utils.isNodeStatPart("")).toEqual(false)
  })
  test("isNodeStatPart empty", () => {
    expect(qc_utils.isNodeStatPart({})).toEqual(false)
  })
  test("isNodeStatPart with values", () => {
    expect(qc_utils.isNodeStatPart({ a: 1 })).toEqual(false)
  })
  test("isNodeStatPart with single value", () => {
    expect(
      qc_utils.isNodeStatPart({
        count_by_category: {},
      })
    ).toEqual(true)
  })
  test("isNodeStatPart with extra values", () => {
    expect(
      qc_utils.isNodeStatPart({
        count_by_category: {},
        extra: "a",
      })
    ).toEqual(true)
  })
})

describe("toStatReport tests", () => {
  const emptyStatReport = {
    edge_stats: {},
    graph_name: "",
    node_stats: {},
  }

  const valuesStatReport = {
    edge_stats: { count_by_predicates: 0, count_by_spo: 0 },
    graph_name: "b",
    node_stats: { count_by_category: 0 },
  }

  test("toStatReport empty", () => {
    expect(qc_utils.toStatReport()).toEqual(emptyStatReport)
  })
  test("toStatReport with values", () => {
    expect(qc_utils.toStatReport(valuesStatReport)).toEqual(valuesStatReport)
  })
  test("toStatReport with single value", () => {
    const singleStatReport = <qc_utils.StatReport>emptyStatReport
    singleStatReport.edge_stats = {
      count_by_predicates: { predicate: { count: 0, provided_by: {} } },
      count_by_spo: { spo: { count: 0, provided_by: {} } },
    }
    expect(
      qc_utils.toStatReport({
        edge_stats: {
          count_by_predicates: { predicate: { count: 0, provided_by: {} } },
          count_by_spo: { spo: { count: 0, provided_by: {} } },
        },
      })
    ).toEqual(singleStatReport)
  })
  test("toStatReport with extra values", () => {
    const extraStatReport = structuredClone(valuesStatReport)
    // use explicit any to add extra property for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(extraStatReport as any).extra = "d"
    expect(qc_utils.toStatReport(extraStatReport)).toEqual(valuesStatReport)
  })
})

describe("isStatReport tests", () => {
  test("isStatReport empty", () => {
    expect(qc_utils.isStatReport({})).toEqual(false)
  })
  test("isStatReport with values", () => {
    expect(qc_utils.isStatReport({ a: 1 })).toEqual(false)
  })
  test("isStatReport with single value", () => {
    expect(qc_utils.isStatReport({ edge_stats: 1, graph_name: 0, node_stats: 1 })).toEqual(true)
  })
  test("isStatReport with extra values", () => {
    expect(
      qc_utils.isStatReport({ edge_stats: 1, graph_name: 0, node_stats: 1, extra: "a" })
    ).toEqual(true)
  })
})

describe("getNamespaces tests", () => {
  test("getNamespaces undefined", () => {
    expect(qc_utils.getNamespaces(undefined)).toEqual([])
  })
  test("getNamespaces empty QCPart", () => {
    const qcpart = {} as qc.SubReport
    expect(qc_utils.getNamespaces([qcpart])).toEqual([])
  })
  test("getNamespaces single QCPart", () => {
    const qcpart = { namespaces: ["a"] } as qc.SubReport
    expect(qc_utils.getNamespaces([qcpart])).toEqual(["a"])
  })
  test("getNamespaces multiple QCPart", () => {
    const qcpart = { namespaces: ["a", "b"] } as qc.SubReport
    expect(qc_utils.getNamespaces([qcpart])).toEqual(["a", "b"])
  })
  test("getNamespaces multiple QCPart with differences", () => {
    const qcpart1 = { namespaces: ["a", "b"] } as qc.SubReport
    const qcpart2 = { namespaces: ["c", "d"] } as qc.SubReport
    expect(qc_utils.getNamespaces([qcpart1, qcpart2])).toEqual(["a", "b", "c", "d"])
  })
  test("getNamespaces multiple QCPart with differences out of order", () => {
    const qcpart1 = { namespaces: ["a", "b"] } as qc.SubReport
    const qcpart2 = { namespaces: ["d", "c"] } as qc.SubReport
    expect(qc_utils.getNamespaces([qcpart1, qcpart2])).toEqual(["a", "b", "d", "c"])
  })
  test("getNamespaces multiple QCPart with duplicates", () => {
    const qcpart = { namespaces: ["a", "b"] } as qc.SubReport
    expect(qc_utils.getNamespaces([qcpart, qcpart])).toEqual(["a", "b", "a", "b"])
  })
  test("getNamespaces multiple QCPart with duplicates out of order", () => {
    const qcpart1 = { namespaces: ["a", "b"] } as qc.SubReport
    const qcpart2 = qc.toSubReport({ namespaces: ["b", "a"] } as qc.SubReport)
    expect(qc_utils.getNamespaces([qcpart1, qcpart2])).toEqual(["a", "b", "b", "a"])
  })
  test("getNamespaces mulitple QCPart with some undefined namespaces", () => {
    const qcpart1 = { namespaces: ["a", "b"] } as qc.SubReport
    const qcpart2 = {} as qc.SubReport
    expect(qc_utils.getNamespaces([qcpart1, qcpart2])).toEqual(["a", "b"])
  })
  test("getNamespaces QCPart with null and undefined namespaces", () => {
    const qcpart1 = { namespaces: null } as unknown as qc.SubReport
    const qcpart2 = { namespaces: undefined } as unknown as qc.SubReport
    expect(qc_utils.getNamespaces([qcpart1, qcpart2])).toEqual([])
  })
})

describe("stringSetDiff tests", () => {
  test("stringSetDiff empty sets", () => {
    expect(qc_utils.stringSetDiff([], [])).toEqual([])
  })

  test("stringSetDiff empty set and non-empty set", () => {
    expect(qc_utils.stringSetDiff(["a"], [])).toEqual(["a"])
  })

  test("stringSetDiff non-empty set and empty set", () => {
    expect(qc_utils.stringSetDiff([], ["a"])).toEqual([])
  })

  test("stringSetDiff equal sets", () => {
    expect(qc_utils.stringSetDiff(["a"], ["a"])).toEqual([])
  })

  test("stringSetDiff equal sets out of order", () => {
    expect(qc_utils.stringSetDiff(["a", "b"], ["b", "a"])).toEqual([])
  })

  test("stringSetDiff non-equal sets", () => {
    expect(qc_utils.stringSetDiff(["a"], ["b"])).toEqual(["a"])
  })

  test("stringSetDiff non-equal sets out of order", () => {
    expect(qc_utils.stringSetDiff(["a", "b"], ["b", "c"])).toEqual(["a"])
  })
})

describe("uniq tests", () => {
  test("uniq empty array", () => {
    expect(qc_utils.uniq([])).toEqual([])
  })

  test("uniq remove duplicate", () => {
    expect(qc_utils.uniq(["a", "a"])).toEqual(["a"])
  })

  test("uniq remove duplicate non-consecutive", () => {
    expect(qc_utils.uniq(["a", "b", "a"])).toEqual(["a", "b"])
  })

  test("uniq remove duplicate out of order", () => {
    expect(qc_utils.uniq(["b", "a", "a"])).toEqual(["b", "a"])
  })
  test("uniq remove multiple duplicates out of order", () => {
    expect(qc_utils.uniq(["b", "a", "a", "c", "b"])).toEqual(["b", "a", "c"])
  })
})

describe("zipMap tests", () => {
  test("zipMap empty arrays", () => {
    expect(qc_utils.zipMap([], [])).toEqual(new Map<string, object>())
  })
  test("zipMap single value arrays", () => {
    expect(qc_utils.zipMap(["a"], [{ a: 1 }])).toEqual(new Map([["a", { a: 1 }]]))
  })
  test("zipMap multiple value arrays", () => {
    expect(qc_utils.zipMap(["a", "b"], [{ a: 1 }, { b: 2 }])).toEqual(
      new Map([
        ["a", { a: 1 }],
        ["b", { b: 2 }],
      ])
    )
  })
  test("zipMap values longer than keys", () => {
    expect(() => qc_utils.zipMap(["a"], [{ a: 1 }, { b: 2 }])).toThrow(
      new RangeError("Keys and Values must be of equal length.")
    )
  })
  test("zipMap keys longer than values", () => {
    expect(() => qc_utils.zipMap(["a", "b"], [{ a: 1 }])).toThrow(
      new RangeError("Keys and Values must be of equal length.")
    )
  })
})
