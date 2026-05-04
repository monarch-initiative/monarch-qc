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
  flattenSources,
  flattenByIngest,
  compareSources,
  ComparedRow,
  IngestSourceRow,
} from "../sources_utils"

const current = ref<Release | null>(null)
const previous = ref<Release | null>(null)
const loading = ref(false)
const view = ref<"source" | "ingest">("source")

const currentVersion = computed(() => current.value?.version ?? "")
const compareVersion = computed(() => previous.value?.version ?? "")

const receiptDisagreements = computed(() => current.value?.disagreements ?? [])
const receiptDrift = computed(() => current.value?.version_drift ?? [])
const previousIsLegacy = computed(
  () => previous.value !== null && !(previous.value.sources && previous.value.sources.length)
)

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

function groupBy<T extends object>(
  rows: T[],
  key: (r: T) => string
): (T & { groupStart: boolean; groupSize: number })[] {
  const out: (T & { groupStart: boolean; groupSize: number })[] = []
  let lastKey: string | null = null
  let startIdx = -1
  for (const row of rows) {
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

async function refresh() {
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
    current.value = cur
    previous.value = prev
  } finally {
    loading.value = false
  }
}

watch([selectedReport, selectedCompare, globalMetadata], refresh, { immediate: true })
</script>

<style scoped>
.sources-page { padding: 1rem; }
.subtitle { color: #666; margin-top: 0; }
.view-toggle { margin: 1rem 0; }
.view-toggle button {
  border: 1px solid #ccc; background: #fff; padding: 0.4rem 0.9rem; cursor: pointer;
  border-radius: 0;
}
.view-toggle button:first-child { border-top-left-radius: 4px; border-bottom-left-radius: 4px; }
.view-toggle button:last-child { border-top-right-radius: 4px; border-bottom-right-radius: 4px; border-left: none; }
.view-toggle button.active { background: #2c3e50; color: #fff; border-color: #2c3e50; }

.alerts { margin: 1rem 0; }
.alert { padding: 0.5rem 0.75rem; border-radius: 4px; margin-bottom: 0.5rem; }
.alert.disagreement { background: #fde8e8; border: 1px solid #f5a3a3; }
.alert.drift { background: #fff7e8; border: 1px solid #f0d089; }
.alert summary { cursor: pointer; }
.badge { display: inline-block; margin-left: 0.5em; font-size: 0.9em; }

table { border-collapse: collapse; width: 100%; font-size: 0.95em; }
th, td { text-align: left; padding: 0.4rem 0.6rem; border-bottom: 1px solid #ddd; vertical-align: top; }
th { background: #f5f5f5; }
td.version { white-space: nowrap; }
/* Strong divider at the top of each group so repeated rows feel attached. */
tr.group-start > td { border-top: 2px solid #cfd6dd; }
tr:not(.group-start) > td { border-bottom: 1px solid #eee; }
tr.added { background: #e8f5e9; }
tr.removed { background: #ffebee; opacity: 0.75; }
.muted { color: #999; }
.empty, .loading { padding: 1rem; color: #666; }
.legacy-note { padding: 0.5rem 0.75rem; margin-bottom: 0.75rem; background: #eef4ff; border: 1px solid #b9cdf0; border-radius: 4px; font-size: 0.95em; }
</style>
