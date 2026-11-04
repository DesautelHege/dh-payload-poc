import Link from 'next/link'
import React from 'react'

import type { Post, Team } from '@/payload-types'

import { Media } from '@/components/Media'

export const Byline: React.FC<{ people: Post['byline'] }> = ({ people }) => {
  const team = (people || []).filter((p): p is Team => typeof p === 'object' && p !== null)
  if (!team.length) return null

  return (
    <div className="flex flex-wrap gap-6">
      {team.map((person) => (
        <div className="flex items-center gap-4" key={person.id}>
          {person.headshot && typeof person.headshot === 'object' && (
            <div className="relative h-16 w-16 overflow-hidden rounded-full">
              <Media fill imgClassName="object-cover" resource={person.headshot} size="64px" />
            </div>
          )}
          <div>
            <p className="text-sm opacity-70">By</p>
            <Link className="font-semibold hover:underline" href={`/team/${person.slug}`}>
              {person.name}
            </Link>
            {person.role && <p className="text-sm opacity-70">{person.role}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
