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
      style="padding-left: 0.75rem"
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
      :a="edgesTotals"
      :b="danglingEdgesTotals"
      :a_diff="edgesDifference"
      :b_diff="danglingEdgesDifference"
    />
    <!-- <LineChart :reports="chartReports" /> -->
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
    danglingEdgesTotals,
    edgesTotals,
    edgesDifference,
    danglingEdgesDifference,
    globalNamespaces,
  } from "./data"
  import SimpleDashboard from "./components/SimpleDashboard.vue"
  import SelectReport from "./components/SelectReport.vue"
  import LineChart from "./components/LineChart.vue"
</script>
