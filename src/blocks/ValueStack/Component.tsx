import React from 'react'

import type { ValueStackBlock as ValueStackBlockProps } from '@/payload-types'

import { Section } from '@/components/Section'

export const ValueStackBlock: React.FC<ValueStackBlockProps> = ({ items, theme }) => {
  if (!items?.length) return null

  return (
    <Section theme={theme}>
      <div className="container flex flex-col gap-16 md:gap-24">
        {items.map(({ body, heading, id }) => (
          <div className="grid gap-6 md:grid-cols-12" key={id}>
            <h2 className="font-serif text-3xl leading-tight md:col-span-5 md:text-5xl">
              {heading}
            </h2>
            {body && (
              <p className="text-lg leading-relaxed md:col-span-6 md:col-start-7 md:text-xl">
                {body}
              </p>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}
