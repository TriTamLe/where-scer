import { geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { MapDensityLegend } from '#/components/map-density.tsx'
import type { MapProps } from '#/components/map-types.ts'
import { MapZoomControls, useMapViewport } from '#/components/map-viewport.tsx'
import {
  getInterestFill,
  useSelectionInterest
} from '#/hooks/use-selection-interest.ts'
import type { SelectionInterest } from '#/hooks/use-selection-interest.ts'

type AdministrativeProperties = {
  areaKm2?: number
  code: string
  fullName: string
  name: string
}

type AdministrativeCollection = FeatureCollection<
  Geometry,
  AdministrativeProperties
>
type AdministrativeFeature = Feature<Geometry, AdministrativeProperties>
type RenderedPath = {
  feature: AdministrativeFeature
  path: string
}
type InsetPath = {
  inset: Inset
  path: string
}
type Inset = {
  feature: AdministrativeFeature
  label: string
}
type MapPresentation = {
  insets: Inset[]
  mainland: AdministrativeCollection
}
type TooltipState = {
  feature: AdministrativeFeature
  x: number
  y: number
}

type AdministrativeMapProps = MapProps & {
  ariaLabel: string
  dataUrl: string
  description: string
  title: string
  variant: 'province' | 'ward'
}

const MAP_WIDTH = 1000
const MAP_HEIGHT = 640
const MAP_PADDING = 22
const INSET_WIDTH = 208
const INSET_HEIGHT = 132
const INSET_GAP = 14
const INSET_X = MAP_WIDTH - INSET_WIDTH - 22
const DESKTOP_BREAKPOINT = '(min-width: 768px)'

function AdministrativeMap({
  activeStroke,
  activeStrokeWidth,
  activeValues,
  ariaLabel,
  dataUrl,
  densityFills,
  defaultFill,
  defaultStroke,
  defaultStrokeWidth,
  hoverFill,
  description,
  onChange,
  selectionCounts,
  title,
  variant
}: AdministrativeMapProps) {
  const id = useId()
  const isDesktop = useDesktopViewport()
  const viewport = useMapViewport({ maxZoom: variant === 'province' ? 8 : 4 })
  const [containerRef, width] = useElementWidth<HTMLDivElement>()
  const [data, status, error] = useDeferredGeoData(dataUrl, containerRef)
  const [hoveredCode, setHoveredCode] = useState<string>('')
  const [aimedCode, setAimedCode] = useState<string>('')
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const selectionInterest = useSelectionInterest({
    optionCount: data?.features.length ?? 0,
    selectionCounts
  })

  const presentation = useMemo(
    () => createMapPresentation(data, variant),
    [data, variant]
  )
  const mainlandPaths = useMemo(
    () => projectFeatures(presentation?.mainland ?? null),
    [presentation, width]
  )
  const insetPaths = useMemo(
    () => projectInsetPaths(presentation?.insets ?? []),
    [presentation]
  )
  const featuresByCode = useMemo(
    () =>
      new Map(
        data?.features.map((feature) => [feature.properties.code, feature])
      ),
    [data]
  )
  const outlinedMainlandPaths = mainlandPaths.filter(({ feature }) =>
    activeValues.includes(feature.properties.code)
  )
  const mapTransform = `translate(${viewport.panX * MAP_WIDTH} ${
    viewport.panY * MAP_HEIGHT
  }) translate(${MAP_WIDTH / 2} ${MAP_HEIGHT / 2}) scale(${viewport.zoom}) translate(${-MAP_WIDTH / 2} ${-MAP_HEIGHT / 2})`

  function toggleActiveValue(value: string) {
    onChange(
      activeValues.includes(value)
        ? activeValues.filter((activeValue) => activeValue !== value)
        : [...activeValues, value]
    )
  }

  function showTooltip(
    event: React.PointerEvent<SVGElement>,
    feature: AdministrativeFeature
  ) {
    const mapBounds = containerRef.current?.getBoundingClientRect()
    if (!mapBounds) return

    setTooltip({
      feature,
      x: Math.max(
        12,
        Math.min(event.clientX - mapBounds.left + 14, width - 220)
      ),
      y: Math.max(
        12,
        Math.min(event.clientY - mapBounds.top + 14, mapBounds.height - 56)
      )
    })
  }

  function hideTooltip() {
    setTooltip(null)
  }

  useEffect(() => {
    if (isDesktop) return
    const container = containerRef.current
    if (!container) return

    const frame = window.requestAnimationFrame(() => {
      const bounds = container.getBoundingClientRect()
      const target = document.elementFromPoint(
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2
      )
      const code =
        target instanceof Element
          ? target
              .closest('[data-map-location]')
              ?.getAttribute('data-map-location')
          : null
      setAimedCode(code ?? '')
    })

    return () => window.cancelAnimationFrame(frame)
  }, [
    containerRef,
    isDesktop,
    viewport.panX,
    viewport.panY,
    viewport.zoom,
    width
  ])

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex h-[42rem] w-full flex-col border-b border-divider pb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 id={`${id}-title`} className="text-xl font-semibold sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {data ? (
          <p className="shrink-0 text-sm text-muted-foreground">
            {data.features.length} đơn vị hành chính
          </p>
        ) : null}
      </div>
      <div
        ref={containerRef}
        className={
          'relative mt-5 min-h-0 w-full flex-1 touch-none overflow-hidden rounded-lg border bg-[var(--map-background)]'
        }
        onClickCapture={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest('[data-map-controls]')
          ) {
            return
          }
          viewport.onClickCapture(event)
        }}
        onPointerCancel={viewport.onPointerEnd}
        onPointerDown={viewport.onPointerDown}
        onPointerMove={viewport.onPointerMove}
        onPointerUp={viewport.onPointerEnd}
      >
        {status === 'loading' ? <MapSkeleton /> : null}
        {status === 'error' ? <MapError error={error} /> : null}
        {data && width > 0 ? (
          <svg
            aria-label={ariaLabel}
            className="block h-full w-full"
            ref={viewport.wheelRef}
            role="group"
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          >
            <desc>{description}</desc>
            <g transform={mapTransform}>
              {mainlandPaths.map(({ feature, path }) => (
                <RegionPath
                  key={`mainland-${feature.properties.code}`}
                  activeStroke={activeStroke}
                  activeStrokeWidth={activeStrokeWidth}
                  activeValues={activeValues}
                  densityFills={densityFills}
                  defaultFill={defaultFill}
                  defaultStroke={defaultStroke}
                  defaultStrokeWidth={defaultStrokeWidth}
                  hoverFill={hoverFill}
                  isDesktop={isDesktop}
                  feature={feature}
                  hovered={
                    feature.properties.code ===
                    (isDesktop ? hoveredCode : aimedCode)
                  }
                  path={path}
                  getInterest={selectionInterest.getInterest}
                  onHoverChange={setHoveredCode}
                  onSelect={toggleActiveValue}
                  onTooltipHide={hideTooltip}
                  onTooltipShow={showTooltip}
                />
              ))}
              {outlinedMainlandPaths.map(({ feature, path }) => (
                <path
                  aria-hidden="true"
                  d={path}
                  fill="none"
                  key={`active-${feature.properties.code}`}
                  pointerEvents="none"
                  stroke={activeStroke}
                  strokeWidth={activeStrokeWidth}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
            {insetPaths.map(({ inset, path }, index) => (
              <MapInset
                key={`inset-${inset.feature.properties.code}`}
                index={index}
                inset={inset}
                path={path}
                total={insetPaths.length}
                activeStroke={activeStroke}
                activeStrokeWidth={activeStrokeWidth}
                activeValues={activeValues}
                densityFills={densityFills}
                defaultFill={defaultFill}
                defaultStroke={defaultStroke}
                defaultStrokeWidth={defaultStrokeWidth}
                hoverFill={hoverFill}
                isDesktop={isDesktop}
                hoveredCode={isDesktop ? hoveredCode : aimedCode}
                onHoverChange={setHoveredCode}
                onSelect={toggleActiveValue}
                onTooltipHide={hideTooltip}
                onTooltipShow={showTooltip}
                getInterest={selectionInterest.getInterest}
              />
            ))}
          </svg>
        ) : null}
        <MapZoomControls {...viewport} />
        {!isDesktop ? <MapCrosshair /> : null}
        {!isDesktop ? (
          <AdministrativeAimPanel
            activeValues={activeValues}
            feature={aimedCode ? featuresByCode.get(aimedCode) : undefined}
            getInterest={selectionInterest.getInterest}
          />
        ) : null}
        {isDesktop && tooltip ? (
          <MapTooltip
            activeValues={activeValues}
            getInterest={selectionInterest.getInterest}
            tooltip={tooltip}
          />
        ) : null}
      </div>

      <MapDensityLegend
        averageSelectionsPerOption={
          selectionInterest.averageSelectionsPerOption
        }
        densityFills={densityFills}
        legendItems={selectionInterest.legendItems}
      />
    </section>
  )
}

type RegionPathProps = {
  activeStroke: string
  activeStrokeWidth: number
  activeValues: readonly string[]
  densityFills: MapProps['densityFills']
  defaultFill: string
  defaultStroke: string
  defaultStrokeWidth: number
  hoverFill: string
  isDesktop: boolean
  feature: AdministrativeFeature
  hovered: boolean
  path: string
  onHoverChange: (code: string) => void
  onSelect: (code: string) => void
  onTooltipHide: () => void
  onTooltipShow: (
    event: React.PointerEvent<SVGElement>,
    feature: AdministrativeFeature
  ) => void
  getInterest: (value: string) => SelectionInterest
}

function RegionPath({
  activeStroke,
  activeStrokeWidth,
  activeValues,
  densityFills,
  defaultFill,
  defaultStroke,
  defaultStrokeWidth,
  hoverFill,
  isDesktop,
  feature,
  hovered,
  path,
  onHoverChange,
  onSelect,
  onTooltipHide,
  onTooltipShow,
  getInterest
}: RegionPathProps) {
  const { code, fullName } = feature.properties
  const selected = activeValues.includes(code)
  const interest = getInterest(code)

  return (
    <path
      aria-label={`${fullName}, mã ${code}`}
      aria-pressed={selected}
      className="cursor-pointer transition-colors duration-200 motion-reduce:transition-none"
      data-map-location={code}
      d={path}
      fill={
        interest.level === null && hovered
          ? hoverFill
          : getInterestFill(interest, densityFills, defaultFill)
      }
      role="button"
      stroke={selected ? activeStroke : defaultStroke}
      strokeWidth={selected ? activeStrokeWidth : defaultStrokeWidth}
      style={{ outline: 'none' }}
      tabIndex={0}
      vectorEffect="non-scaling-stroke"
      onBlur={() => {
        onHoverChange('')
      }}
      onClick={() => onSelect(code)}
      onFocus={() => {
        onHoverChange(code)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(code)
        }
      }}
      onPointerEnter={(event) => {
        if (!isDesktop) return
        onHoverChange(code)
        onTooltipShow(event, feature)
      }}
      onPointerLeave={() => {
        if (!isDesktop) return
        onHoverChange('')
        onTooltipHide()
      }}
      onPointerMove={(event) => {
        if (isDesktop) onTooltipShow(event, feature)
      }}
    />
  )
}

type MapInsetProps = {
  activeStroke: string
  activeStrokeWidth: number
  activeValues: readonly string[]
  densityFills: MapProps['densityFills']
  defaultFill: string
  defaultStroke: string
  defaultStrokeWidth: number
  hoverFill: string
  isDesktop: boolean
  hoveredCode: string
  index: number
  inset: Inset
  onHoverChange: (code: string) => void
  onSelect: (code: string) => void
  onTooltipHide: () => void
  onTooltipShow: RegionPathProps['onTooltipShow']
  getInterest: (value: string) => SelectionInterest
  path: string
  total: number
}

function MapInset({
  activeStroke,
  activeStrokeWidth,
  activeValues,
  densityFills,
  defaultFill,
  defaultStroke,
  defaultStrokeWidth,
  hoverFill,
  isDesktop,
  hoveredCode,
  index,
  inset,
  path,
  total,
  onHoverChange,
  onSelect,
  onTooltipHide,
  onTooltipShow,
  getInterest
}: MapInsetProps) {
  const { feature, label } = inset
  const { code } = feature.properties
  const frame = insetFrame(index, total)
  const selected = activeValues.includes(code)
  const hovered = code === hoveredCode
  const interest = getInterest(code)
  const fill = getInterestFill(interest, densityFills, defaultFill)

  return (
    <g aria-label={`Ô hiển thị quần đảo ${label}`} role="group">
      <rect
        aria-label={`${label}, chọn ${feature.properties.fullName}, mã ${code}`}
        aria-pressed={selected}
        className="cursor-pointer transition-colors duration-200 motion-reduce:transition-none"
        data-map-location={code}
        fill={interest.level === null && hovered ? hoverFill : fill}
        height={frame.height}
        rx="12"
        role="button"
        stroke={selected ? activeStroke : defaultStroke}
        strokeWidth={selected ? activeStrokeWidth : defaultStrokeWidth}
        style={{ outline: 'none' }}
        tabIndex={0}
        vectorEffect="non-scaling-stroke"
        width={frame.width}
        x={frame.x}
        y={frame.y}
        onBlur={() => {
          onHoverChange('')
        }}
        onClick={() => onSelect(code)}
        onFocus={() => {
          onHoverChange(code)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelect(code)
          }
        }}
        onPointerEnter={(event) => {
          if (!isDesktop) return
          onHoverChange(code)
          onTooltipShow(event, feature)
        }}
        onPointerLeave={() => {
          if (!isDesktop) return
          onHoverChange('')
          onTooltipHide()
        }}
        onPointerMove={(event) => {
          if (isDesktop) onTooltipShow(event, feature)
        }}
      />
      <text
        fill="var(--foreground)"
        fontSize="14"
        fontWeight="600"
        pointerEvents="none"
        textAnchor="middle"
        x={frame.x + frame.width / 2}
        y={frame.y + 22}
      >
        {label}
      </text>
      <path
        aria-hidden="true"
        d={path}
        fill={fill}
        pointerEvents="none"
        stroke={selected ? activeStroke : defaultStroke}
        strokeWidth={selected ? activeStrokeWidth : defaultStrokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  )
}

function MapTooltip({
  activeValues,
  getInterest,
  tooltip
}: Pick<MapProps, 'activeValues'> & {
  getInterest: (value: string) => SelectionInterest
  tooltip: TooltipState
}) {
  const { code } = tooltip.feature.properties
  const interest = getInterest(code)
  const selected = activeValues.includes(code)
  return (
    <div
      className="pointer-events-none absolute z-10 max-w-52 rounded-md border bg-popover px-3 py-2 text-sm shadow-md"
      role="tooltip"
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      <p className="font-semibold">{tooltip.feature.properties.fullName}</p>
      <p className="mt-0.5 text-muted-foreground">Mã: {code}</p>
      <p className="mt-0.5 text-muted-foreground">
        {interest.count > 0
          ? selected
            ? `Bạn và ${Math.max(interest.count - 1, 0)} SC-ers khác đã đến đây`
            : `${interest.count} SC-ers đã đến đây`
          : 'Chưa có SC-er nào check-in ở đây'}
      </p>
    </div>
  )
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

function AdministrativeAimPanel({
  activeValues,
  feature,
  getInterest
}: Pick<MapProps, 'activeValues'> & {
  feature: AdministrativeFeature | undefined
  getInterest: (value: string) => SelectionInterest
}) {
  const code = feature?.properties.code ?? ''
  const interest = getInterest(code)
  const selected = activeValues.includes(code)

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[calc(100%-1.5rem)] rounded-md border border-border bg-popover/95 px-3 py-2 text-xs shadow-sm"
    >
      {feature ? (
        <>
          <p className="font-semibold">{feature.properties.fullName}</p>
          <p className="mt-0.5 text-muted-foreground">Mã: {code}</p>
          <p className="mt-0.5 text-muted-foreground">
            {interest.count > 0
              ? selected
                ? `Bạn và ${Math.max(interest.count - 1, 0)} SC-ers khác đã đến đây`
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

function useDeferredGeoData(
  dataUrl: string,
  targetRef: React.RefObject<Element | null>
) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [data, setData] = useState<AdministrativeCollection | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin: '240px 0px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [targetRef])

  useEffect(() => {
    if (!shouldLoad) return

    const controller = new AbortController()
    setData(null)
    setError(null)

    fetch(dataUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok)
          throw new Error(`Không thể tải dữ liệu (${response.status}).`)
        return response.json()
      })
      .then((loadedData) => setData(loadedData as AdministrativeCollection))
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Không thể tải dữ liệu bản đồ.'
        )
      })

    return () => controller.abort()
  }, [dataUrl, shouldLoad])

  return [data, error ? 'error' : data ? 'ready' : 'loading', error] as const
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const resizeObserver = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })

    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [])

  return [ref, width] as const
}

function useDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(DESKTOP_BREAKPOINT).matches
      : false
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_BREAKPOINT)
    const syncViewport = () => setIsDesktop(mediaQuery.matches)
    syncViewport()
    mediaQuery.addEventListener('change', syncViewport)
    return () => mediaQuery.removeEventListener('change', syncViewport)
  }, [])

  return isDesktop
}

function createMapPresentation(
  data: AdministrativeCollection | null,
  variant: AdministrativeMapProps['variant']
): MapPresentation | null {
  if (!data) return null

  if (variant === 'ward') {
    const hoangSa = data.features.find(
      (feature) => feature.properties.code === '20333'
    )

    return {
      mainland: {
        ...data,
        features: data.features.filter(
          (feature) => feature.properties.code !== '20333'
        )
      },
      insets: hoangSa ? [{ feature: hoangSa, label: 'Hoàng Sa' }] : []
    }
  }

  const daNang = data.features.find(
    (feature) => feature.properties.code === '48'
  )
  const khanhHoa = data.features.find(
    (feature) => feature.properties.code === '56'
  )
  const daNangSplit = daNang
    ? splitFeature(daNang, (polygon) =>
        polygon.flat().some(([longitude]) => longitude >= 110)
      )
    : null
  const khanhHoaSplit = khanhHoa
    ? splitFeature(khanhHoa, (polygon) => {
        const bounds = polygonBounds(polygon)
        return bounds.maxLatitude < 10.7 || bounds.minLongitude > 110
      })
    : null

  return {
    mainland: {
      ...data,
      features: data.features.flatMap((feature) => {
        if (feature.properties.code === '48' && daNangSplit?.mainland) {
          return [daNangSplit.mainland]
        }
        if (feature.properties.code === '56' && khanhHoaSplit?.mainland) {
          return [khanhHoaSplit.mainland]
        }
        return [feature]
      })
    },
    insets: [
      daNangSplit?.outlying
        ? { feature: daNangSplit.outlying, label: 'Hoàng Sa' }
        : null,
      khanhHoaSplit?.outlying
        ? { feature: khanhHoaSplit.outlying, label: 'Trường Sa' }
        : null
    ].filter((inset): inset is Inset => Boolean(inset))
  }
}

function splitFeature(
  feature: AdministrativeFeature,
  isOutlyingPolygon: (polygon: Position[][]) => boolean
) {
  if (feature.geometry.type !== 'MultiPolygon') {
    return { mainland: feature, outlying: null }
  }

  const mainlandPolygons = [] as Position[][][]
  const outlyingPolygons = [] as Position[][][]

  for (const polygon of feature.geometry.coordinates) {
    const target = isOutlyingPolygon(polygon)
      ? outlyingPolygons
      : mainlandPolygons
    target.push(polygon)
  }

  return {
    mainland: withMultiPolygon(feature, mainlandPolygons),
    outlying: withMultiPolygon(feature, outlyingPolygons)
  }
}

function polygonBounds(polygon: Position[][]) {
  const positions = polygon.flat()

  return positions.reduce(
    (bounds, [longitude, latitude]) => ({
      minLongitude: Math.min(bounds.minLongitude, longitude),
      maxLongitude: Math.max(bounds.maxLongitude, longitude),
      minLatitude: Math.min(bounds.minLatitude, latitude),
      maxLatitude: Math.max(bounds.maxLatitude, latitude)
    }),
    {
      minLongitude: Infinity,
      maxLongitude: -Infinity,
      minLatitude: Infinity,
      maxLatitude: -Infinity
    }
  )
}

function withMultiPolygon(
  feature: AdministrativeFeature,
  coordinates: Position[][][]
): AdministrativeFeature | null {
  if (coordinates.length === 0) return null

  return {
    ...feature,
    geometry: { type: 'MultiPolygon', coordinates }
  }
}

function projectFeatures(
  data: AdministrativeCollection | null
): RenderedPath[] {
  if (!data) return []

  const projection = geoMercator().fitExtent(
    [
      [MAP_PADDING, MAP_PADDING],
      [MAP_WIDTH - MAP_PADDING, MAP_HEIGHT - MAP_PADDING]
    ],
    data
  )
  const pathGenerator = geoPath(projection)

  return data.features.flatMap((feature) => {
    const path = pathGenerator(feature)
    return path ? [{ feature, path }] : []
  })
}

function projectInsetPaths(insets: Inset[]): InsetPath[] {
  return insets.flatMap((inset, index) => {
    const frame = insetFrame(index, insets.length)
    const projection = geoMercator().fitExtent(
      [
        [frame.x + 12, frame.y + 32],
        [frame.x + frame.width - 12, frame.y + frame.height - 12]
      ],
      inset.feature
    )
    const path = geoPath(projection)(inset.feature)

    return path ? [{ inset, path }] : []
  })
}

function insetFrame(index: number, total: number) {
  const totalHeight = total * INSET_HEIGHT + (total - 1) * INSET_GAP
  const startY = MAP_HEIGHT - totalHeight - 22

  return {
    height: INSET_HEIGHT,
    width: INSET_WIDTH,
    x: INSET_X,
    y: startY + index * (INSET_HEIGHT + INSET_GAP)
  }
}

function MapSkeleton() {
  return (
    <div
      aria-label="Đang tải bản đồ"
      className="min-h-[18rem] animate-pulse bg-muted sm:min-h-[24rem]"
    />
  )
}

function MapError({ error }: { error: string | null }) {
  return (
    <div className="flex min-h-[18rem] items-center justify-center p-6 text-center text-sm text-muted-foreground sm:min-h-[24rem]">
      <p>Không thể tải bản đồ. {error}</p>
    </div>
  )
}

export { AdministrativeMap }
