import type { DensityFills } from '#/components/map-types.ts'
import type { InterestLegendItem } from '#/hooks/use-selection-interest.ts'

function MapDensityLegend({
  densityFills,
  legendItems
}: {
  densityFills: DensityFills
  legendItems: readonly InterestLegendItem[]
}) {
  return (
    <div aria-label="Chú giải mật độ check-in" className="mt-4">
      <p className="text-sm font-semibold">Mật độ check-in</p>
      <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
        {legendItems.map(({ label, level }) => {
          const fill = densityFills[level - 1]

          return (
            <li className="flex items-center gap-2" key={label}>
              <span
                aria-hidden="true"
                className="size-4 shrink-0 rounded-sm border"
                style={{ backgroundColor: fill }}
              />
              <span>{label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { MapDensityLegend }
