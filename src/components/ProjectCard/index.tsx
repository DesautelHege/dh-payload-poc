import Link from 'next/link'
import React from 'react'

import type { Project } from '@/payload-types'

import { Media } from '@/components/Media'

export type ProjectCardData = Pick<
  Project,
  'client' | 'heroImage' | 'logo' | 'slug' | 'teaser' | 'teaserMedia' | 'title'
>

const cardImage = (project: ProjectCardData) => {
  const media = project.teaserMedia || project.heroImage
  return media && typeof media === 'object' ? media : null
}

export const ProjectCard: React.FC<{ project: ProjectCardData }> = ({ project }) => {
  const image = cardImage(project)

  return (
    <Link className="group block" href={`/project/${project.slug}`}>
      <div className="relative aspect-video overflow-hidden bg-white/5">
        {image && (
          <Media
            fill
            imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
            resource={image}
            size="(max-width: 768px) 100vw, 33vw"
          />
        )}
      </div>
      <h3 className="mt-5 font-serif text-2xl leading-snug group-hover:underline">
        {project.title}
      </h3>
      {project.teaser && <p className="mt-2 leading-relaxed opacity-80">{project.teaser}</p>}
    </Link>
  )
}

export const ProjectSpotlight: React.FC<{ flip?: boolean; project: ProjectCardData }> = ({
  flip,
  project,
}) => {
  const image = cardImage(project)
  const logo = project.logo && typeof project.logo === 'object' ? project.logo : null

  return (
    <div className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
      <div
        className={`relative aspect-[4/3] overflow-hidden md:col-span-7 ${flip ? 'md:order-2' : ''}`}
      >
        {image && (
          <Media
            fill
            imgClassName="object-cover"
            resource={image}
            size="(max-width: 768px) 100vw, 60vw"
          />
        )}
      </div>
      <div className="md:col-span-5">
        {logo && (
          <div className="mb-6 h-20 w-40">
            <Media imgClassName="h-20 w-auto object-contain object-left" resource={logo} />
          </div>
        )}
        <h3 className="font-serif text-3xl leading-tight md:text-4xl">{project.title}</h3>
        {project.teaser && (
          <p className="mt-5 text-lg leading-relaxed opacity-85">{project.teaser}</p>
        )}
        <Link
          className="mt-8 inline-block border-b-2 border-dh-lavender pb-1 font-semibold tracking-wide uppercase"
          href={`/project/${project.slug}`}
        >
          View work
        </Link>
      </div>
    </div>
  )
}
