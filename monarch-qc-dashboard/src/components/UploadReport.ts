import { globalReports, selectedCompare, selectedReport, processReports } from "../data"

export function uploadFile(file: File, name: string): void {
  globalReports.value.set(name, fileReadPromise(file))
  selectedCompare.value = selectedReport.value
  selectedReport.value = name
  processReports()
}

export function fileReadPromise(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsText(file, "UTF-8")
    reader.onload = (evt) => {
      if (evt.target) {
        resolve(evt.target.result as string)
      }
    }
    reader.onerror = (evt) => {
      reject(evt)
    }
  })
}
