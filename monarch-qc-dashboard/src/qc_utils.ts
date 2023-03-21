export function uniq(items: string[]) {
  /**
   * Returns the unique items in the array.
   * @items: string[]
   * @return: string[]
   */
  const result: string[] = []
  for (const i of items) {
    if (result.indexOf(i) < 0) result.push(i)
  }
  return result
}
