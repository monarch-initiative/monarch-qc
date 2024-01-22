import { describe, expect, test } from "vitest"
import { mockFetch } from "../test_utils"
import { globalReports, selectedCompare, selectedReport, updateData } from "../../src/data"
import { fileReadPromise, uploadFile } from "../../src/components/UploadReport"

mockFetch()
const currentDate = new Date().toISOString().split("T")[0]

describe("uploadFile", async () => {
  // @vitest-environment jsdom
  await updateData()
  test("adds the file to the globalReports map", () => {
    const fileContents = [
      `
    dangling_edges:
    edges:
    nodes:
    `,
    ]
    const file = new File(fileContents, "file.txt", { type: "text/plain" })
    const selectedReportInitial = selectedReport.value
    uploadFile(file, currentDate)
    expect(globalReports.value.get(currentDate)).toEqual(Promise.resolve(""))
    expect(selectedCompare.value).toEqual(selectedReportInitial)
    expect(selectedReport.value).toEqual(currentDate)
  })
})

describe("fileReadPromise", () => {
  test("read the file onload", async () => {
    const fileContents = [
      `
    dangling_edges:
    edges:
    nodes:
    `,
    ]
    const file = new File(fileContents, "file.txt", { type: "text/plain" })
    const result = await fileReadPromise(file)
    expect(result).toEqual(`
    dangling_edges:
    edges:
    nodes:
    `)
  })
  // test("rejects on error", async () => {
  //   const errorMessage = "error reading file"
  //   const file = new File([], "test.txt", { type: "text/plain" })
  //   await expect(fileReadPromise(file)).rejects.toEqual(new Error(errorMessage))
  // })
})
