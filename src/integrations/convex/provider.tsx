import { ConvexProvider, ConvexReactClient } from 'convex/react'
import type { ReactNode } from 'react'

declare global {
  interface Window {
    __WHERE_SCER_CONFIG__?: { convexUrl?: string }
  }
}

const convexUrl =
  (typeof window === 'undefined'
    ? undefined
    : window.__WHERE_SCER_CONFIG__?.convexUrl) ??
  import.meta.env.VITE_CONVEX_URL
const client = new ConvexReactClient(
  convexUrl ?? 'https://missing-convex-url.convex.cloud'
)

function ConvexAppProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={client}>{children}</ConvexProvider>
}

export { ConvexAppProvider, convexUrl }
