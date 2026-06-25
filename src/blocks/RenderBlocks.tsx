import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { HeroBannerBlock } from '@/blocks/HeroBanner/Component'
import { HeroSliderBlock } from '@/blocks/HeroSlider/Component'
import { LatestPostsBlock } from '@/blocks/LatestPosts/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { SubjectsCtaBlock } from '@/blocks/SubjectsCta/Component'
import { TutorShowcaseBlock } from '@/blocks/TutorShowcase/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  heroBanner: HeroBannerBlock,
  heroSlider: HeroSliderBlock,
  latestPosts: LatestPostsBlock,
  mediaBlock: MediaBlock,
  subjectsCta: SubjectsCtaBlock,
  tutorShowcase: TutorShowcaseBlock,
}

// Full-width brand sections span edge-to-edge and own their vertical spacing,
// so they skip the default `my-16` rhythm to sit flush against their neighbours.
const fullBleedBlocks = new Set<keyof typeof blockComponents>([
  'heroBanner',
  'heroSlider',
  'latestPosts',
  'subjectsCta',
])

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className={fullBleedBlocks.has(blockType) ? undefined : 'my-16'} key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
