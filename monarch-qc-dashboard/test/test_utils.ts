import { readFileSync } from "fs"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

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

function createURLS(base: string, sub: string[], files: string[]) {
  const urls: string[] = []
  for (const s of sub) {
    for (const f of files) {
      urls.push(base + s + "/" + f)
    }
  }
  return urls
}

const base_urls = [
  "https://data.monarchinitiative.org/monarch-kg-dev/",
  "https://data.monarchinitiative.org/monarch-kg-dev/2022-02-10/index.html",
  "https://data.monarchinitiative.org/monarch-kg-dev/kgx/index.html",
  "https://data.monarchinitiative.org/monarch-kg/2023-11-16/merged_graph_stats.yaml",
  "https://data.monarchinitiative.org/sri-reference-kg/sri-reference-kg-0.4.0/merged_graph_stats.yaml",
]

const dev_urls = createURLS(
  "https://data.monarchinitiative.org/monarch-kg-dev/",
  ["2023-04-02", "2023-10-28", "latest"],
  ["index.html", "qc_report.yaml", "merged_graph_stats.yaml"]
)

export function mockFetch() {
  const urls = base_urls.concat(dev_urls)
  const handlers = urls.map(createRequestHandler)
  const server = setupServer(...handlers)
  // server.listen({ onUnhandledRequest: "error" })
  server.listen({
    onUnhandledRequest(req) {
      throw new Error(`Unhandled request: ${req.method} ${req.url}`)
    },
  })
}
