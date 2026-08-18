import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '#/lib/utils.ts'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-primary bg-primary text-primary-foreground hover:border-primary-strong hover:bg-primary-strong',
        destructive:
          'border-destructive bg-destructive text-destructive-foreground hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]',
        outline:
          'border-border bg-card text-foreground hover:bg-secondary-soft',
        secondary:
          'border-secondary-soft bg-secondary-soft text-secondary-foreground hover:border-secondary-muted hover:bg-secondary-muted',
        ghost:
          'border-transparent hover:bg-secondary-soft hover:text-foreground',
        link: 'h-auto border-transparent text-[var(--secondary-strong)] underline underline-offset-4 hover:text-foreground'
      },
      size: {
        default: 'h-10 px-4 text-sm has-[>svg]:px-3',
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-9 gap-1.5 px-[14px] text-sm has-[>svg]:px-2.5',
        lg: 'h-12 px-5 text-base has-[>svg]:px-4',
        icon: 'size-11',
        'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
