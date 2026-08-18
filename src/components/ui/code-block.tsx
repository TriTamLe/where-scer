import { all, createLowlight } from 'lowlight'
import type { Content } from 'hast'
import { useEffect, useId, useState } from 'react'

import { cn } from '#/lib/utils.ts'

import { Badge } from './badge'

const lowlight = createLowlight(all)

type CodeBlockProps = {
  readonly children: string
  readonly className?: string
  readonly language?: string
}

function CodeBlock({ children, className, language }: CodeBlockProps) {
  if (language === 'mermaid') {
    return <MermaidDiagram className={className}>{children}</MermaidDiagram>
  }

  const highlighted =
    language && lowlight.registered(language)
      ? lowlight.highlight(language, children).children
      : lowlight.highlightAuto(children).children

  return (
    <div
      data-slot="code-block"
      className={cn('overflow-x-auto rounded-lg border bg-card p-4', className)}
    >
      {language ? (
        <Badge className="mb-3 font-mono text-[11px]" variant="outline">
          {language}
        </Badge>
      ) : null}
      <pre className="font-mono text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
        <code>{highlighted.map(renderHighlightedNode)}</code>
      </pre>
    </div>
  )
}

function MermaidDiagram({
  children,
  className
}: Omit<CodeBlockProps, 'language'>) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [svg, setSvg] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const root = document.documentElement
    const syncTheme = () => {
      setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light')
    }

    syncTheme()
    const observer = new MutationObserver(syncTheme)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let isCurrent = true

    async function renderDiagram() {
      try {
        setSvg(null)
        setHasError(false)
        const mermaid = (await import('mermaid')).default
        const styles = getComputedStyle(document.documentElement)

        mermaid.initialize({
          securityLevel: 'strict',
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            background: styles.getPropertyValue('--surface').trim(),
            lineColor: styles.getPropertyValue('--border').trim(),
            primaryBorderColor: styles.getPropertyValue('--foreground').trim(),
            primaryColor: styles.getPropertyValue('--secondary-soft').trim(),
            primaryTextColor: styles.getPropertyValue('--foreground').trim(),
            secondaryColor: styles
              .getPropertyValue('--surface-elevated')
              .trim(),
            tertiaryColor: styles.getPropertyValue('--background').trim(),
            textColor: styles.getPropertyValue('--foreground').trim()
          }
        })

        const result = await mermaid.render(`mermaid-${id}-${theme}`, children)
        if (isCurrent) setSvg(result.svg)
      } catch {
        if (isCurrent) setHasError(true)
      }
    }

    void renderDiagram()

    return () => {
      isCurrent = false
    }
  }, [children, id, theme])

  return (
    <div
      data-slot="mermaid-diagram"
      className={cn('rounded-lg border bg-card p-4', className)}
    >
      <div className="flex justify-end">
        <Badge className="font-mono text-[11px]" variant="outline">
          mermaid
        </Badge>
      </div>
      <div className="mt-4 min-h-24 overflow-x-auto rounded-md border border-dashed p-4">
        {svg ? (
          <div
            aria-label="Mermaid diagram"
            className="min-w-max [&_svg]:mx-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {hasError
              ? 'Unable to render Mermaid diagram.'
              : 'Rendering diagram…'}
          </p>
        )}
      </div>
    </div>
  )
}

function renderHighlightedNode(node: Content, index: number): React.ReactNode {
  if (node.type === 'text') return node.value
  if (node.type !== 'element') return null

  const className = node.properties.className
  const classes = Array.isArray(className)
    ? className.filter((value): value is string => typeof value === 'string')
    : typeof className === 'string'
      ? [className]
      : []

  return (
    <span className={cn(...classes)} key={`${node.tagName}-${index}`}>
      {node.children.map(renderHighlightedNode)}
    </span>
  )
}

export { CodeBlock, MermaidDiagram }
export type { CodeBlockProps }
