import { ref } from "vue";
import YAML from "yaml";
//const jsyaml = require('js-yaml');
//const YAML = require('yaml')

export const globalData = ref<string>("")

const files = ["https://data.monarchinitiative.org/monarch-kg-dev/latest/qc_report.yaml"];
      
// fetch(file).then(data => data.text()).then(text=> {
//     console.log(text)

//     // let data = yamlparse(text);
//     // data = { kgversion: 1 }
//     // data.genes = data.genes.map(gene=> gene.id + "!")

//     globalData.value = text;
// })

async function fetchData(url = "") {
    const response = await fetch(url);
    const text = await response.text();
    const yaml = await YAML.parse(text);
    return yaml;
}


export async function fetchAllData() {
    const arrayofpromises = files.map(fetchData);
    const allresults = await Promise.all(arrayofpromises);
    // globalData.value = allresults[0].toString();
    console.log(allresults)
    const allreports = allresults.map(processReport);
}


export function processReport(report) {
    console.log(report)
    const dangling_namespaces = getNamespaces(report.dangling_edges)
    return report
}


export function getNamespaces(report_part) {
    console.log(report_part)
}
