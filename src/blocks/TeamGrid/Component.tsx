import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { TeamGridBlock as TeamGridBlockProps } from '@/payload-types'

import { Section } from '@/components/Section'
import { TeamGridClient } from './Component.client'

export const TeamGridBlock: React.FC<TeamGridBlockProps> = async ({
  heading,
  showFilters,
  theme,
}) => {
  const payload = await getPayload({ config: configPromise })
  const team = await payload.find({
    collection: 'team',
    depth: 1,
    limit: 500,
    overrideAccess: false,
    pagination: false,
    sort: 'name',
    select: {
      name: true,
      slug: true,
      role: true,
      headshot: true,
      departments: true,
    },
  })

  return (
    <Section theme={theme}>
      <div className="container">
        {heading && <h2 className="mb-12 font-serif text-4xl md:text-6xl">{heading}</h2>}
        <TeamGridClient members={team.docs} showFilters={showFilters ?? true} />
      </div>
    </Section>
  )
}
