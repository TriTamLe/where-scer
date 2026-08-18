import { AdministrativeMap } from '#/components/administrative-map.tsx'

import type { MapProps } from '#/components/map-types.ts'

function VietnamMap(props: MapProps) {
  return (
    <AdministrativeMap
      {...props}
      ariaLabel="Bản đồ hành chính Việt Nam gồm 34 tỉnh và thành phố"
      dataUrl="/data/administrative-maps/vietnam-provinces.geojson"
      description="Chọn một hoặc nhiều tỉnh, thành phố để xem mã hành chính và diện tích."
      title="Bản đồ hành chính Việt Nam"
      variant="province"
    />
  )
}

export { VietnamMap }
