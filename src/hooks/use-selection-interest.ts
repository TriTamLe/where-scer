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
  activeValues: readonly string[]
  optionCount: number
  otherSelectionCounts: Readonly<Record<string, number>>
}

const RELATIVE_INTEREST_LEGEND_ITEMS: readonly InterestLegendItem[] = [
  { level: 1, label: 'Mức 1 · Thấp: dưới 0,75× trung bình' },
  { level: 2, label: 'Mức 2 · Trung bình: 0,75×–<1,25×' },
  { level: 3, label: 'Mức 3 · Cao: 1,25×–<1,75×' },
  { level: 4, label: 'Mức 4 · Rất cao: từ 1,75× trung bình' }
]

function getSelectionCount(
  value: string,
  activeValues: readonly string[],
  otherSelectionCounts: Readonly<Record<string, number>>
) {
  return (
    (otherSelectionCounts[value] ?? 0) + (activeValues.includes(value) ? 1 : 0)
  )
}

function calculateTotalSelections(
  activeValues: readonly string[],
  otherSelectionCounts: Readonly<Record<string, number>>
) {
  const otherSelections = Object.values(otherSelectionCounts).reduce(
    (total, count) => total + count,
    0
  )

  return otherSelections + new Set(activeValues).size
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
  activeValues,
  optionCount,
  otherSelectionCounts
}: UseSelectionInterestOptions) {
  return useMemo(() => {
    const totalSelections = calculateTotalSelections(
      activeValues,
      otherSelectionCounts
    )
    const averageSelectionsPerOption =
      optionCount > 0 ? totalSelections / optionCount : 0

    function getInterest(value: string): SelectionInterest {
      const count = getSelectionCount(value, activeValues, otherSelectionCounts)
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
      legendItems: RELATIVE_INTEREST_LEGEND_ITEMS,
      totalSelections
    }
  }, [activeValues, optionCount, otherSelectionCounts])
}

export {
  calculateRelativeInterest,
  calculateTotalSelections,
  classifyRelativeInterest,
  getInterestFill,
  getSelectionCount,
  RELATIVE_INTEREST_LEGEND_ITEMS,
  useSelectionInterest
}
export type { InterestLegendItem, InterestLevel, SelectionInterest }
