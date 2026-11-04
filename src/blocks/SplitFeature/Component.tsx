import { cn } from '@/utilities/ui'
import React from 'react'

import type { SplitFeatureBlock as SplitFeatureBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { Section } from '@/components/Section'
import { VideoEmbed } from '@/components/VideoEmbed'

export const SplitFeatureBlock: React.FC<SplitFeatureBlockProps> = ({
  body,
  heading,
  links,
  media,
  mediaPosition,
  mediaType,
  theme,
  videoUrl,
}) => {
  return (
    <Section theme={theme}>
      <div className="container grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className={cn({ 'md:order-2': mediaPosition === 'left' })}>
          <h2 className="font-serif text-4xl leading-tight md:text-6xl">{heading}</h2>
          {body && <p className="mt-6 max-w-xl text-lg leading-relaxed md:text-xl">{body}</p>}
          {(links || []).map(({ link }, i) => (
            <CMSLink className="mt-8 rounded-full" key={i} size="lg" {...link} />
          ))}
        </div>
        <div>
          {mediaType === 'video' ? (
            <VideoEmbed title={heading} url={videoUrl} />
          ) : (
            media &&
            typeof media === 'object' && <Media imgClassName="w-full h-auto" resource={media} />
          )}
        </div>
      </div>
    </Section>
  )
}
