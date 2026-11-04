import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Team } from '../../../payload-types'

// Team members appear on their profile, the team grid and post bylines
export const revalidateTeam: CollectionAfterChangeHook<Team> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating team member at path: /team/${doc.slug}`)

    revalidatePath(`/team/${doc.slug}`)
    if (previousDoc?.slug && previousDoc.slug !== doc.slug)
      revalidatePath(`/team/${previousDoc.slug}`)
    revalidatePath('/', 'layout')
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Team> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/team/${doc?.slug}`)
    revalidatePath('/', 'layout')
  }

  return doc
}
