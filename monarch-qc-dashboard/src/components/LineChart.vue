<template>
  <span v-if="data.chartSeries">
    <apexchart ref="lineChart" type="line" :options="chartOptions" :series="data.chartSeries" />
  </span>
</template>

<script setup lang="ts">
  import { ref, watch } from "vue"
  import { getSeriesSortN, LineChartData } from "./LineChart"

  const chartOptions = {
    chart: { id: "line-chart" },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
  }

  const { n, sortFn, data } = defineProps<{
    n: number
    sortFn: (...values: number[]) => number
    data: LineChartData
  }>()

  const lineChart = ref<ApexCharts | null>(null)
  const loaded = ref(false)

  watch(data, (newData) => {
    if (!loaded.value) {
      const seriesSortN = getSeriesSortN(data.chartSeries, sortFn, n)
      data.chartSeries.forEach((series) => {
        if (seriesSortN.some((s) => s.name === series.name)) {
          lineChart.value?.showSeries(series.name)
        } else {
          lineChart.value?.hideSeries(series.name)
        }
      })
      loaded.value = true
    }
    if (newData.chartSeries) {
      lineChart.value?.updateSeries(newData.chartSeries as ApexAxisChartSeries)
    }
  })
</script>
