import type { Block } from 'payload'

import { practiceAreaOptions } from '../../collections/Projects/practiceAreas'
import { sectionTheme } from '../../fields/sectionTheme'

export const ProjectShowcase: Block = {
  slug: 'projectShowcase',
  interfaceName: 'ProjectShowcaseBlock',
  labels: {
    plural: 'Project showcases',
    singular: 'Project showcase',
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
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Spotlight (large, alternating)', value: 'spotlight' },
        { label: 'Grid', value: 'grid' },
      ],
    },
    {
      name: 'populateBy',
      type: 'radio',
      defaultValue: 'selection',
      options: [
        { label: 'Hand-pick projects', value: 'selection' },
        { label: 'Latest projects', value: 'latest' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.populateBy !== 'latest',
        description: 'Drag to reorder. Cards pull their title, image and teaser from each project.',
      },
    },
    {
      type: 'row',
      admin: {
        condition: (_, siblingData) => siblingData?.populateBy === 'latest',
      },
      fields: [
        {
          name: 'practiceArea',
          type: 'select',
          options: practiceAreaOptions,
          admin: { width: '50%', description: 'Optional filter' },
        },
        {
          name: 'limit',
          type: 'number',
          defaultValue: 6,
          admin: { width: '50%', step: 1 },
        },
      ],
    },
    {
      name: 'showFilterLinks',
      type: 'checkbox',
      label: 'Show "View more work samples" links',
      defaultValue: false,
    },
    sectionTheme('dark'),
  ],
}
