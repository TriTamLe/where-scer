import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '#/lib/utils.ts'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border font-semibold whitespace-nowrap outline-none transition-[background-color,border-color,color,box-shadow,transform] duration-[140ms] ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 data-[state=loading]:cursor-wait data-[state=loading]:opacity-70 data-[state=error]:border-destructive data-[state=error]:bg-destructive-background data-[state=success]:border-success data-[state=success]:bg-success-background [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-primary-strong bg-primary text-primary-foreground shadow-[0_4px_0_var(--primary-strong),0_6px_12px_-3px_var(--primary-muted)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_var(--primary-strong),0_12px_22px_-4px_var(--primary-muted)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--primary-strong),0_2px_6px_-2px_var(--primary-muted)]',
        destructive:
          'border-destructive bg-destructive text-destructive-foreground shadow-[0_4px_0_var(--accent-strong)] hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-[0_1px_0_var(--accent-strong)]',
        outline:
          'border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-secondary-muted hover:bg-secondary-soft active:translate-y-px',
        secondary:
          'border-secondary-muted bg-secondary-soft text-secondary-foreground shadow-[0_3px_0_var(--secondary-muted)] hover:-translate-y-0.5 hover:bg-secondary-muted active:translate-y-[2px] active:shadow-[0_1px_0_var(--secondary-muted)]',
        ghost:
          'border-transparent hover:-translate-y-0.5 hover:bg-secondary-soft hover:text-foreground active:translate-y-px',
        link: 'h-auto border-transparent text-[var(--secondary-strong)] underline underline-offset-4 hover:text-foreground'
      },
      size: {
        default: 'h-11 px-5 text-sm has-[>svg]:px-4',
        xs: "h-7 gap-1 rounded-full px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-9 gap-1.5 px-4 text-sm has-[>svg]:px-3',
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
