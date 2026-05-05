<!--
  Renders the upstream-source view of the build receipt (metadata.yaml,
  kozahub-metadata-schema). Two views:
  - "by source": one row per (infores, version), grouped visually by infores.
  - "by ingest": one row per (ingest, infores, version), grouped by ingest.
  Plus the receipt's disagreements/version-drift warnings at the top.
-->
<template>
  <div class="sources-page">
    <h1>Source Versions</h1>
    <p class="subtitle">
      Upstream sources consumed by monarch-kg
      <span v-if="currentVersion"> — release <strong>{{ currentVersion }}</strong></span>
      <span v-if="compareVersion"> compared to <strong>{{ compareVersion }}</strong></span>
    </p>

    <div v-if="!current && !loading" class="empty">
      No <code>metadata.yaml</code> available for the selected release.
    </div>
    <div v-if="loading" class="loading">Loading…</div>
    <div v-if="previous && previousIsLegacy" class="legacy-note">
      The compare release predates the recursive build-receipt format —
      previous-version columns will be blank.
    </div>

    <div v-if="current" class="view-toggle">
      <button :class="{ active: view === 'source' }" @click="view = 'source'">By source</button>
      <button :class="{ active: view === 'ingest' }" @click="view = 'ingest'">By ingest</button>
    </div>

    <section v-if="receiptDisagreements.length || receiptDrift.length" class="alerts">
      <details v-if="receiptDisagreements.length" open class="alert disagreement">
        <summary>
          <strong>{{ receiptDisagreements.length }}</strong> tagged-version disagreement(s)
          across ingests
        </summary>
        <ul>
          <li v-for="d in receiptDisagreements" :key="d.id">
            <code>{{ d.id }}</code>:
            <span v-for="(v, ingest) in d.by_ingest" :key="ingest" class="badge">
              {{ ingest }}=<code>{{ v }}</code>
            </span>
          </li>
        </ul>
      </details>
      <details v-if="receiptDrift.length" class="alert drift">
        <summary>
          <strong>{{ receiptDrift.length }}</strong> rolling-source drift (informational)
        </summary>
        <ul>
          <li v-for="d in receiptDrift" :key="d.id">
            <code>{{ d.id }}</code>:
            <span v-for="(v, ingest) in d.by_ingest" :key="ingest" class="badge">
              {{ ingest }}=<code>{{ v }}</code>
            </span>
          </li>
        </ul>
      </details>
    </section>

    <table v-if="view === 'source' && bySourceGrouped.length">
      <thead>
        <tr>
          <th>Source</th>
          <th>Name</th>
          <th>Version</th>
          <th>Δ</th>
          <th>Method</th>
          <th>Retrieved</th>
          <th>Consumed by</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in bySourceGrouped"
          :key="`${row.infores}|${row.version}|${row.status}`"
          :class="{ added: row.status === 'added', removed: row.status === 'removed', 'group-start': row.groupStart }"
        >
          <td v-if="row.groupStart" :rowspan="row.groupSize"><code>{{ row.infores }}</code></td>
          <td v-if="row.groupStart" :rowspan="row.groupSize">{{ row.name }}</td>
          <td class="version"><code>{{ row.version }}</code></td>
          <td>
            <span v-if="row.status === 'added'">+</span>
            <span v-else-if="row.status === 'removed'">−</span>
          </td>
          <td>{{ row.version_method }}</td>
          <td>{{ row.retrieved_at }}</td>
          <td>{{ row.consumed_by.join(", ") }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="view === 'ingest' && current && !byIngestGrouped.length" class="empty">
      Receipt has no per-ingest builds with upstream sources.
    </div>

    <table v-if="view === 'ingest' && byIngestGrouped.length">
      <thead>
        <tr>
          <th>Ingest</th>
          <th>Ingest version</th>
          <th>Transform</th>
          <th>Biolink</th>
          <th>Source</th>
          <th>Name</th>
          <th>Version</th>
          <th>Method</th>
          <th>Retrieved</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in byIngestGrouped"
          :key="`${row.ingest}|${row.infores}|${row.version}`"
          :class="{ 'group-start': row.groupStart }"
        >
          <td v-if="row.groupStart" :rowspan="row.groupSize"><code>{{ row.ingest }}</code></td>
          <td v-if="row.groupStart" :rowspan="row.groupSize" class="version"><code>{{ row.ingest_version }}</code></td>
          <td v-if="row.groupStart" :rowspan="row.groupSize"><code>{{ row.transform_version }}</code></td>
          <td v-if="row.groupStart" :rowspan="row.groupSize"><code>{{ row.biolink_version }}</code></td>
          <td><code>{{ row.infores }}</code></td>
          <td>{{ row.name }}</td>
          <td class="version"><code>{{ row.version }}</code></td>
          <td>{{ row.version_method }}</td>
          <td>{{ row.retrieved_at }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import YAML from "yaml"
import { globalMetadata, selectedReport, selectedCompare } from "../data"
import {
  Release,
  Disagreement,
  flattenSources,
  flattenByIngest,
  compareSources,
  groupBy,
  ComparedRow,
  IngestSourceRow,
} from "../sources_utils"

const current = ref<Release | null>(null)
const previous = ref<Release | null>(null)
const loading = ref(false)
const view = ref<"source" | "ingest">("source")

const currentVersion = computed(() => current.value?.version ?? "")
const compareVersion = computed(() => previous.value?.version ?? "")

function sortByIngest(d: Disagreement): Disagreement {
  return { ...d, by_ingest: Object.fromEntries(Object.entries(d.by_ingest).sort(([a], [b]) => a.localeCompare(b))) }
}

const receiptDisagreements = computed(
  () => (current.value?.disagreements ?? []).map(sortByIngest)
)
const receiptDrift = computed(
  () => (current.value?.version_drift ?? []).map(sortByIngest)
)
// A new-format receipt always has a top-level `id`; legacy receipts don't.
const previousIsLegacy = computed(() => previous.value !== null && !previous.value.id)

interface BySourceGroupedRow extends ComparedRow {
  groupStart: boolean
  groupSize: number
}

const bySourceGrouped = computed<BySourceGroupedRow[]>(() => {
  if (!current.value) return []
  const cur = flattenSources(current.value)
  const prev = previous.value ? flattenSources(previous.value) : null
  const rows = compareSources(cur, prev)
  return groupBy(rows, (r) => r.infores)
})

interface ByIngestGroupedRow extends IngestSourceRow {
  groupStart: boolean
  groupSize: number
}

const byIngestGrouped = computed<ByIngestGroupedRow[]>(() => {
  if (!current.value) return []
  const rows = flattenByIngest(current.value)
  return groupBy(rows, (r) => r.ingest)
})

async function loadReceipt(name: string): Promise<Release | null> {
  const promise = globalMetadata.value.get(name)
  if (!promise) return null
  try {
    const text = await promise
    return YAML.parse(text) as Release
  } catch (err) {
    console.error("Failed to load metadata.yaml for", name, err)
    return null
  }
}

// Token-based race protection: rapid changes to selectedReport / selectedCompare
// can fire overlapping refreshes; only the most recent one is allowed to commit.
let refreshToken = 0
async function refresh() {
  const my = ++refreshToken
  if (!selectedReport.value) {
    current.value = null
    previous.value = null
    return
  }
  loading.value = true
  try {
    const [cur, prev] = await Promise.all([
      loadReceipt(selectedReport.value),
      selectedCompare.value ? loadReceipt(selectedCompare.value) : Promise.resolve(null),
    ])
    if (my !== refreshToken) return
    current.value = cur
    previous.value = prev
  } finally {
    if (my === refreshToken) loading.value = false
  }
}

watch([selectedReport, selectedCompare, globalMetadata], refresh, { immediate: true })
</script>

<style scoped>
/* Status / alert tints use semitransparent overlays so they read on either
   the light or dark global background (default is dark; @media light in
   style.css flips it). */
.sources-page { padding: 1rem; }
.subtitle { opacity: 0.7; margin-top: 0; }

.view-toggle { margin: 1rem 0; }
.view-toggle button {
  border: 1px solid currentColor;
  opacity: 0.6;
  background: transparent;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  border-radius: 0;
}
.view-toggle button:first-child { border-top-left-radius: 4px; border-bottom-left-radius: 4px; }
.view-toggle button:last-child { border-top-right-radius: 4px; border-bottom-right-radius: 4px; border-left: none; }
.view-toggle button.active { opacity: 1; background: rgba(127, 127, 127, 0.2); }

.alerts { margin: 1rem 0; }
.alert {
  padding: 0.5rem 0.75rem; border-radius: 4px; margin-bottom: 0.5rem;
  border: 1px solid currentColor;
}
.alert.disagreement { background: rgba(220, 80, 80, 0.18); }
.alert.drift { background: rgba(220, 160, 60, 0.18); }
.alert summary { cursor: pointer; }
.badge { display: inline-block; margin-left: 0.5em; font-size: 0.9em; }

table { border-collapse: collapse; width: 100%; font-size: 0.95em; }
th, td {
  text-align: left; padding: 0.4rem 0.6rem;
  border-bottom: 1px solid rgba(127, 127, 127, 0.25);
  vertical-align: top;
}
th { background: rgba(127, 127, 127, 0.15); }
td.version { white-space: nowrap; }
/* Strong divider at the top of each group so repeated rows feel attached. */
tr.group-start > td { border-top: 2px solid rgba(127, 127, 127, 0.45); }
tr:not(.group-start) > td { border-bottom: 1px solid rgba(127, 127, 127, 0.12); }
/* Status: tint background and (for removed) strike through the version cell —
   stronger accessibility than reduced opacity. */
tr.added { background: rgba(80, 180, 100, 0.18); }
tr.removed { background: rgba(220, 80, 80, 0.18); }
tr.removed td.version code { text-decoration: line-through; }

.muted { opacity: 0.5; }
.empty, .loading { padding: 1rem; opacity: 0.7; }
.legacy-note {
  padding: 0.5rem 0.75rem; margin-bottom: 0.75rem;
  background: rgba(80, 130, 220, 0.18);
  border: 1px solid currentColor;
  border-radius: 4px; font-size: 0.95em;
}
</style>
