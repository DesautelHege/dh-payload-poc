'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'

import { cn } from '@/utilities/ui'
import { usePathname } from 'next/navigation'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import './index.scss'

import { useCurrentDoc } from '@/providers/CurrentDoc'
import { getClientSideURL } from '@/utilities/getURL'

const baseClass = 'admin-bar'

// Lowercase so the bar reads "Edit post" and "New team member"
const collectionLabels = {
  pages: {
    plural: 'Pages',
    singular: 'page',
  },
  posts: {
    plural: 'Posts',
    singular: 'post',
  },
  projects: {
    plural: 'Projects',
    singular: 'project',
  },
  team: {
    plural: 'Team',
    singular: 'team member',
  },
}

// Listing pages without a document of their own still get a sensible "New" link
const collectionFromPath = (pathname: string): keyof typeof collectionLabels => {
  if (pathname.startsWith('/posts')) return 'posts'
  if (pathname.startsWith('/work') || pathname.startsWith('/project')) return 'projects'
  return 'pages'
}

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const pathname = usePathname()
  const { doc } = useCurrentDoc()
  const [show, setShow] = useState(false)
  const collection = doc?.collection || collectionFromPath(pathname)
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  return (
    <div
      className={cn(baseClass, 'py-2 bg-black text-white', {
        block: show,
        hidden: !show,
      })}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: 'font-medium text-white',
            edit: 'rounded-sm bg-dh-lavender px-3 py-1 font-semibold !text-black hover:opacity-90',
            logo: 'text-white',
            user: 'text-white',
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={collectionLabels[collection]}
          id={doc ? String(doc.id) : undefined}
          logo={<Title />}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push('/')
              router.refresh()
            })
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
