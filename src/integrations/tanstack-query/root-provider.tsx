import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { QueryClient as QueryClientType } from '@tanstack/react-query'
import type { ReactNode } from 'react'

export function getContext() {
  const queryClient = new QueryClient()

  return {
    queryClient
  }
}

export default function TanstackQueryProvider({
  children,
  queryClient
}: {
  readonly children: ReactNode
  readonly queryClient: QueryClientType
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
