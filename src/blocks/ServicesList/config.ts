import type { Block } from 'payload'

import { sectionTheme } from '../../fields/sectionTheme'

export const ServicesList: Block = {
  slug: 'servicesList',
  interfaceName: 'ServicesListBlock',
  labels: {
    plural: 'Services lists',
    singular: 'Services list',
  },
  admin: {
    group: 'DH',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'groups',
      type: 'array',
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/blocks/ServicesList/RowLabel#RowLabel',
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'services',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'Type a service and press Enter to add it.',
          },
        },
      ],
    },
    sectionTheme('dark'),
  ],
}
