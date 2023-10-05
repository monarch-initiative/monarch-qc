<!--
  entry point for entire app
-->
<template>
  <main>
    <div>
      <img src="/src/global/monarch.png" class="logo" alt="Monarch Logo" />
    </div>
    <SelectReport
      :reports="globalReports"
      :selected="selectedReport"
      :namespaces="globalNamespaces"
      :danglingEdgesTotals="danglingEdgesTotals"
      :edgesTotals="edgesTotals"
      :edgesDifference="edgesDifference"
      :danglingEdgesDifference="danglingEdgesDifference"
    />
    <SimpleDashboard
      title="Edges Report"
      label="Ingest"
      a_name="Edges"
      b_name="Dangling Edges"
      :a="edgesTotals"
      :b="danglingEdgesTotals"
      :a_diff="edgesDifference"
      :b_diff="danglingEdgesDifference"
    />
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
    globalNamespaces,
    danglingEdgesTotals,
    edgesTotals,
    edgesDifference,
    danglingEdgesDifference,
  } from "./data"
  import SimpleDashboard from "./components/SimpleDashboard.vue"
  import SelectReport from "./components/SelectReport.vue"
</script>
