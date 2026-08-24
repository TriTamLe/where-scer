type DensityFills = readonly [string, string, string, string]

type MapProps = {
  accountCode: string
  activeStroke: string
  activeStrokeWidth: number
  activeValues: readonly string[]
  densityFills: DensityFills
  defaultFill: string
  defaultStroke: string
  defaultStrokeWidth: number
  hoverFill: string
  onChange: (nextActiveValues: string[]) => void
  selectionCounts: Readonly<Record<string, number>>
}

export type { DensityFills, MapProps }
