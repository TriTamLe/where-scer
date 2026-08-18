import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import {
  DANANG_WARD_VALUES,
  VIETNAM_PROVINCE_VALUES
} from '#/data/administrative-map-values.ts'
import { DanangMap } from '#/components/danang-map.tsx'
import { VietnamMap } from '#/components/vietnam-map.tsx'
import { WORLD_MAP_VALUES, WorldMap } from '#/components/world-map.tsx'
import { createOtherSelectionCounts } from '#/lib/simulated-checkins.ts'

export const Route = createFileRoute('/')({ component: HomePage })

const SIMULATED_OTHER_MEMBER_COUNT = 400
const MAX_SIMULATED_CHOICES_PER_MEMBER = 3
const DENSITY_FILLS = [
  'var(--secondary-muted)',
  'var(--primary-muted)',
  'var(--accent-muted)',
  'var(--accent)'
] as const

function HomePage() {
  const [activeCountries, setActiveCountries] = useState<string[]>([])
  const [activeProvinces, setActiveProvinces] = useState<string[]>([])
  const [activeDanangWards, setActiveDanangWards] = useState<string[]>([])
  const [otherSelectionCounts] = useState(() => ({
    countries: createOtherSelectionCounts(
      WORLD_MAP_VALUES,
      SIMULATED_OTHER_MEMBER_COUNT,
      MAX_SIMULATED_CHOICES_PER_MEMBER
    ),
    provinces: createOtherSelectionCounts(
      VIETNAM_PROVINCE_VALUES,
      SIMULATED_OTHER_MEMBER_COUNT,
      MAX_SIMULATED_CHOICES_PER_MEMBER
    ),
    danangWards: createOtherSelectionCounts(
      DANANG_WARD_VALUES,
      SIMULATED_OTHER_MEMBER_COUNT,
      MAX_SIMULATED_CHOICES_PER_MEMBER
    )
  }))

  return (
    <main className="mx-auto grid w-full max-w-[1800px] gap-6 p-2 sm:p-4 md:p-6">
      <WorldMap
        activeStroke="var(--ring)"
        activeStrokeWidth={2}
        activeValues={activeCountries}
        densityFills={DENSITY_FILLS}
        defaultFill="var(--secondary-soft)"
        defaultStroke="var(--secondary-muted)"
        defaultStrokeWidth={1}
        onChange={setActiveCountries}
        otherSelectionCounts={otherSelectionCounts.countries}
      />
      <VietnamMap
        activeStroke="var(--ring)"
        activeStrokeWidth={3}
        activeValues={activeProvinces}
        densityFills={DENSITY_FILLS}
        defaultFill="var(--secondary-soft)"
        defaultStroke="var(--border)"
        defaultStrokeWidth={1.7}
        onChange={setActiveProvinces}
        otherSelectionCounts={otherSelectionCounts.provinces}
      />
      <DanangMap
        activeStroke="var(--ring)"
        activeStrokeWidth={2.4}
        activeValues={activeDanangWards}
        densityFills={DENSITY_FILLS}
        defaultFill="var(--secondary-soft)"
        defaultStroke="var(--border)"
        defaultStrokeWidth={1.2}
        onChange={setActiveDanangWards}
        otherSelectionCounts={otherSelectionCounts.danangWards}
      />
    </main>
  )
}
