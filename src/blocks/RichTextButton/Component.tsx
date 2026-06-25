import React from 'react'

import type { ButtonBlock as ButtonBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

// Solid (default) renders as a filled purple pill; outline as a pill outline.
export const ButtonBlock: React.FC<ButtonBlockProps & { className?: string }> = ({
  className,
  link,
}) => {
  if (!link?.label) return null

  const outline = link.appearance === 'outline'

  return (
    <div className={cn('not-prose my-6 flex', className)}>
      <CMSLink
        {...link}
        appearance="inline"
        className={cn(
          'inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-bold no-underline shadow-sm transition-colors hover:no-underline md:text-lg',
          outline
            ? 'border-2 border-[#4f46e5] bg-transparent text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white'
            : 'bg-[#4f46e5] text-white hover:bg-[#4338ca]',
        )}
      />
    </div>
  )
}
