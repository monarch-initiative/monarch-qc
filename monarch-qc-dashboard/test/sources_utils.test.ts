import { describe, it, expect } from "vitest"
import {
  flattenSources,
  flattenByIngest,
  compareSources,
  Release,
  SourceRow,
} from "../src/sources_utils"

const sample: Release = {
  id: "monarch-kg",
  version: "2026-05-03",
  sources: [
    {
      id: "alliance-ingest",
      version: "8.3.0",
      build_version: "alliance-ingest_8.3.0_abc_4.3.9",
      sources: [
        {
          id: "infores:agr",
          name: "Alliance of Genome Resources",
          version: "8.3.0",
          version_method: "alliance_fms_api",
          urls: ["https://fms.alliancegenome.org/x"],
        },
      ],
    },
    {
      id: "hgnc-ingest",
      version: "2026-05-01",
      sources: [
        {
          id: "infores:agr",
          name: "Alliance of Genome Resources",
          version: "8.3.0",
          version_method: "alliance_fms_api",
        },
      ],
    },
    {
      id: "pantherdb-orthologs-ingest",
      version: "2026-04-01",
      sources: [
        {
          id: "infores:ncbi-gene",
          name: "NCBI Gene",
          version: "2026-05-01",
          version_method: "http_last_modified",
        },
      ],
    },
    {
      id: "ncbi-gene",
      version: "2026-05-02",
      sources: [
        {
          id: "infores:ncbi-gene",
          name: "NCBI Gene",
          version: "2026-05-02",
          version_method: "http_last_modified",
        },
      ],
    },
  ],
}

describe("flattenSources", () => {
  it("emits one row per (infores, version) tuple", () => {
    const rows = flattenSources(sample)
    expect(rows.map((r) => `${r.infores}|${r.version}`)).toEqual([
      "infores:agr|8.3.0",
      "infores:ncbi-gene|2026-05-01",
      "infores:ncbi-gene|2026-05-02",
    ])
  })

  it("groups ingests at the same (infores, version) under consumed_by", () => {
    const rows = flattenSources(sample)
    const agr = rows.find((r) => r.infores === "infores:agr")!
    expect(agr.consumed_by.sort()).toEqual(["alliance-ingest", "hgnc-ingest"])
  })

  it("emits separate rows when ingests captured different versions of the same source", () => {
    const rows = flattenSources(sample)
    const ncbiRows = rows.filter((r) => r.infores === "infores:ncbi-gene")
    expect(ncbiRows).toHaveLength(2)
    const v1 = ncbiRows.find((r) => r.version === "2026-05-01")!
    const v2 = ncbiRows.find((r) => r.version === "2026-05-02")!
    expect(v1.consumed_by).toEqual(["pantherdb-orthologs-ingest"])
    expect(v2.consumed_by).toEqual(["ncbi-gene"])
  })

  it("returns empty for null/undefined input", () => {
    expect(flattenSources(null)).toEqual([])
    expect(flattenSources(undefined)).toEqual([])
  })

  it("returns empty for legacy-shape receipts (no recursive sources, no id)", () => {
    const legacy = {
      "kg-version": "2026-04-01",
      packages: { biolink: "4.3.9", koza: "2.3.0" },
      data: { phenio: "v2026-04-14", alliance: "8.3.0" },
    } as unknown as Release
    expect(flattenSources(legacy)).toEqual([])
  })
})

const row = (overrides: Partial<SourceRow>): SourceRow => ({
  infores: "infores:x",
  name: "X",
  version: "1",
  version_method: "url_path",
  retrieved_at: "",
  urls: [],
  consumed_by: ["x-ingest"],
  ...overrides,
})

describe("compareSources", () => {
  it("flags new (infores, version) tuples as added", () => {
    const cur = [row({ infores: "infores:hgnc", version: "2026-05-01" })]
    const prev = [row({ infores: "infores:hgnc", version: "2026-04-01" })]
    const rows = compareSources(cur, prev)
    expect(rows.find((r) => r.version === "2026-05-01")?.status).toBe("added")
    expect(rows.find((r) => r.version === "2026-04-01")?.status).toBe("removed")
  })

  it("clusters added+removed rows for the same infores adjacently", () => {
    const cur = [row({ infores: "infores:hgnc", version: "2026-05-01" })]
    const prev = [row({ infores: "infores:hgnc", version: "2026-04-01" })]
    const rows = compareSources(cur, prev)
    expect(rows.map((r) => r.version)).toEqual(["2026-04-01", "2026-05-01"])
  })

  it("marks unchanged when the (infores, version) pair is in both", () => {
    const cur = [row({ infores: "infores:hgnc", version: "2026-05-01" })]
    const prev = [row({ infores: "infores:hgnc", version: "2026-05-01" })]
    expect(compareSources(cur, prev)[0].status).toBe("unchanged")
  })

  it("returns rows as unchanged when no previous is provided", () => {
    const cur = [row({ infores: "infores:hgnc", version: "2026-05-01" })]
    expect(compareSources(cur, null).every((r) => r.status === "unchanged")).toBe(true)
  })
})

describe("flattenByIngest", () => {
  it("emits one row per (ingest, leaf) tuple, sorted ingest then infores", () => {
    const rows = flattenByIngest(sample)
    expect(rows.map((r) => `${r.ingest}|${r.infores}|${r.version}`)).toEqual([
      "alliance-ingest|infores:agr|8.3.0",
      "hgnc-ingest|infores:agr|8.3.0",
      "ncbi-gene|infores:ncbi-gene|2026-05-02",
      "pantherdb-orthologs-ingest|infores:ncbi-gene|2026-05-01",
    ])
  })

  it("carries the ingest's own build metadata onto each row", () => {
    const rows = flattenByIngest(sample)
    const alliance = rows.find((r) => r.ingest === "alliance-ingest")!
    expect(alliance.ingest_version).toBe("8.3.0")
    expect(alliance.build_version).toBe("alliance-ingest_8.3.0_abc_4.3.9")
  })

  it("returns empty for legacy / null receipts", () => {
    expect(flattenByIngest(null)).toEqual([])
    expect(flattenByIngest(undefined)).toEqual([])
    const legacy = { "kg-version": "x", packages: {} } as unknown as Release
    expect(flattenByIngest(legacy)).toEqual([])
  })
})
