import type { Block, TextFieldSingleValidation } from 'payload'

import { getYouTubeID } from './getYouTubeID'

// Embeds a YouTube video inside rich text. Editors paste any YouTube link
// (watch, youtu.be, shorts, live, or embed form) and the frontend renders a
// responsive 16:9 player. See ./Component.tsx for the renderer.
export const YouTube: Block = {
  slug: 'youtube',
  interfaceName: 'YouTubeBlock',
  labels: {
    singular: 'YouTube',
    plural: 'YouTube Videos',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'YouTube URL',
      admin: {
        description: 'Paste a YouTube link, e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      validate: ((value) => {
        if (!value) return 'A YouTube URL is required'
        return getYouTubeID(value) ? true : 'Could not find a YouTube video ID in that link'
      }) as TextFieldSingleValidation,
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
    },
  ],
}
