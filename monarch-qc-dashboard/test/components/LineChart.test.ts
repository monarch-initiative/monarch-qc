import { describe, expect, test } from "vitest"
import { getSeriesSortN } from "../../src/components/LineChart"

describe("getSeriesSortN", () => {
  test("returns the top n series by total number", () => {
    const series: { name: string; data: [Date, number][] }[] = [
      {
        name: "A",
        data: [
          [new Date("2021-01-01"), 1],
          [new Date("2021-01-02"), 2],
          [new Date("2021-01-03"), 3],
        ],
      },
      {
        name: "B",
        data: [
          [new Date("2021-01-01"), 2],
          [new Date("2021-01-02"), 3],
          [new Date("2021-01-03"), 4],
        ],
      },
      {
        name: "C",
        data: [
          [new Date("2021-01-01"), 3],
          [new Date("2021-01-02"), 4],
          [new Date("2021-01-03"), 5],
        ],
      },
    ]
    const sortedSeries = getSeriesSortN(series, Math.max, 2)
    expect(sortedSeries).toEqual([
      {
        name: "C",
        data: [
          [new Date("2021-01-01"), 3],
          [new Date("2021-01-02"), 4],
          [new Date("2021-01-03"), 5],
        ],
      },
      {
        name: "B",
        data: [
          [new Date("2021-01-01"), 2],
          [new Date("2021-01-02"), 3],
          [new Date("2021-01-03"), 4],
        ],
      },
    ])
  })
})
