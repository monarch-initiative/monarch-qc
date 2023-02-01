import { ref } from "vue";
import YAML from "yaml";
import DOMPurify from 'isomorphic-dompurify';

export const globalData = ref<Map<string, any>>(new Map())
export const allNamespaces = ref<Array<string>>([])


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

function getQCReportURLs (html: string | undefined): string[] {
    const fileurls: string[] = []
    if (html === undefined) { return fileurls }

    const elem = htmlToDom(html)
    const dirlist = elem.querySelectorAll('ul')[1]
    dirlist.querySelectorAll('a').forEach(
        function(a: HTMLAnchorElement) {
            const href = a.getAttribute('href')?.replace("index.html", "qc_report.yaml")
            // Use this to remove 'latest' and 'kgx' directories but we probably can just leave them
            // if (!href?.includes('latest') && !href?.includes('kgx') && typeof(href) === 'string') qcfiles.push(href)
            if (typeof(href) === 'string') { fileurls.push(href) }
        }
    )
    return fileurls
}


async function fetchData(url = ""): Promise<string | undefined> {
    const response = await fetch(url)
    .then(function(response){
        if (!response.ok && response.status === 404) {
            return undefined
        }
        return response
    })
    // console.log(response)
    const text = await response?.text();
    // const parsed = await YAML.parse(text);
    return text;
}

function dropMissing(a: (string | undefined)[]): string[] {
    const result: string[] = []
    for (const element of a) {
        if (element !== undefined) {result.push(element)}
    }
    return result
}


export async function fetchAllData() {
    const qcsitehtml = await fetchData(qcsite)
    const qcsiteurls = getQCReportURLs(qcsitehtml)
    const qcpromises = qcsiteurls.map(fetchData)
    const allresults = await Promise.all(qcpromises)
    const results = dropMissing(allresults)
    // Right now processing all of the reports is a little slow
    // I'm commenting the processing out for now so we can focus on the latest qc report
    // const allreports = results.map(getQCReport)
    const latest = getQCReport(results[results.length -1])

    // allNamespaces.value = getNamespaces(latest.dangling_edges)
    const namespacesMap = new Map<string, Map<string, string[]>>()
    namespacesMap.set("dangling_edges", getNamespaces(latest.dangling_edges))
    namespacesMap.set("edges", getNamespaces(latest.edges))
    namespacesMap.set("missing_nodes", getNamespaces(latest.missing_nodes))
    namespacesMap.set("nodes", getNamespaces(latest.nodes))
    console.log(namespacesMap)

    const totalnumber = new Map<string, Map<string, number>>()
    // totalnumber.set("dangling_edges", )
    globalData.value = globalData.value.set("Namespaces", namespacesMap)
    console.log(latest)
}


function getQCReport(text: string): QCReport {
    const report = YAML.parse(text)
    const qc_report = <QCReport> report
    return qc_report
}


function uniq(items: string[]) {
    const result: string[] = []
    for (const i of items) {
        if (result.indexOf(i) < 0) result.push(i)
    }
    return result
}

function getNamespaces(qcpart: QCPart[]): Map<string, string[]> {
    // console.log(qcpart)
    if (qcpart === undefined) return new Map<string, []>()

    let namespaces: string[] = []
    const namespacesMap = new Map<string, string[]>()
    for (const item of qcpart) {
        namespacesMap.set(item.name, item.namespaces)
        namespaces = namespaces.concat(item.namespaces)
    }
    namespacesMap.set("all_namespaces", uniq(namespaces))
    return namespacesMap
}

function getTotalNumber(report_part: QCPart[]) {
    const totals = new Map<string, number>
    for (const item of report_part) {
        totals.set(item.name, item.total_number)
    }
    // console.log(totals)
}
