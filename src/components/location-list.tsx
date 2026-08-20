import { Search } from 'lucide-react'
import { numericToAlpha2 } from 'i18n-iso-countries'
import { useEffect, useMemo, useState } from 'react'

import { Input } from '#/components/ui/input.tsx'
import { WORLD_LOCATIONS } from '#/components/world-map.tsx'

type LocationType = 'country' | 'province' | 'ward'
type CheckinGroup = { code: string; count: number; nicknames: string[] }
type LocationOption = { code: string; name: string }

const GEOJSON_URLS: Record<Exclude<LocationType, 'country'>, string> = {
  province: '/data/administrative-maps/vietnam-provinces.geojson',
  ward: '/data/administrative-maps/da-nang-wards.geojson'
}
const PLAYER_NAME_COLORS = [
  'var(--secondary-strong)',
  'var(--accent-strong)',
  'var(--success)',
  'var(--primary-strong)'
] as const

function countryFlag(code: string) {
  const alpha2 = numericToAlpha2(code.padStart(3, '0'))
  return alpha2
    ? [...alpha2]
        .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
        .join('')
    : null
}

function nicknameColor(nickname: string) {
  const hash = [...nickname].reduce(
    (total, character) => (total * 31 + character.codePointAt(0)!) >>> 0,
    0
  )
  return PLAYER_NAME_COLORS[hash % PLAYER_NAME_COLORS.length]
}

function useLocationOptions(type: LocationType) {
  const [options, setOptions] = useState<LocationOption[]>(
    type === 'country' ? WORLD_LOCATIONS : []
  )

  useEffect(() => {
    if (type === 'country') {
      setOptions(WORLD_LOCATIONS)
      return
    }
    let cancelled = false
    fetch(GEOJSON_URLS[type])
      .then(async (response) => response.json())
      .then((data) => {
        if (!cancelled && isAdministrativeFeatureCollection(data)) {
          setOptions(
            data.features.map((feature) => ({
              code: feature.properties.code,
              name: feature.properties.fullName
            }))
          )
        }
      })
      .catch(() => !cancelled && setOptions([]))
    return () => {
      cancelled = true
    }
  }, [type])

  return options
}

function isAdministrativeFeatureCollection(value: unknown): value is {
  features: Array<{ properties: { code: string; fullName: string } }>
} {
  if (!value || typeof value !== 'object' || !('features' in value)) {
    return false
  }

  return (
    Array.isArray(value.features) &&
    value.features.every((feature) => {
      if (
        !feature ||
        typeof feature !== 'object' ||
        !('properties' in feature)
      ) {
        return false
      }

      const { properties } = feature
      return (
        Boolean(properties) &&
        typeof properties === 'object' &&
        'code' in properties &&
        'fullName' in properties &&
        typeof properties.code === 'string' &&
        typeof properties.fullName === 'string'
      )
    })
  )
}

function LocationList({
  groups,
  selected,
  type
}: {
  groups: CheckinGroup[]
  selected: readonly string[]
  type: LocationType
}) {
  const [search, setSearch] = useState('')
  const options = useLocationOptions(type)
  const groupByCode = useMemo(
    () => new Map(groups.map((group) => [group.code, group])),
    [groups]
  )
  const normalizedSearch = search.trim().toLocaleLowerCase('vi')
  const rows = useMemo(
    () =>
      options
        .filter(
          (option) =>
            option.name.toLocaleLowerCase('vi').includes(normalizedSearch) ||
            option.code.includes(normalizedSearch)
        )
        .sort((left, right) => {
          const leftIsSelected = selected.includes(left.code)
          const rightIsSelected = selected.includes(right.code)

          if (leftIsSelected !== rightIsSelected) {
            return Number(rightIsSelected) - Number(leftIsSelected)
          }

          if (!leftIsSelected) {
            const countDifference =
              (groupByCode.get(right.code)?.count ?? 0) -
              (groupByCode.get(left.code)?.count ?? 0)
            if (countDifference !== 0) {
              return countDifference
            }
          }

          return left.name.localeCompare(right.name, 'vi')
        }),
    [groupByCode, normalizedSearch, options, selected]
  )

  return (
    <aside
      className="h-fit border-t border-divider pt-6 xl:flex xl:h-[42rem] xl:w-88 xl:shrink-0 xl:flex-col xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0"
      aria-label="Danh sách check-in"
    >
      <h2 className="text-lg font-semibold">Danh sách địa điểm</h2>
      <label className="relative mt-3 block">
        <span className="sr-only">Tìm địa điểm</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
        />
        <Input
          className="pl-10"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm địa điểm hoặc mã…"
        />
      </label>
      <ul className="mt-4 max-h-136 overflow-y-auto pr-1 xl:min-h-0 xl:max-h-none xl:flex-1">
        {rows.map((option) => {
          const group = groupByCode.get(option.code)
          const isSelected = selected.includes(option.code)
          const flag = type === 'country' ? countryFlag(option.code) : null
          return (
            <li
              key={option.code}
              className={
                isSelected
                  ? 'border-l-2 border-primary bg-primary-soft px-3 py-3'
                  : 'py-3'
              }
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">
                  {flag ? (
                    <span aria-hidden="true" className="mr-2">
                      {flag}
                    </span>
                  ) : null}
                  {option.name}
                </p>
                {isSelected ? (
                  <span className="shrink-0 text-xs font-semibold text-primary-strong">
                    Bạn đã chọn
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {option.code} · {group?.count ?? 0} SC-er
                {(group?.count ?? 0) === 1 ? '' : 's'}
              </p>
              {group?.nicknames.length ? (
                <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm">
                  {group.nicknames.map((nickname) => (
                    <span
                      key={nickname}
                      style={{ color: nicknameColor(nickname) }}
                    >
                      {nickname}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

export { LocationList }
