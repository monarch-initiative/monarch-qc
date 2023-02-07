import { ref } from "vue";
import YAML from "yaml";
import DOMPurify from 'isomorphic-dompurify';

export const globalData = ref<Map<string, any>>(new Map())
export const globalTotals = ref<Map<string, string>>(new Map())
export const globalNamespaces = ref<Array<string>>([])


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
    const cleanhtml = DOMPurify.sanitize(html);
    let elem = document.createElement("div");
    elem.innerHTML = cleanhtml;
    return elem
}

async function fetchQCReports (url = ""): Promise<Map<string, Promise<string>>> {
    const text = await fetchData(url)
    if(text === undefined) { return new Map<string, Promise<string>>() }

    const releases = getQCReportReleases(text)
    const reports = getQCReports(releases)
    return reports
}

function zipPromiseMap(keys: string[], values: Promise<string>[]): Map<string, Promise<string>> {
    const promiseMap = new Map<string, Promise<string>>()
    keys.forEach((key, i) => promiseMap.set(key, values[i]))

    return promiseMap
}

function getReportNames(url: string = ""): string {
    const nameRegex = /monarch-kg-dev\/(.*)\//
    const nameMatch = url.match(nameRegex)
    if (nameMatch === null) { return "" }
    return nameMatch[1]
}

async function getQCReports(urls: string[] = [""]): Promise<Map<string, Promise<string>>> {
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
    const response = await fetch(url)
    const text = await response.text()
    return text;
}

function stringSetDiff(a: string[], b: string[]): string[] {
    const diff: string[] = a.filter(x => !b.includes(x));
    return diff
}

export async function fetchAllData() {
    const testQCfetch = await fetchQCReports(qcsite)

    const latestText = testQCfetch.get('latest')
    if (latestText === undefined) { return }
    const latest = getQCReport((await latestText).valueOf())
    // const latest_new = getQCReport_new(testQCfetch, 'latest')

    const danglingEdgesNamespaces = getNamespaces(latest.dangling_edges)
    const edgesNamespaces = getNamespaces(latest.edges)
    globalNamespaces.value = stringSetDiff(danglingEdgesNamespaces, edgesNamespaces)

    const test = getTotalNumber(latest.dangling_edges)
    const totalnumber = new Map<string, Map<string, number>>()
    totalnumber.set("dangling_edges", getTotalNumber(latest.dangling_edges))
    totalnumber.set("edges", getTotalNumber(latest.edges))
    totalnumber.set("missing_nodes", getTotalNumber(latest.missing_nodes))
    totalnumber.set("nodes", getTotalNumber(latest.nodes))
    globalData.value = globalData.value.set("TotalNumbers", totalnumber)

    globalTotals.value = getEdgesDifference(latest)
}

function getQCReport(text: string): QCReport {
    const report = YAML.parse(text)
    const qc_report = <QCReport> report
    return qc_report
}

// async function getQCReport_new(qcReports: Map<string, Promise<string>>, reportName: string): Promise<QCReport> {
//     const reportResult = await qcReports.get(reportName)
//     if (reportResult === undefined) { return <QCReport> {} }
//     const reportText = reportResult
//     const report = YAML.parse(text)
//     const qc_report = <QCReport> report

//     return qc_report
// }

function uniq(items: string[]) {
    const result: string[] = []
    for (const i of items) {
        if (result.indexOf(i) < 0) result.push(i)
    }
    return result
}

// function getNamespaces(qcpart: QCPart[]): Map<string, string[]> {
function getNamespaces(qcpart: QCPart[]): string[] {
    // if (qcpart === undefined) return new Map<string, []>()
    if (qcpart === undefined) return []

    let allNamespaces: string[] = []
    // const namespacesMap = new Map<string, string[]>()
    for (const item of qcpart) {
        // namespacesMap.set(item.name, item.namespaces)
        allNamespaces = allNamespaces.concat(item.namespaces)
    }
    // namespacesMap.set("all_namespaces", uniq(allNamespaces))
    // return namespacesMap
    return allNamespaces
}

function getTotalNumber(qcpart: QCPart[]) {
    if (qcpart === undefined) return new Map<string, number>()
    let grandtotal = 0
    const totals = new Map<string, number>
    for (const item of qcpart) {
        totals.set(item.name, item.total_number)
        grandtotal += item.total_number
    }
    totals.set("Total Number", grandtotal)
    return totals
}


function getNames(qcparts: QCPart[]): string[] {
    const names: string[] = []
    for (const qcpart of qcparts) {
        names.push(qcpart.name)
    }
    return names
}

function getQCPartbyName(qcparts: QCPart[], name: string): QCPart | undefined {
    for (const qcpart of qcparts) {
        if (qcpart.name == name) { return qcpart }
    }
    return undefined
}

function cleanNumber(n: number | undefined): number {
    return (typeof n === 'undefined') ? 0 : n;
}

function visualDiff(a: number | undefined, b: number | undefined): string {
    const filled = "⚫"
    const unfilled = "⚪"
    const ratio = Math.floor(cleanNumber(a) / (cleanNumber(a) + cleanNumber(b)) * 10)
    const visualRatio: string = filled.repeat(ratio).concat(unfilled.repeat(10 - ratio))
    // console.log(visualRatio)
    return visualRatio
}

function getEdgesDifference(qcreport: QCReport): Map<string, string> {
    const names = uniq(getNames(qcreport.dangling_edges).concat(getNames(qcreport.edges)))
    // console.log(names)
    const edge_diff = new Map<string, string>
    for (const name of names) {
        const dangling_edges_total = getQCPartbyName(qcreport.dangling_edges, name)?.total_number
        const edges_total = getQCPartbyName(qcreport.edges, name)?.total_number
        const diff = visualDiff(edges_total, dangling_edges_total)
        // console.log(name)
        edge_diff.set(name, diff)
    }
    return edge_diff
}