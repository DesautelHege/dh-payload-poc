import React from 'react'

import { CMSLink } from '@/components/Link'
import { getSiteSettings } from '@/utilities/mergeOpenGraph'

export async function AnnouncementBar() {
  const settings = await getSiteSettings()
  const { enabled, hasLink, link, message } = settings?.announcement || {}

  if (!enabled || !message) return null

  return (
    <div className="bg-dh-lavender text-black">
      <div className="container flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-sm font-semibold">
        <p>{message}</p>
        {hasLink && link && (
          <CMSLink
            {...link}
            className="underline underline-offset-4 hover:no-underline"
            label={link.label || 'Learn more'}
          />
        )}
      </div>
    </div>
  )
}
