import { describe, expect, test } from "vitest"
import { getVisualDiffs } from "../../src/components/SimpleDashboard"

describe("getVisualDiffs tests", () => {
  test("getVisualDiffs empty maps", () => {
    expect(getVisualDiffs(new Map(), new Map())).toEqual(new Map())
  })
})
