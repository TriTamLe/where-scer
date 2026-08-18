import type { ComponentProps } from 'react'

import { cn } from '#/lib/utils.ts'

import { AspectRatio } from './aspect-ratio'

type ImageProps = ComponentProps<'img'> & {
  readonly aspectRatio?: number
  readonly containerClassName?: string
}

function Image({
  alt,
  aspectRatio,
  className,
  containerClassName,
  ...props
}: ImageProps) {
  const image = (
    <img
      data-slot="image"
      alt={alt}
      className={cn('size-full rounded-md border object-cover', className)}
      {...props}
    />
  )

  if (!aspectRatio) return image

  return (
    <AspectRatio
      data-slot="image-aspect-ratio"
      ratio={aspectRatio}
      className={cn('overflow-hidden rounded-lg', containerClassName)}
    >
      {image}
    </AspectRatio>
  )
}

export { Image }
export type { ImageProps }
