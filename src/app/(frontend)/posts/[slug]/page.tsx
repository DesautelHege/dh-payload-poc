import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { Byline } from '@/components/Byline'
import { Section } from '@/components/Section'
import { PostHero } from '@/heros/PostHero'
import { formatDateAP } from '@/utilities/formatDateAP'
import Link from 'next/link'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { SetCurrentDoc } from '@/providers/CurrentDoc'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const morePosts = await queryMorePosts(post)

  return (
    <article>
      <PageClient />
      <SetCurrentDoc collection="posts" id={post.id} />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="bg-white text-black" data-theme="light">
        {/* `container` sets max-width per breakpoint, so the reading column is an inner wrapper */}
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-[48rem]">
            {post.lead && (
              <p className="mb-10 font-serif text-2xl leading-snug md:text-3xl">{post.lead}</p>
            )}
            <Byline people={post.byline} />
            <RichText
              className="mt-12 prose-lg prose-h2:font-serif prose-h2:text-3xl prose-h2:font-normal prose-a:decoration-dh-lavender prose-a:decoration-2"
              data={post.content}
              enableGutter={false}
            />
          </div>
        </div>
      </div>

      <Section theme="lavender">
        <div className="container flex flex-col items-center gap-8 text-center">
          <h2 className="max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
            {post.cta?.heading || 'Curious about new ways to engage people better?'}
          </h2>
          <Link
            className="rounded-full bg-black px-8 py-3 font-semibold text-white hover:bg-black/85"
            href="/contact"
          >
            {post.cta?.label || 'Reach out'}
          </Link>
        </div>
      </Section>

      {morePosts.length > 0 && (
        <Section theme="light">
          <div className="container">
            <h2 className="mb-10 font-serif text-3xl md:text-4xl">More from the blog</h2>
            <div className="grid gap-10 md:grid-cols-3">
              {morePosts.map((more) => (
                <Link
                  className="group block border-t-2 border-black pt-6"
                  href={`/posts/${more.slug}`}
                  key={more.id}
                >
                  <h3 className="font-serif text-2xl leading-snug group-hover:underline">
                    {more.title}
                  </h3>
                  {more.excerpt && (
                    <p className="mt-3 leading-relaxed opacity-80">{more.excerpt}</p>
                  )}
                  {more.publishedAt && (
                    <p className="mt-4 text-sm tracking-wide uppercase opacity-60">
                      {formatDateAP(more.publishedAt)}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </Section>
      )}
    </article>
  )
}

// Hand-picked related posts win; otherwise fall back to the latest posts
const queryMorePosts = async (post: Post): Promise<Post[]> => {
  const related = (post.relatedPosts || []).filter((p): p is Post => typeof p === 'object')
  if (related.length) return related.slice(0, 3)

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 3,
    overrideAccess: false,
    sort: '-publishedAt',
    where: { id: { not_equals: post.id } },
  })

  return result.docs
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
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
