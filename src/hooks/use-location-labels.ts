import { useEffect, useMemo, useState } from 'react'

import { WORLD_LOCATIONS } from '#/components/world-map.tsx'

type CheckinType = 'country' | 'province' | 'ward'
type CheckinLocation = { code: string; type: CheckinType }
type AdministrativeFeatureCollection = {
  features: Array<{ properties: { code: string; fullName: string } }>
}

const ADMINISTRATIVE_MAPS = {
  province: '/data/administrative-maps/vietnam-provinces.geojson',
  ward: '/data/administrative-maps/da-nang-wards.geojson'
} as const

function useLocationLabels() {
  const [administrativeLabels, setAdministrativeLabels] = useState<
    Readonly<Record<string, string>>
  >({})

  useEffect(() => {
    let cancelled = false

    Promise.all(
      Object.values(ADMINISTRATIVE_MAPS).map(
        async (url): Promise<AdministrativeFeatureCollection> => {
          const response = await fetch(url)
          if (!response.ok) throw new Error('Không thể tải dữ liệu địa điểm.')
          return await response.json()
        }
      )
    )
      .then((collections) => {
        if (cancelled) return
        setAdministrativeLabels(
          Object.fromEntries(
            collections.flatMap((collection) =>
              collection.features.map((feature) => [
                feature.properties.code,
                feature.properties.fullName
              ])
            )
          )
        )
      })
      .catch(() => {
        if (!cancelled) setAdministrativeLabels({})
      })

    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(() => {
    const countryLabels = Object.fromEntries(
      WORLD_LOCATIONS.map((country) => [country.code, country.name])
    )

    return (location: CheckinLocation) =>
      location.type === 'country'
        ? (countryLabels[location.code] ?? `Mã ${location.code}`)
        : (administrativeLabels[location.code] ?? `Mã ${location.code}`)
  }, [administrativeLabels])
}

export { useLocationLabels }
export type { CheckinLocation, CheckinType }
