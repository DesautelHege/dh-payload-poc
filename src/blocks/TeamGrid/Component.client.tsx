'use client'
import Link from 'next/link'
import React, { useState } from 'react'

import type { Team } from '@/payload-types'

import { departmentOptions } from '@/collections/Team/departments'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

type Member = Pick<Team, 'departments' | 'headshot' | 'id' | 'name' | 'role' | 'slug'>

export const TeamGridClient: React.FC<{ members: Member[]; showFilters: boolean }> = ({
  members,
  showFilters,
}) => {
  const [active, setActive] = useState<string | null>(null)

  // Only offer filters that have at least one person in them
  const filters = departmentOptions.filter(({ value }) =>
    members.some((m) => m.departments?.includes(value as never)),
  )
  const visible = active ? members.filter((m) => m.departments?.includes(active as never)) : members

  return (
    <>
      {showFilters && filters.length > 0 && (
        <div className="mb-12 flex flex-wrap gap-3" role="group" aria-label="Filter by department">
          {[{ label: 'All', value: null }, ...filters].map(({ label, value }) => (
            <button
              aria-pressed={active === value}
              className={cn(
                'rounded-full border border-current/30 px-4 py-1.5 text-sm font-semibold',
                { 'border-dh-lavender bg-dh-lavender text-black': active === value },
              )}
              key={label}
              onClick={() => setActive(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((member) => (
          <li key={member.id}>
            <Link className="group block" href={`/team/${member.slug}`}>
              <div className="relative aspect-square overflow-hidden bg-current/5">
                {member.headshot && typeof member.headshot === 'object' && (
                  <Media
                    fill
                    imgClassName="object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    resource={member.headshot}
                    size="(max-width: 768px) 50vw, 25vw"
                  />
                )}
              </div>
              <h3 className="mt-4 font-serif text-xl leading-snug group-hover:underline">
                {member.name}
              </h3>
              {member.role && <p className="mt-1 text-sm leading-snug opacity-75">{member.role}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
