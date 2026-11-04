import React from 'react'

import type { StatementBlock as StatementBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Section } from '@/components/Section'
import { cn } from '@/utilities/ui'

export const StatementBlock: React.FC<StatementBlockProps> = ({
  body,
  headline,
  links,
  secondaryHeadline,
  theme,
}) => {
  return (
    <Section theme={theme}>
      <div className="container max-w-5xl text-center">
        <h2 className="font-serif text-4xl leading-tight md:text-6xl">{headline}</h2>
        {secondaryHeadline && (
          <p
            className={cn('mt-2 font-serif text-4xl leading-tight md:text-6xl', {
              'text-dh-lavender': theme === 'dark' || !theme,
              'opacity-70': theme !== 'dark' && theme,
            })}
          >
            {secondaryHeadline}
          </p>
        )}
        {body && (
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed md:text-xl">{body}</p>
        )}
        {Array.isArray(links) && links.length > 0 && (
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {links.map(({ link }, i) => (
              <CMSLink className="rounded-full" key={i} size="lg" {...link} />
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}
