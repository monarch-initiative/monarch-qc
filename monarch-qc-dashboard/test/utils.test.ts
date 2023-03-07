import { expect, test } from "vitest"
import { uniq } from "../src/utils"

test("uniq empty array", () => {
  expect(uniq([])).toEqual([])
})

test("uniq remove duplicate", () => {
  expect(uniq(["a", "a"])).toEqual(["a"])
})

test("uniq remove duplicate non-consecutive", () => {
  expect(uniq(["a", "b", "a"])).toEqual(["a", "b"])
})

test("uniq remove duplicate out of order", () => {
  expect(uniq(["b", "a", "a"])).toEqual(["b", "a"])
})

test("uniq remove multiple duplicates out of order", () => {
  expect(uniq(["b", "a", "a", "c", "b"])).toEqual(["b", "a", "c"])
})
