import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Project } from '@/payload-types'

import { Media } from '@/components/Media'
import { Section } from '@/components/Section'
import { VideoEmbed } from '@/components/VideoEmbed'
import { generateMeta } from '@/utilities/generateMeta'
import { cn } from '@/utilities/ui'
import PageClient from './page.client'
import { SetCurrentDoc } from '@/providers/CurrentDoc'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return projects.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

const storySections: { key: 'challenge' | 'insight' | 'solution' | 'results'; label: string }[] = [
  { key: 'challenge', label: 'Challenge' },
  { key: 'insight', label: 'Insight' },
  { key: 'solution', label: 'Solution' },
  { key: 'results', label: 'Results' },
]

export default async function ProjectPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/project/' + decodedSlug
  const project = await queryProjectBySlug({ slug: decodedSlug })

  if (!project) return <PayloadRedirects url={url} />

  const { client, cta, gallery, headline, heroImage, industries, services, title } = project

  return (
    <article>
      <PageClient />
      <SetCurrentDoc collection="projects" id={project.id} />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      {/* Title + hero */}
      <header className="bg-black text-white" data-theme="dark">
        <div className="container pt-20 pb-12 md:pt-28">
          <h1 className="font-serif text-5xl leading-tight md:text-7xl">{title}</h1>
          {client && <p className="mt-4 text-lg text-dh-lavender md:text-xl">For {client}</p>}
        </div>
        {heroImage && typeof heroImage === 'object' && (
          <div className="relative aspect-[21/9] w-full">
            <Media fill imgClassName="object-cover" priority resource={heroImage} size="100vw" />
          </div>
        )}
      </header>

      {/* Facts */}
      <Section className="py-12 md:py-16" theme="light">
        <dl className="container grid gap-10 border-b border-black/15 pb-12 sm:grid-cols-2">
          <Facts label="Industry" values={industries} />
          <Facts label="What we did" values={services} />
        </dl>

        {headline && (
          <div className="container pt-16">
            <h2 className="max-w-4xl font-serif text-4xl leading-tight md:text-6xl">{headline}</h2>
          </div>
        )}

        {/* Story */}
        <div className="container flex flex-col gap-14 pt-16">
          {storySections.map(({ key, label }) => {
            const content = project[key]
            if (!content) return null

            return (
              <div className="grid gap-4 md:grid-cols-12" key={key}>
                <h3 className="text-sm font-semibold tracking-widest uppercase md:col-span-3 md:pt-1">
                  {label}
                </h3>
                <RichText
                  className="m-0 text-lg md:col-span-8 md:col-start-5"
                  data={content}
                  enableGutter={false}
                />
              </div>
            )
          })}
        </div>
      </Section>

      {/* Gallery */}
      {gallery && gallery.length > 0 && (
        <Section className="py-12 md:py-16" theme="light">
          <div className="container grid gap-4 md:grid-cols-2 md:gap-6">
            {gallery.map((item) => (
              <div className={cn({ 'md:col-span-2': item.width === 'full' })} key={item.id}>
                {item.type === 'video' ? (
                  <VideoEmbed title={title} url={item.videoUrl} />
                ) : (
                  item.media &&
                  typeof item.media === 'object' &&
                  // Half-width tiles share a 4:3 crop so rows line up; full-width keeps its own ratio
                  (item.width === 'full' ? (
                    <Media imgClassName="h-auto w-full" resource={item.media} size="100vw" />
                  ) : (
                    <div className="relative aspect-[4/3]">
                      <Media
                        fill
                        imgClassName="object-cover"
                        resource={item.media}
                        size="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Closing CTA */}
      <Section theme="lavender">
        <div className="container flex flex-col items-center gap-8 text-center">
          <h2 className="font-serif text-4xl leading-tight md:text-6xl">
            {cta?.heading || 'Ready to turn insight into impact?'}
          </h2>
          <Link
            className="rounded-full bg-black px-8 py-3 font-semibold text-white hover:bg-black/85"
            href="/contact"
          >
            {cta?.label || 'Let’s do it together'}
          </Link>
        </div>
      </Section>
    </article>
  )
}

const Facts: React.FC<{ label: string; values?: Project['industries'] }> = ({ label, values }) => {
  if (!values?.length) return null

  return (
    <div>
      <dt className="mb-3 text-sm font-semibold tracking-widest uppercase">{label}</dt>
      <dd className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span className="rounded-full border border-black/20 px-3 py-1 text-sm" key={value}>
            {value}
          </span>
        ))}
      </dd>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const project = await queryProjectBySlug({ slug: decodedSlug })

  return generateMeta({ doc: project })
}

const queryProjectBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
