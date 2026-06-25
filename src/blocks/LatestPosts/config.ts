import type { Block } from 'payload'

import { link } from '../../fields/link'

export const LatestPosts: Block = {
  slug: 'latestPosts',
  interfaceName: 'LatestPostsBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Section heading, e.g. 最新推廣及情報',
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
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 12,
      admin: {
        description: 'How many of the most recent posts to show.',
      },
    },
    link({
      appearances: false,
      overrides: {
        admin: {
          description: 'Optional "view more" link shown below the posts, e.g. 查看更多 → /news',
        },
      },
    }),
  ],
  labels: {
    plural: 'Latest Posts',
    singular: 'Latest Posts',
  },
}
