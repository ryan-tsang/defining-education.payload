import type { Block } from 'payload'

export const FeatureGrid: Block = {
  slug: 'featureGrid',
  interfaceName: 'FeatureGridBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Section heading, e.g. 為何選擇凝皓教育',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      admin: {
        description: 'Optional short paragraph shown under the heading.',
      },
    },
    {
      name: 'columns',
      type: 'number',
      defaultValue: 3,
      min: 2,
      max: 4,
      admin: {
        description: 'How many cards per row on desktop (2–4).',
      },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Feature', plural: 'Features' },
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'icon',
          type: 'text',
          admin: {
            description: 'Optional emoji or short label shown above the title, e.g. 🎓 or 01.',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
  ],
  labels: {
    plural: 'Feature Grids',
    singular: 'Feature Grid',
  },
}
