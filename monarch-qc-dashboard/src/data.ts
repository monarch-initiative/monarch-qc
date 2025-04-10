import { reactive, ref } from "vue"
import YAML from "yaml"
import DOMPurify from "isomorphic-dompurify"
import * as duckdb from '@duckdb/duckdb-wasm'

import * as qc_utils from "./qc_utils"
import * as qc from "./schema/monarch_kg_qc_schema"
import { DashboardData, DashboardDataGroup } from "./components/SimpleDashboard"
import { LineChartData } from "./components/LineChart"

export const globalReports = ref<Map<string, Promise<string>>>(new Map())
export const globalStats = ref<Map<string, Promise<string>>>(new Map())

export const sriFetched = ref<boolean>(false)
export const v3Stats = ref<Promise<string>>()
export const sriStats = ref<Promise<string>>()

export const dataNames = ref<Array<string>>([])
export const selectedData = ref<string>("")
export const selectedReport = ref<string>("")
export const compareNames = ref<Array<string>>([])
export const selectedCompare = ref<string>("")
export const edgesTimeSeriesData = reactive({} as LineChartData)

export const globalNamespaces = ref<Array<string>>([])

export const dashboardDataGroup: DashboardDataGroup = reactive({})
export const sriCompareData: DashboardDataGroup = reactive({})

const qcbase = "https://data.monarchinitiative.org/"
const qcdata = new Map<string, string>([
  ["Released", "monarch-kg/"],
  ["Development", "monarch-kg-dev/"],
])

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
  qctext: string | undefined,
  report: string
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
  const reports = getQCReports(releases, report)
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
  const dataSite = qcdata.get(selectedData.value)
  const nameRegex = new RegExp(`${dataSite}(.*)/`)
  const nameMatch = url.match(nameRegex) ?? [""]
  return nameMatch[1]
}

async function getQCReports(
  urls: string[] = [""],
  report: string
): Promise<Map<string, Promise<string>>> {
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
    if (checkResponse.match(report)) {
      reportURLs.push(url.replace("index.html", report))
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

export async function getSRICompareData() {
  /**
   * Fetches the SRI stats and returns the text.
   * @return: Promise<string>
   */
  if (sriFetched.value) return
  v3Stats.value = fetchData(qcbase + "monarch-kg/2023-11-16/merged_graph_stats.yaml")
  sriStats.value = fetchData(
    qcbase + "sri-reference-kg/sri-reference-kg-0.4.0/merged_graph_stats.yaml"
  )

  const v3 = await v3Stats.value
  const sri = await sriStats.value
  const v3Report = qc_utils.toStatReport(YAML.parse(v3))
  const sriReport = qc_utils.toStatReport(YAML.parse(sri))

  sriCompareData["edges_predicates"] = getStatDashboardData(
    v3Report,
    sriReport,
    "edge_stats",
    "count_by_predicates",
    true
  )
  sriCompareData["edges_spo"] = getStatDashboardData(
    v3Report,
    sriReport,
    "edge_stats",
    "count_by_spo",
    true
  )
  sriCompareData["nodes_category"] = getStatDashboardData(
    v3Report,
    sriReport,
    "node_stats",
    "count_by_category",
    true
  )

  sriFetched.value = true
}

export async function updateData() {
  /**
   * Fetches all the data, initializes values, and sets the global refs.
   * @return: void
   */
  if (selectedData.value === "") {
    selectedData.value = "Development"
  }

  const qcsite = qcbase + qcdata.get(selectedData.value)
  const qctext: string = await fetchData(qcsite)
  globalReports.value = await fetchQCReports(qctext, "qc_report.yaml")
  globalStats.value = await fetchQCReports(qctext, "merged_graph_stats.yaml")

  // remove "latest" from qcReports, since it's always a duplicate of the most recent release
  globalReports.value.delete("latest")
  globalStats.value.delete("latest")

  selectedReport.value = [...globalReports.value.keys()].slice(-1)[0] ?? ""
  dataNames.value = [...qcdata.keys()]

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

  const selected: qc.Report = await getQCReport(selected_name)
  const previous: qc.Report = await getQCReport(compare_name)
  dashboardDataGroup["edges"] = getDashboardData(selected, previous, ["edges", "dangling_edges"])

  const timeSeriesReports = await getTimeSeriesReports(selected_name, compare_name)
  setEdgesTimeSeriesData(edgesTimeSeriesData, timeSeriesReports, "edges")

  const danglingEdgesNamespaces: string[] = qc_utils.getNamespaces(selected.dangling_edges)
  const edgesNamespaces: string[] = qc_utils.getNamespaces(selected.edges)
  globalNamespaces.value = qc_utils.stringSetDiff(danglingEdgesNamespaces, edgesNamespaces)

  const selectedStats: qc_utils.StatReport = await getStatReport(selected_name)
  const previousStats: qc_utils.StatReport = await getStatReport(compare_name)
  dashboardDataGroup["nodes_category"] = getStatDashboardData(
    selectedStats,
    previousStats,
    "node_stats",
    "count_by_category"
  )
  dashboardDataGroup["nodes_id"] = getStatDashboardData(
    selectedStats,
    previousStats,
    "node_stats",
    "count_by_id_prefixes"
  )
  dashboardDataGroup["edges_predicates"] = getStatDashboardData(
    selectedStats,
    previousStats,
    "edge_stats",
    "count_by_predicates"
  )
  dashboardDataGroup["edges_spo"] = getStatDashboardData(
    selectedStats,
    previousStats,
    "edge_stats",
    "count_by_spo"
  )
}

async function getQCReport(reportName: string): Promise<qc.Report> {
  /**
   * Fetches the QC report from globalReports and returns the parsed report.
   * @reportName: string
   * @return: Promise<QCReport>
   */
  const reportText = (await globalReports.value.get(reportName)) ?? "{}"
  return qc.toReport(YAML.parse(reportText))
}

async function getStatReport(reportName: string): Promise<qc_utils.StatReport> {
  /**
   * Fetches the stat report from globalStats and returns the parsed report.
   * @reportName: string
   * @return: Promise<StatReport>
   */
  const reportText = (await globalStats.value.get(reportName)) ?? "{}"
  return qc_utils.toStatReport(YAML.parse(reportText))
}

function getDashboardData(
  selected: qc.Report,
  previous: qc.Report,
  names: string[]
): DashboardData {
  /**
   * Sets the dashboard data for the given QCReports and parts.
   * @data: DashboardData
   * @selected: qc.QCReport
   * @previous: qc.QCReport
   * @in_kg: string
   * @in_qc: string
   * @return: void
   */
  const data: DashboardData = {}
  for (const name of names) {
    const field = name as keyof qc.Report
    data[name] = {
      value: getTotalNumber(selected[field], true),
      diff: getDifference(selected[field], previous[field]),
    }
  }
  return data
}

function getStatDashboardData(
  selected: qc_utils.StatReport,
  previous: qc_utils.StatReport,
  statName: string,
  field: string,
  compare = false
): DashboardData {
  /**
   * Sets the dashboard data for the given QCReports and parts.
   * @data: DashboardData
   * @selected: qc.StatReport
   * @previous: qc.StatReport
   * @in_kg: string
   * @in_qc: string
   * @return: void
   */
  const data: DashboardData = {}
  const partKey = statName as keyof qc_utils.StatReport
  data[statName] = {
    value: getStatTotalNumber(selected[partKey], field, true),
    diff: getStatDifference(selected[partKey], previous[partKey], field),
  }
  if (compare) {
    data[statName + "_compare"] = {
      value: getStatTotalNumber(previous[partKey], field, true),
      diff: getStatDifference(previous[partKey], selected[partKey], field),
    }
  }
  return data
}

function getTotalNumber(part: qc.SubReport[] | undefined, addTotal = false): Map<string, number> {
  /**
   * Returns the total number of edges (or nodes) of each QCPart.
   * @qcpart: QCPart[]
   * @return: Map<string, number>
   */
  const totals = new Map<string, number>()
  if (part === undefined) return totals
  let grandtotal = 0
  for (const item of part) {
    totals.set(item.name, item.total_number)
    grandtotal += item.total_number
  }
  if (addTotal) totals.set("Total Number", grandtotal)
  return totals
}

function getStatTotalNumber(
  part: qc_utils.NodeStatPart | qc_utils.EdgeStatPart | string,
  field: string,
  addTotal = false
): Map<string, number> {
  /**
   * Returns the total number of edges (or nodes) of each QCPart.
   * @part: StatPart[]
   * @return: Map<string, number>
   */
  let grandtotal = 0
  const totals = new Map<string, number>()
  if (qc_utils.isNodeStatPart(part)) {
    const fieldVals = part[field as keyof qc_utils.NodeStatPart]
    if (typeof fieldVals != "object") return new Map<string, number>()
    else if (field === "count_by_category") {
      for (const [key, value] of Object.entries(fieldVals)) {
        totals.set(key, value.count)
        grandtotal += value.count
      }
    } else if (field === "count_by_id_prefixes") {
      grandtotal = Object.values(fieldVals).reduce((a, b) => a + b, 0)
      return new Map(Object.entries(fieldVals)).set("Total Number", grandtotal)
    }
  } else if (qc_utils.isEdgeStatPart(part)) {
    const fieldVals = part[field as keyof qc_utils.EdgeStatPart]
    if (typeof fieldVals != "object") return new Map<string, number>()
    else if (field === "count_by_predicates" || field === "count_by_spo") {
      for (const [key, value] of Object.entries(fieldVals)) {
        totals.set(key, value.count)
        grandtotal += value.count
      }
    }
  }
  if (addTotal) totals.set("Total Number", grandtotal)
  return totals
}

function getDifference(
  part: qc.SubReport[] | undefined,
  previous_part: qc.SubReport[] | undefined
): Map<string, number> {
  /**
   * Return the difference between two QCParts matching on the same key.
   * @qcpart: QCPart[]
   * @previous_qcpart: QCPart[]
   * @return: Map<string, number>
   */
  const difference_totals = new Map<string, number>()
  if (part === undefined || previous_part === undefined) return difference_totals
  for (const item of part) {
    for (const previous_item of previous_part) {
      if (item.name === previous_item.name) {
        difference_totals.set(item.name, item.total_number - previous_item.total_number)
      }
    }
  }
  return difference_totals
}

function getStatDifference(
  part: qc_utils.NodeStatPart | qc_utils.EdgeStatPart | string,
  previous_part: qc_utils.NodeStatPart | qc_utils.EdgeStatPart | string,
  field: string
): Map<string, number> {
  /**
   * Return the difference between two QCParts matching on the same key.
   * @qcpart: QCPart[]
   * @previous_qcpart: QCPart[]
   * @return: Map<string, number>
   */
  const total_diffs = new Map<string, number>()

  if (qc_utils.isNodeStatPart(part) && qc_utils.isNodeStatPart(previous_part)) {
    const fieldKey = field as keyof qc_utils.NodeStatPart
    if (fieldKey === "count_by_category") {
      const fieldVals = part[fieldKey]
      const previousFieldVals = previous_part[fieldKey]
      for (const [key, value] of Object.entries(fieldVals)) {
        const previousValue = previousFieldVals[key] as qc_utils.StatCount
        if (previousValue === undefined) continue
        total_diffs.set(key, value.count - previousValue.count)
      }
    }
    if (fieldKey === "count_by_id_prefixes") {
      const fieldVals = part[fieldKey]
      const previousFieldVals = previous_part[fieldKey]
      for (const [key, value] of Object.entries(fieldVals)) {
        const previousValue = previousFieldVals[key] as number
        if (previousValue === undefined) continue
        total_diffs.set(key, value - previousValue)
      }
    }
  }
  if (qc_utils.isEdgeStatPart(part) && qc_utils.isEdgeStatPart(previous_part)) {
    const fieldKey = field as keyof qc_utils.EdgeStatPart
    if (fieldKey === "count_by_predicates" || fieldKey === "count_by_spo") {
      const fieldVals = part[fieldKey]
      const previousFieldVals = previous_part[fieldKey]
      for (const [key, value] of Object.entries(fieldVals)) {
        const previousValue = previousFieldVals[key] as qc_utils.StatCount
        if (previousValue === undefined) continue
        total_diffs.set(key, value.count - previousValue.count)
      }
    }
  }
  return total_diffs
}

async function getTimeSeriesReports(
  selected_name: string,
  compare_name: string
): Promise<Map<string, qc.Report>> {
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

  const reports = new Map<string, qc.Report>()
  for (const [key, value] of globalReports.value.entries()) {
    const index = reportKeys.indexOf(key)
    if (firstIndex <= index && index <= lastIndex) {
      const report = qc.toReport(YAML.parse(await value))
      reports.set(key, report)
    }
  }
  return reports
}

function setEdgesTimeSeriesData(
  data: LineChartData,
  reports: Map<string, qc.Report>,
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
  const part_key = part_name as keyof qc.Report
  // const chartSeries = getChartSeries()
  const chartSeries = <{ name: string; data: [Date, number][] }[]>[]
  for (const [key, value] of reports.entries()) {
    const report = value
    const date = new Date(key)
    for (const qcpart of report[part_key] ?? []) {
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

  data.chartSeries = chartSeries
}

// URLs for DuckDB WASM assets
const DUCKDB_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: new URL('/node_modules/@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm', import.meta.url).href,
    mainWorker: new URL('/node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js', import.meta.url).href,
  },
  eh: {
    mainModule: new URL('/node_modules/@duckdb/duckdb-wasm/dist/duckdb-eh.wasm', import.meta.url).href,
    mainWorker: new URL('/node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js', import.meta.url).href,
  },
};

// DuckDB instance cache
let duckDbInstance: duckdb.AsyncDuckDB | null = null;
let duckDbInstancePromise: Promise<duckdb.AsyncDuckDB> | null = null;

/**
 * Initialize DuckDB WASM instance
 */
async function initDuckDB(): Promise<duckdb.AsyncDuckDB> {
  if (duckDbInstance) return duckDbInstance;
  if (duckDbInstancePromise) return duckDbInstancePromise;

  duckDbInstancePromise = (async () => {
    // Create a DuckDB instance
    const worker = new Worker(DUCKDB_BUNDLES.mvp.mainWorker);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(DUCKDB_BUNDLES.mvp.mainModule);
    duckDbInstance = db;
    return db;
  })();

  return duckDbInstancePromise;
}

/**
 * Load missing nodes data from Parquet file
 * 
 * @param ingest - The ingest name to filter by, or null to return all available ingests
 * @param dataSet - The data set to use (Released or Development), defaults to selectedData.value
 * @param kgVersion - Specific KG version to use, defaults to "latest" 
 * @returns Array of missing nodes data or array of ingest names if ingest is null
 */
export async function loadMissingNodesData(
  ingest: string | null, 
  dataSet?: string,
  kgVersion?: string
): Promise<string[] | Array<{ missing_node: string; edge_ingest: string }>> {
  try {
    const db = await initDuckDB();

    // Create a connection
    const conn = await db.connect();

    // Determine which dataset to use
    const dataset = dataSet || selectedData.value;
    const dataSite = qcdata.get(dataset) || "monarch-kg/";
    
    // Use provided KG version or default to latest
    const version = kgVersion || "latest";
    
    // Build the URL based on the selected dataset and version
    const parquetUrl = `https://data.monarchinitiative.org/${dataSite}${version}/qc/missing_nodes.parquet`;
    
    // Register the Parquet file as a table
    try {
      await conn.query(`
        CREATE OR REPLACE TABLE missing_nodes AS 
        SELECT * FROM parquet_scan('${parquetUrl}')
      `);
    } catch (error) {
      console.error('Error registering parquet file:', error);
      await conn.close();
      throw error;
    }

    if (ingest === null) {
      // Get all unique ingest names
      const result = await conn.query(`
        SELECT DISTINCT edge_ingest 
        FROM missing_nodes 
        ORDER BY edge_ingest
      `);
      
      // Convert to plain strings before returning
      const plainResults = result.toArray().map(row => String(row.edge_ingest));
      
      await conn.close();
      return plainResults;
    } else {
      // Get up to 100 examples for the specified ingest
      // DuckDB WASM doesn't support parameterized queries in the same way as other DBs
      // Escape single quotes to prevent SQL injection
      const safeIngest = ingest.replace(/'/g, "''");
      const result = await conn.query(`
        SELECT DISTINCT missing_node, edge_ingest, edge_primary_knowledge_source
        FROM missing_nodes
        WHERE edge_ingest = '${safeIngest}'
        LIMIT 100
      `);
      
      // Convert to plain objects before returning
      const plainResults = result.toArray().map(row => ({
        missing_node: String(row.missing_node),
        edge_ingest: String(row.edge_ingest),
        edge_primary_knowledge_source: String(row.edge_primary_knowledge_source),
      }));
      
      await conn.close();
      return plainResults;
    }
  } catch (error) {
    console.error('Error in loadMissingNodesData:', error);
    throw error;
  }
}
