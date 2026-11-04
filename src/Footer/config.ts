import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    // Moved to Site settings. Kept (hidden) so existing data and the schema stay intact
    {
      name: 'tagline',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'locations',
      type: 'array',
      admin: { hidden: true },
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
      name: 'email',
      type: 'email',
      admin: { hidden: true },
    },
    {
      name: 'social',
      type: 'array',
      admin: { hidden: true },
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
  hooks: {
    afterChange: [revalidateFooter],
  },
}
