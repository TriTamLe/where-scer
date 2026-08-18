import type { ComponentProps, ReactNode } from 'react'

import { cn } from '#/lib/utils.ts'

import { Checkbox } from './checkbox'

function TypographyH1({ className, ...props }: ComponentProps<'h1'>) {
  return (
    <h1
      className={cn(
        'font-display text-[32px] leading-10 font-bold lg:text-[40px] lg:leading-12',
        className
      )}
      {...props}
    />
  )
}

function TypographyH2({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'pt-8 font-display text-[28px] leading-9 font-bold lg:text-[32px] lg:leading-10',
        className
      )}
      {...props}
    />
  )
}

function TypographyH3({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3
      className={cn('pt-6 text-2xl leading-8 font-bold', className)}
      {...props}
    />
  )
}

function TypographyH4({ className, ...props }: ComponentProps<'h4'>) {
  return (
    <h4
      className={cn('pt-5 text-xl leading-7 font-semibold', className)}
      {...props}
    />
  )
}

function TypographyP({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-base leading-6', className)} {...props} />
}

function TypographyQuote({
  className,
  ...props
}: ComponentProps<'blockquote'>) {
  return (
    <blockquote
      className={cn(
        'border-l-4 border-primary bg-primary-soft px-4 py-4 text-base leading-6',
        className
      )}
      {...props}
    />
  )
}

function TypographyBulletList({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      className={cn(
        'ml-4 list-disc space-y-2 pl-4 text-base leading-6',
        className
      )}
      {...props}
    />
  )
}

function TypographyNumberList({ className, ...props }: ComponentProps<'ol'>) {
  return (
    <ol
      className={cn(
        'ml-4 list-decimal space-y-3 pl-4 text-base leading-6',
        className
      )}
      {...props}
    />
  )
}

function TypographyTaskList({ className, ...props }: ComponentProps<'ul'>) {
  return <ul className={cn('space-y-3', className)} role="list" {...props} />
}

function TypographyTaskListItem({
  ariaLabel,
  checked,
  children,
  className
}: {
  readonly ariaLabel: string
  readonly checked: boolean
  readonly children: ReactNode
  readonly className?: string
}) {
  return (
    <li
      className={cn('flex items-center gap-3 text-base leading-6', className)}
    >
      <Checkbox checked={checked} aria-label={ariaLabel} />
      <span className={checked ? 'text-foreground' : 'text-muted-foreground'}>
        {children}
      </span>
    </li>
  )
}

export {
  TypographyBulletList,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyNumberList,
  TypographyP,
  TypographyQuote,
  TypographyTaskList,
  TypographyTaskListItem
}
