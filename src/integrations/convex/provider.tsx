import { ConvexProvider, ConvexReactClient } from 'convex/react'
import type { ReactNode } from 'react'

import { convexUrl } from './config.ts'

function ConvexAppProvider({ children }: { children: ReactNode }) {
  if (!convexUrl) {
    return (
      <main className="grid min-h-dvh place-items-center p-6">
        <section className="soft-panel max-w-md p-6 text-center">
          <h1 className="text-lg font-bold">Chưa kết nối được bản đồ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Không thể tải cấu hình kết nối. Vui lòng tải lại trang.
          </p>
        </section>
      </main>
    )
  }

  const client = new ConvexReactClient(convexUrl)

  return <ConvexProvider client={client}>{children}</ConvexProvider>
}

export { ConvexAppProvider }
