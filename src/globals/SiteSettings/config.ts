import type { GlobalConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { link } from '@/fields/link'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

// Site-wide defaults and contact details that aren't tied to any one page
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              label: 'Site name',
              defaultValue: 'DH',
              required: true,
              admin: {
                description: 'Added to the end of every browser tab title, e.g. "Our work | DH".',
              },
            },
            {
              name: 'tagline',
              type: 'text',
              admin: {
                description: 'Shown under the logo in the footer.',
              },
            },
            {
              name: 'defaultDescription',
              type: 'textarea',
              label: 'Default description',
              admin: {
                description:
                  'Used in search results and link previews when a page has no description of its own.',
              },
            },
            {
              name: 'defaultImage',
              type: 'upload',
              label: 'Default share image',
              relationTo: 'media',
              admin: {
                description:
                  'Shown when a page is shared on social media and has no image of its own. 1200 × 630 works best.',
              },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'email',
              type: 'email',
            },
            {
              name: 'locations',
              type: 'array',
              labels: { singular: 'Office', plural: 'Offices' },
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'city', type: 'text', required: true, admin: { width: '50%' } },
                    { name: 'phone', type: 'text', admin: { width: '50%' } },
                  ],
                },
              ],
            },
            {
              name: 'social',
              type: 'array',
              labels: { singular: 'Social link', plural: 'Social links' },
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
                    { name: 'url', type: 'text', required: true, admin: { width: '50%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Announcement',
          description: 'A thin bar above the site header, for news like an event or a new report.',
          fields: [
            {
              name: 'announcement',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Show the announcement bar',
                  defaultValue: false,
                },
                {
                  name: 'message',
                  type: 'text',
                  admin: {
                    condition: (_, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
                {
                  name: 'hasLink',
                  type: 'checkbox',
                  label: 'Link somewhere',
                  admin: {
                    condition: (_, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
                link({
                  appearances: false,
                  overrides: {
                    admin: {
                      condition: (_, siblingData) =>
                        Boolean(siblingData?.enabled && siblingData?.hasLink),
                    },
                  },
                }),
              ],
            },
          ],
        },
        {
          label: 'Analytics',
          fields: [
            {
              name: 'gaMeasurementId',
              type: 'text',
              label: 'Google Analytics measurement ID',
              admin: {
                description: 'Starts with "G-". Leave blank to turn tracking off.',
              },
              validate: (value: null | string | undefined) =>
                !value || /^G-[A-Z0-9]+$/.test(value) || 'Should look like G-ABC123XYZ',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}
