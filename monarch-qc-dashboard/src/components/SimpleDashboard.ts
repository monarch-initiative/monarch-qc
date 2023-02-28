import { uniq } from "../utils";

export function getVisualDiffs(a: Map<string, number>, b: Map<string, number>): Map<string, string> {
/**
 * Returns a map of the differences between two maps.
 * @a: Map<string, number>
 * @b: Map<string, number>
 * @return: Map<string, string>
 */
const names = uniq([...b.keys(), ...a.keys()])
const edge_diff = new Map<string, string>
for (const name of names) {
    if (name == "Total Number") continue
    const diff = visualDiff(a.get(name) ?? 0, b.get(name) ?? 0)
    edge_diff.set(name, diff)
}
if (a.get("Total Number") !== undefined && b.get("Total Number") !== undefined) {
    const diff = visualDiff(a.get("Total Number") ?? 0, b.get("Total Number") ?? 0)
    edge_diff.set("-------------", "-------------")
    edge_diff.set("Total Number", diff)
}
return edge_diff
}

function visualDiff(a: number, b: number): string {
/**
 * Returns a visual representation of the ratio of a to a+b.
 * @a: number
 * @b: number
 * @return: string
 */
const filled = "⚫"
const unfilled = "⚪"
const ratio = Math.floor(a / (a + b) * 10)
// create a filled/unfilled circle representation of the ratio
// e.g. 3/7 = ⚫⚫⚫⚪⚪⚪⚪⚪⚪⚪
const visualRatio: string = filled.repeat(ratio).concat(unfilled.repeat(10 - ratio))
return visualRatio
}