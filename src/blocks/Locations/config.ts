import type { Block } from 'payload'

export const Locations: Block = {
  slug: 'locations',
  interfaceName: 'LocationsBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Section heading, e.g. 學校位置及開放時間',
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
      name: 'branches',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Branch', plural: 'Branches' },
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'Branch name, e.g. 太子分校' },
        },
        {
          name: 'address',
          type: 'textarea',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'phone',
              type: 'text',
              admin: { width: '50%' },
            },
            {
              name: 'hours',
              type: 'text',
              admin: {
                width: '50%',
                description: 'Opening hours, e.g. 星期一至日 10:00 – 21:00',
              },
            },
          ],
        },
        {
          name: 'mapUrl',
          type: 'text',
          admin: {
            description: 'Optional Google Maps link. Shows a "查看地圖" button when set.',
          },
        },
      ],
    },
  ],
  labels: {
    plural: 'Locations',
    singular: 'Locations',
  },
}
