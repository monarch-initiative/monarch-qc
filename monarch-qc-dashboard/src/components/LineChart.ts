import { ApexOptions } from "apexcharts"

export interface LineChartData {
  chartOptions: ApexOptions
  chartSeries: { name: string; data: [Date, number][] }[]
}

export function getSeriesSortN(
  series: { name: string; data: [Date, number][] }[],
  sortFn: (...values: number[]) => number,
  n: number
): { name: string; data: [Date, number][] }[] {
  /**
   * Returns the top n series by total number.
   * @series: { name: string; data: [Date, number][] }[]
   * @n: number
   * @return: { name: string; data: [Date, number][] }[]
   **/
  const sortedSeries = series.sort((a, b) => {
    const aSort = sortFn(...a.data.map((item) => item[1]))
    const bSort = sortFn(...b.data.map((item) => item[1]))
    return bSort - aSort
  })
  return sortedSeries.slice(0, n)
}
