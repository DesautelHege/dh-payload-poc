import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../../access/anyone'
import { authenticated } from '../../access/authenticated'
import { slugField } from 'payload'
import { departmentOptions } from './departments'
import { revalidateDelete, revalidateTeam } from './hooks/revalidateTeam'

// Team members are public-facing people (bylines, team page), separate from CMS logins in `users`
export const Team: CollectionConfig = {
  slug: 'team',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: 'People',
    defaultColumns: ['name', 'role', 'departments', 'updatedAt'],
    listSearchableFields: ['name', 'role'],
    useAsTitle: 'name',
  },
  defaultPopulate: {
    name: true,
    slug: true,
    role: true,
    headshot: true,
  },
  defaultSort: 'name',
  labels: {
    plural: 'Team',
    singular: 'Team member',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Card',
          description: 'What shows on the team grid and in post bylines.',
          fields: [
            {
              name: 'role',
              type: 'text',
              admin: {
                description: 'Job title, e.g. "Associate Vice President"',
              },
            },
            {
              name: 'headshot',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Square photo, at least 700px.',
              },
            },
          ],
        },
        {
          label: 'Profile',
          description: 'Optional. Members without a bio get a simple profile page.',
          fields: [
            {
              name: 'bio',
              type: 'textarea',
              label: 'Intro',
            },
            {
              name: 'traits',
              type: 'text',
              hasMany: true,
              admin: {
                description:
                  'Short descriptors shown as tags, e.g. "Equity advocate". Press Enter after each.',
              },
            },
            {
              name: 'story',
              type: 'richText',
              admin: {
                description: 'Use H4 headings for each "take on" topic.',
              },
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h4'] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
            },
            {
              name: 'quote',
              type: 'textarea',
              label: 'Pull quote',
            },
            {
              name: 'education',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'credential', type: 'text', required: true, admin: { width: '50%' } },
                    { name: 'school', type: 'text', admin: { width: '50%' } },
                  ],
                },
              ],
            },
            {
              name: 'involvement',
              type: 'array',
              label: 'Leadership & volunteering',
              admin: { initCollapsed: true },
              fields: [{ name: 'item', type: 'text', required: true }],
            },
          ],
        },
      ],
    },
    {
      name: 'departments',
      type: 'select',
      hasMany: true,
      options: departmentOptions,
      admin: {
        position: 'sidebar',
        description: 'Drives the team page filters.',
      },
    },
    slugField({ useAsSlug: 'name' }),
  ],
  hooks: {
    afterChange: [revalidateTeam],
    afterDelete: [revalidateDelete],
  },
}
