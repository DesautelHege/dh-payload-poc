import { cn } from '@/utilities/ui'
import React from 'react'

// Turns a pasted Vimeo or YouTube link into an embeddable player URL
export const getEmbedUrl = (url: string, background = false): string | null => {
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-z0-9]+))?/i)
  if (vimeo) {
    const hash = url.match(/[?&]h=([a-z0-9]+)/i)?.[1] || vimeo[2]
    const params = new URLSearchParams({ dnt: '1' })
    if (hash) params.set('h', hash)
    if (background) params.set('background', '1')
    return `https://player.vimeo.com/video/${vimeo[1]}?${params.toString()}`
  }

  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (youtube) {
    const params = background ? `?autoplay=1&mute=1&loop=1&controls=0&playlist=${youtube[1]}` : ''
    return `https://www.youtube-nocookie.com/embed/${youtube[1]}${params}`
  }

  return null
}

export const VideoEmbed: React.FC<{
  background?: boolean
  className?: string
  title?: string
  url?: string | null
}> = ({ background = false, className, title = 'Video', url }) => {
  const src = url ? getEmbedUrl(url, background) : null
  if (!src) return null

  if (background) {
    // Oversized and centered so the 16:9 player always covers its container
    return (
      <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
        <iframe
          allow="autoplay; fullscreen"
          aria-hidden
          className="absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
          src={src}
          tabIndex={-1}
          title={title}
        />
      </div>
    )
  }

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden', className)}>
      <iframe
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
        loading="lazy"
        src={src}
        title={title}
      />
    </div>
  )
}
