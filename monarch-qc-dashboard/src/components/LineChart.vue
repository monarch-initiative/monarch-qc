<template>
  <span v-if="data">
    <div class="line-chart">
      <div class="series-toggle">
        <label v-for="series in data.chartSeries" :key="series.name">
          <input
            type="checkbox"
            v-model="selectedSeries[series.name]"
            @change="toggleSeries(series.name)"
          />
          {{ series.name }}
        </label>
      </div>
      <apexchart type="line" :options="chartOptions" :series="filteredSeries" />
    </div>
  </span>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue"
  import { LineChartData, getSeriesSortN } from "./LineChart"

  const chartOptions = {
    chart: { id: "line-chart" },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
  }

  const { n, sortFn, data } = defineProps<{
    n: number
    sortFn: (...values: number[]) => number
    data: LineChartData
  }>()

  const selectedSeries: Record<string, boolean> = {}

  // const seriesSortN = computed(() => {
  //   return getSeriesSortN(data.chartSeries, sortFn, n)
  // })
  // data.chartSeries.forEach((series) => {
  //   selectedSeries[series.name] = seriesSortN.value.includes(series)
  // })

  data.chartSeries.forEach((series) => {
    selectedSeries[series.name] = true
  })

  const getFilteredSeries = () => {
    return data.chartSeries.filter((series) => selectedSeries[series.name])
  }

  const filteredSeries = ref(getFilteredSeries())

  // const filteredSeries = computed(() => {
  //   return data.chartSeries.filter((series) => selectedSeries[series.name])
  // })

  const toggleSeries = (seriesName: string) => {
    selectedSeries[seriesName] = !selectedSeries[seriesName]
  }

  watch(selectedSeries, () => {
    // filteredSeries.value = getFilteredSeries()

    console.log("selectedSeries changed")
  })
</script>

<style scoped>
  .line-chart {
    width: 100%;
    /* max-width: 600px; Adjust the width as needed */
    margin: 0 auto;
  }
</style>
