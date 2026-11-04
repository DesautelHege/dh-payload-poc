import type { Metadata } from 'next'

import { withSiteName } from '@/utilities/mergeOpenGraph'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { practiceAreaOptions } from '@/collections/Projects/practiceAreas'
import { ProjectCard } from '@/components/ProjectCard'
import { Section } from '@/components/Section'
import { cn } from '@/utilities/ui'

type Args = {
  searchParams: Promise<{ practice?: string }>
}

export default async function WorkPage({ searchParams }: Args) {
  const { practice } = await searchParams
  const active = practiceAreaOptions.find((o) => o.value === practice)?.value

  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 48,
    overrideAccess: false,
    sort: '-publishedAt',
    ...(active ? { where: { practiceAreas: { in: [active] } } } : {}),
  })

  const filters = [{ label: 'All', value: undefined }, ...practiceAreaOptions]

  return (
    <Section theme="dark">
      <div className="container">
        <h1 className="font-serif text-5xl md:text-7xl">Our work</h1>
        <nav className="mt-10 flex flex-wrap gap-3">
          {filters.map(({ label, value }) => (
            <Link
              className={cn(
                'rounded-full border border-white/30 px-4 py-1.5 text-sm font-semibold',
                {
                  'border-dh-lavender bg-dh-lavender text-black': value === active,
                },
              )}
              href={value ? `/work?practice=${value}` : '/work'}
              key={label}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {projects.docs.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        {projects.docs.length === 0 && <p className="mt-14 opacity-70">No projects found.</p>}
      </div>
    </Section>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: await withSiteName('Our work') }
}
