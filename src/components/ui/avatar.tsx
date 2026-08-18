import * as React from 'react'
import { Avatar as AvatarPrimitive } from 'radix-ui'

import { cn } from '#/lib/utils.ts'

function Avatar({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: 'sm' | 'default' | 'lg' | 'xl'
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        'group/avatar relative flex size-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted select-none data-[size=sm]:size-8 data-[size=lg]:size-16 data-[size=xl]:size-30',
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center bg-secondary-soft text-sm font-semibold text-muted-foreground group-data-[size=sm]/avatar:text-xs group-data-[size=xl]/avatar:text-2xl',
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage }
