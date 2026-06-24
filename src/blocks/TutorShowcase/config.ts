import type { Block } from 'payload'

export const TutorShowcase: Block = {
  slug: 'tutorShowcase',
  interfaceName: 'TutorShowcaseBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Section heading, e.g. 本校名師',
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
      name: 'tutors',
      type: 'array',
      minRows: 1,
      labels: {
        plural: 'Tutors',
        singular: 'Tutor',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'subject',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  labels: {
    plural: 'Tutor Showcases',
    singular: 'Tutor Showcase',
  },
}
