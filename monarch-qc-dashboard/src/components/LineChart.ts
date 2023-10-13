import * as qc_utils from "../qc_utils"
import YAML from "yaml"
import { ApexOptions } from "apexcharts"

export function getChartOptions(): ApexOptions {
  return {
    chart: {
      id: "line-chart",
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
      },
    },
  }
}

export function getChartSeries(): { name: string; data: [Date, number][] }[] {
  return [
    {
      name: "Series 1",
      data: [
        [new Date("2023-01-01"), 30], // Add your time-series data here as [Date, number]
        [new Date("2023-01-05"), 40],
        [new Date("2023-01-09"), 35],
        [new Date("2023-01-13"), 50],
        [new Date("2023-01-17"), 49],
        [new Date("2023-01-21"), 55],
      ],
    },
  ]
}

export async function processChartReports(
  beginReport: string,
  endReport: string,
  reports: Map<string, Promise<string>>,
  callback: (chartData: {
    chartOptions: ApexOptions
    chartSeries: { name: string; data: [Date, number][] }[]
  }) => void
) {
  /**
   * Processes the QC reports into a chart.
   * @reports: Map<string, Promise<string>>
   * @callback: (chartData: { chartOptions: ApexOptions; chartSeries: { name: string; data: [Date, number][] }[] }
   * @return: void
   */
  const reportsSeries = <{ name: string; data: [Date, number][] }[]>[]

  const reportKeys = Array.from(reports.keys())
  const beginIndex = reportKeys.indexOf(beginReport)
  const endIndex = reportKeys.indexOf(endReport)

  const index = beginIndex - endIndex > 4 ? endIndex : beginIndex - 4
  console.log(beginIndex)
  console.log(endIndex)
  console.log(index)

  for (const [key, value] of reports.entries()) {
    const report = qc_utils.toQCReport(YAML.parse(await value))
    const date = new Date(key)
    for (const qcpart of report.edges) {
      const name = qcpart.name
      const total = qcpart.total_number

      const existingSeries = reportsSeries.find((item) => item.name === name)
      if (existingSeries) {
        existingSeries.data.push([date, total])
      } else {
        reportsSeries.push({ name: name, data: [[date, total]] })
      }
    }
  }
  const chartOptions = getChartOptions()
  const chartSeries = getChartSeries()
  // const chartSeries = reportsSeries

  console.log(chartSeries)
  callback({ chartOptions, chartSeries })
}

export async function processChartReports_exp(
  reports: Map<string, Promise<string>>,
  callback: (chartData: {
    chartOptions: ApexOptions
    chartSeries: { name: string; data: [Date, number][] }[]
  }) => void
) {
  const chartOptions = getChartOptions()
  const chartSeries = <{ name: string; data: [Date, number][] }[]>[]

  // Create an array of report processing promises
  const reportPromises = Array.from(reports.entries()).map(async ([key, value]) => {
    const report = qc_utils.toQCReport(YAML.parse(await value))
    const date = new Date(key)

    for (const qcpart of report.edges) {
      let name = qcpart.name
      const total = qcpart.total_number

      const match = name.match(/[^./]+/)

      if (match) {
        name = match[0]
      }

      const existingSeries = chartSeries.find((item) => item.name === name)

      if (existingSeries) {
        existingSeries.data.push([date, total])
      } else {
        chartSeries.push({ name: name, data: [[date, total]] })
      }
    }
  })

  // Wait for all report processing promises to resolve
  await Promise.all(reportPromises)

  // Call the callback with the chart data
  callback({ chartOptions, chartSeries })
}
