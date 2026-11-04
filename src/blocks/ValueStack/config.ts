import type { Block } from 'payload'

import { sectionTheme } from '../../fields/sectionTheme'

export const ValueStack: Block = {
  slug: 'valueStack',
  interfaceName: 'ValueStackBlock',
  labels: {
    plural: 'Value stacks',
    singular: 'Value stack',
  },
  admin: {
    group: 'DH',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: {
        components: {
          RowLabel: '@/blocks/ValueStack/RowLabel#RowLabel',
        },
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'body',
          type: 'textarea',
        },
      ],
    },
    sectionTheme('light'),
  ],
}
