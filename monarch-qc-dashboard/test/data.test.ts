import { readFileSync } from "fs"
import { describe, expect, test } from "vitest"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

import { updateData, fetchQCReports, globalReports } from "../src/data"

function createRequestHandler(url: string) {
  const mockPath = url.replace("https://data.monarchinitiative.org/", "test/mock_http/")
  const mockFilePath = mockPath + (url.endsWith("/") ? "index.html" : "")
  return createHTTPGet(url, mockFilePath)
}

function createHTTPGet(url: string, path: string) {
  return http.get(url, () => {
    const mock_text = readFileSync(path, "utf-8")
    return HttpResponse.text(mock_text)
  })
}

const urls = [
  "https://data.monarchinitiative.org/monarch-kg-dev/",
  "https://data.monarchinitiative.org/monarch-kg-dev/2022-02-10/index.html",
  "https://data.monarchinitiative.org/monarch-kg-dev/2023-04-02/index.html",
  "https://data.monarchinitiative.org/monarch-kg-dev/2023-04-02/qc_report.yaml",
  "https://data.monarchinitiative.org/monarch-kg-dev/2023-10-28/index.html",
  "https://data.monarchinitiative.org/monarch-kg-dev/2023-10-28/qc_report.yaml",
  "https://data.monarchinitiative.org/monarch-kg-dev/kgx/index.html",
  "https://data.monarchinitiative.org/monarch-kg-dev/latest/index.html",
  "https://data.monarchinitiative.org/monarch-kg-dev/latest/qc_report.yaml",
]

const handlers = urls.map(createRequestHandler)
const server = setupServer(...handlers)
server.listen({ onUnhandledRequest: "error" })

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
})

describe("fetchQCReports tests", () => {
  // @vitest-environment jsdom
  test("fetchQCReports undefined", async () => {
    const reports = await fetchQCReports(undefined)
    expect(reports).toEqual(new Map())
  })

  test("fetchQCReports deep structure test", async () => {
    const response = await fetch("https://data.monarchinitiative.org/monarch-kg-dev/")
    const reports = await fetchQCReports(await response.text())
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
