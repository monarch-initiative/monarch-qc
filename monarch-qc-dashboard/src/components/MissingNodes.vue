<!--
  This component displays examples of missing nodes from a particular ingest
  It uses duckdb-wasm to query the parquet file
-->
<template>
  <div class="missing-nodes-container">
    <div class="header-section">
      <a :href="`#monarch?dataset=${props.dataSet || ''}&kgVersion=${props.kgVersion || ''}`" class="back-link">&larr; Back to Dashboard</a>
      <h2>Missing Nodes from {{ props.dataSet || 'Unknown' }}/{{ props.kgVersion || 'latest' }}</h2>
    </div>
    <div class="controls">
      <label for="ingestSelect">Select Ingest: </label>
      <select id="ingestSelect" v-model="selectedIngest" @change="loadMissingNodes">
        <option v-for="ingest in ingestOptions" :key="ingest" :value="ingest">
          {{ ingest }}
        </option>
      </select>
      <div v-if="loading" class="loading">Loading...</div>
    </div>

    <div class="table-container" v-if="missingNodes.length > 0">
      <table>
        <thead>
          <tr>
            <th>Missing Node</th>
            <th>Ingest</th>
            <th>Primary Knowledge Source</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(node, index) in missingNodes" :key="index">            
            <td>{{ node.missing_node }}</td>
            <td>{{ node.edge_ingest }}</td>
            <td>{{ node.edge_primary_knowledge_source }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="!loading && selectedIngest" class="no-results">
      No missing nodes found for this ingest.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { loadMissingNodesData } from '../data';

const props = defineProps<{
  initialIngest?: string,
  dataSet?: string,
  kgVersion?: string
}>();

const missingNodes = ref<Array<{ missing_node: string; edge_ingest: string; edge_primary_knowledge_source: string }>>([]);
const ingestOptions = ref<Array<string>>([]);
const selectedIngest = ref<string>('');
const loading = ref<boolean>(false);

onMounted(async () => {
  loading.value = true;
  try {
    // Fetch all available ingest options, using the dataSet and kgVersion props if provided
    const result = await loadMissingNodesData(null, props.dataSet, props.kgVersion);
    ingestOptions.value = result as string[];
    
    // Use initialIngest prop if provided, otherwise use the first ingest in the list
    if (props.initialIngest && ingestOptions.value.includes(props.initialIngest)) {
      selectedIngest.value = props.initialIngest;
    } else if (ingestOptions.value.length > 0) {
      selectedIngest.value = ingestOptions.value[0];
    }
    
    if (selectedIngest.value) {
      await loadMissingNodes();
    }
  } catch (error) {
    console.error('Failed to load ingest options:', error);
  } finally {
    loading.value = false;
  }
});

async function loadMissingNodes() {
  if (!selectedIngest.value) return;
  
  loading.value = true;
  missingNodes.value = [];
  
  try {
    const result = await loadMissingNodesData(selectedIngest.value, props.dataSet, props.kgVersion);
    // Create a new array with plain objects instead of using proxy objects directly
    missingNodes.value = (result as Array<{ missing_node: string; edge_ingest: string, edge_primary_knowledge_source: string }>)
      .map(item => ({ 
        missing_node: String(item.missing_node), 
        edge_ingest: String(item.edge_ingest),
        edge_primary_knowledge_source: String(item.edge_primary_knowledge_source)
      }));
  } catch (error) {
    console.error('Failed to load missing nodes:', error);
  } finally {
    loading.value = false;
  }
}
</script>

<style>
.missing-nodes-container {
  margin: 20px;
}

.header-section {
  margin-bottom: 20px;
}

.back-link {
  display: inline-block;
  color: #0066cc;
  text-decoration: none;
  margin-bottom: 10px;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-container {
  max-height: 600px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
}

.loading {
  margin-left: 15px;
  color: #666;
}

.no-results {
  margin-top: 20px;
  color: #666;
  font-style: italic;
}
</style>