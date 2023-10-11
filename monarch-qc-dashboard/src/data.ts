import { Ref, ref } from "vue"
import YAML from "yaml"
import DOMPurify from "isomorphic-dompurify"

import * as qc_utils from "./qc_utils"
import { dashboardData } from "./components/SimpleDashboard"

export const globalReports = ref<Map<string, Promise<string>>>(new Map())
export const selectedReport = ref<string>("")
export const compareNames = ref<Array<string>>([])
export const selectedCompare: Ref<string> = ref("")

export const edgesDashboardData = ref<dashboardData>({} as dashboardData)
// All of these should move to a single dshboard interface ref
// export const globalTotals = ref<Map<string, string>>(new Map())
export const danglingEdgesTotals = ref<Map<string, number>>(new Map())
export const edgesTotals = ref<Map<string, number>>(new Map())
export const danglingEdgesDifference = ref<Map<string, number>>(new Map())
export const edgesDifference = ref<Map<string, number>>(new Map())
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
  return <Map<string, Promise<string>>>qc_utils.zipMap(keys, values)
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
  selectedCompare.value = [...globalReports.value.keys()].slice(-2)[0] ?? ""

  processReports()
}

export async function processReports() {
  /**
   * Processes the selected and comparison reports and set the global refs.
   * @return: void
   */
  compareNames.value = removeLaterReports([...globalReports.value.keys()], selectedReport.value)
  if (compareNames.value.indexOf(selectedCompare.value, 0) === -1) {
    selectedCompare.value = compareNames.value.slice(-1)[0] ?? ""
  }

  const selected: qc_utils.QCReport = await getQCReport(selectedReport.value)
  const previous: qc_utils.QCReport = await getQCReport(selectedCompare.value)

  danglingEdgesTotals.value = getTotalNumber(selected.dangling_edges, true)
  edgesTotals.value = getTotalNumber(selected.edges, true)
  danglingEdgesDifference.value = getDifference(selected.dangling_edges, previous.dangling_edges)
  edgesDifference.value = getDifference(selected.edges, previous.edges)

  const danglingEdgesNamespaces: string[] = qc_utils.getNamespaces(selected.dangling_edges)
  const edgesNamespaces: string[] = qc_utils.getNamespaces(selected.edges)
  globalNamespaces.value = qc_utils.stringSetDiff(danglingEdgesNamespaces, edgesNamespaces)
}

async function getQCReport(reportName: string): Promise<qc_utils.QCReport> {
  /**
   * Fetches the QC report from globalReports and returns the parsed report.
   * @reportName: string
   * @return: Promise<QCReport>
   */
  const reportText = (await globalReports.value.get(reportName)) ?? "{}"
  return qc_utils.toQCReport(YAML.parse(reportText))
}

function getTotalNumber(qcpart: qc_utils.QCPart[], addTotal = false): Map<string, number> {
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

function getDifference(
  qcpart: qc_utils.QCPart[],
  previous_qcpart: qc_utils.QCPart[]
): Map<string, number> {
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

function removeLaterReports(reportNames: string[], reportName: string): string[] {
  /**
   * Removes the selected report and all later reports.
   * @reportNames: string[]
   * @reportName: string
   * @return: string[]
   */
  const index = reportNames.indexOf(reportName)
  return reportNames.slice(0, index)
}
