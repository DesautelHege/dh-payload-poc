import type { Block } from 'payload'

import { sectionTheme } from '../../fields/sectionTheme'

export const TeamGrid: Block = {
  slug: 'teamGrid',
  interfaceName: 'TeamGridBlock',
  labels: {
    plural: 'Team grids',
    singular: 'Team grid',
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
      name: 'showFilters',
      type: 'checkbox',
      label: 'Show department filters',
      defaultValue: true,
      admin: {
        description: 'Everyone in the Team collection is listed automatically, A to Z.',
      },
    },
    sectionTheme('dark'),
  ],
}
