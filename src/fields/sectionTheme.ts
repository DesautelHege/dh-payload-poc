import type { Field } from 'payload'

export type SectionTheme = 'dark' | 'light' | 'lavender'

// Editors pick a background from the brand palette instead of setting colors by hand
export const sectionTheme = (defaultValue: SectionTheme = 'dark'): Field => ({
  name: 'theme',
  type: 'select',
  defaultValue,
  options: [
    { label: 'Black', value: 'dark' },
    { label: 'White', value: 'light' },
    { label: 'Lavender', value: 'lavender' },
  ],
  admin: {
    description: 'Section background',
  },
})
