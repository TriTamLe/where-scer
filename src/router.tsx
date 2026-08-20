import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import TanstackQueryProvider, {
  getContext
} from './integrations/tanstack-query/root-provider'
import { ConvexAppProvider } from './integrations/convex/provider.tsx'

export function getRouter() {
  const context = getContext()

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    Wrap: ({ children }) => (
      <ConvexAppProvider>
        <TanstackQueryProvider queryClient={context.queryClient}>
          {children}
        </TanstackQueryProvider>
      </ConvexAppProvider>
    )
  })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
