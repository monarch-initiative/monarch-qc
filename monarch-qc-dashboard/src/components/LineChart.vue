<template>
  <div class="line-chart">
    <apexchart type="line" :options="chartOptions" :series="chartSeries" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue"
  import { ApexOptions } from "apexcharts"
  import { processChartReports } from "./LineChart"

  const { beginReport, endReport, reports } = defineProps<{
    beginReport: string
    endReport: string
    reports: Map<string, Promise<string>>
  }>()

  const chartOptions = ref<ApexOptions>()
  const chartSeries = ref<{ name: string; data: [Date, number][] }[]>()

  onMounted(() => {
    processChartReports(beginReport, endReport, reports, (chartData) => {
      chartOptions.value = chartData.chartOptions
      chartSeries.value = chartData.chartSeries
    })
  })
</script>

<style scoped>
  .line-chart {
    width: 100%;
    /* max-width: 600px; Adjust the width as needed */
    margin: 0 auto;
  }
</style>
