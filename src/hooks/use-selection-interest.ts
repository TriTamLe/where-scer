import { useMemo } from 'react'

import type { DensityFills } from '#/components/map-types.ts'

type InterestLevel = 1 | 2 | 3 | 4
type SelectionInterest = {
  count: number
  level: InterestLevel | null
  lift: number
}
type InterestLegendItem = {
  label: string
  level: InterestLevel
}
type UseSelectionInterestOptions = {
  optionCount: number
  selectionCounts: Readonly<Record<string, number>>
}

function createLegendItems(averageSelectionsPerOption: number) {
  if (averageSelectionsPerOption === 0) {
    return [
      { level: 1, label: 'Mức 1 · Chưa có check-in' },
      { level: 2, label: 'Mức 2 · Chưa có check-in' },
      { level: 3, label: 'Mức 3 · Chưa có check-in' },
      { level: 4, label: 'Mức 4 · Chưa có check-in' }
    ] as const satisfies readonly InterestLegendItem[]
  }

  const low = formatCheckinCount(averageSelectionsPerOption * 0.75)
  const medium = formatCheckinCount(averageSelectionsPerOption * 1.25)
  const high = formatCheckinCount(averageSelectionsPerOption * 1.75)

  return [
    { level: 1, label: `Mức 1 · Dưới ${low} check-in` },
    { level: 2, label: `Mức 2 · ${low}–<${medium} check-in` },
    { level: 3, label: `Mức 3 · ${medium}–<${high} check-in` },
    { level: 4, label: `Mức 4 · Từ ${high} check-in` }
  ] as const satisfies readonly InterestLegendItem[]
}

function formatCheckinCount(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 1
  }).format(value)
}

function getSelectionCount(
  value: string,
  selectionCounts: Readonly<Record<string, number>>
) {
  return selectionCounts[value] ?? 0
}

function calculateTotalSelections(
  selectionCounts: Readonly<Record<string, number>>
) {
  return Object.values(selectionCounts).reduce(
    (total, count) => total + count,
    0
  )
}

function calculateRelativeInterest(
  selectionCount: number,
  optionCount: number,
  totalSelections: number
) {
  if (selectionCount <= 0 || optionCount <= 0 || totalSelections <= 0) return 0

  return (optionCount * selectionCount) / totalSelections
}

function classifyRelativeInterest(lift: number): InterestLevel {
  if (lift < 0.75) return 1
  if (lift < 1.25) return 2
  if (lift < 1.75) return 3
  return 4
}

function getInterestFill(
  interest: SelectionInterest,
  densityFills: DensityFills,
  defaultFill: string
) {
  return interest.level === null
    ? defaultFill
    : densityFills[interest.level - 1]
}

function useSelectionInterest({
  optionCount,
  selectionCounts
}: UseSelectionInterestOptions) {
  return useMemo(() => {
    const totalSelections = calculateTotalSelections(selectionCounts)
    const averageSelectionsPerOption =
      optionCount > 0 ? totalSelections / optionCount : 0

    function getInterest(value: string): SelectionInterest {
      const count = getSelectionCount(value, selectionCounts)
      const lift = calculateRelativeInterest(
        count,
        optionCount,
        totalSelections
      )

      return {
        count,
        level: count === 0 ? null : classifyRelativeInterest(lift),
        lift
      }
    }

    return {
      averageSelectionsPerOption,
      getInterest,
      legendItems: createLegendItems(averageSelectionsPerOption),
      totalSelections
    }
  }, [optionCount, selectionCounts])
}

export {
  calculateRelativeInterest,
  calculateTotalSelections,
  classifyRelativeInterest,
  getInterestFill,
  getSelectionCount,
  useSelectionInterest
}
export type { InterestLegendItem, InterestLevel, SelectionInterest }
