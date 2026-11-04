import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer as FooterType, SiteSetting } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const [footerData, settings] = await Promise.all([
    getCachedGlobal('footer', 1)() as Promise<FooterType>,
    getCachedGlobal('site-settings', 1)() as Promise<SiteSetting>,
  ])

  const { navItems } = footerData || {}
  const { email, locations, social, tagline } = settings || {}

  return (
    <footer className="mt-auto bg-black text-white" data-theme="dark">
      <div className="container grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link href="/">
            <Logo className="h-14" />
          </Link>
          {tagline && (
            <p className="mt-6 max-w-xs text-sm tracking-wide uppercase opacity-70">{tagline}</p>
          )}
        </div>

        <nav className="flex flex-col gap-3 md:col-span-2">
          {(navItems || []).map(({ link }, i) => (
            <CMSLink className="font-semibold text-white hover:underline" key={i} {...link} />
          ))}
        </nav>

        <div className="flex flex-col gap-4 md:col-span-3">
          {(locations || []).map(({ city, id, phone }) => (
            <div key={id}>
              <p className="font-semibold">{city}</p>
              {phone && (
                <a
                  className="opacity-80 hover:underline"
                  href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                >
                  {phone}
                </a>
              )}
            </div>
          ))}
          {email && (
            <a className="text-dh-lavender hover:underline" href={`mailto:${email}`}>
              {email}
            </a>
          )}
        </div>

        <div className="flex flex-col gap-3 md:col-span-3">
          {(social || []).map(({ id, label, url }) => (
            <a
              className="hover:underline"
              href={url}
              key={id}
              rel="noopener noreferrer"
              target="_blank"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
      <div className="container border-t border-white/15 py-6 text-sm opacity-60">
        © {settings?.siteName || 'DH'} {new Date().getFullYear()}
      </div>
    </footer>
  )
}
