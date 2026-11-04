import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { VideoEmbed } from '@/components/VideoEmbed'

export const DHVideoHero: React.FC<Page['hero']> = ({ eyebrow, links, richText, videoUrl }) => {
  return (
    <section
      className="relative flex min-h-[85vh] items-end overflow-hidden bg-black text-white"
      data-theme="dark"
    >
      <VideoEmbed background title="DH reel" url={videoUrl} />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/10" />
      <div className="container relative z-10 pb-16 md:pb-24">
        {eyebrow && (
          <p className="mb-6 text-sm font-semibold tracking-widest text-dh-lavender uppercase">
            {eyebrow}
          </p>
        )}
        {richText && (
          <RichText
            className="m-0 max-w-5xl font-serif [&_h1]:text-4xl [&_h1]:leading-tight [&_h1]:font-normal md:[&_h1]:text-6xl lg:[&_h1]:text-7xl"
            data={richText}
            enableGutter={false}
          />
        )}
        {Array.isArray(links) && links.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-4">
            {links.map(({ link }, i) => (
              <CMSLink className="rounded-full" key={i} size="lg" {...link} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
