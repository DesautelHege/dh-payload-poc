import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatDateAP } from '@/utilities/formatDateAP'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, excerpt, heroImage, publishedAt, title } = post

  const categoryTitles = (categories || [])
    .map((category) => (typeof category === 'object' && category !== null ? category.title : null))
    .filter(Boolean)

  return (
    <header className="bg-white text-black" data-theme="light">
      <div className="container pt-16 pb-10 md:pt-24">
        <div className="mx-auto max-w-[48rem]">
          {categoryTitles.length > 0 && (
            <p className="mb-6 text-sm font-semibold tracking-widest uppercase">
              {categoryTitles.join(' · ')}
            </p>
          )}
          <h1 className="font-serif text-4xl leading-tight md:text-6xl">{title}</h1>
          {publishedAt && (
            <time
              className="mt-6 block text-sm tracking-wide uppercase opacity-70"
              dateTime={publishedAt}
            >
              {formatDateAP(publishedAt)}
            </time>
          )}
          {excerpt && <p className="mt-6 text-xl leading-relaxed md:text-2xl">{excerpt}</p>}
        </div>
      </div>
      {heroImage && typeof heroImage === 'object' && (
        <div className="container">
          <Media
            imgClassName="h-auto w-full"
            priority
            resource={heroImage}
            size="(max-width: 1280px) 100vw, 1200px"
          />
        </div>
      )}
    </header>
  )
}
