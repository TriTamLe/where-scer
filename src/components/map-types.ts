type DensityFills = readonly [string, string, string, string]

type MapProps = {
  activeStroke: string
  activeStrokeWidth: number
  activeValues: readonly string[]
  densityFills: DensityFills
  defaultFill: string
  defaultStroke: string
  defaultStrokeWidth: number
  hoverFill: string
  onChange: (nextActiveValues: string[]) => void
  /** Nicknames of up to five other SC-ers who checked in at each location. */
  peopleByLocation: Readonly<Record<string, readonly string[]>>
  selectionCounts: Readonly<Record<string, number>>
}

export type { DensityFills, MapProps }
