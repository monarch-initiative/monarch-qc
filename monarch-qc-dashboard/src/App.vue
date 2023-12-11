<!--
  entry point for entire app
-->
<template>
  <main>
    <div>
      <button @click="selectSection('monarch')">Monarch-QC</button>
      <button @click="selectSection('sri')">SRI-Reference Comparison</button>
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
        title="Edges Report"
        label="Ingest"
        :colorCols="['edges']"
        :data="edgesDashboardData"
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
        <h2>Nodes Report</h2>
        <div style="display: inline-block; margin-right: 20px; vertical-align: top">
          <SimpleDashboard
            title="Nodes Report"
            label="Category"
            :colorCols="['node_stats']"
            :data="nodesDashboardData_category"
          />
        </div>
        <div style="display: inline-block; margin-right: 20px; vertical-align: top">
          <SimpleDashboard
            title="Nodes Report"
            label="ID"
            :colorCols="['node_stats']"
            :data="nodesDashboardData_id"
          />
        </div>
      </div>
    </div>
    <div v-if="selectedSection === 'sri'">
      <img src="/src/global/monarch.png" class="logo" alt="Monarch Logo" />
      <div>
        <h2>Nodes Report</h2>
        <div style="display: inline-block; margin-right: 20px; vertical-align: top">
          <SimpleDashboard
            title="Nodes Report"
            label="Category"
            :colorCols="['node_stats']"
            :data="sriCompareData"
            :field_names="['Monarch V3', 'SRI Reference']"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue"
  import {
    globalReports,
    dataNames,
    selectedData,
    updateData,
    selectedReport,
    compareNames,
    selectedCompare,
    processReports,
    edgesDashboardData,
    edgesTimeSeriesData,
    getSRICompareData,
    globalNamespaces,
    nodesDashboardData_category,
    nodesDashboardData_id,
    sriCompareData,
  } from "./data"
  import SimpleDashboard from "./components/SimpleDashboard.vue"
  import SelectReport from "./components/SelectReport.vue"
  import LineChart from "./components/LineChart.vue"

  function isDarkMode() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  }

  const getTheme = computed(() => {
    return isDarkMode() ? "dark" : "light"
  })

  const selectedSection = ref("monarch")

  const selectSection = (section: string) => {
    selectedSection.value = section
    getSRICompareData()
  }
</script>
