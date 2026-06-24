import type { Block } from 'payload'

import { link } from '../../fields/link'

export const SubjectsCta: Block = {
  slug: 'subjectsCta',
  interfaceName: 'SubjectsCtaBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Section heading, e.g. 報讀課程',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional short paragraph shown under the heading.',
      },
    },
    {
      name: 'subjects',
      type: 'array',
      minRows: 1,
      labels: {
        plural: 'Subjects',
        singular: 'Subject',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        // Each subject is a labelled link to its course page. Appearance is
        // fixed by the block's tile styling, so the picker is hidden.
        link({ appearances: false }),
      ],
    },
  ],
  labels: {
    plural: 'Subjects CTAs',
    singular: 'Subjects CTA',
  },
}
