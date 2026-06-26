import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Tutor } from '../../../payload-types'

export const revalidateTutor: CollectionAfterChangeHook<Tutor> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/tutors/${doc.slug}`
      payload.logger.info(`Revalidating tutor at path: ${path}`)
      revalidatePath(path)
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/tutors/${previousDoc.slug}`
      payload.logger.info(`Revalidating old tutor at path: ${oldPath}`)
      revalidatePath(oldPath)
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Tutor> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/tutors/${doc?.slug}`)
  }
  return doc
}
