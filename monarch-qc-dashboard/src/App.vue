<!--
  entry point for entire app
-->
<template>
  <main>
    <div>
      <button @click="selectSection('monarch')">Monarch-QC</button>
      <button @click="selectSection('sri')">SRI-Reference Comparison</button>
      <button @click="selectSection('missing-nodes'); updateUrlHash('missing-nodes')">Missing Nodes</button>
      <UploadReport />
    </div>
    <div v-if="selectedSection === 'monarch'">
      <div>
        <img src="/src/global/monarch.png" class="logo" alt="Monarch Logo" />
        <SelectReport
          id="selectDataSet"
          label=""
          :reportNames="dataNames"
          v-model="selectedData"
          :onChange="updateData"
        />
      </div>
      <SelectReport
        id="selectCompareReport"
        label="Compare to:"
        :reportNames="compareNames"
        v-model="selectedCompare"
        :onChange="processReports"
        :removeFrom="selectedReport"
      />
      <SelectReport
        id="selectReport"
        label="KG Release:"
        :reportNames="[...globalReports.keys()]"
        v-model="selectedReport"
        :onChange="processReports"
      />
      <h2>Edges Report</h2>
      <SimpleDashboard
        v-if="dashboardDataGroup.edges"
        title="Edges Report"
        label="Ingest"
        :colorCols="['edges']"
        :data="dashboardDataGroup.edges"
        @navigate-to-missing-nodes="navigateToMissingNodesPage"
      />
      <LineChart
        :data="edgesTimeSeriesData"
        :n="5"
        :sortFn="Math.max"
        style="width: 100%"
        :theme="getTheme"
        title="Change in Edges over Time by Ingest"
        yaxisTitle="Edges Count"
      />
      <div class="danging-namespaces">
        Namespaces only in dangling_edges: <br />
        <ul>
          <li v-for="namespace in globalNamespaces" :key="namespace">
            {{ namespace }}
          </li>
        </ul>
      </div>
      <div>
        <h2>Nodes Stat Report</h2>
        <div style="display: inline-block; margin-right: 20px; vertical-align: top">
          <SimpleDashboard
            v-if="dashboardDataGroup.nodes_category"
            title="Nodes Report"
            label="Category"
            :colorCols="['node_stats']"
            :data="dashboardDataGroup.nodes_category"
          />
        </div>
        <div style="display: inline-block; margin-right: 20px; vertical-align: top">
          <SimpleDashboard
            v-if="dashboardDataGroup.nodes_id"
            title="Nodes Report"
            label="ID"
            :colorCols="['node_stats']"
            :data="dashboardDataGroup.nodes_id"
          />
        </div>
      </div>
      <div>
        <h2>Edge Stat Report</h2>
        <div style="display: inline-block; margin-right: 20px; vertical-align: top">
          <SimpleDashboard
            v-if="dashboardDataGroup.edges_predicates"
            title="Edges Report"
            label="Predicate"
            :colorCols="['edge_stats']"
            :data="dashboardDataGroup.edges_predicates"
          />
        </div>
        <div style="display: inline-block; margin-right: 20px; vertical-align: top">
          <SimpleDashboard
            v-if="dashboardDataGroup.edges_spo && false"
            title="Edges Report"
            label="Subject-Predicate-Object"
            :colorCols="['edge_stats']"
            :data="dashboardDataGroup.edges_spo"
          />
        </div>
      </div>
    </div>
    <div v-if="selectedSection === 'sri'">
      <img src="/src/global/monarch.png" class="logo" alt="Monarch Logo" />
      <div v-if="sriCompareData.edges_predicates">
        <h2>Edges Comparison</h2>
        <div style="display: inline-block; margin-right: 20px; vertical-align: top">
          <SimpleDashboard
            title="Nodes Report"
            label="Category"
            :colorCols="['edge_stats']"
            :data="sriCompareData.edges_predicates"
            :field_names="['Monarch V3', 'SRI Reference']"
          />
        </div>
      </div>
      <div v-if="sriCompareData.edges_spo && false">
        <div style="display: inline-block; margin-right: 20px; vertical-align: top">
          <SimpleDashboard
            title="Nodes Report"
            label="Subject-Predicate-Object"
            :colorCols="['edge_stats']"
            :data="sriCompareData.edges_spo"
            :field_names="['Monarch V3', 'SRI Reference']"
          />
        </div>
      </div>
      <div v-if="sriCompareData.nodes_category">
        <h2>Nodes Comparison</h2>
        <div style="display: inline-block; margin-right: 20px; vertical-align: top">
          <SimpleDashboard
            title="Nodes Report"
            label="Category"
            :colorCols="['node_stats']"
            :data="sriCompareData.nodes_category"
            :field_names="['Monarch V3', 'SRI Reference']"
          />
        </div>
      </div>
    </div>
    <div v-if="selectedSection === 'missing-nodes'">
      <img src="/src/global/monarch.png" class="logo" alt="Monarch Logo" />
      <h1>Missing Nodes Explorer</h1>
      <MissingNodes 
        :initialIngest="selectedMissingNodesIngest" 
        :dataSet="selectedData"
        :kgVersion="selectedReport"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, watch } from "vue"
  import {
    globalReports,
    dataNames,
    selectedData,
    updateData,
    selectedReport,
    compareNames,
    selectedCompare,
    processReports,
    edgesTimeSeriesData,
    getSRICompareData,
    globalNamespaces,
    sriCompareData,
    dashboardDataGroup,
  } from "./data"
  import SimpleDashboard from "./components/SimpleDashboard.vue"
  import SelectReport from "./components/SelectReport.vue"
  import LineChart from "./components/LineChart.vue"
  import UploadReport from "./components/UploadReport.vue"
  import MissingNodes from "./components/MissingNodes.vue"

  function isDarkMode() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  }

  const getTheme = computed(() => {
    return isDarkMode() ? "dark" : "light"
  })

  const selectedSection = ref("monarch")
  const selectedMissingNodesIngest = ref("")

  // Set up URL hash-based routing
  const updateUrlHash = (section: string, params: Record<string, string> = {}) => {
    let hash = `#${section}`;
    
    // Add parameters to hash if they exist
    const paramEntries = Object.entries(params).filter(([_, value]) => value);
    if (paramEntries.length > 0) {
      const paramString = paramEntries
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      hash += `?${paramString}`;
    }
    
    window.location.hash = hash;
  };
  
  const selectSection = (section: string) => {
    selectedSection.value = section;
    updateUrlHash(section);
    getSRICompareData();
  };
  
  // Navigate to the missing nodes page with the specified ingest
  const navigateToMissingNodesPage = (ingest: string) => {
    selectedMissingNodesIngest.value = ingest;
    selectedSection.value = "missing-nodes";
    updateUrlHash("missing-nodes", { 
      ingest: ingest, 
      dataset: selectedData.value,
      kgVersion: selectedReport.value
    });
  };
  
  // Handle hash changes (browser back/forward)
  onMounted(() => {
    // Check if there's an initial hash to parse
    if (window.location.hash) {
      handleHashChange();
    } else {
      // Set initial hash for monarch section
      updateUrlHash('monarch');
    }
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
  });
  
  // Watch for changes to selectedData and selectedReport
  // and update the URL hash if we're on the monarch page
  watch([selectedData, selectedReport], () => {
    if (selectedSection.value === 'monarch') {
      updateUrlHash('monarch', {
        dataset: selectedData.value,
        kgVersion: selectedReport.value
      });
    }
  });
  
  // Parse URL hash and update app state accordingly
  const handleHashChange = () => {
    const hash = window.location.hash.substring(1); // Remove the # symbol
    
    // If hash is empty, default to monarch section
    if (!hash) {
      selectedSection.value = "monarch";
      return;
    }
    
    // Split the hash into section and params
    const [section, paramString] = hash.split('?');
    selectedSection.value = section;
    
    // Parse params if they exist
    if (paramString) {
      const params = new URLSearchParams(paramString);
      
      // Handle shared params for any section
      const dataset = params.get('dataset');
      if (dataset && dataNames.value.includes(dataset)) {
        selectedData.value = dataset;
      }
      
      // Section-specific parameters
      if (section === "missing-nodes") {
        const ingest = params.get('ingest');
        if (ingest) {
          selectedMissingNodesIngest.value = ingest;
        }
      }
      
      // If we're on the monarch page, we may need to update the selected report
      if (section === "monarch") {
        const kgVersion = params.get('kgVersion');
        if (kgVersion && globalReports.value.has(kgVersion)) {
          selectedReport.value = kgVersion;
        }
      }
    }
    
    // Make sure we load the SRI comparison data if we're on that page
    if (section === 'sri') {
      getSRICompareData();
    }
  };
</script>
