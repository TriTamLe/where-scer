type CheckinMessageOptions = {
  count: number
  locationKind: string
  otherPeople: readonly string[]
  selected: boolean
}

function joinPeople(people: readonly string[]) {
  if (people.length < 2) return people[0] ?? ''
  if (people.length === 2) return `${people[0]} và ${people[1]}`
  return `${people.slice(0, -1).join(', ')} và ${people.at(-1)}`
}

function formatCheckinMessage({
  count,
  locationKind,
  otherPeople,
  selected
}: CheckinMessageOptions) {
  if (count === 0) return `Chưa có SC-er nào check-in ở ${locationKind} này`

  const people = otherPeople.slice(0, 2)
  const namedPeople = joinPeople(people)
  const namedCount = people.length + (selected ? 1 : 0)
  const remainingCount = Math.max(0, count - namedCount)
  const subject = selected
    ? namedPeople
      ? `Bạn, ${namedPeople}`
      : 'Bạn'
    : namedPeople
      ? namedPeople
      : ''

  if (!subject) return `${count} SC-er đã đến ${locationKind} này`
  if (remainingCount > 0) {
    return `${subject} và ${remainingCount} SC-er khác đã đến ${locationKind} này`
  }
  return `${subject} đã đến ${locationKind} này`
}

export { formatCheckinMessage }
