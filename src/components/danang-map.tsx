import { AdministrativeMap } from '#/components/administrative-map.tsx'

import type { MapProps } from '#/components/map-types.ts'

function DanangMap(props: MapProps) {
  return (
    <AdministrativeMap
      {...props}
      ariaLabel="Bản đồ hành chính Đà Nẵng gồm các phường và xã hiện hành"
      dataUrl="/data/administrative-maps/da-nang-wards.geojson"
      description="Phạm vi Đà Nẵng hiện hành sau sáp nhập. Chọn một hoặc nhiều phường, xã để xem thông tin."
      title="Bản đồ hành chính Đà Nẵng"
      variant="ward"
    />
  )
}

export { DanangMap }
