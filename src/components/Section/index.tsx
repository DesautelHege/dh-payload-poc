import { cn } from '@/utilities/ui'
import React from 'react'

import type { SectionTheme } from '@/fields/sectionTheme'

const themeClasses: Record<SectionTheme, string> = {
  dark: 'bg-black text-white',
  light: 'bg-white text-black',
  lavender: 'bg-dh-lavender text-black',
}

// Full-bleed band that sets its own color scheme, so nested prose and buttons follow it
export const Section: React.FC<{
  children: React.ReactNode
  className?: string
  id?: string
  theme?: SectionTheme | null
}> = ({ children, className, id, theme }) => {
  const resolved = theme || 'dark'

  return (
    <section
      className={cn('py-20 md:py-28', themeClasses[resolved], className)}
      data-theme={resolved === 'dark' ? 'dark' : 'light'}
      id={id}
    >
      {children}
    </section>
  )
}
