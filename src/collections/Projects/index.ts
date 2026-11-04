import type { CollectionConfig, Field } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidateProject } from './hooks/revalidateProject'
import { practiceAreaOptions } from './practiceAreas'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

// Case-study sections are deliberately simple: paragraphs, bold/italic and links only.
// Layout is owned by the template, so every project reads consistently.
const storySection = (name: string, description: string): Field => ({
  name,
  type: 'richText',
  admin: { description },
  editor: lexicalEditor({
    features: ({ rootFeatures }) => [
      ...rootFeatures,
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ],
  }),
})

export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This is what showcase blocks receive when they reference a project
  defaultPopulate: {
    title: true,
    slug: true,
    client: true,
    teaser: true,
    teaserMedia: true,
    logo: true,
    heroImage: true,
    practiceAreas: true,
  },
  admin: {
    group: 'Content',
    defaultColumns: ['title', 'client', 'practiceAreas', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'projects',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'projects',
        req,
      }),
    useAsTitle: 'title',
  },
  labels: {
    plural: 'Projects',
    singular: 'Project',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'client',
      type: 'text',
      admin: {
        description: 'Shown under the title as "For …"',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'industries',
                  type: 'text',
                  hasMany: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'services',
                  type: 'text',
                  hasMany: true,
                  label: 'What we did',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'headline',
              type: 'text',
              admin: {
                description:
                  'The one-line summary above the story, e.g. "Meeting youth at high risk where they already are."',
              },
            },
          ],
        },
        {
          label: 'Story',
          fields: [
            storySection('challenge', 'What problem were we solving?'),
            storySection('insight', 'What did we learn that shaped the approach?'),
            storySection('solution', 'What did we make and do?'),
            storySection('results', 'What changed? Lead with numbers, close with a human story.'),
          ],
        },
        {
          label: 'Gallery',
          fields: [
            {
              name: 'gallery',
              type: 'array',
              admin: {
                initCollapsed: true,
                description: 'Images and videos shown after the story. Drag to reorder.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'type',
                      type: 'radio',
                      defaultValue: 'image',
                      options: [
                        { label: 'Image', value: 'image' },
                        { label: 'Video', value: 'video' },
                      ],
                      admin: { layout: 'horizontal', width: '50%' },
                    },
                    {
                      name: 'width',
                      type: 'select',
                      defaultValue: 'half',
                      options: [
                        { label: 'Half width', value: 'half' },
                        { label: 'Full width', value: 'full' },
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
                    condition: (_, siblingData) => siblingData?.type !== 'video',
                  },
                },
                {
                  name: 'videoUrl',
                  type: 'text',
                  label: 'Vimeo or YouTube URL',
                  required: true,
                  admin: {
                    condition: (_, siblingData) => siblingData?.type === 'video',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Listing card',
          description: 'How this project appears in showcases on the homepage and work page.',
          fields: [
            {
              name: 'teaser',
              type: 'textarea',
              admin: {
                description: 'One or two sentences for cards.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'teaserMedia',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    width: '50%',
                    description: 'Card image or animated GIF. Falls back to the hero image.',
                  },
                },
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    width: '50%',
                    description: 'Client or campaign logo for spotlight layouts.',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'practiceAreas',
      type: 'select',
      hasMany: true,
      options: practiceAreaOptions,
      admin: {
        position: 'sidebar',
        description: 'Drives the work page filters.',
      },
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Closing call to action',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Ready to turn insight into impact?',
        },
        {
          name: 'label',
          type: 'text',
          defaultValue: 'Let’s do it together',
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateProject],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
