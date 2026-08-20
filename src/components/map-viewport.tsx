import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '#/components/ui/button.tsx'

const DRAG_THRESHOLD = 6
const DEFAULT_MAX_ZOOM = 4
const ZOOM_STEP = 0.5

type MapViewport = { panX: number; panY: number; zoom: number }
type PointerPosition = { x: number; y: number }
type Options = {
  enabled?: boolean
  maxZoom?: number
  panEnabled?: boolean
  pinchEnabled?: boolean
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function clampViewport(viewport: MapViewport): MapViewport {
  const maxPan = (viewport.zoom - 1) / 2
  return {
    ...viewport,
    panX: clamp(viewport.panX, -maxPan, maxPan),
    panY: clamp(viewport.panY, -maxPan, maxPan)
  }
}

function pointInViewport(clientX: number, clientY: number, element: Element) {
  const bounds = element.getBoundingClientRect()
  return {
    x: (clientX - bounds.left) / bounds.width - 0.5,
    y: (clientY - bounds.top) / bounds.height - 0.5
  }
}

function midpoint(first: PointerPosition, second: PointerPosition) {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
}

function distance(first: PointerPosition, second: PointerPosition) {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

function useMapViewport(options: Options = {}) {
  const {
    enabled = true,
    maxZoom = DEFAULT_MAX_ZOOM,
    panEnabled = true,
    pinchEnabled = true
  } = options
  const [viewport, setViewport] = useState<MapViewport>({
    panX: 0,
    panY: 0,
    zoom: 1
  })
  const drag = useRef<{
    panX: number
    panY: number
    pointerId: number
    startX: number
    startY: number
  } | null>(null)
  const pointers = useRef(new Map<number, PointerPosition>())
  const pinch = useRef<{
    anchor: PointerPosition
    midpoint: PointerPosition
    panX: number
    panY: number
    startDistance: number
    zoom: number
  } | null>(null)
  const isPanningRef = useRef(false)
  const isPinchingRef = useRef(false)
  const didGestureRef = useRef(false)
  const viewportRef = useRef(viewport)
  const [wheelTarget, setWheelTarget] = useState<Element | null>(null)

  useEffect(() => {
    viewportRef.current = viewport
  }, [viewport])

  useEffect(() => {
    if (!enabled) setViewport({ panX: 0, panY: 0, zoom: 1 })
  }, [enabled])

  const zoomAt = useCallback(
    (nextZoom: number, anchor: PointerPosition) => {
      setViewport((current) => {
        const zoom = clamp(nextZoom, 1, maxZoom)
        return clampViewport({
          zoom,
          panX: current.panX + (current.zoom - zoom) * anchor.x,
          panY: current.panY + (current.zoom - zoom) * anchor.y
        })
      })
    },
    [maxZoom]
  )

  const changeZoom = useCallback(
    (amount: number) => zoomAt(viewport.zoom + amount, { x: 0, y: 0 }),
    [viewport.zoom, zoomAt]
  )

  const reset = useCallback(() => {
    setViewport({ panX: 0, panY: 0, zoom: 1 })
  }, [])

  const handleWheel = useCallback(
    (event: Event) => {
      if (!enabled) return
      event.preventDefault()
      const wheelEvent = event as WheelEvent
      zoomAt(
        viewportRef.current.zoom +
          (wheelEvent.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP),
        pointInViewport(
          wheelEvent.clientX,
          wheelEvent.clientY,
          event.currentTarget as Element
        )
      )
    },
    [enabled, zoomAt]
  )

  useEffect(() => {
    if (!wheelTarget) return
    wheelTarget.addEventListener('wheel', handleWheel, { passive: false })
    return () => wheelTarget.removeEventListener('wheel', handleWheel)
  }, [handleWheel, wheelTarget])

  const wheelRef = useCallback((element: Element | null) => {
    setWheelTarget(element)
  }, [])

  const beginPinch = useCallback(
    (element: HTMLElement) => {
      const positions = [...pointers.current.values()]
      if (positions.length < 2) return
      const [first, second] = positions
      const currentMidpoint = midpoint(first, second)
      pinch.current = {
        anchor: pointInViewport(currentMidpoint.x, currentMidpoint.y, element),
        midpoint: currentMidpoint,
        panX: viewport.panX,
        panY: viewport.panY,
        startDistance: distance(first, second),
        zoom: viewport.zoom
      }
      drag.current = null
      isPanningRef.current = true
      isPinchingRef.current = true
    },
    [viewport]
  )

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return
      pointers.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      })
      if (pinchEnabled && pointers.current.size >= 2) {
        beginPinch(event.currentTarget)
        return
      }
      if (!panEnabled || viewport.zoom <= 1) return
      drag.current = {
        panX: viewport.panX,
        panY: viewport.panY,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY
      }
      isPanningRef.current = false
      didGestureRef.current = false
    },
    [beginPinch, enabled, panEnabled, pinchEnabled, viewport]
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled) return
      if (pointers.current.has(event.pointerId)) {
        pointers.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY
        })
      }
      const pinchState = pinch.current
      if (pinchEnabled && pinchState && pointers.current.size >= 2) {
        const [first, second] = [...pointers.current.values()]
        const currentMidpoint = midpoint(first, second)
        const bounds = event.currentTarget.getBoundingClientRect()
        const zoom = clamp(
          pinchState.zoom *
            (distance(first, second) / pinchState.startDistance),
          1,
          maxZoom
        )
        didGestureRef.current = true
        setViewport(() =>
          clampViewport({
            zoom,
            panX:
              pinchState.panX +
              (pinchState.zoom - zoom) * pinchState.anchor.x +
              (currentMidpoint.x - pinchState.midpoint.x) / bounds.width,
            panY:
              pinchState.panY +
              (pinchState.zoom - zoom) * pinchState.anchor.y +
              (currentMidpoint.y - pinchState.midpoint.y) / bounds.height
          })
        )
        return
      }
      const dragState = drag.current
      if (!dragState || dragState.pointerId !== event.pointerId) return
      const deltaX = event.clientX - dragState.startX
      const deltaY = event.clientY - dragState.startY
      if (!isPanningRef.current) {
        if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return
        event.currentTarget.setPointerCapture(event.pointerId)
        isPanningRef.current = true
        didGestureRef.current = true
      }
      const bounds = event.currentTarget.getBoundingClientRect()
      setViewport((current) =>
        clampViewport({
          ...current,
          panX: dragState.panX + deltaX / bounds.width,
          panY: dragState.panY + deltaY / bounds.height
        })
      )
    },
    [enabled, maxZoom, pinchEnabled]
  )

  const onPointerEnd = useCallback((event: React.PointerEvent<HTMLElement>) => {
    pointers.current.delete(event.pointerId)
    if (drag.current?.pointerId === event.pointerId) drag.current = null
    if (pointers.current.size < 2) {
      pinch.current = null
      isPinchingRef.current = false
    }
    window.setTimeout(() => {
      isPanningRef.current = false
    }, 0)
  }, [])

  const onClickCapture = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (!didGestureRef.current) return
    event.preventDefault()
    event.stopPropagation()
    didGestureRef.current = false
  }, [])

  return {
    ...viewport,
    canZoomIn: viewport.zoom < maxZoom,
    canZoomOut: viewport.zoom > 1,
    changeZoom,
    isPinchingRef,
    isPanningRef,
    onClickCapture,
    onPointerDown,
    onPointerEnd,
    onPointerMove,
    reset,
    wheelRef
  }
}

function MapZoomControls({
  canZoomIn,
  canZoomOut,
  changeZoom,
  reset,
  zoom
}: Pick<
  ReturnType<typeof useMapViewport>,
  'canZoomIn' | 'canZoomOut' | 'changeZoom' | 'reset' | 'zoom'
>) {
  return (
    <div
      aria-label="Điều khiển thu phóng bản đồ"
      className="absolute right-3 top-3 z-20 flex flex-col gap-1"
      data-map-controls
      role="group"
      onPointerDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <Button
        aria-label="Phóng to bản đồ"
        disabled={!canZoomIn}
        size="icon-sm"
        variant="outline"
        onClick={() => changeZoom(ZOOM_STEP)}
      >
        <ZoomIn />
      </Button>
      <Button
        aria-label="Thu nhỏ bản đồ"
        disabled={!canZoomOut}
        size="icon-sm"
        variant="outline"
        onClick={() => changeZoom(-ZOOM_STEP)}
      >
        <ZoomOut />
      </Button>
      <Button
        aria-label="Đặt lại vị trí bản đồ"
        disabled={zoom === 1}
        size="icon-sm"
        variant="outline"
        onClick={reset}
      >
        <RotateCcw />
      </Button>
    </div>
  )
}

export { MapZoomControls, useMapViewport }
