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
      name: 'showAll',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show all published tutors',
      admin: {
        description:
          'On: list every published tutor (newest first). Off: show only the tutors you pick below.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      min: 1,
      max: 60,
      admin: {
        description: 'Optional cap when showing all tutors.',
        condition: (_, siblingData) => Boolean(siblingData?.showAll),
      },
    },
    {
      name: 'tutors',
      type: 'relationship',
      relationTo: 'tutors',
      hasMany: true,
      admin: {
        description: 'Tutors to feature, in order.',
        condition: (_, siblingData) => !siblingData?.showAll,
      },
    },
  ],
  labels: {
    plural: 'Tutor Showcases',
    singular: 'Tutor Showcase',
  },
}
