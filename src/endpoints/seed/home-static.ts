import type { RequiredDataFromCollectionSlug } from 'payload'

// Used for pre-seeded content so that the homepage is not empty
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  meta: {
    description: '凝皓教育（Defining Education）— DSE 各科名師補習課程，港九新界多區分校及網上平台。',
    title: '凝皓教育 Defining Education',
  },
  title: 'Home',
  layout: [],
}
