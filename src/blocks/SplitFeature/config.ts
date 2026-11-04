import type { Block } from 'payload'

import { linkGroup } from '../../fields/linkGroup'
import { sectionTheme } from '../../fields/sectionTheme'

export const SplitFeature: Block = {
  slug: 'splitFeature',
  interfaceName: 'SplitFeatureBlock',
  labels: {
    plural: 'Split features',
    singular: 'Split feature',
  },
  admin: {
    // Shown in the block picker so editors know when to reach for it
    group: 'DH',
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
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 1,
      },
    }),
    {
      type: 'row',
      fields: [
        {
          name: 'mediaType',
          type: 'radio',
          defaultValue: 'image',
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Video', value: 'video' },
          ],
          admin: { layout: 'horizontal', width: '50%' },
        },
        {
          name: 'mediaPosition',
          type: 'select',
          defaultValue: 'right',
          options: [
            { label: 'Media on right', value: 'right' },
            { label: 'Media on left', value: 'left' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.mediaType !== 'video',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Vimeo or YouTube URL',
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.mediaType === 'video',
      },
    },
    sectionTheme('dark'),
  ],
}
