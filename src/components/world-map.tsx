import { defineChart } from '@tanstack/charts'
import { geoShape } from '@tanstack/charts/geo'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/react-charts'
import { geoContains, geoEqualEarth, geoOrthographic } from 'd3-geo'
import type { GeoProjection } from 'd3-geo'
import { numericToAlpha2 } from 'i18n-iso-countries'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { feature } from 'topojson-client'
import type {
  GeometryCollection,
  Objects,
  Topology
} from 'topojson-specification'
import worldAtlas from 'world-atlas/countries-110m.json'

import type { MapProps } from '#/components/map-types.ts'

type CountryProperties = {
  name?: string
}

type WorldObjects = Objects<CountryProperties> & {
  countries: GeometryCollection<CountryProperties>
}

type Rotation = {
  latitude: number
  longitude: number
}

type ActiveProjection = {
  isGlobe: boolean
  projection: GeoProjection
}

const MOBILE_BREAKPOINT = '(min-width: 768px)'
const DRAG_THRESHOLD = 6
const SPHERE = { type: 'Sphere' } as const

const topology = worldAtlas as unknown as Topology<WorldObjects>
const countryCollection = feature<CountryProperties>(
  topology,
  topology.objects.countries
)

const countries = countryCollection.features.map((country) => ({
  ...country,
  properties: {
    flag: countryFlag(country.id),
    name: country.properties.name ?? 'Unknown country'
  }
}))
const countriesByChartKey = new Map(
  countries.map((country) => [
    `countries:${chartKey(country.id ?? country.properties.name)}`,
    country
  ])
)

function WorldMap({
  activeFill,
  activeStroke,
  activeStrokeWidth,
  activeValues,
  defaultFill,
  defaultStroke,
  defaultStrokeWidth,
  onChange
}: MapProps) {
  const isDesktop = useDesktopViewport()
  const [hoveredId, setHoveredId] = useState<string | number | undefined>()
  const [rotation, setRotation] = useState<Rotation>({
    latitude: -18,
    longitude: 0
  })
  const activeProjection = useRef<ActiveProjection | null>(null)
  const drag = useRef<{
    latitude: number
    longitude: number
    pointerId: number
    startX: number
    startY: number
  } | null>(null)
  const isDragging = useRef(false)
  const didDrag = useRef(false)
  const activeCountries = useMemo(
    () =>
      countries.filter(
        (country) =>
          country.id !== undefined && activeValues.includes(String(country.id))
      ),
    [activeValues]
  )

  const toggleActiveValue = useCallback(
    (value: string) => {
      onChange(
        activeValues.includes(value)
          ? activeValues.filter((activeValue) => activeValue !== value)
          : [...activeValues, value]
      )
    },
    [activeValues, onChange]
  )

  const chart = useMemo(
    () =>
      defineChart({
        marks: [
          geoShape(countries, {
            className:
              'world-map-countries [&_path]:transition-colors [&_path]:duration-200',
            id: 'countries',
            key: (country) => country.id ?? country.properties.name,
            projection: ({ chart: bounds }) => {
              const projection = isDesktop
                ? geoEqualEarth()
                : geoOrthographic()
                    .clipAngle(90)
                    .rotate([rotation.longitude, rotation.latitude])

              projection.fitExtent(
                [
                  [bounds.x + 12, bounds.y + 12],
                  [bounds.x + bounds.width - 12, bounds.y + bounds.height - 12]
                ],
                SPHERE
              )
              activeProjection.current = {
                isGlobe: !isDesktop,
                projection
              }

              return projection
            },
            fill: (country) =>
              country.id !== undefined &&
              activeValues.includes(String(country.id))
                ? activeFill
                : hoveredId !== undefined && country.id === hoveredId
                  ? defaultStroke
                  : defaultFill,
            stroke: (country) =>
              country.id !== undefined &&
              activeValues.includes(String(country.id))
                ? activeStroke
                : defaultStroke,
            strokeWidth: defaultStrokeWidth
          }),
          geoShape(activeCountries, {
            className: 'pointer-events-none',
            id: 'active-countries',
            key: (country) => country.id ?? country.properties.name,
            projection: ({ chart: bounds }) => {
              const projection = isDesktop
                ? geoEqualEarth()
                : geoOrthographic()
                    .clipAngle(90)
                    .rotate([rotation.longitude, rotation.latitude])

              projection.fitExtent(
                [
                  [bounds.x + 12, bounds.y + 12],
                  [bounds.x + bounds.width - 12, bounds.y + bounds.height - 12]
                ],
                SPHERE
              )

              return projection
            },
            fill: 'none',
            stroke: activeStroke,
            strokeWidth: activeStrokeWidth
          })
        ],
        x: null,
        y: null,
        guides: false,
        focus: {
          resolve: (points, { x, y }) => {
            const country = countryAtPointer(activeProjection.current, x, y)

            return country
              ? points.filter((point) => point.datum === country)
              : []
          },
          group: (_points, { point }) => [point],
          navigation: (points) => points
        },
        tooltip: {
          use: tooltip,
          className:
            'rounded-md border border-border bg-popover px-3 py-2 text-sm font-semibold text-popover-foreground shadow-md',
          format: (point) => {
            const { flag, name } = point.datum.properties
            return flag ? `${flag} ${name}` : name
          }
        }
      }),
    [
      activeFill,
      activeStroke,
      activeStrokeWidth,
      activeCountries,
      activeValues,
      defaultFill,
      defaultStroke,
      defaultStrokeWidth,
      hoveredId,
      isDesktop,
      rotation
    ]
  )

  const handleFocusChange = useCallback(
    (point: (typeof countries)[number] | null) => {
      if (!isDragging.current) setHoveredId(point?.id)
    },
    []
  )

  const handleSelect = useCallback(
    (point: (typeof countries)[number] | null) => {
      if (isDragging.current) return
      if (point?.id !== undefined) toggleActiveValue(String(point.id))
    },
    [toggleActiveValue]
  )

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (isDesktop) return

    drag.current = {
      latitude: rotation.latitude,
      longitude: rotation.longitude,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY
    }
    isDragging.current = false
    didDrag.current = false
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const dragState = drag.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    const deltaX = event.clientX - dragState.startX
    const deltaY = event.clientY - dragState.startY

    if (!isDragging.current) {
      if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return

      event.currentTarget.setPointerCapture(event.pointerId)
      isDragging.current = true
      didDrag.current = true
    }

    setHoveredId(undefined)
    setRotation({
      latitude: clamp(dragState.latitude - deltaY * 0.35, -70, 70),
      longitude: dragState.longitude + deltaX * 0.35
    })
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return

    drag.current = null
    window.setTimeout(() => {
      isDragging.current = false
    }, 0)
  }

  function handleTapSelection(event: React.MouseEvent<HTMLDivElement>) {
    if (didDrag.current) return

    const country = countryAtEventTarget(event.target)

    if (!country) {
      // TanStack Charts falls back to the nearest data point when its focus
      // resolver finds no match. Prevent its click handler from receiving
      // clicks on the ocean or other empty map areas.
      event.stopPropagation()
      return
    }

    if (isDesktop) return

    event.stopPropagation()
    if (country.id !== undefined) toggleActiveValue(String(country.id))
  }

  return (
    <div
      className="relative mx-auto min-h-88 w-full max-w-[1800px] touch-none overflow-hidden rounded-xl border bg-background shadow-md md:min-h-[min(76vh,52rem)]"
      data-projection={isDesktop ? 'equal-earth' : 'globe'}
      onClickCapture={handleTapSelection}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
    >
      <Chart
        ariaDescription="Explore country names and flags. On smaller screens, drag the globe to rotate it."
        ariaLabel="Interactive world map"
        aspectRatio={isDesktop ? 2.15 : 1}
        className="block w-full"
        definition={chart}
        initialWidth={1440}
        onFocusChange={(point) => handleFocusChange(point?.datum ?? null)}
        onSelect={(point) => handleSelect(point?.datum ?? null)}
      />
    </div>
  )
}

function useDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(MOBILE_BREAKPOINT).matches
      : false
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT)
    const syncViewport = () => setIsDesktop(mediaQuery.matches)

    syncViewport()
    mediaQuery.addEventListener('change', syncViewport)

    return () => mediaQuery.removeEventListener('change', syncViewport)
  }, [])

  return isDesktop
}

function countryFlag(countryId: string | number | undefined) {
  if (countryId === undefined) return undefined

  const alpha2 = numericToAlpha2(String(countryId).padStart(3, '0'))
  if (!alpha2) return undefined

  return [...alpha2]
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join('')
}

function countryAtPointer(
  activeProjection: ActiveProjection | null,
  x: number,
  y: number
) {
  if (!activeProjection) return undefined

  const { projection } = activeProjection
  const [centerX, centerY] = projection.translate()

  if (
    activeProjection.isGlobe &&
    Math.hypot(x - centerX, y - centerY) > projection.scale()
  ) {
    return undefined
  }

  if (!projection.invert) return undefined

  const coordinates = projection.invert([x, y])
  if (!coordinates) return undefined

  return countries.find((country) => geoContains(country, coordinates))
}

function countryAtEventTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return undefined

  const key = target
    .closest('path[data-ts-key^="countries:"]')
    ?.getAttribute('data-ts-key')

  return key ? countriesByChartKey.get(key) : undefined
}

function chartKey(value: string | number) {
  return typeof value === 'string'
    ? `string:${value.length}:${value}`
    : `${typeof value}:${String(value)}`
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

export { WorldMap }
