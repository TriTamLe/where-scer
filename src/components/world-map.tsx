import { defineChart } from '@tanstack/charts'
import { geoShape } from '@tanstack/charts/geo'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/react-charts'
import { geoContains, geoEqualEarth, geoOrthographic } from 'd3-geo'
import type { GeoProjection } from 'd3-geo'
import { numericToAlpha2 } from 'i18n-iso-countries'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { feature } from 'topojson-client'
import type {
  GeometryCollection,
  Objects,
  Topology
} from 'topojson-specification'
import worldAtlas from 'world-atlas/countries-110m.json'

import type { MapProps } from '#/components/map-types.ts'
import { MapZoomControls, useMapViewport } from '#/components/map-viewport.tsx'
import {
  getInterestFill,
  useSelectionInterest
} from '#/hooks/use-selection-interest.ts'
import type { SelectionInterest } from '#/hooks/use-selection-interest.ts'

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
const WORLD_MAP_VALUES = countries.flatMap((country) =>
  country.id === undefined ? [] : [String(country.id)]
)
const countriesByChartKey = new Map(
  countries.map((country) => [
    `countries:${chartKey(country.id ?? country.properties.name)}`,
    country
  ])
)

function WorldMap({
  activeStroke,
  activeStrokeWidth,
  activeValues,
  densityFills,
  defaultFill,
  defaultStroke,
  defaultStrokeWidth,
  hoverFill,
  onChange,
  selectionCounts
}: MapProps) {
  const id = useId()
  const isDesktop = useDesktopViewport()
  const viewport = useMapViewport({ panEnabled: isDesktop })
  const [hoveredId, setHoveredId] = useState<string | number | undefined>()
  const [aimedCountry, setAimedCountry] = useState<
    (typeof countries)[number] | undefined
  >()
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
  const selectionInterest = useSelectionInterest({
    selectionCounts
  })
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
              'world-map-countries [&_path]:[vector-effect:non-scaling-stroke] [&_path]:transition-colors [&_path]:duration-200',
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
              if (isDesktop) {
                const [baseX, baseY] = projection.translate()
                projection
                  .scale(projection.scale() * viewport.zoom)
                  .translate([
                    baseX + viewport.panX * bounds.width,
                    baseY + viewport.panY * bounds.height
                  ])
              } else {
                projection.scale(projection.scale() * viewport.zoom)
              }
              activeProjection.current = {
                isGlobe: !isDesktop,
                projection
              }

              return projection
            },
            fill: (country) => {
              const code = country.id === undefined ? '' : String(country.id)
              const interest = selectionInterest.getInterest(code)

              return interest.level === null && hoveredId === country.id
                ? hoverFill
                : getInterestFill(interest, densityFills, defaultFill)
            },
            stroke: (country) =>
              country.id !== undefined &&
              activeValues.includes(String(country.id))
                ? activeStroke
                : defaultStroke,
            strokeWidth: defaultStrokeWidth
          }),
          geoShape(activeCountries, {
            className:
              'pointer-events-none [&_path]:[vector-effect:non-scaling-stroke]',
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
              if (isDesktop) {
                const [baseX, baseY] = projection.translate()
                projection
                  .scale(projection.scale() * viewport.zoom)
                  .translate([
                    baseX + viewport.panX * bounds.width,
                    baseY + viewport.panY * bounds.height
                  ])
              } else {
                projection.scale(projection.scale() * viewport.zoom)
              }

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
        ...(isDesktop
          ? {
              tooltip: {
                use: tooltip,
                className:
                  'rounded-md border border-border bg-popover px-3 py-2 text-sm font-semibold text-popover-foreground',
                format: (point) =>
                  formatCountryMessage(
                    point.datum,
                    activeValues,
                    selectionInterest
                  )
              }
            }
          : {})
      }),
    [
      activeStroke,
      activeStrokeWidth,
      activeCountries,
      activeValues,
      densityFills,
      defaultFill,
      defaultStroke,
      defaultStrokeWidth,
      hoverFill,
      hoveredId,
      isDesktop,
      rotation,
      selectionInterest,
      viewport.panX,
      viewport.panY,
      viewport.zoom
    ]
  )

  const handleFocusChange = useCallback(
    (point: (typeof countries)[number] | null) => {
      if (isDesktop && !isDragging.current) setHoveredId(point?.id)
    },
    [isDesktop]
  )

  const handleSelect = useCallback(
    (point: (typeof countries)[number] | null) => {
      if (!isDesktop || isDragging.current || viewport.isPanningRef.current)
        return
      if (point?.id !== undefined) toggleActiveValue(String(point.id))
    },
    [isDesktop, toggleActiveValue, viewport.isPanningRef]
  )

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    viewport.onPointerDown(event)
    if (isDesktop) {
      return
    }

    if (viewport.isPinchingRef.current) {
      drag.current = null
      return
    }

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
    viewport.onPointerMove(event)
    if (isDesktop) {
      return
    }

    if (viewport.isPinchingRef.current) return

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
    viewport.onPointerEnd(event)
    if (isDesktop) {
      return
    }

    if (drag.current?.pointerId !== event.pointerId) return

    drag.current = null
    window.setTimeout(() => {
      isDragging.current = false
    }, 0)
  }

  function handleTapSelection(event: React.MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented) return
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

  useEffect(() => {
    if (isDesktop) return
    const frame = window.requestAnimationFrame(() => {
      const projection = activeProjection.current?.projection
      if (!projection) return
      const [x, y] = projection.translate()
      setAimedCountry(countryAtPointer(activeProjection.current, x, y))
    })

    return () => window.cancelAnimationFrame(frame)
  }, [isDesktop, rotation, viewport.zoom])

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex h-[42rem] w-full flex-col border-b border-divider pb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id={`${id}-title`} className="text-xl font-semibold sm:text-2xl">
            Bản đồ Thế giới
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Chọn một hoặc nhiều quốc gia để đánh dấu các nơi bạn đã check-in.
          </p>
        </div>
        <p className="shrink-0 text-sm text-muted-foreground">
          {WORLD_MAP_VALUES.length} quốc gia
        </p>
      </div>
      <div
        ref={viewport.wheelRef}
        className="relative mt-5 min-h-0 w-full flex-1 touch-none overflow-hidden rounded-lg border bg-[var(--map-background)]"
        data-projection={isDesktop ? 'equal-earth' : 'globe'}
        onClickCapture={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest('[data-map-controls]')
          ) {
            return
          }
          viewport.onClickCapture(event)
          if (!isDesktop) handleTapSelection(event)
        }}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
      >
        <MapZoomControls {...viewport} />
        <Chart
          ariaDescription="Explore country names and flags. On smaller screens, drag the globe to rotate it."
          ariaLabel="Interactive world map"
          aspectRatio={isDesktop ? 2.15 : 1}
          className="block h-full w-full"
          definition={chart}
          initialWidth={1440}
          onFocusChange={(point) => handleFocusChange(point?.datum ?? null)}
          onSelect={(point) => handleSelect(point?.datum ?? null)}
        />
        {!isDesktop ? (
          <>
            <MapCrosshair />
            <CountryAimPanel
              activeValues={activeValues}
              country={aimedCountry}
              getInterest={selectionInterest.getInterest}
            />
          </>
        ) : null}
      </div>
    </section>
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

function formatCountryMessage(
  country: (typeof countries)[number],
  activeValues: readonly string[],
  selectionInterest: { getInterest: (value: string) => SelectionInterest }
) {
  const code = String(country.id)
  const interest = selectionInterest.getInterest(code)
  const { flag, name } = country.properties
  const heading = flag ? `${flag} ${name}` : name
  const count =
    interest.count > 0
      ? activeValues.includes(code)
        ? interest.count === 1
          ? 'Bạn đã đến đây'
          : `Bạn và ${interest.count - 1} SC-ers khác đã đến đây`
        : `${interest.count} SC-ers đã đến đây`
      : 'Chưa có SC-er nào check-in ở đây'

  return `${heading}\n${count}`
}

function MapCrosshair() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center"
    >
      <span className="absolute h-px w-full bg-foreground/80" />
      <span className="absolute h-full w-px bg-foreground/80" />
      <span className="size-2 rounded-full border border-foreground bg-[var(--map-background)]" />
    </div>
  )
}

function CountryAimPanel({
  activeValues,
  country,
  getInterest
}: Pick<MapProps, 'activeValues'> & {
  country: (typeof countries)[number] | undefined
  getInterest: (value: string) => SelectionInterest
}) {
  const code = country?.id === undefined ? '' : String(country.id)
  const interest = getInterest(code)
  const selected = activeValues.includes(code)

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[calc(100%-1.5rem)] rounded-md border border-border bg-popover/95 px-3 py-2 text-xs"
    >
      {country ? (
        <>
          <p className="font-semibold">
            {country.properties.flag ? `${country.properties.flag} ` : ''}
            {country.properties.name}
          </p>
          <p className="mt-0.5 text-muted-foreground">
            {interest.count > 0
              ? selected
                ? interest.count === 1
                  ? 'Bạn đã đến đây'
                  : `Bạn và ${interest.count - 1} SC-ers khác đã đến đây`
                : `${interest.count} SC-ers đã đến đây`
              : 'Chưa có SC-er nào check-in ở đây'}
          </p>
        </>
      ) : (
        <p className="text-muted-foreground">
          Đưa một địa điểm vào tâm ngắm để xem thông tin.
        </p>
      )}
    </div>
  )
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

const WORLD_LOCATIONS = countries.flatMap((country) =>
  country.id === undefined
    ? []
    : [{ code: String(country.id), name: country.properties.name }]
)

export { WORLD_LOCATIONS, WORLD_MAP_VALUES, WorldMap }
