import {
  HeadContent,
  Scripts,
  createRootRouteWithContext
} from '@tanstack/react-router'
import { useEffect } from 'react'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  ssr: false,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        title: 'Where SC-er?'
      }
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss
      },
      {
        id: 'site-favicon',
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/images/favicon.light.svg'
      }
    ]
  }),
  shellComponent: RootDocument
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <BrowserThemeSync />
        <Scripts />
      </body>
    </html>
  )
}

function BrowserThemeSync() {
  useEffect(() => {
    const root = document.documentElement
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')

    function syncTheme() {
      root.dataset.theme = colorScheme.matches ? 'dark' : 'light'

      const favicon = document.querySelector<HTMLLinkElement>('#site-favicon')

      if (!favicon) return

      favicon.href = colorScheme.matches
        ? '/images/favicon.dark.svg'
        : '/images/favicon.light.svg'
    }

    syncTheme()
    colorScheme.addEventListener('change', syncTheme)

    return () => colorScheme.removeEventListener('change', syncTheme)
  }, [])

  return null
}
