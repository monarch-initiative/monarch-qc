import { describe, expect, test } from "vitest"
import {
  DashboardData,
  getAllVisualDiffs,
  getDataLabels,
  getNextField,
} from "../../src/components/SimpleDashboard"

describe("getAllVisualDiffs tests", () => {
  test("getAllVisualDiffs empty maps", () => {
    expect(getAllVisualDiffs({} as DashboardData)).toEqual(new Map())
  })
  test("getAllVisualDiffs undefined map", () => {
    expect(
      getAllVisualDiffs({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        x: { value: undefined, diff: undefined },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        y: { value: undefined, diff: undefined },
      })
    ).toEqual(new Map().set("x", new Map()))
  })
  test("getAllVisualDiffs empty map and non-empty map", () => {
    expect(
      getAllVisualDiffs({
        x: { value: new Map([["a", 1]]), diff: new Map() },
        y: { value: new Map(), diff: new Map() },
      })
    ).toEqual(new Map([["x", new Map([["a", "⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫"]])]]))
  })
  test("getAllVisualDiffs non-empty map and empty map", () => {
    expect(
      getAllVisualDiffs({
        x: { value: new Map(), diff: new Map() },
        y: { value: new Map([["a", 1]]), diff: new Map() },
      })
    ).toEqual(new Map([["x", new Map([["a", "⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪"]])]]))
  })
  test("getAllVisualDiffs equal maps", () => {
    expect(
      getAllVisualDiffs({
        x: { value: new Map([["a", 1]]), diff: new Map() },
        y: { value: new Map([["a", 1]]), diff: new Map() },
      })
    ).toEqual(new Map([["x", new Map([["a", "⚫⚫⚫⚫⚫⚪⚪⚪⚪⚪"]])]]))
  })
  test("getAllVisualDiffs equal maps out of order", () => {
    expect(
      getAllVisualDiffs({
        x: {
          value: new Map([
            ["a", 1],
            ["b", 2],
          ]),
          diff: new Map(),
        },
        y: {
          value: new Map([
            ["b", 2],
            ["a", 1],
          ]),
          diff: new Map(),
        },
      })
    ).toEqual(
      new Map([
        [
          "x",
          new Map([
            ["a", "⚫⚫⚫⚫⚫⚪⚪⚪⚪⚪"],
            ["b", "⚫⚫⚫⚫⚫⚪⚪⚪⚪⚪"],
          ]),
        ],
      ])
    )
  })
  test("getAllVisualDiffs non-equal maps", () => {
    expect(
      getAllVisualDiffs({
        x: { value: new Map([["a", 1]]), diff: new Map() },
        y: { value: new Map([["b", 2]]), diff: new Map() },
      })
    ).toEqual(
      new Map([
        [
          "x",
          new Map([
            ["a", "⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫"],
            ["b", "⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪"],
          ]),
        ],
      ])
    )
  })
  test("getAllVisualDiffs non-equal maps out of order", () => {
    expect(
      getAllVisualDiffs({
        x: {
          value: new Map([
            ["a", 1],
            ["b", 2],
          ]),
          diff: new Map(),
        },
        y: {
          value: new Map([
            ["b", 2],
            ["c", 3],
          ]),
          diff: new Map(),
        },
      })
    ).toEqual(
      new Map([
        [
          "x",
          new Map([
            ["a", "⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫"],
            ["b", "⚫⚫⚫⚫⚫⚪⚪⚪⚪⚪"],
            ["c", "⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪"],
          ]),
        ],
      ])
    )
  })
  test("getAllVisualDiffs non-equal maps out of order with total number", () => {
    expect(
      getAllVisualDiffs({
        x: {
          value: new Map([
            ["a", 1],
            ["b", 2],
            ["Total Number", 3],
          ]),
          diff: new Map(),
        },
        y: {
          value: new Map([
            ["b", 2],
            ["c", 3],
            ["Total Number", 5],
          ]),
          diff: new Map(),
        },
      })
    ).toEqual(
      new Map([
        [
          "x",
          new Map([
            ["a", "⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫"],
            ["b", "⚫⚫⚫⚫⚫⚪⚪⚪⚪⚪"],
            ["c", "⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪"],
            ["-------------", "-------------"],
            ["Total Number", "⚫⚫⚫⚪⚪⚪⚪⚪⚪⚪"],
          ]),
        ],
      ])
    )
  })
})

describe("getNextField tests", () => {
  test("getNextField empty data", () => {
    const data: DashboardData = {}
    expect(getNextField(0, data)).toEqual(null)
  })
  test("getNextField non-empty data", () => {
    const data: DashboardData = {
      x: { value: new Map([["a", 1]]), diff: new Map() },
    }
    expect(getNextField(0, data)).toEqual(null)
  })
  test("getNextField array of strings", () => {
    const data: Array<string> = ["a", "b"]
    expect(getNextField(0, data)).toEqual("b")
  })
  test("getNextField array of strings out of bounds", () => {
    const data: Array<string> = ["a", "b"]
    expect(getNextField(1, data)).toEqual(null)
  })
})

describe("getDataLabels tests", () => {
  test("getDataLabels empty data", () => {
    const data: DashboardData = {}
    expect(getDataLabels(data)).toEqual([])
  })
  test("getDataLabels non-empty data", () => {
    const data: DashboardData = {
      x: { value: new Map([["a", 1]]), diff: new Map() },
    }
    expect(getDataLabels(data)).toEqual(["a"])
  })
})
