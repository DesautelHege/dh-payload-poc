import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { Project, ProjectShowcaseBlock as ProjectShowcaseBlockProps } from '@/payload-types'

import { practiceAreaOptions } from '@/collections/Projects/practiceAreas'
import { ProjectCard, ProjectSpotlight } from '@/components/ProjectCard'
import { Section } from '@/components/Section'

export const ProjectShowcaseBlock: React.FC<ProjectShowcaseBlockProps> = async (props) => {
  const { heading, layout, limit, populateBy, practiceArea, projects, showFilterLinks, theme } =
    props

  let docs: Project[] = []

  if (populateBy === 'latest') {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'projects',
      depth: 1,
      limit: limit || 6,
      sort: '-publishedAt',
      ...(practiceArea ? { where: { practiceAreas: { in: [practiceArea] } } } : {}),
    })
    docs = result.docs
  } else {
    docs = (projects || []).filter((p): p is Project => typeof p === 'object' && p !== null)
  }

  if (!docs.length) return null

  return (
    <Section theme={theme}>
      <div className="container">
        {heading && <h2 className="mb-12 font-serif text-4xl md:mb-16 md:text-6xl">{heading}</h2>}

        {layout === 'spotlight' ? (
          <div className="flex flex-col gap-20 md:gap-28">
            {docs.map((project, i) => (
              <ProjectSpotlight flip={i % 2 === 1} key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {showFilterLinks && (
          <div className="mt-16 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-current/20 pt-8">
            <h3 className="font-serif text-xl">View more work samples:</h3>
            {practiceAreaOptions.map(({ label, value }) => (
              <Link
                className="font-semibold underline decoration-dh-lavender decoration-2 underline-offset-4"
                href={`/work?practice=${value}`}
                key={value}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}
