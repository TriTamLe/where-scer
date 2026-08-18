import { geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import type { MapProps } from '#/components/map-types.ts'

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

function AdministrativeMap({
  activeFill,
  activeStroke,
  activeStrokeWidth,
  activeValues,
  ariaLabel,
  dataUrl,
  defaultFill,
  defaultStroke,
  defaultStrokeWidth,
  description,
  onChange,
  title,
  variant
}: AdministrativeMapProps) {
  const id = useId()
  const [containerRef, width] = useElementWidth<HTMLDivElement>()
  const [data, status, error] = useDeferredGeoData(dataUrl, containerRef)
  const [hoveredCode, setHoveredCode] = useState<string>('')
  const [focusedCode, setFocusedCode] = useState<string>('')
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const selectedFeatures = activeValues.flatMap((code) => {
    const feature = data?.features.find(
      (candidate) => candidate.properties.code === code
    )
    return feature ? [feature] : []
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
  const outlinedMainlandPaths = mainlandPaths.filter(({ feature }) =>
    activeValues.includes(feature.properties.code)
  )
  const isWardMap = variant === 'ward'

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

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="rounded-xl border bg-card p-4 shadow-sm sm:p-6"
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
          isWardMap
            ? 'relative mt-5 min-h-80 w-full overflow-hidden rounded-lg border bg-background sm:min-h-105'
            : 'relative mt-5 min-h-72 w-full overflow-hidden rounded-lg border bg-background sm:min-h-96'
        }
      >
        {status === 'loading' ? <MapSkeleton /> : null}
        {status === 'error' ? <MapError error={error} /> : null}
        {data && width > 0 ? (
          <svg
            aria-label={ariaLabel}
            className="block h-auto w-full"
            role="group"
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          >
            <desc>{description}</desc>
            {mainlandPaths.map(({ feature, path }) => (
              <RegionPath
                key={`mainland-${feature.properties.code}`}
                activeFill={activeFill}
                activeStroke={activeStroke}
                activeStrokeWidth={activeStrokeWidth}
                defaultFill={defaultFill}
                defaultStroke={defaultStroke}
                defaultStrokeWidth={defaultStrokeWidth}
                feature={feature}
                focused={feature.properties.code === focusedCode}
                hovered={feature.properties.code === hoveredCode}
                path={path}
                selected={activeValues.includes(feature.properties.code)}
                onFocusChange={setFocusedCode}
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
              />
            ))}
            {insetPaths.map(({ inset, path }, index) => (
              <MapInset
                key={`inset-${inset.feature.properties.code}`}
                index={index}
                inset={inset}
                path={path}
                total={insetPaths.length}
                activeFill={activeFill}
                activeStroke={activeStroke}
                activeStrokeWidth={activeStrokeWidth}
                activeValues={activeValues}
                defaultFill={defaultFill}
                defaultStroke={defaultStroke}
                defaultStrokeWidth={defaultStrokeWidth}
                hoveredCode={hoveredCode}
                focusedCode={focusedCode}
                onFocusChange={setFocusedCode}
                onHoverChange={setHoveredCode}
                onSelect={toggleActiveValue}
                onTooltipHide={hideTooltip}
                onTooltipShow={showTooltip}
              />
            ))}
          </svg>
        ) : null}
        {tooltip ? <MapTooltip tooltip={tooltip} /> : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <div>
          <label className="text-sm font-semibold" htmlFor={`${id}-select`}>
            Chọn {isWardMap ? 'phường/xã' : 'tỉnh/thành'}
          </label>
          <select
            className="mt-2 min-h-11 w-full rounded-md border bg-background px-3 text-sm text-foreground"
            disabled={!data}
            id={`${id}-select`}
            multiple
            size={Math.min(data?.features.length ?? 4, 6)}
            value={activeValues}
            onChange={(event) =>
              onChange(
                Array.from(
                  event.currentTarget.selectedOptions,
                  (option) => option.value
                )
              )
            }
          >
            {data?.features.map((feature) => (
              <option
                key={feature.properties.code}
                value={feature.properties.code}
              >
                {feature.properties.fullName} — {feature.properties.code}
              </option>
            ))}
          </select>
        </div>

        <div aria-live="polite" className="rounded-lg bg-muted p-4">
          {selectedFeatures.length > 0 ? (
            <div>
              <p className="text-sm font-semibold">
                Đã chọn {selectedFeatures.length} đơn vị
              </p>
              <ul className="mt-2 grid gap-2">
                {selectedFeatures.map((feature) => (
                  <li key={feature.properties.code} className="text-sm">
                    <span className="font-medium">
                      {feature.properties.fullName}
                    </span>
                    <span className="text-muted-foreground">
                      {' '}
                      — {feature.properties.code}
                      {feature.properties.areaKm2
                        ? ` · ${formatArea(feature.properties.areaKm2)} km²`
                        : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chọn một hoặc nhiều vùng trên bản đồ hoặc từ danh sách để xem
              thông tin.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

type RegionPathProps = {
  activeFill: string
  activeStroke: string
  activeStrokeWidth: number
  defaultFill: string
  defaultStroke: string
  defaultStrokeWidth: number
  feature: AdministrativeFeature
  focused: boolean
  hovered: boolean
  path: string
  selected: boolean
  onFocusChange: (code: string) => void
  onHoverChange: (code: string) => void
  onSelect: (code: string) => void
  onTooltipHide: () => void
  onTooltipShow: (
    event: React.PointerEvent<SVGElement>,
    feature: AdministrativeFeature
  ) => void
}

function RegionPath({
  activeFill,
  activeStroke,
  activeStrokeWidth,
  defaultFill,
  defaultStroke,
  defaultStrokeWidth,
  feature,
  focused,
  hovered,
  path,
  selected,
  onFocusChange,
  onHoverChange,
  onSelect,
  onTooltipHide,
  onTooltipShow
}: RegionPathProps) {
  const { code, fullName } = feature.properties

  return (
    <path
      aria-label={`${fullName}, mã ${code}`}
      aria-pressed={selected}
      className="cursor-pointer transition-colors duration-200 motion-reduce:transition-none"
      d={path}
      fill={selected ? activeFill : hovered ? defaultStroke : defaultFill}
      role="button"
      stroke={focused ? activeStroke : defaultStroke}
      strokeWidth={focused ? activeStrokeWidth : defaultStrokeWidth}
      style={{ outline: 'none' }}
      tabIndex={0}
      onBlur={() => {
        onFocusChange('')
        onHoverChange('')
      }}
      onClick={() => onSelect(code)}
      onFocus={() => {
        onFocusChange(code)
        onHoverChange(code)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(code)
        }
      }}
      onPointerEnter={(event) => {
        onHoverChange(code)
        onTooltipShow(event, feature)
      }}
      onPointerLeave={() => {
        onHoverChange('')
        onTooltipHide()
      }}
      onPointerMove={(event) => onTooltipShow(event, feature)}
    />
  )
}

type MapInsetProps = {
  activeFill: string
  activeStroke: string
  activeStrokeWidth: number
  activeValues: readonly string[]
  defaultFill: string
  defaultStroke: string
  defaultStrokeWidth: number
  focusedCode: string
  hoveredCode: string
  index: number
  inset: Inset
  onFocusChange: (code: string) => void
  onHoverChange: (code: string) => void
  onSelect: (code: string) => void
  onTooltipHide: () => void
  onTooltipShow: RegionPathProps['onTooltipShow']
  path: string
  total: number
}

function MapInset({
  activeFill,
  activeStroke,
  activeStrokeWidth,
  activeValues,
  defaultFill,
  defaultStroke,
  defaultStrokeWidth,
  focusedCode,
  hoveredCode,
  index,
  inset,
  path,
  total,
  onFocusChange,
  onHoverChange,
  onSelect,
  onTooltipHide,
  onTooltipShow
}: MapInsetProps) {
  const { feature, label } = inset
  const { code } = feature.properties
  const frame = insetFrame(index, total)
  const selected = activeValues.includes(code)
  const hovered = code === hoveredCode
  const focused = code === focusedCode

  return (
    <g aria-label={`Ô hiển thị quần đảo ${label}`} role="group">
      <rect
        aria-label={`${label}, chọn ${feature.properties.fullName}, mã ${code}`}
        aria-pressed={selected}
        className="cursor-pointer transition-colors duration-200 motion-reduce:transition-none"
        fill={selected ? activeFill : hovered ? defaultStroke : defaultFill}
        height={frame.height}
        rx="12"
        role="button"
        stroke={focused ? activeStroke : defaultStroke}
        strokeWidth={focused ? activeStrokeWidth : defaultStrokeWidth}
        style={{ outline: 'none' }}
        tabIndex={0}
        width={frame.width}
        x={frame.x}
        y={frame.y}
        onBlur={() => {
          onFocusChange('')
          onHoverChange('')
        }}
        onClick={() => onSelect(code)}
        onFocus={() => {
          onFocusChange(code)
          onHoverChange(code)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelect(code)
          }
        }}
        onPointerEnter={(event) => {
          onHoverChange(code)
          onTooltipShow(event, feature)
        }}
        onPointerLeave={() => {
          onHoverChange('')
          onTooltipHide()
        }}
        onPointerMove={(event) => onTooltipShow(event, feature)}
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
        fill={selected ? activeFill : defaultFill}
        pointerEvents="none"
        stroke={focused ? activeStroke : defaultStroke}
        strokeWidth={focused ? activeStrokeWidth : defaultStrokeWidth}
      />
    </g>
  )
}

function MapTooltip({ tooltip }: { tooltip: TooltipState }) {
  return (
    <div
      className="pointer-events-none absolute z-10 max-w-52 rounded-md border bg-popover px-3 py-2 text-sm shadow-md"
      role="tooltip"
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      <p className="font-semibold">{tooltip.feature.properties.fullName}</p>
      <p className="mt-0.5 text-muted-foreground">
        Mã: {tooltip.feature.properties.code}
      </p>
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
        return response.json() as Promise<AdministrativeCollection>
      })
      .then(setData)
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

function formatArea(area: number) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(
    area
  )
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
