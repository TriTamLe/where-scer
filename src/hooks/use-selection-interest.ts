import { useMemo } from 'react'

import type { DensityFills } from '#/components/map-types.ts'

type InterestLevel = 1 | 2 | 3 | 4
type SelectionInterest = {
  count: number
  level: InterestLevel | null
}
type UseSelectionInterestOptions = {
  selectionCounts: Readonly<Record<string, number>>
}

type DensityThresholds = {
  high: number
  low: number
  medium: number
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

function createDensityThresholds(
  positiveSelectionCounts: readonly number[]
): DensityThresholds | null {
  if (positiveSelectionCounts.length === 0) return null

  const sortedCounts = [...positiveSelectionCounts].sort((a, b) => a - b)
  const atPercentile = (percentile: number) =>
    sortedCounts[Math.ceil(sortedCounts.length * percentile) - 1] ?? 1
  const low = atPercentile(0.25)
  const medium = Math.max(low + 1, atPercentile(0.5))
  const high = Math.max(medium + 1, atPercentile(0.75))

  return { high, low, medium }
}

function classifySelectionCount(
  selectionCount: number,
  thresholds: DensityThresholds
): InterestLevel {
  if (selectionCount <= thresholds.low) return 1
  if (selectionCount <= thresholds.medium) return 2
  if (selectionCount <= thresholds.high) return 3
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
  selectionCounts
}: UseSelectionInterestOptions) {
  return useMemo(() => {
    const positiveSelectionCounts = Object.values(selectionCounts).filter(
      (count) => count > 0
    )
    const thresholds = createDensityThresholds(positiveSelectionCounts)

    function getInterest(value: string): SelectionInterest {
      const count = getSelectionCount(value, selectionCounts)
      return {
        count,
        level:
          count === 0 || !thresholds
            ? null
            : classifySelectionCount(count, thresholds)
      }
    }

    return {
      getInterest,
      totalSelections: calculateTotalSelections(selectionCounts)
    }
  }, [selectionCounts])
}

export {
  calculateTotalSelections,
  classifySelectionCount,
  createDensityThresholds,
  getInterestFill,
  getSelectionCount,
  useSelectionInterest
}
export type { InterestLevel, SelectionInterest }
