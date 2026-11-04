import React from 'react'

import type { Page } from '@/payload-types'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const DHStatementHero: React.FC<Page['hero']> = ({ media, richText }) => {
  return (
    <section className="bg-black text-white" data-theme="dark">
      <div className="container pt-20 pb-16 md:pt-28 md:pb-20">
        {richText && (
          <RichText
            className="m-0 max-w-5xl [&_h1]:font-serif [&_h1]:text-4xl [&_h1]:leading-tight [&_h1]:font-normal md:[&_h1]:text-6xl lg:[&_h1]:text-7xl [&_h4]:mt-10 [&_h4]:max-w-3xl [&_h4]:font-serif [&_h4]:text-2xl [&_h4]:leading-snug [&_h4]:text-dh-lavender [&_p]:max-w-3xl [&_p]:text-lg md:[&_p]:text-xl"
            data={richText}
            enableGutter={false}
          />
        )}
      </div>
      {media && typeof media === 'object' && (
        <div className="relative aspect-[21/9] w-full">
          <Media fill imgClassName="object-cover" priority resource={media} size="100vw" />
        </div>
      )}
    </section>
  )
}
