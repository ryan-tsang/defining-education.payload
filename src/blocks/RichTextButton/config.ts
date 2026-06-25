import type { Block } from 'payload'

import { link } from '../../fields/link'

// A call-to-action button usable inside rich text. The link field already
// provides the 2 styles (appearance: default = solid pill, outline = outlined).
export const ButtonBlock: Block = {
  slug: 'button',
  interfaceName: 'ButtonBlock',
  labels: {
    singular: 'Button',
    plural: 'Buttons',
  },
  fields: [link({ appearances: ['default', 'outline'] })],
}
