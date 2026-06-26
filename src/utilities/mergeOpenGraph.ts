import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: '凝皓教育（Defining Education）— DSE 各科名師補習課程，港九新界多區分校及網上平台。',
  images: [
    {
      url: `${getServerSideURL()}/de-logo.png`,
    },
  ],
  siteName: '凝皓教育 Defining Education',
  title: '凝皓教育 Defining Education',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
