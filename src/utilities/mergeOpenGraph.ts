import type { Metadata } from 'next'
import type { Media, SiteSetting } from '@/payload-types'

import { getCachedGlobal } from './getGlobals'
import { getServerSideURL } from './getURL'

export const getSiteSettings = () => getCachedGlobal('site-settings', 1)() as Promise<SiteSetting>

export const getImageURL = (image?: Media | number | string | null): string | undefined => {
  if (!image || typeof image !== 'object' || !image.url) return undefined

  const ogUrl = image.sizes?.og?.url
  return getServerSideURL() + (ogUrl || image.url)
}

// Site-wide link-preview defaults, editable under Settings > Site settings
export const getDefaultOpenGraph = async (): Promise<Metadata['openGraph']> => {
  const settings = await getSiteSettings()
  const siteName = settings?.siteName || 'DH'

  return {
    type: 'website',
    description: settings?.defaultDescription || '',
    images: [
      {
        url: getImageURL(settings?.defaultImage) || `${getServerSideURL()}/website-template-OG.webp`,
      },
    ],
    siteName,
    title: siteName,
  }
}

export const mergeOpenGraph = async (
  og?: Metadata['openGraph'],
): Promise<Metadata['openGraph']> => {
  const defaultOpenGraph = await getDefaultOpenGraph()

  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph?.images,
  }
}

// "Our work" -> "Our work | DH", skipping titles that already carry the site name
export const withSiteName = async (title?: null | string): Promise<string> => {
  const siteName = (await getSiteSettings())?.siteName || 'DH'
  if (!title) return siteName
  return title.endsWith(`| ${siteName}`) ? title : `${title} | ${siteName}`
}
