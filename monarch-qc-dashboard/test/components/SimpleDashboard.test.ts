import { describe, expect, test } from "vitest"
import { getVisualDiffs } from "../../src/components/SimpleDashboard"

describe("getVisualDiffs tests", () => {
  test("getVisualDiffs empty maps", () => {
    expect(getVisualDiffs(new Map(), new Map())).toEqual(new Map())
  })
  test("getVisualDiffs empty map and non-empty map", () => {
    expect(getVisualDiffs(new Map([["a", 1]]), new Map())).toEqual(
      new Map([["a", "⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫"]])
    )
  })
  test("getVisualDiffs non-empty map and empty map", () => {
    expect(getVisualDiffs(new Map(), new Map([["a", 1]]))).toEqual(
      new Map([["a", "⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪"]])
    )
  })
  test("getVisualDiffs equal maps", () => {
    expect(getVisualDiffs(new Map([["a", 1]]), new Map([["a", 1]]))).toEqual(
      new Map([["a", "⚫⚫⚫⚫⚫⚪⚪⚪⚪⚪"]])
    )
  })
  test("getVisualDiffs equal maps out of order", () => {
    expect(
      getVisualDiffs(
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
        new Map([
          ["b", 2],
          ["a", 1],
        ])
      )
    ).toEqual(
      new Map([
        ["a", "⚫⚫⚫⚫⚫⚪⚪⚪⚪⚪"],
        ["b", "⚫⚫⚫⚫⚫⚪⚪⚪⚪⚪"],
      ])
    )
  })
  test("getVisualDiffs non-equal maps", () => {
    expect(getVisualDiffs(new Map([["a", 1]]), new Map([["b", 2]]))).toEqual(
      new Map([
        ["a", "⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫"],
        ["b", "⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪"],
      ])
    )
  })
  test("getVisualDiffs non-equal maps out of order", () => {
    expect(
      getVisualDiffs(
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
        new Map([
          ["b", 2],
          ["c", 3],
        ])
      )
    ).toEqual(
      new Map([
        ["a", "⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫"],
        ["b", "⚫⚫⚫⚫⚫⚪⚪⚪⚪⚪"],
        ["c", "⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪"],
      ])
    )
  })
  test("getVisualDiffs non-equal maps out of order with total number", () => {
    expect(
      getVisualDiffs(
        new Map([
          ["a", 1],
          ["b", 2],
          ["Total Number", 3],
        ]),
        new Map([
          ["b", 2],
          ["c", 3],
          ["Total Number", 5],
        ])
      )
    ).toEqual(
      new Map([
        ["a", "⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫"],
        ["b", "⚫⚫⚫⚫⚫⚪⚪⚪⚪⚪"],
        ["c", "⚪⚪⚪⚪⚪⚪⚪⚪⚪⚪"],
        ["-------------", "-------------"],
        ["Total Number", "⚫⚫⚫⚪⚪⚪⚪⚪⚪⚪"],
      ])
    )
  })
})
