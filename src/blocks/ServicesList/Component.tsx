import React from 'react'

import type { ServicesListBlock as ServicesListBlockProps } from '@/payload-types'

import { Section } from '@/components/Section'

export const ServicesListBlock: React.FC<ServicesListBlockProps> = ({ groups, heading, theme }) => {
  return (
    <Section theme={theme}>
      <div className="container">
        {heading && <h2 className="mb-12 font-serif text-4xl md:mb-16 md:text-6xl">{heading}</h2>}
        <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {groups?.map(({ id, services, title }) => (
            <div key={id}>
              <h3 className="mb-4 border-b border-current/20 pb-3 text-sm font-semibold tracking-widest uppercase">
                {title}
              </h3>
              <ul className="space-y-2 text-base leading-snug opacity-90">
                {services?.map((service, i) => (
                  <li key={i}>{service}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
