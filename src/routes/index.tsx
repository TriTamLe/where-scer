import { createFileRoute } from '@tanstack/react-router'

import { WorldMap } from '#/components/world-map.tsx'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <main className="grid min-h-dvh p-2 sm:p-4 md:p-6">
      <WorldMap />
    </main>
  )
}
