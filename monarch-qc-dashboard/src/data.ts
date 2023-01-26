import { ref } from "vue";
import YAML from "yaml";
import DOMPurify from 'isomorphic-dompurify';

export const globalData = ref<string>("")
export const allNamespaces = ref<Array<string>>([])

export const QCReportData = {

    data() {
        return {
            
        }
    }
}


export interface QCReport {
    dangling_edges: [];
    edges: [];
    missing_nodes: [];
    nodes: [];
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
const files = ["https://data.monarchinitiative.org/monarch-kg-dev/latest/qc_report.yaml"];


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
    const allreports = results.map(processReport)
    console.log(allreports)
    allNamespaces.value = getNamespaces(allreports[allreports.length -1].dangling_edges)
}


export function processReport(text: string) {
    const report = YAML.parse(text)
    const qc_report = <QCReport> report
    // console.log(qc_report)
    // allNamespaces.value = getNamespaces(qc_report.dangling_edges)
    // getTotalNumber(qc_report.dangling_edges)
    // getTotalNumber(qc_report.edges)
    return qc_report
}


export function uniq(items: string[]) {
    const result: string[] = []
    for (const i of items) {
        if (result.indexOf(i) < 0) result.push(i)
    }
    return result
}


export function getNamespaces(report_part: QCPart[]) {
    // console.log(report_part)
    let namespaces: string[] = []
    for (const item of report_part) {
        namespaces = namespaces.concat(item.namespaces)
    }
    return uniq(namespaces)
}

export function getTotalNumber(report_part: QCPart[]) {
    const totals = new Map<string, number>
    for (const item of report_part) {
        totals.set(item.name, item.total_number)
    }
    // console.log(totals)
}
