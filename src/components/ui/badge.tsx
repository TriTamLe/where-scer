import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '#/lib/utils.ts'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-xs leading-normal font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-border bg-card text-muted-foreground',
        secondary:
          'border-primary bg-primary text-primary-foreground [a&]:hover:bg-primary-strong',
        destructive:
          'border-destructive bg-destructive-background text-destructive [a&]:hover:bg-accent-muted',
        outline:
          'border-border bg-card text-foreground [a&]:hover:bg-secondary-soft',
        ghost: '[a&]:hover:bg-secondary-soft [a&]:hover:text-foreground',
        link: 'border-transparent text-[var(--secondary-strong)] underline-offset-4 [a&]:hover:underline'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
