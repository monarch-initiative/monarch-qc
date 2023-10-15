<template>
  <span v-if="data">
    <div class="line-chart">
      <apexchart
        type="line"
        :options="chartOptions"
        :series="getSeriesSortN(data.chartSeries || [], sortFn, n)"
      />
    </div>
  </span>
</template>

<script setup lang="ts">
  import { LineChartData, getSeriesSortN } from "./LineChart"

  const chartOptions = {
    chart: { id: "line-chart" },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
  }

  defineProps<{
    n: number
    sortFn: (...values: number[]) => number
    data: LineChartData
  }>()
</script>

<style scoped>
  .line-chart {
    width: 100%;
    /* max-width: 600px; Adjust the width as needed */
    margin: 0 auto;
  }
</style>
