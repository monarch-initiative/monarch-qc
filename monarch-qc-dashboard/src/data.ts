import { reactive, ref } from "vue"
import YAML from "yaml"
import DOMPurify from "isomorphic-dompurify"

import * as qc from "./qc_utils"
import { DashboardData } from "./components/SimpleDashboard"
import { LineChartData } from "./components/LineChart"

export const globalReports = ref<Map<string, Promise<string>>>(new Map())
export const selectedReport = ref<string>("")
export const compareNames = ref<Array<string>>([])
export const selectedCompare = ref<string>("")

export const edgesDashboardData = reactive({} as DashboardData)
export const edgesTimeSeriesData = reactive({} as LineChartData)

export const globalNamespaces = ref<Array<string>>([])

const qcsite = "https://data.monarchinitiative.org/monarch-kg-dev/"

function htmlToDom(html: string): HTMLDivElement {
  /**
    Converts an HTML string to a DOM element.
    @html: string
    @return: HTMLDivElement
    */
  const cleanhtml = DOMPurify.sanitize(html)
  const elem = document.createElement("div")
  elem.innerHTML = cleanhtml
  return elem
}

export async function fetchQCReports(
  qctext: string | undefined
): Promise<Map<string, Promise<string>>> {
  /**
   * Parses the QC report index page for QC Report urls,
   * and returns a map of report names to promises of report text.
   * @url: string
   * @return: Map<string, Promise<string>>
   */
  if (qctext === undefined) {
    return new Map<string, Promise<string>>()
  }

  const releases = getQCReportReleases(qctext)
  const reports = getQCReports(releases)
  return reports
}

function zipPromiseMap(keys: string[], values: Promise<string>[]): Map<string, Promise<string>> {
  /**
   * Zips two arrays into a map of keys to promises of values.
   * @keys: string[]
   * @values: Promise<string>[]
   * @return: Map<string, Promise<string>>
   */
  return <Map<string, Promise<string>>>qc.zipMap(keys, values)
}

function getReportNames(url = ""): string {
  /**
   * Extracts the report name from the url.
   * @url: string
   * @return: string
   */
  const nameRegex = /monarch-kg-dev\/(.*)\//
  const nameMatch = url.match(nameRegex)
  if (nameMatch === null) {
    return ""
  }
  return nameMatch[1]
}

async function getQCReports(urls: string[] = [""]): Promise<Map<string, Promise<string>>> {
  /**
   * Fetches the QC reports and returns a map of report names to promises of report text.
   * @urls: string[]
   * @return: Map<string, Promise<string>>
   */
  const responses = urls.map(fetchData)
  const responseMap = zipPromiseMap(urls, responses)

  const reportURLs: string[] = []
  for (const [url, response] of responseMap.entries()) {
    const checkResponse = await response
    if (checkResponse.match("qc_report.yaml")) {
      reportURLs.push(url.replace("index.html", "qc_report.yaml"))
    }
  }
  const reports = reportURLs.map(fetchData)
  const reportNames = reportURLs.map(getReportNames)

  return zipPromiseMap(reportNames, reports)
}

function getQCReportReleases(html: string): string[] {
  /**
   * Parses the QC report index page for QC report urls.
   * @html: string
   * @return: string[]
   */
  const elem = htmlToDom(html)
  const alist = elem.querySelectorAll("ul")[1]

  const urls: string[] = []
  alist.querySelectorAll("a").forEach(function (a: HTMLAnchorElement) {
    const href = a.getAttribute("href")
    if (typeof href === "string") {
      urls.push(href)
    }
  })
  return urls
}

async function fetchData(url = ""): Promise<string> {
  /**
   * Fetches the data from the url and returns the text.
   * @url: string
   * @return: Promise<string>
   */
  const response = await fetch(url)
  const text = await response.text()
  return text
}

export async function fetchAllData() {
  /**
   * Fetches all the data, initializes values, and sets the global refs.
   * @return: void
   */
  const qctext: string = await fetchData(qcsite)
  globalReports.value = await fetchQCReports(qctext)

  // remove "latest" from qcReports, since it's always a duplicate of the most recent release
  globalReports.value.delete("latest")

  selectedReport.value = [...globalReports.value.keys()].slice(-1)[0] ?? ""
  processReports()
}

export async function processReports() {
  /**
   * Processes the selected and comparison reports and set the global refs.
   * @return: void
   */
  // compareNames.value = removeLaterReports([...globalReports.value.keys()], selectedReport.value)
  const reportNames: string[] = [...globalReports.value.keys()]
  compareNames.value = reportNames.slice(0, reportNames.indexOf(selectedReport.value))
  if (compareNames.value.indexOf(selectedCompare.value, 0) === -1) {
    selectedCompare.value = compareNames.value.slice(-1)[0] ?? ""
  }

  const selected_name: string = selectedReport.value
  const compare_name: string = selectedCompare.value

  const selected: qc.QCReport = await getQCReport(selected_name)
  const previous: qc.QCReport = await getQCReport(compare_name)
  setDashboardData(edgesDashboardData, selected, previous, "edges", "dangling_edges")

  const timeSeriesReports = await getTimeSeriesReports(selected_name, compare_name)
  setEdgesTimeSeriesData(edgesTimeSeriesData, timeSeriesReports, "edges")

  const danglingEdgesNamespaces: string[] = qc.getNamespaces(selected.dangling_edges)
  const edgesNamespaces: string[] = qc.getNamespaces(selected.edges)
  globalNamespaces.value = qc.stringSetDiff(danglingEdgesNamespaces, edgesNamespaces)
}

export async function getQCReport(reportName: string): Promise<qc.QCReport> {
  /**
   * Fetches the QC report from globalReports and returns the parsed report.
   * @reportName: string
   * @return: Promise<QCReport>
   */
  const reportText = (await globalReports.value.get(reportName)) ?? "{}"
  return qc.toQCReport(YAML.parse(reportText))
}

function setDashboardData(
  data: DashboardData,
  selected: qc.QCReport,
  previous: qc.QCReport,
  name_a: string,
  name_b: string
) {
  /**
   * Sets the dashboard data for the given QCReports and parts.
   * @data: DashboardData
   * @selected: QCReport
   * @previous: QCReport
   * @in_kg: string
   * @in_qc: string
   * @return: void
   */
  const key_a = name_a as keyof qc.QCReport
  const key_b = name_b as keyof qc.QCReport
  data.a = getTotalNumber(selected[key_a], true)
  data.b = getTotalNumber(selected[key_b], true)
  data.a_diff = getDifference(selected[key_a], previous[key_a])
  data.b_diff = getDifference(selected[key_b], previous[key_b])
}

function getTotalNumber(qcpart: qc.QCPart[], addTotal = false): Map<string, number> {
  /**
   * Returns the total number of edges (or nodes) of each QCPart.
   * @qcpart: QCPart[]
   * @return: Map<string, number>
   */
  if (qcpart === undefined) return new Map<string, number>()
  let grandtotal = 0
  const totals = new Map<string, number>()
  for (const item of qcpart) {
    totals.set(item.name, item.total_number)
    grandtotal += item.total_number
  }
  if (addTotal) totals.set("Total Number", grandtotal)
  return totals
}

function getDifference(qcpart: qc.QCPart[], previous_qcpart: qc.QCPart[]): Map<string, number> {
  /**
   * Return the difference between two QCParts matching on the same key.
   * @qcpart: QCPart[]
   * @previous_qcpart: QCPart[]
   * @return: Map<string, number>
   */
  const difference_totals = new Map<string, number>()
  if (qcpart === undefined || previous_qcpart === undefined) return new Map<string, number>()
  for (const item of qcpart) {
    for (const previous_item of previous_qcpart) {
      if (item.name === previous_item.name) {
        difference_totals.set(item.name, item.total_number - previous_item.total_number)
      }
    }
  }
  return difference_totals
}

async function getTimeSeriesReports(
  selected_name: string,
  compare_name: string
): Promise<Map<string, qc.QCReport>> {
  /**
   * Returns an array of QCReports for the selected and previous reports.
   * @selected: QCReport
   * @previous: QCReport
   * @return: Array<QCReport>
   */

  const reportKeys = Array.from(globalReports.value.keys())
  const lastIndex = reportKeys.indexOf(selected_name)
  const checkIndex = reportKeys.indexOf(compare_name)
  const firstIndex = lastIndex - checkIndex > 4 ? checkIndex : lastIndex - 4

  const reports = new Map<string, qc.QCReport>()
  for (const [key, value] of globalReports.value.entries()) {
    const index = reportKeys.indexOf(key)
    if (firstIndex <= index && index <= lastIndex) {
      const report = qc.toQCReport(YAML.parse(await value))
      reports.set(key, report)
    }
  }
  return reports
}

function setEdgesTimeSeriesData(
  data: LineChartData,
  reports: Map<string, qc.QCReport>,
  part_name: string
) {
  /**
   * Sets the time series data for the given QCReports and parts.
   * @data: DashboardData
   * @reports: Array<QCReport>
   * @part_name: string
   * @return: void
   */
  // const chartOptions = getChartOptions()
  const part_key = part_name as keyof qc.QCReport
  // const chartSeries = getChartSeries()
  const chartSeries = <{ name: string; data: [Date, number][] }[]>[]
  for (const [key, value] of reports.entries()) {
    const report = value
    const date = new Date(key)
    for (const qcpart of report[part_key]) {
      const name = qcpart.name
      const total = qcpart.total_number

      const existingSeries = chartSeries.find((item) => item.name === name)
      if (existingSeries) {
        existingSeries.data.push([date, total])
      } else {
        chartSeries.push({ name: name, data: [[date, total]] })
      }
    }
  }

  console.log(chartSeries)

  // data.chartOptions = chartOptions
  data.chartSeries = chartSeries
}
