<!--
  entry point for entire app
-->
<template>
  <main>
    <div>
      <button @click="selectSection('monarch')">Monarch-QC</button>
      <button @click="selectSection('sri')">SRI-Reference Comparison</button>
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
