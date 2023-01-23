import { ref } from "vue";
import yaml from "yaml";

export const globalData = ref<string>("")
export const allNamespaces = ref<Array<string>>([])


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


const files = ["https://data.monarchinitiative.org/monarch-kg-dev/latest/qc_report.yaml"];


async function fetchData(url = "") {
    const response = await fetch(url);
    const text = await response.text();
    const parsed = await yaml.parse(text);
    return parsed;
}


export async function fetchAllData() {
    const arrayofpromises = files.map(fetchData);
    const allresults = await Promise.all(arrayofpromises);
    console.log(allresults)
    globalData.value = allresults[0].toString();
    const allreports = allresults.map(processReport);
    console.log(allreports)
}


export function processReport(report: any) {
    const qc_report = <QCReport> report
    console.log(qc_report)
    getNamespaces(qc_report.dangling_edges)
    return qc_report
}


// export function uniq(arr: string[]) {
//     return arr.reduce(
//       function(a: string[], b: string){
//         if(a.indexOf(b)<0)a.push(b);
//         return a;
//       },[]);
// }


export function getNamespaces(report_part: any) {
    console.log(report_part)
    for (const item of report_part) {
        const qc_part = <QCPart> item
        // allNamespaces.value = uniq(allNamespaces.value.concat(item.namespaces))
        allNamespaces.value = allNamespaces.value.concat(item.namespaces)
    }
}
