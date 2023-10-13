<!--
  entry point for entire app
-->
<template>
  <main>
    <div>
      <img src="/src/global/monarch.png" class="logo" alt="Monarch Logo" />
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
    <SimpleDashboard
      title="Edges Report"
      label="Ingest"
      a_name="Edges"
      b_name="Dangling Edges"
      :data="edgesDashboardData"
    />
    <!-- <LineChart
      :beginReport="selectedReport"
      :endReport="selectedCompare"
      :reports="globalReports"
    /> -->
    <div class="danging-namespaces">
      Namespaces only in dangling_edges: <br />
      <ul>
        <li v-for="namespace in globalNamespaces" :key="namespace">
          {{ namespace }}
        </li>
      </ul>
    </div>
  </main>
</template>

<script setup lang="ts">
  import {
    globalReports,
    selectedReport,
    compareNames,
    selectedCompare,
    processReports,
    edgesDashboardData,
    globalNamespaces,
  } from "./data"
  import SimpleDashboard from "./components/SimpleDashboard.vue"
  import SelectReport from "./components/SelectReport.vue"
  import LineChart from "./components/LineChart.vue"
</script>
