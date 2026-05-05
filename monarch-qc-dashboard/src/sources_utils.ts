/**
 * Utilities for parsing the recursive `Release` shape published in
 * `metadata.yaml` (kozahub-metadata-schema) and flattening it into
 * leaf-source rows for display.
 *
 * The receipt nests per-ingest builds underneath the top-level KG build,
 * with each ingest carrying its own upstream `sources`. We treat any node
 * with no nested `sources` as a leaf — i.e. an upstream `infores:*` data
 * source consumed by one or more ingests.
 */

export interface Release {
  id: string
  name?: string
  version?: string
  version_method?: string
  retrieved_at?: string
  urls?: string[]
  build_version?: string
  generated_at?: string
  transform_version?: string
  biolink_version?: string
  sources?: Release[]
  artifacts?: { path: string; sha256?: string }[]
  tools?: Record<string, string>
  packages?: Record<string, string>
  disagreements?: Disagreement[]
  version_drift?: Disagreement[]
}

export interface Disagreement {
  id: string
  versions_observed: string[]
  by_ingest: Record<string, string>
}

/**
 * One row per (infores, version) tuple. When several ingests captured the
 * same source at the same version, they're grouped here under `consumed_by`.
 * When ingests captured different versions, they emit separate rows that
 * sort adjacently — so a disagreement appears visually as two rows for the
 * same infores rather than a single row with a stacked cell.
 */
export interface SourceRow {
  infores: string
  name: string
  version: string
  version_method: string
  retrieved_at: string
  urls: string[]
  consumed_by: string[]
}

/**
 * Walk the Release tree. For each leaf source (no nested `sources`), emit
 * one merged row keyed by `infores`, recording every contributing ingest.
 * If different ingests captured different versions of the same source, the
 * row's `version` is `"DISAGREE"` — the underlying conflict is also reported
 * via the receipt's top-level `disagreements`/`version_drift`.
 */
export function flattenSources(receipt: Release | null | undefined): SourceRow[] {
  if (!receipt) return []
  const byPair = new Map<string, SourceRow>()

  function visit(node: Release, ancestorIngest: string | null) {
    const childSources = node.sources ?? []
    const isBuild = childSources.length > 0
    // The closest non-leaf ancestor is the contributing ingest.
    const ingestForChildren = isBuild ? node.id : ancestorIngest
    if (!isBuild) {
      // Legacy receipts (`kg-version`/`packages`/`data:` shape) have no `id`
      // and no nested sources — skip rather than emit an undefined-keyed row.
      if (!node.id) return
      const ver = node.version ?? ""
      const key = `${node.id}|${ver}`
      const existing = byPair.get(key)
      if (existing) {
        if (ancestorIngest && !existing.consumed_by.includes(ancestorIngest)) {
          existing.consumed_by.push(ancestorIngest)
        }
      } else {
        byPair.set(key, {
          infores: node.id,
          name: node.name ?? "",
          version: ver,
          version_method: node.version_method ?? "",
          retrieved_at: node.retrieved_at ?? "",
          urls: node.urls ?? [],
          consumed_by: ancestorIngest ? [ancestorIngest] : [],
        })
      }
      return
    }
    for (const child of childSources) visit(child, ingestForChildren)
  }

  visit(receipt, null)
  return [...byPair.values()].sort(
    (a, b) =>
      (a.infores ?? "").localeCompare(b.infores ?? "") ||
      (a.version ?? "").localeCompare(b.version ?? "")
  )
}

/** One row per (ingest, infores, version) — the by-ingest view. */
export interface IngestSourceRow {
  ingest: string
  ingest_version: string
  transform_version: string
  biolink_version: string
  build_version: string
  generated_at: string
  infores: string
  name: string
  version: string
  version_method: string
  retrieved_at: string
  urls: string[]
}

/**
 * Flatten the receipt to per-ingest rows. Each immediate child of the root is
 * a per-ingest build; for each, emit one row per leaf upstream source.
 */
export function flattenByIngest(
  receipt: Release | null | undefined
): IngestSourceRow[] {
  if (!receipt) return []
  const rows: IngestSourceRow[] = []
  for (const build of receipt.sources ?? []) {
    if (!build.id) continue
    const leaves = build.sources ?? []
    if (leaves.length === 0) continue
    for (const leaf of leaves) {
      if (!leaf.id) continue
      rows.push({
        ingest: build.id,
        ingest_version: build.version ?? "",
        transform_version: build.transform_version ?? "",
        biolink_version: build.biolink_version ?? "",
        build_version: build.build_version ?? "",
        generated_at: build.generated_at ?? "",
        infores: leaf.id,
        name: leaf.name ?? "",
        version: leaf.version ?? "",
        version_method: leaf.version_method ?? "",
        retrieved_at: leaf.retrieved_at ?? "",
        urls: leaf.urls ?? [],
      })
    }
  }
  return rows.sort(
    (a, b) =>
      a.ingest.localeCompare(b.ingest) ||
      a.infores.localeCompare(b.infores) ||
      a.version.localeCompare(b.version)
  )
}

/**
 * Merge `current` and `previous` row sets on the (infores, version) pair.
 *
 * A row in current that's also in previous => `unchanged`. A row only in
 * current => `added` (new (infores, version) tuple). A row only in previous
 * => `removed`. When an infores's version bumps, you get one `removed` and
 * one `added` row at consecutive (sorted) positions for that infores.
 */
export interface ComparedRow extends SourceRow {
  status: "added" | "removed" | "unchanged"
}

function pairKey(r: SourceRow): string {
  return `${r.infores}|${r.version}`
}

/**
 * Bucket consecutive rows that share a key. Sorts by `key()` first so the
 * grouping doesn't depend on the caller's order; the resulting first-of-group
 * row carries `groupSize` for use as a `rowspan`.
 */
export function groupBy<T extends object>(
  rows: T[],
  key: (r: T) => string
): (T & { groupStart: boolean; groupSize: number })[] {
  const sorted = [...rows].sort((a, b) => key(a).localeCompare(key(b)))
  const out: (T & { groupStart: boolean; groupSize: number })[] = []
  let lastKey: string | null = null
  let startIdx = -1
  for (const row of sorted) {
    const k = key(row)
    if (k !== lastKey) {
      out.push({ ...row, groupStart: true, groupSize: 1 })
      lastKey = k
      startIdx = out.length - 1
    } else {
      out[startIdx].groupSize++
      out.push({ ...row, groupStart: false, groupSize: 1 })
    }
  }
  return out
}


export function compareSources(
  current: SourceRow[],
  previous: SourceRow[] | null
): ComparedRow[] {
  if (!previous) return current.map((row) => ({ ...row, status: "unchanged" }))

  const prevByPair = new Map<string, SourceRow>()
  for (const r of previous) prevByPair.set(pairKey(r), r)
  const seen = new Set<string>()

  const out: ComparedRow[] = current.map((row) => {
    const key = pairKey(row)
    seen.add(key)
    return { ...row, status: prevByPair.has(key) ? "unchanged" : "added" }
  })

  for (const prev of previous) {
    if (seen.has(pairKey(prev))) continue
    out.push({ ...prev, status: "removed" })
  }

  return out.sort(
    (a, b) =>
      (a.infores ?? "").localeCompare(b.infores ?? "") ||
      (a.version ?? "").localeCompare(b.version ?? "")
  )
}
