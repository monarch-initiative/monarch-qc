import { readFileSync } from "fs"
import { describe, expect, test } from "vitest"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { mockFetch } from "./test_utils"

import { updateData, fetchQCReports, globalReports, globalStats } from "../src/data"

// function createRequestHandler(url: string) {
//   const mockPath = url.replace("https://data.monarchinitiative.org/", "test/mock_http/")
//   const mockFilePath = mockPath + (url.endsWith("/") ? "index.html" : "")
//   return createHTTPGet(url, mockFilePath)
// }

// function createHTTPGet(url: string, path: string) {
//   return http.get(url, () => {
//     const mock_text = readFileSync(path, "utf-8")
//     return HttpResponse.text(mock_text)
//   })
// }

// function createURLS(base: string, sub: string[], files: string[]) {
//   const urls: string[] = []
//   for (const s of sub) {
//     for (const f of files) {
//       urls.push(base + s + "/" + f)
//     }
//   }
//   return urls
// }

// const base_urls = [
//   "https://data.monarchinitiative.org/monarch-kg-dev/",
//   "https://data.monarchinitiative.org/monarch-kg-dev/2022-02-10/index.html",
//   "https://data.monarchinitiative.org/monarch-kg-dev/kgx/index.html",
// ]

// const dev_urls = createURLS(
//   "https://data.monarchinitiative.org/monarch-kg-dev/",
//   ["2023-04-02", "2023-10-28", "latest"],
//   ["index.html", "qc_report.yaml", "merged_graph_stats.yaml"]
// )

// const urls = base_urls.concat(dev_urls)
// const handlers = urls.map(createRequestHandler)
// const server = setupServer(...handlers)
// // server.listen({ onUnhandledRequest: "error" })
// server.listen({
//   onUnhandledRequest(req) {
//     throw new Error(`Unhandled request: ${req.method} ${req.url}`)
//   },
// })

mockFetch()

describe("fetchAllData tests", async () => {
  // @vitest-environment jsdom
  await updateData()
  test("fetchAllData globalReports", async () => {
    expect(globalReports.value).toEqual(
      new Map([
        [
          `2023-04-02`,
          Promise.resolve(
            readFileSync("test/mock_http/monarch-kg-dev/2023-04-02/qc_report.yaml", "utf-8")
          ),
        ],
        [
          `2023-10-28`,
          Promise.resolve(
            readFileSync("test/mock_http/monarch-kg-dev/2023-10-28/qc_report.yaml", "utf-8")
          ),
        ],
      ])
    )
    expect(await globalReports.value.get("2022-02-10")).toEqual(undefined)
    expect(await globalReports.value.get("latest")).toEqual(undefined)
    expect(await globalReports.value.get("2023-04-02")).toEqual(
      readFileSync("test/mock_http/monarch-kg-dev/2023-04-02/qc_report.yaml", "utf-8")
    )
    expect(await globalReports.value.get("2023-10-28")).toEqual(
      readFileSync("test/mock_http/monarch-kg-dev/2023-10-28/qc_report.yaml", "utf-8")
    )
  })
  test("fetchAllData globalStats", async () => {
    expect(globalStats.value).toEqual(
      new Map([
        [
          `2023-04-02`,
          Promise.resolve(
            readFileSync(
              "test/mock_http/monarch-kg-dev/2023-04-02/merged_graph_stats.yaml",
              "utf-8"
            )
          ),
        ],
        [
          `2023-10-28`,
          Promise.resolve(
            readFileSync(
              "test/mock_http/monarch-kg-dev/2023-10-28/merged_graph_stats.yaml",
              "utf-8"
            )
          ),
        ],
      ])
    )
    expect(await globalStats.value.get("2022-02-10")).toEqual(undefined)
    expect(await globalStats.value.get("latest")).toEqual(undefined)
    expect(await globalStats.value.get("2023-04-02")).toEqual(
      readFileSync("test/mock_http/monarch-kg-dev/2023-04-02/merged_graph_stats.yaml", "utf-8")
    )
    expect(await globalStats.value.get("2023-10-28")).toEqual(
      readFileSync("test/mock_http/monarch-kg-dev/2023-10-28/merged_graph_stats.yaml", "utf-8")
    )
  })
})

describe("fetchQCReports tests", () => {
  // @vitest-environment jsdom
  test("fetchQCReports undefined", async () => {
    const reports = await fetchQCReports(undefined, "")
    expect(reports).toEqual(new Map())
  })

  test("fetchQCReports deep structure test", async () => {
    const response = await fetch("https://data.monarchinitiative.org/monarch-kg-dev/")
    const reports = await fetchQCReports(await response.text(), "qc_report.yaml")
    expect(reports).toEqual(
      new Map([
        [
          `2023-04-02`,
          Promise.resolve(
            readFileSync("test/mock_http/monarch-kg-dev/2023-04-02/qc_report.yaml", "utf-8")
          ),
        ],
        [
          `2023-10-28`,
          Promise.resolve(
            readFileSync("test/mock_http/monarch-kg-dev/2023-10-28/qc_report.yaml", "utf-8")
          ),
        ],
        [
          `latest`,
          Promise.resolve(
            readFileSync("test/mock_http/monarch-kg-dev/2023-10-28/qc_report.yaml", "utf-8")
          ),
        ],
      ])
    )
    expect(await reports.get("2022-02-10")).toEqual(undefined)
    expect(await reports.get("2023-04-02")).toEqual(
      readFileSync("test/mock_http/monarch-kg-dev/2023-04-02/qc_report.yaml", "utf-8")
    )
    expect(await reports.get("2023-10-28")).toEqual(
      readFileSync("test/mock_http/monarch-kg-dev/2023-10-28/qc_report.yaml", "utf-8")
    )
    expect(await reports.get("latest")).toEqual(
      readFileSync("test/mock_http/monarch-kg-dev/2023-10-28/qc_report.yaml", "utf-8")
    )
  })
})
