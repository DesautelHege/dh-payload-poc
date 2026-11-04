import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Team } from '@/payload-types'

import { Media } from '@/components/Media'
import { Section } from '@/components/Section'
import { mergeOpenGraph, withSiteName } from '@/utilities/mergeOpenGraph'
import { SetCurrentDoc } from '@/providers/CurrentDoc'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const team = await payload.find({
    collection: 'team',
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return team.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function TeamMemberPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/team/' + decodedSlug
  const member = await queryMemberBySlug({ slug: decodedSlug })

  if (!member) return <PayloadRedirects url={url} />

  const { bio, education, headshot, involvement, name, quote, role, story, traits } = member
  const firstName = name.split(' ')[0]
  const hasDetails = Boolean(education?.length || involvement?.length)

  return (
    <article>
      <PayloadRedirects disableNotFound url={url} />
      <SetCurrentDoc collection="team" id={member.id} />

      <header className="bg-black text-white" data-theme="dark">
        <div className="container grid items-center gap-10 py-16 md:grid-cols-12 md:gap-16 md:py-24">
          <div className="relative aspect-square overflow-hidden md:col-span-5">
            {headshot && typeof headshot === 'object' && (
              <Media
                fill
                imgClassName="object-cover"
                priority
                resource={headshot}
                size="(max-width: 768px) 100vw, 40vw"
              />
            )}
          </div>
          <div className="md:col-span-7">
            <h1 className="font-serif text-5xl leading-tight md:text-7xl">{name}</h1>
            {role && <p className="mt-4 text-lg text-dh-lavender md:text-xl">{role}</p>}
            {bio && <p className="mt-8 max-w-2xl text-lg leading-relaxed md:text-xl">{bio}</p>}
            {traits && traits.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {traits.map((trait) => (
                  <li className="rounded-full border border-white/30 px-3 py-1 text-sm" key={trait}>
                    {trait}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </header>

      {(story || quote) && (
        <Section theme="light">
          <div className="container">
            <div className="mx-auto max-w-[48rem]">
              <h2 className="mb-10 font-serif text-3xl md:text-4xl">{firstName}’s take on:</h2>
              {story && (
                <RichText
                  className="prose-lg prose-h4:mt-10 prose-h4:font-serif prose-h4:text-2xl prose-h4:font-normal"
                  data={story}
                  enableGutter={false}
                />
              )}
              {quote && (
                <blockquote className="mt-14 border-l-4 border-dh-lavender pl-6 font-serif text-2xl leading-snug md:text-3xl">
                  “{quote}”
                </blockquote>
              )}
            </div>
          </div>
        </Section>
      )}

      {hasDetails && (
        <Section className="pt-0 md:pt-0" theme="light">
          <div className="container">
            <div className="mx-auto grid max-w-[48rem] gap-12 border-t border-black/15 pt-12 md:grid-cols-2">
              <DetailList
                items={education?.map((e) => ({
                  id: e.id,
                  primary: e.credential,
                  secondary: e.school,
                }))}
                label="Education"
              />
              <DetailList
                items={involvement?.map((i) => ({ id: i.id, primary: i.item }))}
                label="Leadership & volunteering"
              />
            </div>
          </div>
        </Section>
      )}

      <Section theme="lavender">
        <div className="container flex flex-col items-center gap-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl">Meet the dream team</h2>
          <p className="max-w-xl text-lg">Discover all the other faces and talents.</p>
          <Link
            className="rounded-full bg-black px-8 py-3 font-semibold text-white hover:bg-black/85"
            href="/team"
          >
            View full team
          </Link>
        </div>
      </Section>
    </article>
  )
}

const DetailList: React.FC<{
  items?: { id?: string | null; primary: string; secondary?: string | null }[]
  label: string
}> = ({ items, label }) => {
  if (!items?.length) return null

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold tracking-widest uppercase">{label}</h3>
      <ul className="space-y-4">
        {items.map(({ id, primary, secondary }) => (
          <li key={id}>
            <p className="font-semibold">{primary}</p>
            {secondary && <p className="opacity-75">{secondary}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const member = await queryMemberBySlug({ slug: decodeURIComponent(slug) })
  if (!member) return {}

  const title = await withSiteName(`${member.name}${member.role ? `, ${member.role}` : ''}`)

  return {
    description: member.bio || undefined,
    openGraph: await mergeOpenGraph({ title, ...(member.bio ? { description: member.bio } : {}) }),
    title,
  }
}

const queryMemberBySlug = cache(async ({ slug }: { slug: string }): Promise<Team | null> => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'team',
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
