import { expect, test } from "vitest"
import * as qc_utils from "../src/qc_utils"

test("uniq empty array", () => {
  expect(qc_utils.uniq([])).toEqual([])
})

test("uniq remove duplicate", () => {
  expect(qc_utils.uniq(["a", "a"])).toEqual(["a"])
})

test("uniq remove duplicate non-consecutive", () => {
  expect(qc_utils.uniq(["a", "b", "a"])).toEqual(["a", "b"])
})

test("uniq remove duplicate out of order", () => {
  expect(qc_utils.uniq(["b", "a", "a"])).toEqual(["b", "a"])
})

test("uniq remove multiple duplicates out of order", () => {
  expect(qc_utils.uniq(["b", "a", "a", "c", "b"])).toEqual(["b", "a", "c"])
})
