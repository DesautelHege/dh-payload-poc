import { Button, Pill } from '@payloadcms/ui'
import type { CollectionSlug, PayloadRequest, WidgetServerProps } from 'payload'
import { formatAdminURL } from 'payload/shared'
import React from 'react'

import type { Media, Page, Post, Project, Team } from '@/payload-types'
import { formatDateAP } from '@/utilities/formatDateAP'

import './index.scss'

const baseClass = 'dh-dash'

type EditorialSlug = 'pages' | 'posts' | 'projects'
type EditorialDoc = Page | Post | Project

const editorialLabels: Record<EditorialSlug, string> = {
  pages: 'Page',
  posts: 'Post',
  projects: 'Project',
}

const docURL = (req: PayloadRequest, collection: CollectionSlug, id?: number | string) =>
  formatAdminURL({
    adminRoute: req.payload.config.routes.admin,
    path: `/collections/${collection}${id !== undefined ? `/${id}` : ''}`,
  })

// "Today", "Yesterday", or an AP-style date
const formatUpdated = (timestamp: string) => {
  const days = Math.floor((Date.now() - new Date(timestamp).getTime()) / 86_400_000)
  if (days < 1) return 'Today'
  if (days < 2) return 'Yesterday'
  return formatDateAP(timestamp)
}

const thumbnailFor = (value: Media | number | null | undefined) =>
  value && typeof value === 'object' ? value.sizes?.thumbnail?.url || value.url : undefined

const imageFor = (collection: EditorialSlug, doc: EditorialDoc) => {
  if (collection === 'posts') return thumbnailFor((doc as Post).heroImage)
  if (collection === 'projects') return thumbnailFor((doc as Project).heroImage)
  return thumbnailFor((doc as Page).hero?.media)
}

const WidgetCard: React.FC<{
  action?: React.ReactNode
  children: React.ReactNode
  title: string
}> = ({ action, children, title }) => (
  <section className={`${baseClass}__card`}>
    <header className={`${baseClass}__card-header`}>
      <h2>{title}</h2>
      {action}
    </header>
    {children}
  </section>
)

const DocRow: React.FC<{
  href: string
  image?: null | string
  meta: React.ReactNode
  title: string
}> = ({ href, image, meta, title }) => (
  <li>
    <a className={`${baseClass}__row`} href={href}>
      <span className={`${baseClass}__thumb`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {image ? <img alt="" src={image} /> : null}
      </span>
      <span className={`${baseClass}__row-text`}>
        <strong>{title}</strong>
        <small>{meta}</small>
      </span>
    </a>
  </li>
)

const findEditorial = async (
  req: PayloadRequest,
  collection: EditorialSlug,
  args: { limit: number; where?: Parameters<PayloadRequest['payload']['find']>[0]['where'] },
) => {
  const result = await req.payload.find({
    collection,
    depth: 1,
    draft: true,
    limit: args.limit,
    overrideAccess: false,
    sort: '-updatedAt',
    user: req.user,
    where: args.where,
  })
  return result.docs.map((doc) => ({ collection, doc: doc as EditorialDoc }))
}

const sortByUpdated = <T extends { doc: { updatedAt: string } }>(items: T[]) =>
  items.sort((a, b) => b.doc.updatedAt.localeCompare(a.doc.updatedAt))

export function WelcomeWidget({ req }: WidgetServerProps) {
  const { user } = req
  if (!user) return null

  const now = new Date()
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'America/Los_Angeles',
    }).format(now),
  )
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = typeof user.name === 'string' && user.name ? user.name.split(' ')[0] : null
  const adminRoute = req.payload.config.routes.admin

  return (
    <header className={`${baseClass}__welcome`}>
      <div>
        {/* <span className={`${baseClass}__eyebrow`}>DH content studio</span> */}
        <h1>
          {greeting}
          {firstName ? `, ${firstName}` : ''}.
        </h1>
        <p>Drafts, recent edits and anything that needs a second look, all in one place.</p>
      </div>
      <div className={`${baseClass}__actions`}>
        <Button
          buttonStyle="primary"
          el="link"
          margin={false}
          to={`${docURL(req, 'posts')}/create`}
        >
          New post
        </Button>
        <Button
          buttonStyle="secondary"
          el="link"
          margin={false}
          to={`${docURL(req, 'projects')}/create`}
        >
          New project
        </Button>
        <Button
          buttonStyle="secondary"
          el="link"
          margin={false}
          to={`${docURL(req, 'team')}/create`}
        >
          New team member
        </Button>
        <Button
          buttonStyle="secondary"
          el="link"
          margin={false}
          to={formatAdminURL({ adminRoute, path: '/globals/site-settings' })}
        >
          Site settings
        </Button>
        <Button buttonStyle="subtle" el="anchor" margin={false} newTab url="/">
          View site ↗
        </Button>
      </div>
    </header>
  )
}

export async function RecentEditsWidget({ req }: WidgetServerProps) {
  if (!req.user) return null

  const [editorial, team] = await Promise.all([
    Promise.all(
      (['pages', 'posts', 'projects'] as const).map((c) => findEditorial(req, c, { limit: 8 })),
    ).then((lists) => lists.flat()),
    req.payload.find({
      collection: 'team',
      depth: 1,
      limit: 8,
      overrideAccess: false,
      sort: '-updatedAt',
      user: req.user,
    }),
  ])

  const items = sortByUpdated([
    ...editorial.map(({ collection, doc }) => ({
      doc,
      href: docURL(req, collection, doc.id),
      image: imageFor(collection, doc),
      label: editorialLabels[collection],
      status: doc._status,
      title: doc.title || 'Untitled',
    })),
    ...team.docs.map((doc: Team) => ({
      doc,
      href: docURL(req, 'team', doc.id),
      image: thumbnailFor(doc.headshot),
      label: 'Team',
      status: undefined,
      title: doc.name,
    })),
  ]).slice(0, 8)

  return (
    <WidgetCard title="Recently edited">
      {items.length === 0 ? (
        <p className={`${baseClass}__empty`}>Nothing has been edited yet.</p>
      ) : (
        <ul className={`${baseClass}__list`}>
          {items.map((item) => (
            <DocRow
              href={item.href}
              image={item.image}
              key={item.href}
              meta={
                <>
                  {item.label} · {formatUpdated(item.doc.updatedAt)}
                  {item.status === 'draft' && (
                    <Pill pillStyle="warning" size="small">
                      Draft
                    </Pill>
                  )}
                </>
              }
              title={item.title}
            />
          ))}
        </ul>
      )}
    </WidgetCard>
  )
}

export async function DraftsWidget({ req }: WidgetServerProps) {
  if (!req.user) return null

  const drafts = sortByUpdated(
    (
      await Promise.all(
        (['posts', 'projects', 'pages'] as const).map((c) =>
          findEditorial(req, c, { limit: 6, where: { _status: { equals: 'draft' } } }),
        ),
      )
    ).flat(),
  ).slice(0, 6)

  return (
    <WidgetCard title="Drafts waiting to publish">
      {drafts.length === 0 ? (
        <p className={`${baseClass}__empty`}>No drafts. Everything is published.</p>
      ) : (
        <ul className={`${baseClass}__list`}>
          {drafts.map(({ collection, doc }) => (
            <DocRow
              href={docURL(req, collection, doc.id)}
              image={imageFor(collection, doc)}
              key={`${collection}-${doc.id}`}
              meta={`${editorialLabels[collection]} · ${formatUpdated(doc.updatedAt)}`}
              title={doc.title || 'Untitled'}
            />
          ))}
        </ul>
      )}
    </WidgetCard>
  )
}

export async function SEOHealthWidget({ req }: WidgetServerProps) {
  if (!req.user) return null

  const collections = ['posts', 'projects', 'pages'] as const
  const rows = await Promise.all(
    collections.map(async (collection) => {
      const published = await req.payload.find({
        collection,
        depth: 0,
        limit: 200,
        overrideAccess: false,
        pagination: false,
        select: { title: true, meta: { description: true, image: true } },
        user: req.user,
        where: { _status: { equals: 'published' } },
      })
      const docs = published.docs as EditorialDoc[]
      const missing = docs.filter((doc) => !doc.meta?.description || !doc.meta?.image)
      return { collection, missing, total: docs.length }
    }),
  )

  const flagged = rows.flatMap(({ collection, missing }) =>
    missing.map((doc) => ({ collection, doc })),
  )

  return (
    <WidgetCard title="Search and sharing">
      <div className={`${baseClass}__meters`}>
        {rows.map(({ collection, missing, total }) => {
          const complete = total - missing.length
          const pct = total ? Math.round((complete / total) * 100) : 100
          return (
            <a className={`${baseClass}__meter`} href={docURL(req, collection)} key={collection}>
              <span>
                {editorialLabels[collection]}s
                <small>
                  {complete} of {total} complete
                </small>
              </span>
              <span className={`${baseClass}__bar`}>
                <span style={{ width: `${pct}%` }} />
              </span>
            </a>
          )
        })}
      </div>
      {flagged.length > 0 && (
        <>
          <p className={`${baseClass}__hint`}>
            Missing a search description or share image. Fix it on the SEO tab.
          </p>
          <ul className={`${baseClass}__list ${baseClass}__list--compact`}>
            {flagged.slice(0, 4).map(({ collection, doc }) => (
              <li key={`${collection}-${doc.id}`}>
                <a href={docURL(req, collection, doc.id)}>{doc.title || 'Untitled'}</a>
                <small>
                  {[!doc.meta?.description && 'description', !doc.meta?.image && 'image']
                    .filter(Boolean)
                    .join(' and ')}
                </small>
              </li>
            ))}
          </ul>
        </>
      )}
    </WidgetCard>
  )
}

export async function TeamProfilesWidget({ req }: WidgetServerProps) {
  if (!req.user) return null

  const team = await req.payload.find({
    collection: 'team',
    depth: 0,
    limit: 500,
    overrideAccess: false,
    pagination: false,
    select: { name: true, headshot: true, departments: true, bio: true },
    user: req.user,
  })
  const members = team.docs as Team[]

  const checks = [
    { label: 'No headshot', docs: members.filter((m) => !m.headshot) },
    { label: 'No department', docs: members.filter((m) => !m.departments?.length) },
    { label: 'No profile intro', docs: members.filter((m) => !m.bio) },
  ]

  return (
    <WidgetCard
      action={
        <a className={`${baseClass}__link`} href={docURL(req, 'team')}>
          All {members.length}
        </a>
      }
      title="Team profiles"
    >
      <ul className={`${baseClass}__checks`}>
        {checks.map(({ docs, label }) => (
          <li key={label}>
            <span className={`${baseClass}__count`} data-ok={docs.length === 0}>
              {docs.length}
            </span>
            <span>
              {label}
              {docs.length > 0 && docs.length <= 3 && (
                <small>
                  {docs.map((doc, i) => (
                    <React.Fragment key={doc.id}>
                      {i > 0 && ', '}
                      <a href={docURL(req, 'team', doc.id)}>{doc.name}</a>
                    </React.Fragment>
                  ))}
                </small>
              )}
            </span>
          </li>
        ))}
      </ul>
    </WidgetCard>
  )
}

export async function FormsInboxWidget({ req }: WidgetServerProps) {
  if (!req.user) return null

  const since = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const [recent, lastMonth] = await Promise.all([
    req.payload.find({
      collection: 'form-submissions',
      depth: 1,
      limit: 4,
      overrideAccess: false,
      sort: '-createdAt',
      user: req.user,
    }),
    req.payload.count({
      collection: 'form-submissions',
      overrideAccess: false,
      user: req.user,
      where: { createdAt: { greater_than_equal: since } },
    }),
  ])

  return (
    <WidgetCard
      action={
        <a className={`${baseClass}__link`} href={docURL(req, 'form-submissions')}>
          View all
        </a>
      }
      title="Form submissions"
    >
      <p className={`${baseClass}__stat`}>
        <strong>{lastMonth.totalDocs}</strong> in the last 30 days
      </p>
      {recent.docs.length > 0 && (
        <ul className={`${baseClass}__list ${baseClass}__list--compact`}>
          {recent.docs.map((doc) => (
            <li key={doc.id}>
              <a href={docURL(req, 'form-submissions', doc.id)}>
                {typeof doc.form === 'object' ? doc.form.title : 'Submission'}
              </a>
              <small>{formatUpdated(doc.createdAt)}</small>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  )
}
