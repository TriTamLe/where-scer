type MapProps = {
  activeFill: string
  activeStroke: string
  activeStrokeWidth: number
  activeValues: readonly string[]
  defaultFill: string
  defaultStroke: string
  defaultStrokeWidth: number
  onChange: (nextActiveValues: string[]) => void
}

export type { MapProps }
