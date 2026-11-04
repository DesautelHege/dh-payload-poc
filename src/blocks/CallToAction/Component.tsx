import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { Section } from '@/components/Section'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText, theme }) => {
  return (
    <Section theme={theme}>
      <div className="container flex flex-col items-center gap-10 text-center">
        {richText && (
          <RichText
            className="mx-auto max-w-[48rem] font-serif [&_h2]:text-4xl md:[&_h2]:text-6xl [&_h2]:leading-tight [&_h2]:font-normal"
            data={richText}
            enableGutter={false}
          />
        )}
        <div className="flex flex-wrap justify-center gap-4">
          {(links || []).map(({ link }, i) => {
            return <CMSLink className="rounded-full" key={i} size="lg" {...link} />
          })}
        </div>
      </div>
    </Section>
  )
}
