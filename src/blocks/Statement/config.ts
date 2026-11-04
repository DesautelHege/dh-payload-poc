import type { Block } from 'payload'

import { linkGroup } from '../../fields/linkGroup'
import { sectionTheme } from '../../fields/sectionTheme'

export const Statement: Block = {
  slug: 'statement',
  interfaceName: 'StatementBlock',
  labels: {
    plural: 'Statements',
    singular: 'Statement',
  },
  admin: {
    group: 'DH',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'secondaryHeadline',
      type: 'text',
      admin: {
        description: 'Optional second line, shown in the accent color.',
      },
    },
    {
      name: 'body',
      type: 'textarea',
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
      },
    }),
    sectionTheme('lavender'),
  ],
}
