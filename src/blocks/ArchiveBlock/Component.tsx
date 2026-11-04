import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CMSLink } from '@/components/Link'
import { Section } from '@/components/Section'
import { formatDateAP } from '@/utilities/formatDateAP'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    links,
    populateBy,
    selectedDocs,
    theme,
  } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit,
      sort: '-publishedAt',
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }

  return (
    <Section id={`block-${id}`} theme={theme}>
      <div className="container grid gap-12 md:grid-cols-12">
        {introContent && (
          <div className="md:col-span-4">
            <RichText
              className="m-0 font-serif [&_h2]:text-4xl md:[&_h2]:text-5xl [&_h2]:font-normal"
              data={introContent}
              enableGutter={false}
            />
          </div>
        )}
        <div className={introContent ? 'md:col-span-8' : 'md:col-span-12'}>
          <ul className="divide-y divide-current/15 border-y border-current/15">
            {posts.map((post) => {
              if (!post || typeof post !== 'object') return null
              const categoryTitles = (post.categories || [])
                .map((c) => (typeof c === 'object' ? c?.title : null))
                .filter(Boolean)
                .join(', ')

              return (
                <li key={post.id}>
                  <Link className="group block py-8" href={`/posts/${post.slug}`}>
                    <h3 className="font-serif text-2xl leading-snug group-hover:underline md:text-3xl">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm tracking-wide uppercase opacity-70">
                      {post.publishedAt && (
                        <time dateTime={post.publishedAt}>{formatDateAP(post.publishedAt)}</time>
                      )}
                      {post.publishedAt && categoryTitles && ' · '}
                      {categoryTitles}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
          {(links || []).map(({ link }, i) => (
            <CMSLink
              className="mt-8 inline-block border-b-2 border-dh-lavender pb-1 font-semibold tracking-wide uppercase"
              key={i}
              {...link}
            />
          ))}
        </div>
      </div>
    </Section>
  )
}
