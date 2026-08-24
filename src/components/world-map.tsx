import { defineChart } from '@tanstack/charts'
import { geoShape } from '@tanstack/charts/geo'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/react-charts'
import { useQuery } from 'convex/react'
import {
  geoCentroid,
  geoContains,
  geoEqualEarth,
  geoOrthographic,
  geoPath
} from 'd3-geo'
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
import { formatCheckinMessage } from '#/lib/checkin-copy.ts'
import { api } from '../../convex/_generated/api'

type CountryProperties = {
  flag?: string
  name?: string
}
type SelectableCountry = {
  id?: string | number
  properties: CountryProperties
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
type MarkerLayer = {
  projection: GeoProjection
  viewBox: string
}
type MicroCountryMarker = {
  code: string
  flag?: string
  label: string
  name: string
  sourceX: number
  sourceY: number
  x: number
  y: number
}

const MOBILE_BREAKPOINT = '(min-width: 768px)'
const DRAG_THRESHOLD = 6
const MICRO_COUNTRY_SIZE = 5
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
const EXTRA_MICRO_COUNTRIES = [
  {
    code: '702',
    coordinates: [103.8198, 1.3521] as [number, number],
    flag: '🇸🇬',
    name: 'Singapore'
  }
] as const
const WORLD_MAP_VALUES = [
  ...countries.flatMap((country) =>
    country.id === undefined ? [] : [String(country.id)]
  ),
  ...EXTRA_MICRO_COUNTRIES.map((country) => country.code)
]
const MICRO_COUNTRY_POINTS = EXTRA_MICRO_COUNTRIES.map((country) => ({
  type: 'Feature' as const,
  id: country.code,
  properties: {
    flag: country.flag,
    name: country.name
  },
  geometry: {
    type: 'Point' as const,
    coordinates: country.coordinates
  }
}))
const microCountriesByChartKey = new Map(
  MICRO_COUNTRY_POINTS.map((country) => [
    `micro-countries:${chartKey(country.id)}`,
    country
  ])
)

function WorldMap({
  accountCode,
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
  const mapSurfaceRef = useRef<HTMLDivElement | null>(null)
  const [hoveredId, setHoveredId] = useState<string | number | undefined>()
  const [aimedCountry, setAimedCountry] = useState<
    (typeof countries)[number] | undefined
  >()
  const [rotation, setRotation] = useState<Rotation>({
    latitude: -18,
    longitude: 0
  })
  const [markerLayer, setMarkerLayer] = useState<MarkerLayer | null>(null)
  const [isMalaysiaInsetVisible, setIsMalaysiaInsetVisible] = useState(false)
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
  const focusedCode = isDesktop
    ? hoveredId === undefined
      ? ''
      : String(hoveredId)
    : aimedCountry?.id === undefined
      ? ''
      : String(aimedCountry.id)
  const focusedPeople = useQuery(
    api.checkins.locationPeople,
    focusedCode
      ? { code: accountCode, locationCode: focusedCode, type: 'country' }
      : 'skip'
  )
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
          // Some countries are too small to survive the 110m world topology.
          // This point is drawn inside the chart SVG itself, so it remains
          // visible at every pan and zoom level instead of depending on an
          // external overlay being measured after Chart has rendered.
          geoShape(MICRO_COUNTRY_POINTS, {
            className:
              'world-map-micro-countries [&_path]:[vector-effect:non-scaling-stroke]',
            id: 'micro-countries',
            key: (country) => country.id,
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
            r: 8,
            fill: (country) => {
              const interest = selectionInterest.getInterest(country.id)
              return getInterestFill(interest, densityFills, defaultFill)
            },
            stroke: (country) =>
              activeValues.includes(country.id) ? activeStroke : defaultStroke,
            strokeWidth: 1.5
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
            const country =
              countryAtPointer(activeProjection.current, x, y) ??
              microCountryAtPointer(activeProjection.current, x, y)

            return country
              ? points.filter(
                  (point) => String(point.datum.id) === String(country.id)
                )
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
                    focusedCode === String(point.datum.id)
                      ? (focusedPeople ?? [])
                      : [],
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
      focusedPeople,
      rotation,
      selectionInterest,
      viewport.panX,
      viewport.panY,
      viewport.zoom
    ]
  )

  const handleFocusChange = useCallback(
    (point: SelectableCountry | null) => {
      if (isDesktop && !isDragging.current) setHoveredId(point?.id)
    },
    [isDesktop]
  )

  const handleSelect = useCallback(
    (point: SelectableCountry | null) => {
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

  useEffect(() => {
    let frame = 0
    const syncMarkerLayer = () => {
      const projection = activeProjection.current?.projection
      const chartSvg = mapSurfaceRef.current?.querySelector('svg')
      const viewBox = chartSvg?.getAttribute('viewBox')
      if (!projection || !viewBox) return
      setIsMalaysiaInsetVisible(
        isDesktop &&
          viewport.zoom >= 1.35 &&
          isMapCenteredNearMalaysia(projection, viewBox)
      )
      setMarkerLayer((current) =>
        current?.projection === projection && current.viewBox === viewBox
          ? current
          : { projection, viewBox }
      )
    }
    const scheduleSync = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(syncMarkerLayer)
    }
    const observer = new MutationObserver(scheduleSync)

    scheduleSync()
    if (mapSurfaceRef.current) {
      observer.observe(mapSurfaceRef.current, { childList: true, subtree: true })
    }

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [isDesktop, rotation, viewport.panX, viewport.panY, viewport.zoom])

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
        ref={(element) => {
          mapSurfaceRef.current = element
          viewport.wheelRef(element)
        }}
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
        {isMalaysiaInsetVisible ? (
          <SingaporeInset
            activeValues={activeValues}
            count={selectionInterest.getInterest('702').count}
            onSelect={toggleActiveValue}
          />
        ) : null}
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
        {markerLayer ? (
          <MicroCountryMarkers
            activeStroke={activeStroke}
            activeValues={activeValues}
            densityFills={densityFills}
            defaultFill={defaultFill}
            defaultStroke={defaultStroke}
            focusedCode={focusedCode}
            focusedPeople={focusedPeople ?? []}
            getInterest={selectionInterest.getInterest}
            hoverFill={hoverFill}
            markerLayer={markerLayer}
            onHoverChange={setHoveredId}
            onSelect={toggleActiveValue}
          />
        ) : null}
        {!isDesktop ? (
          <>
            <MapCrosshair />
            <CountryAimPanel
              activeValues={activeValues}
              country={aimedCountry}
              getInterest={selectionInterest.getInterest}
              otherPeople={focusedPeople ?? []}
            />
          </>
        ) : null}
      </div>
    </section>
  )
}

function SingaporeInset({
  activeValues,
  count,
  onSelect
}: {
  activeValues: readonly string[]
  count: number
  onSelect: (value: string) => void
}) {
  const selected = activeValues.includes('702')

  return (
    <aside
      aria-label="Singapore inset"
      className="absolute bottom-4 left-4 z-20 w-44 rounded-lg border border-[var(--map-selected-outline)] bg-card p-3 shadow-lg"
    >
      <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        Khu vực phóng to
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="grid size-10 place-items-center rounded-full border-2 border-[var(--map-selected-outline)] bg-[var(--map-level-1)] text-lg"
        >
          🇸🇬
        </span>
        <div>
          <p className="font-semibold">Singapore</p>
          <p className="text-xs text-muted-foreground">
            {count === 0 ? 'Chưa có SC-er' : `${count} SC-er đã đến`}
          </p>
        </div>
      </div>
      <button
        aria-pressed={selected}
        className="mt-3 min-h-10 w-full rounded-md border border-[var(--map-selected-outline)] px-3 text-sm font-semibold transition-colors hover:bg-[var(--map-level-1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        type="button"
        onClick={() => onSelect('702')}
      >
        {selected ? 'Bỏ chọn Singapore' : 'Chọn Singapore'}
      </button>
    </aside>
  )
}

function isMapCenteredNearMalaysia(projection: GeoProjection, viewBox: string) {
  const values = viewBox.trim().split(/\s+/).map(Number)
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
    return false
  }
  const [x, y, width, height] = values
  if (!projection.invert) return false
  const center = projection.invert([x + width / 2, y + height / 2])
  if (!center) return false
  const [longitude, latitude] = center

  return longitude >= 85 && longitude <= 125 && latitude >= -15 && latitude <= 22
}

function MicroCountryMarkers({
  activeStroke,
  activeValues,
  defaultFill,
  defaultStroke,
  densityFills,
  focusedCode,
  focusedPeople,
  getInterest,
  hoverFill,
  markerLayer,
  onHoverChange,
  onSelect
}: {
  activeStroke: string
  activeValues: readonly string[]
  defaultFill: string
  defaultStroke: string
  densityFills: MapProps['densityFills']
  focusedCode: string
  focusedPeople: readonly string[]
  getInterest: (value: string) => SelectionInterest
  hoverFill: string
  markerLayer: MarkerLayer
  onHoverChange: (id: string | number | undefined) => void
  onSelect: (value: string) => void
}) {
  const markers = useMemo(
    () => createMicroCountryMarkers(markerLayer.projection),
    [markerLayer.projection]
  )

  return (
    <svg
      aria-label="Điểm chọn cho các quốc gia có diện tích nhỏ"
      className="pointer-events-none absolute inset-0 z-10 size-full overflow-visible"
      viewBox={markerLayer.viewBox}
    >
      {markers.map((marker) => {
        const code = marker.code
        const selected = activeValues.includes(code)
        const interest = getInterest(code)
        const isFocused = focusedCode === code
        const message = formatCheckinMessage({
          count: interest.count,
          locationKind: 'quốc gia',
          otherPeople: isFocused ? focusedPeople : [],
          selected
        })
        const fill =
          isFocused && interest.level === null
            ? hoverFill
            : getInterestFill(interest, densityFills, defaultFill)

        return (
          <g key={code}>
            {marker.x !== marker.sourceX || marker.y !== marker.sourceY ? (
              <line
                pointerEvents="none"
                stroke={defaultStroke}
                strokeWidth="1"
                x1={marker.sourceX}
                x2={marker.x}
                y1={marker.sourceY}
                y2={marker.y}
              />
            ) : null}
            <circle
              aria-label={`${marker.name}: ${message}`}
              aria-pressed={selected}
              className="pointer-events-auto cursor-pointer focus:outline-none"
              cx={marker.x}
              cy={marker.y}
              fill="transparent"
              r="16"
              role="button"
              tabIndex={0}
              onBlur={() => onHoverChange(undefined)}
              onClick={(event) => {
                event.stopPropagation()
                onSelect(code)
              }}
              onFocus={() => onHoverChange(code)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(code)
                }
              }}
              onPointerEnter={() => onHoverChange(code)}
              onPointerLeave={() => onHoverChange(undefined)}
            />
            <circle
              aria-hidden="true"
              cx={marker.x}
              cy={marker.y}
              fill={fill}
              pointerEvents="none"
              r="6"
              stroke={selected ? activeStroke : defaultStroke}
              strokeWidth={selected ? 2 : 1}
            />
            <text
              aria-hidden="true"
              fill="var(--foreground)"
              fontSize="10"
              fontWeight="700"
              pointerEvents="none"
              textAnchor="middle"
              x={marker.x}
              y={marker.y + 22}
            >
              {marker.label}
            </text>
            <title>{`${marker.flag ? `${marker.flag} ` : ''}${marker.name}\n${message}`}</title>
          </g>
        )
      })}
    </svg>
  )
}

function createMicroCountryMarkers(projection: GeoProjection) {
  const path = geoPath(projection)
  const markers: MicroCountryMarker[] = []
  const occupied: Array<{ x: number; y: number }> = []

  function addMarker(
    code: string,
    name: string,
    flag: string | undefined,
    sourceX: number,
    sourceY: number
  ) {
    const marker = displaceMarker(sourceX, sourceY, occupied)
    occupied.push(marker)
    markers.push({
      code,
      flag,
      label: numericToAlpha2(code.padStart(3, '0')) ?? '',
      name,
      sourceX,
      sourceY,
      ...marker
    })
  }

  for (const country of countries) {
    if (country.id === undefined) continue
    const [[minX, minY], [maxX, maxY]] = path.bounds(country)
    if (
      !Number.isFinite(minX) ||
      !Number.isFinite(minY) ||
      !Number.isFinite(maxX) ||
      !Number.isFinite(maxY) ||
      Math.max(maxX - minX, maxY - minY) >= MICRO_COUNTRY_SIZE
    ) {
      continue
    }
    const point = projection(geoCentroid(country))
    if (!point) continue
    const [sourceX = 0, sourceY = 0] = point
    if (!Number.isFinite(sourceX) || !Number.isFinite(sourceY)) continue

    addMarker(
      String(country.id),
      country.properties.name,
      country.properties.flag,
      sourceX,
      sourceY
    )
  }

  for (const country of EXTRA_MICRO_COUNTRIES) {
    const point = projection(country.coordinates)
    if (!point) continue
    const [sourceX = 0, sourceY = 0] = point
    if (!Number.isFinite(sourceX) || !Number.isFinite(sourceY)) continue
    addMarker(country.code, country.name, country.flag, sourceX, sourceY)
  }

  return markers
}

function displaceMarker(
  sourceX: number,
  sourceY: number,
  occupied: readonly { x: number; y: number }[]
) {
  const positions = [
    [0, 0],
    [16, -12],
    [16, 12],
    [-16, 12],
    [-16, -12]
  ]
  for (const [offsetX, offsetY] of positions) {
    const x = sourceX + offsetX
    const y = sourceY + offsetY
    if (
      occupied.every((marker) => Math.hypot(marker.x - x, marker.y - y) > 20)
    ) {
      return { x, y }
    }
  }
  return { x: sourceX, y: sourceY }
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
  country: SelectableCountry,
  activeValues: readonly string[],
  otherPeople: readonly string[],
  selectionInterest: { getInterest: (value: string) => SelectionInterest }
) {
  const code = String(country.id)
  const interest = selectionInterest.getInterest(code)
  const { flag, name } = country.properties
  const heading = flag ? `${flag} ${name}` : name
  const count = formatCheckinMessage({
    count: interest.count,
    locationKind: 'quốc gia',
    otherPeople,
    selected: activeValues.includes(code)
  })

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
  getInterest,
  otherPeople
}: Pick<MapProps, 'activeValues'> & {
  country: (typeof countries)[number] | undefined
  getInterest: (value: string) => SelectionInterest
  otherPeople: readonly string[]
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
            {formatCheckinMessage({
              count: interest.count,
              locationKind: 'quốc gia',
              otherPeople,
              selected
            })}
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

function microCountryAtPointer(
  activeProjection: ActiveProjection | null,
  x: number,
  y: number
) {
  if (!activeProjection) return undefined

  for (const country of MICRO_COUNTRY_POINTS) {
    const point = activeProjection.projection(country.geometry.coordinates)
    if (!point) continue
    const [pointX, pointY] = point
    if (Math.hypot(x - pointX, y - pointY) <= 14) return country
  }

  return undefined
}

function countryAtEventTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return undefined

  const key = target.closest('path[data-ts-key]')?.getAttribute('data-ts-key')

  return key
    ? countriesByChartKey.get(key) ?? microCountriesByChartKey.get(key)
    : undefined
}

function chartKey(value: string | number) {
  return typeof value === 'string'
    ? `string:${value.length}:${value}`
    : `${typeof value}:${String(value)}`
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

const WORLD_LOCATIONS = [
  ...countries.flatMap((country) =>
    country.id === undefined
      ? []
      : [{ code: String(country.id), name: country.properties.name }]
  ),
  ...EXTRA_MICRO_COUNTRIES.map(({ code, name }) => ({ code, name }))
]

export { WORLD_LOCATIONS, WORLD_MAP_VALUES, WorldMap }
