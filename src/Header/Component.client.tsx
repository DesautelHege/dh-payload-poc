'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // The DH header is always the black bar with the white logo
  return (
    <header className="sticky top-0 z-30 bg-black text-white" data-theme="dark">
      <div className="container flex items-center justify-between py-5">
        <Link href="/">
          <Logo loading="eager" priority="high" />
        </Link>
        <button
          aria-expanded={menuOpen}
          className="text-sm font-semibold tracking-widest uppercase md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
        <div className="hidden md:block">
          <HeaderNav data={data} />
        </div>
      </div>
      {menuOpen && (
        <div className="container pb-8 md:hidden">
          <HeaderNav data={data} vertical />
        </div>
      )}
    </header>
  )
}
