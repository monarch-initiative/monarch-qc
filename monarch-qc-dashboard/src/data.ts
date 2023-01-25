import { ref } from "vue";
import YAML from "yaml";
import AXIOS, { AxiosError } from 'axios';
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


function fetchPage(url: string): Promise<string> {
  const HTMLData = AXIOS
    .get(url)
    .then(res => res.data)
    // .catch((error: AxiosError) => {
    //   console.error(`There was an error with ${error.config.url}.`);
    //   console.error(error.toJSON());
    // });

  return HTMLData;
}


function htmlToDom(html: string, ignoreCache = false) {
    const cleanhtml = DOMPurify.sanitize(html);
    let elem = document.createElement("div");
    elem.innerHTML = cleanhtml;
    return elem
}

function getQCReports (elem: HTMLDivElement) {
    const filelist = elem.querySelectorAll('ul')[1]
    const qcfiles: string[] = []
    filelist.querySelectorAll('a').forEach(
        function(a) {
            const href = a.getAttribute('href')?.replace("index.html", "qc_report.yaml")
            if (!href?.includes('latest') && !href?.includes('kgx') && typeof(href) === 'string') qcfiles.push(href)
        }
    )
    return qcfiles
}


async function fetchData(url = "") {
    const response = await fetch(url);
    console.log(response)
    const text = await response.text();
    const parsed = await YAML.parse(text);
    return parsed;
}


export async function fetchAllData() {
    const qcsitehtml = await fetchPage(qcsite)
    // console.log(qcsitehtml)
    const qcsitedom = htmlToDom(qcsitehtml)
    // console.log(qcsitedom)
    const qcsitefiles = getQCReports(qcsitedom)
    // console.log(qcsitefiles)
    const arrayofpromises = files.map(fetchData);
    // const arrayofpromises = qcsitefiles.map(fetchData);
    const allresults = await Promise.all(arrayofpromises);
    // console.log(allresults)
    globalData.value = allresults[0].toString();
    const allreports = allresults.map(processReport);
    console.log(allreports)
}


export function processReport(report: any) {
    const qc_report = <QCReport> report
    // console.log(qc_report)
    allNamespaces.value = getNamespaces(qc_report.dangling_edges)
    getTotalNumber(qc_report.dangling_edges)
    getTotalNumber(qc_report.edges)
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
