function createOtherSelectionCounts(
  values: readonly string[],
  memberCount: number,
  maximumChoicesPerMember: number
) {
  const counts: Record<string, number> = {}
  const choicesPerMember = Math.min(
    Math.max(Math.floor(maximumChoicesPerMember), 1),
    values.length
  )

  for (let memberIndex = 0; memberIndex < memberCount; memberIndex += 1) {
    const selections = new Set<string>()
    const selectionCount = Math.floor(Math.random() * choicesPerMember) + 1

    while (selections.size < selectionCount) {
      selections.add(values[Math.floor(Math.random() * values.length)])
    }

    for (const value of selections) {
      counts[value] = (counts[value] ?? 0) + 1
    }
  }

  return counts
}

export { createOtherSelectionCounts }
