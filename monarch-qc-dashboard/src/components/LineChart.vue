<template>
  <span v-if="data.chartSeries">
    <apexchart ref="lineChart" type="line" :options="chartOptions" :series="data.chartSeries" />
  </span>
</template>

<script setup lang="ts">
  import { ref, watch } from "vue"
  import { getSeriesSortN, LineChartData } from "./LineChart"

  const { data, n, sortFn, theme } = defineProps<{
    data: LineChartData
    n: number
    sortFn: (...values: number[]) => number
    theme: "dark" | "light"
  }>()

  const lineChart = ref<ApexCharts | null>(null)

  const chartOptions = {
    chart: { id: "line-chart" },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
    theme: { mode: theme },
  }

  watch(data, (newData) => {
    const seriesPromises = newData.chartSeries.map((series) => {
      return Promise.all(series.data.map((item) => item[1]))
    })
    Promise.all(seriesPromises).then(() => {
      const seriesSortN = getSeriesSortN(newData.chartSeries, sortFn, n)
      newData.chartSeries.forEach((series) => {
        if (seriesSortN.some((s) => s.name === series.name)) {
          lineChart.value?.showSeries(series.name)
        } else {
          lineChart.value?.hideSeries(series.name)
        }
      })
    })
  })
</script>
