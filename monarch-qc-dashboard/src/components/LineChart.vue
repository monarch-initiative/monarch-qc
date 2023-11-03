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

  watch(data, (newData) => {
    try {
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
    } catch (error) {
      console.error("Error while processing data:", error)
    }
  })
</script>
