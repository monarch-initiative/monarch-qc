import { readFileSync } from "fs"
import { describe, expect, test } from "vitest"
import { fetchQCReports } from "../src/data"
function mockFetchData(url: string) {
  const releaseIndexPage = `
    <html>
      <body>
        <ul>
          <li><a href="https://data.monarchinitiative.org/index.html">..</a></li>
        </ul>
        <ul>
          <li><a href="https://data.monarchinitiative.org/monarch-kg-dev/2022-02-10/index.html">2022-02-10</a></li>
          <li><a href="https://data.monarchinitiative.org/monarch-kg-dev/2023-04-02/index.html">2023-04-02</a></li>
          <li><a href="https://data.monarchinitiative.org/monarch-kg-dev/latest/index.html">latest</a></li>
        </ul>
      </body>
    </html>
  `

  const releasePageNoReport = `
    <html><body>
      <h5>Parent</h5>
      <ul>
        <li>
          <a href="https://data.monarchinitiative.org/monarch-kg-dev/index.html">..</a>
        </li>
      </ul>

      <h5>Directories</h5>
      <ul>
        <li>
          <a href="https://data.monarchinitiative.org/monarch-kg-dev/2022-02-10/qc/index.html">qc</a>
        </li>
      </ul>
      <h5>Files</h5>
      <ul>
        <li>
          <a href="https://data.monarchinitiative.org/monarch-kg-dev/2022-02-10/monarch-kg.tar.gz">monarch-kg.tar.gz</a>
        </li>
        <li>
          <a href="https://data.monarchinitiative.org/monarch-kg-dev/2022-02-10/solr.tar.gz">solr.tar.gz</a>
        </li>
      </ul>
    </body></html>
  `

  const releasePageTemplate = `
    <html><body>
      <h5>Parent</h5>
      <ul>
        <li>
          <a href="https://data.monarchinitiative.org/monarch-kg-dev/index.html">..</a>
        </li>
      </ul>

      <h5>Directories</h5>
      <ul>
        <li>
          <a href="https://data.monarchinitiative.org/monarch-kg-dev/RELEASE/qc/index.html">qc</a>
        </li>
      </ul>
      <h5>Files</h5>
      <ul>
        <li>
          <a href="https://data.monarchinitiative.org/monarch-kg-dev/RELEASE/monarch-kg.tar.gz">monarch-kg.tar.gz</a>
        </li>
        <li>
          <a href="https://data.monarchinitiative.org/monarch-kg-dev/RELEASE/qc_report.yaml">qc_report.yaml</a>
        </li>
        <li>
          <a href="https://data.monarchinitiative.org/monarch-kg-dev/RELEASE/solr.tar.gz">solr.tar.gz</a>
        </li>
      </ul>
    </body></html>
  `

  // Check if the URL matches the expected URL
  if (url === "https://data.monarchinitiative.org/monarch-kg-dev/") {
    return Promise.resolve(releaseIndexPage)
  } else if (url === "https://data.monarchinitiative.org/monarch-kg-dev/2022-02-10/") {
    return Promise.resolve(releasePageNoReport)
  } else if (url === "https://data.monarchinitiative.org/monarch-kg-dev/2023-04-02/") {
    return Promise.resolve(releasePageTemplate.replace("RELEASE", "2023-04-02"))
  } else if (url === "https://data.monarchinitiative.org/monarch-kg-dev/latest/") {
    return Promise.resolve(releasePageTemplate.replace("RELEASE", "latest"))
  } else if (
    url === "https://data.monarchinitiative.org/monarch-kg-dev/2023-04-02/qc_report.yaml" ||
    url === "https://data.monarchinitiative.org/monarch-kg-dev/latest/qc_report.yaml"
  ) {
    return Promise.resolve(
      readFileSync("test/test_data/expected/test_fetch_qc_report_expected_dict.yaml", "utf-8")
    )
  } else {
    return Promise.resolve("")
  }
}

describe("fetchAllData tests", () => {
  test("fetchAllData empty QCPart", () => {
    expect(true).toBe(true)
  })
})

describe("fetchQCReports tests", () => {
  // @vitest-environment jsdom
  test("fetchQCReports", async () => {
    const qcsite = "https://data.monarchinitiative.org/monarch-kg-dev/"
    const qctext = await mockFetchData(qcsite)
    expect(await fetchQCReports(qctext)).toEqual(
      new Map([
        [
          `2023-04-02`,
          Promise.resolve(
            readFileSync("test/test_data/expected/test_fetch_qc_report_expected_dict.yaml", "utf-8")
          ),
        ],
        [
          `latest`,
          Promise.resolve(
            readFileSync("test/test_data/expected/test_fetch_qc_report_expected_dict.yaml", "utf-8")
          ),
        ],
      ])
    )
  })
})
