import { ref } from "vue";
import YAML from "yaml";
import DOMPurify from 'isomorphic-dompurify';

export const globalData = ref<Map<string, any>>(new Map())
export const globalTotals = ref<Map<string, string>>(new Map())
export const globalNamespaces = ref<Array<string>>([])
export const danglingEdgesTotals = ref<Map<string, number>>(new Map())
export const edgesTotals = ref<Map<string, number>>(new Map())


export interface QCReport {
    dangling_edges: QCPart[];
    edges: QCPart[];
    missing_nodes: QCPart[];
    nodes: QCPart[];
}


export interface QCPart {
    categories: [];
    missing: number;
    name: string;
    namespaces: [];
    node_types: [];
    predicates: [];
    taxon: [];
    total_number: number;
}

const qcsite = "https://data.monarchinitiative.org/monarch-kg-dev/"


function htmlToDom(html: string): HTMLDivElement {
    /**
    Converts an HTML string to a DOM element.
    @html: string
    @return: HTMLDivElement
    */
    const cleanhtml = DOMPurify.sanitize(html);
    let elem = document.createElement("div");
    elem.innerHTML = cleanhtml;
    return elem
}

async function fetchQCReports (url = ""): Promise<Map<string, Promise<string>>> {
    /**
     * Fetches the QC report index page, parses for QC Report urls,
     * and returns a map of report names to promises of report text.
     * @url: string
     * @return: Map<string, Promise<string>>
     */
    const text = await fetchData(url)
    if(text === undefined) { return new Map<string, Promise<string>>() }

    const releases = getQCReportReleases(text)
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
    const promiseMap = new Map<string, Promise<string>>()
    keys.forEach((key, i) => promiseMap.set(key, values[i]))

    return promiseMap
}

function getReportNames(url: string = ""): string {
    /**
     * Extracts the report name from the url.
     * @url: string
     * @return: string
     */
    const nameRegex = /monarch-kg-dev\/(.*)\//
    const nameMatch = url.match(nameRegex)
    if (nameMatch === null) { return "" }
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

function getQCReportReleases (html: string): string[] {
    /**
     * Parses the QC report index page for QC report urls.
     * @html: string
     * @return: string[]
     */
    const elem = htmlToDom(html)
    const alist = elem.querySelectorAll('ul')[1]

    const urls: string[] = []
    alist.querySelectorAll('a').forEach(
        function(a: HTMLAnchorElement) {
            const href = a.getAttribute('href')
            if (typeof(href) === 'string') { urls.push(href) }
        }
    )
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
    return text;
}

function stringSetDiff(a: string[], b: string[]): string[] {
    /**
     * Returns the difference between two string arrays.
     * @a: string[]
     * @b: string[]
     * @return: string[]
     */
    const diff: string[] = a.filter(x => !b.includes(x));
    return diff
}

export async function fetchAllData() {
    /**
     * Fetches all the data and sets the globalData ref.
     * @return: void
     */
    const qcReports = await fetchQCReports(qcsite)

    // const latestText = testQCfetch.get('latest')
    // if (latestText === undefined) { return }
    const latest = await getQCReport(qcReports, 'latest')

    const danglingEdgesNamespaces = getNamespaces(latest.dangling_edges)
    const edgesNamespaces = getNamespaces(latest.edges)
    globalNamespaces.value = stringSetDiff(danglingEdgesNamespaces, edgesNamespaces)

    // const test = getTotalNumber(latest.dangling_edges)
    // const totalnumber = new Map<string, Map<string, number>>()
    // totalnumber.set("dangling_edges", getTotalNumber(latest.dangling_edges))
    // totalnumber.set("edges", getTotalNumber(latest.edges))
    // totalnumber.set("missing_nodes", getTotalNumber(latest.missing_nodes))
    // totalnumber.set("nodes", getTotalNumber(latest.nodes))
    // globalData.value = globalData.value.set("TotalNumbers", totalnumber)

    // globalTotals.value = getEdgesDifference(latest)
    danglingEdgesTotals.value = getTotalNumber(latest.dangling_edges, true)
    edgesTotals.value = getTotalNumber(latest.edges, true)
}

async function getQCReport(qcReports: Map<string, Promise<string>>, reportName: string): Promise<QCReport> {
    /**
     * Fetches the QC report and returns the parsed report.
     * @qcReports: Map<string, Promise<string>>
     * @reportName: string
     * @return: Promise<QCReport>
     */
    const reportText = await qcReports.get(reportName)
    if (reportText === undefined) { return <QCReport> {} }

    return <QCReport> YAML.parse(reportText)
}

// This should move to a utils file
// export function uniq(items: string[]) {
//     /**
//      * Returns the unique items in the array.
//      * @items: string[]
//      * @return: string[]
//      */
//     const result: string[] = []
//     for (const i of items) {
//         if (result.indexOf(i) < 0) result.push(i)
//     }
//     return result
// }

function getNamespaces(qcpart: QCPart[]): string[] {
    /**
     * Returns all namespaces in the QCPart.
     * @qcpart: QCPart[]
     * @return: string[]
     */
    if (qcpart === undefined) return []

    let allNamespaces: string[] = []
    for (const item of qcpart) {
        allNamespaces = allNamespaces.concat(item.namespaces)
    }
    return allNamespaces
}

function getTotalNumber(qcpart: QCPart[], addTotal: boolean = false): Map<string, number> {
    /**
     * Returns the total number of edges (or nodes) of each QCPart.
     * @qcpart: QCPart[]
     * @return: Map<string, number>
     */
    if (qcpart === undefined) return new Map<string, number>()
    let grandtotal = 0
    const totals = new Map<string, number>
    for (const item of qcpart) {
        totals.set(item.name, item.total_number)
        grandtotal += item.total_number
    }
    if (addTotal) totals.set("Total Number", grandtotal)
    return totals
}


// function getNames(qcparts: QCPart[]): string[] {
//     /**
//      * Returns the provided_by name of the QCParts.
//      * @qcparts: QCPart[]
//      * @return: string[]
//      */
//     const names: string[] = []
//     for (const qcpart of qcparts) {
//         names.push(qcpart.name)
//     }
//     return names
// }

// function getQCPartbyName(qcparts: QCPart[], name: string): QCPart | undefined {
//     /**
//      * Returns the QCPart with the provided name.
//      * @qcparts: QCPart[]
//      * @name: string
//      * @return: QCPart | undefined
//      */
//     for (const qcpart of qcparts) {
//         if (qcpart.name == name) { return qcpart }
//     }
//     return undefined
// }

// function cleanNumber(n: number | undefined): number {
//     /**
//      * Returns 0 if the number is undefined.
//      * @n: number | undefined
//      * @return: number
//      */
//     return (typeof n === 'undefined') ? 0 : n;
// }

// function visualDiff(a: number | undefined, b: number | undefined): string {
//     /**
//      * Returns a visual representation of the ratio of a to a+b.
//      * @a: number | undefined
//      * @b: number | undefined
//      * @return: string
//      */
//     const filled = "⚫"
//     const unfilled = "⚪"
//     const ratio = Math.floor(cleanNumber(a) / (cleanNumber(a) + cleanNumber(b)) * 10)
//     const visualRatio: string = filled.repeat(ratio).concat(unfilled.repeat(10 - ratio))
//     return visualRatio
// }

// function getEdgesDifference(qcreport: QCReport): Map<string, string> {
//     /**
//      * Returns the difference between the dangling edges and the edges.
//      * @qcreport: QCReport
//      * @return: Map<string, string>
//      */
//     const names = uniq(getNames(qcreport.dangling_edges).concat(getNames(qcreport.edges)))
//     const edge_diff = new Map<string, string>
//     for (const name of names) {
//         const dangling_edges_total = getQCPartbyName(qcreport.dangling_edges, name)?.total_number
//         const edges_total = getQCPartbyName(qcreport.edges, name)?.total_number
//         const diff = visualDiff(edges_total, dangling_edges_total)
//         edge_diff.set(name, diff)
//     }
//     return edge_diff
// }