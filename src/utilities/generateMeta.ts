import type { Metadata } from 'next'

import type { Page, Post, Project } from '../payload-types'

import { getImageURL, mergeOpenGraph, withSiteName } from './mergeOpenGraph'

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | Partial<Project> | null
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)
  const title = await withSiteName(doc?.meta?.title || doc?.title)
  const description = doc?.meta?.description || undefined

  return {
    description,
    openGraph: await mergeOpenGraph({
      ...(description ? { description } : {}),
      images: ogImage ? [{ url: ogImage }] : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
