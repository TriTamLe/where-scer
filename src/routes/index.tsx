import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { DanangMap } from '#/components/danang-map.tsx'
import { VietnamMap } from '#/components/vietnam-map.tsx'
import { WorldMap } from '#/components/world-map.tsx'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const [activeCountries, setActiveCountries] = useState<string[]>([])
  const [activeProvinces, setActiveProvinces] = useState<string[]>([])
  const [activeDanangWards, setActiveDanangWards] = useState<string[]>([])

  return (
    <main className="mx-auto grid w-full max-w-[1800px] gap-6 p-2 sm:p-4 md:p-6">
      <WorldMap
        activeFill="var(--primary)"
        activeStroke="var(--ring)"
        activeStrokeWidth={2}
        activeValues={activeCountries}
        defaultFill="var(--secondary-soft)"
        defaultStroke="var(--secondary-muted)"
        defaultStrokeWidth={1}
        onChange={setActiveCountries}
      />
      <VietnamMap
        activeFill="var(--primary)"
        activeStroke="var(--ring)"
        activeStrokeWidth={3}
        activeValues={activeProvinces}
        defaultFill="var(--secondary-soft)"
        defaultStroke="var(--border)"
        defaultStrokeWidth={1.7}
        onChange={setActiveProvinces}
      />
      <DanangMap
        activeFill="var(--primary)"
        activeStroke="var(--ring)"
        activeStrokeWidth={2.4}
        activeValues={activeDanangWards}
        defaultFill="var(--secondary-soft)"
        defaultStroke="var(--border)"
        defaultStrokeWidth={1.2}
        onChange={setActiveDanangWards}
      />
    </main>
  )
}
