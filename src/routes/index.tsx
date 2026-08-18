import { createFileRoute } from '@tanstack/react-router'

import { AdministrativeMap } from '#/components/administrative-map.tsx'
import { WorldMap } from '#/components/world-map.tsx'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <main className="mx-auto grid w-full max-w-[1800px] gap-6 p-2 sm:p-4 md:p-6">
      <WorldMap />
      <AdministrativeMap
        ariaLabel="Bản đồ hành chính Việt Nam gồm 34 tỉnh và thành phố"
        dataUrl="/data/administrative-maps/vietnam-provinces.geojson"
        description="Chọn một tỉnh hoặc thành phố để xem mã hành chính và diện tích."
        title="Bản đồ hành chính Việt Nam"
        variant="province"
      />
      <AdministrativeMap
        ariaLabel="Bản đồ hành chính Đà Nẵng gồm các phường và xã hiện hành"
        dataUrl="/data/administrative-maps/da-nang-wards.geojson"
        description="Phạm vi Đà Nẵng hiện hành sau sáp nhập. Chọn một phường hoặc xã để xem thông tin."
        title="Bản đồ hành chính Đà Nẵng"
        variant="ward"
      />
    </main>
  )
}
