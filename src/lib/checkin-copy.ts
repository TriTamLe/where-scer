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

  const namedPeople = joinPeople(otherPeople)
  if (selected) {
    return namedPeople
      ? `Bạn và ${namedPeople} đã đến ${locationKind} này`
      : `Bạn đã đến ${locationKind} này`
  }

  return namedPeople
    ? `${namedPeople} đã đến ${locationKind} này`
    : `${count} SC-er đã đến ${locationKind} này`
}

export { formatCheckinMessage }
