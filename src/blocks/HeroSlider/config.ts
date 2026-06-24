import type { Block } from 'payload'

import { link } from '../../fields/link'

export const HeroSlider: Block = {
  slug: 'heroSlider',
  interfaceName: 'HeroSliderBlock',
  fields: [
    {
      name: 'slides',
      type: 'array',
      minRows: 1,
      labels: {
        plural: 'Slides',
        singular: 'Slide',
      },
      admin: {
        initCollapsed: true,
        description: 'Full-width banner slides. The first slide shows on load.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'eyebrow',
          type: 'text',
          admin: {
            description: 'Optional small label shown above the heading, e.g. 2026 – 2027 學年',
          },
        },
        {
          name: 'heading',
          type: 'text',
          admin: {
            description: 'Optional overlay heading. Leave empty for a pure-image banner.',
          },
        },
        {
          name: 'subheading',
          type: 'textarea',
          admin: {
            description: 'Optional supporting line shown under the heading.',
          },
        },
        {
          name: 'ctaLabel',
          type: 'text',
          admin: {
            description: 'Optional button text, e.g. 立即報名. The whole slide is clickable regardless.',
          },
        },
        link({
          disableLabel: true,
          appearances: ['default', 'outline'],
          overrides: {
            admin: {
              description: 'Where the slide links to when clicked.',
            },
          },
        }),
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'autoplay',
          type: 'checkbox',
          defaultValue: true,
          admin: { width: '50%' },
          label: 'Auto-advance slides',
        },
        {
          name: 'interval',
          type: 'number',
          defaultValue: 6,
          min: 2,
          max: 30,
          admin: {
            width: '50%',
            description: 'Seconds between slides when auto-advance is on.',
            condition: (_, siblingData) => Boolean(siblingData?.autoplay),
          },
        },
      ],
    },
  ],
  labels: {
    plural: 'Hero Sliders',
    singular: 'Hero Slider',
  },
}
