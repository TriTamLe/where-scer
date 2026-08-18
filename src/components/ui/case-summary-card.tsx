import * as React from 'react'

import { cn } from '#/lib/utils.ts'

type CaseSummaryDetail = {
  label: string
  value: React.ReactNode
}

type CaseSummaryCardProps = React.ComponentProps<'article'> & {
  action?: React.ReactNode
  details: ReadonlyArray<CaseSummaryDetail>
  meta: React.ReactNode
  summary: React.ReactNode
  title: React.ReactNode
}

function CaseSummaryCard({
  action,
  className,
  details,
  meta,
  summary,
  title,
  ...props
}: CaseSummaryCardProps) {
  return (
    <article
      data-slot="case-summary-card"
      className={cn(
        'flex w-full flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground sm:p-5',
        className
      )}
      {...props}
    >
      <p className="text-[13px] leading-[18px] font-semibold text-muted-foreground">
        {meta}
      </p>
      <h2 className="text-xl leading-7 font-semibold">{title}</h2>
      <div className="text-base leading-6 text-muted-foreground">{summary}</div>
      <dl className="flex flex-col gap-4">
        {details.map((detail) => (
          <div
            className="grid gap-1 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-6"
            key={detail.label}
          >
            <dt className="text-[13px] leading-[18px] font-semibold text-muted-foreground">
              {detail.label}
            </dt>
            <dd className="text-sm leading-5 text-muted-foreground">
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>
      {action ? (
        <div className="pt-1 text-sm font-semibold text-[var(--secondary-strong)] underline-offset-4 hover:underline">
          {action}
        </div>
      ) : null}
    </article>
  )
}

export { CaseSummaryCard }
export type { CaseSummaryCardProps, CaseSummaryDetail }
