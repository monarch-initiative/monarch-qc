import { readFileSync } from "fs"
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

import { fetchQCReports } from "../src/data"

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
]

const handlers = urls.map(createRequestHandler)
const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe("fetchAllData tests", () => {
  test("fetchAllData empty QCPart", () => {
    expect(true).toBe(true)
  })
})

describe("fetchQCReports tests", () => {
  // @vitest-environment jsdom
  test("fetchQCReports", async () => {
    const url = "https://data.monarchinitiative.org/monarch-kg-dev/"
    expect(url).toEqual("https://data.monarchinitiative.org/monarch-kg-dev/")
    const response = await fetch(url)
    const text = await response.text()
    const QCReports = await fetchQCReports(text)
    expect(QCReports).toEqual(
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
    expect(await QCReports.get("2022-02-10")).toEqual(undefined)
    expect(await QCReports.get("2023-04-02")).toEqual(
      readFileSync("test/mock_http/monarch-kg-dev/2023-04-02/qc_report.yaml", "utf-8")
    )
    expect(await QCReports.get("2023-10-28")).toEqual(
      readFileSync("test/mock_http/monarch-kg-dev/2023-10-28/qc_report.yaml", "utf-8")
    )
    expect(await QCReports.get("latest")).toEqual(
      readFileSync("test/mock_http/monarch-kg-dev/2023-10-28/qc_report.yaml", "utf-8")
    )
  })
})
