'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

export const HeaderNav: React.FC<{ data: HeaderType; vertical?: boolean }> = ({
  data,
  vertical,
}) => {
  const navItems = data?.navItems || []

  return (
    <nav
      className={cn('flex text-[0.95rem] font-semibold', {
        'flex-col gap-4 text-xl': vertical,
        'items-center gap-7': !vertical,
      })}
    >
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink
            className="text-white decoration-dh-lavender decoration-2 underline-offset-8 hover:underline"
            key={i}
            {...link}
          />
        )
      })}
    </nav>
  )
}
