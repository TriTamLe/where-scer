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
        title: 'Tam.'
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
  const runtimeConfig = JSON.stringify({
    convexUrl: typeof process === 'undefined' ? '' : process.env.VITE_CONVEX_URL
  }).replace(/</g, '\\u003c')

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__WHERE_SCER_CONFIG__=${runtimeConfig};`
          }}
        />
        {children}
        <FaviconThemeSync />
        <Scripts />
      </body>
    </html>
  )
}

function FaviconThemeSync() {
  useEffect(() => {
    const root = document.documentElement

    function syncFavicon() {
      const favicon = document.querySelector<HTMLLinkElement>('#site-favicon')

      if (!favicon) return

      const isDark =
        root.dataset.theme === 'dark' || root.classList.contains('dark')

      favicon.href = isDark
        ? '/images/favicon.dark.svg'
        : '/images/favicon.light.svg'
    }

    syncFavicon()

    const observer = new MutationObserver(syncFavicon)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    })

    return () => observer.disconnect()
  }, [])

  return null
}
